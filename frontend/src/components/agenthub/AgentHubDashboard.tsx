import React, { useState, useMemo, useEffect } from 'react'
import Fuse from 'fuse.js'
import { HeaderNav } from './HeaderNav'
import { HeroTelemetry } from './HeroTelemetry'
import { FilterBar } from './FilterBar'
import { AgentCard } from './AgentCard'
import { AgentQuickViewModal } from './AgentQuickViewModal'
import { CommandMenuModal } from './CommandMenuModal'
import { SubmitAgentModal } from './SubmitAgentModal'
import { StagingDock } from '@/components/compare/StagingDock'
import { ComparePage } from '@/features/compare/ComparePage'
import { ArcadePage } from '@/features/arcade/ArcadePage'
import { MOCK_AGENTS } from '@/data/mockAgents'
import {
  useListAgentsQuery,
  useListCategoriesQuery,
  useToggleUpvoteMutation,
} from '@/store/api/agentsApi'
import { getClientFingerprint } from '@/lib/utils'
import type { AgentListItem, Category } from '@/types/agent'
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
import {
  openTetris,
  openHardestGame,
  openInvoker,
  openPudge,
  setActiveView,
  setSearchQuery as setReduxSearchQuery,
  openAgentProfile,
} from '@/store/slices/appSlice'
import { addAgentToCompare, removeAgentFromCompare } from '@/store/slices/compareSlice'

const CATEGORY_SLUG_MAP: Record<string, Exclude<AgentCategory, 'All'>> = {
  'coding-devops': 'Coding & DevOps',
  'web-browser-automation': 'Browser Automation',
  'research-data-analysis': 'Deep Research',
  'sales-outreach': 'Sales & Outreach',
  'multi-agent-frameworks': 'Multi-Agent Frameworks',
}

const TARGET_TO_RUNTIME: Record<string, Exclude<RuntimeEnvironment, 'All'>> = {
  ide_extension: 'VS Code Extension',
  local_cli: 'Local CLI',
  docker: 'Docker',
  cloud_saas: 'Cloud Web',
}

function mapApiAgentToRegistryItem(
  agent: AgentListItem,
  categoriesById: Map<string, Category>,
  staticBySlug: Map<string, AgentRegistryItem>
): AgentRegistryItem {
  const staticFallback = staticBySlug.get(agent.slug)
  const categoryObj = categoriesById.get(agent.category_id)
  const mappedCategory =
    (categoryObj && CATEGORY_SLUG_MAP[categoryObj.slug]) ||
    staticFallback?.category ||
    'Coding & DevOps'

  const mappedRuntimes = agent.deployment_targets
    .map((t) => TARGET_TO_RUNTIME[t])
    .filter((rt): rt is Exclude<RuntimeEnvironment, 'All'> => Boolean(rt))

  const primaryRuntime =
    staticFallback?.runtime && mappedRuntimes.includes(staticFallback.runtime)
      ? staticFallback.runtime
      : mappedRuntimes[0] || staticFallback?.runtime || 'Local CLI'

  const pricing: Exclude<PricingModel, 'All'> = !agent.is_open_source
    ? 'Paid'
    : staticFallback?.pricing === 'BYOK' || staticFallback?.pricing === 'Freemium'
      ? staticFallback.pricing
      : '100% Free'

  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.title,
    tagline: agent.summary || agent.tagline,
    description: staticFallback?.description || agent.tagline,
    logoUrl: agent.logo_url,
    verified: agent.lifecycle_state === 'approved',
    upvotesCount: agent.upvotes_count,
    category: mappedCategory,
    runtime: primaryRuntime,
    supportedRuntimes: mappedRuntimes.length > 0 ? mappedRuntimes : [primaryRuntime],
    pricing,
    primaryLlm: agent.llm_backends[0] || staticFallback?.primaryLlm || 'Multi-Model LLM',
    license: agent.is_open_source ? staticFallback?.license || 'Open Source' : 'Commercial',
    isMcpReady: agent.is_mcp_compliant,
    githubStars: agent.github_stars,
    framework: agent.framework || staticFallback?.framework || 'Autonomous Core',
    quickstartSnippet:
      staticFallback?.quickstartSnippet || `# Visit ${agent.website_url} for setup instructions`,
    architecture: staticFallback?.architecture || {
      planningLoop: 'Autonomous multi-step goal decomposition and verification loop',
      memoryType: 'Contextual state buffer with persistent session history',
      toolExecution: 'Sandboxed API, CLI, and runtime environment invocation',
    },
    strengths: staticFallback?.strengths || [
      'Verified autonomous planning and multi-step tool execution',
    ],
    knownEdgeCases: staticFallback?.knownEdgeCases || [
      'Token consumption scales with task horizon depth',
    ],
    externalLinks: {
      launchUrl: agent.website_url,
      repoUrl: agent.repository_url || undefined,
      docsUrl: staticFallback?.externalLinks.docsUrl,
    },
    trendingScore: agent.ranking_score,
    createdAt: agent.created_at,
  }
}

