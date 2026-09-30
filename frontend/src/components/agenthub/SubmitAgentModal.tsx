import React, { useState } from 'react'
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Cpu,
} from 'lucide-react'

interface SubmitAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newAgentName: string) => void
}

export const SubmitAgentModal: React.FC<SubmitAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [category, setCategory] = useState('Coding & DevOps')
  const [runtime, setRuntime] = useState('Local CLI')
  const [pricing, setPricing] = useState('100% Free')
  const [primaryLlm, setPrimaryLlm] = useState('Claude 3.7 Sonnet')
  const [repoUrl, setRepoUrl] = useState('')
  const [isMcpReady, setIsMcpReady] = useState(true)
  const [terminalSnippet, setTerminalSnippet] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setTimeout(() => {
        onSuccess(name)
        onClose()
        setSubmitted(false)
      }, 1500)
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#090d16] p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
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
            Register your agent with deliberate planning loops, tool calling, and MCP support. Verified within a 12h SLA.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-base text-white">
              Submission Received for {name}!
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Our automated benchmark telemetry suite is auditing your repository. We will notify you via email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Agent Name & Primary LLM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Agent Name *
                </label>
                <input
                  type="text"
                  required
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
                Concise Tagline (Max 120 chars) *
              </label>
              <input
                type="text"
                required
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
                <label className="block font-semibold text-slate-300 mb-1">
                  Domain Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="Coding & DevOps">Coding & DevOps</option>
                  <option value="Browser Automation">Browser Automation</option>
                  <option value="Deep Research">Deep Research</option>
                  <option value="Multi-Agent Frameworks">Multi-Agent Frameworks</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Target Runtime *
                </label>
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

            {/* Pricing Model & Repository URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pricing Model *
                </label>
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
                  GitHub / Source URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/org/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
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
                    Supports Anthropic MCP client/server tool orchestration
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

            {/* Quickstart Command */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Quickstart Setup Terminal Snippet
              </label>
              <input
                type="text"
                placeholder="e.g. npm install -g agent-cli && agent init"
                value={terminalSnippet}
                onChange={(e) => setTerminalSnippet(e.target.value)}
                className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
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
