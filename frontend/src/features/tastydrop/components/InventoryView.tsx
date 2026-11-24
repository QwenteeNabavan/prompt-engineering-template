import React, { useState } from 'react'
import type { InventoryItem } from '../types'
import { RARITY_CONFIG } from '../data/casesData'
import { playCoinSound } from '../utils/audio'
import { Briefcase, Search, ArrowUpDown, Coins, Zap, PackageOpen } from 'lucide-react'

interface InventoryViewProps {
  inventory: InventoryItem[]
  onSellItem: (instanceId: string, price: number) => void
  onSellAll: () => void
  onSendToUpgrader: (item: InventoryItem) => void
  onOpenCasesTab: () => void
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onSellItem,
  onSellAll,
  onSendToUpgrader,
  onOpenCasesTab,
}) => {
  const [search, setSearch] = useState<string>('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'recent'>('price_desc')

  const totalValue = inventory.reduce((acc, curr) => acc + curr.price, 0)

  // Filtering & Sorting
  const filtered = inventory
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.skin.toLowerCase().includes(search.toLowerCase()) ||
        item.weapon.toLowerCase().includes(search.toLowerCase())
      const matchRarity = selectedRarity === 'all' || item.rarity === selectedRarity
      return matchSearch && matchRarity
    })
    .sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'price_asc') return a.price - b.price
      return b.unboxedAt - a.unboxedAt
    })

  const handleSellSingle = (item: InventoryItem) => {
    playCoinSound()
    onSellItem(item.instanceId, item.price)
  }

  const handleSellAllClick = () => {
    if (inventory.length === 0) return
    if (
      window.confirm(`Продати всі ${inventory.length} скінів за суму ${totalValue.toFixed(2)} 🪙?`)
    ) {
      playCoinSound()
      onSellAll()
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Top Banner & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Briefcase className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Мій{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
                Інвентар Скінів
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Всього {inventory.length} скінів на загальну вартість{' '}
              <span className="font-mono font-bold text-amber-300">{totalValue.toFixed(2)} 🪙</span>
            </p>
          </div>
        </div>

        {/* Sell All Button */}
        {inventory.length > 0 && (
          <button
            type="button"
            onClick={handleSellAllClick}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 font-mono text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <Coins className="h-4 w-4" />
            <span>ПРОДАТИ ВСЕ (+{totalValue.toFixed(2)} 🪙)</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Пошук за зброєю або скіном..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Rarity Filter */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'Всі' },
            { id: 'gold', label: '★ Ножі' },
            { id: 'covert', label: 'Covert' },
            { id: 'classified', label: 'Classified' },
            { id: 'restricted', label: 'Restricted' },
            { id: 'mil-spec', label: 'Mil-Spec' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRarity(r.id)}
              className={`rounded-lg px-2.5 py-1 font-mono transition-colors cursor-pointer ${
                selectedRarity === r.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-slate-300 focus:outline-none"
          >
            <option value="price_desc">Від дорогих</option>
            <option value="price_asc">Від дешевих</option>
            <option value="recent">Спочатку нові</option>
          </select>
        </div>
      </div>

      {/* INVENTORY ITEMS GRID */}
      {inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 py-16 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-3xl">
            🎒
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Інвентар порожній</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              У вас поки немає скінів. Відкрийте безкоштовні кейси або крутіть фірмові бургер-бокси!
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCasesTab}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 cursor-pointer"
          >
            <PackageOpen className="h-4 w-4" />
            <span>Перейти до кейсів</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 p-8 text-center text-xs text-slate-400">
          Нічого не знайдено за вашим фільтром.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG['mil-spec']
            return (
              <div
                key={item.instanceId}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 transition-all hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/90 shadow-lg"
                style={{
                  borderTopColor: rarity.color,
                  borderTopWidth: '3px',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span style={{ color: rarity.color }} className="font-bold">
                    {rarity.label}
                  </span>
                  <span className="text-slate-400">{item.wear}</span>
                </div>

                {/* Skin Icon & Details */}
                <div className="my-3 flex flex-col items-center justify-center">
                  <span className="text-4xl drop-shadow group-hover:scale-110 transition-transform">
                    {item.imageEmoji || '🔫'}
                  </span>
                  <h4
                    className="mt-2 text-center text-xs font-extrabold truncate max-w-full"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  <span className="mt-1 font-mono text-xs font-black text-amber-300">
                    {item.price.toFixed(2)} 🪙
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleSellSingle(item)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/15 py-1.5 font-mono text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
                  >
                    <Coins className="h-3 w-3" />
                    <span>Продати ({item.price.toFixed(1)} 🪙)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSendToUpgrader(item)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/30 py-1.5 font-mono text-[11px] font-semibold text-purple-300 hover:bg-purple-900/40 transition-colors cursor-pointer"
                  >
                    <Zap className="h-3 w-3 text-purple-400" />
                    <span>В апгрейдер ⚡</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
