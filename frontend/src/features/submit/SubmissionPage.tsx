import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  useListCategoriesQuery,
  useSubmitAgentMutation,
} from '@/store/api/agentsApi'
import { setActiveView } from '@/store/slices/appSlice'
import type { SubmissionResponse } from '@/types/agent'
import {
  PlusCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Layers,
  Terminal,
} from 'lucide-react'

export const SubmissionPage: React.FC = () => {
  const dispatch = useDispatch()
  const { data: categories = [] } = useListCategoriesQuery()
  const [submitAgentMutation, { isLoading }] = useSubmitAgentMutation()

  // Form State
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [summary, setSummary] = useState('')
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [deploymentTargets, setDeploymentTargets] = useState<string[]>([])
  const [llmBackends, setLlmBackends] = useState<string[]>([])
  const [framework, setFramework] = useState('')
  const [isOpenSource, setIsOpenSource] = useState(true)
  const [isMcpCompliant, setIsMcpCompliant] = useState(false)
  const [hardwareRequirements, setHardwareRequirements] = useState('')
  const [terminalSetupScript, setTerminalSetupScript] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')
  const [botChecked, setBotChecked] = useState(false)

  // Feedback State
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<SubmissionResponse | null>(null)

  const availableRuntimes = [
    { id: 'cloud_saas', label: 'Cloud SaaS (Web GUI)' },
    { id: 'local_cli', label: 'Local Terminal CLI' },
    { id: 'docker', label: 'Self-Hosted Docker' },
    { id: 'ide_extension', label: 'IDE Extension (VS Code / Cursor)' },
  ]

  const availableLlms = [
    'Claude 3.5 Sonnet',
    'GPT-4o',
    'DeepSeek-V3',
    'Ollama Llama 3',
    'Custom Fine-Tuned',
  ]

  const handleToggleRuntime = (runtimeId: string) => {
    setDeploymentTargets((prev) =>
      prev.includes(runtimeId)
        ? prev.filter((r) => r !== runtimeId)
        : [...prev, runtimeId]
    )
  }

  const handleToggleLlm = (llm: string) => {
    setLlmBackends((prev) =>
      prev.includes(llm) ? prev.filter((l) => l !== llm) : [...prev, llm]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!botChecked) {
      setErrorMsg('Please verify the background bot mitigation check.')
      return
    }

    if (!categoryId) {
      setErrorMsg('Please select a functional category.')
      return
    }

    if (summary.length > 120) {
      setErrorMsg('Summary exceeds the maximum allowed 120 characters.')
      return
    }

    try {
      const response = await submitAgentMutation({
        title,
        tagline,
        summary,
        description_markdown: descriptionMarkdown,
        website_url: websiteUrl,
        repository_url: repositoryUrl || undefined,
        category_id: categoryId,
        deployment_targets: deploymentTargets,
        llm_backends: llmBackends,
        framework: framework || undefined,
        is_open_source: isOpenSource,
        is_mcp_compliant: isMcpCompliant,
        hardware_requirements: hardwareRequirements || undefined,
        terminal_setup_script: terminalSetupScript || undefined,
        logo_url: logoUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(title),
        submitter_email: submitterEmail,
        bot_token: 'valid_human_token',
      }).unwrap()

      setSubmittedData(response)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      console.error('Submission failed:', err)
      setErrorMsg(
        err?.data?.detail || 'Submission validation failed. Please review your fields.'
      )
    }
  }

  // SLA Confirmation Screen
  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-3xl bg-card border border-emerald-500/30 p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
              Record Committed to Pending Queue
            </span>
            <h2 className="text-3xl font-black text-foreground">
              Submission Received!
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {submittedData.message}
            </p>
          </div>

          {/* SLA Card */}
          <div className="p-4 rounded-2xl bg-secondary/60 border space-y-3 text-left">
            <div className="flex items-center justify-between text-xs border-b pb-2">
              <span className="text-muted-foreground">Submission Reference:</span>
              <span className="font-mono font-semibold text-foreground">
                {submittedData.submission_id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-b pb-2">
              <span className="text-muted-foreground">Assigned URL Slug:</span>
              <span className="font-mono font-semibold text-foreground">
                /agents/{submittedData.slug}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-semibold text-primary">
                <Clock className="w-4 h-4" /> Review SLA:
              </span>
              <span className="font-bold text-foreground">
                Guaranteed within 12 Hours
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => dispatch(setActiveView('directory'))}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all"
            >
              Explore Directory
            </button>
            <button
              onClick={() => {
                setSubmittedData(null)
                setTitle('')
                setTagline('')
                setSummary('')
                setDescriptionMarkdown('')
                setWebsiteUrl('')
                setRepositoryUrl('')
                setSubmitterEmail('')
              }}
              className="px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all"
            >
              Submit Another Agent
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-28">
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

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Maintainer Intake Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Submit an Autonomous AI Agent
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Join the standardized directory. All submissions undergo technical audit against our
          standard 12-hour review SLA before public indexing.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Core Metadata */}
        <div className="rounded-3xl bg-card border p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b pb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            1. Core Identity & Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Agent Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. OpenDevin, Stagehand"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Domain Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">Select Domain...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Extended Tagline *
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Open-source platform for autonomous software engineering and bash execution"
              className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="text-foreground">Preview Summary (Capped at 120 chars) *</label>
              <span className={`${summary.length > 120 ? 'text-destructive font-bold' : 'text-muted-foreground font-mono'}`}>
                {summary.length}/120
              </span>
            </div>
            <textarea
              required
              rows={2}
              maxLength={120}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Concise overview snippet for directory card preview..."
              className="w-full px-3.5 py-2 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Production Website URL *
              </label>
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://myagent.dev"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Technical Telemetry */}
        <div className="rounded-3xl bg-card border p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b pb-3">
            <Layers className="w-5 h-5 text-primary" />
            2. Technical Telemetry & Runtime
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Supported Runtimes</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableRuntimes.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl border bg-background/50 hover:bg-secondary/40 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={deploymentTargets.includes(r.id)}
                    onChange={() => handleToggleRuntime(r.id)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Supported Foundation Models</label>
            <div className="flex flex-wrap gap-2">
              {availableLlms.map((llm) => (
                <label
                  key={llm}
                  className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    llmBackends.includes(llm)
                      ? 'bg-primary/10 text-primary border-primary font-semibold'
                      : 'bg-background hover:bg-secondary text-muted-foreground'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={llmBackends.includes(llm)}
                    onChange={() => handleToggleLlm(llm)}
                    className="hidden"
                  />
                  {llm}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Orchestration Framework
              </label>
              <input
                type="text"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                placeholder="e.g. LangGraph, CrewAI, AutoGen, Custom"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Minimum Hardware Specs
              </label>
              <input
                type="text"
                value={hardwareRequirements}
                onChange={(e) => setHardwareRequirements(e.target.value)}
                placeholder="e.g. 8GB RAM, Local GPU optional"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={isOpenSource}
                onChange={(e) => setIsOpenSource(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Fully Open-Source</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={isMcpCompliant}
                onChange={(e) => setIsMcpCompliant(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Model Context Protocol (MCP) Compliant</span>
            </label>
          </div>
        </div>

        {/* Step 3: Product Brief & Setup Script */}
        <div className="rounded-3xl bg-card border p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b pb-3">
            <Terminal className="w-5 h-5 text-primary" />
            3. Documentation Brief & Setup Script
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Markdown Product Brief & Autonomous Capabilities *
            </label>
            <textarea
              required
              rows={5}
              value={descriptionMarkdown}
              onChange={(e) => setDescriptionMarkdown(e.target.value)}
              placeholder="Outline autonomous end-to-end planning, tool invocations, and error handling..."
              className="w-full px-3.5 py-2.5 rounded-xl border bg-background font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Terminal Setup Sequence Script
            </label>
            <textarea
              rows={2}
              value={terminalSetupScript}
              onChange={(e) => setTerminalSetupScript(e.target.value)}
              placeholder="docker run -it ... or npm install ..."
              className="w-full px-3.5 py-2.5 rounded-xl border bg-background font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Square Brand Asset URL (Logo)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Maintainer Contact Email *
              </label>
              <input
                type="email"
                required
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
                placeholder="maintainer@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bot Defense Simulation & Submit */}
        <div className="p-6 rounded-3xl bg-secondary/40 border flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-3 cursor-pointer text-xs text-foreground">
            <input
              type="checkbox"
              required
              checked={botChecked}
              onChange={(e) => setBotChecked(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              I confirm this project features genuine autonomous capabilities and meets directory standards.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Submitting to Queue...' : 'Submit to Moderation Queue'}
          </button>
        </div>
      </form>
    </div>
  )
}

