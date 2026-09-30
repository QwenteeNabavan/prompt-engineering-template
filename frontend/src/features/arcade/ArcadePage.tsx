import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  openTetris,
  openHardestGame,
  openInvoker,
  openPudge,
  setActiveView,
} from '@/store/slices/appSlice'
import {
  Gamepad2,
  Trophy,
  Zap,
  Sparkles,
  Command,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  Play,
  CheckCircle2,
  Terminal,
  ChevronRight,
  Target,
} from 'lucide-react'

export const ArcadePage: React.FC = () => {
  const dispatch = useDispatch()

  // Local storage telemetry states
  const [tetrisHighScore, setTetrisHighScore] = useState<number>(0)
  const [invokerScores, setInvokerScores] = useState<{
    novice: number
    magus: number
    grandmaster: number
  }>({ novice: 0, magus: 0, grandmaster: 0 })
  const [pudgeHighScore, setPudgeHighScore] = useState<number>(0)
  const [dotaToast, setDotaToast] = useState<string | null>(null)
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null)

  const reloadScores = () => {
    try {
      const storedTetris = localStorage.getItem('agenthub_tetris_highscore')
      if (storedTetris) {
        setTetrisHighScore(parseInt(storedTetris, 10) || 0)
      }

      const storedInvoker = localStorage.getItem('agenthub_invoker_highscores')
      if (storedInvoker) {
        setInvokerScores(JSON.parse(storedInvoker))
      }

      const storedPudge = localStorage.getItem('agenthub_pudge_highscore')
      if (storedPudge) {
        setPudgeHighScore(parseInt(storedPudge, 10) || 0)
      }
    } catch (e) {
      console.error('Failed to load arcade telemetry:', e)
    }
  }

  useEffect(() => {
    reloadScores()
    // Poll storage briefly when page is in focus
    const handleFocus = () => reloadScores()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleLaunchDota = () => {
    setDotaToast('Executing Steam protocol: steam://run/570...')
    window.location.href = 'steam://run/570'
    setTimeout(() => {
      setDotaToast('Dota 2 launch command dispatched to local Steam client.')
      setTimeout(() => setDotaToast(null), 3500)
    }, 1200)
  }

  const handleResetScores = () => {
    if (window.confirm('Reset all saved local arcade high scores?')) {
      localStorage.removeItem('agenthub_tetris_highscore')
      localStorage.removeItem('agenthub_invoker_highscores')
      localStorage.removeItem('agenthub_pudge_highscore')
      setTetrisHighScore(0)
      setInvokerScores({ novice: 0, magus: 0, grandmaster: 0 })
      setPudgeHighScore(0)
    }
  }

  const handleCopyTrigger = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedShortcut(label)
    setTimeout(() => setCopiedShortcut(null), 2000)
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Toast Notification */}
      {dotaToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-rose-500/40 bg-slate-900/95 px-5 py-3 text-sm text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
          <Sparkles className="h-4 w-4 text-rose-400 animate-pulse" />
          <span>{dotaToast}</span>
        </div>
      )}

      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <button
            onClick={() => dispatch(setActiveView('directory'))}
            className="hover:text-cyan-400 transition-colors"
          >
            AgentHub
          </button>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-cyan-400 font-semibold">Arcade & Mini-Games</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reloadScores}
            title="Refresh High Scores"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Sync Scores</span>
          </button>
          <button
            onClick={handleResetScores}
            className="text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
          >
            Clear Records
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-slate-900 p-6 sm:p-10 shadow-2xl">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300">
            <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Developer Break Room & Mini-Games Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AgentHub <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Arcade</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            A curated suite of interactive games, reflex trainers, and retro simulations built right into AgentHub.
            Test your rotation speed in Tetris, test your patience in The World&apos;s Hardest Game, drill Invoker spell combos, or bridge directly to Steam.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="block text-[11px] font-mono text-slate-400">Total Games</span>
              <span className="text-xl font-black text-cyan-400">5 Modules</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="block text-[11px] font-mono text-slate-400">Tetris Record</span>
              <span className="text-xl font-black text-amber-400">{tetrisHighScore.toLocaleString()} pts</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="block text-[11px] font-mono text-slate-400">Invoker Score</span>
              <span className="text-xl font-black text-purple-400">
                {Math.max(invokerScores.novice, invokerScores.magus, invokerScores.grandmaster).toLocaleString()} pts
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="block text-[11px] font-mono text-slate-400">Pudge Best</span>
              <span className="text-xl font-black text-rose-400">{pudgeHighScore.toLocaleString()} pts</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="block text-[11px] font-mono text-slate-400">Crashout Moments</span>
              <span className="text-xl font-black text-amber-500">Doggie Clip</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game 1: Classic Tetris */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <div className="space-y-4">
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 font-mono text-[10px] text-cyan-400 uppercase tracking-wider">
                  Arcade Classic
                </span>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  SRS Kicks
                </span>
              </div>
              <span className="font-mono text-xs text-amber-400 font-bold flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" /> High: {tetrisHighScore.toLocaleString()}
              </span>
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-tr from-cyan-950 to-cyan-500/20 shadow-inner group-hover:scale-105 transition-transform">
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-3 w-3 rounded-xs bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <div className="h-3 w-3 rounded-xs bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <div className="h-3 w-3 rounded-xs bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div className="h-3 w-3 rounded-xs bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Classic Tetris
                </h3>
                <p className="text-xs font-mono text-slate-400">10x20 Standard Grid &bull; Ghost Piece &bull; Level Scaling</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Full-featured embedded tetromino engine complete with Super Rotation System (SRS) wall kicks, real-time ghost piece landing projection, soft/hard drops, line clear animations, and difficulty progression.
            </p>

            {/* Controls Guide */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 font-mono text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Movement & Rotation</span>
                <span className="text-slate-200">← → / ↑ Rotate</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Drops & Pause</span>
                <span className="text-slate-200">↓ Soft Drop / Space Hard Drop / P</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                <span className="text-cyan-400">Global Shortcut</span>
                <kbd className="rounded border border-cyan-500/30 bg-slate-900 px-1.5 py-0.5 text-cyan-300">
                  Alt+T
                </kbd>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="button"
              onClick={() => dispatch(openTetris())}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Play Classic Tetris</span>
            </button>
          </div>
        </div>

        {/* Game 2: The World's Hardest Game */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-rose-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <div className="space-y-4">
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-rose-500/30 bg-rose-950/40 px-2 py-0.5 font-mono text-[10px] text-rose-400 uppercase tracking-wider">
                  Challenge
                </span>
                <span className="rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 font-mono text-[10px] text-amber-400">
                  4 Handcrafted Levels
                </span>
              </div>
              <span className="font-mono text-xs text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> High Stakes
              </span>
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-500/40 bg-gradient-to-tr from-rose-950 to-rose-500/20 shadow-inner group-hover:scale-105 transition-transform">
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <div className="h-5 w-5 rounded-xs bg-rose-500 border border-white shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
                  The World&apos;s Hardest Game
                </h3>
                <p className="text-xs font-mono text-slate-400">Hazard Nodes &bull; Key Gathering &bull; Video Crashout</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Brutally demanding geometric navigation simulator. Dodge oscillating blue hazard nodes, collect golden keys, and reach safe zones. Failure triggers the iconic 1.8s Doggie keyboard smash synced to KzX *Stalemate*!
            </p>

            {/* Controls Guide */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 font-mono text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Movement</span>
                <span className="text-slate-200">W A S D / Arrow Keys</span>
              </div>
              <div className="flex items-center justify-between">
                <span>On Death Event</span>
                <span className="text-rose-400">Doggie Smash Video (Stalemate)</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                <span className="text-rose-400">Secret Search Trigger</span>
                <span className="text-slate-300 font-mono">Search &ldquo;game&rdquo; in header</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="button"
              onClick={() => dispatch(openHardestGame())}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Launch Hardest Game</span>
            </button>
          </div>
        </div>

        {/* Game 3: Dota 2 Invoker Spell Knowledge Trainer */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-purple-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <div className="space-y-4">
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-purple-500/30 bg-purple-950/40 px-2 py-0.5 font-mono text-[10px] text-purple-400 uppercase tracking-wider">
                  Esports Trainer
                </span>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  Web Audio Synthesizer
                </span>
              </div>
              <span className="font-mono text-xs text-purple-400 font-bold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" /> 10 Canonical Spells
              </span>
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/40 bg-gradient-to-tr from-purple-950 to-purple-500/20 shadow-inner group-hover:scale-105 transition-transform">
                <div className="flex items-center -space-x-1.5">
                  <div className="h-4 w-4 rounded-full bg-cyan-400 border border-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.9)]" title="Quas" />
                  <div className="h-4 w-4 rounded-full bg-fuchsia-400 border border-slate-950 shadow-[0_0_8px_rgba(217,70,239,0.9)]" title="Wex" />
                  <div className="h-4 w-4 rounded-full bg-amber-400 border border-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.9)]" title="Exort" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  Invoker Spell Trainer
                </h3>
                <p className="text-xs font-mono text-slate-400">Quas • Wex • Exort &bull; 3 Difficulty Tiers &bull; ms Telemetry</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Drill all 10 canonical Invoker combinations with order-independent validation, 3-orb sliding chamber animation, procedural Web Audio SFX, and millisecond reaction tracking across Novice, Magus, and Arsenal Magus blitz modes.
            </p>

            {/* Difficulty & Records Breakdown */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                <span className="block text-slate-400">Novice</span>
                <span className="text-cyan-400 font-bold">{invokerScores.novice} pts</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                <span className="block text-slate-400">Magus</span>
                <span className="text-purple-400 font-bold">{invokerScores.magus} pts</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                <span className="block text-slate-400">Grandmaster</span>
                <span className="text-amber-400 font-bold">{invokerScores.grandmaster} pts</span>
              </div>
            </div>

            {/* Controls Guide */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 font-mono text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Elemental Orbs</span>
                <span className="text-slate-200">Q (Quas) &bull; W (Wex) &bull; E (Exort)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Invocation Trigger</span>
                <span className="text-slate-200">Auto (3 Orbs) or R / Space</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                <span className="text-purple-400">Global Shortcut</span>
                <kbd className="rounded border border-purple-500/30 bg-slate-900 px-1.5 py-0.5 text-purple-300">
                  Alt+I
                </kbd>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="button"
              onClick={() => dispatch(openInvoker())}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Practice Invoker Combos</span>
            </button>
          </div>
        </div>

        {/* Game 4: Dota 2 Native Steam Launcher */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-red-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <div className="space-y-4">
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-red-500/30 bg-red-950/40 px-2 py-0.5 font-mono text-[10px] text-red-400 uppercase tracking-wider">
                  Hardware Protocol
                </span>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  AppID: 570
                </span>
              </div>
              <span className="font-mono text-xs text-red-400 font-bold flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" /> Steam Bridge
              </span>
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/40 bg-gradient-to-tr from-red-950 to-red-500/20 shadow-inner group-hover:scale-105 transition-transform">
                <svg className="h-8 w-8 fill-red-400" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12c0-5.52-4.48-10-10-10z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-300 transition-colors">
                  Dota 2 Steam Launcher
                </h3>
                <p className="text-xs font-mono text-slate-400">Direct Desktop Protocol &bull; Native Valve Client</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Hardware bridge executing the <code className="text-red-400">steam://run/570</code> application protocol. Seamlessly launches your local desktop installation of Valve Dota 2 directly from AgentHub without exiting the browser.
            </p>

            {/* Controls Guide */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 font-mono text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Protocol Target</span>
                <span className="text-slate-200">steam://run/570</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Prerequisites</span>
                <span className="text-slate-200">Steam Client Installed</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                <span className="text-red-400">Secret Homepage Trigger</span>
                <span className="text-slate-300 font-mono">Click &ldquo;Discover&rdquo; word</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="button"
              onClick={handleLaunchDota}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Launch Dota 2 via Steam</span>
            </button>
          </div>
        </div>

        {/* Game 5: Dota 2 Pudge Meat Hook Precision Trainer */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-rose-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] md:col-span-2">
          <div className="space-y-4">
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-rose-500/30 bg-rose-950/40 px-2 py-0.5 font-mono text-[10px] text-rose-400 uppercase tracking-wider">
                  Dota 2 Precision
                </span>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  2D Chain Physics
                </span>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  Web Audio Synthesizer
                </span>
              </div>
              <span className="font-mono text-xs text-amber-400 font-bold flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" /> High: {pudgeHighScore.toLocaleString()}
              </span>
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-500/40 bg-gradient-to-tr from-rose-950 to-rose-500/20 shadow-inner group-hover:scale-105 transition-transform">
                <Target className="h-7 w-7 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
                  Pudge Meat Hook Precision Trainer
                </h3>
                <p className="text-xs font-mono text-slate-400">Aim &bull; Target Leading &bull; Multi-Segment Chain &bull; 6 Moving Target Types</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Step onto the Radiant riverbank and hone your Meat Hook precision with authentic 2D trajectory physics. Lead moving creeps, Crystal Maiden, Sniper, Windranger, Anti-Mage, and high-speed couriers. Features full multi-link chain rendering, procedural flesh impact sounds, blood splatter effects, combo streaks, and 3 game modes (60s Blitz, 3 Strikes, and Free Training).
            </p>

            {/* Controls Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 font-mono text-[11px] text-slate-400">
              <div>
                <span className="block text-slate-500 text-[10px]">AIMING</span>
                <span className="text-slate-200">Mouse Cursor Direction</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px]">THROW HOOK</span>
                <span className="text-slate-200">Left Click / Key Q / Space</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px]">GLOBAL SHORTCUT</span>
                <kbd className="rounded border border-rose-500/30 bg-slate-900 px-1.5 py-0.5 text-rose-300 font-bold">
                  Alt+P
                </kbd>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="button"
              onClick={() => dispatch(openPudge())}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Launch Pudge Hook Trainer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secret Triggers & Easter Egg Cheat Sheet */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              AgentHub Easter Eggs & Secret Keybindings Directory
            </h3>
            <p className="text-xs text-slate-400">
              Quick reference for dev shortcuts and hidden command palette triggers across the platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Item 1 */}
          <div
            onClick={() => handleCopyTrigger('Alt+T', 'Alt+T')}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs text-cyan-300">
                  Alt+T
                </kbd>
                <span className="text-xs font-semibold text-white">Classic Tetris</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Launches the embedded Tetris modal popup anywhere on the site.
              </p>
            </div>
            {copiedShortcut === 'Alt+T' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Command className="h-4 w-4 text-slate-500 shrink-0" />
            )}
          </div>

          {/* Item 2 */}
          <div
            onClick={() => handleCopyTrigger('Alt+I', 'Alt+I')}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs text-purple-300">
                  Alt+I
                </kbd>
                <span className="text-xs font-semibold text-white">Invoker Trainer</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instantly opens the 10-spell Invoker knowledge practice chamber.
              </p>
            </div>
            {copiedShortcut === 'Alt+I' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Command className="h-4 w-4 text-slate-500 shrink-0" />
            )}
          </div>

          {/* Item 3 */}
          <div
            onClick={() => handleCopyTrigger('game', 'game')}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                  &ldquo;game&rdquo;
                </span>
                <span className="text-xs font-semibold text-white">Hardest Game</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Type &ldquo;game&rdquo; into the main search bar or Command Menu (<kbd className="font-mono text-[10px]">Cmd+K</kbd>).
              </p>
            </div>
            {copiedShortcut === 'game' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Command className="h-4 w-4 text-slate-500 shrink-0" />
            )}
          </div>

          {/* Item 4 */}
          <div
            onClick={() => handleCopyTrigger('invoker', 'invoker')}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                  &ldquo;invoker&rdquo;
                </span>
                <span className="text-xs font-semibold text-white">Spell Search</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Type &ldquo;invoker&rdquo;, &ldquo;dota&rdquo;, or &ldquo;spell&rdquo; in the search bar.
              </p>
            </div>
            {copiedShortcut === 'invoker' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Command className="h-4 w-4 text-slate-500 shrink-0" />
            )}
          </div>

          {/* Item 5 */}
          <div
            onClick={() => handleCopyTrigger('Discover', 'Discover')}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
                  Discover
                </span>
                <span className="text-xs font-semibold text-white">Launch Dota 2</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Clicking the word &ldquo;Discover&rdquo; in the homepage hero subtitle launches Dota 2 via Steam.
              </p>
            </div>
            {copiedShortcut === 'Discover' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Command className="h-4 w-4 text-slate-500 shrink-0" />
            )}
          </div>

          {/* Item 6 */}
          <div
            onClick={() => handleCopyTrigger('Cmd+K', 'Cmd+K')}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300">
                  Cmd+K
                </kbd>
                <span className="text-xs font-semibold text-white">Command Palette</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Global palette with instant game jump shortcuts and fuzzy agent search.
              </p>
            </div>
            {copiedShortcut === 'Cmd+K' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Command className="h-4 w-4 text-slate-500 shrink-0" />
            )}
          </div>

          {/* Item 7 */}
          <div
            onClick={() => handleCopyTrigger('Alt+P', 'Alt+P')}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs text-rose-300">
                  Alt+P
                </kbd>
                <span className="text-xs font-semibold text-white">Pudge Hook Trainer</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Launches the Pudge Meat Hook precision trainer anywhere across the site.
              </p>
            </div>
            {copiedShortcut === 'Alt+P' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Command className="h-4 w-4 text-slate-500 shrink-0" />
            )}
          </div>

          {/* Item 8 */}
          <div
            onClick={() => handleCopyTrigger('pudge', 'pudge')}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                  &ldquo;pudge&rdquo;
                </span>
                <span className="text-xs font-semibold text-white">Hook Search</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Type &ldquo;pudge&rdquo;, &ldquo;hook&rdquo;, or &ldquo;meat&rdquo; in the search bar.
              </p>
            </div>
            {copiedShortcut === 'pudge' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Command className="h-4 w-4 text-slate-500 shrink-0" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
