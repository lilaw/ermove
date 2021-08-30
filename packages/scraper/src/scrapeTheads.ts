import { sleep, login, startBrowser, saveImgSeries } from "./lib";
import * as fs from "fs";
import * as puppeteer from "puppeteer";
import type {
  sourceEntryWithTheads,
  sourceNodeWithTheads,
  thead,
} from "./types";


export async function main(): Promise<void> {
  const browser = await startBrowser();
  await login(browser).then((page) => page.close());

  const theadsEntry = JSON.parse(
    fs.readFileSync("./data/theadsEntry.json").toString()
  ) as sourceEntryWithTheads;

  const completedZone = theadsEntry[0];
  const completedZoneRes = await workOnTopicBlock(browser, completedZone);
  saveFile(completedZoneRes, "mainZone");

  await browser.close();
}

async function workOnTopicBlock(
  browser: puppeteer.Browser,
  topicBlock: sourceEntryWithTheads[0]
) {
  const sourceNodes = await Promise.all(
    topicBlock.sourceNodes.map((data) => workOnSourceNodes(browser, data))
  );

  return {
    ...topicBlock,
    sourceNodes,
  };
}

async function workOnSourceNodes(
  browser: puppeteer.Browser,
  sourceNodes: sourceNodeWithTheads
) {
  const theads = await Promise.all(
    sourceNodes.theads
      .map((data, idx) => completedThead(browser, data, idx))
  );

  return {
    ...sourceNodes,
    theads,
  };

  async function completedThead(
    browser: puppeteer.Browser,
    thead: thead,
    idx: number
  ) {
    if (thead.url === undefined) return thead;
    await sleep(idx * 4000);
    const content = await getTheadContent(browser, thead.url).catch(e => console.log('in url', thead.url, e));

    return {
      ...thead,
      ...content,
    };
  }
}

async function getTheadContent(broswer: puppeteer.Browser, url: string) {
  const page = await broswer.newPage();
  await page
    .goto(url)
    .catch((e) => console.log("while open", url, e));

  const contentHandle = await page.$(".plhin");
  const content = await page.evaluate(scrapeOP, contentHandle);
  await Promise.all(content.imgs.map(saveImgSeries));
  await page.close();
  return content;

  function scrapeOP(el: Element) {
    const main = el.querySelector(".pcb");
    if (main === null) throw new Error("main content not find" + url);
    const originalImgs = Array.from(main.querySelectorAll("img"))
      .map((img) => (img.src || img.getAttribute("file")) as string)
      .filter(Boolean)
      .filter(
        // remove useless url
        (url) =>
          !["rleft.gif", "rright.gif", "none.gif", "base64", "sharepoint"].some(
            (name) => new RegExp(name).test(url)
          )
      );
    const imgs = originalImgs.map(imgUrlTransform);
    const html = main.querySelector("table .t_f")?.innerHTML;
    const releaseDate = el.querySelector("[id^=authorposton]")?.textContent;

    return { html, imgs, releaseDate };

    function imgUrlTransform(url: string) {
      return {
        url,
        filename:
          new RegExp(/\/(?<name>[\w-_]*\.\w{3}$)/g).exec(url)?.groups?.name ||
          `z${url.slice(-3, -1)}${Math.trunc(Math.random() * 1000)}.jpg`,
      };
    }
  }
}

