import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import {
  setActiveView,
  openTetris,
  openHardestGame,
  openInvoker,
  openPudge,
  type ActiveView,
} from '@/store/slices/appSlice'
import {
  X,
  Compass,
  Layers,
  BookOpen,
  ArrowLeftRight,
  Cpu,
  Gamepad2,
  Sparkles,
  Zap,
  Target,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  Star,
  Search,
  Flame,
  LayoutGrid,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FeaturesMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  onOpenSearch?: () => void
  onOpenSubmit?: () => void
}

export const FeaturesMenuDrawer: React.FC<FeaturesMenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenSubmit,
}) => {
  const dispatch = useDispatch()
  const activeView = useSelector((state: RootState) => state.app.activeView)
  const stagedSlugs = useSelector((state: RootState) => state.compare.stagedAgentSlugs)

  // Listen to Escape key to close the drawer
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleNavigate = (view: ActiveView) => {
    dispatch(setActiveView(view))
    onClose()
  }

  const handleOpenGame = (game: 'tetris' | 'hardestGame' | 'invoker' | 'pudge') => {
    onClose()
    if (game === 'tetris') dispatch(openTetris())
    if (game === 'hardestGame') dispatch(openHardestGame())
    if (game === 'invoker') dispatch(openInvoker())
    if (game === 'pudge') dispatch(openPudge())
  }

  const handleLaunchSteam = () => {
    window.location.href = 'steam://run/570'
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Panel */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-[#090d16] text-slate-100 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#0a0f1d]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-tight text-white">
                  Меню функцій
                </h2>
                <Badge
                  variant="slate"
                  className="rounded-full border-cyan-500/30 bg-cyan-950/40 text-[10px] font-mono text-cyan-300"
                >
                  AgentHub
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Повний каталог, аналітика та 5 аркад
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white cursor-pointer"
            aria-label="Закрити меню"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Search Bar within Drawer */}
        <div className="px-6 pt-4 pb-2">
          <button
            type="button"
            onClick={() => {
              onClose()
              if (onOpenSearch) onOpenSearch()
            }}
            className="group flex h-10 w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 text-xs text-slate-400 transition-all hover:border-cyan-500/40 hover:bg-slate-900 hover:text-slate-200 cursor-pointer shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Швидкий пошук агентів & команд...</span>
            </div>
            <kbd className="inline-flex h-5 items-center rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {/* SECTION 1: Каталог та Дослідження */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>Каталог та Дослідження</span>
            </div>
            <div className="grid gap-1.5">
              <button
                type="button"
                onClick={() => handleNavigate('directory')}
                className={`group flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                  activeView === 'directory'
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800/80 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">Каталог AI-агентів</div>
                    <div className="text-[11px] text-slate-400">
                      Пошук за стеком, фільтрація та аудит
                    </div>
                  </div>
                </div>
                {activeView === 'directory' && (
                  <Badge variant="cyan" className="text-[10px] px-1.5 py-0">
                    Активно
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('collections')}
                className={`group flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                  activeView === 'collections'
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800/80 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">Кураторські колекції</div>
                    <div className="text-[11px] text-slate-400">
                      Тематичні добірки кращих автономних систем
                    </div>
                  </div>
                </div>
                <BookOpen className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
              </button>
            </div>
          </div>

          {/* SECTION 2: Бенчмаркінг та Аналітика */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>Бенчмаркінг та Порівняння</span>
            </div>
            <div className="grid gap-1.5">
              <button
                type="button"
                onClick={() => handleNavigate('compare')}
                className={`group flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                  activeView === 'compare'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-white shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'border-slate-800/80 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                    <ArrowLeftRight className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">Порівняльна матриця</div>
                    <div className="text-[11px] text-slate-400">
                      Порівняння бік-о-бік за 5 параметрами
                    </div>
                  </div>
                </div>
                {stagedSlugs.length > 0 ? (
                  <Badge variant="emerald" className="text-[10px] px-1.5 py-0 font-bold">
                    {stagedSlugs.length} у стеку
                  </Badge>
                ) : (
                  <span className="text-[10px] text-slate-500">2-4 агенти</span>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 3: Аркади та Міні-ігри (5 доступних ігор) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-1.5">
                <Gamepad2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Аркади та Міні-ігри</span>
              </div>
              <Badge
                variant="slate"
                className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[9px] px-1.5 py-0"
              >
                5 ігор
              </Badge>
            </div>

            <div className="grid gap-1.5">
              {/* Arcade Hub Page */}
              <button
                type="button"
                onClick={() => handleNavigate('arcade')}
                className={`group flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                  activeView === 'arcade'
                    ? 'border-amber-500/40 bg-amber-500/10 text-white shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800/80 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                    <Gamepad2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">Аркадний центр</div>
                    <div className="text-[11px] text-slate-400">
                      Головна вітрина всіх 5 міні-ігор
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-amber-400">Перейти →</span>
              </button>

              {/* Game 1: Classic Tetris */}
              <button
                type="button"
                onClick={() => handleOpenGame('tetris')}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-left transition-all hover:border-cyan-500/40 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">Classic Tetris</div>
                    <div className="text-[11px] text-slate-400">
                      Ретро-тетріс з SRS та системою рекордів
                    </div>
                  </div>
                </div>
                <kbd className="inline-flex h-4 items-center rounded border border-slate-700 bg-slate-800 px-1 font-mono text-[9px] text-slate-400">
                  Alt+T
                </kbd>
              </button>

              {/* Game 2: The World's Hardest Game */}
              <button
                type="button"
                onClick={() => handleOpenGame('hardestGame')}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-left transition-all hover:border-rose-500/40 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">World's Hardest Game</div>
                    <div className="text-[11px] text-slate-400">
                      4 рівні • Відео краша клавіатури під Stalemate
                    </div>
                  </div>
                </div>
                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 font-bold">
                  Hardcore
                </Badge>
              </button>

              {/* Game 3: Invoker Spell Trainer */}
              <button
                type="button"
                onClick={() => handleOpenGame('invoker')}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-left transition-all hover:border-indigo-500/40 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">Invoker Spell Trainer</div>
                    <div className="text-[11px] text-slate-400">
                      10 скілів, комбінації Q W E, 3 рівні
                    </div>
                  </div>
                </div>
                <kbd className="inline-flex h-4 items-center rounded border border-slate-700 bg-slate-800 px-1 font-mono text-[9px] text-slate-400">
                  Alt+I
                </kbd>
              </button>

              {/* Game 4: Pudge Hook Trainer */}
              <button
                type="button"
                onClick={() => handleOpenGame('pudge')}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-left transition-all hover:border-emerald-500/40 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">Pudge Hook Trainer</div>
                    <div className="text-[11px] text-slate-400">
                      Фізика 2D-ланцюга, рухомі кріпи та герої
                    </div>
                  </div>
                </div>
                <kbd className="inline-flex h-4 items-center rounded border border-slate-700 bg-slate-800 px-1 font-mono text-[9px] text-slate-400">
                  Alt+P
                </kbd>
              </button>

              {/* Game 5: Launch Dota 2 in Steam */}
              <button
                type="button"
                onClick={handleLaunchSteam}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-left transition-all hover:border-sky-500/40 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">Запуск Dota 2 в Steam</div>
                    <div className="text-[11px] text-slate-400">
                      Прямий запуск гри steam://run/570
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-sky-300 border-sky-500/30">
                  Steam
                </Badge>
              </button>
            </div>
          </div>

          {/* SECTION 4: Спільнота та Внесок */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Спільнота та Внесок</span>
            </div>
            <div className="grid gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  if (onOpenSubmit) {
                    onOpenSubmit()
                  } else {
                    handleNavigate('submit')
                  }
                }}
                className="group flex w-full items-center justify-between rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-emerald-950/40 p-2.5 text-left transition-all hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">+ Запропонувати агента</div>
                    <div className="text-[11px] text-slate-400">
                      Форма подачі з перевіркою за 12h SLA
                    </div>
                  </div>
                </div>
                <Badge variant="cyan" className="text-[10px] px-1.5 py-0 font-bold">
                  12h SLA
                </Badge>
              </button>

              <a
                href="https://github.com/QwenteeNabavan/prompt-engineering-template"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5 text-left transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
                    <Star className="h-4 w-4 fill-amber-400/30" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">GitHub Репозиторій</div>
                    <div className="text-[11px] text-slate-400">
                      Зірка проєкту та вихідний код
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-amber-400">★ 4.8k</span>
              </a>
            </div>
          </div>

          {/* SECTION 5: Гарячі клавіші */}
          <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-3 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400">Гарячі клавіші:</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1">
                <span>Командне меню</span>
                <kbd className="font-mono text-cyan-300">⌘K</kbd>
              </div>
              <div className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1">
                <span>Classic Tetris</span>
                <kbd className="font-mono text-cyan-300">Alt+T</kbd>
              </div>
              <div className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1">
                <span>Invoker Trainer</span>
                <kbd className="font-mono text-cyan-300">Alt+I</kbd>
              </div>
              <div className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1">
                <span>Pudge Hook</span>
                <kbd className="font-mono text-cyan-300">Alt+P</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/80 px-6 py-3 bg-[#0a0f1d] flex items-center justify-between text-[11px] text-slate-400">
          <span>AgentHub Engine v1.0</span>
          <button
            onClick={onClose}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            Закрити (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}
