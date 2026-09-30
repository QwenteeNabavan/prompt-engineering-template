import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Zap,
  Flame,
  ShieldAlert,
  Sparkles,
  Play,
} from 'lucide-react'

interface InvokerTrainerModalProps {
  isOpen: boolean
  onClose: () => void
}

type Difficulty = 'novice' | 'magus' | 'grandmaster'
type OrbType = 'Q' | 'W' | 'E'

interface InvokerSpell {
  id: string
  name: string
  quas: number
  wex: number
  exort: number
  canonicalOrder: string
  lore: string
  flavor: string
  accentColor: string
  glowColor: string
}

const INVOKER_SPELLS: InvokerSpell[] = [
  {
    id: 'cold_snap',
    name: 'Cold Snap',
    quas: 3,
    wex: 0,
    exort: 0,
    canonicalOrder: 'Q - Q - Q',
    lore: 'Quas Quas Quas',
    flavor: 'Freezes the enemy in their tracks, repeatedly stunning upon taking damage.',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'ghost_walk',
    name: 'Ghost Walk',
    quas: 2,
    wex: 1,
    exort: 0,
    canonicalOrder: 'Q - Q - W',
    lore: 'Quas Quas Wex',
    flavor: 'Enters deep ethereal invisibility, heavily slowing surrounding adversaries.',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  {
    id: 'ice_wall',
    name: 'Ice Wall',
    quas: 2,
    wex: 0,
    exort: 1,
    canonicalOrder: 'Q - Q - E',
    lore: 'Quas Quas Exort',
    flavor: 'Summons a formidable barrier of glacial frost that paralyzes all who cross it.',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
  {
    id: 'emp',
    name: 'EMP',
    quas: 0,
    wex: 3,
    exort: 0,
    canonicalOrder: 'W - W - W',
    lore: 'Wex Wex Wex',
    flavor: 'Detonates a localized magnetic surge, draining mana and dealing devastation.',
    accentColor: '#d946ef',
    glowColor: 'rgba(217, 70, 239, 0.4)',
  },
  {
    id: 'tornado',
    name: 'Tornado',
    quas: 1,
    wex: 2,
    exort: 0,
    canonicalOrder: 'W - W - Q',
    lore: 'Wex Wex Quas',
    flavor: 'Hurls a roaring funnel of storm winds that sweeps foes skyward and dispels magic.',
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.4)',
  },
  {
    id: 'alacrity',
    name: 'Alacrity',
    quas: 0,
    wex: 2,
    exort: 1,
    canonicalOrder: 'W - W - E',
    lore: 'Wex Wex Exort',
    flavor: 'Infuses an ally with surges of blinding agility and amplified strike force.',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.4)',
  },
  {
    id: 'sun_strike',
    name: 'Sun Strike',
    quas: 0,
    wex: 0,
    exort: 3,
    canonicalOrder: 'E - E - E',
    lore: 'Exort Exort Exort',
    flavor: 'Focuses pure celestial radiation anywhere across the world with pinpoint ruin.',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    id: 'forge_spirit',
    name: 'Forge Spirit',
    quas: 1,
    wex: 0,
    exort: 2,
    canonicalOrder: 'E - E - Q',
    lore: 'Exort Exort Quas',
    flavor: 'Manifests a conscious incarnate of ice and flame whose strikes strip away armor.',
    accentColor: '#ea580c',
    glowColor: 'rgba(234, 88, 12, 0.4)',
  },
  {
    id: 'chaos_meteor',
    name: 'Chaos Meteor',
    quas: 0,
    wex: 1,
    exort: 2,
    canonicalOrder: 'E - E - W',
    lore: 'Exort Exort Wex',
    flavor: 'Pulls a burning planetoid from orbit to roll forward in a swath of hellfire.',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
  {
    id: 'deafening_blast',
    name: 'Deafening Blast',
    quas: 1,
    wex: 1,
    exort: 1,
    canonicalOrder: 'Q - W - E',
    lore: 'Quas Wex Exort',
    flavor: 'Unleashes a harmonic wave of all 3 primordial elements, knocking back and disarming.',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
]

// Difficulty settings config
const DIFFICULTY_CONFIG = {
  novice: {
    label: 'Novice (Acolyte)',
    timeLimitMs: 6000,
    showHint: true,
    maxLives: null, // infinite practice
    pointMultiplier: 1.0,
    description: 'Relaxed 6.0s timer • Visible spell hints • Ideal for memorization',
    badgeClass: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400',
  },
  magus: {
    label: 'Magus (Invoker)',
    timeLimitMs: 2500,
    showHint: false,
    maxLives: 3,
    pointMultiplier: 2.0,
    description: 'Challenging 2.5s timer • Hints hidden • 3 lives • Streak multipliers',
    badgeClass: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400',
  },
  grandmaster: {
    label: 'Arsenal Magus',
    timeLimitMs: 1300,
    showHint: false,
    maxLives: 1,
    pointMultiplier: 3.5,
    description: 'Blitz 1.3s timer • Sudden death (1 mistake) • Extreme APM reflex test',
    badgeClass: 'border-rose-500/40 bg-rose-950/40 text-rose-400',
  },
}

// Procedural Web Audio API Synthesizer
class InvokerSoundFX {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  playQuas() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
      osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.18)
    } catch {
      // AudioContext unavailable
    }
  }

  playWex() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(440, ctx.currentTime) // A4
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // AudioContext unavailable
    }
  }

  playExort() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, ctx.currentTime) // A3
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.22)
    } catch {
      // AudioContext unavailable
    }
  }

  playInvokeSuccess() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04)
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + idx * 0.04)
        osc.stop(ctx.currentTime + idx * 0.04 + 0.25)
      })
    } catch {
      // AudioContext unavailable
    }
  }

  playError() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {
      // AudioContext unavailable
    }
  }
}

