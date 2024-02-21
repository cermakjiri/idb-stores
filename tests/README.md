# Tests

TLDR: This is temp. workaround for simple smoke test until [vitest](https://vitest.dev/guide/)' [browser mode](https://vitest.dev/guide/browser.html) is out of experimental phase.

In order to test functionality of this package, real IndexedDB API is required. Of course, we could mock it and run it within Node but that will be pointless, the mocking would cut off most of the logic.
Therefore, we looking for some test SDK that can execute tests within real browser enviroment. And there's actually perfect matched, quite newly developed called `vitest`. One of its feature is so called _browser mode_ that execute tests within real browser enviroment. However, I tried it twice once with some 1.2.x version and now with the 1.3.x version but in both cases, I got errors and couldn't make it work. Therefore, I wrote a little workaround just to run a simple smoke test. It works as follow:

- The tests with the package are built with `vite` and the result being served on `http://localhost:3030`.
- There's `eveluateTest` method that just runs provided from argument and then changes window location based on the test result.
- Then the page is visited with `puppeteer` in headless mode. It waits for navigation on specific routes which signals the result of given test (e.g. `/success` and `failure?error=...`).
- That's it.
