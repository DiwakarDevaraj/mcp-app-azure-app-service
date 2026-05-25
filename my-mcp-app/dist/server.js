import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppTool, registerAppResource, } from "@modelcontextprotocol/ext-apps/server";
import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
console.log("🚀 Starting MCP Server...");
/* ---------------- MCP SERVER ---------------- */
const server = new McpServer({
    name: "MCP Dashboard Server",
    version: "1.0.0",
});
/* ---------------- RESOURCE ---------------- */
const resourceUri = "ui://mcp-app.html";
/* ---------------- SAFE RESPONSE HELPER ---------------- */
const response = (data) => ({
    content: [
        {
            type: "text",
            text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        },
    ],
    structuredContent: data,
});
/* ---------------- TOOLS ---------------- */
registerAppTool(server, "get-time", {
    title: "Get Time",
    description: "Returns server time",
    inputSchema: {},
    _meta: { ui: { resourceUri } },
}, async () => response({ value: new Date().toISOString() }));
registerAppTool(server, "get-date", {
    title: "Get Date",
    description: "Returns server date",
    inputSchema: {},
    _meta: { ui: { resourceUri } },
}, async () => response({
    value: new Date().toISOString().split("T")[0],
}));
registerAppTool(server, "say-hello", {
    title: "Say Hello",
    description: "Greeting tool",
    inputSchema: {
        name: z.string(),
    },
    _meta: { ui: { resourceUri } },
}, async (args) => response({
    message: `Hello ${args.name}`,
}));
registerAppTool(server, "get-random-number", {
    title: "Random Number",
    description: "Generates random number",
    inputSchema: {},
    _meta: { ui: { resourceUri } },
}, async () => response({
    value: Math.floor(Math.random() * 100),
}));
registerAppTool(server, "reverse-text", {
    title: "Reverse Text",
    description: "Reverses input text",
    inputSchema: {
        text: z.string(),
    },
    _meta: { ui: { resourceUri } },
}, async (args) => response({
    value: args.text.split("").reverse().join(""),
}));
registerAppTool(server, "word-count", {
    title: "Word Count",
    description: "Counts words in text",
    inputSchema: {
        text: z.string(),
    },
    _meta: { ui: { resourceUri } },
}, async (args) => response({
    value: args.text.trim()
        ? args.text.trim().split(/\s+/).length
        : 0,
}));
/* ---------------- INCIDENT TOOL ---------------- */
registerAppTool(server, "create_incident", {
    title: "Create Incident",
    description: "Create IT incident",
    inputSchema: {
        type: z.enum(["hardware", "software", "network"]),
        assignmentGroup: z.enum([
            "IT Support",
            "Network Team",
            "Service Desk",
        ]),
        description: z.string(),
    },
    _meta: { ui: { resourceUri } },
}, async (args) => {
    const incidentId = `INC${Math.floor(Math.random() * 100000)}`;
    return response({
        incidentId,
        type: args.type,
        assignmentGroup: args.assignmentGroup,
        description: args.description,
    });
});
/* ---------------- RESOURCE HANDLER ---------------- */
registerAppResource(server, resourceUri, resourceUri, { mimeType: "text/html" }, async () => {
    const htmlPath = path.join(process.cwd(), "dist", "mcp-app.html");
    console.log("Loading UI:", htmlPath);
    const html = await fs.readFile(htmlPath, "utf-8");
    return {
        contents: [
            {
                uri: resourceUri,
                mimeType: "text/html",
                text: html,
            },
        ],
    };
});
/* ---------------- EXPRESS ---------------- */
const app = express();
app.use(cors());
app.use(express.json());
/* Health check */
app.get("/", (_, res) => {
    res.status(200).send("MCP Server Healthy");
});
/* MCP endpoint */
app.post("/mcp", async (req, res) => {
    try {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
        });
        res.on("close", () => transport.close());
        await transport.handleRequest(req, res, req.body);
    }
    catch (err) {
        console.error("MCP Error:", err);
        res.status(500).send("MCP Error");
    }
});
/* ---------------- START SERVER (FIXED) ---------------- */
const port = process.env.PORT || "8080";
function startServer() {
    console.log(`🚀 Starting Express on port ${port}`);
    app.listen(Number(port), () => {
        console.log(`✅ Express running on port ${port}`);
    });
}
startServer();
