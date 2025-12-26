(async function () {
  function loadScript(scriptToLoad) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.setAttribute("defer", "");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", scriptToLoad);

      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  for (component of overlayConfig.componentsToLoad) {
    await loadScript(`conf/components/${component}`);
  }

  await loadScript("js/overlay-bundle.js");
})();
