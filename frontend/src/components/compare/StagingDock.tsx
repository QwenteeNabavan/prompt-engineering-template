import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { removeAgentFromCompare, clearComparison } from '@/store/slices/compareSlice'
import { setActiveView } from '@/store/slices/appSlice'
import { ArrowLeftRight, X, Sparkles } from 'lucide-react'

export const StagingDock: React.FC = () => {
  const dispatch = useDispatch()
  const stagedSlugs = useSelector(
    (state: RootState) => state.compare.stagedAgentSlugs
  )
  const activeView = useSelector((state: RootState) => state.app.activeView)

  if (stagedSlugs.length === 0 || activeView === 'compare') {
    return null
  }

  const handleLaunchCompare = () => {
    dispatch(setActiveView('compare'))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card/95 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl p-3.5 flex items-center justify-between gap-3 text-card-foreground">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {stagedSlugs.length}/3 Staged
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {stagedSlugs.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-secondary-foreground border"
              >
                <span className="capitalize">{slug.replace(/-/g, ' ')}</span>
                <button
                  type="button"
                  onClick={() => dispatch(removeAgentFromCompare(slug))}
                  className="text-muted-foreground hover:text-destructive rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${slug} from comparison`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => dispatch(clearComparison())}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleLaunchCompare}
            disabled={stagedSlugs.length < 2}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Compare Matrix</span>
          </button>
        </div>
      </div>
    </div>
  )
}

