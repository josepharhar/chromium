<head>
  <title>sw forward return user agent</title>
<script>
function installsw() {
  navigator.serviceWorker.register('http://localhost:8000/inspector-protocol/service-worker/resources/sw-forward.js');
}
</script>
</head>
<body onload="installsw()">
  <h1><?php echo $_SERVER['HTTP_USER_AGENT'] ?></h1>
</body>
