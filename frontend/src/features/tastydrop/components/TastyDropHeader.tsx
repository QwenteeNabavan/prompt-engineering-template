import React from 'react'
import type { TastyTab } from '../types'
import {
  Coins,
  Package,
  Zap,
  Briefcase,
  Gift,
  Volume2,
  VolumeX,
  RotateCcw,
  PlusCircle,
  Flame,
} from 'lucide-react'

interface TastyDropHeaderProps {
  activeTab: TastyTab
  onTabChange: (tab: TastyTab) => void
  balance: number
  inventoryCount: number
  inventoryValue: number
  isMuted: boolean
  onToggleMute: () => void
  onClaimFaucet: () => void
  onResetData: () => void
}

export const TastyDropHeader: React.FC<TastyDropHeaderProps> = ({
  activeTab,
  onTabChange,
  balance,
  inventoryCount,
  inventoryValue,
  isMuted,
  onToggleMute,
  onClaimFaucet,
  onResetData,
}) => {
  return (
    <div className="relative border-b border-slate-800 bg-[#090e1a]/95 pb-4 pt-4 shadow-xl backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Brand Logotype */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-tr from-amber-600/30 via-orange-500/20 to-yellow-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <span className="text-xl">🍔</span>
            <Flame className="absolute -top-1.5 -right-1.5 h-4 w-4 text-orange-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">
                Tasty
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Drop
                </span>
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-amber-300">
                SIMULATOR
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              CS2 Кейси • Апгрейдер • Безкоштовні бонуси
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 font-medium text-xs">
          <button
            type="button"
            onClick={() => onTabChange('cases')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              activeTab === 'cases'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Кейси</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('upgrader')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              activeTab === 'upgrader'
                ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 shadow-sm border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="h-4 w-4 text-purple-400" />
            <span>Апгрейдер</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('inventory')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="h-4 w-4 text-cyan-400" />
            <span>Інвентар</span>
            {inventoryCount > 0 && (
              <span className="rounded-full bg-cyan-500/30 px-1.5 py-0 font-mono text-[10px] text-cyan-200">
                {inventoryCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('free')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              activeTab === 'free'
                ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Gift className="h-4 w-4 text-emerald-400" />
            <span>Безкоштовне</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>

        {/* Right: Balance & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Main Coin Balance Card */}
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900/60 px-3.5 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Coins className="h-4 w-4 text-amber-400 animate-bounce" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400 leading-none">
                Баланс
              </span>
              <span className="font-mono text-sm font-extrabold text-amber-300">
                {balance.toFixed(2)} 🪙
              </span>
            </div>
            <button
              type="button"
              onClick={onClaimFaucet}
              title="Отримати безкоштовні +100 коїнів"
              className="ml-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Inventory Value */}
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400 leading-none">
                Скін-інвентар
              </span>
              <span className="font-mono text-xs font-semibold text-cyan-300">
                {inventoryValue.toFixed(2)} 🪙
              </span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </button>

          {/* Reset Progress */}
          <button
            type="button"
            onClick={onResetData}
            title="Скинути симулятор (повернути 500 коїнів)"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
