(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var installationId = script.getAttribute("data-conversa-installation");
  if (!installationId) {
    console.warn("ConversaAI: missing data-conversa-installation.");
    return;
  }

  var apiBase = script.getAttribute("data-conversa-api") || script.src.replace(/\/widget\.js(?:\?.*)?$/, "");
  var configUrl = apiBase.replace(/\/$/, "") + "/api/widget/config?installation_id=" + encodeURIComponent(installationId);

  fetch(configUrl, {
    method: "GET"
  })
    .then(function (response) {
      if (!response.ok) throw new Error("configuration unavailable");
      return response.json();
    })
    .then(function (rows) {
      var config = Array.isArray(rows) ? rows[0] : rows;
      if (!config || config.is_active !== true || config.status !== "active") {
        throw new Error("installation inactive");
      }

      window.ConversaAI = window.ConversaAI || {};
      window.ConversaAI.installation = config;
      window.dispatchEvent(new CustomEvent("conversaai:ready", { detail: config }));
    })
    .catch(function () {
      // Do not expose backend details to visitors. A future chat runtime can
      // render its own non-blocking unavailable state from this event.
      window.dispatchEvent(new CustomEvent("conversaai:error"));
    });
})();