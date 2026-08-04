"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Tab = "html" | "css" | "js";

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
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      const send = (level, args) => {
        try {
          parent.postMessage(
            { source: "mg-sandbox", level, message: Array.from(args).map(String).join(" ") },
            "*"
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
  const [logs, setLogs] = useState<{ level: string; message: string }[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(buildSrcDoc(code.html, code.css, code.js));
    }, 500);
    return () => clearTimeout(timeout);
  }, [code]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.source === "mg-sandbox") {
        setLogs((prev) => [...prev.slice(-49), { level: e.data.level, message: e.data.message }]);
      }
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
            className="h-[280px] w-full bg-obsidian-soft"
          />
          <div className="h-[80px] overflow-y-auto border-t border-hairline-soft bg-obsidian-soft px-4 py-2 font-mono text-xs">
            {logs.length === 0 ? (
              <span className="text-chrome-700">// console output appears here</span>
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