import React, { useState, useMemo, useEffect } from 'react'
import { HeaderNav } from './HeaderNav'
import { HeroTelemetry } from './HeroTelemetry'
import { FilterBar } from './FilterBar'
import { AgentCard } from './AgentCard'
import { AgentQuickViewModal } from './AgentQuickViewModal'
import { CommandMenuModal } from './CommandMenuModal'
import { SubmitAgentModal } from './SubmitAgentModal'
import { ComparePage } from '@/features/compare/ComparePage'
import { ArcadePage } from '@/features/arcade/ArcadePage'
import { MOCK_AGENTS } from '@/data/mockAgents'
import type {
  AgentCategory,
  RuntimeEnvironment,
  PricingModel,
  SortOption,
  AgentRegistryItem,
} from '@/types/agent-registry'
import { Search, Sparkles, Terminal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { openTetris, openHardestGame, closeHardestGame, openInvoker, openPudge, setActiveView } from '@/store/slices/appSlice'
import { HardestGameModal } from './HardestGameModal'

export const AgentHubDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const isHardestGameOpen = useSelector((state: RootState) => state.app.isHardestGameOpen)

  // Navigation & Modal States
  const [activeNavTab, setActiveNavTab] = useState('explore')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [selectedAgentForPreview, setSelectedAgentForPreview] =
    useState<AgentRegistryItem | null>(null)

  // Local upvotes tracking
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('agenthub_upvoted_ids')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory>('All')
  const [selectedRuntime, setSelectedRuntime] =
    useState<RuntimeEnvironment>('All')
  const [selectedPricing, setSelectedPricing] = useState<PricingModel>('All')
  const [mcpOnly, setMcpOnly] = useState(false)
  const [selectedSort, setSelectedSort] = useState<SortOption>('trending')

  // Notification Toast for submission
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Global hotkey listener for Cmd+K / Ctrl+K and Tetris shortcut (Alt+T / Shift+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(
        (e.target as HTMLElement)?.tagName
      )

      // Tetris Easter Egg Shortcut: Alt+T or Shift+T (when not typing)
      if (
        (e.altKey && e.key.toLowerCase() === 't') ||
        (e.shiftKey && e.key.toLowerCase() === 't' && !isInput)
      ) {
        e.preventDefault()
        dispatch(openTetris())
        return
      }

      // Invoker Trainer Shortcut: Alt+I or Shift+I (when not typing)
      if (
        (e.altKey && e.key.toLowerCase() === 'i') ||
        (e.shiftKey && e.key.toLowerCase() === 'i' && !isInput)
      ) {
        e.preventDefault()
        dispatch(openInvoker())
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      } else if (e.key === '/' && !isInput) {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Trigger The World's Hardest Game whenever user enters "Game" or "game" in the search bar
  useEffect(() => {
    if (searchQuery.trim().toLowerCase() === 'game') {
      dispatch(openHardestGame())
    }
  }, [searchQuery, dispatch])

  // Trigger Invoker Spell Trainer whenever user enters "invoker" or "dota" in the search bar
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (['invoker', 'dota', 'spell'].includes(q)) {
      dispatch(openInvoker())
    }
  }, [searchQuery, dispatch])

  // Trigger Pudge Hook Trainer whenever user enters "pudge", "hook", or "meat" in the search bar
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (['pudge', 'hook', 'meat', 'fresh meat'].includes(q)) {
      dispatch(openPudge())
    }
  }, [searchQuery, dispatch])

  const handleCloseHardestGame = () => {
    dispatch(closeHardestGame())
    if (searchQuery.trim().toLowerCase() === 'game') {
      setSearchQuery('')
    }
  }

  // Handle Toggle Upvote
  const handleToggleUpvote = (agentId: string) => {
    setUpvotedIds((prev) => {
      const next = { ...prev, [agentId]: !prev[agentId] }
      try {
        localStorage.setItem('agenthub_upvoted_ids', JSON.stringify(next))
      } catch (e) {
        console.error(e)
      }
      return next
    })
  }

  // Filter & Sort Logic
  const filteredAgents = useMemo(() => {
    return MOCK_AGENTS.filter((agent) => {
      // 1. Text Search (Name, Tagline, Primary LLM, Framework, Description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesText =
          agent.name.toLowerCase().includes(q) ||
          agent.tagline.toLowerCase().includes(q) ||
          agent.primaryLlm.toLowerCase().includes(q) ||
          agent.framework.toLowerCase().includes(q) ||
          agent.category.toLowerCase().includes(q) ||
          agent.runtime.toLowerCase().includes(q)
        if (!matchesText) return false
      }

      // 2. Category Filter
      if (selectedCategory !== 'All' && agent.category !== selectedCategory) {
        return false
      }

      // 3. Runtime Environment
      if (selectedRuntime !== 'All' && agent.runtime !== selectedRuntime) {
        return false
      }

      // 4. Pricing Model
      if (selectedPricing !== 'All' && agent.pricing !== selectedPricing) {
        return false
      }

      // 5. MCP Protocol Ready
      if (mcpOnly && !agent.isMcpReady) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (selectedSort === 'top_rated') {
        return b.upvotesCount - a.upvotesCount
      }
      if (selectedSort === 'stars') {
        return b.githubStars - a.githubStars
      }
      if (selectedSort === 'recently_added') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      // default: trending (decay score)
      return b.trendingScore - a.trendingScore
    })
  }, [
    searchQuery,
    selectedCategory,
    selectedRuntime,
    selectedPricing,
    mcpOnly,
    selectedSort,
  ])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedRuntime('All')
    setSelectedPricing('All')
    setMcpOnly(false)
    setSelectedSort('trending')
  }

  const handleNavTabChange = (tab: string) => {
    if (tab === 'arcade') {
      dispatch(setActiveView('arcade'))
      return
    }
    if (tab === 'compare') {
      dispatch(setActiveView('compare'))
      return
    }
    if (tab === 'collections') {
      dispatch(setActiveView('collections'))
      return
    }
    setActiveNavTab(tab)
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/95 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <HeaderNav
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        activeNavTab={activeNavTab}
        onNavTabChange={handleNavTabChange}
        totalAgentsCount={MOCK_AGENTS.length}
      />

      {/* Main Views */}
      {activeNavTab === 'explore' ? (
        <>
          {/* Hero & Telemetry Metrics Section */}
          <HeroTelemetry />

          {/* Main Container */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Faceted Filter Bar & Controls */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedRuntime={selectedRuntime}
              onRuntimeChange={setSelectedRuntime}
              selectedPricing={selectedPricing}
              onPricingChange={setSelectedPricing}
              mcpOnly={mcpOnly}
              onMcpToggle={() => setMcpOnly((prev) => !prev)}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              totalCount={MOCK_AGENTS.length}
              filteredCount={filteredAgents.length}
              onResetFilters={handleResetFilters}
            />

            {/* Agent Cards Grid */}
            <section className="space-y-4">
              {filteredAgents.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base text-white">
                    No autonomous agents match your filters
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Try loosening your runtime, pricing, or MCP protocol filters to discover more agents.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                /* Responsive Grid of Compact Agent Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isUpvoted={!!upvotedIds[agent.id]}
                      onQuickView={(a) => setSelectedAgentForPreview(a)}
                      onToggleUpvote={handleToggleUpvote}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
        </>
      ) : activeNavTab === 'arcade' ? (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <ArcadePage />
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <ComparePage />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-20 py-10 bg-slate-950/60 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-slate-300">AgentHub</span>
            <span>&mdash; The Open Registry for Autonomous AI Agents</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="font-mono text-[11px]">MIT Licensed</span>
            <span>&bull;</span>
            <a
              href="https://github.com/QwenteeNabavan/prompt-engineering-template"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              GitHub Registry
            </a>
            <span>&bull;</span>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Submit Protocol
            </button>
          </div>
        </div>
      </footer>

      {/* Quick View Sheet / Modal */}
      <AgentQuickViewModal
        agent={selectedAgentForPreview}
        isOpen={!!selectedAgentForPreview}
        onClose={() => setSelectedAgentForPreview(null)}
        isUpvoted={
          selectedAgentForPreview
            ? !!upvotedIds[selectedAgentForPreview.id]
            : false
        }
        onToggleUpvote={handleToggleUpvote}
      />

      {/* Command Palette (Cmd+K) Modal */}
      <CommandMenuModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        agents={MOCK_AGENTS}
        onSelectAgent={(agent) => {
          setSelectedAgentForPreview(agent)
          setIsSearchOpen(false)
        }}
        onOpenTetris={() => dispatch(openTetris())}
        onOpenHardestGame={() => dispatch(openHardestGame())}
        onOpenInvoker={() => dispatch(openInvoker())}
        onOpenPudge={() => dispatch(openPudge())}
      />

      {/* The World's Hardest Game Secret Easter Egg Modal */}
      <HardestGameModal
        isOpen={isHardestGameOpen}
        onClose={handleCloseHardestGame}
      />

      {/* Submit Agent Intake Modal */}
      <SubmitAgentModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSuccess={(name) => {
          setToastMessage(`Agent "${name}" submitted for 12h SLA verification audit!`)
          setTimeout(() => setToastMessage(null), 4000)
        }}
      />
    </div>
  )
}
