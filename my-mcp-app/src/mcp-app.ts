import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({
  name: "MCP Dashboard",
  version: "1.0.0",
});

/* ---------------- SAFE DOM HELPER ---------------- */

const el = (id: string): HTMLElement | null =>
  document.getElementById(id);

/* ---------------- ELEMENTS ---------------- */

const serverTimeEl = el("server-time");
const serverDateEl = el("server-date");
const helloEl = el("hello-message");
const randomEl = el("random-number");
const reverseEl = el("reversed-text");
const wordCountEl = el("word-count");
const incidentEl = el("incident");

/* ---------------- INIT ---------------- */

async function init() {
  await app.connect();

  app.ontoolresult = (result) => {
    const tool = result?.toolName;
    const data: any = result?.structuredContent || {};

    if (!tool) return;

    switch (tool) {
      case "get-time":
        if (serverTimeEl) serverTimeEl.textContent = String(data.value ?? "");
        break;

      case "get-date":
        if (serverDateEl) serverDateEl.textContent = String(data.value ?? "");
        break;

      case "say-hello":
        if (helloEl) helloEl.textContent = String(data.message ?? "");
        break;

      case "get-random-number":
        if (randomEl) randomEl.textContent = String(data.value ?? "");
        break;

      case "reverse-text":
        if (reverseEl) reverseEl.textContent = String(data.value ?? "");
        break;

      case "word-count":
        if (wordCountEl) wordCountEl.textContent = String(data.value ?? "");
        break;

      case "create_incident":
        if (incidentEl)
          incidentEl.textContent = JSON.stringify(data, null, 2);
        break;
    }
  };
}

init();

/* ---------------- TOOL CALL HELPER ---------------- */

(window as any).runTool = async (name: string, args: any = {}) => {
  try {
    return await app.callServerTool({
      name,
      arguments: args,
    });
  } catch (err) {
    console.error("Tool call failed:", err);
  }
};