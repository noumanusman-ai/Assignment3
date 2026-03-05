"use client";

import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "ERROR" | "WARNING" | "INFO";
  source: string;
  message: string;
  metadata: Record<string, unknown>;
}

const levelStyles: Record<string, string> = {
  ERROR: "bg-red-500/10 text-red-500 border-red-500/20",
  WARNING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  INFO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const levelIconColor: Record<string, string> = {
  ERROR: "text-red-500",
  WARNING: "text-amber-500",
  INFO: "text-blue-500",
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [levelFilter, setLevelFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams();
    if (levelFilter !== "All") params.set("level", levelFilter);
    if (sourceFilter !== "All") params.set("source", sourceFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs);
      setSources(data.sources);
    } catch {
      // silently fail on network errors
    } finally {
      setLoading(false);
    }
  }, [levelFilter, sourceFilter, search]);

  // Initial fetch and polling
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [isPaused, fetchLogs]);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toISOString().replace("T", " ").replace("Z", "").slice(0, 23);
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'JetBrains Mono', 'Inter', monospace" }}>
      {/* Header */}
      <header className="h-16 border-b border-[#6467f2]/20 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="material-symbols-outlined text-[#6467f2]">
            data_object
          </span>
          <h2 className="text-lg font-bold">System Logs</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              className="bg-[#6467f2]/10 border-none rounded-lg pl-9 pr-4 py-1.5 text-sm w-64 focus:ring-1 focus:ring-[#6467f2] focus:outline-none text-slate-100 placeholder:text-slate-500"
              placeholder="Search logs..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <button className="size-9 rounded-lg bg-[#6467f2]/10 flex items-center justify-center hover:bg-[#6467f2]/20 transition-colors">
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>
          </button>
          <button className="size-9 rounded-lg bg-[#6467f2]/10 flex items-center justify-center hover:bg-[#6467f2]/20 transition-colors">
            <span className="material-symbols-outlined text-xl">
              settings
            </span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Log list */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Filters */}
          <div className="p-4 border-b border-[#6467f2]/10 flex items-center gap-3 flex-wrap" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center gap-2 bg-[#6467f2]/10 px-3 py-1.5 rounded-lg border border-[#6467f2]/20">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                Level:
              </span>
              <select
                className="bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer text-slate-100"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="All" className="bg-[#101122]">All Levels</option>
                <option value="ERROR" className="bg-[#101122]">Error</option>
                <option value="WARNING" className="bg-[#101122]">Warning</option>
                <option value="INFO" className="bg-[#101122]">Info</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-[#6467f2]/10 px-3 py-1.5 rounded-lg border border-[#6467f2]/20">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                Source:
              </span>
              <select
                className="bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer text-slate-100"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="All" className="bg-[#101122]">All Sources</option>
                {sources.map((s) => (
                  <option key={s} value={s} className="bg-[#101122]">{s}</option>
                ))}
              </select>
            </div>
            <div className="h-6 w-[1px] bg-[#6467f2]/20 mx-2" />
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-2 text-xs font-semibold text-[#6467f2] uppercase bg-[#6467f2]/5 px-3 py-1.5 rounded-lg border border-[#6467f2]/20 hover:bg-[#6467f2]/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                {isPaused ? "play_arrow" : "pause"}
              </span>
              {isPaused ? "Resume Stream" : "Pause Stream"}
            </button>
          </div>

          {/* Log Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#101122] z-10 shadow-sm">
                <tr className="text-slate-500 border-b border-[#6467f2]/20 uppercase">
                  <th className="px-6 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Level</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-6 py-3 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6467f2]/10">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Loading logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      No logs match the current filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer transition-colors ${
                        selectedLog?.id === log.id
                          ? "bg-[#6467f2]/20"
                          : "hover:bg-[#6467f2]/5"
                      }`}
                    >
                      <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded border font-bold ${levelStyles[log.level]}`}
                        >
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#6467f2]">
                        {log.source}
                      </td>
                      <td className="px-6 py-3 text-slate-300">{log.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedLog && (
          <div className="w-[450px] border-l border-[#6467f2]/20 bg-[#101122] flex flex-col shrink-0">
            <div className="p-6 border-b border-[#6467f2]/10 flex items-center justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined ${levelIconColor[selectedLog.level]}`}
                >
                  info
                </span>
                <h3 className="font-bold text-sm">Log Entry Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  close
                </span>
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-auto flex-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span className="text-xs uppercase text-slate-500 font-bold tracking-widest">
                    Status
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border font-bold text-[10px] ${levelStyles[selectedLog.level]}`}
                  >
                    {selectedLog.level}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Message
                  </h4>
                  <p className="text-sm leading-relaxed bg-[#6467f2]/5 p-3 rounded-lg border border-[#6467f2]/10">
                    {selectedLog.message}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <div>
                    <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-1">
                      Source
                    </h4>
                    <p className="text-sm font-medium">{selectedLog.source}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-1">
                      Trace ID
                    </h4>
                    <p className="text-sm text-[#6467f2]">
                      {(selectedLog.metadata?.trace_id as string) ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Raw Metadata */}
              <div>
                <div className="flex items-center justify-between mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest">
                    Raw Metadata
                  </h4>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(selectedLog.metadata, null, 2)
                      )
                    }
                    className="text-[#6467f2] text-[10px] uppercase font-bold hover:underline"
                  >
                    Copy JSON
                  </button>
                </div>
                <div className="bg-[#0a0a14] rounded-lg p-4 text-xs text-blue-400 border border-[#6467f2]/20 shadow-inner leading-relaxed overflow-auto max-h-64">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                <button className="w-full py-2.5 bg-[#6467f2] hover:bg-[#6467f2]/90 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    visibility
                  </span>
                  View Related Traces
                </button>
                <button className="w-full py-2.5 bg-[#6467f2]/10 hover:bg-[#6467f2]/20 text-slate-100 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    bug_report
                  </span>
                  Create Bug Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-[#6467f2]/20 bg-[#101122] flex items-center px-6 justify-between text-[10px] uppercase font-bold tracking-widest text-slate-500 shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className={`size-1.5 rounded-full ${isPaused ? "bg-amber-500" : "bg-green-500 animate-pulse"}`}
            />
            {isPaused ? "PAUSED" : "LIVE STREAMING"}
          </div>
          <div>{logs.length} LOGS LOADED</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[#6467f2]">V.2.4.0-STABLE</div>
        </div>
      </footer>
    </div>
  );
}
