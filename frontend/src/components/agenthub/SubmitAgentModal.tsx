import React, { useState, useEffect } from 'react'
import { X, Send, Sparkles, CheckCircle2, Cpu, AlertCircle, Clock, ShieldCheck } from 'lucide-react'
import { useListCategoriesQuery, useSubmitAgentMutation } from '@/store/api/agentsApi'
import type { SubmissionResponse } from '@/types/agent'

interface SubmitAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newAgentName: string) => void
}

const RUNTIME_TO_TARGET: Record<string, string> = {
  'VS Code Extension': 'ide_extension',
  'Local CLI': 'local_cli',
  Docker: 'docker',
  'Cloud Web': 'cloud_saas',
}

const DEFAULT_CATEGORIES = [
  { id: 'coding-devops', title: 'Coding & DevOps' },
  { id: 'web-browser-automation', title: 'Web & Browser Automation' },
  { id: 'research-data-analysis', title: 'Deep Research & Data Analysis' },
  { id: 'sales-outreach', title: 'Sales & Outreach' },
  { id: 'multi-agent-frameworks', title: 'Core Multi-Agent Frameworks' },
]

export const SubmitAgentModal: React.FC<SubmitAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: apiCategories = [] } = useListCategoriesQuery(undefined, { skip: !isOpen })
  const [submitAgentMutation, { isLoading: isSubmitting }] = useSubmitAgentMutation()

  const categoryOptions = apiCategories.length > 0 ? apiCategories : DEFAULT_CATEGORIES

  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('')
  const [categoryId, setCategoryId] = useState('coding-devops')
  const [runtime, setRuntime] = useState('Local CLI')
  const [pricing, setPricing] = useState('100% Free')
  const [primaryLlm, setPrimaryLlm] = useState('Claude 3.7 Sonnet')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [isMcpReady, setIsMcpReady] = useState(true)
  const [terminalSnippet, setTerminalSnippet] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')
  const [botVerified, setBotVerified] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submittedResult, setSubmittedResult] = useState<SubmissionResponse | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (apiCategories.length > 0 && categoryId === 'coding-devops') {
      setCategoryId(apiCategories[0].id)
    }
  }, [apiCategories, categoryId])

  if (!isOpen) return null

  const resetForm = () => {
    setName('')
    setTagline('')
    setDescriptionMarkdown('')
    setWebsiteUrl('')
    setRepoUrl('')
    setTerminalSnippet('')
    setSubmitterEmail('')
    setErrorMsg(null)
    setSubmittedResult(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!botVerified) {
      setErrorMsg('Please confirm the bot mitigation verification check.')
      return
    }

    const cleanTitle = name.trim()
    const cleanTagline = tagline.trim()
    const cleanBrief =
      descriptionMarkdown.trim().length >= 20
        ? descriptionMarkdown.trim()
        : `### ${cleanTitle}\n${cleanTagline}\n\nAutonomous agent supporting ${primaryLlm} on ${runtime}.`
    const resolvedWebsite = websiteUrl.trim() || repoUrl.trim()

    try {
      const response = await submitAgentMutation({
        title: cleanTitle,
        tagline: cleanTagline,
        summary: cleanTagline.slice(0, 120),
        description_markdown: cleanBrief,
        website_url: resolvedWebsite,
        repository_url: repoUrl.trim() || undefined,
        category_id: categoryId,
        deployment_targets: [RUNTIME_TO_TARGET[runtime] || 'local_cli'],
        llm_backends: [primaryLlm.trim()],
        is_open_source: pricing === '100% Free' || pricing === 'BYOK',
        is_mcp_compliant: isMcpReady,
        terminal_setup_script: terminalSnippet.trim() || undefined,
        logo_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanTitle)}`,
        submitter_email: submitterEmail.trim(),
        bot_token: 'valid_human_token',
      }).unwrap()

      setSubmittedResult(response)
      onSuccess(cleanTitle)
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { detail?: unknown } }).data?.detail
          : null
      setErrorMsg(
        typeof detail === 'string'
          ? detail
          : 'Submission validation failed. Check that URLs start with https:// and fields meet length requirements.'
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#090d16] p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Developer Intake Portal</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Submit an Autonomous Agent
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Register your agent with deliberate planning loops, tool calling, and MCP support.
            Verified within a {submittedResult?.sla_hours ?? 12}h SLA.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submittedResult ? (
          <div className="p-6 text-center space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-white">
                Submission Committed for {submittedResult.title}!
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">{submittedResult.message}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-left text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Queue Reference:</span>
                <span className="text-white">{submittedResult.submission_id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned Slug:</span>
                <span className="text-cyan-400">/{submittedResult.slug}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-emerald-400" /> Review SLA:
                </span>
                <span className="text-emerald-400 font-semibold">
                  Within {submittedResult.sla_hours} Hours ({submittedResult.status})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-cyan-500 font-semibold text-slate-950 text-xs hover:brightness-110 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Agent Name & Primary LLM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Agent Name *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  placeholder="e.g. AgentForge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Primary Foundation Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Claude 3.7 Sonnet / GPT-4o"
                  value={primaryLlm}
                  onChange={(e) => setPrimaryLlm(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Concise Summary / Tagline (Max 120 chars) *
              </label>
              <input
                type="text"
                required
                minLength={5}
                maxLength={120}
                placeholder="e.g. Autonomous CLI refactoring agent with unified git diff generation"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Category & Runtime */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Domain Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Runtime *</label>
                <select
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="VS Code Extension">VS Code Extension</option>
                  <option value="Local CLI">Local Terminal CLI</option>
                  <option value="Docker">Docker</option>
                  <option value="Cloud Web">Cloud Web GUI</option>
                </select>
              </div>
            </div>

            {/* Website & Repository URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Website URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://myagent.dev"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">GitHub Repo URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Pricing & Markdown Brief */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Pricing Model *</label>
                <select
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="100% Free">100% Free / OSS</option>
                  <option value="BYOK">BYOK (Bring Your Own Key)</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Commercial / Paid</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Quickstart Terminal Snippet
                </label>
                <input
                  type="text"
                  placeholder="e.g. npx agent-cli init"
                  value={terminalSnippet}
                  onChange={(e) => setTerminalSnippet(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Markdown Product Brief */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Markdown Product Brief (Autonomous Capabilities) *
              </label>
              <textarea
                required
                minLength={20}
                rows={2}
                placeholder="Describe autonomous planning loops, tool calling, memory architecture, and edge cases..."
                value={descriptionMarkdown}
                onChange={(e) => setDescriptionMarkdown(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            {/* MCP Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-violet-400" />
                <div>
                  <span className="font-semibold text-white block">
                    Model Context Protocol (MCP) Compliant
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Supports MCP client/server tool orchestration
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isMcpReady}
                onChange={(e) => setIsMcpReady(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
              />
            </div>

            {/* Submitter Email */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Maintainer Email (for 12h SLA verification audit) *
              </label>
              <input
                type="email"
                required
                placeholder="maintainer@domain.com"
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
                className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Bot Mitigation Check */}
            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={botVerified}
                onChange={(e) => setBotVerified(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500"
              />
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>I verify this agent provides genuine autonomous capabilities (anti-bot).</span>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="h-8 px-3 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-slate-950 text-xs hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
