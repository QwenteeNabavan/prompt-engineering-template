import React, { useState, useEffect } from 'react'
import type { SkinItem, InventoryItem } from '../types'
import { RARITY_CONFIG, UPGRADE_TARGET_ITEMS } from '../data/casesData'
import { playUpgradeSpinTick, playUpgradeSuccess, playUpgradeFail } from '../utils/audio'
import { Zap, Trophy, Search, CheckCircle2, XCircle, Coins } from 'lucide-react'

interface UpgraderViewProps {
  userBalance: number
  inventory: InventoryItem[]
  preselectedItem?: InventoryItem | null
  onDeductInventoryItem: (instanceId: string) => void
  onAddInventoryItem: (item: SkinItem) => void
  onDeductBalance: (amount: number) => boolean
}

export const UpgraderView: React.FC<UpgraderViewProps> = ({
  userBalance,
  inventory,
  preselectedItem,
  onDeductInventoryItem,
  onAddInventoryItem,
  onDeductBalance,
}) => {
  // Source State: either an inventory item or direct coin amount
  const [sourceType, setSourceType] = useState<'item' | 'coins'>('item')
  const [selectedSourceItem, setSelectedSourceItem] = useState<InventoryItem | null>(null)
  const [coinBetAmount, setCoinBetAmount] = useState<number>(25)

  // Target State: chosen item from catalog
  const [selectedTargetItem, setSelectedTargetItem] = useState<SkinItem>(UPGRADE_TARGET_ITEMS[1])
  const [targetSearch, setTargetSearch] = useState<string>('')
  const [selectedTargetRarity, setSelectedTargetRarity] = useState<string>('all')

  // Roll Mode: 'under' (0..X%) or 'over' (100-X..100%)
  const [rollMode, setRollMode] = useState<'under' | 'over'>('under')

  // Animation & Execution States
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false)
  const [needleRotation, setNeedleRotation] = useState<number>(0)
  const [lastResult, setLastResult] = useState<{
    success: boolean
    rollNumber: number
    winChance: number
    targetItem: SkinItem
    rollMode: 'under' | 'over'
  } | null>(null)

  const [upgradeHistory, setUpgradeHistory] = useState<
    Array<{
      id: string
      success: boolean
      sourceValue: number
      targetItem: SkinItem
      winChance: number
    }>
  >([])

  // Reset outdated outcome message whenever user changes bet parameters
  useEffect(() => {
    setLastResult(null)
  }, [selectedSourceItem, coinBetAmount, selectedTargetItem, rollMode, sourceType])

  // Initialize with preselected item if passed
  useEffect(() => {
    if (preselectedItem) {
      setSourceType('item')
      setSelectedSourceItem(preselectedItem)
    } else if (inventory.length > 0 && !selectedSourceItem) {
      setSelectedSourceItem(inventory[0])
    }
  }, [preselectedItem, inventory, selectedSourceItem])

  // Compute bet value
  const sourceValue = sourceType === 'item' ? selectedSourceItem?.price || 0 : coinBetAmount
  const targetValue = selectedTargetItem?.price || 1

  // Win chance formula (capped 0.1% to 95.0%)
  const rawChance = (sourceValue / targetValue) * 100
  const winChance = Math.min(Math.max(rawChance, 0.1), 95.0)
  const multiplier = (targetValue / (sourceValue || 1)).toFixed(2)

  // Degree coverage for SVG circular meter (0..360 degrees)
  const winArcDegrees = (winChance / 100) * 360

  // Filter target catalog
  const filteredTargets = UPGRADE_TARGET_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(targetSearch.toLowerCase()) ||
      item.skin.toLowerCase().includes(targetSearch.toLowerCase())
    const matchesRarity = selectedTargetRarity === 'all' || item.rarity === selectedTargetRarity
    return matchesSearch && matchesRarity
  })

  // Quick Multiplier Setter
  const handleSelectMultiplier = (multi: number) => {
    if (sourceValue <= 0) return
    const idealPrice = sourceValue * multi
    // Find closest item in catalog
    const closest = UPGRADE_TARGET_ITEMS.reduce((prev, curr) =>
      Math.abs(curr.price - idealPrice) < Math.abs(prev.price - idealPrice) ? curr : prev
    )
    setSelectedTargetItem(closest)
  }

  // START UPGRADE PROCESS
  const handleStartUpgrade = () => {
    if (isUpgrading) return

    if (sourceType === 'item') {
      if (!selectedSourceItem) {
        alert('Виберіть скін з інвентаря!')
        return
      }
      onDeductInventoryItem(selectedSourceItem.instanceId)
    } else {
      if (coinBetAmount <= 0 || userBalance < coinBetAmount) {
        alert('Недостатньо коїнів для ставки!')
        return
      }
      const ok = onDeductBalance(coinBetAmount)
      if (!ok) return
    }

    setIsUpgrading(true)
    setLastResult(null)

    // Snapshot current parameters for this roll
    const currentBetWinChance = winChance
    const currentTarget = selectedTargetItem
    const currentSourceVal = sourceValue
    const currentRollMode = rollMode

    // Roll random number from 0.00 to 100.00
    const roll = Math.random() * 100
    let isSuccess = false

    if (currentRollMode === 'under') {
      isSuccess = roll <= currentBetWinChance
    } else {
      isSuccess = roll >= 100 - currentBetWinChance
    }

    // Convert roll (0..100) to exact landing degree (0..360)
    const landingDegree = (roll / 100) * 360

    // Spin multiple full rotations + exact landing angle
    const currentAngle = needleRotation % 360
    const angleDelta = (landingDegree - currentAngle + 360) % 360
    const fullSpins = 360 * 6 // 2160 deg
    const targetAngle = needleRotation + fullSpins + angleDelta

    setNeedleRotation(targetAngle)

    // Play ticking sound while needle rotates
    let ticks = 0
    const tickInterval = setInterval(() => {
      ticks++
      playUpgradeSpinTick(1 + (ticks % 3) * 0.2)
      if (ticks > 25) clearInterval(tickInterval)
    }, 120)

    // After animation duration (4.0s)
    setTimeout(() => {
      clearInterval(tickInterval)
      setIsUpgrading(false)

      const outcome = {
        success: isSuccess,
        rollNumber: roll,
        winChance: currentBetWinChance,
        targetItem: currentTarget,
        rollMode: currentRollMode,
      }
      setLastResult(outcome)

      setUpgradeHistory((prev) => [
        {
          id: String(Date.now()),
          success: isSuccess,
          sourceValue: currentSourceVal,
          targetItem: currentTarget,
          winChance: currentBetWinChance,
        },
        ...prev.slice(0, 9),
      ])

      if (isSuccess) {
        playUpgradeSuccess()
        onAddInventoryItem(currentTarget)
      } else {
        playUpgradeFail()
        setSelectedSourceItem(null)
      }
    }, 4000)
  }

  const targetRarity = RARITY_CONFIG[selectedTargetItem.rarity] || RARITY_CONFIG['mil-spec']

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/20 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Zap className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              TastyDrop{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                Апгрейдер
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Помножуй свої скіни або баланс! Вибери ставку, обери омріяний ніж чи AWP та запусти
              колесо долі.
            </p>
          </div>
        </div>

        {/* Multiplier Quick Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Множник:</span>
          {[1.5, 2, 5, 10, 20, 50].map((m) => (
            <button
              key={m}
              type="button"
              disabled={isUpgrading}
              onClick={() => handleSelectMultiplier(m)}
              className="rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 font-mono text-xs font-bold text-purple-300 hover:border-purple-500/50 hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              {m}x
            </button>
          ))}
        </div>
      </div>

      {/* MAIN UPGRADER ARENA (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (COL 1-4): SOURCE ITEM SELECTOR */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-sm text-white">1. Що ставимо:</span>
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px]">
              <button
                type="button"
                disabled={isUpgrading}
                onClick={() => setSourceType('item')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  sourceType === 'item' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400'
                }`}
              >
                Скін
              </button>
              <button
                type="button"
                disabled={isUpgrading}
                onClick={() => setSourceType('coins')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  sourceType === 'coins' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                }`}
              >
                Коїни 🪙
              </button>
            </div>
          </div>

          {sourceType === 'item' ? (
            <div className="space-y-3">
              {/* Selected Item Preview */}
              {selectedSourceItem ? (
                <div className="relative flex flex-col items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-950/20 p-4 shadow-inner">
                  <span className="text-4xl drop-shadow">
                    {selectedSourceItem.imageEmoji || '🔫'}
                  </span>
                  <h3 className="mt-2 text-center text-sm font-extrabold text-white">
                    {selectedSourceItem.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400">{selectedSourceItem.wear}</span>
                    <span className="font-bold text-amber-400">
                      {selectedSourceItem.price.toFixed(2)} 🪙
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                  Виберіть скін нижче для апгрейду
                </div>
              )}

              {/* Inventory items scrollable selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-slate-400">
                  Доступні скіни ({inventory.length}):
                </span>
                {inventory.length === 0 ? (
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-center text-xs text-slate-500">
                    Інвентар порожній. Відкрийте кілька безкоштовних кейсів!
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {inventory.map((item) => {
                      const isSelected = selectedSourceItem?.instanceId === item.instanceId
                      const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG['mil-spec']
                      return (
                        <div
                          key={item.instanceId}
                          onClick={() => {
                            if (!isUpgrading) setSelectedSourceItem(item)
                          }}
                          className={`flex items-center justify-between rounded-xl border p-2 text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-purple-500 bg-purple-950/40 shadow-sm'
                              : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.imageEmoji || '🔫'}</span>
                            <span
                              className="font-bold truncate max-w-[140px]"
                              style={{ color: rarity.color }}
                            >
                              {item.name}
                            </span>
                          </div>
                          <span className="font-mono text-amber-400 font-bold">
                            {item.price.toFixed(2)} 🪙
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Direct Coin Bet */
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Сума ставки в коїнах:</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-2.5 h-4 w-4 text-amber-400" />
                  <input
                    type="number"
                    min={1}
                    max={userBalance}
                    disabled={isUpgrading}
                    value={coinBetAmount}
                    onChange={(e) => setCoinBetAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick coin buttons */}
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={isUpgrading}
                    onClick={() => setCoinBetAmount(amt)}
                    className="rounded-lg border border-slate-800 bg-slate-950 py-1.5 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN (COL 5-8): RADIAL 360 WHEEL & ROLL CONTROLS */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-slate-900 to-[#080d19] p-6 shadow-2xl">
          {/* Roll Under / Over selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/80 p-1 font-mono text-xs mb-4">
            <button
              type="button"
              disabled={isUpgrading}
              onClick={() => setRollMode('under')}
              className={`rounded-lg px-3 py-1 font-bold transition-all cursor-pointer ${
                rollMode === 'under'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400'
              }`}
            >
              Roll &lt; {winChance.toFixed(2)}%
            </button>
            <button
              type="button"
              disabled={isUpgrading}
              onClick={() => setRollMode('over')}
              className={`rounded-lg px-3 py-1 font-bold transition-all cursor-pointer ${
                rollMode === 'over'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400'
              }`}
            >
              Roll &gt; {(100 - winChance).toFixed(2)}%
            </button>
          </div>

          {/* 360 RADIAL CANVAS / SVG WHEEL */}
          <div className="relative flex h-72 w-72 items-center justify-center mx-auto my-3">
            {/* Outer Glow */}
            <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-purple-500/10 blur-2xl" />

            {/* SVG Track Circle (absolute inset-0) */}
            <svg
              className="absolute inset-0 h-full w-full -rotate-90 transform"
              viewBox="0 0 200 200"
            >
              {/* Background Full Track Circle */}
              <circle cx="100" cy="100" r="78" fill="none" stroke="#1e293b" strokeWidth="12" />

              {/* Winning Sector Arc */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#10b981"
                strokeWidth="14"
                strokeDasharray={`${(winArcDegrees / 360) * 490.09} 490.09`}
                strokeDashoffset={
                  rollMode === 'under' ? '0' : `-${((100 - winChance) / 100) * 490.09}`
                }
                strokeLinecap="round"
                className="drop-shadow-[0_0_16px_rgba(16,185,129,0.9)] transition-all duration-300"
              />
            </svg>

            {/* Central Info Plate (Centered Dead-Center with absolute inset-0 m-auto) */}
            <div className="pointer-events-none absolute inset-0 m-auto flex h-36 w-36 flex-col items-center justify-center rounded-full border border-purple-500/40 bg-[#090d19]/95 shadow-[0_0_30px_rgba(0,0,0,0.85)] backdrop-blur-md z-10">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Шанс виграшу
              </span>
              <span className="font-mono text-3xl font-black text-white">
                {winChance.toFixed(2)}%
              </span>
              <span className="mt-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 font-mono text-xs font-bold text-purple-300">
                {multiplier}x
              </span>
            </div>

            {/* Rotating Needle Pointer Layer */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center z-20"
              style={{
                transform: `rotate(${needleRotation}deg)`,
                transition: isUpgrading
                  ? 'transform 4.0s cubic-bezier(0.12, 0.8, 0.33, 1)'
                  : 'none',
              }}
            >
              {/* Needle Arrow Head & Shaft pointing directly to the circle track */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                {/* Arrow Head with valid Tailwind arbitrary borders */}
                <div className="h-0 w-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,1)]" />
                {/* Glowing Laser Needle Shaft */}
                <div className="h-8 w-0.5 bg-gradient-to-b from-amber-400 via-amber-400/80 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              </div>
            </div>
          </div>

          {/* Action Button: UPGRADE NOW */}
          <div className="mt-5 w-full">
            <button
              type="button"
              disabled={isUpgrading || sourceValue <= 0}
              onClick={handleStartUpgrade}
              className={`group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl text-base font-extrabold shadow-2xl transition-all active:scale-98 cursor-pointer ${
                isUpgrading
                  ? 'border border-purple-500/50 bg-purple-900/40 text-purple-200'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-purple-500/25 hover:brightness-110'
              }`}
            >
              <Zap className="h-5 w-5 fill-current animate-pulse" />
              <span>
                {isUpgrading ? 'Крутимо стрілку...' : `ПРОКАЧАТИ (${winChance.toFixed(1)}%)`}
              </span>
            </button>
          </div>

          {/* Outcome Notification Modal / Toast */}
          {lastResult && (
            <div
              className={`mt-4 w-full rounded-2xl border p-4 text-center animate-in zoom-in-95 duration-200 ${
                lastResult.success
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'border-rose-500/50 bg-rose-950/40 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 font-bold text-sm">
                {lastResult.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span>УСПІХ! ВИ ОТРИМАЛИ СКІН!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-rose-400" />
                    <span>НЕ ВДАЛОСЯ! Ставку втрачено</span>
                  </>
                )}
              </div>
              <p className="mt-1 font-mono text-xs">
                Рол: {lastResult.rollNumber.toFixed(2)}% • Шанс був:{' '}
                {lastResult.winChance.toFixed(2)}% (Потрібно було{' '}
                {lastResult.rollMode === 'under'
                  ? `< ${lastResult.winChance.toFixed(2)}%`
                  : `> ${(100 - lastResult.winChance).toFixed(2)}%`}
                )
              </p>
              {lastResult.success && (
                <div className="mt-2 font-bold text-white">
                  + {lastResult.targetItem.name} ({lastResult.targetItem.price} 🪙)
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (COL 9-12): TARGET ITEM CATALOG */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-sm text-white">2. Ціль апгрейду:</span>
            <span className="font-mono text-xs text-amber-400 font-bold">
              {selectedTargetItem.price.toFixed(2)} 🪙
            </span>
          </div>

          {/* Target Preview */}
          <div
            className="relative flex flex-col items-center justify-center rounded-2xl border p-4 shadow-inner"
            style={{
              borderColor: `${targetRarity.color}50`,
              backgroundColor: `${targetRarity.color}15`,
            }}
          >
            <span className="text-4xl drop-shadow">{selectedTargetItem.imageEmoji || '🔪'}</span>
            <h3
              className="mt-2 text-center text-sm font-extrabold"
              style={{ color: targetRarity.color }}
            >
              {selectedTargetItem.name}
            </h3>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">{selectedTargetItem.wear}</span>
              <span className="font-bold text-amber-300">
                {selectedTargetItem.price.toFixed(2)} 🪙
              </span>
            </div>
          </div>

          {/* Target Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                disabled={isUpgrading}
                placeholder="Пошук цільового скіна..."
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto no-scrollbar text-[10px] font-mono">
              {[
                { id: 'all', label: 'Всі' },
                { id: 'gold', label: '★ Ножі' },
                { id: 'covert', label: 'Covert' },
                { id: 'classified', label: 'Classified' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  disabled={isUpgrading}
                  onClick={() => setSelectedTargetRarity(r.id)}
                  className={`rounded-lg px-2 py-0.5 transition-colors cursor-pointer ${
                    selectedTargetRarity === r.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Target Items List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredTargets.map((item) => {
                const isSelected = selectedTargetItem.id === item.id
                const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG['mil-spec']
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isUpgrading) setSelectedTargetItem(item)
                    }}
                    className={`flex items-center justify-between rounded-xl border p-2 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/40 shadow-sm'
                        : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.imageEmoji || '🔫'}</span>
                      <span
                        className="font-bold truncate max-w-[140px]"
                        style={{ color: rarity.color }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">
                      {item.price.toFixed(2)} 🪙
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* UPGRADE RECENT SESSIONS HISTORY */}
      {upgradeHistory.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Історія недавніх спроб в апгрейдері:</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {upgradeHistory.map((hist) => {
              const rarity = RARITY_CONFIG[hist.targetItem.rarity] || RARITY_CONFIG['mil-spec']
              return (
                <div
                  key={hist.id}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-mono ${
                    hist.success
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : 'border-rose-500/40 bg-rose-950/20 text-rose-400'
                  }`}
                >
                  <span>{hist.targetItem.imageEmoji}</span>
                  <div>
                    <span
                      className="font-bold truncate block max-w-[120px]"
                      style={{ color: rarity.color }}
                    >
                      {hist.targetItem.skin}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {hist.success ? 'Успіх (+)' : 'Мінус (-)'} • {hist.winChance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
