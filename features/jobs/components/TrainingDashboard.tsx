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
  ece?: number;
  pred_stats?: { min: number; mean: number; max: number };
  n_pairs?: number;
  split?: string;
  targets_met?: Record<string, boolean>;
  deepseek_judge?: {
    n_scored: number;
    model: string;
    error?: string;
    model_vs_deepseek?: { pearson: number; rmse: number };
    label_bias?: { mean: number; direction: string };
    deepseek_mean_score?: number;
    rule_label_mean_score?: number;
  };
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
  const [isPollingLogs, setIsPollingLogs] = useState(false);
  const [logSource, setLogSource] = useState<"train" | "pipeline">("train");
  const logPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [useDeepseekEpochJudge, setUseDeepseekEpochJudge] = useState(false);
  const [deepseekEpochSample, setDeepseekEpochSample] = useState(30);
  const [deepseekBiasAlpha, setDeepseekBiasAlpha] = useState(0.25);
  // Fresh training
  const [freshTraining, setFreshTraining] = useState(false);
  const [confidenceCeiling, setConfidenceCeiling] = useState(0.75);
  const [baselineConfidence, setBaselineConfidence] = useState(0.60);
  // Dataset builder
  const [isBuildingDataset, setIsBuildingDataset] = useState(false);
  const [buildDatasetLog, setBuildDatasetLog] = useState<string[]>([]);
  const [buildLabelMode, setBuildLabelMode] = useState<"embed" | "ollama" | "rules">("embed");
  const [buildOllamaLimit, setBuildOllamaLimit] = useState(2000);
  const [embedAuxWeight, setEmbedAuxWeight] = useState(0.10);
  const buildLogRef = useRef<HTMLDivElement>(null);
  const buildLogPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Eval
  const [evalMetrics, setEvalMetrics] = useState<EvalMetrics | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [useDeepseekJudge, setUseDeepseekJudge] = useState(false);
  const [deepseekJudgeSample, setDeepseekJudgeSample] = useState(50);
  const [evalLog, setEvalLog] = useState<string[]>([]);
  const evalLogRef = useRef<HTMLDivElement>(null);
  const evalLogPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [deepseekAnalysis, setDeepseekAnalysis] = useState<{analysis: string; reasoning: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Pipeline
  const [pipelineStage, setPipelineStage] = useState("full");
  const [pairsLimit, setPairsLimit] = useState(5000);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineLog, setPipelineLog] = useState<string[]>([]);
  const pipelineLogRef = useRef<HTMLDivElement>(null);
  const [useLlm, setUseLlm] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [deepseekModels, setDeepseekModels] = useState<string[]>([]);

  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [trainLog]);
  useEffect(() => {
    if (pipelineLogRef.current) pipelineLogRef.current.scrollTop = pipelineLogRef.current.scrollHeight;
  }, [pipelineLog]);
  useEffect(() => {
    if (evalLogRef.current) evalLogRef.current.scrollTop = evalLogRef.current.scrollHeight;
  }, [evalLog]);
  useEffect(() => {
    if (buildLogRef.current) buildLogRef.current.scrollTop = buildLogRef.current.scrollHeight;
  }, [buildDatasetLog]);

  const loadAll = useCallback(async () => {
    await Promise.allSettled([
      fetch(`${API_BASE}/health`).then(r => r.json()).then(setHealth).catch(() => null),
      fetch(`${API_BASE}/model-info`).then(r => r.json()).then(setModelInfo).catch(() => null),
      fetch(`${API_BASE}/pipeline/status`).then(r => r.json()).then(setPipeline).catch(() => null),
      fetch(`${API_BASE}/evaluate/metrics`).then(r => r.json()).then(d => d.metrics && setEvalMetrics(d.metrics)).catch(() => null),
      fetch(`${API_BASE}/pipeline/ollama-status`).then(r => r.json()).then(d => {
        setOllamaAvailable(d.available);
        setDeepseekModels(d.deepseek_models || []);
      }).catch(() => null),
    ]);
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 15000);
    return () => {
      clearInterval(interval);
      stopLogPolling();
      stopEvalPolling();
      if (buildLogPollRef.current) clearInterval(buildLogPollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAll]);

  const startLogPolling = (source: "train" | "pipeline" = "train") => {
    if (logPollRef.current) clearInterval(logPollRef.current);
    setIsPollingLogs(true);
    setLogSource(source);
    let lastSize = 0;
    const endpoint = source === "pipeline" ? `${API_BASE}/pipeline/logs?tail=200` : `${API_BASE}/train/logs?tail=200`;
    logPollRef.current = setInterval(async () => {
      try {
        const resp = await fetch(endpoint);
        const data = await resp.json();
        if (data.exists && data.size !== lastSize) {
          lastSize = data.size;
          setTrainLog(data.lines);
        }
      } catch {
        // API might be restarting
      }
    }, 2000);
  };

  const stopLogPolling = () => {
    if (logPollRef.current) {
      clearInterval(logPollRef.current);
      logPollRef.current = null;
    }
    setIsPollingLogs(false);
  };

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
      // Default JSONL to unified dataset path when fresh training
      const resolvedJsonl = jsonlPath.trim() ||
        (freshTraining ? "python_ai/data/labeled/unified_training_pairs.jsonl" : "");
      if (resolvedJsonl) payload.jsonl_path = resolvedJsonl;
      if (useDeepseekEpochJudge) {
        payload.use_deepseek_judge = true;
        payload.deepseek_epoch_sample = deepseekEpochSample;
        payload.deepseek_bias_alpha = deepseekBiasAlpha;
      }
      if (freshTraining) {
        payload.fresh = true;
        payload.confidence_ceiling = confidenceCeiling;
        payload.baseline_confidence = baselineConfidence;
      }
      payload.embed_aux_weight = embedAuxWeight;

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
        `--- live log below ---`,
      ]);
      startLogPolling();
    } catch (e) {
      setTrainLog(prev => [...prev, `[ERROR] ${e}`]);
    } finally {
      setIsTraining(false);
    }
  };

  const stopEvalPolling = () => {
    if (evalLogPollRef.current) { clearInterval(evalLogPollRef.current); evalLogPollRef.current = null; }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setEvalLog([`[${new Date().toLocaleTimeString()}] Launching evaluation...`]);
    stopEvalPolling();

    try {
      const base = jsonlPath.trim()
        ? `?jsonl_path=${encodeURIComponent(jsonlPath)}&split=test`
        : `?split=test`;
      const judgeParams = useDeepseekJudge
        ? `&use_deepseek=true&deepseek_sample=${deepseekJudgeSample}&deepseek_model=deepseek-r1:7b`
        : "";
      await fetch(`${API_BASE}/evaluate${base}${judgeParams}`, { method: "POST" });

      // Poll evaluate.log until "Metrics saved" appears
      let lastSize = 0;
      let staleCount = 0;
      evalLogPollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API_BASE}/evaluate/logs?tail=400`);
          const d = await r.json();
          if (d.exists) {
            if (d.size !== lastSize) {
              lastSize = d.size;
              staleCount = 0;
              setEvalLog(d.lines);
              // Check for completion signal
              if (d.lines.some((l: string) => l.includes("Metrics saved"))) {
                stopEvalPolling();
                setIsEvaluating(false);
                // Fetch final metrics
                const mr = await fetch(`${API_BASE}/evaluate/metrics`);
                const md = await mr.json();
                if (md.metrics) setEvalMetrics(md.metrics);
              }
            } else {
              staleCount++;
              if (staleCount > 20) { // 40s stale → give up
                stopEvalPolling();
                setIsEvaluating(false);
              }
            }
          }
        } catch { /* ignore */ }
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsEvaluating(false);
    }
  };

  const handleRunPipeline = async () => {
    setIsPipelineRunning(true);
    setPipelineError(null);
    setPipelineLog([
      `[${new Date().toLocaleTimeString()}] Connecting to API...`,
    ]);
    try {
      const params = new URLSearchParams({ stage: pipelineStage, use_llm: String(useLlm), pairs_limit: String(pairsLimit) });
      const resp = await fetch(`${API_BASE}/pipeline/run?${params}`, { method: "POST" });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`API error ${resp.status}: ${text}`);
      }
      const data = await resp.json();
      setPipelineLog([
        `[${new Date().toLocaleTimeString()}] Pipeline launched — stage: ${data.stage}`,
        useLlm
          ? `[${new Date().toLocaleTimeString()}] Labeling with DeepSeek (deepseek-r1:7b) — ~3s/pair...`
          : `[${new Date().toLocaleTimeString()}] Labeling with rule-based method...`,
        `--- streaming log below ---`,
      ]);
      // Also feed into training controls log tab
      setTrainLog([
        `[${new Date().toLocaleTimeString()}] Pipeline started — stage: ${pipelineStage}`,
        `--- live log below ---`,
      ]);
      setLogSource("pipeline");
      // Poll pipeline.log every 2s and update both log states
      if (logPollRef.current) clearInterval(logPollRef.current);
      setIsPollingLogs(true);
      let lastSize = 0;
      let staleCount = 0;
      logPollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API_BASE}/pipeline/logs?tail=300`);
          const d = await r.json();
          if (d.exists) {
            if (d.size !== lastSize) {
              lastSize = d.size;
              staleCount = 0;
              setPipelineLog(d.lines);
              setTrainLog(d.lines);
            } else {
              staleCount++;
              // If no new lines for 30s after process started, assume done
              if (staleCount > 15 && d.size > 3) {
                stopLogPolling();
                setIsPipelineRunning(false);
                setPipelineLog(prev => [...prev, `--- Pipeline finished ---`]);
                setTimeout(loadAll, 1000);
              }
            }
          }
        } catch {
          // API might be restarting
        }
      }, 2000);
      setTimeout(loadAll, 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setPipelineError(msg);
      setPipelineLog(prev => [...prev, `[ERROR] ${msg}`]);
      setIsPipelineRunning(false);
    }
  };

  const handleBuildDataset = async () => {
    setIsBuildingDataset(true);
    setBuildDatasetLog([`[${new Date().toLocaleTimeString()}] Starting dataset builder...`]);
    if (buildLogPollRef.current) clearInterval(buildLogPollRef.current);

    try {
      const params = new URLSearchParams({
        use_embed: String(buildLabelMode === "embed"),
        use_ollama: String(buildLabelMode === "ollama" && ollamaAvailable),
        ollama_limit: String(buildOllamaLimit),
      });
      const resp = await fetch(`${API_BASE}/build-dataset?${params}`, { method: "POST" });
      const data = await resp.json();
      setBuildDatasetLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Builder launched (PID: ${data.pid})`,
        `--- live log below ---`,
      ]);

      let lastSize = 0;
      let staleCount = 0;
      buildLogPollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API_BASE}/build-dataset/logs?tail=300`);
          const d = await r.json();
          if (d.exists) {
            if (d.size !== lastSize) {
              lastSize = d.size;
              staleCount = 0;
              setBuildDatasetLog(d.lines);
            } else {
              staleCount++;
              if (staleCount > 30 && d.size > 3) {
                clearInterval(buildLogPollRef.current!);
                buildLogPollRef.current = null;
                setIsBuildingDataset(false);
                setBuildDatasetLog(prev => [...prev, `--- Build complete ---`]);
              }
            }
          }
        } catch { /* ignore */ }
      }, 2000);
    } catch (e) {
      setBuildDatasetLog(prev => [...prev, `[ERROR] ${e}`]);
      setIsBuildingDataset(false);
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
                {/* Summary banner */}
                {evalMetrics.targets_met && (() => {
                  const met = Object.values(evalMetrics.targets_met).filter(Boolean).length;
                  const total = Object.values(evalMetrics.targets_met).length;
                  const allGood = met === total;
                  return (
                    <div className={`mb-4 px-3 py-2.5 rounded-lg border text-sm ${allGood ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"}`}>
                      <div className="font-semibold mb-0.5">{allGood ? "Model is performing well" : "Model needs more training"}</div>
                      <div className="text-xs opacity-80">
                        {allGood
                          ? `All ${total} quality targets passed — ready for production use.`
                          : `${met}/${total} targets passed — consider retraining with more data or epochs.`}
                      </div>
                    </div>
                  );
                })()}

                <div className="text-xs text-gray-500 mb-3">
                  Tested on <span className="text-gray-300 font-medium">{evalMetrics.n_pairs?.toLocaleString()}</span> resume–job pairs held out from training
                </div>

                {/* Metric cards */}
                <div className="space-y-3 mb-4">
                  {/* Pearson */}
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-sm font-medium text-white">Match Accuracy</div>
                        <div className="text-xs text-gray-500">Pearson Correlation</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold font-mono ${metricColor(evalMetrics.pearson, 0.80)}`}>
                          {evalMetrics.pearson !== undefined ? `${(evalMetrics.pearson * 100).toFixed(1)}%` : "—"}
                        </div>
                        <div className="text-xs text-gray-500">target &gt;80%</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      How well the AI&apos;s match scores agree with the expected scores. <strong className="text-gray-300">97% means the AI almost always ranks better-fit candidates higher.</strong>
                    </p>
                  </div>

                  {/* RMSE */}
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-sm font-medium text-white">Score Precision</div>
                        <div className="text-xs text-gray-500">RMSE (lower is better)</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold font-mono ${metricColor(evalMetrics.rmse, 0.12, false)}`}>
                          {fmt(evalMetrics.rmse)}
                        </div>
                        <div className="text-xs text-gray-500">target &lt;0.12</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Average error in the match score (0–1 scale). <strong className="text-gray-300">0.044 means scores are off by only ±4.4% on average</strong> — very precise.
                    </p>
                  </div>

                  {/* NDCG */}
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-sm font-medium text-white">Top-10 Ranking Quality</div>
                        <div className="text-xs text-gray-500">NDCG@10</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold font-mono ${metricColor(evalMetrics.ndcg_at_10, 0.75)}`}>
                          {evalMetrics.ndcg_at_10 !== undefined ? `${(evalMetrics.ndcg_at_10 * 100).toFixed(1)}%` : "—"}
                        </div>
                        <div className="text-xs text-gray-500">target &gt;75%</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      How well the AI orders the top 10 job recommendations. <strong className="text-gray-300">97% means the best jobs almost always appear at the top of the list.</strong>
                    </p>
                  </div>

                  {/* Precision@5 */}
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-sm font-medium text-white">Top-5 Relevance</div>
                        <div className="text-xs text-gray-500">Precision@5</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold font-mono ${metricColor(evalMetrics.precision_at_5, 0.70)}`}>
                          {evalMetrics.precision_at_5 !== undefined ? `${(evalMetrics.precision_at_5 * 100).toFixed(1)}%` : "—"}
                        </div>
                        <div className="text-xs text-gray-500">target &gt;70%</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Of the top 5 jobs shown to a user, how many are genuinely good matches. <strong className="text-gray-300">100% means every single top-5 recommendation is relevant.</strong>
                    </p>
                  </div>

                  {/* ECE + Confidence Range */}
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-sm font-medium text-white">Calibration Quality</div>
                        <div className="text-xs text-gray-500">ECE (lower is better)</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold font-mono ${metricColor(evalMetrics.ece, 0.10, false)}`}>
                          {fmt(evalMetrics.ece)}
                        </div>
                        <div className="text-xs text-gray-500">target &lt;0.10</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">
                      Expected Calibration Error — how well confidence scores reflect reality. A model with ECE=0.05 means its 70%-confident predictions are correct ~70% of the time.
                    </p>
                    {evalMetrics.pred_stats && (
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-gray-500">Confidence range:</span>
                        <span className="text-orange-300">{(evalMetrics.pred_stats.min * 100).toFixed(1)}%</span>
                        <span className="text-gray-600">→</span>
                        <span className="text-yellow-300">{(evalMetrics.pred_stats.mean * 100).toFixed(1)}% avg</span>
                        <span className="text-gray-600">→</span>
                        <span className="text-green-300">{(evalMetrics.pred_stats.max * 100).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {evalMetrics.targets_met && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <div className="flex gap-1">
                      {Object.entries(evalMetrics.targets_met).map(([key, met]) => (
                        <div key={key} className={`w-2 h-2 rounded-full ${met ? "bg-green-400" : "bg-red-400"}`} />
                      ))}
                    </div>
                    <span>{Object.values(evalMetrics.targets_met).filter(Boolean).length}/{Object.values(evalMetrics.targets_met).length} targets met</span>
                  </div>
                )}

                {/* DeepSeek Judge toggle */}
                {ollamaAvailable && (
                  <div className="mb-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-medium text-purple-300">DeepSeek Independent Judge</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          DeepSeek scores a sample of pairs independently — reveals if your training labels are biased.
                        </p>
                      </div>
                      <button
                        onClick={() => setUseDeepseekJudge(v => !v)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useDeepseekJudge ? "bg-purple-600" : "bg-gray-600"}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useDeepseekJudge ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                    {useDeepseekJudge && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400 shrink-0">Pairs to judge:</span>
                        <input
                          type="number"
                          value={deepseekJudgeSample}
                          min={5}
                          max={500}
                          step={5}
                          onChange={e => setDeepseekJudgeSample(Math.max(5, parseInt(e.target.value) || 25))}
                          className="w-20 bg-gray-900 border border-purple-500/40 rounded px-2 py-0.5 text-xs text-white font-mono"
                        />
                        <span className="text-xs text-gray-500">
                          ~{Math.round(deepseekJudgeSample * 3 / 60)} min
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="flex-1 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {isEvaluating
                      ? useDeepseekJudge ? "Evaluating + Judging..." : "Evaluating..."
                      : "Re-run Evaluation"}
                  </button>
                  {ollamaAvailable && (
                    <button
                      onClick={async () => {
                        setIsAnalyzing(true);
                        try {
                          const resp = await fetch(`${API_BASE}/evaluate/analyze`, { method: "POST" });
                          const data = await resp.json();
                          setDeepseekAnalysis(data);
                          setShowReasoning(false);
                        } catch (e) { console.error(e); }
                        finally { setIsAnalyzing(false); }
                      }}
                      disabled={isAnalyzing}
                      className="flex-1 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-colors"
                    >
                      {isAnalyzing ? "Thinking..." : "Analyze with DeepSeek"}
                    </button>
                  )}
                </div>

                {/* Eval Log Terminal */}
                {(isEvaluating || evalLog.length > 0) && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 font-mono">
                        eval log{" "}
                        {isEvaluating && (
                          <span className={`animate-pulse ${useDeepseekJudge ? "text-purple-400" : "text-indigo-400"}`}>● live</span>
                        )}
                      </span>
                      <button onClick={() => setEvalLog([])} className="text-xs text-gray-600 hover:text-gray-400">clear</button>
                    </div>
                    <div
                      ref={evalLogRef}
                      className="bg-gray-950 border border-gray-800 rounded-lg p-2 h-44 overflow-y-auto font-mono text-xs space-y-0.5"
                    >
                      {evalLog.map((line, i) => (
                        <div key={i} className={
                          /error|traceback|failed/i.test(line) ? "text-red-400" :
                          /warning|warn/i.test(line) ? "text-yellow-400" :
                          /\[DeepSeek Think\]/i.test(line) ? "text-purple-400/70 italic pl-3" :
                          /\[deepseek/i.test(line) ? "text-purple-300" :
                          /metrics saved|targets met/i.test(line) ? "text-green-400" :
                          /Evaluate|evaluated \d+/i.test(line) ? "text-cyan-300" :
                          "text-gray-300"
                        }>{
                          /\[DeepSeek Think\]/i.test(line)
                            ? <><span className="text-purple-500 not-italic">🧠</span> {line.replace(/^\[DeepSeek Think\]\s*/i, "")}</>
                            : line
                        }</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DeepSeek Judge Results */}
                {evalMetrics.deepseek_judge && !evalMetrics.deepseek_judge.error && (
                  <div className="mt-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <div className="text-xs font-medium text-purple-300 mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      DeepSeek Judge Results
                      <span className="ml-auto text-gray-500 font-normal">{evalMetrics.deepseek_judge.n_scored} pairs scored</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-gray-800/60 rounded p-2">
                        <div className="text-xs text-gray-500 mb-0.5">Model vs DeepSeek Pearson</div>
                        <div className={`text-sm font-bold font-mono ${(evalMetrics.deepseek_judge.model_vs_deepseek?.pearson ?? 0) >= 0.7 ? "text-green-400" : (evalMetrics.deepseek_judge.model_vs_deepseek?.pearson ?? 0) >= 0.5 ? "text-yellow-400" : "text-red-400"}`}>
                          {((evalMetrics.deepseek_judge.model_vs_deepseek?.pearson ?? 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">How well model agrees with DeepSeek</div>
                      </div>
                      <div className="bg-gray-800/60 rounded p-2">
                        <div className="text-xs text-gray-500 mb-0.5">Model vs DeepSeek RMSE</div>
                        <div className={`text-sm font-bold font-mono ${(evalMetrics.deepseek_judge.model_vs_deepseek?.rmse ?? 1) < 0.15 ? "text-green-400" : (evalMetrics.deepseek_judge.model_vs_deepseek?.rmse ?? 1) < 0.25 ? "text-yellow-400" : "text-red-400"}`}>
                          {(evalMetrics.deepseek_judge.model_vs_deepseek?.rmse ?? 0).toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">Average score error vs DeepSeek</div>
                      </div>
                    </div>
                    <div className={`text-xs rounded px-2 py-1.5 ${
                      evalMetrics.deepseek_judge.label_bias?.direction?.includes("well-calibrated")
                        ? "bg-green-500/10 text-green-300"
                        : "bg-yellow-500/10 text-yellow-300"
                    }`}>
                      <strong>Label bias:</strong> {evalMetrics.deepseek_judge.label_bias?.direction}
                      {" "}(mean delta: {(evalMetrics.deepseek_judge.label_bias?.mean ?? 0) > 0 ? "+" : ""}{evalMetrics.deepseek_judge.label_bias?.mean?.toFixed(4)})
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>DeepSeek avg: <span className="text-gray-300">{evalMetrics.deepseek_judge.deepseek_mean_score?.toFixed(3)}</span></span>
                      <span>Rule-label avg: <span className="text-gray-300">{evalMetrics.deepseek_judge.rule_label_mean_score?.toFixed(3)}</span></span>
                    </div>
                  </div>
                )}

                {/* DeepSeek Text Analysis */}
                {deepseekAnalysis && (
                  <div className="mt-3 bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        DeepSeek Analysis
                      </span>
                      {deepseekAnalysis.reasoning && (
                        <button
                          onClick={() => setShowReasoning(v => !v)}
                          className="text-xs text-purple-400/60 hover:text-purple-300 transition-colors"
                        >
                          {showReasoning ? "hide reasoning" : "show reasoning"}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {deepseekAnalysis.analysis}
                    </p>
                    {showReasoning && deepseekAnalysis.reasoning && (
                      <div className="mt-2 pt-2 border-t border-purple-500/20">
                        <div className="text-xs text-purple-400/50 mb-1">Chain of thought:</div>
                        <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap italic">
                          {deepseekAnalysis.reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-400 text-sm mb-1">No evaluation data yet.</p>
                <p className="text-gray-600 text-xs mb-4">Run evaluation to see how well the AI matches resumes to jobs.</p>
                {ollamaAvailable && (
                  <div className="mb-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs font-medium text-purple-300">DeepSeek Independent Judge</span>
                        <p className="text-xs text-gray-500 mt-0.5">Scores a sample of pairs to detect label bias.</p>
                      </div>
                      <button
                        onClick={() => setUseDeepseekJudge(v => !v)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useDeepseekJudge ? "bg-purple-600" : "bg-gray-600"}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useDeepseekJudge ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                    {useDeepseekJudge && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 shrink-0">Pairs:</span>
                        <input
                          type="number"
                          value={deepseekJudgeSample}
                          min={5}
                          max={500}
                          step={5}
                          onChange={e => setDeepseekJudgeSample(Math.max(5, parseInt(e.target.value) || 25))}
                          className="w-20 bg-gray-900 border border-purple-500/40 rounded px-2 py-0.5 text-xs text-white font-mono"
                        />
                        <span className="text-xs text-gray-500">~{Math.round(deepseekJudgeSample * 3 / 60)} min</span>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="w-full py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isEvaluating ? (useDeepseekJudge ? "Evaluating + Judging..." : "Evaluating...") : "Run Evaluation"}
                </button>
                {(isEvaluating || evalLog.length > 0) && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 font-mono">
                        eval log{" "}
                        {isEvaluating && <span className="animate-pulse text-indigo-400">● live</span>}
                      </span>
                      <button onClick={() => setEvalLog([])} className="text-xs text-gray-600 hover:text-gray-400">clear</button>
                    </div>
                    <div
                      ref={evalLogRef}
                      className="bg-gray-950 border border-gray-800 rounded-lg p-2 h-44 overflow-y-auto font-mono text-xs space-y-0.5"
                    >
                      {evalLog.map((line, i) => (
                        <div key={i} className={
                          /error|traceback/i.test(line) ? "text-red-400" :
                          /\[DeepSeek Think\]/i.test(line) ? "text-purple-400/70 italic pl-3" :
                          /\[deepseek/i.test(line) ? "text-purple-300" :
                          /metrics saved/i.test(line) ? "text-green-400" :
                          /Evaluate|evaluated/i.test(line) ? "text-cyan-300" :
                          "text-gray-300"
                        }>{
                          /\[DeepSeek Think\]/i.test(line)
                            ? <><span className="text-purple-500 not-italic">🧠</span> {line.replace(/^\[DeepSeek Think\]\s*/i, "")}</>
                            : line
                        }</div>
                      ))}
                    </div>
                  </div>
                )}
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

            {/* DeepSeek Epoch Judge */}
            <div className="mb-4 border border-purple-700/40 rounded-xl p-3 bg-purple-950/20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-purple-300">DeepSeek Epoch Judge</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Judges model output after each epoch and shifts training labels toward realistic scores
                  </p>
                </div>
                <button
                  onClick={() => setUseDeepseekEpochJudge(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${useDeepseekEpochJudge ? "bg-purple-600" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${useDeepseekEpochJudge ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {useDeepseekEpochJudge && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Pairs / epoch</label>
                    <input
                      type="number"
                      value={deepseekEpochSample}
                      min={1}
                      max={50}
                      onChange={e => setDeepseekEpochSample(parseInt(e.target.value) || 10)}
                      className="w-full bg-gray-900 border border-purple-800/50 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Bias strength α <span className="text-gray-600">(0–1)</span>
                    </label>
                    <input
                      type="number"
                      value={deepseekBiasAlpha}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={e => setDeepseekBiasAlpha(parseFloat(e.target.value) || 0.3)}
                      className="w-full bg-gray-900 border border-purple-800/50 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div className="col-span-2 text-xs text-gray-500">
                    ~{Math.round(epochs * deepseekEpochSample * 3)}s added to total training time
                  </div>
                </div>
              )}
            </div>

            {/* Fresh Training */}
            <div className="mb-4 border border-orange-700/40 rounded-xl p-3 bg-orange-950/20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-orange-300">Fresh Training</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Wipes existing checkpoint, resets model to ~60% baseline, trains from scratch on real datasets
                  </p>
                </div>
                <button
                  onClick={() => setFreshTraining(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${freshTraining ? "bg-orange-600" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${freshTraining ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {freshTraining && (
                <div className="space-y-3 mt-2">
                  <div className="p-2 bg-orange-900/30 border border-orange-600/30 rounded-lg text-xs text-orange-200">
                    This will <strong>permanently delete</strong> the current checkpoint and start over. The model will predict ~{(baselineConfidence * 100).toFixed(0)}% by default until trained.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Baseline Confidence <span className="text-orange-400">(start)</span>
                      </label>
                      <input
                        type="number"
                        value={baselineConfidence}
                        min={0.40}
                        max={0.70}
                        step={0.05}
                        onChange={e => setBaselineConfidence(parseFloat(e.target.value) || 0.60)}
                        className="w-full bg-gray-900 border border-orange-700/50 rounded-lg px-3 py-1.5 text-sm font-mono text-white"
                      />
                      <p className="text-xs text-gray-600 mt-0.5">Untrained model default</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Confidence Ceiling <span className="text-orange-400">(label cap)</span>
                      </label>
                      <input
                        type="number"
                        value={confidenceCeiling}
                        min={0.50}
                        max={0.90}
                        step={0.05}
                        onChange={e => setConfidenceCeiling(parseFloat(e.target.value) || 0.75)}
                        className="w-full bg-gray-900 border border-orange-700/50 rounded-lg px-3 py-1.5 text-sm font-mono text-white"
                      />
                      <p className="text-xs text-gray-600 mt-0.5">Max training label (earn higher via judge)</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-900/60 rounded p-2 font-mono">
                    Dataset: python_ai/data/labeled/unified_training_pairs.jsonl
                    <span className="text-orange-400/60 ml-1">(auto-selected)</span>
                  </div>
                </div>
              )}

              {/* Embedding auxiliary loss — always active */}
              <div className="mt-3 p-3 rounded-lg border border-teal-600/40 bg-teal-900/15">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <label className="text-xs font-medium text-teal-300">
                    Vector Embedding Loss Weight
                  </label>
                  <span className="text-xs text-teal-500 ml-auto">always active</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={embedAuxWeight}
                    min={0.05}
                    max={0.5}
                    step={0.05}
                    onChange={e => setEmbedAuxWeight(Math.max(0.05, parseFloat(e.target.value) || 0.10))}
                    className="w-24 bg-gray-900 border border-teal-600/50 rounded-lg px-3 py-1.5 text-sm font-mono text-white"
                  />
                  <p className="text-xs text-gray-500">
                    Bi-encoder cosine similarity regularizer. Pre-computed once on CPU before training.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTraining}
              disabled={isTraining}
              className={`w-full py-2.5 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${freshTraining ? "bg-orange-600 hover:bg-orange-500" : "bg-green-600 hover:bg-green-500"}`}
            >
              {isTraining ? "Starting..." : freshTraining ? "Start Fresh Training" : "Start Training"}
            </button>

            {/* Log output */}
            {trainLog.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-mono">
                    {logSource === "pipeline" ? "pipeline log" : "training log"}{" "}
                    {isPollingLogs && (
                      <span className={`animate-pulse ${logSource === "pipeline" ? "text-purple-400" : "text-green-400"}`}>
                        ● live
                      </span>
                    )}
                  </span>
                  {isPollingLogs && (
                    <button
                      onClick={stopLogPolling}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      stop polling
                    </button>
                  )}
                </div>
                <div
                  ref={logRef}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs text-green-300 space-y-0.5"
                >
                  {trainLog.map((line, i) => (
                    <div key={i} className={
                      /error|traceback|failed/i.test(line) ? "text-red-400" :
                      /warning|warn/i.test(line) ? "text-yellow-400" :
                      /\[DeepSeek Think\]/i.test(line) ? "text-purple-400/70 italic pl-3" :
                      /\[DeepSeek Epoch/i.test(line) ? "text-purple-300 font-medium" :
                      /\[deepseek\]/i.test(line) ? "text-purple-300" :
                      /epoch \d+/i.test(line) ? "text-cyan-300" :
                      /conf=0\.[89]\d|conf=1\.0/i.test(line) ? "text-green-300" :
                      /conf=0\.[0-4]\d/i.test(line) ? "text-orange-300" :
                      "text-green-300"
                    }>{
                      /\[DeepSeek Think\]/i.test(line)
                        ? <><span className="text-purple-500 not-italic">🧠</span> {line.replace(/^\[DeepSeek Think\]\s*/i, "")}</>
                        : line
                    }</div>
                  ))}
                </div>
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

          {/* Build Dataset */}
          <SectionCard title="Build Dataset">
            <p className="text-xs text-gray-500 mb-3">
              Processes all CSV/JSONL files from <span className="font-mono text-gray-400">python_ai/datasets/</span>,
              labels unlabeled pairs, and writes the unified training JSONL.
              Run this before Fresh Training.
            </p>

            {/* Labeling mode selector */}
            <div className="mb-3 p-3 rounded-lg border border-gray-700/50 bg-gray-900/30">
              <div className="text-xs font-medium text-gray-300 mb-2">Labeling Mode</div>
              <div className="flex gap-1">
                {(["embed", "ollama", "rules"] as const).map(mode => {
                  const labels = { embed: "Embed (fast)", ollama: "Ollama (LLM)", rules: "Rules only" };
                  const colors = {
                    embed: "bg-teal-600 text-white",
                    ollama: "bg-purple-600 text-white",
                    rules: "bg-gray-600 text-white",
                  };
                  const disabled = mode === "ollama" && !ollamaAvailable;
                  return (
                    <button
                      key={mode}
                      onClick={() => setBuildLabelMode(mode)}
                      disabled={disabled}
                      className={`flex-1 py-1 text-xs rounded transition-colors disabled:opacity-40
                        ${buildLabelMode === mode ? colors[mode] : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                    >
                      {labels[mode]}
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-1.5">
                {buildLabelMode === "embed" && "GPU-batched cosine similarity via sentence-transformers. ~40K pairs in <2 min."}
                {buildLabelMode === "ollama" && (ollamaAvailable
                  ? `LLM ensemble (${deepseekModels.slice(0,2).join(", ") || "models"}). Slow but richest signal.`
                  : "Ollama not running.")}
                {buildLabelMode === "rules" && "Fast rule/heuristic labels. No GPU or LLM needed."}
              </div>
              {buildLabelMode === "ollama" && ollamaAvailable && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400 shrink-0">Pairs limit:</span>
                  <input
                    type="number"
                    value={buildOllamaLimit}
                    min={100} max={10000} step={100}
                    onChange={e => setBuildOllamaLimit(parseInt(e.target.value) || 2000)}
                    className="w-24 bg-gray-900 border border-purple-500/40 rounded px-2 py-0.5 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-gray-500">~{Math.round(buildOllamaLimit * 3 / 60)} min</span>
                </div>
              )}
            </div>

            <button
              onClick={handleBuildDataset}
              disabled={isBuildingDataset}
              className="w-full py-2 text-sm rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-colors"
            >
              {isBuildingDataset
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
                    Building dataset...
                  </span>
                : "Build Unified Dataset"}
            </button>

            {buildDatasetLog.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-mono">
                    builder log {isBuildingDataset && <span className="animate-pulse text-teal-400">● live</span>}
                  </span>
                  <button onClick={() => setBuildDatasetLog([])} className="text-xs text-gray-600 hover:text-gray-400">clear</button>
                </div>
                <div
                  ref={buildLogRef}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-2 h-40 overflow-y-auto font-mono text-xs space-y-0.5"
                >
                  {buildDatasetLog.map((line, i) => (
                    <div key={i} className={
                      /error|traceback|failed/i.test(line) ? "text-red-400" :
                      /warning|warn/i.test(line) ? "text-yellow-400" :
                      /complete|saved|written/i.test(line) ? "text-green-400" :
                      /\[Ensemble\]/i.test(line) ? "text-purple-300" :
                      /\[Builder\]/i.test(line) ? "text-teal-300" :
                      "text-gray-300"
                    }>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

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

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
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
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Pairs Limit
                  {useLlm && <span className="ml-1 text-purple-400">· DeepSeek ~{Math.round(pairsLimit * 3 / 60)}min</span>}
                </label>
                <input
                  type="number"
                  value={pairsLimit}
                  min={10}
                  max={50000}
                  step={50}
                  onChange={e => setPairsLimit(Math.max(10, parseInt(e.target.value) || 500))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                />
              </div>
            </div>

            {/* DeepSeek LLM Labeling Toggle */}
            <div className={`mb-3 p-3 rounded-lg border ${ollamaAvailable ? "border-purple-500/30 bg-purple-500/5" : "border-gray-700/50 bg-gray-900/30"}`}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-xs font-medium text-white flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${ollamaAvailable ? "bg-purple-400" : "bg-gray-600"}`} />
                    DeepSeek Labeling
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {ollamaAvailable
                      ? `Ollama ready · ${deepseekModels[0] || "deepseek-r1:7b"}`
                      : "Ollama not running — using rule-based labels"}
                  </div>
                </div>
                <button
                  onClick={() => setUseLlm(v => !v)}
                  disabled={!ollamaAvailable}
                  className={`relative w-10 h-5 rounded-full transition-colors ${useLlm && ollamaAvailable ? "bg-purple-600" : "bg-gray-700"} disabled:opacity-40`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${useLlm && ollamaAvailable ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {useLlm && ollamaAvailable && (
                <p className="text-xs text-purple-300/70 mt-1">
                  DeepSeek will score each pair. Slower (~3s/pair) but produces more realistic confidence scores than rule-based labeling.
                </p>
              )}
            </div>

            <button
              onClick={handleRunPipeline}
              disabled={isPipelineRunning}
              className={`w-full py-2 text-sm rounded-lg disabled:opacity-50 transition-colors ${useLlm ? "bg-purple-600 hover:bg-purple-500" : "bg-blue-600 hover:bg-blue-500"}`}
            >
              {isPipelineRunning
                ? <span className="flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${useLlm ? "bg-purple-300" : "bg-blue-300"}`} />
                    {useLlm ? "DeepSeek labeling in progress..." : "Pipeline running..."}
                  </span>
                : useLlm ? "Run Pipeline (DeepSeek)" : "Run Pipeline Stage"}
            </button>

            {/* Pipeline error */}
            {pipelineError && (
              <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {pipelineError}
              </div>
            )}

            {/* Inline pipeline log */}
            {pipelineLog.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-mono">
                    pipeline log{" "}
                    {isPipelineRunning && (
                      <span className={`animate-pulse ${useLlm ? "text-purple-400" : "text-blue-400"}`}>● live</span>
                    )}
                  </span>
                  <button
                    onClick={() => { setPipelineLog([]); setPipelineError(null); }}
                    className="text-xs text-gray-600 hover:text-gray-400"
                  >
                    clear
                  </button>
                </div>
                <div
                  ref={pipelineLogRef}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-2 h-48 overflow-y-auto font-mono text-xs space-y-0.5"
                >
                  {pipelineLog.map((line, i) => (
                    <div key={i} className={
                      /error|traceback|failed/i.test(line) ? "text-red-400" :
                      /warning|warn/i.test(line) ? "text-yellow-400" :
                      /\[DeepSeek Think\]/i.test(line) ? "text-purple-400/70 italic pl-3" :
                      /\[deepseek\]/i.test(line) ? "text-purple-300" :
                      /done\.|finished|saved to/i.test(line) ? "text-green-400" :
                      "text-gray-300"
                    }>{
                      /\[DeepSeek Think\]/i.test(line)
                        ? <><span className="text-purple-500 not-italic">🧠</span> {line.replace(/^\[DeepSeek Think\]\s*/i, "")}</>
                        : line
                    }</div>
                  ))}
                </div>
              </div>
            )}
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
