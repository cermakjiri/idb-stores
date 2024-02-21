import puppeteer from "puppeteer";
import { createTestsServer } from "./testsServer.mjs";

(async () => {
  const testsServer = await createTestsServer();

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(testsServer.url);

  // Wait until evaluateTest function changes the page location, either to /success or /failure
  const res = await page.waitForNavigation();

  const url = new URL(res.url());

  switch (url.pathname) {
    case "/success":
      console.log("Success");
      break;

    case "/failure":
      console.error(new Error(url.searchParams.get("error")));
      break;

    default:
      console.error(new Error("Unknown page"));
  }

  await testsServer.close();

  await browser.close();
})();
