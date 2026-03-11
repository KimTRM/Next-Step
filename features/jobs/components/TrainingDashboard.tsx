"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModelInfo {
  architecture: string;
  base_model: string;
  checkpoint_exists: boolean;
  evaluation_metrics?: EvalMetrics;
  training_metrics?: TrainingMetrics;
  latest_training_run?: TrainingRun | null;
}

interface EvalMetrics {
  pearson?: number;
  rmse?: number;
  ndcg_at_10?: number;
  precision_at_5?: number;
  n_pairs?: number;
  split?: string;
  targets_met?: Record<string, boolean>;
}

interface TrainingMetrics {
  train_loss?: number;
  val_loss?: number;
  val_rmse?: number;
  epochs_trained?: number;
  history?: Array<{ epoch: number; train_loss: number; val_loss: number; val_rmse: number }>;
}

interface TrainingRun {
  id: string;
  started_at: string;
  finished_at?: string;
  status: string;
  epochs?: number;
  batch_size?: number;
  pearson?: number;
  rmse?: number;
  checkpoint_path?: string;
}

interface PipelineStatus {
  db_connected?: boolean;
  job_count?: number;
  resume_count?: number;
  training_pair_count?: number;
  label_method_breakdown?: Record<string, number>;
  industry_breakdown?: Record<string, number>;
  latest_run?: {
    stage: string;
    status: string;
    started_at: string;
    records_processed: number;
  } | null;
}

interface HealthStatus {
  status: string;
  checkpoint_exists: boolean;
  db_connected: boolean;
  gemini_available: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n?: number, decimals = 4) =>
  n !== undefined && n !== null ? n.toFixed(decimals) : "—";

