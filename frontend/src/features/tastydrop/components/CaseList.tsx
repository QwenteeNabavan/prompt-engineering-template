import React, { useState } from 'react'
import type { CaseDefinition } from '../types'
import { CASES_DATA } from '../data/casesData'
import { CaseCard } from './CaseCard'
import { Search, Flame, Gift, Package } from 'lucide-react'

interface CaseListProps {
  userBalance: number
  onSelectCase: (caseDef: CaseDefinition) => void
}

export const CaseList: React.FC<CaseListProps> = ({ userBalance, onSelectCase }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const categories = [
    { id: 'all', label: 'Всі кейси', icon: Package },
    { id: 'free', label: '🎁 Безкоштовні (0🪙)', icon: Gift },
    { id: 'tasty', label: '🍔 Tasty Спеціальні', icon: Flame },
    { id: 'knives', label: '🔪 Тільки ножі', icon: Flame },
    { id: 'exclusive', label: '🐉 Джекпот хайролер', icon: Flame },
  ]

  const filteredCases = CASES_DATA.filter((c) => {
    const matchCategory =
      activeCategory === 'all' ||
      (activeCategory === 'free' && c.isFree) ||
      c.category === activeCategory
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Category Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Пошук кейсу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Cases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCases.map((caseDef) => (
          <CaseCard
            key={caseDef.id}
            caseDef={caseDef}
            onSelect={onSelectCase}
            userBalance={userBalance}
          />
        ))}
      </div>
    </div>
  )
}
