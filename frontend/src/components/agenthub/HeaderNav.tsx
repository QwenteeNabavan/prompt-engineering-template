import React from 'react'
import {
  Terminal,
  Search,
  Plus,
  Command,
  Layers,
  ArrowLeftRight,
  Compass,
  Gamepad2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface HeaderNavProps {
  onOpenSearch: () => void
  onOpenSubmit: () => void
  onOpenTetris?: () => void
  activeNavTab: string
  onNavTabChange: (tab: string) => void
  totalAgentsCount: number
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenSearch,
  onOpenSubmit,
  activeNavTab,
  onNavTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logotype & Version Pill */}
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

        {/* Center: Command Palette Trigger (Cmd+K) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <button
            type="button"
            onClick={onOpenSearch}
            className="group flex h-9 w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200 cursor-pointer shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Search agents, LLM backends, frameworks...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] text-slate-400 group-hover:border-slate-600 group-hover:text-slate-200">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Navigation, Submit Button & GitHub Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <button
              onClick={() => onNavTabChange('explore')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeNavTab === 'explore'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => onNavTabChange('compare')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeNavTab === 'compare'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Compare</span>
            </button>

            <button
              onClick={() => onNavTabChange('collections')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeNavTab === 'collections'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Collections</span>
            </button>

            <button
              onClick={() => onNavTabChange('arcade')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeNavTab === 'arcade'
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Arcade</span>
              <span className="ml-1 rounded-full bg-cyan-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                5
              </span>
            </button>
          </nav>

          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* GitHub Star Link */}
          <a
            href="https://github.com/QwenteeNabavan/prompt-engineering-template"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 text-xs font-mono text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <svg className="h-3.5 w-3.5 fill-current text-slate-400" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden xl:inline text-slate-400">Star</span>
            <span className="text-amber-400 font-semibold">★ 4.8k</span>
          </a>

          {/* High Contrast "+ Submit Agent" Button */}
          <button
            type="button"
            onClick={onOpenSubmit}
            className="group relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 text-xs font-semibold text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_22px_rgba(6,182,212,0.5)] hover:brightness-105 active:scale-98 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5] transition-transform group-hover:rotate-90 duration-200" />
            <span>Submit Agent</span>
          </button>
        </div>
      </div>
    </header>
  )
}
