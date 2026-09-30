import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import {
  useListCollectionsQuery,
  useCompareAgentsQuery,
} from '@/store/api/agentsApi'
import {
  setComparisonSlugs,
  removeAgentFromCompare,
} from '@/store/slices/compareSlice'
import { openAgentProfile, setActiveView } from '@/store/slices/appSlice'
import {
  ArrowLeftRight,
  BookOpen,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Star,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react'

export const ComparePage: React.FC = () => {
  const dispatch = useDispatch()
  const stagedSlugs = useSelector(
    (state: RootState) => state.compare.stagedAgentSlugs
  )

  const [copiedMarkdown, setCopiedMarkdown] = useState(false)

  // Fetch Curated Collections
  const { data: collections = [] } = useListCollectionsQuery()

  // Compare query runs if 2 or 3 slugs are staged
  const canCompare = stagedSlugs.length >= 2 && stagedSlugs.length <= 3
  const {
    data: matrixData,
    isLoading: isMatrixLoading,
    isError: isMatrixError,
  } = useCompareAgentsQuery(stagedSlugs, {
    skip: !canCompare,
  })

  const handleStageCollection = (agentSlugs: string[]) => {
    dispatch(setComparisonSlugs(agentSlugs))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExportMarkdown = () => {
    if (!matrixData || matrixData.agents.length === 0) return

    let md = `# Side-by-Side Agent Comparison (ADR)\n\n`
    md += `| Parameter | ${matrixData.agents.map((a) => a.title).join(' | ')} |\n`
    md += `|---|${matrixData.agents.map(() => '---').join('|')}|\n`
    md += `| **Category** | ${matrixData.agents.map((a) => a.category_title).join(' | ')} |\n`
    md += `| **Autonomy Level** | ${matrixData.agents.map((a) => a.autonomy_level.replace('_', ' ')).join(' | ')} |\n`
    md += `| **Vector Memory / RAG** | ${matrixData.agents.map((a) => (a.has_vector_rag ? `Yes (${a.memory_backend || 'Integrated'})` : 'No')).join(' | ')} |\n`
    md += `| **Multimodal Handling** | ${matrixData.agents.map((a) => a.multimodal_capabilities.join(', ') || 'Text only').join(' | ')} |\n`
    md += `| **Token Overhead Tier** | ${matrixData.agents.map((a) => a.token_overhead_tier).join(' | ')} |\n`
    md += `| **Maintenance Cadence** | ${matrixData.agents.map((a) => a.maintenance_cadence.replace('_', ' ')).join(' | ')} |\n`
    md += `| **MCP Compliant** | ${matrixData.agents.map((a) => (a.is_mcp_compliant ? 'Yes' : 'No')).join(' | ')} |\n`
    md += `| **Licensing** | ${matrixData.agents.map((a) => (a.is_open_source ? 'Open Source' : 'Commercial')).join(' | ')} |\n`

    navigator.clipboard.writeText(md)
    setCopiedMarkdown(true)
    setTimeout(() => setCopiedMarkdown(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-28">
      {/* Header */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Interactive Architectural Matrix</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Side-by-Side Agent Comparison
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Stage 2 or 3 autonomous agents to evaluate engineering parameters: degree of execution
          autonomy, vector memory integration, multimodal grounding, and operational token overhead.
        </p>
      </section>

      {/* Comparison Matrix Section */}
      <section className="space-y-6">
        {stagedSlugs.length < 2 && (
          <div className="p-8 sm:p-12 rounded-3xl bg-card border text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <ArrowLeftRight className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">
                Select at least 2 agents to initiate matrix comparison
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Browse the directory and click "+ Compare" on any card, or load one of our curated
                industry roundups below.
              </p>
            </div>
            <button
              onClick={() => dispatch(setActiveView('directory'))}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md"
            >
              Browse Directory
            </button>
          </div>
        )}

        {isMatrixLoading && (
          <div className="h-96 rounded-3xl bg-card border animate-pulse p-8" />
        )}

        {isMatrixError && (
          <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Could not load comparative data for staged agents.</span>
          </div>
        )}

        {matrixData && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Cross-Category Warning if relevant */}
            {matrixData.is_cross_category && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs sm:text-sm flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>
                  <strong>Note:</strong> You are comparing agents from differing functional domains.
                  Benchmarking parameters may reflect divergent architectural goals.
                </span>
              </div>
            )}

            {/* Matrix Action Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Comparing {matrixData.agents.length} Autonomous Systems
              </span>

              <button
                type="button"
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground border text-xs font-semibold hover:bg-secondary/80 transition-all"
              >
                {copiedMarkdown ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied ADR Table!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy as Markdown for ADR</span>
                  </>
                )}
              </button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-3xl border bg-card shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-4 sm:p-6 text-xs font-bold text-muted-foreground uppercase tracking-wider w-1/4">
                      Engineering Parameter
                    </th>
                    {matrixData.agents.map((agent) => (
                      <th
                        key={agent.id}
                        className="p-4 sm:p-6 text-foreground align-top border-l"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={agent.logo_url}
                              alt={agent.title}
                              className="w-10 h-10 rounded-xl object-contain bg-muted p-1 border shadow-xs"
                              onError={(e) => {
                                ;(e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                            <div>
                              <h4 className="font-bold text-base text-foreground">
                                {agent.title}
                              </h4>
                              <span className="text-xs text-muted-foreground font-mono">
                                {agent.category_title}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => dispatch(openAgentProfile(agent.slug))}
                              className="text-xs font-semibold text-primary hover:underline"
                            >
                              Audit Profile
                            </button>
                            <span className="text-muted-foreground">•</span>
                            <button
                              onClick={() => dispatch(removeAgentFromCompare(agent.slug))}
                              className="text-xs text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y text-xs sm:text-sm">
                  {/* Parameter 1: Execution Autonomy */}
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 sm:p-6 font-semibold text-foreground">
                      Degree of Autonomy
                    </td>
                    {matrixData.agents.map((a) => (
                      <td key={a.id} className="p-4 sm:p-6 border-l">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold text-xs capitalize">
                          <Sparkles className="w-3 h-3" />
                          {a.autonomy_level.replace('_', ' ')}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 2: Vector Memory / RAG */}
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 sm:p-6 font-semibold text-foreground">
                      Vector Memory / RAG
                    </td>
                    {matrixData.agents.map((a) => (
                      <td key={a.id} className="p-4 sm:p-6 border-l">
                        {a.has_vector_rag ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-xs">
                              <CheckCircle2 className="w-4 h-4" /> Integrated
                            </span>
                            <p className="text-xs text-muted-foreground font-mono">
                              {a.memory_backend || 'Persistent Vector Store'}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                            <XCircle className="w-4 h-4" /> Ephemeral Context Only
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 3: Multimodal Asset Handling */}
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 sm:p-6 font-semibold text-foreground">
                      Multimodal Asset Handling
                    </td>
                    {matrixData.agents.map((a) => (
                      <td key={a.id} className="p-4 sm:p-6 border-l">
                        <div className="flex flex-wrap gap-1.5">
                          {a.multimodal_capabilities.length > 0 ? (
                            a.multimodal_capabilities.map((m) => (
                              <span
                                key={m}
                                className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-[11px] font-medium"
                              >
                                {m.replace('_', ' ')}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">Text Only</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 4: Estimated Token Overhead */}
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 sm:p-6 font-semibold text-foreground">
                      Token Consumption Overhead
                    </td>
                    {matrixData.agents.map((a) => (
                      <td key={a.id} className="p-4 sm:p-6 border-l">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                            a.token_overhead_tier === 'low'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : a.token_overhead_tier === 'moderate'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {a.token_overhead_tier} Overhead
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 5: Maintenance Cadence */}
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 sm:p-6 font-semibold text-foreground">
                      Community Cadence
                    </td>
                    {matrixData.agents.map((a) => (
                      <td key={a.id} className="p-4 sm:p-6 border-l font-mono text-xs text-muted-foreground">
                        {a.maintenance_cadence.replace('_', ' ')}
                      </td>
                    ))}
                  </tr>

                  {/* MCP Support */}
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 sm:p-6 font-semibold text-foreground">
                      Model Context Protocol (MCP)
                    </td>
                    {matrixData.agents.map((a) => (
                      <td key={a.id} className="p-4 sm:p-6 border-l">
                        {a.is_mcp_compliant ? (
                          <span className="text-emerald-500 font-semibold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Native Server/Client
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Non-Native</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Licensing & Stars */}
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 sm:p-6 font-semibold text-foreground">
                      Licensing & Popularity
                    </td>
                    {matrixData.agents.map((a) => (
                      <td key={a.id} className="p-4 sm:p-6 border-l">
                        <div className="space-y-1">
                          <span className="font-semibold text-xs text-foreground">
                            {a.is_open_source ? 'Open-Source' : 'Proprietary'}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                            <span>{(a.github_stars / 1000).toFixed(1)}k stars</span>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Curated Collections Section */}
      <section className="space-y-6 pt-6 border-t">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Curated Editorial Roundups</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">
            Explore Curated Agent Collections
          </h2>
          <p className="text-sm text-muted-foreground">
            Pre-assembled thematic evaluations ready to stage into the comparison matrix with a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((col) => {
            const memberSlugs = col.featured_agents.map((a) => a.slug)
            return (
              <div
                key={col.id}
                className="rounded-3xl bg-card border p-6 sm:p-8 space-y-4 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-xs font-mono font-semibold uppercase text-primary">
                    Editorial Roundup #{col.display_order}
                  </span>
                  <h3 className="text-xl font-bold text-foreground">
                    {col.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {col.editorial_summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {col.featured_agents.map((agent) => (
                      <span
                        key={agent.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary text-xs font-semibold text-foreground border"
                      >
                        <img
                          src={agent.logo_url}
                          alt={agent.title}
                          className="w-4 h-4 rounded-xs object-contain"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                        <span>{agent.title}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleStageCollection(memberSlugs)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Compare All in Roundup</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