export const AgentHubDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const searchQuery = useSelector((state: RootState) => state.app.searchQuery)
  const stagedSlugs = useSelector((state: RootState) => state.compare.stagedAgentSlugs)
  const SHOW_ARCADE = false

  const setSearchQuery = (q: string) => {
    dispatch(setReduxSearchQuery(q))
  }

  // RTK Query hooks connected to FastAPI backend
  const { data: apiCategories = [] } = useListCategoriesQuery()
  const {
    data: apiAgents,
    isLoading: isAgentsLoading,
    isError: isAgentsError,
  } = useListAgentsQuery()
  const [toggleUpvoteMutation] = useToggleUpvoteMutation()

  const isUsingLiveApi = Array.isArray(apiAgents) && !isAgentsError

  // 250ms Debounced Search Query (per BRD specification)
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Local upvotes state persisted in localStorage
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('agenthub_upvoted_ids')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Navigation & Modal States
  const [activeNavTab, setActiveNavTab] = useState('explore')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [previewSlug, setPreviewSlug] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('agent')
  })

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory>('All')
  const [selectedRuntime, setSelectedRuntime] = useState<RuntimeEnvironment>('All')
  const [selectedPricing, setSelectedPricing] = useState<PricingModel>('All')
  const [mcpOnly, setMcpOnly] = useState(false)
  const [selectedSort, setSelectedSort] = useState<SortOption>('trending')

  // Notification Toast for submission / comparison
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Build unified catalog from live FastAPI backend (with offline fallback to MOCK_AGENTS)
  const catalogAgents = useMemo<AgentRegistryItem[]>(() => {
    if (isUsingLiveApi && apiAgents) {
      const categoriesById = new Map(apiCategories.map((c) => [c.id, c]))
      const staticBySlug = new Map(MOCK_AGENTS.map((m) => [m.slug, m]))
      return apiAgents.map((a) => mapApiAgentToRegistryItem(a, categoriesById, staticBySlug))
    }
    if (isAgentsLoading) {
      return []
    }
    // Offline fallback: adjust mock counts for local upvote toggles
    return MOCK_AGENTS.map((m) => ({
      ...m,
      upvotesCount: m.upvotesCount + (upvotedIds[m.id] ? 1 : 0),
    }))
  }, [isUsingLiveApi, apiAgents, apiCategories, isAgentsLoading, upvotedIds])

  const selectedAgentForPreview = useMemo(
    () => (previewSlug ? catalogAgents.find((a) => a.slug === previewSlug) || null : null),
    [previewSlug, catalogAgents]
  )

  // Fuse.js client-side fuzzy matching across titles, tags, LLMs, and frameworks
  const fuse = useMemo(() => {
    return new Fuse(catalogAgents, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'tagline', weight: 0.25 },
        { name: 'framework', weight: 0.15 },
        { name: 'primaryLlm', weight: 0.1 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    })
  }, [catalogAgents])

  // Global hotkey listener for Cmd+K / Ctrl+K and "/" search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)

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

  // Trigger Easter Egg games when SHOW_ARCADE is enabled
  useEffect(() => {
    if (!SHOW_ARCADE) return
    const q = searchQuery.trim().toLowerCase()
    if (q === 'game') {
      dispatch(openHardestGame())
    } else if (['invoker', 'dota', 'spell'].includes(q)) {
      dispatch(openInvoker())
    } else if (['pudge', 'hook', 'meat', 'fresh meat'].includes(q)) {
      dispatch(openPudge())
    }
  }, [searchQuery, dispatch, SHOW_ARCADE])

  // Handle Toggle Upvote via FastAPI backend mutation (with localStorage persistence)
  const handleToggleUpvote = async (agentId: string) => {
    const prevUpvoted = !!upvotedIds[agentId]
    const optimisticNext = { ...upvotedIds, [agentId]: !prevUpvoted }
    setUpvotedIds(optimisticNext)
    try {
      localStorage.setItem('agenthub_upvoted_ids', JSON.stringify(optimisticNext))
    } catch {
      // Ignore storage quota errors
    }

    if (!isUsingLiveApi) return

    try {
      const res = await toggleUpvoteMutation({
        agentId,
        fingerprint: getClientFingerprint(),
      }).unwrap()
      setUpvotedIds((curr) => {
        const synced = { ...curr, [agentId]: res.has_upvoted }
        try {
          localStorage.setItem('agenthub_upvoted_ids', JSON.stringify(synced))
        } catch {
          // Ignore storage quota errors
        }
        return synced
      })
    } catch (err) {
      // Rollback optimistic toggle on network error
      setUpvotedIds((curr) => ({ ...curr, [agentId]: prevUpvoted }))
      console.error('Failed to toggle upvote:', err)
    }
  }

  // Handle Toggle Compare Staging
  const handleToggleCompare = (slug: string) => {
    if (stagedSlugs.includes(slug)) {
      dispatch(removeAgentFromCompare(slug))
    } else {
      if (stagedSlugs.length >= 3) {
        showToast('Maximum 3 agents can be compared simultaneously.')
        return
      }
      dispatch(addAgentToCompare(slug))
    }
  }

  // Fuzzy Search + Multi-Faceted Filter & Sort Logic
  const filteredAgents = useMemo(() => {
    const q = debouncedSearch.trim()
    const baseList = q ? fuse.search(q).map((r) => r.item) : catalogAgents

    const filtered = baseList.filter((agent) => {
      if (selectedCategory !== 'All' && agent.category !== selectedCategory) {
        return false
      }

      if (selectedRuntime !== 'All') {
        const runtimes = agent.supportedRuntimes || [agent.runtime]
        if (!runtimes.includes(selectedRuntime)) {
          return false
        }
      }

      if (selectedPricing !== 'All' && agent.pricing !== selectedPricing) {
        return false
      }

      if (mcpOnly && !agent.isMcpReady) {
        return false
      }

      return true
    })

    // Preserve Fuse relevance order when a search query is active and default sort is selected
    if (q && selectedSort === 'trending') {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      if (selectedSort === 'top_rated') {
        return b.upvotesCount - a.upvotesCount
      }
      if (selectedSort === 'stars') {
        return b.githubStars - a.githubStars
      }
      if (selectedSort === 'recently_added') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return b.trendingScore - a.trendingScore
    })
  }, [
    debouncedSearch,
    fuse,
    catalogAgents,
    selectedCategory,
    selectedRuntime,
    selectedPricing,
    mcpOnly,
    selectedSort,
  ])

  const openSourceCount = useMemo(
    () => catalogAgents.filter((a) => a.pricing !== 'Paid').length,
    [catalogAgents]
  )
  const mcpReadyCount = useMemo(
    () => catalogAgents.filter((a) => a.isMcpReady).length,
    [catalogAgents]
  )

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

  const handleGoHome = () => {
    setActiveNavTab('explore')
    handleResetFilters()
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        totalAgentsCount={catalogAgents.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onGoHome={handleGoHome}
      />

      {/* Main Views */}
      {activeNavTab === 'explore' ? (
        <>
          {/* Hero & Live Telemetry Metrics Section */}
          <HeroTelemetry
            verifiedCount={catalogAgents.length || 9}
            openSourceCount={openSourceCount || 8}
            mcpReadyCount={mcpReadyCount || 7}
            enableEasterEgg={SHOW_ARCADE}
          />

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
              totalCount={catalogAgents.length}
              filteredCount={filteredAgents.length}
              onResetFilters={handleResetFilters}
            />

            {/* Agent Cards Grid */}
            <section className="space-y-4">
              {isAgentsLoading && catalogAgents.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-52 rounded-xl border border-slate-800/80 bg-slate-900/40 animate-pulse p-4"
                    />
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base text-white">
                    No autonomous agents match your filters
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Try loosening your runtime, pricing, or MCP protocol filters to discover more
                    agents.
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
                      isStaged={stagedSlugs.includes(agent.slug)}
                      onQuickView={(a) => setPreviewSlug(a.slug)}
                      onToggleUpvote={handleToggleUpvote}
                      onToggleCompare={handleToggleCompare}
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

      {/* Floating Comparison Dock */}
      <StagingDock />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-20 py-10 bg-slate-950/60 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-slate-300">AgentHub v1.1</span>
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
              onClick={() => dispatch(setActiveView('submit'))}
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
        onClose={() => setPreviewSlug(null)}
        isUpvoted={selectedAgentForPreview ? !!upvotedIds[selectedAgentForPreview.id] : false}
        isStaged={
          selectedAgentForPreview ? stagedSlugs.includes(selectedAgentForPreview.slug) : false
        }
        onToggleUpvote={handleToggleUpvote}
        onToggleCompare={handleToggleCompare}
        onOpenFullProfile={(slug) => dispatch(openAgentProfile(slug))}
      />

      {/* Command Palette (Cmd+K) Modal */}
      <CommandMenuModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        agents={catalogAgents}
        onSelectAgent={(agent) => {
          setPreviewSlug(agent.slug)
          setIsSearchOpen(false)
        }}
        onOpenTetris={SHOW_ARCADE ? () => dispatch(openTetris()) : undefined}
        onOpenHardestGame={SHOW_ARCADE ? () => dispatch(openHardestGame()) : undefined}
        onOpenInvoker={SHOW_ARCADE ? () => dispatch(openInvoker()) : undefined}
        onOpenPudge={SHOW_ARCADE ? () => dispatch(openPudge()) : undefined}
      />

      {/* Submit Agent Intake Modal */}
      <SubmitAgentModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSuccess={(name) => {
          showToast(`Agent "${name}" submitted to moderation queue (12h SLA)!`)
        }}
      />
    </div>
  )
}
