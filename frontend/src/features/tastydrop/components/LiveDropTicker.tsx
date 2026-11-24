import React from 'react'
import type { LiveDrop } from '../types'
import { RARITY_CONFIG } from '../data/casesData'

interface LiveDropTickerProps {
  drops: LiveDrop[]
  onItemClick?: (drop: LiveDrop) => void
}

export const LiveDropTicker: React.FC<LiveDropTickerProps> = ({ drops }) => {
  return (
    <div className="relative w-full overflow-hidden border-b border-slate-800 bg-[#070b14]/90 py-2 backdrop-blur-md">
      {/* Subtle glowing edge lines */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[#070b14] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[#070b14] to-transparent" />

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4">
        <div className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-amber-400 font-bold uppercase tracking-wider pr-2 border-r border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>LIVE DROPS</span>
        </div>

        <div className="flex items-center gap-2.5">
          {drops.slice(0, 16).map((drop) => {
            const rarity = RARITY_CONFIG[drop.skin.rarity] || RARITY_CONFIG['mil-spec']
            return (
              <div
                key={drop.id}
                className={`group relative flex shrink-0 items-center gap-2.5 rounded-lg border px-2.5 py-1 transition-all hover:scale-105 ${
                  drop.isCurrentPlayer
                    ? 'border-amber-400/60 bg-amber-950/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700'
                }`}
                style={{
                  borderBottomColor: rarity.color,
                  borderBottomWidth: '2px',
                }}
              >
                {/* Item emoji / icon */}
                <div
                  className="flex h-7 w-7 items-center justify-center rounded text-sm shrink-0"
                  style={{ backgroundColor: rarity.bg }}
                >
                  {drop.skin.imageEmoji || '🔫'}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]">
                      {drop.userName}
                    </span>
                    {drop.isCurrentPlayer && (
                      <span className="rounded bg-amber-500/20 px-1 py-0 text-[9px] font-bold text-amber-300">
                        ТИ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[11px] font-semibold truncate max-w-[110px]"
                      style={{ color: rarity.color }}
                      title={drop.skin.name}
                    >
                      {drop.skin.skin}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">
                      {drop.skin.price}🪙
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
