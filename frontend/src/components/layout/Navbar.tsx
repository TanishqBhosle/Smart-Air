import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wind, Activity, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [modelLoaded, setModelLoaded] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getHealth()
      .then((data) => {
        if (isMounted) setModelLoaded(Boolean(data.model_loaded));
      })
      .catch(() => {
        if (isMounted) setModelLoaded(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'AQI Predictions', path: '/predictions' },
    { name: 'Monitoring Stations', path: '/stations' },
    { name: 'Model Insights', path: '/model-insights' },
  ];

  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#090D16]/85 border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-400 transition-all">
              <Wind className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">SmartAir</span>
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ANN v1.0
                </span>
              </div>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-slate-800/80 border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Model Status & CTA */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                {modelLoaded ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                )}
              </span>
              <span className="text-slate-400 font-mono">
                {modelLoaded ? 'Inference Engine Active' : 'Connecting Engine...'}
              </span>
            </div>

            {isHome ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30"
              >
                Launch Dashboard
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/predictions"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
              >
                New Forecast
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

