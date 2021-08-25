import * as puppeteer from "puppeteer";
import { Readable } from "stream";
import * as fs from "fs";

export async function login(
  browser: puppeteer.Browser
): Promise<puppeteer.Page> {
  if (process.env.name === undefined || process.env.password === undefined) {
    throw new Error("username and password is empty");
  }

  const page = await browser.newPage();

  await page.goto("https://rmov2.com/");

  await page.type("input[name=username]", process.env.name);
  await page.type("input[name=password]", process.env.password);
  await Promise.all([
    page.waitForNavigation({ timeout: 10000, waitUntil: "domcontentloaded" }),
    page.click("button[name=loginsubmit]"),
  ]);

  return page;
}

export function startBrowser(): Promise<puppeteer.Browser> {
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
    slowMo: 250,
  });
}
export function sleep(timer: number): Promise<void> {
  return new Promise((res) => setTimeout(res, timer));
}

export function saveFile(text: any, filename: string): void {
  const readable = Readable.from(JSON.stringify(text, null, 2));
  const writeStream = fs.createWriteStream(`./data/${filename}.json`);
  readable.pipe(writeStream);
}
