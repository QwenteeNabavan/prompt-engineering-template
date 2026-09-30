import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { setActiveView, type ActiveView } from '@/store/slices/appSlice'
import {
  Bot,
  LayoutGrid,
  ArrowLeftRight,
  BookOpen,
  PlusCircle,
  Sparkles,
  Gamepad2,
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const dispatch = useDispatch()
  const activeView = useSelector((state: RootState) => state.app.activeView)
  const stagedSlugs = useSelector(
    (state: RootState) => state.compare.stagedAgentSlugs
  )

  const navItems: { view: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { view: 'directory', label: 'Directory', icon: <LayoutGrid className="w-4 h-4 mr-1.5" /> },
    {
      view: 'compare',
      label: 'Compare',
      icon: <ArrowLeftRight className="w-4 h-4 mr-1.5" />,
      badge: stagedSlugs.length > 0 ? stagedSlugs.length : undefined,
    },
    { view: 'collections', label: 'Collections', icon: <BookOpen className="w-4 h-4 mr-1.5" /> },
    { view: 'arcade', label: 'Arcade', icon: <Gamepad2 className="w-4 h-4 mr-1.5 text-cyan-400" />, badge: 5 },
    { view: 'submit', label: 'Submit Agent', icon: <PlusCircle className="w-4 h-4 mr-1.5 text-primary" /> },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => dispatch(setActiveView('directory'))}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-foreground">
                Agent<span className="text-primary font-black">Hub</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                <Sparkles className="w-3 h-3" /> Autonomous
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Directory & Technical Audit Benchmark
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = activeView === item.view
            return (
              <button
                key={item.view}
                onClick={() => dispatch(setActiveView(item.view))}
                className={`relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-secondary text-primary font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

