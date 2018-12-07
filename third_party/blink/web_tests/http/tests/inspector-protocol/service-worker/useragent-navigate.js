(async function(testRunner) {
  const emptyPageUrl = 'http://127.0.0.1:8000/inspector-protocol/service-worker/resources/return-user-agent.php';
  const swPageUrl = 'http://localhost:8000/inspector-protocol/service-worker/resources/sw-forward-return-user-agent.php';

  const {page, session, dp} = await testRunner.startURL(
      emptyPageUrl,
      'Verifies that user agent override works when navigating to a page with a service worker');

  await dp.Runtime.enable();
  await dp.Page.enable();
  await dp.DOM.enable();
  await dp.ServiceWorker.enable();
  await dp.Network.enable();

  await dumpdom();
  testRunner.log('navigating to sw page and waiting for sw');
  await session.navigate(swPageUrl);

  // Await service worker initialization
  let versions;
  do {
    const result = await dp.ServiceWorker.onceWorkerVersionUpdated();
    versions = result.params.versions;
  } while (!versions.length || versions[0].status !== 'activated');
  await versions[0].registrationId;

  async function dumpdom() {
    const evaluateResponse = await dp.Runtime.evaluate({
      expression: 'document.body.innerText'
    });
    //testRunner.log('evaluateResponse: ' + JSON.stringify(evaluateResponse, null, 2));
    testRunner.log('document.body.innerText: ' + evaluateResponse.result.result.value);
  }

  await dumpdom();

  testRunner.log('setting user agent');
  await dp.Network.setUserAgentOverride({
    userAgent: 'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Mobile Safari/537.36'
  });

  testRunner.log('navigating back to same url');
  await session.navigate(swPageUrl);
  await dumpdom();

  testRunner.log('dp.Page.navigate() to empty page');
  await session.navigate(emptyPageUrl);
  await dumpdom();

  testRunner.log('dp.Page.navigate() to sw page');
  await session.navigate(swPageUrl);
  await dumpdom();

  testRunner.completeTest();
});
