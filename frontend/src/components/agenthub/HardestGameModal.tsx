import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Skull,
  Gamepad2,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react'

interface HardestGameModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Point {
  x: number
  y: number
}

interface Enemy {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
  orbitRadius?: number
  angle?: number
  angularSpeed?: number
  cx?: number
  cy?: number
}

interface Coin {
  id: number
  x: number
  y: number
  collected: boolean
}

interface Wall {
  x: number
  y: number
  w: number
  h: number
}

interface LevelConfig {
  id: number
  name: string
  subtitle: string
  arena: { x: number; y: number; w: number; h: number }
  startZone: { x: number; y: number; w: number; h: number }
  goalZone: { x: number; y: number; w: number; h: number }
  playerStart: Point
  walls?: Wall[]
  enemies: Enemy[]
  coins: Coin[]
}

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 400
const TILE_SIZE = 32
const PLAYER_SIZE = 18
const PLAYER_SPEED = 3.6

// Web Audio API Synthesizer for 8-bit sound effects & jumpscare audio
class SoundFX {
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

  playCoin() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(660, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // Audio error suppressed
    }
  }

  playWin() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const notes = [440, 554, 659, 880]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1)
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + idx * 0.1)
        osc.stop(ctx.currentTime + idx * 0.1 + 0.22)
      })
    } catch {
      // Audio error suppressed
    }
  }

  playJumpscare() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      // Create harsh discordant screech + deep sub-bass drop
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const osc3 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sawtooth'
      osc1.frequency.setValueAtTime(140, ctx.currentTime)
      osc1.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.8)

      osc2.type = 'square'
      osc2.frequency.setValueAtTime(320, ctx.currentTime)
      osc2.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.6)

      osc3.type = 'sawtooth'
      osc3.frequency.setValueAtTime(800, ctx.currentTime)
      osc3.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4)

      gain.gain.setValueAtTime(0.35, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9)

      osc1.connect(gain)
      osc2.connect(gain)
      osc3.connect(gain)
      gain.connect(ctx.destination)

      osc1.start()
      osc2.start()
      osc3.start()
      osc1.stop(ctx.currentTime + 0.9)
      osc2.stop(ctx.currentTime + 0.9)
      osc3.stop(ctx.currentTime + 0.9)
    } catch {
      // Audio error suppressed
    }
  }
}

const sfx = new SoundFX()

