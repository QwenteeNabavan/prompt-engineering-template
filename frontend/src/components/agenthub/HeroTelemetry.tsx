import React, { useState } from 'react'
import {
  ShieldCheck,
  GitFork,
  Cpu,
  Clock,
  Sparkles,
  Gamepad2,
} from 'lucide-react'

export const HeroTelemetry: React.FC = () => {
  const [dotaStatus, setDotaStatus] = useState<string | null>(null)

  const handleLaunchDota = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDotaStatus('⚔️ Launching Dota 2 via Steam (AppID 570)...')

    // 1. Browser protocol handler
    window.location.href = 'steam://rungameid/570'

    // 2. Local backend OS execution fallback
    try {
      await fetch('http://localhost:8001/api/easter-egg/launch-dota', {
        method: 'POST',
      })
    } catch {
      // Protocol URL already launched
    }

    setTimeout(() => {
      setDotaStatus(null)
    }, 4500)
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-10 border-b border-slate-800/60">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[320px] w-[650px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/10 via-violet-500/5 to-transparent blur-3xl opacity-70"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
          {/* Top subtle badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-400 backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
            <span>Standardized Technical Audit & Registry</span>
          </div>

          {/* Punchy Gradient Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            The Open Registry for{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Autonomous AI Agents
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            <button
              type="button"
              onClick={handleLaunchDota}
              className="text-inherit font-inherit p-0 m-0 bg-transparent border-0 cursor-pointer hover:text-cyan-400 hover:underline decoration-cyan-500/40 underline-offset-4 transition-colors select-none focus:outline-none"
              title="Discover (Launch Dota 2)"
              aria-label="Discover (Easter Egg: Launch Dota 2)"
            >
              Discover
            </button>
            , benchmark, and deploy agents with tool calling, MCP support,
            and planning capabilities. Verified telemetry, reproducible execution loops,
            and community upvotes.
          </p>

          {/* Secret launch status banner */}
          {dotaStatus && (
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-900/90 px-3.5 py-1 text-xs font-mono text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.3)] animate-pulse">
              <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>{dotaStatus}</span>
            </div>
          )}

          {/* 4 Mini-Stat Pills Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 w-full max-w-2xl">
            {/* Pill 1 */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/60 px-3 py-2 text-left backdrop-blur-xs transition-colors hover:border-slate-700">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono text-white">280+</span>
                <span className="text-[10px] text-slate-400">Verified Agents</span>
              </div>
            </div>

            {/* Pill 2 */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/60 px-3 py-2 text-left backdrop-blur-xs transition-colors hover:border-slate-700">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <GitFork className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono text-white">48</span>
                <span className="text-[10px] text-slate-400">Open Source</span>
              </div>
            </div>

            {/* Pill 3 */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/60 px-3 py-2 text-left backdrop-blur-xs transition-colors hover:border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.1)]">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono text-violet-300">MCP Protocol</span>
                <span className="text-[10px] text-slate-400">Ready & Tested</span>
              </div>
            </div>

            {/* Pill 4 */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/60 px-3 py-2 text-left backdrop-blur-xs transition-colors hover:border-slate-700">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono text-white">Updated Hourly</span>
                <span className="text-[10px] text-slate-400">Automated Audit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
