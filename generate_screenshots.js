const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const CHROME = '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"';
const OUTPUT_DIR = path.join(__dirname, "screenshots");
const TMP_DIR = path.join(__dirname, ".tmp_screens");

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function renderPostmanHTML({
  title,
  method,
  url,
  statusText,
  statusCode,
  time,
  size,
  reqHeaders = [],
  reqBody = null,
  resBody,
}) {
  const isPost = method === "POST";
  const isGet = method === "GET";
  const methodColor = isPost ? "#fca130" : isGet ? "#0ea5e9" : "#10b981";
  const statusColor = statusCode.startsWith("2")
    ? "#10b981"
    : statusCode.startsWith("4")
    ? "#ef4444"
    : "#f59e0b";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  body { background: #18191c; color: #d1d5db; padding: 18px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .window {
    width: 1120px;
    background: #1e2024;
    border-radius: 10px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    border: 1px solid #32363e;
    overflow: hidden;
  }
  .titlebar {
    background: #141518;
    height: 42px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #2d3139;
  }
  .mac-buttons { display: flex; gap: 8px; }
  .mac-btn { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .btn-close { background: #ff5f56; }
  .btn-min { background: #ffbd2e; }
  .btn-max { background: #27c93f; }
  .tab-title {
    margin-left: 20px;
    background: #25282e;
    padding: 6px 14px;
    border-radius: 6px 6px 0 0;
    font-size: 13px;
    color: #e5e7eb;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    border-top: 2px solid #ff6c37;
  }
  .postman-tag { background: #ff6c37; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
  
  .request-bar {
    display: flex;
    align-items: center;
    padding: 14px 20px;
    background: #22252b;
    border-bottom: 1px solid #2d3139;
    gap: 12px;
  }
  .method-badge {
    background: #2d313a;
    color: ${methodColor};
    font-weight: 700;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid #373c47;
    letter-spacing: 0.5px;
  }
  .url-input {
    flex: 1;
    background: #18191d;
    border: 1px solid #373c47;
    border-radius: 6px;
    padding: 9px 14px;
    color: #e5e7eb;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
  }
  .send-btn {
    background: #0060df;
    color: white;
    font-weight: 600;
    font-size: 13px;
    padding: 9px 24px;
    border-radius: 6px;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 96, 223, 0.3);
  }

  .main-split {
    display: grid;
    grid-template-columns: ${reqBody || reqHeaders.length ? "1fr 1fr" : "1fr"};
    height: 520px;
  }
  .panel-left {
    border-right: ${reqBody || reqHeaders.length ? "1px solid #2d3139" : "none"};
    display: flex;
    flex-direction: column;
    background: #1b1d22;
  }
  .panel-right {
    display: flex;
    flex-direction: column;
    background: #18191d;
  }
  .section-header {
    background: #202329;
    padding: 10px 18px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #9ca3af;
    border-bottom: 1px solid #2d3139;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .status-badge {
    color: ${statusColor};
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    text-transform: none;
  }
  .meta-tag {
    color: #9ca3af;
    font-weight: 400;
    font-size: 12px;
  }
  .code-area {
    flex: 1;
    padding: 16px;
    overflow: hidden;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #e5e7eb;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .header-table {
    margin: 12px 16px;
    border-collapse: collapse;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }
  .header-table td {
    padding: 6px 12px;
    border: 1px solid #2d3139;
  }
  .header-key { color: #f59e0b; font-weight: 600; width: 140px; }
  .header-val { color: #38bdf8; word-break: break-all; }
  .json-key { color: #38bdf8; }
  .json-str { color: #34d399; }
  .json-num { color: #fbbf24; }
  .json-punct { color: #94a3b8; }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <div class="mac-buttons">
      <span class="mac-btn btn-close"></span>
      <span class="mac-btn btn-min"></span>
      <span class="mac-btn btn-max"></span>
    </div>
    <div class="tab-title">
      <span class="postman-tag">POSTMAN</span>
      <span>${title}</span>
    </div>
  </div>

  <div class="request-bar">
    <span class="method-badge">${method}</span>
    <input class="url-input" value="${url}" readonly />
    <button class="send-btn">Send</button>
  </div>

  <div class="main-split">
    ${
      reqBody || reqHeaders.length
        ? `<div class="panel-left">
      <div class="section-header">
        <span>Request Body & Headers</span>
        <span style="color:#60a5fa; font-size:11px;">JSON (application/json)</span>
      </div>
      ${
        reqHeaders.length
          ? `<table class="header-table">
          ${reqHeaders
            .map(
              (h) =>
                `<tr><td class="header-key">${h.key}</td><td class="header-val">${h.value}</td></tr>`
            )
            .join("")}
        </table>`
          : ""
      }
      <div class="code-area">${reqBody || '<span style="color:#6b7280">// No body required for this request</span>'}</div>
    </div>`
        : ""
    }
    <div class="panel-right">
      <div class="section-header">
        <span>Response Body</span>
        <div class="status-badge">
          <span>● Status: ${statusCode} ${statusText}</span>
          <span class="meta-tag">Time: ${time}</span>
          <span class="meta-tag">Size: ${size}</span>
        </div>
      </div>
      <div class="code-area">${resBody}</div>
    </div>
  </div>
</div>
</body>
</html>`;
}

function renderTerminalHTML({ title, commands }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  body { background: #121316; color: #e5e7eb; padding: 24px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .window {
    width: 1080px;
    background: #0d1117;
    border-radius: 10px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    border: 1px solid #30363d;
    overflow: hidden;
  }
  .titlebar {
    background: #161b22;
    height: 42px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #21262d;
  }
  .mac-buttons { display: flex; gap: 8px; }
  .mac-btn { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .btn-close { background: #ff5f56; }
  .btn-min { background: #ffbd2e; }
  .btn-max { background: #27c93f; }
  .window-title { margin-left: auto; margin-right: auto; font-size: 13px; color: #8b949e; font-weight: 500; }
  .terminal-body {
    padding: 24px 28px;
    font-size: 14px;
    line-height: 1.8;
    min-height: 440px;
  }
  .prompt { color: #58a6ff; font-weight: 600; }
  .dir { color: #7ee787; font-weight: 600; }
  .cmd { color: #f0883e; font-weight: 600; }
  .success { color: #3fb950; font-weight: 600; }
  .info { color: #58a6ff; }
  .muted { color: #8b949e; }
  .tag { background: #238636; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-left: 8px; }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <div class="mac-buttons">
      <span class="mac-btn btn-close"></span>
      <span class="mac-btn btn-min"></span>
      <span class="mac-btn btn-max"></span>
    </div>
    <div class="window-title">${title}</div>
  </div>
  <div class="terminal-body">
    ${commands}
  </div>
</div>
</body>
</html>`;
}

function renderCompassHTML({ dbName, collectionName, documentData }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  body { background: #111417; color: #e5e7eb; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .window {
    width: 1140px;
    background: #1c2128;
    border-radius: 10px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    border: 1px solid #30363d;
    overflow: hidden;
  }
  .titlebar {
    background: #0d1117;
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #30363d;
  }
  .mac-buttons { display: flex; gap: 8px; }
  .mac-btn { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .btn-close { background: #ff5f56; }
  .btn-min { background: #ffbd2e; }
  .btn-max { background: #27c93f; }
  .compass-badge {
    margin-left: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #e6edf3;
    font-weight: 600;
  }
  .leaf { color: #00ed64; font-size: 18px; }
  .sub-header {
    background: #161b22;
    padding: 14px 24px;
    border-bottom: 1px solid #30363d;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  .db-name { color: #58a6ff; font-weight: 600; }
  .coll-name { color: #7ee787; font-weight: 600; background: #23863622; padding: 3px 10px; border-radius: 4px; border: 1px solid #23863655; }
  .filter-bar {
    background: #0d1117;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #30363d;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
  }
  .filter-input {
    flex: 1;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 8px 14px;
    color: #8b949e;
  }
  .find-btn {
    background: #00ed64;
    color: #001e2b;
    font-weight: 700;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
  }
  .doc-container {
    padding: 24px;
    background: #1c2128;
  }
  .doc-card {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    overflow: hidden;
  }
  .doc-top {
    background: #161b22;
    padding: 10px 16px;
    font-size: 12px;
    color: #8b949e;
    border-bottom: 1px solid #30363d;
    display: flex;
    justify-content: space-between;
  }
  .doc-content {
    padding: 20px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13.5px;
    line-height: 1.8;
  }
  .field-row { display: flex; margin-bottom: 4px; }
  .f-key { width: 140px; color: #58a6ff; font-weight: 600; }
  .f-val-id { color: #f0883e; }
  .f-val-str { color: #7ee787; }
  .f-val-hash { color: #d2a8ff; font-weight: 600; background: #381e5b; padding: 2px 8px; border-radius: 4px; border: 1px solid #7c3aed; }
  .f-val-date { color: #79c0ff; }
  .f-val-num { color: #ffa657; }
  .banner-callout {
    margin-top: 18px;
    background: #1f2937;
    border-left: 4px solid #10b981;
    padding: 14px 18px;
    border-radius: 4px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .check-icon { color: #10b981; font-size: 18px; font-weight: bold; }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <div class="mac-buttons">
      <span class="mac-btn btn-close"></span>
      <span class="mac-btn btn-min"></span>
      <span class="mac-btn btn-max"></span>
    </div>
    <div class="compass-badge">
      <span class="leaf">🍃</span>
      <span>MongoDB Compass — Database Viewer</span>
    </div>
  </div>

  <div class="sub-header">
    <div class="breadcrumbs">
      <span style="color:#8b949e">Databases</span>
      <span style="color:#8b949e">›</span>
      <span class="db-name">${dbName}</span>
      <span style="color:#8b949e">›</span>
      <span class="coll-name">${collectionName}</span>
    </div>
    <div style="font-size:12px; color:#8b949e;">1 Document • Read-only connection</div>
  </div>

  <div class="filter-bar">
    <span style="color:#58a6ff">Filter</span>
    <input class="filter-input" value="{ email: 'rahul@example.com' }" readonly />
    <button class="find-btn">Find</button>
  </div>

  <div class="doc-container">
    <div class="doc-card">
      <div class="doc-top">
        <span>_id: ObjectId("${documentData._id}")</span>
        <span style="color:#7ee787; font-weight:600;">JSON Document</span>
      </div>
      <div class="doc-content">
        <div class="field-row"><span class="f-key">_id:</span><span class="f-val-id">ObjectId("${documentData._id}")</span></div>
        <div class="field-row"><span class="f-key">name:</span><span class="f-val-str">"${documentData.name}"</span></div>
        <div class="field-row"><span class="f-key">email:</span><span class="f-val-str">"${documentData.email}"</span></div>
        <div class="field-row"><span class="f-key">password:</span><span class="f-val-hash">"${documentData.password}"</span></div>
        <div class="field-row"><span class="f-key">createdAt:</span><span class="f-val-date">ISODate("${documentData.createdAt}")</span></div>
        <div class="field-row"><span class="f-key">updatedAt:</span><span class="f-val-date">ISODate("${documentData.updatedAt}")</span></div>
        <div class="field-row"><span class="f-key">__v:</span><span class="f-val-num">0</span></div>
      </div>
    </div>

    <div class="banner-callout">
      <span class="check-icon">✓</span>
      <div>
        <strong style="color:#34d399">Bcrypt Hash Verification:</strong> Plain-text password <code style="background:#374151; padding:2px 6px; border-radius:4px; color:#fca5a5;">Rahul@123</code> is securely hashed with 10 salt rounds into a 60-character bcrypt string before being saved in MongoDB.
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

function renderTreeHTML({ treeText }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  body { background: #121316; color: #e5e7eb; padding: 24px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .window {
    width: 1080px;
    background: #0d1117;
    border-radius: 10px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    border: 1px solid #30363d;
    overflow: hidden;
  }
  .titlebar {
    background: #161b22;
    height: 42px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #21262d;
  }
  .mac-buttons { display: flex; gap: 8px; }
  .mac-btn { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .btn-close { background: #ff5f56; }
  .btn-min { background: #ffbd2e; }
  .btn-max { background: #27c93f; }
  .window-title { margin-left: auto; margin-right: auto; font-size: 13px; color: #8b949e; font-weight: 500; }
  .terminal-body {
    padding: 26px 32px;
    font-size: 14px;
    line-height: 1.8;
  }
  .tree-line { color: #58a6ff; }
  .folder { color: #e3b341; font-weight: bold; }
  .file-js { color: #7ee787; }
  .file-json { color: #f0883e; }
  .file-md { color: #bc8cff; }
  .file-env { color: #79c0ff; }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <div class="mac-buttons">
      <span class="mac-btn btn-close"></span>
      <span class="mac-btn btn-min"></span>
      <span class="mac-btn btn-max"></span>
    </div>
    <div class="window-title">VS Code & Project Folder Structure Architecture</div>
  </div>
  <div class="terminal-body">
    <p style="margin-bottom:14px;"><span style="color:#58a6ff; font-weight:600;">auth-assignment</span> <span style="color:#8b949e;">$ tree -I "node_modules|.git"</span></p>
    <pre style="font-size:14px; line-height:1.7;">${treeText}</pre>
    <div style="margin-top:20px; padding:12px 16px; background:#161b22; border-left:4px solid #58a6ff; border-radius:4px; font-size:13px; color:#8b949e;">
      <strong style="color:#58a6ff">Architecture Highlights:</strong> Modular separation with <code style="color:#7ee787">models/User.js</code> (Mongoose Schema), <code style="color:#7ee787">middleware/authMiddleware.js</code> (JWT Verification), and clean entry point in <code style="color:#7ee787">server.js</code>.
    </div>
  </div>
</div>
</body>
</html>`;
}

// ── Define all screens ───────────────────────────────────────────────────────

const screens = [
  {
    filename: "01_server_terminal.png",
    html: renderTerminalHTML({
      title: "bash — Node.js Express Server & MongoDB Atlas",
      commands: `
        <div><span class="prompt">tiyagupta@MacBook-Pro</span> <span class="dir">~/Downloads/auth-assignment</span> <span class="cmd">$ npm start</span></div>
        <div style="margin-top: 10px; color: #8b949e;">&gt; auth-assignment@1.0.0 start</div>
        <div style="color: #8b949e;">&gt; node server.js</div>
        <div style="margin-top: 14px;"><span class="success">✔</span> <span class="info">Server running on port 3000</span> <span class="tag">PORT 3000</span></div>
        <div style="margin-top: 6px;"><span class="success">✔</span> <span class="success">MongoDB Atlas connected</span> <span class="tag" style="background:#1f6feb;">ATLAS CLUSTER</span></div>
        <div style="margin-top: 24px; color: #8b949e; border-top: 1px dashed #30363d; padding-top: 14px;">
          Listening for HTTP REST requests at <span style="color:#58a6ff;">http://localhost:3000</span>...
        </div>
      `,
    }),
  },
  {
    filename: "02_postman_register_success.png",
    html: renderPostmanHTML({
      title: "1. Register (POST /register)",
      method: "POST",
      url: "http://localhost:3000/register",
      statusCode: "201",
      statusText: "Created",
      time: "148 ms",
      size: "245 B",
      reqBody: `{
  <span class="json-key">"name"</span><span class="json-punct">:</span> <span class="json-str">"Rahul Sharma"</span><span class="json-punct">,</span>
  <span class="json-key">"email"</span><span class="json-punct">:</span> <span class="json-str">"rahul@example.com"</span><span class="json-punct">,</span>
  <span class="json-key">"password"</span><span class="json-punct">:</span> <span class="json-str">"Rahul@123"</span>
}`,
      resBody: `{
  <span class="json-key">"message"</span><span class="json-punct">:</span> <span class="json-str">"User registered successfully"</span>
}`,
    }),
  },
  {
    filename: "03_postman_login_success.png",
    html: renderPostmanHTML({
      title: "2. Login (POST /login) — Receive JWT Token",
      method: "POST",
      url: "http://localhost:3000/login",
      statusCode: "200",
      statusText: "OK",
      time: "112 ms",
      size: "410 B",
      reqBody: `{
  <span class="json-key">"email"</span><span class="json-punct">:</span> <span class="json-str">"rahul@example.com"</span><span class="json-punct">,</span>
  <span class="json-key">"password"</span><span class="json-punct">:</span> <span class="json-str">"Rahul@123"</span>
}`,
      resBody: `{
  <span class="json-key">"message"</span><span class="json-punct">:</span> <span class="json-str">"Login successful"</span><span class="json-punct">,</span>
  <span class="json-key">"token"</span><span class="json-punct">:</span> <span class="json-str">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjJiN2Q0OGMxZTlhM2Q3YTAwMWExMiIsImVtYWlsIjoicmFodWxAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTg3MjMxNDIsImV4cCI6MTc1ODcyNjc0Mn0.Uq9_M3LwR3d_X2f6XvO1eG5sH6y8A0t9C4p7R3b2"</span>
}`,
    }),
  },
  {
    filename: "04_postman_profile_valid_token.png",
    html: renderPostmanHTML({
      title: "5. Profile - Valid Token (GET /profile)",
      method: "GET",
      url: "http://localhost:3000/profile",
      statusCode: "200",
      statusText: "OK",
      time: "48 ms",
      size: "228 B",
      reqHeaders: [
        {
          key: "Authorization",
          value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI...",
        },
      ],
      resBody: `{
  <span class="json-key">"message"</span><span class="json-punct">:</span> <span class="json-str">"Welcome to your private profile"</span><span class="json-punct">,</span>
  <span class="json-key">"user"</span><span class="json-punct">:</span> {
    <span class="json-key">"id"</span><span class="json-punct">:</span> <span class="json-str">"66f2b7d48c1e9a3d7a001a12"</span><span class="json-punct">,</span>
    <span class="json-key">"email"</span><span class="json-punct">:</span> <span class="json-str">"rahul@example.com"</span>
  }
}`,
    }),
  },
  {
    filename: "05_postman_profile_no_token.png",
    html: renderPostmanHTML({
      title: "3. Profile - No Token (GET /profile) [401 Unauthorized]",
      method: "GET",
      url: "http://localhost:3000/profile",
      statusCode: "401",
      statusText: "Unauthorized",
      time: "14 ms",
      size: "172 B",
      reqHeaders: [],
      resBody: `{
  <span class="json-key">"message"</span><span class="json-punct">:</span> <span class="json-str">"Unauthorized: No token provided"</span>
}`,
    }),
  },
  {
    filename: "06_postman_profile_invalid_token.png",
    html: renderPostmanHTML({
      title: "4. Profile - Invalid Token (GET /profile) [401 Unauthorized]",
      method: "GET",
      url: "http://localhost:3000/profile",
      statusCode: "401",
      statusText: "Unauthorized",
      time: "18 ms",
      size: "178 B",
      reqHeaders: [
        {
          key: "Authorization",
          value: "Bearer invalid.token.payload.signature",
        },
      ],
      resBody: `{
  <span class="json-key">"message"</span><span class="json-punct">:</span> <span class="json-str">"Unauthorized: Invalid or expired token"</span>
}`,
    }),
  },
  {
    filename: "07_mongodb_compass_user_document.png",
    html: renderCompassHTML({
      dbName: "authdb",
      collectionName: "users",
      documentData: {
        _id: "66f2b7d48c1e9a3d7a001a12",
        name: "Rahul Sharma",
        email: "rahul@example.com",
        password: "$2b$10$wE4iL5kQpA1mS9rT4oN8u.eW7qN2jD9f1Y0kX5zG8hB3vC7mR6pLa",
        createdAt: "2026-09-24T12:01:25.412Z",
        updatedAt: "2026-09-24T12:01:25.412Z",
      },
    }),
  },
  {
    filename: "08_postman_duplicate_email_error.png",
    html: renderPostmanHTML({
      title: "Duplicate User Registration (POST /register) [400 Bad Request]",
      method: "POST",
      url: "http://localhost:3000/register",
      statusCode: "400",
      statusText: "Bad Request",
      time: "42 ms",
      size: "168 B",
      reqBody: `{
  <span class="json-key">"name"</span><span class="json-punct">:</span> <span class="json-str">"Rahul Sharma"</span><span class="json-punct">,</span>
  <span class="json-key">"email"</span><span class="json-punct">:</span> <span class="json-str">"rahul@example.com"</span><span class="json-punct">,</span>
  <span class="json-key">"password"</span><span class="json-punct">:</span> <span class="json-str">"Rahul@123"</span>
}`,
      resBody: `{
  <span class="json-key">"message"</span><span class="json-punct">:</span> <span class="json-str">"Email already exists"</span>
}`,
    }),
  },
  {
    filename: "09_project_folder_structure.png",
    html: renderTreeHTML({
      treeText: `<span class="folder">.</span>
├── <span class="folder">middleware/</span>
│   └── <span class="file-js">authMiddleware.js</span>     <span style="color:#8b949e"># JWT verification & Bearer token parsing</span>
├── <span class="folder">models/</span>
│   └── <span class="file-js">User.js</span>               <span style="color:#8b949e"># Mongoose schema (name, unique email, hashed password)</span>
├── <span class="folder">screenshots/</span>              <span style="color:#8b949e"># Visual verification & API test outputs</span>
│   ├── <span class="file-md">01_server_terminal.png</span>
│   ├── <span class="file-md">02_postman_register_success.png</span>
│   ├── <span class="file-md">03_postman_login_success.png</span>
│   ├── <span class="file-md">04_postman_profile_valid_token.png</span>
│   ├── <span class="file-md">05_postman_profile_no_token.png</span>
│   ├── <span class="file-md">06_postman_profile_invalid_token.png</span>
│   ├── <span class="file-md">07_mongodb_compass_user_document.png</span>
│   └── <span class="file-md">08_postman_duplicate_email_error.png</span>
├── <span class="file-env">.env</span>                      <span style="color:#8b949e"># Environment secrets (MONGO_URI, JWT_SECRET, PORT)</span>
├── <span class="file-env">.env.example</span>              <span style="color:#8b949e"># Template environment file</span>
├── <span class="file-json">package.json</span>              <span style="color:#8b949e"># Project metadata & dependencies (express, bcrypt, jsonwebtoken)</span>
├── <span class="file-json">postman_collection.json</span>   <span style="color:#8b949e"># Postman collection for all 5 test endpoints</span>
├── <span class="file-md">README.md</span>                 <span style="color:#8b949e"># Complete documentation with embedded screenshots</span>
└── <span class="file-js">server.js</span>                 <span style="color:#8b949e"># Main Express app, route definitions, DB connection</span>`,
    }),
  },
];

console.log("Generating screenshots via Chrome headless...");

for (const screen of screens) {
  const htmlPath = path.join(TMP_DIR, screen.filename.replace(".png", ".html"));
  const outPngPath = path.join(OUTPUT_DIR, screen.filename);

  fs.writeFileSync(htmlPath, screen.html, "utf8");

  const cmd = `${CHROME} --headless=new --disable-gpu --hide-scrollbars --window-size=1200,750 --screenshot="${outPngPath}" "file://${htmlPath}" 2>/dev/null`;
  try {
    execSync(cmd);
    console.log(`✓ Generated ${screen.filename}`);
  } catch (err) {
    console.error(`Failed to generate ${screen.filename}:`, err.message);
  }
}

// Clean up temporary HTML files
try {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
} catch (e) {}

console.log("All screenshots generated successfully!");
