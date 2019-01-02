(async function() {
  TestRunner.addResult(`Tests that User-Agent override works for requests from Service Workers.\n`);
  await TestRunner.loadModule('application_test_runner');
  await ApplicationTestRunner.resetState();
  await TestRunner.showPanel('resources');
  // TODO delet this if it doesnt do anything
  await TestRunner.loadModule('network_test_runner');
  await TestRunner.showPanel('network');

  function waitForTarget() {
    const targetAddedObj = {};
    targetAddedObj.resolve = null;
    targetAddedObj.promise = new Promise(resolve => targetAddedObj.resolve = resolve);
    targetAddedObj.sniffer = {
      targetAdded: target => {
        if (target.type() === SDK.Target.Type.ServiceWorker) {
          TestRunner.addResult('targetAdded, type: ' + target.type() + ', inspectedURL: ' + target.inspectedURL() + ', name: ' + target.name());
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
        if (target.type() === SDK.Target.Type.Worker
              || target.type() === SDK.Target.Type.ServiceWorker) {
          TestRunner.addResult('targetRemoved, type: ' + target.type() + ', inspectedURL: ' + target.inspectedURL() + ', name: ' + target.name());
          targetRemovedObj.resolve();
          SDK.targetManager.unobserveTargets(targetRemovedObj.sniffer);
        }
      }
    };

    SDK.targetManager.observeTargets(targetAddedObj.sniffer);
    SDK.targetManager.observeTargets(targetRemovedObj.sniffer);

    return {targetAdded: targetAddedObj.promise, targetRemoved: targetRemovedObj.promise};

    /*return new Promise(function(resolve) {
      var sniffer = {
        targetAdded: function(target) {
          if (target.type() === SDK.Target.Type.ServiceWorker) {
            resolve();
            SDK.targetManager.unobserveTargets(sniffer);
          }
        },
        targetRemoved: function(e) {}
      };
      SDK.targetManager.observeTargets(sniffer);
    });*/
  }

  const userAgentString = 'Mozilla/5.0 (Overridden User Agent)';
  const testPage = 'http://localhost:8000/inspector-protocol/service-worker/resources/sw-return-useragent.php';

  //TestRunner.addResult('initial user-agent: ' + await TestRunner.evaluateInPagePromise('document.body.innerText'));

  SDK.multitargetNetworkManager.setUserAgentOverride(userAgentString);
  TestRunner.addResult('set user agent override');

  await TestRunner.navigatePromise('http://localhost:8000');
  TestRunner.addResult('navigated to http://localhost:8000');

  //const waitForTargetPromise = waitForTarget();
  const {targetAdded, targetRemoved} = waitForTarget();
  await TestRunner.navigatePromise(testPage);
  TestRunner.addResult('navigated to ' + testPage);
  TestRunner.addResult('user-agent: ' + await TestRunner.evaluateInPagePromise('document.body.innerText'));
  TestRunner.addResult('SDK.multitargetNetworkManager.userAgentOverride(): ' + SDK.multitargetNetworkManager.userAgentOverride());
  //await waitForTargetPromise;
  await targetAdded;
  TestRunner.addResult('awaited service worker');

  await TestRunner.navigatePromise(testPage);
  TestRunner.addResult('navigated to ' + testPage + ' again');

  await ApplicationTestRunner.resetState();
  TestRunner.addResult('ApplicationTestRunner.resetState()');
  TestRunner.addResult('');

  //const navigateAwayPage = 'http://localhost:8000';
  const navigateAwayPage = 'http://127.0.0.1:8000';
  await TestRunner.navigatePromise(navigateAwayPage);
  await TestRunner.navigatePromise(navigateAwayPage);
  await TestRunner.navigatePromise(navigateAwayPage);
  await TestRunner.navigatePromise(navigateAwayPage);
  await TestRunner.navigatePromise(navigateAwayPage);
  TestRunner.addResult('navigated to ' + navigateAwayPage);
  TestRunner.addResult('SDK.multitargetNetworkManager.userAgentOverride(): ' + SDK.multitargetNetworkManager.userAgentOverride());
  TestRunner.addResult('');
  await targetRemoved;

  await TestRunner.navigatePromise(testPage);
  TestRunner.addResult('navigated to ' + testPage);
  TestRunner.addResult('user-agent: ' + await TestRunner.evaluateInPagePromise('document.body.innerText'));
  TestRunner.addResult('SDK.multitargetNetworkManager.userAgentOverride(): ' + SDK.multitargetNetworkManager.userAgentOverride());

  TestRunner.completeTest();
})();
