import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { CaseDefinition, SkinItem, InventoryItem } from '../types'
import { RARITY_CONFIG, rollCaseDrop } from '../data/casesData'
import { playTickSound, playStopSound, playWinSound, playCoinSound } from '../utils/audio'
import { X, Sparkles, Zap, RotateCcw, CheckCircle2, Coins } from 'lucide-react'

interface CaseRouletteModalProps {
  isOpen: boolean
  caseDef: CaseDefinition | null
  userBalance: number
  onClose: () => void
  onAddInventory: (items: SkinItem[]) => void
  onDeductBalance: (amount: number) => boolean
  onAddBalance: (amount: number) => void
  onSendToUpgrader: (item: InventoryItem) => void
}

const REEL_ITEM_WIDTH = 140
const WINNER_INDEX = 45 // Index in reel where winning item lands

export const CaseRouletteModal: React.FC<CaseRouletteModalProps> = ({
  isOpen,
  caseDef,
  userBalance,
  onClose,
  onAddInventory,
  onDeductBalance,
  onAddBalance,
  onSendToUpgrader,
}) => {
  const [multiCount, setMultiCount] = useState<number>(1)
  const [isQuickOpen, setIsQuickOpen] = useState<boolean>(false)
  const [isSpinning, setIsSpinning] = useState<boolean>(false)

  // Array of reels: each reel has its own strip of items, offset, and won item
  const [reels, setReels] = useState<
    Array<{
      strip: SkinItem[]
      targetOffset: number
      wonItem: SkinItem | null
    }>
  >([])

  const [wonItems, setWonItems] = useState<SkinItem[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [soldItems, setSoldItems] = useState<Record<number, boolean>>({})

  const tickIntervalRef = useRef<number | null>(null)
  const animTimeoutRef = useRef<number | null>(null)

  const resetReels = useCallback(() => {
    if (!caseDef) return
    const newReels = []
    for (let r = 0; r < multiCount; r++) {
      const strip: SkinItem[] = []
      // Fill initial preview strip with random items
      for (let i = 0; i < 60; i++) {
        const randomItem = caseDef.items[Math.floor(Math.random() * caseDef.items.length)]
        strip.push(randomItem)
      }
      newReels.push({
        strip,
        targetOffset: 0,
        wonItem: null,
      })
    }
    setReels(newReels)
    setShowResults(false)
    setWonItems([])
    setSoldItems({})
  }, [caseDef, multiCount])

  // Initialize reel strips on mount or case change
  useEffect(() => {
    if (!caseDef) return
    resetReels()
  }, [caseDef, resetReels])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    }
  }, [])

  if (!isOpen || !caseDef) return null

  const handleStartSpin = () => {
    if (isSpinning || !caseDef) return

    const totalCost = caseDef.isFree ? 0 : caseDef.price * multiCount
    if (!caseDef.isFree && userBalance < totalCost) {
      alert(`Недостатньо коїнів! Потрібно ${totalCost.toFixed(2)} 🪙`)
      return
    }

    const deducted = onDeductBalance(totalCost)
    if (!deducted) return

    setIsSpinning(true)
    setShowResults(false)
    setSoldItems({})

    // Roll winning items for all selected reels
    const chosenWinners: SkinItem[] = []
    const updatedReels = []

    for (let r = 0; r < multiCount; r++) {
      const winner = rollCaseDrop(caseDef)
      chosenWinners.push(winner)

      // Build 60-item strip with winner firmly at WINNER_INDEX
      const strip: SkinItem[] = []
      for (let i = 0; i < 60; i++) {
        if (i === WINNER_INDEX) {
          strip.push(winner)
        } else {
          // Weighted fill
          strip.push(caseDef.items[Math.floor(Math.random() * caseDef.items.length)])
        }
      }

      // Calculate landing offset with slight natural jitter inside the card
      const jitter = Math.floor(Math.random() * 40) - 20 // +/- 20px
      const targetOffset = WINNER_INDEX * REEL_ITEM_WIDTH + jitter

      updatedReels.push({
        strip,
        targetOffset,
        wonItem: winner,
      })
    }

    setReels(updatedReels)
    setWonItems(chosenWinners)

    if (isQuickOpen) {
      // Instant skip
      setTimeout(() => {
        playStopSound()
        chosenWinners.forEach((w) => playWinSound(w.rarity))
        setIsSpinning(false)
        setShowResults(true)
        onAddInventory(chosenWinners)
      }, 200)
      return
    }

    // Play ticking sounds during reel deceleration
    let tickSpeed = 35
    let elapsed = 0
    const totalSpinTime = 4800

    const runTicks = () => {
      playTickSound()
      elapsed += tickSpeed
      // Deceleration curve for ticks
      if (elapsed > 2000) tickSpeed = 60
      if (elapsed > 3200) tickSpeed = 120
      if (elapsed > 4000) tickSpeed = 240
      if (elapsed < totalSpinTime) {
        tickIntervalRef.current = window.setTimeout(runTicks, tickSpeed)
      }
    }
    runTicks()

    // When spin finishes
    animTimeoutRef.current = window.setTimeout(() => {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)
      playStopSound()
      chosenWinners.forEach((w) => playWinSound(w.rarity))
      setIsSpinning(false)
      setShowResults(true)
      onAddInventory(chosenWinners)
    }, totalSpinTime)
  }

  const handleSellWonItem = (item: SkinItem, index: number) => {
    if (soldItems[index]) return
    onAddBalance(item.price)
    playCoinSound()
    setSoldItems((prev) => ({ ...prev, [index]: true }))
  }

  const handleSendToUpgraderSingle = (item: SkinItem) => {
    const invItem: InventoryItem = {
      ...item,
      instanceId: `inst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      unboxedAt: Date.now(),
    }
    onSendToUpgrader(invItem)
    onClose()
  }

  const totalCost = caseDef.isFree ? 0 : caseDef.price * multiCount
  const canAfford = caseDef.isFree || userBalance >= totalCost

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={() => {
          if (!isSpinning) onClose()
        }}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0a0f1d] text-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#080d19]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {caseDef.badge?.includes('FREE')
                ? '🎁'
                : caseDef.id.includes('burger')
                  ? '🍔'
                  : caseDef.id.includes('pizza')
                    ? '🍕'
                    : caseDef.id.includes('taco')
                      ? '🌮'
                      : caseDef.id.includes('donut')
                        ? '🍩'
                        : caseDef.id.includes('knife')
                          ? '🔪'
                          : '📦'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{caseDef.name}</h2>
                <span
                  className="rounded px-2 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    backgroundColor: `${caseDef.themeColor}20`,
                    color: caseDef.themeColor,
                    border: `1px solid ${caseDef.themeColor}50`,
                  }}
                >
                  {caseDef.badge || `${caseDef.price} 🪙`}
                </span>
              </div>
              <p className="text-xs text-slate-400">{caseDef.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSpinning}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Controls Bar: Multi-open & Quick spin */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3">
            {/* Multi-open Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400 mr-2">Кількість:</span>
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  disabled={isSpinning}
                  onClick={() => {
                    setMultiCount(count)
                    setShowResults(false)
                  }}
                  className={`flex h-8 w-11 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    multiCount === count
                      ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-sm'
                      : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {count}x
                </button>
              ))}
            </div>

            {/* Quick Open Toggle */}
            <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isSpinning}
                checked={isQuickOpen}
                onChange={(e) => setIsQuickOpen(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Швидке відкриття (Skip)</span>
            </label>
          </div>

          {/* ROULETTE REELS CONTAINER */}
          <div className="space-y-4">
            {reels.map((reel, rIdx) => (
              <div
                key={rIdx}
                className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#050811] py-4 shadow-inner"
              >
                {/* Center Winner Pointer Line */}
                <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 z-20 w-0.5 -translate-x-1/2 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)]">
                  {/* Top Triangle Arrow */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-0 w-0 border-x-4 border-x-transparent border-t-6 border-t-amber-400" />
                  {/* Bottom Triangle Arrow */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0 w-0 border-x-4 border-x-transparent border-b-6 border-b-amber-400" />
                </div>

                {/* Shading gradients on sides */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-[#050811] via-[#050811]/70 to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-[#050811] via-[#050811]/70 to-transparent" />

                {/* Moving Tape */}
                <div
                  className="flex items-center"
                  style={{
                    transform: isSpinning
                      ? `translateX(calc(50% - ${reel.targetOffset}px - ${REEL_ITEM_WIDTH / 2}px))`
                      : showResults
                        ? `translateX(calc(50% - ${reel.targetOffset}px - ${REEL_ITEM_WIDTH / 2}px))`
                        : 'translateX(0)',
                    transition: isSpinning
                      ? 'transform 4.8s cubic-bezier(0.12, 0.8, 0.33, 1)'
                      : 'none',
                  }}
                >
                  {reel.strip.map((item, idx) => {
                    const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG['mil-spec']
                    return (
                      <div
                        key={idx}
                        className="flex shrink-0 flex-col items-center justify-center p-2"
                        style={{ width: `${REEL_ITEM_WIDTH}px` }}
                      >
                        <div
                          className="relative flex h-28 w-28 flex-col items-center justify-between rounded-xl border p-2 transition-transform hover:scale-105"
                          style={{
                            borderColor: `${rarity.color}40`,
                            backgroundColor: `${rarity.color}10`,
                            boxShadow: `0 0 15px ${rarity.color}15`,
                          }}
                        >
                          <span className="text-[10px] font-mono text-slate-400">{item.wear}</span>

                          <span className="text-3xl drop-shadow">{item.imageEmoji || '🔫'}</span>

                          <div className="w-full text-center">
                            <span
                              className="block truncate text-[11px] font-bold"
                              style={{ color: rarity.color }}
                              title={item.name}
                            >
                              {item.skin}
                            </span>
                            <span className="font-mono text-[10px] text-amber-400">
                              {item.price} 🪙
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* SPIN ACTION BUTTON */}
          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={isSpinning || !canAfford}
              onClick={handleStartSpin}
              className={`group relative flex h-14 w-full max-w-md items-center justify-center gap-3 overflow-hidden rounded-2xl text-base font-extrabold shadow-2xl transition-all active:scale-98 cursor-pointer ${
                caseDef.isFree
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 shadow-emerald-500/25 hover:brightness-110'
                  : canAfford
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 text-slate-950 shadow-amber-500/30 hover:brightness-110'
                    : 'border border-slate-800 bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-5 w-5 fill-current animate-spin" />
              <span>
                {isSpinning
                  ? 'Крутимо кейс...'
                  : caseDef.isFree
                    ? 'ВІДКРИТИ БЕЗКОШТОВНО'
                    : `ВІДКРИТИ ЗА ${totalCost.toFixed(2)} 🪙`}
              </span>
            </button>

            {!canAfford && !caseDef.isFree && (
              <p className="text-xs font-mono text-rose-400">
                Недостатньо коштів! Поповніть через безкоштовний кран (+100 🪙) або продайте скіни.
              </p>
            )}
          </div>

          {/* DROP RESULTS CARDS (Shown after roulette lands) */}
          {showResults && wonItems.length > 0 && (
            <div className="space-y-4 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-slate-900/60 to-[#0a0f1d] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Ваш виграшний дроп ({wonItems.length} шт.):
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetReels}
                  className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Крутити знову</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {wonItems.map((item, idx) => {
                  const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG['mil-spec']
                  const isSold = soldItems[idx]

                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                        isSold
                          ? 'border-slate-800 bg-slate-900/40 opacity-60'
                          : 'border-amber-500/40 bg-slate-900/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      }`}
                      style={{
                        borderTopColor: rarity.color,
                        borderTopWidth: '3px',
                      }}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold" style={{ color: rarity.color }}>
                          {rarity.label}
                        </span>
                        <span className="text-slate-400">{item.wear}</span>
                      </div>

                      <div className="my-3 flex flex-col items-center justify-center">
                        <span className="text-4xl drop-shadow-lg">{item.imageEmoji || '🔫'}</span>
                        <h4 className="mt-2 text-center text-xs font-extrabold text-white">
                          {item.name}
                        </h4>
                        <span className="mt-1 font-mono text-xs font-extrabold text-amber-400">
                          {item.price.toFixed(2)} 🪙
                        </span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        {isSold ? (
                          <div className="rounded-lg bg-emerald-950/40 py-1.5 text-center font-mono text-xs text-emerald-400">
                            Продано ✓
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSellWonItem(item, idx)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/20 py-1.5 font-mono text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"
                            >
                              <Coins className="h-3.5 w-3.5" />
                              <span>Продати за {item.price.toFixed(2)} 🪙</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendToUpgraderSingle(item)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/30 py-1.5 font-mono text-xs font-semibold text-purple-300 hover:bg-purple-900/40 transition-colors cursor-pointer"
                            >
                              <Zap className="h-3.5 w-3.5 text-purple-400" />
                              <span>В апгрейдер ⚡</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ODDS TRANSPARENCY TABLE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-slate-200 uppercase">
                Вміст кейсу та точні шанси дропу:
              </span>
              <span>Всього {caseDef.items.length} скінів</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {caseDef.items.map((item) => {
                const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG['mil-spec']
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-2.5 text-xs transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
                        style={{ backgroundColor: rarity.bg }}
                      >
                        {item.imageEmoji || '🔫'}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className="font-bold truncate max-w-[140px]"
                          style={{ color: rarity.color }}
                        >
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.wear} • {item.price.toFixed(2)} 🪙
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block font-mono text-xs font-extrabold text-amber-400">
                        {item.chance.toFixed(1)}%
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">шанс</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
