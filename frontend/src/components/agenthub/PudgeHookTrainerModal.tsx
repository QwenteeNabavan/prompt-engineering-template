import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  Flame,
  Sparkles,
  ShieldAlert,
  Play,
  Clock,
  Heart,
  HelpCircle,
} from 'lucide-react'

interface PudgeHookTrainerModalProps {
  isOpen: boolean
  onClose: () => void
}

type GameMode = 'time_attack' | 'three_strikes' | 'practice'

interface TargetEntity {
  id: number
  type: 'creep' | 'cm' | 'sniper' | 'windranger' | 'am' | 'courier'
  name: string
  x: number
  y: number
  vx: number
  radius: number
  points: number
  color: string
  accentColor: string
  blinkCooldown?: number
  isBlinking?: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  radius: number
  life: number
  maxLife: number
}

interface FloatingText {
  id: number
  text: string
  x: number
  y: number
  color: string
  life: number
  maxLife: number
  fontSize: number
}

export const PudgeHookTrainerModal: React.FC<PudgeHookTrainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Game Settings & Modes
  const [gameMode, setGameMode] = useState<GameMode>('time_attack')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0)

  // Score & Performance Telemetry
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('agenthub_pudge_highscore') || '0', 10)
    } catch {
      return 0
    }
  })
  const [hooksThrown, setHooksThrown] = useState<number>(0)
  const [hooksLanded, setHooksLanded] = useState<number>(0)
  const [streak, setStreak] = useState<number>(0)
  const [maxStreak, setMaxStreak] = useState<number>(0)
  const [lives, setLives] = useState<number>(3)
  const [timeLeft, setTimeLeft] = useState<number>(60)

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Aim & Mouse Tracking
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 400, y: 200 })

  // Hook State Ref
  const hookRef = useRef<{
    state: 'IDLE' | 'FLYING' | 'HOOKED_RETRACT' | 'EMPTY_RETRACT'
    originX: number
    originY: number
    x: number
    y: number
    vx: number
    vy: number
    angle: number
    distance: number
    maxDistance: number
    hookedTarget: TargetEntity | null
  }>({
    state: 'IDLE',
    originX: 400,
    originY: 510,
    x: 400,
    y: 510,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    distance: 0,
    maxDistance: 480,
    hookedTarget: null,
  })

  // Targets & Particles Ref
  const targetsRef = useRef<TargetEntity[]>([])
  const particlesRef = useRef<Particle[]>([])
  const floatingTextsRef = useRef<FloatingText[]>([])
  const animFrameIdRef = useRef<number | null>(null)
  const lastSpawnTimeRef = useRef<number>(0)
  const nextTargetIdRef = useRef<number>(1)
  const nextTextIdRef = useRef<number>(1)

  // Web Audio Procedural Synthesis
  const playSound = useCallback((type: 'throw' | 'hit' | 'miss' | 'reel' | 'cheer') => {
    if (isMuted) return
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime

      if (type === 'throw') {
        // Meat Hook launch whoosh
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(380, now)
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.2)
      } else if (type === 'hit') {
        // Flesh impact squish & heavy thud
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(180, now)
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.25)
        gain.gain.setValueAtTime(0.4, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.26)
      } else if (type === 'miss') {
        // Empty chain retract dull ping
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(120, now)
        osc.frequency.linearRampToValueAtTime(80, now + 0.15)
        gain.gain.setValueAtTime(0.18, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.16)
      } else if (type === 'cheer') {
        // Fresh Meat / Combo high score fanfare
        const notes = [261.63, 329.63, 392.0, 523.25]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, now + idx * 0.08)
          gain.gain.setValueAtTime(0.2, now + idx * 0.08)
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.22)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + idx * 0.08)
          osc.stop(now + idx * 0.08 + 0.24)
        })
      }
    } catch (e) {
      console.error('Audio synthesis failed:', e)
    }
  }, [isMuted])

  // Spawn Target Entity
  const spawnTarget = useCallback(() => {
    const lanes = [110, 180, 255, 335]
    const laneY = lanes[Math.floor(Math.random() * lanes.length)]

    // Don't spawn if lane is crowded
    const inLane = targetsRef.current.filter((t) => Math.abs(t.y - laneY) < 30)
    if (inLane.length >= 2) return

    const fromLeft = Math.random() > 0.5
    const startX = fromLeft ? -40 : 840
    const dir = fromLeft ? 1 : -1

    const roll = Math.random()
    let type: TargetEntity['type'] = 'creep'
    let name = 'Radiant Creep'
    let baseSpeed = 2.2
    let radius = 20
    let points = 100
    let color = '#3b82f6'
    let accentColor = '#60a5fa'

    if (roll < 0.28) {
      type = 'creep'
      name = fromLeft ? 'Radiant Creep' : 'Dire Creep'
      baseSpeed = 2.0
      radius = 19
      points = 100
      color = fromLeft ? '#2563eb' : '#dc2626'
      accentColor = fromLeft ? '#60a5fa' : '#f87171'
    } else if (roll < 0.50) {
      type = 'cm'
      name = 'Crystal Maiden'
      baseSpeed = 1.8
      radius = 21
      points = 150
      color = '#06b6d4'
      accentColor = '#67e8f9'
    } else if (roll < 0.70) {
      type = 'sniper'
      name = 'Sniper'
      baseSpeed = 3.5
      radius = 16
      points = 250
      color = '#f59e0b'
      accentColor = '#fde68a'
    } else if (roll < 0.85) {
      type = 'windranger'
      name = 'Windranger'
      baseSpeed = 4.4
      radius = 17
      points = 350
      color = '#10b981'
      accentColor = '#6ee7b7'
    } else if (roll < 0.94) {
      type = 'am'
      name = 'Anti-Mage'
      baseSpeed = 2.9
      radius = 20
      points = 450
      color = '#8b5cf6'
      accentColor = '#c4b5fd'
    } else {
      type = 'courier'
      name = 'Flying Courier'
      baseSpeed = 5.5
      radius = 14
      points = 600
      color = '#eab308'
      accentColor = '#fef08a'
    }

    const newTarget: TargetEntity = {
      id: nextTargetIdRef.current++,
      type,
      name,
      x: startX,
      y: laneY,
      vx: dir * baseSpeed * speedMultiplier,
      radius,
      points,
      color,
      accentColor,
      blinkCooldown: type === 'am' ? 120 + Math.random() * 80 : undefined,
    }

    targetsRef.current.push(newTarget)
  }, [speedMultiplier])

  // Fire Meat Hook
  const throwHook = useCallback(() => {
    if (!isPlaying || isGameOver) return
    const hook = hookRef.current
    if (hook.state !== 'IDLE') return

    const dx = mousePosRef.current.x - hook.originX
    const dy = mousePosRef.current.y - hook.originY
    const len = Math.hypot(dx, dy)
    if (len < 1) return

    const speed = 22 // Projectile speed
    hook.vx = (dx / len) * speed
    hook.vy = (dy / len) * speed
    hook.angle = Math.atan2(dy, dx)
    hook.x = hook.originX
    hook.y = hook.originY
    hook.distance = 0
    hook.hookedTarget = null
    hook.state = 'FLYING'

    setHooksThrown((prev) => prev + 1)
    playSound('throw')
  }, [isPlaying, isGameOver, playSound])

  // Reset Game
  const startNewGame = useCallback((mode: GameMode = gameMode) => {
    setGameMode(mode)
    setScore(0)
    setHooksThrown(0)
    setHooksLanded(0)
    setStreak(0)
    setMaxStreak(0)
    setLives(3)
    setTimeLeft(60)
    setIsGameOver(false)
    setIsPlaying(true)

    // Reset entities
    targetsRef.current = []
    particlesRef.current = []
    floatingTextsRef.current = []
    hookRef.current.state = 'IDLE'
    hookRef.current.hookedTarget = null

    // Pre-populate river with initial targets
    for (let i = 0; i < 4; i++) {
      spawnTarget()
    }
  }, [gameMode, spawnTarget])

  // Timer Tick (Time Attack Mode)
  useEffect(() => {
    if (!isPlaying || isGameOver || gameMode !== 'time_attack') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsGameOver(true)
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, isGameOver, gameMode])

  // Handle High Score Sync
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      try {
        localStorage.setItem('agenthub_pudge_highscore', score.toString())
      } catch (e) {
        console.error(e)
      }
    }
  }, [score, highScore])

  // Calculate Accuracy
  const accuracy = hooksThrown > 0 ? ((hooksLanded / hooksThrown) * 100).toFixed(1) : '100.0'

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    if (!isOpen) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = (time: number) => {
      const width = canvas.width
      const height = canvas.height

      // 1. Draw River & Environment Background
      ctx.clearRect(0, 0, width, height)

      // Dire top bank (Dark rugged rocks & lava/purple mist)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, width, 85)
      ctx.fillStyle = '#1e1b4b'
      ctx.fillRect(0, 80, width, 6)

      // River Water Area (Flowing current)
      const waterGrad = ctx.createLinearGradient(0, 85, 0, 430)
      waterGrad.addColorStop(0, '#0c4a6e')
      waterGrad.addColorStop(0.5, '#0369a1')
      waterGrad.addColorStop(1, '#075985')
      ctx.fillStyle = waterGrad
      ctx.fillRect(0, 85, width, 345)

      // Animated Water Waves / Current Streaks
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 6; i++) {
        const waveY = 110 + i * 55
        const waveOffset = (time * 0.08 + i * 40) % (width + 100)
        ctx.beginPath()
        ctx.moveTo(waveOffset - 100, waveY)
        ctx.lineTo(waveOffset, waveY)
        ctx.stroke()
      }

      // Radiant bottom bank (Mossy stones & Pudge platform)
      const bankGrad = ctx.createLinearGradient(0, 430, 0, height)
      bankGrad.addColorStop(0, '#14532d')
      bankGrad.addColorStop(0.2, '#064e3b')
      bankGrad.addColorStop(1, '#022c22')
      ctx.fillStyle = bankGrad
      ctx.fillRect(0, 430, width, height - 430)

      // River shorelines
      ctx.fillStyle = '#047857'
      ctx.fillRect(0, 427, width, 4)

      // 2. Spawn and Update Targets
      if (isPlaying && !isGameOver) {
        if (time - lastSpawnTimeRef.current > 1600 / speedMultiplier) {
          spawnTarget()
          lastSpawnTimeRef.current = time
        }
      }

      const hook = hookRef.current

      // Update target positions
      for (let i = targetsRef.current.length - 1; i >= 0; i--) {
        const target = targetsRef.current[i]

        // If target is hooked, it moves with the hook head
        if (hook.state === 'HOOKED_RETRACT' && hook.hookedTarget?.id === target.id) {
          target.x = hook.x
          target.y = hook.y
        } else {
          target.x += target.vx

          // Anti-Mage Blink Mechanic
          if (target.type === 'am' && target.blinkCooldown !== undefined) {
            target.blinkCooldown--
            if (target.blinkCooldown <= 0) {
              // Sudden blink forward 65px
              const blinkDist = (target.vx > 0 ? 1 : -1) * 70
              target.x += blinkDist
              target.blinkCooldown = 150 + Math.random() * 80

              // Blink violet dust particles
              for (let p = 0; p < 8; p++) {
                particlesRef.current.push({
                  x: target.x,
                  y: target.y,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  color: '#c084fc',
                  radius: 3,
                  life: 20,
                  maxLife: 20,
                })
              }
            }
          }

          // Despawn offscreen targets
          if ((target.vx > 0 && target.x > width + 60) || (target.vx < 0 && target.x < -60)) {
            targetsRef.current.splice(i, 1)
            continue
          }
        }

        // Draw Target
        ctx.save()
        ctx.translate(target.x, target.y)

        // Target Aura / Shadow
        ctx.beginPath()
        ctx.arc(0, 0, target.radius + 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.fill()

        // Colored Target Core
        ctx.beginPath()
        ctx.arc(0, 0, target.radius, 0, Math.PI * 2)
        ctx.fillStyle = target.color
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = target.accentColor
        ctx.stroke()

        // Inner icon / rune indicator
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const initials: Record<string, string> = {
          creep: '⚔',
          cm: 'CM',
          sniper: 'SN',
          windranger: 'WR',
          am: 'AM',
          courier: '📦',
        }
        ctx.fillText(initials[target.type] || '★', 0, 1)

        ctx.restore()
      }

      // 3. Update Hook Physics
      if (hook.state === 'FLYING') {
        hook.x += hook.vx
        hook.y += hook.vy
        hook.distance = Math.hypot(hook.x - hook.originX, hook.y - hook.originY)

        // Check Target Collision
        let collided = false
        for (let i = 0; i < targetsRef.current.length; i++) {
          const t = targetsRef.current[i]
          const distToHook = Math.hypot(hook.x - t.x, hook.y - t.y)
          if (distToHook < t.radius + 12) {
            // LATCH HOOK!
            collided = true
            hook.state = 'HOOKED_RETRACT'
            hook.hookedTarget = t

            // Points calculation with streak multiplier
            const mult = Math.min(5, 1 + Math.floor(streak / 3))
            const earnedPoints = t.points * mult
            setScore((prev) => prev + earnedPoints)
            setHooksLanded((prev) => prev + 1)
            setStreak((prev) => {
              const next = prev + 1
              if (next > maxStreak) setMaxStreak(next)
              return next
            })

            // Audio & Splatter
            playSound('hit')
            if (streak >= 3) playSound('cheer')

            // Floating Text
            floatingTextsRef.current.push({
              id: nextTextIdRef.current++,
              text: `+${earnedPoints} ${mult > 1 ? `(x${mult})` : ''}`,
              x: hook.x,
              y: hook.y - 15,
              color: '#38bdf8',
              life: 40,
              maxLife: 40,
              fontSize: 16,
            })

            // Blood & Spark Particles
            for (let p = 0; p < 18; p++) {
              particlesRef.current.push({
                x: hook.x,
                y: hook.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: Math.random() > 0.4 ? '#ef4444' : '#f59e0b',
                radius: 2.5 + Math.random() * 2.5,
                life: 30,
                maxLife: 30,
              })
            }
            break
          }
        }

        // Check if hook reached max distance or out of bounds without hit
        if (!collided && (hook.distance >= hook.maxDistance || hook.y < 40 || hook.x < 10 || hook.x > width - 10)) {
          hook.state = 'EMPTY_RETRACT'
          playSound('miss')
          setStreak(0)

          // In 3 Strikes mode, a miss costs 1 life
          if (gameMode === 'three_strikes') {
            setLives((prev) => {
              const next = prev - 1
              if (next <= 0) {
                setIsGameOver(true)
                setIsPlaying(false)
              }
              return next
            })
          }

          floatingTextsRef.current.push({
            id: nextTextIdRef.current++,
            text: 'MISS!',
            x: hook.x,
            y: hook.y - 10,
            color: '#f43f5e',
            life: 30,
            maxLife: 30,
            fontSize: 13,
          })
        }
      } else if (hook.state === 'HOOKED_RETRACT' || hook.state === 'EMPTY_RETRACT') {
        // Retract back to Pudge origin
        const retractSpeed = hook.state === 'HOOKED_RETRACT' ? 24 : 32
        const dx = hook.originX - hook.x
        const dy = hook.originY - hook.y
        const dist = Math.hypot(dx, dy)

        if (dist <= retractSpeed) {
          // Arrived back at Pudge
          if (hook.state === 'HOOKED_RETRACT' && hook.hookedTarget) {
            // Remove target from game
            targetsRef.current = targetsRef.current.filter((t) => t.id !== hook.hookedTarget?.id)

            // Fresh Meat splash text
            floatingTextsRef.current.push({
              id: nextTextIdRef.current++,
              text: 'FRESH MEAT!',
              x: hook.originX,
              y: hook.originY - 35,
              color: '#facc15',
              life: 35,
              maxLife: 35,
              fontSize: 15,
            })
          }
          hook.state = 'IDLE'
          hook.hookedTarget = null
          hook.x = hook.originX
          hook.y = hook.originY
        } else {
          hook.x += (dx / dist) * retractSpeed
          hook.y += (dy / dist) * retractSpeed
          hook.angle = Math.atan2(dy, dx)
        }
      }

      // 4. Draw Chain Links (if hook is thrown)
      if (hook.state !== 'IDLE') {
        const dx = hook.x - hook.originX
        const dy = hook.y - hook.originY
        const totalDist = Math.hypot(dx, dy)
        const linkSpacing = 14
        const linkCount = Math.floor(totalDist / linkSpacing)

        for (let i = 1; i <= linkCount; i++) {
          const t = i / linkCount
          const linkX = hook.originX + dx * t
          const linkY = hook.originY + dy * t

          ctx.save()
          ctx.translate(linkX, linkY)
          ctx.rotate(Math.atan2(dy, dx))

          // Draw Metallic Chain Link
          ctx.beginPath()
          ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2)
          ctx.fillStyle = '#64748b'
          ctx.fill()
          ctx.lineWidth = 1.5
          ctx.strokeStyle = '#cbd5e1'
          ctx.stroke()
          ctx.restore()
        }

        // Draw Hook Head
        ctx.save()
        ctx.translate(hook.x, hook.y)
        ctx.rotate(hook.angle)

        // Curved Meat Hook Blade
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-8, -4)
        ctx.lineTo(-4, -12)
        ctx.quadraticCurveTo(8, -16, 16, -6)
        ctx.lineTo(18, 0)
        ctx.lineTo(12, 4)
        ctx.quadraticCurveTo(6, -8, -2, -6)
        ctx.closePath()
        ctx.fillStyle = '#e2e8f0'
        ctx.fill()
        ctx.lineWidth = 1.5
        ctx.strokeStyle = '#94a3b8'
        ctx.stroke()

        // Hook Barb (Blood dipped tip)
        ctx.beginPath()
        ctx.moveTo(18, 0)
        ctx.lineTo(24, 6)
        ctx.lineTo(16, 5)
        ctx.closePath()
        ctx.fillStyle = '#dc2626'
        ctx.fill()

        ctx.restore()
      }

      // 5. Draw Pudge (Butcher)
      const pudgeX = hook.originX
      const pudgeY = hook.originY

      // Rot Stench Gas Particles (Aura)
      if (time % 8 < 2) {
        particlesRef.current.push({
          x: pudgeX + (Math.random() - 0.5) * 50,
          y: pudgeY + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 1.5,
          color: 'rgba(74, 222, 128, 0.3)',
          radius: 6 + Math.random() * 6,
          life: 25,
          maxLife: 25,
        })
      }

      // Pudge Base Shadow
      ctx.beginPath()
      ctx.ellipse(pudgeX, pudgeY + 15, 34, 12, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fill()

      // Pudge Body (Bulky Butcher Shape)
      ctx.save()
      ctx.translate(pudgeX, pudgeY)

      // Stitched Apron Body
      ctx.beginPath()
      ctx.arc(0, 0, 26, 0, Math.PI * 2)
      ctx.fillStyle = '#854d0e'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#3e2005'
      ctx.stroke()

      // Apron Front
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(-12, -8, 24, 22)
      ctx.strokeStyle = '#b91c1c'
      ctx.strokeRect(-12, -8, 24, 22)

      // Cleaver in Left Hand
      ctx.save()
      ctx.translate(-26, 4)
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(-10, -5, 12, 16)
      ctx.fillStyle = '#78350f'
      ctx.fillRect(-2, 11, 4, 8)
      ctx.restore()

      // Aiming Shoulder & Arm (Rotates to Mouse Cursor)
      const aimAngle = Math.atan2(
        mousePosRef.current.y - hook.originY,
        mousePosRef.current.x - hook.originX
      )
      ctx.save()
      ctx.translate(18, -4)
      ctx.rotate(aimAngle)
      ctx.fillStyle = '#713f12'
      ctx.fillRect(0, -5, 18, 10)
      ctx.strokeStyle = '#451a03'
      ctx.strokeRect(0, -5, 18, 10)
      ctx.restore()

      ctx.restore()

      // 6. Aiming Reticle / Trajectory Line (when IDLE)
      if (hook.state === 'IDLE' && isPlaying && !isGameOver) {
        ctx.save()
        ctx.beginPath()
        ctx.setLineDash([4, 6])
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
        ctx.lineWidth = 1.5
        ctx.moveTo(hook.originX, hook.originY)
        ctx.lineTo(mousePosRef.current.x, mousePosRef.current.y)
        ctx.stroke()

        // Crosshair ring at mouse
        ctx.beginPath()
        ctx.setLineDash([])
        ctx.arc(mousePosRef.current.x, mousePosRef.current.y, 14, 0, Math.PI * 2)
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
      }

      // 7. Update and Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx
        p.y += p.vy
        p.life--

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * (p.life / p.maxLife), 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }

      // 8. Update and Draw Floating Texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i]
        ft.y -= 1.2
        ft.life--

        if (ft.life <= 0) {
          floatingTextsRef.current.splice(i, 1)
          continue
        }

        const alpha = ft.life / ft.maxLife
        ctx.save()
        ctx.font = `bold ${ft.fontSize}px sans-serif`
        ctx.fillStyle = ft.color
        ctx.globalAlpha = alpha
        ctx.textAlign = 'center'
        ctx.fillText(ft.text, ft.x, ft.y)
        ctx.restore()
      }

      animFrameIdRef.current = requestAnimationFrame(render)
    }

    animFrameIdRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [isOpen, isPlaying, isGameOver, speedMultiplier, spawnTarget, playSound, streak, maxStreak, gameMode])

  // Mouse & Keyboard Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    mousePosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  // Keyboard shortcut listener for Q or Space to Hook
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key.toLowerCase() === 'q' || e.code === 'Space') {
        e.preventDefault()
        throwHook()
      } else if (e.key.toLowerCase() === 'r' && !isPlaying) {
        startNewGame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, throwHook, isPlaying, startNewGame, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl rounded-3xl border border-rose-500/30 bg-[#090d16] shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Pudge Meat Hook Precision Trainer
                </h2>
                <span className="rounded-full border border-rose-500/30 bg-rose-950/50 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                  Dota 2
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Aim with Cursor &bull; Press <kbd className="text-rose-300">Q</kbd>, <kbd className="text-rose-300">Space</kbd> or Click to Throw
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Selectors */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1 text-xs font-mono">
              <button
                onClick={() => startNewGame('time_attack')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  gameMode === 'time_attack'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                60s Blitz
              </button>
              <button
                onClick={() => startNewGame('three_strikes')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  gameMode === 'three_strikes'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3 Strikes
              </button>
              <button
                onClick={() => startNewGame('practice')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  gameMode === 'practice'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Free Training
              </button>
            </div>

            {/* Mute Button */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* HUD Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 border-b border-slate-800 bg-slate-900/40 px-6 py-2.5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Score</span>
              <span className="text-sm font-bold text-white">{score.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Accuracy</span>
              <span className="text-sm font-bold text-purple-300">{accuracy}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Hooks Landed</span>
              <span className="text-sm font-bold text-cyan-300">{hooksLanded} / {hooksThrown}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Streak (Max)</span>
              <span className="text-sm font-bold text-rose-300">{streak} ({maxStreak})</span>
            </div>
          </div>

          {gameMode === 'time_attack' && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="block text-[10px] text-slate-400">Time Left</span>
                <span className="text-sm font-bold text-emerald-300">{timeLeft}s</span>
              </div>
            </div>
          )}

          {gameMode === 'three_strikes' && (
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500 fill-current" />
              <div>
                <span className="block text-[10px] text-slate-400">Lives</span>
                <span className="text-sm font-bold text-rose-400">{'♥ '.repeat(lives)}</span>
              </div>
            </div>
          )}

          {gameMode === 'practice' && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <div>
                <span className="block text-[10px] text-slate-400">River Speed</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {[0.7, 1.0, 1.4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        speedMultiplier === spd
                          ? 'bg-teal-500/30 text-teal-300 font-bold border border-teal-500/40'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 justify-end">
            <Trophy className="h-4 w-4 text-amber-500" />
            <div className="text-right">
              <span className="block text-[10px] text-slate-400">Best Record</span>
              <span className="text-sm font-bold text-amber-400">{highScore.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Canvas Battlefield Area */}
        <div className="relative flex items-center justify-center p-4 bg-[#060a12]">
          <canvas
            ref={canvasRef}
            width={800}
            height={560}
            onClick={throwHook}
            onMouseMove={handleMouseMove}
            className="w-full max-w-[800px] aspect-[800/560] rounded-2xl border border-slate-800 shadow-inner cursor-crosshair"
          />

          {/* Start Screen Overlay */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl p-6 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/40 bg-gradient-to-tr from-rose-950 to-rose-500/20 text-rose-400 shadow-xl">
                <Target className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-2xl font-black text-white">
                  Pudge Meat Hook Precision Trainer
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Train your target leading, angle prediction, and reflexes on moving Dota 2 targets across the river. Hook creeps, Sniper, Windranger, and Courier for high combo points!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-400 max-w-md w-full">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="block font-bold text-white">Aim</span>
                  <span>Mouse Cursor</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="block font-bold text-white">Throw</span>
                  <span>Click / Key Q</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
                  <span className="block font-bold text-white">Combos</span>
                  <span>Up to 5x Score</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => startNewGame()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Meat Hook Training</span>
              </button>
            </div>
          )}

          {/* Game Over Screen Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md rounded-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/50 bg-rose-950/60 text-rose-400 shadow-xl">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <div>
                <span className="font-mono text-xs text-rose-400 uppercase tracking-widest">
                  Round Completed
                </span>
                <h3 className="text-3xl font-black text-white">
                  {score >= 2500 ? 'Dendi Reincarnated!' : score >= 1200 ? 'Fountain Hooker' : 'River Butcher'}
                </h3>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-4 gap-3 font-mono text-xs max-w-lg w-full">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <span className="block text-[10px] text-slate-400">Final Score</span>
                  <span className="text-lg font-bold text-amber-400">{score.toLocaleString()}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <span className="block text-[10px] text-slate-400">Accuracy</span>
                  <span className="text-lg font-bold text-purple-400">{accuracy}%</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <span className="block text-[10px] text-slate-400">Hooks</span>
                  <span className="text-lg font-bold text-cyan-400">{hooksLanded}/{hooksThrown}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <span className="block text-[10px] text-slate-400">Max Streak</span>
                  <span className="text-lg font-bold text-rose-400">{maxStreak}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startNewGame()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Play Again (R)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Exit to Arcade
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Target Legend & Controls */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-2.5 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-rose-400" /> Target Legend:
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Creep (100)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Maiden (150)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Sniper (250)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Windranger (350)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Anti-Mage (450)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /> Courier (600)
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>Global Shortcut: <kbd className="text-rose-400 font-bold">Alt+P</kbd></span>
          </div>
        </div>
      </div>
    </div>
  )
}