// Level Definitions (4 custom engineered levels)
const createLevels = (): LevelConfig[] => [
  // Level 1: The Oscillating Gauntlet
  {
    id: 1,
    name: 'Level 1: The Gauntlet',
    subtitle: 'Dodge the alternating oscillating blue spheres to reach the green zone.',
    arena: { x: 32, y: 64, w: 576, h: 288 },
    startZone: { x: 32, y: 64, w: 96, h: 288 },
    goalZone: { x: 512, y: 64, w: 96, h: 288 },
    playerStart: { x: 70, y: 195 },
    enemies: [
      { x: 170, y: 80, vx: 0, vy: 3.4, radius: 8, minY: 75, maxY: 335 },
      { x: 225, y: 320, vx: 0, vy: -3.4, radius: 8, minY: 75, maxY: 335 },
      { x: 280, y: 80, vx: 0, vy: 3.4, radius: 8, minY: 75, maxY: 335 },
      { x: 335, y: 320, vx: 0, vy: -3.4, radius: 8, minY: 75, maxY: 335 },
      { x: 390, y: 80, vx: 0, vy: 3.4, radius: 8, minY: 75, maxY: 335 },
      { x: 445, y: 320, vx: 0, vy: -3.4, radius: 8, minY: 75, maxY: 335 },
    ],
    coins: [],
  },

  // Level 2: Crossfire & The Central Key
  {
    id: 2,
    name: 'Level 2: Crossfire & The Key',
    subtitle: 'Collect the central yellow coin and dodge the horizontal hazard fire to open the exit.',
    arena: { x: 32, y: 64, w: 576, h: 288 },
    startZone: { x: 32, y: 64, w: 96, h: 288 },
    goalZone: { x: 512, y: 64, w: 96, h: 288 },
    playerStart: { x: 70, y: 195 },
    enemies: [
      // Top horizontal sweepers
      { x: 150, y: 110, vx: 4.2, vy: 0, radius: 8, minX: 140, maxX: 490 },
      { x: 450, y: 150, vx: -4.2, vy: 0, radius: 8, minX: 140, maxX: 490 },
      // Bottom horizontal sweepers
      { x: 150, y: 260, vx: 4.2, vy: 0, radius: 8, minX: 140, maxX: 490 },
      { x: 450, y: 300, vx: -4.2, vy: 0, radius: 8, minX: 140, maxX: 490 },
      // Vertical central defenders
      { x: 270, y: 90, vx: 0, vy: 3.8, radius: 8, minY: 80, maxY: 330 },
      { x: 350, y: 310, vx: 0, vy: -3.8, radius: 8, minY: 80, maxY: 330 },
    ],
    coins: [{ id: 1, x: 310, y: 200, collected: false }],
  },

  // Level 3: The Orbital Vortex
  {
    id: 3,
    name: 'Level 3: The Orbital Vortex',
    subtitle: 'Gather both gold coins from opposite corners while navigating spinning hazard rings.',
    arena: { x: 32, y: 48, w: 576, h: 320 },
    startZone: { x: 32, y: 48, w: 100, h: 100 },
    goalZone: { x: 508, y: 268, w: 100, h: 100 },
    playerStart: { x: 72, y: 88 },
    enemies: [
      // Orbiting ring 1 (Inner)
      { x: 320, y: 208, vx: 0, vy: 0, radius: 8, cx: 320, cy: 208, orbitRadius: 65, angle: 0, angularSpeed: 0.045 },
      { x: 320, y: 208, vx: 0, vy: 0, radius: 8, cx: 320, cy: 208, orbitRadius: 65, angle: Math.PI, angularSpeed: 0.045 },
      // Orbiting ring 2 (Middle)
      { x: 320, y: 208, vx: 0, vy: 0, radius: 8, cx: 320, cy: 208, orbitRadius: 115, angle: Math.PI / 2, angularSpeed: -0.035 },
      { x: 320, y: 208, vx: 0, vy: 0, radius: 8, cx: 320, cy: 208, orbitRadius: 115, angle: (3 * Math.PI) / 2, angularSpeed: -0.035 },
      // Corner patrollers
      { x: 180, y: 80, vx: 0, vy: 3.5, radius: 8, minY: 65, maxY: 345 },
      { x: 440, y: 340, vx: 0, vy: -3.5, radius: 8, minY: 65, maxY: 345 },
    ],
    coins: [
      { id: 1, x: 72, y: 310, collected: false },
      { id: 2, x: 548, y: 88, collected: false },
    ],
  },

  // Level 4: The Speed Gauntlet (The Final Trial)
  {
    id: 4,
    name: 'Level 4: The Final Trial',
    subtitle: 'Maximum precision required. Grab all 3 coins across opposing high-speed wave barriers.',
    arena: { x: 32, y: 48, w: 576, h: 320 },
    startZone: { x: 32, y: 160, w: 80, h: 96 },
    goalZone: { x: 528, y: 160, w: 80, h: 96 },
    playerStart: { x: 62, y: 200 },
    enemies: [
      // 8 Fast alternating vertical bounce waves
      { x: 150, y: 65, vx: 0, vy: 4.8, radius: 7.5, minY: 60, maxY: 350 },
      { x: 200, y: 345, vx: 0, vy: -4.8, radius: 7.5, minY: 60, maxY: 350 },
      { x: 250, y: 65, vx: 0, vy: 4.8, radius: 7.5, minY: 60, maxY: 350 },
      { x: 300, y: 345, vx: 0, vy: -4.8, radius: 7.5, minY: 60, maxY: 350 },
      { x: 350, y: 65, vx: 0, vy: 4.8, radius: 7.5, minY: 60, maxY: 350 },
      { x: 400, y: 345, vx: 0, vy: -4.8, radius: 7.5, minY: 60, maxY: 350 },
      { x: 450, y: 65, vx: 0, vy: 4.8, radius: 7.5, minY: 60, maxY: 350 },
      { x: 490, y: 345, vx: 0, vy: -4.8, radius: 7.5, minY: 60, maxY: 350 },
    ],
    coins: [
      { id: 1, x: 200, y: 80, collected: false },
      { id: 2, x: 325, y: 200, collected: false },
      { id: 3, x: 450, y: 330, collected: false },
    ],
  },
]

