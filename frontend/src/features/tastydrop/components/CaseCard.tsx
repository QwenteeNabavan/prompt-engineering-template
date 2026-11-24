import React from 'react'
import type { CaseDefinition } from '../types'
import { RARITY_CONFIG } from '../data/casesData'
import { Sparkles, Gift } from 'lucide-react'

interface CaseCardProps {
  caseDef: CaseDefinition
  onSelect: (caseDef: CaseDefinition) => void
  userBalance: number
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseDef, onSelect, userBalance }) => {
  const canAfford = userBalance >= caseDef.price || caseDef.isFree

  return (
    <div
      onClick={() => onSelect(caseDef)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-900/90 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] cursor-pointer"
    >
      {/* Top Banner & Badge */}
      <div className="flex items-center justify-between">
        <span
          className="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: `${caseDef.themeColor}20`,
            color: caseDef.themeColor,
            border: `1px solid ${caseDef.themeColor}40`,
          }}
        >
          {caseDef.badge || (caseDef.isFree ? '🎁 FREE' : '📦 CASE')}
        </span>

        {caseDef.isFree ? (
          <span className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400">
            <Gift className="h-3.5 w-3.5" /> 0 🪙
          </span>
        ) : (
          <span className="font-mono text-xs font-bold text-amber-300">
            {caseDef.price.toFixed(2)} 🪙
          </span>
        )}
      </div>

      {/* Case Visual Art */}
      <div className="my-5 flex flex-col items-center justify-center">
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110 shadow-inner"
          style={{
            borderColor: `${caseDef.themeColor}50`,
            background: `radial-gradient(circle at center, ${caseDef.themeColor}25, rgba(15,23,42,0.6))`,
          }}
        >
          {/* Subtle spinning glow behind */}
          <div
            className="pointer-events-none absolute h-20 w-20 rounded-full blur-xl opacity-40 group-hover:opacity-75 transition-opacity"
            style={{ backgroundColor: caseDef.themeColor }}
          />

          <span className="text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            {caseDef.id.includes('donut')
              ? '🍩'
              : caseDef.id.includes('fries')
                ? '🍟'
                : caseDef.id.includes('taco')
                  ? '🌮'
                  : caseDef.id.includes('burger')
                    ? '🍔'
                    : caseDef.id.includes('pizza')
                      ? '🍕'
                      : caseDef.id.includes('knife')
                        ? '🔪'
                        : caseDef.id.includes('dragon')
                          ? '🐉'
                          : caseDef.id.includes('shawarma')
                            ? '🌯'
                            : caseDef.id.includes('daily')
                              ? '⭐'
                              : '🎁'}
          </span>
        </div>

        <h3 className="mt-3 text-center text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
          {caseDef.name}
        </h3>
        <p className="mt-0.5 text-center text-[11px] text-slate-400 line-clamp-1 max-w-[200px]">
          {caseDef.subtitle}
        </p>
      </div>

      {/* Item Previews dots */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-1.5 border-t border-slate-800/80 pt-2.5">
          {caseDef.items.slice(0, 5).map((item) => {
            const config = RARITY_CONFIG[item.rarity] || RARITY_CONFIG['mil-spec']
            return (
              <div
                key={item.id}
                title={`${item.name} (${item.chance}%)`}
                className="h-2 w-2 rounded-full transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: config.color,
                  boxShadow: `0 0 6px ${config.color}`,
                }}
              />
            )
          })}
          <span className="text-[10px] font-mono text-slate-500 ml-1">
            {caseDef.items.length} скінів
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(caseDef)
          }}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer ${
            caseDef.isFree
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/20 hover:brightness-110'
              : canAfford
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 shadow-amber-500/20 hover:brightness-110'
                : 'border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          {caseDef.isFree ? (
            <>
              <Gift className="h-3.5 w-3.5 fill-current" />
              <span>Відкрити безкоштовно</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              <span>Відкрити за {caseDef.price} 🪙</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
