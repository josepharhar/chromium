<!DOCTYPE html>
<html>
<head>
<title>repeat-fetch-service-worker.js with useragent</title>
<script>
function installSW() {
  navigator.serviceWorker.register('repeat-fetch-service-worker.js');
}
</script>
</head>
<body onload="installSW()"></body>
  <p><?php echo $_SERVER['HTTP_USER_AGENT'] ?></p>
</html>
