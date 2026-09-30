import React, { useState } from 'react'
import {
  Code2,
  Globe,
  Search,
  Network,
  Cpu,
  Layers,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import type {
  AgentCategory,
  RuntimeEnvironment,
  PricingModel,
  SortOption,
} from '@/types/agent-registry'

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedCategory: AgentCategory
  onCategoryChange: (cat: AgentCategory) => void
  selectedRuntime: RuntimeEnvironment
  onRuntimeChange: (rt: RuntimeEnvironment) => void
  selectedPricing: PricingModel
  onPricingChange: (pr: PricingModel) => void
  mcpOnly: boolean
  onMcpToggle: () => void
  selectedSort: SortOption
  onSortChange: (sort: SortOption) => void
  totalCount: number
  filteredCount: number
  onResetFilters: () => void
}

const CATEGORY_ITEMS: { label: AgentCategory; icon: React.ReactNode }[] = [
  { label: 'All', icon: <Layers className="h-3.5 w-3.5" /> },
  { label: 'Coding & DevOps', icon: <Code2 className="h-3.5 w-3.5" /> },
  { label: 'Browser Automation', icon: <Globe className="h-3.5 w-3.5" /> },
  { label: 'Deep Research', icon: <Search className="h-3.5 w-3.5" /> },
  { label: 'Multi-Agent Frameworks', icon: <Network className="h-3.5 w-3.5" /> },
]

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedRuntime,
  onRuntimeChange,
  selectedPricing,
  onPricingChange,
  mcpOnly,
  onMcpToggle,
  selectedSort,
  onSortChange,
  totalCount,
  filteredCount,
  onResetFilters,
}) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedRuntime !== 'All' ||
    selectedPricing !== 'All' ||
    mcpOnly ||
    selectedSort !== 'trending'

  return (
    <div className="space-y-4 pt-6 pb-2">
      {/* 1. Category Tabs (Chips with Icons) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-inner">
          {CATEGORY_ITEMS.map(({ label, icon }) => {
            const isSelected = selectedCategory === label
            return (
              <button
                key={label}
                type="button"
                onClick={() => onCategoryChange(label)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700/70 shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className={isSelected ? 'text-cyan-400' : 'text-slate-400'}>
                  {icon}
                </span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Counter & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
            <span>Showing</span>
            <span className="font-bold text-white">{filteredCount}</span>
            <span>of {totalCount}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 2. Secondary Filter & Search Row (Desktop + Expandable Mobile) */}
      <div
        className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/70 backdrop-blur-xs ${
          isMobileFiltersOpen ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Left: Instant Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by agent, LLM backend, tag, or framework..."
            className="w-full h-8 pl-8 pr-8 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right: Dropdowns & MCP Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Runtime Dropdown */}
          <div className="relative">
            <select
              value={selectedRuntime}
              onChange={(e) => onRuntimeChange(e.target.value as RuntimeEnvironment)}
              className="h-8 rounded-lg bg-slate-950/80 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-colors"
            >
              <option value="All">All Runtimes</option>
              <option value="VS Code Extension">VS Code Extension</option>
              <option value="Local CLI">Local Terminal CLI</option>
              <option value="Docker">Docker Compose</option>
              <option value="Cloud Web">Cloud Web GUI</option>
            </select>
          </div>

          {/* Pricing Model Dropdown */}
          <div className="relative">
            <select
              value={selectedPricing}
              onChange={(e) => onPricingChange(e.target.value as PricingModel)}
              className="h-8 rounded-lg bg-slate-950/80 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-colors"
            >
              <option value="All">All Pricing</option>
              <option value="100% Free">100% Free</option>
              <option value="BYOK">BYOK (Bring Your Own Key)</option>
              <option value="Freemium">Freemium</option>
              <option value="Paid">Commercial / Paid</option>
            </select>
          </div>

          {/* Protocol Toggle: MCP Ready with Active Glow Indicator */}
          <button
            type="button"
            onClick={onMcpToggle}
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
              mcpOnly
                ? 'border-violet-500/50 bg-violet-950/40 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.35)] ring-1 ring-violet-500/40'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <span
              className={`flex h-2 w-2 rounded-full ${
                mcpOnly ? 'bg-violet-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <Cpu className="h-3 w-3" />
            <span>MCP Ready</span>
          </button>

          {/* Sort Controls */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-8 rounded-lg bg-slate-950/80 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer font-medium"
            >
              <option value="trending">🔥 Trending (HN Decay)</option>
              <option value="top_rated">👍 Top Upvoted</option>
              <option value="stars">⭐ GitHub Stars</option>
              <option value="recently_added">✨ Recently Added</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 h-8 px-2 text-xs text-slate-400 hover:text-cyan-400 cursor-pointer"
              title="Reset all active filters"
            >
              <X className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
