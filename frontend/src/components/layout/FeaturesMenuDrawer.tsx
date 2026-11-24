import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { setActiveView, type ActiveView } from '@/store/slices/appSlice'
import {
  X,
  Compass,
  Layers,
  BookOpen,
  ArrowLeftRight,
  Cpu,
  PlusCircle,
  ShieldCheck,
  Star,
  Search,
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="relative z-50 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-[#090d16] text-slate-100 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#0a0f1d]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-tight text-white">Меню функцій</h2>
                <Badge
                  variant="slate"
                  className="rounded-full border-cyan-500/30 bg-cyan-950/40 text-[10px] font-mono text-cyan-300"
                >
                  AgentHub
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Повний каталог, порівняння та технічна аналітика
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

        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
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
                  <span className="text-[10px] text-slate-500">2–3 агенти</span>
                )}
              </button>
            </div>
          </div>

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
                    <div className="font-semibold text-xs text-white">Запропонувати агента</div>
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
                    <div className="text-[11px] text-slate-400">Вихідний код проєкту</div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-3 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400">Гарячі клавіші:</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1">
                <span>Командне меню</span>
                <kbd className="font-mono text-cyan-300">⌘K</kbd>
              </div>
              <div className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1">
                <span>Швидкий пошук</span>
                <kbd className="font-mono text-cyan-300">/</kbd>
              </div>
              <div className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1 col-span-2">
                <span>Закрити модальне вікно / меню</span>
                <kbd className="font-mono text-cyan-300">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 px-6 py-3 bg-[#0a0f1d] flex items-center justify-between text-[11px] text-slate-400">
          <span>AgentHub Engine v1.1</span>
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