const metricColor = (value: number | undefined, target: number, higherIsBetter = true) => {
  if (value === undefined) return "text-gray-400";
  const met = higherIsBetter ? value >= target : value <= target;
  return met ? "text-green-400" : "text-yellow-400";
};

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    running: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
    failed: "bg-red-500/20 text-red-300 border-red-500/30",
    healthy: "bg-green-500/20 text-green-300 border-green-500/30",
    unknown: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };
  return colors[status] || colors.unknown;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({ title, children, className = "" }: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-gray-800/60 border border-gray-700 rounded-xl p-5 ${className}`}>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function MetricRow({ label, value, target, higherIsBetter = true, unit = "" }: {
  label: string;
  value: number | undefined;
  target: number;
  higherIsBetter?: boolean;
  unit?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm font-semibold ${metricColor(value, target, higherIsBetter)}`}>
          {fmt(value)}{unit}
        </span>
        <span className="text-xs text-gray-500">
          {higherIsBetter ? `target >` : `target <`} {target}
        </span>
        {value !== undefined && (
          <span className="text-xs">
            {(higherIsBetter ? value >= target : value <= target) ? "✓" : "✗"}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export function TrainingDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);

  // Training controls
  const [epochs, setEpochs] = useState(10);
  const [batchSize, setBatchSize] = useState(32);
  const [encoderLr, setEncoderLr] = useState("2e-5");
  const [headLr, setHeadLr] = useState("1e-4");
  const [jsonlPath, setJsonlPath] = useState("");
  const [trainLog, setTrainLog] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainResult, setTrainResult] = useState<Record<string, unknown> | null>(null);

  // Eval
  const [evalMetrics, setEvalMetrics] = useState<EvalMetrics | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Pipeline
  const [pipelineStage, setPipelineStage] = useState("full");
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [trainLog]);

  const loadAll = useCallback(async () => {
    await Promise.allSettled([
      fetch(`${API_BASE}/health`).then(r => r.json()).then(setHealth).catch(() => null),
      fetch(`${API_BASE}/model-info`).then(r => r.json()).then(setModelInfo).catch(() => null),
      fetch(`${API_BASE}/pipeline/status`).then(r => r.json()).then(setPipeline).catch(() => null),
      fetch(`${API_BASE}/evaluate/metrics`).then(r => r.json()).then(d => d.metrics && setEvalMetrics(d.metrics)).catch(() => null),
    ]);
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainLog([`[${new Date().toLocaleTimeString()}] Starting training...`]);
    setTrainResult(null);

    try {
      const payload: Record<string, unknown> = {
        epochs,
        batch_size: batchSize,
        encoder_lr: parseFloat(encoderLr),
        head_lr: parseFloat(headLr),
      };
      if (jsonlPath.trim()) payload.jsonl_path = jsonlPath.trim();

      const resp = await fetch(`${API_BASE}/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      setTrainResult(data);
      setTrainLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Training launched (PID: ${data.pid})`,
        `[${new Date().toLocaleTimeString()}] Run ID: ${data.run_id || "N/A"}`,
        `[${new Date().toLocaleTimeString()}] Monitor via GET /train/status`,
      ]);
    } catch (e) {
      setTrainLog(prev => [...prev, `[ERROR] ${e}`]);
    } finally {
      setIsTraining(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const params = jsonlPath.trim()
        ? `?jsonl_path=${encodeURIComponent(jsonlPath)}&split=test`
        : `?split=test`;
      const resp = await fetch(`${API_BASE}/evaluate${params}`, { method: "POST" });
      const data = await resp.json();
      if (data.metrics) setEvalMetrics(data.metrics);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRunPipeline = async () => {
    setIsPipelineRunning(true);
    try {
      const resp = await fetch(`${API_BASE}/pipeline/run?stage=${pipelineStage}`, { method: "POST" });
      const data = await resp.json();
      console.log("Pipeline:", data);
      setTimeout(loadAll, 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPipelineRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-white">AI Training Dashboard</h1>
          <span className="text-xs font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
            /match-jobs/admin-train
          </span>
        </div>
        <p className="text-sm text-gray-500">
          PH Job Matcher v2 — Siamese Bi-Encoder + Cross-Encoder (paraphrase-multilingual-MiniLM-L12-v2)
        </p>
      </div>

      {/* API Status Banner */}
      {health && (
        <div className={`mb-6 px-4 py-2 rounded-lg border text-sm flex items-center gap-4 ${statusBadge(health.status)}`}>
          <span>API: <strong>{health.status}</strong></span>
          <span>Checkpoint: {health.checkpoint_exists ? "✓ loaded" : "✗ not found"}</span>
          <span>DB: {health.db_connected ? "✓ connected" : "✗ disconnected"}</span>
          <span>Gemini: {health.gemini_available ? "✓" : "✗"}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* === LEFT COLUMN === */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Model Status */}
          <SectionCard title="Model Status">
            {modelInfo ? (
              <div className="space-y-1">
                <div className="flex justify-between text-sm pb-2 mb-2 border-b border-gray-700">
                  <span className="text-gray-400">Architecture</span>
                  <span className="text-white font-medium">{modelInfo.architecture}</span>
                </div>
                <div className="flex justify-between text-sm pb-2 mb-2 border-b border-gray-700">
                  <span className="text-gray-400">Base Model</span>
                  <span className="font-mono text-xs text-indigo-300">{modelInfo.base_model}</span>
                </div>
                <div className="flex justify-between text-sm pb-2 mb-2 border-b border-gray-700">
                  <span className="text-gray-400">Checkpoint</span>
                  <span className={modelInfo.checkpoint_exists ? "text-green-400" : "text-red-400"}>
                    {modelInfo.checkpoint_exists ? "✓ Loaded" : "✗ Not found — train first"}
                  </span>
                </div>
                {modelInfo.latest_training_run && (
                  <>
                    <div className="flex justify-between text-sm pb-2 border-b border-gray-700">
                      <span className="text-gray-400">Last Run</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${statusBadge(modelInfo.latest_training_run.status)}`}>
                        {modelInfo.latest_training_run.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Started</span>
                      <span className="text-gray-300 text-xs">
                        {new Date(modelInfo.latest_training_run.started_at).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Loading model info...</p>
            )}
          </SectionCard>

          {/* Evaluation Metrics */}
          <SectionCard title="Evaluation Metrics">
            {evalMetrics ? (
              <div>
                <div className="text-xs text-gray-500 mb-3">
                  {evalMetrics.n_pairs} pairs evaluated · split: {evalMetrics.split}
                </div>
                <MetricRow label="Pearson Correlation" value={evalMetrics.pearson} target={0.80} />
                <MetricRow label="RMSE" value={evalMetrics.rmse} target={0.12} higherIsBetter={false} />
                <MetricRow label="NDCG@10" value={evalMetrics.ndcg_at_10} target={0.75} />
                <MetricRow label="Precision@5" value={evalMetrics.precision_at_5} target={0.70} />

                {evalMetrics.targets_met && (
                  <div className="mt-3 text-xs text-gray-500">
                    Targets met: {Object.values(evalMetrics.targets_met).filter(Boolean).length}/4
                  </div>
                )}
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="mt-4 w-full py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isEvaluating ? "Evaluating..." : "Re-run Evaluation"}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-sm mb-4">No evaluation data yet.</p>
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="w-full py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isEvaluating ? "Evaluating..." : "Run Evaluation"}
                </button>
              </div>
            )}
          </SectionCard>

          {/* Training Controls */}
          <SectionCard title="Training Controls">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Epochs</label>
                <input
                  type="number"
                  value={epochs}
                  min={1}
                  max={100}
                  onChange={e => setEpochs(parseInt(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Batch Size</label>
                <input
                  type="number"
                  value={batchSize}
                  min={4}
                  max={256}
                  step={4}
                  onChange={e => setBatchSize(parseInt(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Encoder LR</label>
                <input
                  type="text"
                  value={encoderLr}
                  onChange={e => setEncoderLr(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Head LR</label>
                <input
                  type="text"
                  value={headLr}
                  onChange={e => setHeadLr(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-1">
                JSONL Data Path <span className="text-gray-600">(leave empty to use DB)</span>
              </label>
              <input
                type="text"
                value={jsonlPath}
                onChange={e => setJsonlPath(e.target.value)}
                placeholder="python_ai/data/labeled/synthetic_pairs.jsonl"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-mono text-gray-300 placeholder-gray-600"
              />
            </div>

            <button
              onClick={handleStartTraining}
              disabled={isTraining}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {isTraining ? "Starting..." : "Start Training"}
            </button>

            {/* Log output */}
            {trainLog.length > 0 && (
              <div
                ref={logRef}
                className="mt-4 bg-gray-950 border border-gray-800 rounded-lg p-3 h-32 overflow-y-auto font-mono text-xs text-green-300 space-y-0.5"
              >
                {trainLog.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            {trainResult && (
              <div className="mt-3 text-xs text-gray-400 font-mono bg-gray-900 rounded p-2">
                PID: {String(trainResult.pid)} · Run: {String(trainResult.run_id || "N/A")}
              </div>
            )}
          </SectionCard>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="flex flex-col gap-6">

          {/* Data Pipeline */}
          <SectionCard title="Data Pipeline">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Jobs</span>
                <span className="font-mono text-white">{pipeline?.job_count?.toLocaleString() ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resumes</span>
                <span className="font-mono text-white">{pipeline?.resume_count?.toLocaleString() ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Training Pairs</span>
                <span className="font-mono text-white">{pipeline?.training_pair_count?.toLocaleString() ?? "—"}</span>
              </div>
            </div>

            {pipeline?.label_method_breakdown && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Label Methods</div>
                {Object.entries(pipeline.label_method_breakdown).map(([method, count]) => (
                  <div key={method} className="flex justify-between text-xs py-0.5">
                    <span className="text-gray-400">{method}</span>
                    <span className="text-gray-300">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {pipeline?.latest_run && (
              <div className={`text-xs px-2 py-1 rounded border mb-4 ${statusBadge(pipeline.latest_run.status)}`}>
                Stage: {pipeline.latest_run.stage} · {pipeline.latest_run.status}
                {pipeline.latest_run.records_processed > 0 && (
                  <span> · {pipeline.latest_run.records_processed.toLocaleString()} records</span>
                )}
              </div>
            )}

            <div className="mb-3">
              <label className="text-xs text-gray-400 block mb-1">Stage</label>
              <select
                value={pipelineStage}
                onChange={e => setPipelineStage(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
              >
                <option value="full">Full Pipeline</option>
                <option value="ingestion">Ingestion Only</option>
                <option value="parsing">Parsing Only</option>
                <option value="normalization">Normalization Only</option>
                <option value="labeling">Labeling Only</option>
                <option value="storage">Storage Only</option>
              </select>
            </div>

            <button
              onClick={handleRunPipeline}
              disabled={isPipelineRunning}
              className="w-full py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {isPipelineRunning ? "Starting..." : "Run Pipeline Stage"}
            </button>
          </SectionCard>

          {/* Industry Breakdown */}
          {pipeline?.industry_breakdown && Object.keys(pipeline.industry_breakdown).length > 0 && (
            <SectionCard title="Jobs by Industry">
              <div className="space-y-1">
                {Object.entries(pipeline.industry_breakdown)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 12)
                  .map(([industry, count]) => {
                    const max = Math.max(...Object.values(pipeline.industry_breakdown!));
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={industry} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 w-32 truncate">{industry}</span>
                        <div className="flex-1 bg-gray-900 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-gray-300 w-8 text-right">{count.toLocaleString()}</span>
                      </div>
                    );
                  })}
              </div>
            </SectionCard>
          )}

          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              <button
                onClick={loadAll}
                className="w-full py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Refresh All
              </button>
              <a
                href={`${API_BASE}/docs`}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-center"
              >
                Open API Docs ↗
              </a>
              <a
                href="/match-jobs"
                className="block w-full py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-center"
              >
                Back to Job Matcher
              </a>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
