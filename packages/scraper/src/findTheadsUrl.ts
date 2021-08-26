import * as puppeteer from "puppeteer";
import { login, startBrowser, sleep, saveFile } from "./lib";

import {sourceEntryWithTheads, sourceEntry, sourceNodeWithTheads, sourceNode} from "./types"

export async function main(): Promise<void> {
  const browser = await startBrowser();
  const tab = await login(browser);
  const sourceEntry = await getResourceEntry(tab);
  const theadsEntry = await addTheadsToEachSection(browser, sourceEntry);
  saveFile(theadsEntry, "theadsEntry")


  await browser.close();
}

async function getResourceEntry(
  homePage: puppeteer.Page
): Promise<sourceEntry> {
  const discussionDom = await homePage.$("div.fl.bm:nth-child(2)");

  if (discussionDom === null)
    throw new Error("I can't find discussion section in the page.");
  const resourceEntry = await discussionDom.$$eval(
    "div.bm.bmw.flg.cl",
    function scrapingResourceNodeUrl(sections) {
      return Array.from(sections).map((sec) => {
        const topic = sec.querySelector("h2")?.textContent as string;
        const sourceNodesDom =
          sec.querySelectorAll<HTMLAnchorElement>("td dt > a");
        const sourceNodes = Array.from(sourceNodesDom).map((dom) => ({
          title: dom.textContent || "no title",
          url: dom.href,
        }));

        return { topic, sourceNodes };
      });
    }
  );

  return resourceEntry;
}

async function getTheads(browser: puppeteer.Browser, resourceEntryUrl: string) {
  const tab = await browser.newPage();
  await tab.goto(resourceEntryUrl);
  let currentPage = await getCurrentPage();

  const totalPage = await tab.$$eval("#pgt .pg a", (els) => els.length);
  while (currentPage < totalPage) {
    await Promise.all([
      tab.click("a#autopbn"),
      tab.waitForResponse(isPostLoaded),
    ]);
    currentPage = await getCurrentPage();
  }

  const threads = await tab.$$eval(
    "tbody[id^=normalthread]",
    function scrapingThreadUrl(threadNodes) {
      return Array.from(threadNodes as HTMLTableSectionElement[])
        .filter(
          (node) =>
            !(node.textContent && node.textContent.match(/售價|閱讀權限/g))
        )
        .map(function buildTheadData(node) {
          return {
            title: node.querySelector<HTMLAnchorElement>(".s.xst")?.text,
            url: node.querySelector<HTMLAnchorElement>(".s.xst")?.href,
            author: node.querySelector<HTMLAnchorElement>(".by a")?.text,
            status: node.querySelector("em a")?.textContent || undefined,
          };
        });
    }
  );

  await tab.close();

  return threads;

  async function getCurrentPage() {
    const isSingelPage = await tab
      .$("#fd_page_bottom input[name=custompage]")
      .then((el) => el === null);
    const currentPage = isSingelPage
      ? 1
      : await tab.$eval("#fd_page_bottom input[name=custompage]", (el) =>
          Number((el as HTMLInputElement).value)
        );
    return currentPage;
  }
  function isPostLoaded(res: puppeteer.HTTPResponse) {
    return Boolean(res.url().match(/forumdisplay/g));
  }
}

function addTheadsToEachSection(
  browser: puppeteer.Browser,
  sourceEntry: sourceEntry
): Promise<sourceEntryWithTheads> {
  return Promise.all(
    sourceEntry.map(async function addTheadsToOneSection(section) {
      const sourceNodes = await pairSourceNodesTheads(section.sourceNodes);

      return {
        ...section,
        sourceNodes,
      };
    })
  );

  async function pairSourceNodesTheads(
    sourceNodes: sourceNode[]
  ): Promise<sourceNodeWithTheads[]> {
    const sourceNodesWithTheads = await Promise.all(
      sourceNodes.map(async function addTheads(sourceNode, i) {
        await sleep(i * 2000);
        const theads = await getTheads(browser, sourceNode.url);
        return {
          ...sourceNode,
          theads,
        };
      })
    );
    return sourceNodesWithTheads;
  }
}