const sfx = new InvokerSoundFX()

// SVG Spell Icon Renderer
const SpellIcon: React.FC<{ spellId: string; className?: string }> = ({ spellId, className = 'w-16 h-16' }) => {
  switch (spellId) {
    case 'cold_snap':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <defs>
            <radialGradient id="csGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#083344" />
            </radialGradient>
          </defs>
          <rect width="64" height="64" rx="12" fill="#082f49" />
          <circle cx="32" cy="32" r="24" fill="url(#csGrad)" opacity="0.35" />
          {/* Diamond Ice Shard */}
          <polygon points="32,8 44,28 32,56 20,28" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
          <polygon points="32,16 38,28 32,48 26,28" fill="#38bdf8" />
          {/* Freezing Ring */}
          <circle cx="32" cy="28" r="16" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      )
    case 'ghost_walk':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <defs>
            <radialGradient id="gwGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="70%" stopColor="#581c87" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </radialGradient>
          </defs>
          <rect width="64" height="64" rx="12" fill="#1e1b4b" />
          <circle cx="32" cy="32" r="24" fill="url(#gwGrad)" opacity="0.4" />
          {/* Ethereal Eye / Cloak */}
          <path d="M12,32 Q32,14 52,32 Q32,50 12,32 Z" fill="none" stroke="#a855f7" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="8" fill="#c084fc" opacity="0.9" />
          <circle cx="32" cy="32" r="3" fill="#ffffff" />
          <path d="M22,24 Q32,10 42,24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      )
    case 'ice_wall':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect width="64" height="64" rx="12" fill="#0f172a" />
          {/* Jagged Ice Wall Spires */}
          <polygon points="12,52 18,20 24,52" fill="#38bdf8" stroke="#7dd3fc" strokeWidth="1" />
          <polygon points="22,52 30,12 38,52" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
          <polygon points="36,52 44,18 52,52" fill="#0ea5e9" stroke="#bae6fd" strokeWidth="1" />
          <line x1="8" y1="52" x2="56" y2="52" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'emp':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect width="64" height="64" rx="12" fill="#3b0764" />
          <circle cx="32" cy="32" r="22" fill="none" stroke="#d946ef" strokeWidth="2" strokeDasharray="6 3" />
          <circle cx="32" cy="32" r="14" fill="#a21caf" opacity="0.6" />
          <circle cx="32" cy="32" r="7" fill="#f0abfc" />
          {/* Lightning Arcs */}
          <path d="M24,14 L30,26 L26,30 L38,40 L34,44 L40,52" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'tornado':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect width="64" height="64" rx="12" fill="#1e1b4b" />
          {/* Swirling Vortex Tiers */}
          <ellipse cx="32" cy="18" rx="20" ry="5" fill="#a855f7" opacity="0.8" />
          <ellipse cx="32" cy="28" rx="15" ry="4" fill="#c084fc" opacity="0.9" />
          <ellipse cx="32" cy="38" rx="10" ry="3" fill="#67e8f9" />
          <ellipse cx="32" cy="48" rx="5" ry="2" fill="#e0e7ff" />
        </svg>
      )
    case 'alacrity':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect width="64" height="64" rx="12" fill="#422006" />
          {/* Radiant Sword / Surge */}
          <polygon points="32,8 37,28 32,54 27,28" fill="#facc15" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="32" cy="24" r="16" fill="none" stroke="#d946ef" strokeWidth="1.5" opacity="0.75" />
          <circle cx="32" cy="24" r="10" fill="none" stroke="#fbbf24" strokeWidth="2" />
        </svg>
      )
    case 'sun_strike':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect width="64" height="64" rx="12" fill="#450a0a" />
          {/* Celestial Solar Beam */}
          <polygon points="32,4 42,60 22,60" fill="url(#ssBeamGrad)" opacity="0.9" />
          <defs>
            <linearGradient id="ssBeamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="14" r="10" fill="#fef08a" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="32" cy="54" r="14" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      )
    case 'forge_spirit':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect width="64" height="64" rx="12" fill="#1c1917" />
          {/* Fiery Entity Face */}
          <polygon points="32,10 46,38 32,54 18,38" fill="#ea580c" stroke="#f97316" strokeWidth="1.5" />
          <circle cx="26" cy="30" r="3" fill="#38bdf8" />
          <circle cx="38" cy="30" r="3" fill="#38bdf8" />
          <polygon points="32,36 36,44 28,44" fill="#fbbf24" />
        </svg>
      )
    case 'chaos_meteor':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect width="64" height="64" rx="12" fill="#2d0606" />
          {/* Blazing Meteor Tail */}
          <path d="M12,12 L36,36" stroke="#f97316" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
          <path d="M20,10 L40,30" stroke="#facc15" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          {/* Core Planetoid */}
          <circle cx="42" cy="42" r="13" fill="#b91c1c" stroke="#ef4444" strokeWidth="2" />
          <circle cx="40" cy="40" r="8" fill="#f97316" />
          <circle cx="38" cy="38" r="4" fill="#fef08a" />
        </svg>
      )
    case 'deafening_blast':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect width="64" height="64" rx="12" fill="#042f2e" />
          {/* Tri-Element Shockwaves */}
          <path d="M14,48 A24,24 0 0,1 48,14" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
          <path d="M22,50 A20,20 0 0,1 50,22" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
          <path d="M30,52 A16,16 0 0,1 52,30" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="44" r="5" fill="#10b981" />
        </svg>
      )
    default:
      return <div className="w-16 h-16 rounded-xl bg-slate-800" />
  }
}

