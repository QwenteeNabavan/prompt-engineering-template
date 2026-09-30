import React, { useState } from 'react'
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Share2,
  ShieldCheck,
  Star,
  Cpu,
  Terminal,
  Activity,
  Brain,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AgentRegistryItem } from '@/types/agent-registry'

interface AgentQuickViewModalProps {
  agent: AgentRegistryItem | null
  isOpen: boolean
  onClose: () => void
  onToggleUpvote: (id: string) => void
  isUpvoted?: boolean
}

export const AgentQuickViewModal: React.FC<AgentQuickViewModalProps> = ({
  agent,
  isOpen,
  onClose,
  onToggleUpvote,
  isUpvoted = false,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)

  if (!isOpen || !agent) return null

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(agent.quickstartSnippet)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/?agent=${agent.slug}`
    navigator.clipboard.writeText(url)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#090d16] p-6 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header: Icon, Name, Category, Upvote, Action links */}
        <div className="flex items-start justify-between gap-4 pr-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-inner">
              <img
                src={agent.logoUrl}
                alt={`${agent.name} logo`}
                className="h-full w-full object-contain rounded-md"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {agent.name}
                </h2>
                {agent.verified && (
                  <span title="Verified Autonomous Agent" className="text-cyan-400">
                    <ShieldCheck className="h-5 w-5 fill-cyan-400/20" />
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {agent.category} &bull; {agent.framework}
              </p>
            </div>
          </div>

          {/* Upvote in modal */}
          <button
            type="button"
            onClick={() => onToggleUpvote(agent.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
              isUpvoted
                ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5 text-cyan-400" />
            <span>{agent.upvotesCount + (isUpvoted ? 1 : 0)}</span>
          </button>
        </div>

        {/* Tagline & Badges */}
        <div className="space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            {agent.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="slate" className="font-mono text-xs">
              LLM: {agent.primaryLlm}
            </Badge>
            <Badge variant="slate" className="font-mono text-xs">
              Target: {agent.runtime}
            </Badge>
            <Badge variant="cyan" className="font-mono text-xs">
              Pricing: {agent.pricing}
            </Badge>
            <Badge variant="slate" className="font-mono text-xs">
              License: {agent.license}
            </Badge>
            {agent.isMcpReady && (
              <Badge variant="violet" className="font-mono text-xs flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                <span>MCP Protocol Compliant</span>
              </Badge>
            )}
            <Badge variant="amber" className="font-mono text-xs flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400" />
              <span>{(agent.githubStars / 1000).toFixed(1)}k GitHub Stars</span>
            </Badge>
          </div>
        </div>

        {/* 1. Quickstart Terminal Snippet (1-Click Copy) */}
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Terminal className="h-3.5 w-3.5" /> Quickstart Command
            </span>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              {copiedSnippet ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-black/60 p-2.5 font-mono text-xs text-slate-200 selection:bg-cyan-500/30">
            <code>{agent.quickstartSnippet}</code>
          </pre>
        </div>

        {/* 2. Architecture Specifications */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            Autonomous Architecture Audit
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Planning Loop */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Brain className="h-3.5 w-3.5 text-cyan-400" />
                <span>Planning Loop</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {agent.architecture.planningLoop}
              </p>
            </div>

            {/* Memory Type */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Memory Type</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {agent.architecture.memoryType}
              </p>
            </div>

            {/* Tool Execution */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Wrench className="h-3.5 w-3.5 text-violet-400" />
                <span>Tool Execution</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {agent.architecture.toolExecution}
              </p>
            </div>
          </div>
        </div>

        {/* Strengths & Edge Cases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 space-y-1.5">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Validated Strengths
            </span>
            <ul className="space-y-1 text-slate-400">
              {agent.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 space-y-1.5">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Operational Edge Cases
            </span>
            <ul className="space-y-1 text-slate-400">
              {agent.knownEdgeCases.map((ec, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span>{ec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Direct External Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Agent</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {agent.externalLinks.repoUrl && (
              <a
                href={agent.externalLinks.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Repo</span>
              </a>
            )}

            <a
              href={agent.externalLinks.launchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <span>Launch App</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
