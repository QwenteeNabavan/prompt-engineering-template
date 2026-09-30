import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Fuse from 'fuse.js'
import type { RootState } from '@/store/store'
import {
  useListCategoriesQuery,
  useListAgentsQuery,
  useToggleUpvoteMutation,
} from '@/store/api/agentsApi'
import {
  openAgentProfile,
  setSearchQuery,
  setSelectedCategory,
  setSelectedRuntime,
  setSelectedMonetization,
  setSortBy,
} from '@/store/slices/appSlice'
import { addAgentToCompare, removeAgentFromCompare } from '@/store/slices/compareSlice'
import type { AgentListItem } from '@/types/agent'
import {
  Search,
  Star,
  ThumbsUp,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Check,
  Plus,
  ArrowRight,
  Code2,
  Terminal,
  Filter,
} from 'lucide-react'

export const DirectoryPage: React.FC = () => {
  const dispatch = useDispatch()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter state from Redux (enabling bidirectional URL synchronization)
  const searchQuery = useSelector((state: RootState) => state.app.searchQuery)
  const selectedCategory = useSelector((state: RootState) => state.app.selectedCategory)
  const selectedRuntime = useSelector((state: RootState) => state.app.selectedRuntime)
  const selectedMonetization = useSelector((state: RootState) => state.app.selectedMonetization)
  const sortBy = useSelector((state: RootState) => state.app.sortBy)

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  // Staged agents for comparison
  const stagedSlugs = useSelector(
    (state: RootState) => state.compare.stagedAgentSlugs
  )

  // Local upvote persistence for active UI toggling
  const [localUpvotedIds, setLocalUpvotedIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('agenthub_upvoted_ids')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Queries & Mutations
  const { data: categories = [] } = useListCategoriesQuery()
  const { data: agents = [], isLoading, isError } = useListAgentsQuery({
    category: selectedCategory,
    runtime: selectedRuntime,
    monetization: selectedMonetization,
    sort: sortBy,
  })
  const [toggleUpvoteMutation] = useToggleUpvoteMutation()

  // 250ms Debounce on Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 250)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fuse.js client-side fuzzy search configuration
  const fuse = useMemo(() => {
    return new Fuse(agents, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'tagline', weight: 0.25 },
        { name: 'framework', weight: 0.15 },
        { name: 'summary', weight: 0.1 },
        { name: 'llm_backends', weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    })
  }, [agents])

  // Compute displayed agents via fuzzy search or unfiltered catalog
  const displayedAgents = useMemo(() => {
    const trimmed = debouncedSearch.trim()
    if (!trimmed) return agents
    return fuse.search(trimmed).map((result) => result.item)
  }, [agents, debouncedSearch, fuse])

  // Global Hotkey Listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle Upvote
  const handleUpvote = async (agent: AgentListItem, e: React.MouseEvent) => {
    e.stopPropagation()
    const currentlyUpvoted = !!localUpvotedIds[agent.id]
    const updated = { ...localUpvotedIds, [agent.id]: !currentlyUpvoted }
    setLocalUpvotedIds(updated)
    try {
      localStorage.setItem('agenthub_upvoted_ids', JSON.stringify(updated))
      await toggleUpvoteMutation({
        agentId: agent.id,
        fingerprint: 'client-fingerprint-uuid',
      }).unwrap()
    } catch (err) {
      // Rollback on network failure
      setLocalUpvotedIds(localUpvotedIds)
      console.error('Failed to update upvote:', err)
    }
  }

  // Handle Compare Staging Toggle
  const handleToggleCompare = (agent: AgentListItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (stagedSlugs.includes(agent.slug)) {
      dispatch(removeAgentFromCompare(agent.slug))
    } else {
      if (stagedSlugs.length >= 3) {
        alert('Maximum 3 agents can be compared simultaneously.')
        return
      }
      dispatch(addAgentToCompare(agent.slug))
    }
  }

  // Easter Egg: Launch Dota 2
  const handleLaunchDota = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = 'steam://rungameid/570'
    fetch('http://localhost:8001/api/easter-egg/launch-dota', {
      method: 'POST',
    }).catch(() => {})
  }

  // Aggregate stats
  const totalVerified = agents.length
  const totalStars = agents.reduce((acc, a) => acc + a.github_stars, 0)
  const mcpCompliantCount = agents.filter((a) => a.is_mcp_compliant).length

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/10 via-background to-background p-6 sm:p-12 border border-border/50 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            The Verified Directory for{' '}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Autonomous AI Agents
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Eliminating ecosystem fragmentation.{' '}
            <button
              type="button"
              onClick={handleLaunchDota}
              className="text-inherit font-inherit p-0 m-0 bg-transparent border-0 cursor-pointer hover:text-primary hover:underline underline-offset-4 transition-colors select-none focus:outline-none"
              title="Discover (Launch Dota 2)"
              aria-label="Discover (Easter Egg: Launch Dota 2)"
            >
              Discover
            </button>{' '}
            agents featuring deliberate planning, autonomous tool calling, long-term memory, and self-healing execution loops.
          </p>

          {/* Live Metrics Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-card border shadow-2xs">
              <span className="text-xs text-muted-foreground">Verified Solutions</span>
              <div className="text-2xl font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                {totalVerified} Active
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-card border shadow-2xs">
              <span className="text-xs text-muted-foreground">Community Stars</span>
              <div className="text-2xl font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <Star className="w-5 h-5 text-amber-500" />
                {(totalStars / 1000).toFixed(1)}k
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-card border shadow-2xs">
              <span className="text-xs text-muted-foreground">MCP Compliance</span>
              <div className="text-2xl font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-5 h-5 text-primary" />
                {mcpCompliantCount} Native
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-card border shadow-2xs">
              <span className="text-xs text-muted-foreground">Ranking Decay</span>
              <div className="text-2xl font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <Layers className="w-5 h-5 text-violet-500" />
                7d Dynamic
              </div>
            </div>
          </div>
        </div>

        {/* Centralized Search Bar */}
        <div className="mt-8 relative max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search by agent name, framework, LLM, or tags... (Press Ctrl+K)"
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-input bg-card/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm sm:text-base backdrop-blur-xs"
            />
            <div className="absolute right-3.5 flex items-center gap-1 text-xs text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-lg border font-mono">
              <kbd className="font-semibold">⌘</kbd>
              <kbd className="font-semibold">K</kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Facet Filter Control Panel */}
      <section className="space-y-4">
        {/* Category Selector Block */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => dispatch(setSelectedCategory('all'))}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => dispatch(setSelectedCategory(cat.slug))}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Secondary Facets: Runtime, Licensing, Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Filter className="w-4 h-4" />
              <span>Filters:</span>
            </div>

            {/* Runtime Filter */}
            <select
              value={selectedRuntime}
              onChange={(e) => dispatch(setSelectedRuntime(e.target.value))}
              className="bg-secondary/80 border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Any Runtime</option>
              <option value="cloud_saas">Cloud SaaS (Web GUI)</option>
              <option value="local_cli">Local Terminal CLI</option>
              <option value="docker">Self-Hosted Docker</option>
              <option value="ide_extension">IDE Extension</option>
            </select>

            {/* Monetization Filter */}
            <select
              value={selectedMonetization}
              onChange={(e) => dispatch(setSelectedMonetization(e.target.value))}
              className="bg-secondary/80 border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Any Licensing</option>
              <option value="open_source">Fully Open-Source</option>
              <option value="commercial">Commercial / Proprietary</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
              className="bg-secondary/80 border rounded-lg px-2.5 py-1.5 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="trending">🔥 Trending (Time-Decay)</option>
              <option value="top">👍 Most Upvotes</option>
              <option value="stars">⭐ GitHub Stars</option>
              <option value="newest">✨ Newest Release</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Agent Cards Grid */}
      <section className="space-y-4">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-card/50 border animate-pulse p-6 space-y-4"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-8 text-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            Failed to connect to AgentHub API. Please check your backend connection.
          </div>
        )}

        {debouncedSearch.trim() && displayedAgents.length > 0 && (
          <div className="text-xs font-semibold text-muted-foreground px-1">
            Found {displayedAgents.length} verified {displayedAgents.length === 1 ? 'agent' : 'agents'} matching &ldquo;{debouncedSearch}&rdquo;
          </div>
        )}

        {!isLoading && displayedAgents.length === 0 && (
          <div className="p-16 text-center rounded-3xl bg-card border space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary mx-auto flex items-center justify-center text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">No agents match your criteria</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Try adjusting your search terms or clearing runtime and licensing filters.
            </p>
            <button
              onClick={() => {
                dispatch(setSearchQuery(''))
                dispatch(setSelectedCategory('all'))
                dispatch(setSelectedRuntime('all'))
                dispatch(setSelectedMonetization('all'))
                dispatch(setSortBy('trending'))
              }}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80"
            >
              Reset All Filters
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAgents.map((agent) => {
            const isUpvoted = !!localUpvotedIds[agent.id]
            const isStaged = stagedSlugs.includes(agent.slug)

            return (
              <div
                key={agent.id}
                onClick={() => dispatch(openAgentProfile(agent.slug))}
                className="group relative flex flex-col justify-between rounded-2xl bg-card border border-border/60 hover:border-primary/50 p-6 shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Card Top: Brand Icon, Title, Verified Badge, Upvote */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={agent.logo_url}
                        alt={`${agent.title} logo`}
                        className="w-12 h-12 rounded-xl object-contain bg-muted p-1 border shadow-xs"
                        onError={(e) => {
                          // Fallback to bot placeholder
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {agent.title}
                          </h3>
                          <span
                            title="Verified Autonomous Agent"
                            className="text-emerald-500"
                          >
                            <ShieldCheck className="w-4 h-4 fill-emerald-500/20" />
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {agent.framework || 'Autonomous Core'}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Upvote Button */}
                    <button
                      type="button"
                      onClick={(e) => handleUpvote(agent, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isUpvoted
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border-border'
                      }`}
                      aria-label="Upvote this agent"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
                      <span>{agent.upvotes_count + (isUpvoted ? 1 : 0)}</span>
                    </button>
                  </div>

                  {/* Summary Text (Capped at 120 chars) */}
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {agent.summary}
                  </p>

                  {/* Technology Chips & MCP Badge */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {agent.is_mcp_compliant && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-500 border border-violet-500/20 text-[11px] font-semibold">
                        <Cpu className="w-3 h-3" /> MCP Ready
                      </span>
                    )}

                    {agent.is_open_source ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-semibold">
                        <Code2 className="w-3 h-3" /> Open Source
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 text-[11px] font-semibold">
                        Commercial
                      </span>
                    )}

                    {agent.deployment_targets.map((target) => (
                      <span
                        key={target}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-medium"
                      >
                        <Terminal className="w-2.5 h-2.5" />
                        {target.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: GitHub Stars, Compare Button, Audit Action */}
                <div className="pt-5 mt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {agent.github_stars > 0 && (
                      <span className="flex items-center gap-1 font-mono font-medium">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                        {(agent.github_stars / 1000).toFixed(1)}k
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Compare Staging Toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompare(agent, e)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                        isStaged
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-secondary/50 text-muted-foreground hover:text-foreground border-border'
                      }`}
                    >
                      {isStaged ? (
                        <>
                          <Check className="w-3 h-3 text-primary" /> Staged
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" /> Compare
                        </>
                      )}
                    </button>

                    <span className="inline-flex items-center gap-1 text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                      Audit <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

