import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  X,
  ShieldCheck,
  Cpu,
  Star,
  CornerDownLeft,
  Gamepad2,
  Sparkles,
  Target,
} from 'lucide-react'
import type { AgentRegistryItem } from '@/types/agent-registry'

interface CommandMenuModalProps {
  isOpen: boolean
  onClose: () => void
  agents: AgentRegistryItem[]
  onSelectAgent: (agent: AgentRegistryItem) => void
  onOpenTetris?: () => void
  onOpenHardestGame?: () => void
  onOpenInvoker?: () => void
  onOpenPudge?: () => void
}

export const CommandMenuModal: React.FC<CommandMenuModalProps> = ({
  isOpen,
  onClose,
  agents,
  onSelectAgent,
  onOpenTetris,
  onOpenHardestGame,
  onOpenInvoker,
  onOpenPudge,
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Global hotkey listener for Cmd+K and Escape / Alt+T / Alt+I
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
      } else if (e.key === 'Escape' && isOpen) {
        onClose()
      } else if (
        ((e.altKey && e.key.toLowerCase() === 't') ||
          (e.shiftKey && e.key.toLowerCase() === 't')) &&
        isOpen
      ) {
        e.preventDefault()
        onClose()
        onOpenTetris?.()
      } else if (
        ((e.altKey && e.key.toLowerCase() === 'i') ||
          (e.shiftKey && e.key.toLowerCase() === 'i')) &&
        isOpen
      ) {
        e.preventDefault()
        onClose()
        onOpenInvoker?.()
      } else if (
        ((e.altKey && e.key.toLowerCase() === 'p') ||
          (e.shiftKey && e.key.toLowerCase() === 'p')) &&
        isOpen
      ) {
        e.preventDefault()
        onClose()
        onOpenPudge?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onOpenTetris, onOpenInvoker, onOpenPudge])

  if (!isOpen) return null

  const filtered = agents.filter((a) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      a.name.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      a.primaryLlm.toLowerCase().includes(q) ||
      a.framework.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    )
  })

  const isTetrisQuery =
    !query.trim() ||
    'tetris'.includes(query.toLowerCase().trim()) ||
    'arcade'.includes(query.toLowerCase().trim())

  const isHardestGameQuery =
    query.trim().toLowerCase() === 'game' ||
    'hardest'.includes(query.toLowerCase().trim()) ||
    (query.trim().length > 2 && "the world's hardest game".includes(query.toLowerCase().trim()))

  const isInvokerQuery =
    !query.trim() ||
    'invoker'.includes(query.toLowerCase().trim()) ||
    'dota'.includes(query.toLowerCase().trim()) ||
    'spell'.includes(query.toLowerCase().trim())

  const isPudgeQuery =
    !query.trim() ||
    'pudge'.includes(query.toLowerCase().trim()) ||
    'hook'.includes(query.toLowerCase().trim()) ||
    'meat'.includes(query.toLowerCase().trim())

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim().toLowerCase() === 'game' && onOpenHardestGame) {
      e.preventDefault()
      onClose()
      onOpenHardestGame()
      return
    }

    if (
      e.key === 'Enter' &&
      ['invoker', 'dota', 'spell'].includes(query.trim().toLowerCase()) &&
      onOpenInvoker
    ) {
      e.preventDefault()
      onClose()
      onOpenInvoker()
      return
    }

    if (
      e.key === 'Enter' &&
      ['pudge', 'hook', 'meat', 'fresh meat'].includes(query.trim().toLowerCase()) &&
      onOpenPudge
    ) {
      e.preventDefault()
      onClose()
      onOpenPudge()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      onSelectAgent(filtered[selectedIndex])
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Command Palette Box */}
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#090d16] shadow-2xl z-10 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
          <Search className="h-4 w-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search agents by name, LLM, or tag..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Hardest Game Item (Triggered by searching "Game") */}
          {onOpenHardestGame && isHardestGameQuery && (
            <div
              onClick={() => {
                onClose()
                onOpenHardestGame()
              }}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer border border-rose-500/40 bg-rose-950/25 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Gamepad2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-white truncate">
                    <span>The World&apos;s Hardest Game</span>
                    <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[9px] font-mono text-rose-400 border border-rose-500/30">
                      Easter Egg
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Triggered by search &ldquo;Game&rdquo; &bull; Features Doggie crashout video loss moment (Track: Stalemate)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                <kbd className="rounded border border-rose-500/40 bg-slate-900 px-1.5 py-0.5 text-[10px] text-rose-300">
                  Enter
                </kbd>
                <CornerDownLeft className="h-3.5 w-3.5 text-rose-400" />
              </div>
            </div>
          )}

          {/* Tetris Item */}
          {onOpenTetris && isTetrisQuery && (
            <div
              onClick={() => {
                onClose()
                onOpenTetris()
              }}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Gamepad2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-white truncate">
                    <span>Play Tetris Mini-Game</span>
                    <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 border border-cyan-500/30">
                      Arcade
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Launch embedded dark mode Tetris modal with ghost piece & score tracking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                <kbd className="rounded border border-cyan-500/40 bg-slate-900 px-1.5 py-0.5 text-[10px] text-cyan-300">
                  Alt+T
                </kbd>
                <CornerDownLeft className="h-3.5 w-3.5 text-cyan-400" />
              </div>
            </div>
          )}

          {/* Invoker Spell Trainer Item */}
          {onOpenInvoker && isInvokerQuery && (
            <div
              onClick={() => {
                onClose()
                onOpenInvoker()
              }}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer border border-purple-500/30 bg-purple-950/20 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-white truncate">
                    <span>Invoker Spell Trainer</span>
                    <span className="rounded bg-purple-950 px-1.5 py-0.5 text-[9px] font-mono text-purple-400 border border-purple-500/30">
                      Dota 2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Practice all 10 Quas-Wex-Exort spell combinations across 3 difficulty levels
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                <kbd className="rounded border border-purple-500/40 bg-slate-900 px-1.5 py-0.5 text-[10px] text-purple-300">
                  Alt+I
                </kbd>
                <CornerDownLeft className="h-3.5 w-3.5 text-purple-400" />
              </div>
            </div>
          )}

          {/* Pudge Meat Hook Precision Trainer Item */}
          {onOpenPudge && isPudgeQuery && (
            <div
              onClick={() => {
                onClose()
                onOpenPudge()
              }}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer border border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Target className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-white truncate">
                    <span>Pudge Meat Hook Trainer</span>
                    <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[9px] font-mono text-rose-400 border border-rose-500/30">
                      Dota 2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Train hook precision, target leading, and angle prediction with 2D chain physics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                <kbd className="rounded border border-rose-500/40 bg-slate-900 px-1.5 py-0.5 text-[10px] text-rose-300">
                  Alt+P
                </kbd>
                <CornerDownLeft className="h-3.5 w-3.5 text-rose-400" />
              </div>
            </div>
          )}

          {filtered.length === 0 &&
          (!onOpenTetris || !isTetrisQuery) &&
          (!onOpenHardestGame || !isHardestGameQuery) &&
          (!onOpenInvoker || !isInvokerQuery) &&
          (!onOpenPudge || !isPudgeQuery) ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No matching agents found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((agent, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    onSelectAgent(agent)
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/80 text-white border border-slate-700/60 shadow-xs'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={agent.logoUrl}
                      alt={agent.name}
                      className="h-7 w-7 rounded-lg object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-white truncate">
                        <span>{agent.name}</span>
                        {agent.verified && (
                          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        )}
                        <span className="font-mono text-[10px] text-slate-500 font-normal">
                          &bull; {agent.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {agent.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    {agent.isMcpReady && (
                      <span className="text-violet-400 flex items-center gap-0.5">
                        <Cpu className="h-3 w-3" /> MCP
                      </span>
                    )}
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400/30" />
                      {(agent.githubStars / 1000).toFixed(0)}k
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="h-3.5 w-3.5 text-cyan-400" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-4 py-2 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">↵</kbd> to select
            </span>
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-slate-300">esc</kbd> to close
            </span>
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-cyan-300">Alt+T</kbd> Tetris
            </span>
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-purple-300">Alt+I</kbd> Invoker
            </span>
            <span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-rose-300">Alt+P</kbd> Pudge
            </span>
          </div>
          <span className="text-cyan-400/80">AgentHub Command Registry</span>
        </div>
      </div>
    </div>
  )
}