export const InvokerTrainerModal: React.FC<InvokerTrainerModalProps> = ({ isOpen, onClose }) => {
  // Game Setup State
  const [difficulty, setDifficulty] = useState<Difficulty>('novice')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  // Current Target Spell & Orb Queue
  const [currentSpellIndex, setCurrentSpellIndex] = useState(0)
  const [orbs, setOrbs] = useState<OrbType[]>(['Q', 'Q', 'Q']) // chamber holds 3 orbs
  const [invokedSpellName, setInvokedSpellName] = useState<string | null>(null)
  const [shakeChamber, setShakeChamber] = useState(false)
  const [flashSuccess, setFlashSuccess] = useState(false)

  // Performance Telemetry
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [lives, setLives] = useState(3)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [correctAttempts, setCorrectAttempts] = useState(0)

  // High score tracking from localStorage
  const [highScores, setHighScores] = useState<{ [key in Difficulty]: number }>({
    novice: 0,
    magus: 0,
    grandmaster: 0,
  })

  // Timer Ref & Progress
  const [timerProgress, setTimerProgress] = useState(100)
  const spellStartTimeRef = useRef<number>(Date.now())
  const timerFrameRef = useRef<number | null>(null)

  // Load high scores on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('agenthub_invoker_highscores')
      if (stored) {
        setHighScores(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  // Save high score
  const updateHighScore = useCallback(
    (diff: Difficulty, newScore: number) => {
      setHighScores((prev) => {
        if (newScore > prev[diff]) {
          const updated = { ...prev, [diff]: newScore }
          try {
            localStorage.setItem('agenthub_invoker_highscores', JSON.stringify(updated))
          } catch {
            // ignore
          }
          return updated
        }
        return prev
      })
    },
    []
  )

  const activeSpell = INVOKER_SPELLS[currentSpellIndex]
  const config = DIFFICULTY_CONFIG[difficulty]

  // Pick Next Random Spell (avoid repeating same spell consecutively)
  const pickNextSpell = useCallback(() => {
    setCurrentSpellIndex((prev) => {
      let next: number
      do {
        next = Math.floor(Math.random() * INVOKER_SPELLS.length)
      } while (next === prev && INVOKER_SPELLS.length > 1)
      return next
    })
    spellStartTimeRef.current = Date.now()
    setTimerProgress(100)
  }, [])

  // Start / Restart Game
  const startGame = useCallback(
    (diff?: Difficulty) => {
      const selectedDiff = diff || difficulty
      setDifficulty(selectedDiff)
      setScore(0)
      setStreak(0)
      setReactionTimes([])
      setTotalAttempts(0)
      setCorrectAttempts(0)
      setLives(DIFFICULTY_CONFIG[selectedDiff].maxLives ?? 999)
      setIsGameOver(false)
      setIsPlaying(true)
      setOrbs(['Q', 'Q', 'Q'])
      pickNextSpell()
    },
    [difficulty, pickNextSpell]
  )

  // Handle Spell Failure (Timeout or Wrong Manual Invoke)
  const handleSpellFail = useCallback(() => {
    if (soundEnabled) sfx.playError()
    setStreak(0)
    setTotalAttempts((prev) => prev + 1)
    setShakeChamber(true)
    setTimeout(() => setShakeChamber(false), 400)

    if (config.maxLives !== null) {
      setLives((prev) => {
        const nextLives = prev - 1
        if (nextLives <= 0) {
          setIsGameOver(true)
          setIsPlaying(false)
          updateHighScore(difficulty, score)
          return 0
        }
        return nextLives
      })
    }

    pickNextSpell()
  }, [soundEnabled, config.maxLives, pickNextSpell, difficulty, score, updateHighScore])

  // Handle Spell Success
  const handleSpellSuccess = useCallback(
    (castSpell: InvokerSpell) => {
      const elapsed = Date.now() - spellStartTimeRef.current
      if (soundEnabled) sfx.playInvokeSuccess()

      setFlashSuccess(true)
      setInvokedSpellName(castSpell.name)
      setTimeout(() => {
        setFlashSuccess(false)
        setInvokedSpellName(null)
      }, 500)

      setReactionTimes((prev) => [...prev, elapsed])
      setTotalAttempts((prev) => prev + 1)
      setCorrectAttempts((prev) => prev + 1)

      const timeBonus = Math.max(0, Math.round(((config.timeLimitMs - elapsed) / config.timeLimitMs) * 150))
      const streakMultiplier = 1 + streak * 0.15
      const gained = Math.round((100 * config.pointMultiplier + timeBonus) * streakMultiplier)

      setScore((prev) => {
        const newScore = prev + gained
        updateHighScore(difficulty, newScore)
        return newScore
      })

      setStreak((prev) => {
        const next = prev + 1
        setBestStreak((b) => Math.max(b, next))
        return next
      })

      pickNextSpell()
    },
    [soundEnabled, config.timeLimitMs, config.pointMultiplier, streak, difficulty, updateHighScore, pickNextSpell]
  )

  // Validate orbs against a target spell
  const checkOrbsMatchSpell = (chamberOrbs: OrbType[], spell: InvokerSpell) => {
    const qCount = chamberOrbs.filter((o) => o === 'Q').length
    const wCount = chamberOrbs.filter((o) => o === 'W').length
    const eCount = chamberOrbs.filter((o) => o === 'E').length
    return qCount === spell.quas && wCount === spell.wex && eCount === spell.exort
  }

  // Find spell matching 3 orbs
  const getSpellFromOrbs = (chamberOrbs: OrbType[]): InvokerSpell | undefined => {
    return INVOKER_SPELLS.find((spell) => checkOrbsMatchSpell(chamberOrbs, spell))
  }

  // Push an orb (Q, W, E)
  const pushOrb = useCallback(
    (orb: OrbType) => {
      if (!isPlaying || isGameOver) return

      if (soundEnabled) {
        if (orb === 'Q') sfx.playQuas()
        else if (orb === 'W') sfx.playWex()
        else if (orb === 'E') sfx.playExort()
      }

      setOrbs((prev) => {
        const newOrbs: OrbType[] = [prev[1], prev[2], orb]

        // Auto-validate immediately once 3 orbs match the requested spell!
        if (checkOrbsMatchSpell(newOrbs, activeSpell)) {
          // Trigger instant cast!
          setTimeout(() => handleSpellSuccess(activeSpell), 10)
        }

        return newOrbs
      })
    },
    [isPlaying, isGameOver, soundEnabled, activeSpell, handleSpellSuccess]
  )

  // Manual Invoke Action (Key R or Space or Click)
  const invokeCurrent = useCallback(() => {
    if (!isPlaying || isGameOver) return

    if (checkOrbsMatchSpell(orbs, activeSpell)) {
      handleSpellSuccess(activeSpell)
    } else {
      handleSpellFail()
    }
  }, [isPlaying, isGameOver, orbs, activeSpell, handleSpellSuccess, handleSpellFail])

  // Active Timer Loop
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current)
      return
    }

    const updateTimer = () => {
      const elapsed = Date.now() - spellStartTimeRef.current
      const remaining = config.timeLimitMs - elapsed

      if (remaining <= 0) {
        setTimerProgress(0)
        handleSpellFail()
      } else {
        setTimerProgress((remaining / config.timeLimitMs) * 100)
        timerFrameRef.current = requestAnimationFrame(updateTimer)
      }
    }

    timerFrameRef.current = requestAnimationFrame(updateTimer)

    return () => {
      if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current)
    }
  }, [isPlaying, isGameOver, currentSpellIndex, config.timeLimitMs, handleSpellFail])

  // Global Keyboard Listener
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      if (key === 'escape') {
        onClose()
        return
      }

      if (!isPlaying || isGameOver) {
        if (e.key === ' ' || key === 'enter') {
          e.preventDefault()
          startGame()
        }
        return
      }

      if (key === 'q') {
        e.preventDefault()
        pushOrb('Q')
      } else if (key === 'w') {
        e.preventDefault()
        pushOrb('W')
      } else if (key === 'e') {
        e.preventDefault()
        pushOrb('E')
      } else if (key === 'r' || e.key === ' ') {
        e.preventDefault()
        invokeCurrent()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPlaying, isGameOver, pushOrb, invokeCurrent, startGame, onClose])

  if (!isOpen) return null

  // Telemetry Calculations
  const avgReactionTime =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100
  const currentInvokedCandidate = getSpellFromOrbs(orbs)

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in-0 duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#090d16] p-4 sm:p-6 shadow-2xl flex flex-col gap-4 font-sans text-slate-100">
        {/* Top Header & Difficulty Selector */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950 via-slate-900 to-purple-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Invoker Spell Trainer
                </h1>
                <span className="rounded-full border border-purple-500/40 bg-purple-950/60 px-2 py-0.5 font-mono text-[10px] text-purple-300">
                  Dota 2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Master the 10 spells of Carl the Arsenal Magus
              </p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2">
            {isPlaying && (
              <button
                type="button"
                onClick={() => startGame()}
                className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Restart Trainer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-rose-950/40 hover:border-rose-500/40 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Difficulty Tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
            {(['novice', 'magus', 'grandmaster'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDifficulty(d)
                  if (isPlaying) startGame(d)
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                  difficulty === d
                    ? d === 'novice'
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : d === 'magus'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {d === 'novice' ? 'Novice' : d === 'magus' ? 'Magus' : 'Grandmaster'}
              </button>
            ))}
          </div>

          {/* Difficulty Info Tooltip pill */}
          <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
            {config.description}
          </span>
        </div>

        {/* Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5">
            <span className="text-slate-400 text-[10px] uppercase">Score</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-base font-bold text-white">{score}</span>
              <span className="text-[10px] text-amber-400">Best: {highScores[difficulty]}</span>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5">
            <span className="text-slate-400 text-[10px] uppercase">Streak</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className={`h-4 w-4 ${streak > 2 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <span className="text-base font-bold text-white">{streak}x</span>
              <span className="text-[10px] text-slate-500 ml-auto">Max: {bestStreak}</span>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5">
            <span className="text-slate-400 text-[10px] uppercase">Avg Speed</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-base font-bold text-cyan-300">
                {avgReactionTime ? `${avgReactionTime}ms` : '--'}
              </span>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5">
            <span className="text-slate-400 text-[10px] uppercase">
              {config.maxLives !== null ? 'Lives' : 'Accuracy'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {config.maxLives !== null ? (
                Array.from({ length: config.maxLives }).map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block h-3.5 w-3.5 rounded-full ${
                      i < lives
                        ? difficulty === 'grandmaster'
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                          : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))
              ) : (
                <span className="text-base font-bold text-emerald-400">{accuracy}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Central Arena: Active Spell Card & Timer */}
        <div
          className={`relative overflow-hidden rounded-2xl border-2 p-5 sm:p-6 transition-all duration-200 ${
            flashSuccess
              ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
              : shakeChamber
              ? 'border-rose-500 bg-rose-950/20 animate-shake shadow-[0_0_40px_rgba(244,63,94,0.3)]'
              : 'border-slate-800 bg-slate-950/80'
          }`}
          style={{
            boxShadow: isPlaying ? `0 0 30px ${activeSpell.glowColor}` : undefined,
          }}
        >
          {/* Linear countdown timer bar */}
          {isPlaying && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800/80">
              <div
                className={`h-full transition-all duration-75 ${
                  timerProgress > 50
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    : timerProgress > 25
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-600 to-rose-400 animate-pulse'
                }`}
                style={{ width: `${timerProgress}%` }}
              />
            </div>
          )}

          {/* Flash success banner */}
          {flashSuccess && invokedSpellName && (
            <div className="absolute inset-x-0 top-3 z-20 flex justify-center">
              <span className="rounded-full bg-emerald-500/90 px-4 py-1 font-mono text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-in zoom-in-90 duration-150">
                ✨ INVOKED: {invokedSpellName.toUpperCase()}!
              </span>
            </div>
          )}

          {!isPlaying || isGameOver ? (
            /* Idle / Game Over Start Screen */
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-950/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                {isGameOver ? <ShieldAlert className="h-8 w-8 text-rose-400" /> : <Trophy className="h-8 w-8 text-amber-400" />}
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isGameOver ? 'ROUND OVER' : 'READY TO INVOKE?'}
                </h2>
                <p className="text-xs text-slate-400 max-w-sm">
                  {isGameOver
                    ? `Final Score: ${score} • Best Streak: ${bestStreak} • Avg Time: ${avgReactionTime || 0}ms`
                    : `Test your muscle memory. Press Q (Quas), W (Wex), and E (Exort) to form spells.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => startGame()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-400 text-slate-950 font-extrabold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 cursor-pointer transition-all"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{isGameOver ? 'Play Again [Space]' : 'Start Trainer [Space]'}</span>
              </button>
            </div>
          ) : (
            /* Active Game Spell Display */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
              {/* Spell Icon + Info */}
              <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                <div
                  className="relative p-1 rounded-2xl border-2 transition-transform duration-150"
                  style={{
                    borderColor: activeSpell.accentColor,
                    boxShadow: `0 0 25px ${activeSpell.glowColor}`,
                  }}
                >
                  <SpellIcon spellId={activeSpell.id} className="w-20 h-20 sm:w-24 sm:h-24" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      Target Spell
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      style={{
                        backgroundColor: `${activeSpell.accentColor}20`,
                        color: activeSpell.accentColor,
                        border: `1px solid ${activeSpell.accentColor}40`,
                      }}
                    >
                      {activeSpell.lore}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {activeSpell.name}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm line-clamp-2">
                    {activeSpell.flavor}
                  </p>
                </div>
              </div>

              {/* Spell Combination Guide / Hint */}
              <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {config.showHint ? 'Orb Combination' : 'Combination Hidden'}
                </span>

                {config.showHint ? (
                  <div className="flex items-center gap-1.5 font-mono">
                    {activeSpell.canonicalOrder.split(' - ').map((orbKey, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shadow-md border ${
                          orbKey === 'Q'
                            ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                            : orbKey === 'W'
                            ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                            : 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        }`}
                      >
                        {orbKey}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-mono">
                    {[1, 2, 3].map((num) => (
                      <span
                        key={num}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-500 font-bold text-sm"
                      >
                        ?
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3-Orb Active Chamber Buffer & Controls */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Orb Chamber:</span>
            <span>
              {currentInvokedCandidate ? (
                <span className="text-white font-bold">
                  Forms: <span style={{ color: currentInvokedCandidate.accentColor }}>{currentInvokedCandidate.name}</span>
                </span>
              ) : (
                'Queue 3 elements'
              )}
            </span>
          </div>

          {/* Real-time 3 Orbs Display */}
          <div className="flex items-center justify-center gap-4 py-1">
            {orbs.map((orb, idx) => {
              const isQ = orb === 'Q'
              const isW = orb === 'W'

              return (
                <div
                  key={idx}
                  className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 transition-all duration-150 ${
                    isQ
                      ? 'border-cyan-400 bg-gradient-to-b from-cyan-900/60 to-cyan-950/90 shadow-[0_0_20px_rgba(6,182,212,0.5)] text-cyan-300'
                      : isW
                      ? 'border-purple-400 bg-gradient-to-b from-purple-900/60 to-purple-950/90 shadow-[0_0_20px_rgba(168,85,247,0.5)] text-purple-300'
                      : 'border-amber-400 bg-gradient-to-b from-amber-900/60 to-amber-950/90 shadow-[0_0_20px_rgba(245,158,11,0.5)] text-amber-300'
                  }`}
                >
                  <span className="font-mono text-xl sm:text-2xl font-black">{orb}</span>
                  <span className="absolute bottom-1 text-[9px] font-mono opacity-70">
                    {isQ ? 'Quas' : isW ? 'Wex' : 'Exort'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Interactive Keyboard Tap Buttons (Q, W, E, Invoke) */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => pushOrb('Q')}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 hover:border-cyan-400 text-cyan-300 font-mono transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            >
              <span className="text-base font-black">Q</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Quas</span>
            </button>

            <button
              type="button"
              onClick={() => pushOrb('W')}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-950/60 hover:border-purple-400 text-purple-300 font-mono transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.15)]"
            >
              <span className="text-base font-black">W</span>
              <span className="text-[10px] text-purple-400 font-semibold">Wex</span>
            </button>

            <button
              type="button"
              onClick={() => pushOrb('E')}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-950/60 hover:border-amber-400 text-amber-300 font-mono transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            >
              <span className="text-base font-black">E</span>
              <span className="text-[10px] text-amber-400 font-semibold">Exort</span>
            </button>

            <button
              type="button"
              onClick={invokeCurrent}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 hover:border-slate-500 text-white font-mono transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <span className="text-base font-black text-amber-400">R</span>
              <span className="text-[10px] text-slate-300 font-semibold">Invoke</span>
            </button>
          </div>
        </div>

        {/* Footer Keys & Tip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span>Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">Q / W / E</kbd>
            <span>Orbs</span>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">R / Space</kbd>
            <span>Invoke</span>
          </div>

          <div className="text-slate-500">
            Dota 2 Invoker Spell Knowledge Practice
          </div>
        </div>
      </div>
    </div>
  )
}
