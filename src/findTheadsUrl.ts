import * as puppeteer from "puppeteer";
// import {Map} from "immutable"
import * as fs from "fs";
import { Readable } from "stream";

type ExtractTypeInPromise<T> = T extends PromiseLike<infer U> ? U : T;
type thead = {
  title: string | undefined;
  url: string | undefined;
  author: string | undefined;
};
interface sourceNode {
  title: string;
  url: string;
}
interface sourceNodeWithTheads extends sourceNode {
  theads: thead[];
}
type sourceEntry = {
  topic: string;
  sourceNodes: sourceNode[];
}[];
type sourceEntryWithTheads = {
  topic: string;
  sourceNodes: sourceNodeWithTheads[];
}[];

async function startBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  return browser;
}

main().catch(console.error);
async function main() {
  const browser = await startBrowser();
  const tab = await openHomePage(browser);
  const sourceEntry = await getResourceEntry(tab);
  const theadsEntry = await addTheadsToEachSection(browser, sourceEntry)

  // await tab.screenshot({ path: "./data/screenshot.png", fullPage: true });
  const readable = Readable.from(JSON.stringify(theadsEntry, null, 2));
  const writeStream = fs.createWriteStream("./data/theadsEntry.json");
  readable.pipe(writeStream);

  await browser.close();
}

async function openHomePage(
  browser: ExtractTypeInPromise<ReturnType<typeof puppeteer.launch>>
) {
  const page = await browser.newPage();

  await page.goto("https://rmov2.com/");
  await page.type("input[name=username]", process.env.name);
  await page.type("input[name=password]", process.env.password);

  await Promise.all([
    page.waitForNavigation({ timeout: 7000, waitUntil: "domcontentloaded" }),
    page.click("button[name=loginsubmit]"),
  ]);

  return page;
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
        .map((node) => ({
          title: node.querySelector<HTMLAnchorElement>(".s.xst")?.text,
          url: node.querySelector<HTMLAnchorElement>(".s.xst")?.href,
          author: node.querySelector<HTMLAnchorElement>(".by a")?.text,
        }));
    }
  );

  await tab.close();

  return threads;

  async function getCurrentPage() {
    let isSingelPage = await tab
      .$("#fd_page_bottom input[name=custompage]")
      .then((el) => el === null);
    let currentPage = isSingelPage
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
        await sleep(i * 2000)
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
function sleep(timer: number) {
  return new Promise(res => setTimeout(res, timer))
}
// function saveImageToDisk(url, filename){
//   fetch(url)
//   .then(res => {
//       const dest = fs.createWriteStream(filename);
//       res.body.pipe(dest)
//   })
//   .catch((err) => {
//       console.log(err)
//   })
// }
