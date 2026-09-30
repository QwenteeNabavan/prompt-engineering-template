import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import {
  useGetAgentQuery,
  useGetAlternativesQuery,
  useToggleUpvoteMutation,
  useListReviewsQuery,
  useCreateReviewMutation,
} from '@/store/api/agentsApi'
import { setActiveView, openAgentProfile } from '@/store/slices/appSlice'
import {
  ArrowLeft,
  ExternalLink,
  Share2,
  ThumbsUp,
  ShieldCheck,
  Cpu,
  Terminal,
  Layers,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  Star,
  CheckCircle2,
  HardDrive,
  MessageSquare,
  User,
  Plus,
  Send,
} from 'lucide-react'

export const AgentProfilePage: React.FC = () => {
  const dispatch = useDispatch()
  const activeSlug = useSelector((state: RootState) => state.app.activeProfileSlug)

  const [copiedTerminal, setCopiedTerminal] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null)
  const [reviewAuthorName, setReviewAuthorName] = useState('')
  const [reviewAuthorRole, setReviewAuthorRole] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)

  const { data: agent, isLoading, isError } = useGetAgentQuery(activeSlug || '', {
    skip: !activeSlug,
  })

  const { data: alternatives = [] } = useGetAlternativesQuery(activeSlug || '', {
    skip: !activeSlug,
  })

  const { data: reviews = [], isLoading: isLoadingReviews } = useListReviewsQuery(
    activeSlug || '',
    { skip: !activeSlug }
  )

  const [createReviewMutation, { isLoading: isSubmittingReview }] =
    useCreateReviewMutation()

  const [toggleUpvoteMutation] = useToggleUpvoteMutation()

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 py-8 animate-pulse">
        <div className="h-8 w-40 bg-muted rounded-lg" />
        <div className="h-48 bg-card rounded-3xl border" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-card rounded-2xl border" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !agent) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Agent Profile Not Found</h2>
        <p className="text-muted-foreground">The requested AI agent could not be located in our directory.</p>
        <button
          onClick={() => dispatch(setActiveView('directory'))}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
        >
          Return to Directory
        </button>
      </div>
    )
  }

  const handleCopyTerminal = () => {
    if (agent.terminal_setup_script) {
      navigator.clipboard.writeText(agent.terminal_setup_script)
      setCopiedTerminal(true)
      setTimeout(() => setCopiedTerminal(false), 2000)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  const handleUpvote = async () => {
    try {
      await toggleUpvoteMutation({
        agentId: agent.id,
        fingerprint: 'client-fingerprint-uuid',
      }).unwrap()
    } catch (err) {
      console.error('Failed to upvote agent:', err)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-28 animate-in fade-in duration-200">
      {/* Back to Directory Button */}
      <div>
        <button
          type="button"
          onClick={() => dispatch(setActiveView('directory'))}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>
      </div>

      {/* Header Section */}
      <section className="rounded-3xl bg-card border border-border/70 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <img
              src={agent.logo_url}
              alt={`${agent.title} logo`}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain bg-muted p-2 border shadow-xs"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                  {agent.title}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Agent
                </span>
                {agent.is_mcp_compliant && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 text-xs font-semibold">
                    <Cpu className="w-3.5 h-3.5" /> Native MCP
                  </span>
                )}
              </div>

              <p className="text-base sm:text-lg text-muted-foreground font-medium">
                {agent.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium">
                {/* Outbound link appending platform tracking parameters */}
                <a
                  href={`${agent.website_url}?ref=agenthub`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-xs"
                >
                  <span>Visit Domain</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {agent.repository_url && (
                  <a
                    href={agent.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground border hover:bg-secondary/80 transition-all"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>Source Repo</span>
                    {agent.github_stars > 0 && (
                      <span className="ml-1 text-muted-foreground font-mono">
                        {(agent.github_stars / 1000).toFixed(1)}k
                      </span>
                    )}
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground border hover:bg-secondary/80 transition-all"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Upvote Module */}
          <div className="flex items-center gap-2 self-end sm:self-start">
            <button
              type="button"
              onClick={handleUpvote}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold text-sm transition-all"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{agent.upvotes_count} Upvotes</span>
            </button>
          </div>
        </div>
      </section>

      {/* Structured Technical Telemetry Grid */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Technical Telemetry & Infrastructure Audit
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-card border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Licensing Model
            </span>
            <div className="font-bold text-sm text-foreground">
              {agent.is_open_source ? 'Fully Open-Source' : 'Commercial / Proprietary'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Orchestrator Core
            </span>
            <div className="font-bold text-sm text-foreground">
              {agent.framework || 'Custom Runtime'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              MCP Compliance
            </span>
            <div className="font-bold text-sm text-foreground flex items-center gap-1">
              {agent.is_mcp_compliant ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Integrated
                </span>
              ) : (
                <span className="text-muted-foreground">Not Native</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Hardware Baseline
            </span>
            <div className="font-bold text-sm text-foreground flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{agent.hardware_requirements || 'Standard Cloud VM'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Category Domain
            </span>
            <div className="font-bold text-sm text-foreground truncate">
              {agent.category_title}
            </div>
          </div>
        </div>

        {/* Supported Foundation Models */}
        <div className="p-4 rounded-2xl bg-card border flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-2">
            Supported LLM Backends:
          </span>
          {agent.llm_backends.map((llm) => (
            <span
              key={llm}
              className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-mono font-medium border"
            >
              {llm}
            </span>
          ))}
        </div>
      </section>

      {/* 3 Substantive Documentation Sections */}
      <section className="space-y-6">
        {/* Section 1: Autonomous Capabilities */}
        <div className="rounded-3xl bg-card border p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            1. Autonomous End-to-End Capabilities
          </h3>
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {agent.description_markdown}
          </div>
        </div>

        {/* Section 2: Copyable Terminal Setup Sequence */}
        <div className="rounded-3xl bg-card border p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              2. Rapid Terminal Setup Sequence
            </h3>
            {agent.terminal_setup_script && (
              <button
                type="button"
                onClick={handleCopyTerminal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold border transition-all"
              >
                {copiedTerminal ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs sm:text-sm overflow-x-auto border border-zinc-800">
            <code>{agent.terminal_setup_script || '# No local terminal setup required (Cloud SaaS)'}</code>
          </div>
        </div>

        {/* Section 3: Architectural Strengths & Known Operational Edge Cases */}
        <div className="rounded-3xl bg-card border p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            3. Validated Strengths & Operational Edge Cases
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-3 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Architectural Strengths
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {agent.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Edge Cases */}
            <div className="space-y-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <h4 className="font-bold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Known Operational Edge Cases
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {agent.known_edge_cases.map((ec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{ec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contextual Alternative Suggestions */}
      {alternatives.length > 0 && (
        <section className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">
              Contextual Alternatives in {agent.category_title}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                onClick={() => dispatch(openAgentProfile(alt.slug))}
                className="p-4 rounded-2xl bg-card border hover:border-primary/50 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={alt.logo_url}
                    alt={alt.title}
                    className="w-8 h-8 rounded-lg object-contain bg-muted p-0.5 border"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {alt.title}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {alt.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-primary font-semibold pt-1">
                  <span>Audit Profile</span>
                  <span className="text-muted-foreground font-mono">
                    ★ {(alt.github_stars / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Community Review Feed & Benchmark Ratings */}
      <section className="space-y-6 pt-6 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Community Audits & Benchmark Reviews
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Production insights, hardware overhead reports, and runtime reliability scores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border text-xs font-semibold">
                <span className="text-amber-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-foreground">
                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                </span>
                <span className="text-muted-foreground">({reviews.length} {reviews.length === 1 ? 'audit' : 'audits'})</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowReviewForm(!showReviewForm)
                setReviewError(null)
                setReviewSuccess(null)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showReviewForm ? 'Close Form' : 'Write Review'}</span>
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {reviewSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{reviewSuccess}</span>
          </div>
        )}

        {reviewError && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{reviewError}</span>
          </div>
        )}

        {/* Review Submission Form */}
        {showReviewForm && (
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!agent) return
              setReviewError(null)
              setReviewSuccess(null)

              if (!reviewAuthorName.trim()) {
                setReviewError('Please provide your name or handle.')
                return
              }
              if (!reviewComment.trim() || reviewComment.trim().length < 10) {
                setReviewError('Review comment must be at least 10 characters.')
                return
              }

              try {
                await createReviewMutation({
                  agentId: agent.id,
                  slug: agent.slug,
                  body: {
                    author_name: reviewAuthorName.trim(),
                    author_role: reviewAuthorRole.trim() || 'AI Engineer',
                    rating: reviewRating,
                    comment: reviewComment.trim(),
                  },
                }).unwrap()

                setReviewSuccess('Your technical audit has been submitted successfully!')
                setReviewAuthorName('')
                setReviewAuthorRole('')
                setReviewComment('')
                setReviewRating(5)
                setShowReviewForm(false)
              } catch (err: unknown) {
                const errMsg =
                  err && typeof err === 'object' && 'data' in err
                    ? JSON.stringify((err as { data: { detail?: string } }).data.detail || (err as { data: unknown }).data)
                    : 'Failed to submit review. Please check connection.'
                setReviewError(errMsg)
              }
            }}
            className="p-5 rounded-2xl bg-card border space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-sm text-foreground">
                Submit Production Feedback for {agent.title}
              </h4>
              {/* Interactive Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeVal = reviewHoverRating !== null ? reviewHoverRating : reviewRating
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(null)}
                      className="p-0.5 focus:outline-none transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= activeVal
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Your Name / Handle *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={reviewAuthorName}
                  onChange={(e) => setReviewAuthorName(e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Professional Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staff AI Systems Architect"
                  value={reviewAuthorRole}
                  onChange={(e) => setReviewAuthorRole(e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Technical Commentary & Benchmark Observations *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share your practical experience: token cost, model compatibility, latency, edge-case failure modes, or integration complexity (min 10 characters)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReview ? 'Submitting...' : 'Post Audit'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Reviews List */}
        {isLoadingReviews && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-card border animate-pulse h-24" />
            ))}
          </div>
        )}

        {!isLoadingReviews && reviews.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-card border space-y-2">
            <p className="text-sm font-semibold text-foreground">
              No technical reviews recorded yet for {agent.title}.
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Have you run this agent locally or integrated its API? Share your latency, token overhead, and resilience observations.
            </p>
          </div>
        )}

        {!isLoadingReviews && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-card border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {r.author_name ? r.author_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                        <span>{r.author_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(r.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {r.author_role || 'AI Practitioner'}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

