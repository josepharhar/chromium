(async function(testRunner) {
  const pageUrl = 'http://localhost:8000/inspector-protocol/service-worker/resources/sw-return-useragent.php';

  const {page, session, dp} = await testRunner.startURL(
      pageUrl,
      'Verifies that user agent override works when navigating to a page with a registered service worker.');


  async function getRegistrationIdPromise() {
    let versions;
    do {
      const result = await dp.ServiceWorker.onceWorkerVersionUpdated();
      versions = result.params.versions;
    } while (!versions.length || versions[0].status !== 'activated');
    //await versions[0].registrationId;
    return versions[0].registrationId;
  }

  const registrationIdPromise = getRegistrationIdPromise();
  await dp.Runtime.enable();
  await dp.ServiceWorker.enable();
  await registrationIdPromise;

  testRunner.log('initial user-agent: ');
  testRunner.log(await session.evaluate('document.body.innerText'));
  testRunner.log('');

  await dp.Network.enable();
  await dp.Network.setUserAgentOverride({userAgent:
    'Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'});

  await dp.Page.reload();
  await page.navigate(pageUrl);

  testRunner.log('user-agent after setUserAgentOverride:');
  testRunner.log(await session.evaluate('document.body.innerText'));
  testRunner.log('');

  await page.navigate('http://127.0.0.1:8000');
  await page.navigate(pageUrl);
  testRunner.log('user-agent after navigation away and back:');
  testRunner.log(await session.evaluate('document.body.innerText'));
  testRunner.log('');

  testRunner.completeTest();
});
