import React from 'react'
import {
  Terminal,
  Search,
  Plus,
  Menu,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useDispatch } from 'react-redux'
import { openFeaturesMenu } from '@/store/slices/appSlice'

interface HeaderNavProps {
  onOpenSearch: () => void
  onOpenSubmit: () => void
  onOpenTetris?: () => void
  activeNavTab: string
  onNavTabChange: (tab: string) => void
  totalAgentsCount: number
  searchQuery?: string
  onSearchChange?: (q: string) => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenSearch,
  onOpenSubmit,
  onNavTabChange,
  searchQuery = '',
  onSearchChange,
}) => {
  const dispatch = useDispatch()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Minimal Brand Logotype & Live Status */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavTabChange('explore')}
            className="group flex cursor-pointer items-center gap-2.5 transition-transform active:scale-98"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Terminal className="h-4 w-4 text-cyan-400 transition-transform group-hover:scale-110" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                Agent<span className="text-cyan-400">Hub</span>
              </span>
              <Badge
                variant="slate"
                className="h-5 rounded-full border-slate-700/60 bg-slate-900 px-1.5 py-0 font-mono text-[10px] text-slate-400"
              >
                v1.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Center: Clean & Empty for Minimalist Aesthetic */}
        <div className="hidden md:block flex-1" />

        {/* Right: Simplified Search, Submit & Categorized Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Simplified Search moved to the right */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Пошук... ⌘K"
              className="h-8 w-36 sm:w-44 md:w-56 rounded-lg border border-slate-800 bg-slate-900/80 pl-8 pr-7 text-xs text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-sans"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Очистити пошук"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenSearch}
                className="absolute right-1.5 hidden sm:flex items-center rounded border border-slate-700/80 bg-slate-800/80 px-1 font-mono text-[9px] text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Відкрити командне меню (⌘K)"
              >
                ⌘K
              </button>
            )}
          </div>

          {/* Direct Submit Action */}
          <button
            type="button"
            onClick={onOpenSubmit}
            className="hidden sm:inline-flex group relative h-8 items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all hover:shadow-[0_0_18px_rgba(6,182,212,0.4)] hover:brightness-105 active:scale-98 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5] transition-transform group-hover:rotate-90 duration-200" />
            <span>Submit</span>
          </button>

          {/* Right-Side All-Features Menu Trigger */}
          <button
            type="button"
            onClick={() => dispatch(openFeaturesMenu())}
            className="group inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-700/90 bg-slate-850 px-2.5 sm:px-3 text-xs font-semibold text-slate-200 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300 shadow-sm active:scale-98 cursor-pointer"
            title="Відкрити всі функції сайту"
          >
            <Menu className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold hidden xs:inline">Меню</span>
            <span className="flex h-4 items-center justify-center rounded-full bg-cyan-500/20 px-1.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              5
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
