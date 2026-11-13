import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Layers,
  TrendingDown,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart,
  GitBranch,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { ModelInfo, Experiment } from '../types';

export const ModelInsightsPage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getModelInfo(), api.getModelExperiments()])
      .then(([info, expList]) => {
        if (!isMounted) return;
        setModelInfo(info);
        setExperiments(expList);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Format training history for Recharts
  const historyData =
    modelInfo?.training_history?.loss?.map((lossVal, idx) => ({
      epoch: idx + 1,
      training_loss: Number(lossVal.toFixed(4)),
      val_loss: Number(modelInfo.training_history.val_loss[idx]?.toFixed(4) || lossVal),
    })) || [];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Model Architecture & Empirical Intelligence
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Keras 3 // Deep Neural Net
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Transparent, fully reproducible technical insights into the SmartAir artificial neural network,
              including data leakage prevention, hyperparameter ablation studies, and comparative performance.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner label="Retrieving model architecture and evaluation artifacts..." />
          ) : (
            <>
              {/* Architecture Blueprint Card */}
              <div className="p-6 rounded-2xl border border-border surface-card space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Feedforward Artificial Neural Network (MLP) Specification
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Input: (7, 91) &rarr; Output: (1,)
                  </span>
                </div>

                {/* Layer Progression Diagram */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  {[
                    {
                      layer: 'Input Window',
                      shape: '7 days × 91 features',
                      sub: '11 pollutants, calendar, stations',
                      badge: 'Input',
                    },
                    {
                      layer: 'Flatten Layer',
                      shape: '637 elements',
                      sub: 'Sequential representation vector',
                      badge: 'Vectorize',
                    },
                    {
                      layer: 'Dense Layer 1',
                      shape: '128 neurons',
                      sub: 'ReLU activation + Dropout (0.2)',
                      badge: 'Nonlinear',
                    },
                    {
                      layer: 'Dense Layer 2',
                      shape: '64 neurons',
                      sub: 'ReLU activation + Dropout (0.2)',
                      badge: 'Representation',
                    },
                    {
                      layer: 'Output Neuron',
                      shape: '1 continuous unit',
                      sub: 'Linear regression activation',
                      badge: 'Regression',
                    },
                    {
                      layer: 'Inverse Scaler',
                      shape: 'StandardScaler',
                      sub: 'Inverts z-score to AQI points',
                      badge: 'Post-process',
                    },
                  ].map((step, idx) => (
                    <div
                      key={step.layer}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          0{idx + 1}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {step.badge}
                        </span>
                      </div>
                      <div className="font-semibold text-white text-xs">{step.layer}</div>
                      <div className="font-mono text-[11px] text-slate-300">{step.shape}</div>
                      <div className="text-[10px] text-slate-500 leading-snug">{step.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Training Hyperparameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Optimizer</span>
                    <div className="text-sm font-bold font-mono text-white mt-1">Adam (lr = 0.0001)</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Objective / Loss</span>
                    <div className="text-sm font-bold font-mono text-white mt-1">Mean Squared Error (MSE)</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Batch Size / Epochs</span>
                    <div className="text-sm font-bold font-mono text-white mt-1">32 batch / EarlyStop (p=12)</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Trainable Parameters</span>
                    <div className="text-sm font-bold font-mono text-emerald-400 mt-1">89,985 params (351 KB)</div>
                  </div>
                </div>
              </div>

              {/* Held-out Test Evaluation Comparison */}
              <div className="p-6 rounded-2xl border border-emerald-500/30 surface-card space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Held-Out Test Set Evaluation vs. Persistence Baseline
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evaluated on 26,137 test samples strictly occurring after September 3, 2019
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                    +{modelInfo?.metrics?.rmse_improvement_percent ?? 15.47}% RMSE Improvement
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Persistence Baseline */}
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        Naive Persistence Baseline
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Tomorrow AQI = Day 7 AQI
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-500">RMSE</div>
                        <div className="font-mono font-bold text-slate-300 text-sm mt-0.5">
                          {modelInfo?.metrics?.test_persistence?.RMSE ?? 47.45}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-500">MAE</div>
                        <div className="font-mono font-bold text-slate-300 text-sm mt-0.5">
                          {modelInfo?.metrics?.test_persistence?.MAE ?? 28.56}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-500">MSE</div>
                        <div className="font-mono font-bold text-slate-300 text-sm mt-0.5">
                          {Math.round(modelInfo?.metrics?.test_persistence?.MSE ?? 2252)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-500">R² Score</div>
                        <div className="font-mono font-bold text-slate-300 text-sm mt-0.5">
                          {modelInfo?.metrics?.test_persistence?.R2 ?? 0.8356}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SmartAir ANN Model */}
                  <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        SmartAir ANN (LearningRate_0001)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        Selected Best Model
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                      <div className="p-2 rounded bg-slate-950/60 border border-emerald-500/30">
                        <div className="text-[10px] font-mono text-emerald-400">RMSE</div>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">
                          {modelInfo?.metrics?.test_ann?.RMSE ?? 40.11}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-emerald-500/30">
                        <div className="text-[10px] font-mono text-emerald-400">MAE</div>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">
                          {modelInfo?.metrics?.test_ann?.MAE ?? 27.44}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-emerald-500/30">
                        <div className="text-[10px] font-mono text-emerald-400">MSE</div>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">
                          {Math.round(modelInfo?.metrics?.test_ann?.MSE ?? 1609)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-emerald-500/30">
                        <div className="text-[10px] font-mono text-emerald-400">R² Score</div>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">
                          {modelInfo?.metrics?.test_ann?.R2 ?? 0.8826}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loss Convergence Curve */}
              {historyData.length > 0 && (
                <div className="p-6 rounded-2xl border border-border surface-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Training vs. Validation Loss Convergence
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Mean Squared Error loss trajectory on scaled targets over training epochs
                      </p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">
                      Early Stopped at Epoch {historyData.length}
                    </span>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                        <XAxis
                          dataKey="epoch"
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                          label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fill: '#64748B', fontSize: 10 }}
                        />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Line
                          type="monotone"
                          dataKey="training_loss"
                          name="Training Loss (Scaled MSE)"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="val_loss"
                          name="Validation Loss (Scaled MSE)"
                          stroke="#06B6D4"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Hyperparameter Ablation Study Table */}
              <div className="p-6 rounded-2xl border border-border surface-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Controlled Hyperparameter Experiments
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ablation across learning rates, activations, optimizers, and layer dimensions
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Ranked by Validation RMSE (Lower is Better)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Model</th>
                        <th className="px-4 py-3">Units</th>
                        <th className="px-4 py-3">Activation</th>
                        <th className="px-4 py-3">Optimizer</th>
                        <th className="px-4 py-3">Learning Rate</th>
                        <th className="px-4 py-3">Dropout</th>
                        <th className="px-4 py-3">Batch</th>
                        <th className="px-4 py-3">Val RMSE</th>
                        <th className="px-4 py-3">Val MAE</th>
                        <th className="px-4 py-3">Val R²</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono">
                      {experiments.map((exp, idx) => {
                        const isBest = exp.Model === 'LearningRate_0001' || idx === 0;
                        return (
                          <tr
                            key={exp.Model}
                            className={`transition-colors ${
                              isBest
                                ? 'bg-emerald-500/10 font-bold text-emerald-300'
                                : 'hover:bg-slate-800/30 text-slate-300'
                            }`}
                          >
                            <td className="px-4 py-3 flex items-center gap-1.5">
                              {isBest && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              <span>{exp.Model}</span>
                            </td>
                            <td className="px-4 py-3">{exp.Architecture}</td>
                            <td className="px-4 py-3">{exp.Activation}</td>
                            <td className="px-4 py-3 uppercase">{exp.Optimizer}</td>
                            <td className="px-4 py-3">{exp["Learning Rate"]}</td>
                            <td className="px-4 py-3">{exp.Dropout}</td>
                            <td className="px-4 py-3">{exp["Batch Size"]}</td>
                            <td className="px-4 py-3 font-bold text-white">{exp["Validation RMSE"]}</td>
                            <td className="px-4 py-3">{exp["Validation MAE"]}</td>
                            <td className="px-4 py-3">{exp["Validation R2"]}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Leakage Prevention & Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Leakage Prevention */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Data Leakage Mitigation Protocol</span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Chronological Date Boundary:</strong> Samples split based on calendar dates (70% train, 15% val, 15% test). Never randomly shuffled.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Isolated Preprocessing:</strong> Imputer, StandardScaler, and TargetScaler fitted exclusively on training-split observations.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Excluded AQI Bucket:</strong> Categorical AQI_Bucket excluded from input to prevent circular target leakage.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Academic Limitations */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Academic Project Constraints</span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong>Historical Dataset:</strong> Data spans 2015-01-01 to 2020-07-01 (CPCB India). Does not claim live real-time IoT feeds.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong>Continuous Window Requirement:</strong> Inference mandates 7 consecutive historical days without missing calendar dates.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong>Atmospheric Limitations:</strong> Deep neural models approximate surface chemistry without direct meteorological wind simulation.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
