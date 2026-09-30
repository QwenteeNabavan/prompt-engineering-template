import React, { useState } from 'react'
import {
  ShieldCheck,
  ThumbsUp,
  Star,
  Cpu,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AgentRegistryItem } from '@/types/agent-registry'

interface AgentCardProps {
  agent: AgentRegistryItem
  onQuickView: (agent: AgentRegistryItem) => void
  onToggleUpvote: (id: string) => void
  isUpvoted?: boolean
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onQuickView,
  onToggleUpvote,
  isUpvoted = false,
}) => {
  const [imgError, setImgError] = useState(false)
  const [upvoteAnimating, setUpvoteAnimating] = useState(false)

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUpvoteAnimating(true)
    onToggleUpvote(agent.id)
    setTimeout(() => setUpvoteAnimating(false), 300)
  }

  // Format star counts nicely (e.g. 34.8k)
  const formatStars = (stars: number) => {
    if (stars >= 1000) {
      return `${(stars / 1000).toFixed(1)}k`
    }
    return stars.toString()
  }

  return (
    <div
      onClick={() => onQuickView(agent)}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-200 hover:border-cyan-500/40 hover:bg-slate-900/90 hover:shadow-[0_4px_24px_rgba(6,182,212,0.12)] cursor-pointer backdrop-blur-xs overflow-hidden"
    >
      {/* Top subtle highlight line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent transition-opacity duration-300 group-hover:via-cyan-400/50" />

      {/* Card Content Top Section */}
      <div className="space-y-3">
        {/* Top Row: 48x48 Icon, Name, Verified Badge, Upvote Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* 48x48 Rounded App Icon */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 p-1.5 shadow-inner transition-transform group-hover:scale-105">
              {!imgError ? (
                <img
                  src={agent.logoUrl}
                  alt={`${agent.name} logo`}
                  className="h-full w-full object-contain rounded-lg"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 font-bold font-mono text-sm">
                  {agent.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title & Verified Checkmark */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                  {agent.name}
                </h3>
                {agent.verified && (
                  <span
                    title="Verified Autonomous Agent"
                    className="flex shrink-0 text-cyan-400"
                  >
                    <ShieldCheck className="h-4 w-4 fill-cyan-400/20" />
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400 truncate block">
                {agent.category}
              </span>
            </div>
          </div>

          {/* Upvote Button with optimistic animation */}
          <button
            type="button"
            onClick={handleUpvoteClick}
            className={`group/vote flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-medium transition-all cursor-pointer ${
              isUpvoted
                ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
            } ${upvoteAnimating ? 'scale-115' : 'scale-100'}`}
            title="Upvote this agent"
          >
            <ThumbsUp
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isUpvoted ? 'fill-cyan-400 text-cyan-400' : 'group-hover/vote:scale-110'
              }`}
            />
            <span>{agent.upvotesCount + (isUpvoted ? 1 : 0)}</span>
          </button>
        </div>

        {/* Middle Row: 2-Line Concise Tagline */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {agent.tagline}
        </p>

        {/* Telemetry & Specs Tags (Monospace) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Primary LLM Badge */}
          <Badge
            variant="slate"
            className="font-mono text-[10px] text-slate-300 border-slate-800 bg-slate-950 px-2 py-0.5"
          >
            {agent.primaryLlm}
          </Badge>

          {/* Runtime Tag */}
          <Badge
            variant="slate"
            className="font-mono text-[10px] text-slate-300 border-slate-800 bg-slate-950 px-2 py-0.5"
          >
            {agent.runtime}
          </Badge>

          {/* License / Pricing Pill */}
          <Badge
            variant={agent.pricing === '100% Free' ? 'emerald' : 'cyan'}
            className="font-mono text-[10px] px-2 py-0.5"
          >
            {agent.pricing === '100% Free' ? 'Free OSS' : agent.pricing}
          </Badge>

          {/* MCP Support Badge */}
          {agent.isMcpReady && (
            <Badge
              variant="violet"
              className="font-mono text-[10px] px-2 py-0.5 flex items-center gap-1"
            >
              <Cpu className="h-2.5 w-2.5" />
              <span>MCP</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Bottom Row: Stars, Framework Label & Quick View Trigger */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-xs">
        {/* Left: GitHub Stars & Framework */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px] text-amber-400/90 font-medium">
            <Star className="h-3 w-3 fill-amber-400/40 text-amber-400" />
            <span>{formatStars(agent.githubStars)}</span>
          </span>

          <span className="font-mono text-[11px] text-slate-500 truncate max-w-[110px]" title={agent.framework}>
            {agent.framework}
          </span>
        </div>

        {/* Right: Quick View Trigger */}
        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
          <span>Quick View</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  )
}
