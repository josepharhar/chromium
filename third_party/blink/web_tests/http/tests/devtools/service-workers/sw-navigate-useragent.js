(async function() {
  TestRunner.addResult(`Tests that User-Agent override works for requests from Service Workers.\n`);
  await TestRunner.loadModule('application_test_runner');
  await ApplicationTestRunner.resetState();
  await TestRunner.showPanel('resources');

  function waitForTarget(targetPredicate) {
    const targetAddedObj = {};
    targetAddedObj.resolve = null;
    targetAddedObj.promise = new Promise(resolve => targetAddedObj.resolve = resolve);
    targetAddedObj.sniffer = {
      targetAdded: target => {
        if (target.type() === SDK.Target.Type.ServiceWorker) {
          targetAddedObj.resolve();
          SDK.targetManager.unobserveTargets(targetAddedObj.sniffer);
        }
      },
      targetRemoved: target => {}
    };

    const targetRemovedObj = {};
    targetRemovedObj.resolve = null;
    targetRemovedObj.promise = new Promise(resolve => targetRemovedObj.resolve = resolve);
    targetRemovedObj.sniffer = {
      targetAdded: target => {},
      targetRemoved: target => {
        if (target.type() === SDK.Target.Type.ServiceWorker) {
          targetRemovedObj.resolve();
          SDK.targetManager.unobserveTargets(targetRemovedObj.sniffer);
        }
      }
    };

    SDK.targetManager.observeTargets(targetAddedObj.sniffer);
    SDK.targetManager.observeTargets(targetRemovedObj.sniffer);

    return {targetAdded: targetAddedObj.promise, targetRemoved: targetRemovedObj.promise};
  }

  const testPage = 'http://localhost:8000/devtools/service-workers/resources/sw-return-useragent.php';
  SDK.multitargetNetworkManager.setUserAgentOverride('Mozilla/5.0 (Overridden User Agent)');
  const {targetAdded, targetRemoved} = waitForTarget();

  await TestRunner.navigatePromise(testPage);
  TestRunner.addResult('navigated to ' + testPage);
  TestRunner.addResult('user-agent: ' + await TestRunner.evaluateInPagePromise('document.body.innerText'));
  await targetAdded;
  TestRunner.addResult('awaited service worker target created');

  const navigateAwayPage = 'http://127.0.0.1:8000';
  await TestRunner.navigatePromise(navigateAwayPage);
  TestRunner.addResult('navigated to ' + navigateAwayPage);
  TestRunner.addResult('');

  const registrations = TestRunner.serviceWorkerManager.registrations();
  for (const registrationId of registrations.keys()) {
    const registration = registrations.get(registrationId);
    for (const serviceWorkerVersion of registration.versions.values()) {
      const versionId = serviceWorkerVersion.id;
      TestRunner.serviceWorkerManager.stopWorker(versionId);
    }
  }
  await targetRemoved;
  TestRunner.addResult('Stopped worker and awaited target removal');

  await TestRunner.navigatePromise(testPage);
  TestRunner.addResult('navigated to ' + testPage);
  TestRunner.addResult('user-agent: ' + await TestRunner.evaluateInPagePromise('document.body.innerText'));

  TestRunner.completeTest();
})();
