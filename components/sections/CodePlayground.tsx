"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Tab = "html" | "css" | "js";

// The sandbox iframe is a public playground: it runs arbitrary, untrusted
// user code. These constants harden the boundary between that code and the
// parent page.
const LOG_LEVELS = ["log", "warn", "error"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];
const VALID_LEVELS: ReadonlySet<string> = new Set(LOG_LEVELS);

// Cap the length of any single console message so a malicious/hostile script
// cannot flood React state and freeze the browser.
const MAX_LOG_LENGTH = 1000;
// Keep the in-memory log ring bounded.
const MAX_LOG_ENTRIES = 50;

// Content-Security-Policy enforced inside the iframe. `frame-ancestors` and
// `navigate-to` are intentionally omitted: browsers ignore them in <meta>
// tags (they only apply via HTTP headers).
const SANDBOX_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "connect-src 'none'",
  "img-src 'none'",
  "font-src 'none'",
  "object-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

const DEFAULTS: Record<Tab, string> = {
  html: `<div class="grid">
  <div class="dot"></div>
  <div class="dot"></div>
  <div class="dot"></div>
</div>
<p>click a dot</p>`,
  css: `body {
  display: grid;
  place-items: center;
  height: 100vh;
  margin: 0;
  background: #08090a;
  font-family: sans-serif;
  color: #8a8e96;
}
.grid {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}
.dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #55585f;
  cursor: pointer;
  transition: background 0.2s ease;
}
.dot.live {
  background: #f2761d;
  box-shadow: 0 0 0 6px #f2761d26;
}`,
  js: `document.querySelectorAll(".dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    dot.classList.toggle("live");
    console.log("toggled", dot.classList.contains("live"));
  });
});`,
};

const TABS: { id: Tab; label: string }[] = [
  { id: "html", label: "index.html" },
  { id: "css", label: "styles.css" },
  { id: "js", label: "script.js" },
];

function buildSrcDoc(html: string, css: string, js: string) {
  // postMessage must target the parent's exact origin — never "*". The iframe
  // is sandboxed without allow-same-origin (opaque origin), so it cannot read
  // parent.location itself; we inject the origin at build time instead.
  const targetOrigin =
    typeof window !== "undefined" ? window.location.origin : "null";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      const send = (level, args) => {
        try {
          parent.postMessage(
            { source: "mg-sandbox", level, message: Array.from(args).map(String).join(" ") },
            ${JSON.stringify(targetOrigin)}
          );
        } catch (e) {}
      };
      const orig = { log: console.log, error: console.error, warn: console.warn };
      console.log = (...a) => { send("log", a); orig.log(...a); };
      console.warn = (...a) => { send("warn", a); orig.warn(...a); };
      console.error = (...a) => { send("error", a); orig.error(...a); };
      window.onerror = (msg) => send("error", [msg]);
    </script>
    <script>
      try {
        ${js}
      } catch (e) {
        console.error(e.message);
      }
    </script>
  </body>
</html>`;
}

export function CodePlayground() {
  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [code, setCode] = useState(DEFAULTS);
  const [srcDoc, setSrcDoc] = useState(() =>
    buildSrcDoc(DEFAULTS.html, DEFAULTS.css, DEFAULTS.js)
  );
  const [logs, setLogs] = useState<{ level: LogLevel; message: string }[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(buildSrcDoc(code.html, code.css, code.js));
    }, 500);
    return () => clearTimeout(timeout);
  }, [code]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      // Only accept messages from our own sandbox iframe. Because the iframe
      // uses a same-origin srcDoc, its messages carry the parent's origin;
      // anything else (another frame, an extension, a spoofed postMessage) is
      // rejected outright.
      if (e.origin !== window.location.origin) return;

      const data = e.data;
      if (!data || typeof data !== "object" || data.source !== "mg-sandbox") return;

      // Validate the log level against the allow-list.
      if (typeof data.level !== "string" || !VALID_LEVELS.has(data.level)) return;

      // Coerce and clamp the message payload (strict string, length-capped).
      let message = typeof data.message === "string" ? data.message : String(data.message ?? "");
      if (message.length > MAX_LOG_LENGTH) message = message.slice(0, MAX_LOG_LENGTH);

      const level = data.level as LogLevel;
      setLogs((prev) => [...prev.slice(-(MAX_LOG_ENTRIES - 1)), { level, message }]);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function runNow() {
    setSrcDoc(buildSrcDoc(code.html, code.css, code.js));
  }

  function reset() {
    setCode(DEFAULTS);
    setLogs([]);
    setSrcDoc(buildSrcDoc(DEFAULTS.html, DEFAULTS.css, DEFAULTS.js));
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/60">
      <div className="grid md:grid-cols-2">
        {/* Editor pane */}
        <div className="border-b border-hairline md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b border-hairline-soft px-4">
            <div className="flex">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "border-b-2 px-3 py-3 font-mono text-xs tracking-wide transition-colors",
                    activeTab === tab.id
                      ? "border-signal text-chrome-100"
                      : "border-transparent text-chrome-700 hover:text-chrome-500"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 py-2">
              <button
                onClick={reset}
                className="rounded-[var(--radius-mg)] px-2 py-1 font-mono text-[11px] text-chrome-700 transition-colors hover:text-chrome-300"
              >
                Reset
              </button>
              <button
                onClick={runNow}
                className="rounded-[var(--radius-mg)] border border-signal/40 bg-signal-dim px-3 py-1 font-mono text-[11px] text-signal-high transition-colors hover:border-signal"
              >
                Run ▸
              </button>
            </div>
          </div>
          <textarea
            spellCheck={false}
            value={code[activeTab]}
            onChange={(e) => setCode((c) => ({ ...c, [activeTab]: e.target.value }))}
            className="h-[360px] w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-chrome-200 outline-none"
          />
        </div>

        {/* Preview pane */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-hairline-soft px-4 py-3">
            <span className="mg-signal-dot h-1.5 w-1.5 rounded-full bg-signal" />
            <span className="mg-eyebrow">Live preview</span>
          </div>
          <iframe
            title="Sandbox preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            className="h-[280px] w-full bg-obsidian-soft"
          />
          <div className="h-[80px] overflow-y-auto border-t border-hairline-soft bg-obsidian-soft px-4 py-2 font-mono text-xs">
            {logs.length === 0 ? (
              <span className="text-chrome-700">{"// console output appears here"}</span>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "leading-relaxed",
                    log.level === "error" ? "text-signal-high" : "text-chrome-500"
                  )}
                >
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}