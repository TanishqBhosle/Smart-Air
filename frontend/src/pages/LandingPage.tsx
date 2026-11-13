import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wind,
  Sparkles,
  ArrowRight,
  Cpu,
  BarChart3,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  Calendar,
  Database,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Day Air Quality Intelligence Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Know tomorrow's air quality,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                today.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Predict next-day air quality using historical pollution patterns and machine learning.
              Turn environmental data into actionable intelligence.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                Explore Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/predictions"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-all flex items-center justify-center gap-2"
              >
                Generate Predictions
              </Link>
              <Link
                to="/model-insights"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                How It Works &rarr;
              </Link>
            </div>
          </div>

          {/* Environmental Dashboard Visual Preview */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#0B1120] p-4 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-slate-400">smartair.forecast.engine // Station DL001 (Delhi Anand Vihar)</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Model Verification
              </span>
            </div>

            {/* Forecast Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* Card 1: 7-day lookback */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="uppercase font-mono tracking-wider">Historical Context</span>
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-white">7 Consecutive Days</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Continuous monitoring window strictly validated for each station.
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-2 text-[11px] text-slate-400 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800">11 Pollutants</span>
                  <span>+</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800">Cyclical Time</span>
                </div>
              </div>

              {/* Card 2: Neural Net Processing */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="uppercase font-mono tracking-wider">ANN Architecture</span>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">MLP 128 &rarr; 64</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Flattened 637-dim input feature vector with Adam optimizer & Dropout.
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-2 text-[11px] text-slate-400 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">lr = 0.0001</span>
                  <span>|</span>
                  <span className="text-slate-400">MSE Loss</span>
                </div>
              </div>

              {/* Card 3: Next-Day Prediction */}
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-900/70 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="uppercase font-mono tracking-wider text-emerald-400">Predicted Next-Day AQI</span>
                  <Badge category="Moderate" size="sm" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold font-mono text-white">164.2 AQI</div>
                  <div className="text-xs text-slate-300 mt-1">
                    Next-day expected index. R² = 0.878 on held-out test data.
                  </div>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  +13.89% improvement vs persistence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-t border-border bg-[#0B1120]/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Technical Methodology
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Rigorous 7-day chronological forecasting
            </h2>
            <p className="text-sm text-slate-400">
              Unlike simplistic rule-based dashboards, SmartAir implements an end-to-end trained
              Artificial Neural Network with zero data leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-surface/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
                01
              </div>
              <h3 className="text-lg font-semibold text-white">7-Day Historical Window</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The pipeline extracts exactly seven consecutive calendar days of measurements
                for a monitoring station. Any date gaps disqualify the sequence to guarantee
                genuine temporal structure.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  11 selected pollutants with &lt;60% missingness
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Sine/cosine day-of-year & month encodings
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-surface/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono">
                02
              </div>
              <h3 className="text-lg font-semibold text-white">Feedforward ANN Inference</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The 7-day sequence is flattened into a 637-dimensional input vector and passed
                through dense layers (128 &rarr; 64) with ReLU activation, Dropout regularization (0.2),
                and standardized feature transforms.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  Trained with Adam optimizer (lr=0.0001)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  Imputer & scalers fit on train split only
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-surface/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-mono">
                03
              </div>
              <h3 className="text-lg font-semibold text-white">Next-Day AQI Intelligence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The single linear output neuron produces a continuous AQI regression estimate for day 8,
                inverted to natural scale and mapped to Indian National Air Quality Index bands with health advisories.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  Evaluated on 26,137 held-out test days
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  Continuous regression, not classification
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Pollutants Grid */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Supported Environmental Contaminants
            </h2>
            <p className="text-xs text-slate-400">
              Measured and modeled across 100+ Indian monitoring stations
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { code: 'PM2.5', name: 'Fine Particulates', desc: 'Combustion, vehicles' },
              { code: 'PM10', name: 'Coarse Particulates', desc: 'Dust, construction' },
              { code: 'NO2', name: 'Nitrogen Dioxide', desc: 'Traffic emissions' },
              { code: 'SO2', name: 'Sulfur Dioxide', desc: 'Power generation' },
              { code: 'CO', name: 'Carbon Monoxide', desc: 'Incomplete combustion' },
              { code: 'O3', name: 'Ozone', desc: 'Photochemical smog' },
            ].map((p) => (
              <div
                key={p.code}
                className="p-4 rounded-xl border border-slate-800 bg-surface/30 hover:border-slate-700 transition-all text-center space-y-1"
              >
                <div className="font-mono font-bold text-lg text-emerald-400">{p.code}</div>
                <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                <div className="text-[10px] text-slate-500">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-[#0B1120] py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white tracking-tight">SmartAir</span>
            <span className="text-slate-500">— Understand the air. Predict tomorrow.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/predictions" className="hover:text-white transition-colors">
              Forecasts
            </Link>
            <Link to="/stations" className="hover:text-white transition-colors">
              Stations
            </Link>
            <Link to="/model-insights" className="hover:text-white transition-colors">
              Model Insights
            </Link>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Academic AQI Machine Learning System
          </div>
        </div>
      </footer>
    </div>
  );
};

