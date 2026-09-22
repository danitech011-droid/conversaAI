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
  apiBase = apiBase.replace(/\/$/, "");
  var storageKey = "conversaai:" + installationId;
  var configUrl = apiBase + "/api/widget/config?installation_id=" + encodeURIComponent(installationId);
  var chatUrl = apiBase + "/api/widget/chat";
  var state = { config: null, visitorId: null, conversationId: null, messages: [] };

  function createVisitorId() {
    var values = new Uint8Array(18);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(values);
    else for (var index = 0; index < values.length; index += 1) values[index] = Math.floor(Math.random() * 256);
    return "vi_" + Array.prototype.map.call(values, function (value) {
      return value.toString(16).padStart(2, "0");
    }).join("");
  }

  function loadSession() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      if (saved && /^vi_[a-f0-9]{36}$/.test(saved.visitorId)) state.visitorId = saved.visitorId;
      if (saved && typeof saved.conversationId === "string") state.conversationId = saved.conversationId;
    } catch (_) {}
    if (!state.visitorId) state.visitorId = createVisitorId();
  }

  function saveSession() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({
        visitorId: state.visitorId,
        conversationId: state.conversationId
      }));
    } catch (_) {}
  }

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail }));
  }

  function addStyles() {
    var style = document.createElement("style");
    style.textContent = ".conversaai-launcher{position:fixed;right:20px;bottom:20px;z-index:2147483646;border:0;border-radius:999px;padding:12px 18px;background:var(--conversaai-primary,#2563eb);color:#fff;box-shadow:0 8px 24px #0002;font:600 14px system-ui;cursor:pointer}.conversaai-panel{position:fixed;right:20px;bottom:76px;z-index:2147483646;width:min(360px,calc(100vw - 32px));border:1px solid #e2e8f0;border-radius:14px;background:#fff;box-shadow:0 12px 40px #0003;font:14px system-ui;color:#0f172a;overflow:hidden}.conversaai-head{padding:14px 16px;background:var(--conversaai-primary,#2563eb);color:#fff;font-weight:700}.conversaai-log{height:260px;overflow:auto;padding:12px;background:#f8fafc}.conversaai-msg{max-width:85%;margin:0 0 8px;padding:8px 10px;border-radius:10px;line-height:1.4;white-space:pre-wrap}.conversaai-user{margin-left:auto;background:#dbeafe}.conversaai-assistant{background:#fff;border:1px solid #e2e8f0}.conversaai-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e2e8f0}.conversaai-input{min-width:0;flex:1;border:1px solid #cbd5e1;border-radius:8px;padding:9px}.conversaai-send{border:0;border-radius:8px;padding:0 12px;background:var(--conversaai-primary,#2563eb);color:#fff;font-weight:600}.conversaai-send:disabled{opacity:.5}";
    document.head.appendChild(style);
  }

  function render(config) {
    addStyles();
    var root = document.createElement("div");
    root.style.setProperty("--conversaai-primary", config.primary_color || "#2563EB");
    var launcher = document.createElement("button");
    launcher.className = "conversaai-launcher";
    launcher.type = "button";
    launcher.textContent = config.agent_name || "Chat with us";
    var panel = document.createElement("section");
    panel.className = "conversaai-panel";
    panel.hidden = true;
    panel.innerHTML = "<div class=\"conversaai-head\"></div><div class=\"conversaai-log\"></div><form class=\"conversaai-form\"><input class=\"conversaai-input\" maxlength=\"4000\" placeholder=\"Type a message...\"><button class=\"conversaai-send\" type=\"submit\">Send</button></form>";
    root.appendChild(launcher);
    root.appendChild(panel);
    document.body.appendChild(root);
    var head = panel.querySelector(".conversaai-head");
    var log = panel.querySelector(".conversaai-log");
    var form = panel.querySelector(".conversaai-form");
    var input = panel.querySelector(".conversaai-input");
    var send = panel.querySelector(".conversaai-send");
    head.textContent = config.agent_name || "ConversaAI Assistant";

    function append(role, text) {
      var item = document.createElement("div");
      item.className = "conversaai-msg " + (role === "user" ? "conversaai-user" : "conversaai-assistant");
      item.textContent = text;
      log.appendChild(item);
      log.scrollTop = log.scrollHeight;
    }

    append("assistant", config.welcome_message || "Hi! How can we help?");
    launcher.addEventListener("click", function () { panel.hidden = !panel.hidden; if (!panel.hidden) input.focus(); });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var message = input.value.trim();
      if (!message || send.disabled) return;
      append("user", message);
      input.value = "";
      send.disabled = true;
      fetch(chatUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          installation_id: installationId,
          visitor_id: state.visitorId,
          conversation_id: state.conversationId || undefined,
          message: message
        })
      }).then(function (response) {
        return response.json().then(function (body) { return { ok: response.ok, body: body }; });
      }).then(function (result) {
        if (result.body.conversation_id) {
          state.conversationId = result.body.conversation_id;
          saveSession();
        }
        if (result.body.success && result.body.message) append("assistant", result.body.message.content);
        else append("assistant", result.body.message || "This chat is temporarily unavailable.");
        emit("conversaai:message", result.body);
      }).catch(function () {
        append("assistant", "This chat is temporarily unavailable.");
        emit("conversaai:error");
      }).finally(function () { send.disabled = false; input.focus(); });
    });
  }

  loadSession();
  fetch(configUrl, { method: "GET" })
    .then(function (response) {
      if (!response.ok) throw new Error("configuration unavailable");
      return response.json();
    })
    .then(function (config) {
      if (!config || config.is_active !== true || config.status !== "active") throw new Error("installation inactive");
      state.config = config;
      window.ConversaAI = window.ConversaAI || {};
      window.ConversaAI.installation = config;
      render(config);
      emit("conversaai:ready", config);
    })
    .catch(function () { emit("conversaai:error"); });
})();