export const HardestGameModal: React.FC<HardestGameModalProps> = ({
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Game States
  const [levelIndex, setLevelIndex] = useState(0)
  const [deaths, setDeaths] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isWon, setIsWon] = useState(false)

  // Loss / Death Video Overlay State (Doggie crashout on GRIEF to track Stalemate)
  const [showDeathMoment, setShowDeathMoment] = useState(false)
  const [deathKey, setDeathKey] = useState(0)
  const deathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deathVideoRef = useRef<HTMLVideoElement | null>(null)

  // Active Level Clone
  const levelsRef = useRef<LevelConfig[]>(createLevels())
  const currentLevel = levelsRef.current[levelIndex]

  // Player Position & Keys
  const playerRef = useRef<Point>({ ...currentLevel.playerStart })
  const keysRef = useRef<{ [key: string]: boolean }>({})

  // Coins State for current level
  const [coinsRemaining, setCoinsRemaining] = useState(
    currentLevel.coins.filter((c) => !c.collected).length
  )

  // Dismiss death screen and respawn player
  const dismissDeathAndRespawn = useCallback(() => {
    setShowDeathMoment(false)
    if (deathTimerRef.current) clearTimeout(deathTimerRef.current)
    const lvl = levelsRef.current[levelIndex]
    playerRef.current = { ...lvl.playerStart }
    lvl.coins.forEach((c) => (c.collected = false))
    setCoinsRemaining(lvl.coins.length)
  }, [levelIndex])

  // Sync Level Change
  const resetToLevel = useCallback((idx: number) => {
    setLevelIndex(idx)
    const freshLevels = createLevels()
    levelsRef.current = freshLevels
    const lvl = freshLevels[idx]
    playerRef.current = { ...lvl.playerStart }
    setCoinsRemaining(lvl.coins.length)
    setIsWon(false)
    setShowDeathMoment(false)
    if (deathTimerRef.current) clearTimeout(deathTimerRef.current)
  }, [])

  // Hard Reset Entire Game
  const restartAll = useCallback(() => {
    setDeaths(0)
    resetToLevel(0)
  }, [resetToLevel])

  // Trigger Loss / Death Video Moment (1.8s Keyboard Smash to Stalemate drop)
  const triggerDeath = useCallback(() => {
    setDeaths((prev) => prev + 1)
    setDeathKey((prev) => prev + 1)
    setShowDeathMoment(true)

    // Clear existing timer if any
    if (deathTimerRef.current) clearTimeout(deathTimerRef.current)

    // Auto-dismiss after 3.2 seconds if player doesn't skip
    deathTimerRef.current = setTimeout(() => {
      dismissDeathAndRespawn()
    }, 3200)
  }, [dismissDeathAndRespawn])

  // Autoplay video on loss
  useEffect(() => {
    if (showDeathMoment && deathVideoRef.current) {
      deathVideoRef.current.currentTime = 0
      deathVideoRef.current.volume = soundEnabled ? 1.0 : 0.0
      deathVideoRef.current.play().catch(() => {
        if (deathVideoRef.current) {
          deathVideoRef.current.muted = true
          deathVideoRef.current.play().catch(() => {})
        }
      })
    }
  }, [showDeathMoment, deathKey, soundEnabled])

  // Keyboard Event Listeners
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key.toLowerCase() === 'r') {
        // Restart level
        const lvl = levelsRef.current[levelIndex]
        playerRef.current = { ...lvl.playerStart }
        lvl.coins.forEach((c) => (c.collected = false))
        setCoinsRemaining(lvl.coins.length)
        setShowDeathMoment(false)
        if (deathTimerRef.current) clearTimeout(deathTimerRef.current)
        return
      }

      if (e.key.toLowerCase() === 'p') {
        setIsPaused((prev) => !prev)
        return
      }

      if (e.key.toLowerCase() === 'm') {
        setSoundEnabled((prev) => !prev)
        return
      }

      // If death moment video is active, pressing Space, Enter, or Escape respawns immediately
      if (showDeathMoment && (e.key === ' ' || e.key === 'Enter')) {
        dismissDeathAndRespawn()
        return
      }

      keysRef.current[e.key.toLowerCase()] = true
      keysRef.current[e.key] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
      keysRef.current[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isOpen, onClose, showDeathMoment, levelIndex, dismissDeathAndRespawn])

  // Main Canvas 60 FPS Game Loop
  useEffect(() => {
    if (!isOpen || isPaused || showDeathMoment || isWon) return

    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const loop = () => {
      const lvl = levelsRef.current[levelIndex]

      // 1. Process Player Input & Movement
      let dx = 0
      let dy = 0
      if (keysRef.current['arrowleft'] || keysRef.current['a']) dx -= PLAYER_SPEED
      if (keysRef.current['arrowright'] || keysRef.current['d']) dx += PLAYER_SPEED
      if (keysRef.current['arrowup'] || keysRef.current['w']) dy -= PLAYER_SPEED
      if (keysRef.current['arrowdown'] || keysRef.current['s']) dy += PLAYER_SPEED

      // Diagonal speed normalization
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071
        dy *= 0.7071
      }

      // Proposed new player coords
      const nextX = playerRef.current.x + dx
      const nextY = playerRef.current.y + dy

      // Boundary Collision with Arena
      const minX = lvl.arena.x
      const maxX = lvl.arena.x + lvl.arena.w - PLAYER_SIZE
      const minY = lvl.arena.y
      const maxY = lvl.arena.y + lvl.arena.h - PLAYER_SIZE

      playerRef.current.x = Math.max(minX, Math.min(maxX, nextX))
      playerRef.current.y = Math.max(minY, Math.min(maxY, nextY))

      // 2. Update Enemy Obstacles
      lvl.enemies.forEach((enemy) => {
        if (enemy.orbitRadius !== undefined && enemy.cx !== undefined && enemy.cy !== undefined && enemy.angle !== undefined && enemy.angularSpeed !== undefined) {
          // Circular / Orbital trajectory
          enemy.angle += enemy.angularSpeed
          enemy.x = enemy.cx + Math.cos(enemy.angle) * enemy.orbitRadius
          enemy.y = enemy.cy + Math.sin(enemy.angle) * enemy.orbitRadius
        } else {
          // Linear oscillating trajectory
          enemy.x += enemy.vx
          enemy.y += enemy.vy

          if (enemy.minX !== undefined && enemy.maxX !== undefined) {
            if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
              enemy.vx *= -1
            }
          }
          if (enemy.minY !== undefined && enemy.maxY !== undefined) {
            if (enemy.y <= enemy.minY || enemy.y >= enemy.maxY) {
              enemy.vy *= -1
            }
          }
        }
      })

      // 3. Collision Detection: Player vs Enemies
      const px = playerRef.current.x
      const py = playerRef.current.y
      const pw = PLAYER_SIZE
      const ph = PLAYER_SIZE

      let collision = false
      for (const enemy of lvl.enemies) {
        // Circle vs AABB collision
        const closestX = Math.max(px, Math.min(enemy.x, px + pw))
        const closestY = Math.max(py, Math.min(enemy.y, py + ph))
        const distX = enemy.x - closestX
        const distY = enemy.y - closestY
        const distSq = distX * distX + distY * distY

        if (distSq < enemy.radius * enemy.radius) {
          collision = true
          break
        }
      }

      if (collision) {
        triggerDeath()
        return
      }

      // 4. Coin Collection
      lvl.coins.forEach((coin) => {
        if (!coin.collected) {
          const cDistX = coin.x - (px + pw / 2)
          const cDistY = coin.y - (py + ph / 2)
          const dist = Math.sqrt(cDistX * cDistX + cDistY * cDistY)
          if (dist < 14) {
            coin.collected = true
            if (soundEnabled) sfx.playCoin()
            setCoinsRemaining(lvl.coins.filter((c) => !c.collected).length)
          }
        }
      })

      // 5. Goal Detection
      const allCoinsCollected = lvl.coins.every((c) => c.collected)
      const inGoalX = px + pw > lvl.goalZone.x && px < lvl.goalZone.x + lvl.goalZone.w
      const inGoalY = py + ph > lvl.goalZone.y && py < lvl.goalZone.y + lvl.goalZone.h

      if (inGoalX && inGoalY && allCoinsCollected) {
        if (soundEnabled) sfx.playWin()
        if (levelIndex + 1 < levelsRef.current.length) {
          resetToLevel(levelIndex + 1)
        } else {
          setIsWon(true)
        }
        return
      }

      // 6. Draw Canvas Frame
      // A. Dark Outer Background
      ctx.fillStyle = '#060911'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // B. Checkerboard Arena Tiles
      const arena = lvl.arena
      const cols = arena.w / TILE_SIZE
      const rows = arena.h / TILE_SIZE

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tileX = arena.x + c * TILE_SIZE
          const tileY = arena.y + r * TILE_SIZE
          ctx.fillStyle = (r + c) % 2 === 0 ? '#0b111e' : '#080d18'
          ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
        }
      }

      // Arena Outer Border
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 3
      ctx.strokeRect(arena.x, arena.y, arena.w, arena.h)

      // C. Safe Zones (Start & Goal)
      // Start Zone (Emerald)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)'
      ctx.fillRect(lvl.startZone.x, lvl.startZone.y, lvl.startZone.w, lvl.startZone.h)
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.strokeRect(lvl.startZone.x, lvl.startZone.y, lvl.startZone.w, lvl.startZone.h)

      // Goal Zone (Emerald or Locked Amber)
      if (allCoinsCollected) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.28)'
        ctx.fillRect(lvl.goalZone.x, lvl.goalZone.y, lvl.goalZone.w, lvl.goalZone.h)
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.strokeRect(lvl.goalZone.x, lvl.goalZone.y, lvl.goalZone.w, lvl.goalZone.h)
      } else {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'
        ctx.fillRect(lvl.goalZone.x, lvl.goalZone.y, lvl.goalZone.w, lvl.goalZone.h)
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.strokeRect(lvl.goalZone.x, lvl.goalZone.y, lvl.goalZone.w, lvl.goalZone.h)
        ctx.setLineDash([])
      }

      // Labels on zones
      ctx.font = 'bold 9px monospace'
      ctx.fillStyle = '#6ee7b7'
      ctx.fillText('START', lvl.startZone.x + 8, lvl.startZone.y + 16)

      ctx.fillStyle = allCoinsCollected ? '#6ee7b7' : '#fcd34d'
      ctx.fillText(allCoinsCollected ? 'GOAL' : 'LOCKED', lvl.goalZone.x + 8, lvl.goalZone.y + 16)

      // D. Draw Coins
      lvl.coins.forEach((coin) => {
        if (!coin.collected) {
          ctx.save()
          ctx.beginPath()
          ctx.arc(coin.x, coin.y, 6.5, 0, Math.PI * 2)
          ctx.fillStyle = '#fbbf24'
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.restore()
        }
      })

      // E. Draw Blue Enemies
      lvl.enemies.forEach((enemy) => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2)
        ctx.fillStyle = '#0284c7'
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.strokeStyle = '#e0f2fe'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
      })

      // F. Draw Player (Red Square with dark border)
      ctx.save()
      ctx.fillStyle = '#ef4444'
      ctx.shadowColor = 'rgba(239, 68, 68, 0.6)'
      ctx.shadowBlur = 8
      ctx.fillRect(px, py, pw, ph)

      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2.5
      ctx.strokeRect(px, py, pw, ph)

      // Inner accent square
      ctx.fillStyle = '#f87171'
      ctx.fillRect(px + 4, py + 4, pw - 8, ph - 8)
      ctx.restore()

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [isOpen, isPaused, showDeathMoment, isWon, levelIndex, soundEnabled, triggerDeath, resetToLevel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Background backdrop blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Main Game Modal Box */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-rose-500/40 bg-[#070b13] p-5 shadow-[0_0_60px_rgba(244,63,94,0.25)] z-10 space-y-4 text-white">
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-white font-mono">
                  The World&apos;s <span className="text-rose-500">Hardest</span> Game
                </h3>
                <span className="rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-500/30 font-bold">
                  Secret Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {currentLevel.name} &bull; {currentLevel.subtitle}
              </p>
            </div>
          </div>

          {/* HUD Stats & Actions */}
          <div className="flex items-center gap-2 font-mono">
            {/* Deaths Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
              <Skull className="h-3.5 w-3.5 text-rose-400" />
              <span>FAILS:</span>
              <span className="font-bold text-white">{deaths}</span>
            </div>

            {/* Coins Counter if applicable */}
            {currentLevel.coins.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>COINS:</span>
                <span className="font-bold text-white">
                  {currentLevel.coins.length - coinsRemaining} / {currentLevel.coins.length}
                </span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
              title={soundEnabled ? 'Mute Audio (M)' : 'Unmute Audio (M)'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Pause Button */}
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
              title={isPaused ? 'Resume (P)' : 'Pause (P)'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>

            {/* Restart Level Button */}
            <button
              type="button"
              onClick={() => resetToLevel(levelIndex)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
              title="Restart Level (R)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Canvas Game Area with relative overlays */}
        <div className="relative mx-auto flex items-center justify-center rounded-xl border-2 border-slate-800 bg-black overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block max-w-full h-auto aspect-[16/10]"
          />

          {/* LOSS MOMENT VIDEO OVERLAY: Doggie Breaks His Keyboard (Track: Stalemate) */}
          {showDeathMoment && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 p-3 sm:p-4 text-white animate-in zoom-in-95 duration-150 select-none"
              style={{
                boxShadow: 'inset 0 0 100px rgba(220, 38, 38, 0.75)',
              }}
            >
              {/* Header Badges */}
              <div className="w-full max-w-lg flex items-center justify-between gap-2 mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono text-xs font-bold text-rose-400">
                    💥 Doggie Crashed Out on GRIEF!
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <span>Track:</span>
                  <span className="font-bold text-white">KzX — Stalemate</span>
                </div>
              </div>

              {/* Keyboard Destruction Video (1.8s moment to track Stalemate) */}
              <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border-2 border-rose-500/70 shadow-[0_0_50px_rgba(244,63,94,0.6)] bg-black">
                <video
                  ref={deathVideoRef}
                  key={deathKey}
                  src="/doggie-crashout.mp4"
                  autoPlay
                  playsInline
                  loop
                  muted={!soundEnabled}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action Bar & Quick Respawn */}
              <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800 font-mono text-xs">
                <div className="flex items-center gap-2 text-rose-300">
                  <Skull className="h-4 w-4 text-rose-500" />
                  <span className="font-bold text-white">DEATH #{deaths}</span>
                  <span className="text-slate-400 text-[11px]">&bull; Failed on {currentLevel.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={dismissDeathAndRespawn}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Respawn [Space]</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paused Overlay */}
          {isPaused && !showDeathMoment && !isWon && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xs text-center space-y-3 font-mono">
              <span className="text-cyan-400 font-bold text-2xl tracking-wider">PAUSED</span>
              <p className="text-xs text-slate-400">Press P or Resume to continue</p>
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:brightness-110 cursor-pointer"
              >
                Resume Game
              </button>
            </div>
          )}

          {/* Final Victory Screen */}
          {isWon && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-6 text-center space-y-4 font-mono">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                <Trophy className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  YOU CONQUERED THE IMPOSSIBLE!
                </h2>
                <p className="text-xs text-emerald-400 font-bold">
                  All 4 Levels Completed &bull; Total Deaths: {deaths}
                </p>
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                You proved your reflexes against The World&apos;s Hardest Game inside AgentHub.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={restartAll}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Play Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Close Game
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Level Selector & Keyboard Instructions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-[11px] font-mono text-slate-400 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span>Level:</span>
            <div className="flex items-center gap-1">
              {levelsRef.current.map((lvl, idx) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => resetToLevel(idx)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    levelIndex === idx
                      ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {lvl.id}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">WASD / Arrows</kbd> Move
            </span>
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">R</kbd> Restart
            </span>
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">P</kbd> Pause
            </span>
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">Esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
