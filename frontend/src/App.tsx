import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { syncFromUrl, openTetris, closeTetris, closeHardestGame, openInvoker, closeInvoker, openPudge, closePudge, setSearchQuery, type ActiveView } from '@/store/slices/appSlice'
import { setComparisonSlugs } from '@/store/slices/compareSlice'
import { Navbar } from '@/components/layout/Navbar'
import { StagingDock } from '@/components/compare/StagingDock'
import { AgentHubDashboard } from '@/components/agenthub/AgentHubDashboard'
import { AgentProfilePage } from '@/features/profile/AgentProfilePage'
import { SubmissionPage } from '@/features/submit/SubmissionPage'
import { ComparePage } from '@/features/compare/ComparePage'
import { TetrisModal } from '@/components/agenthub/TetrisModal'
import { HardestGameModal } from '@/components/agenthub/HardestGameModal'
import { InvokerTrainerModal } from '@/components/agenthub/InvokerTrainerModal'
import { PudgeHookTrainerModal } from '@/components/agenthub/PudgeHookTrainerModal'
import { ArcadePage } from '@/features/arcade/ArcadePage'

function App() {
  const dispatch = useDispatch()
  const appState = useSelector((state: RootState) => state.app)
  const stagedSlugs = useSelector((state: RootState) => state.compare.stagedAgentSlugs)

  const isPopstateRef = useRef(false)
  const prevViewRef = useRef(appState.activeView)

  // 1. Initial mount & popstate handler (browser back/forward button)
  useEffect(() => {
    const parseUrlAndSyncState = () => {
      const params = new URLSearchParams(window.location.search)
      const viewParam = params.get('view') as ActiveView | null
      const slug = params.get('slug')
      const collection = params.get('collection')
      const agentsParam = params.get('agents')
      const q = params.get('q')
      const category = params.get('category')
      const runtime = params.get('runtime')
      const monetization = params.get('monetization')
      const sort = params.get('sort')

      let targetView: ActiveView = 'directory'
      if (viewParam && ['directory', 'profile', 'compare', 'collections', 'submit', 'arcade'].includes(viewParam)) {
        targetView = viewParam
      } else if (slug) {
        targetView = 'profile'
      } else if (collection) {
        targetView = 'collections'
      } else if (agentsParam) {
        targetView = 'compare'
      }

      isPopstateRef.current = true
      dispatch(
        syncFromUrl({
          activeView: targetView,
          activeProfileSlug: slug || null,
          activeCollectionSlug: collection || null,
          searchQuery: q || '',
          selectedCategory: category || 'all',
          selectedRuntime: runtime || 'all',
          selectedMonetization: monetization || 'all',
          sortBy: sort || 'trending',
        })
      )

      if (agentsParam) {
        const slugs = agentsParam.split(',').map((s) => s.trim()).filter(Boolean)
        dispatch(setComparisonSlugs(slugs))
      }
    }

    parseUrlAndSyncState()

    const handlePopstate = () => {
      parseUrlAndSyncState()
    }
    window.addEventListener('popstate', handlePopstate)

    // Global Easter Egg shortcuts:
    // Tetris: Alt+T or Shift+T (outside inputs)
    // Invoker Trainer: Alt+I or Shift+I (outside inputs)
    const handleGameShortcuts = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(
        (e.target as HTMLElement)?.tagName
      )
      if (
        (e.altKey && e.key.toLowerCase() === 't') ||
        (e.shiftKey && e.key.toLowerCase() === 't' && !isInput)
      ) {
        e.preventDefault()
        dispatch(openTetris())
      } else if (
        (e.altKey && e.key.toLowerCase() === 'i') ||
        (e.shiftKey && e.key.toLowerCase() === 'i' && !isInput)
      ) {
        e.preventDefault()
        dispatch(openInvoker())
      } else if (
        (e.altKey && e.key.toLowerCase() === 'p') ||
        (e.shiftKey && e.key.toLowerCase() === 'p' && !isInput)
      ) {
        e.preventDefault()
        dispatch(openPudge())
      }
    }
    window.addEventListener('keydown', handleGameShortcuts)

    return () => {
      window.removeEventListener('popstate', handlePopstate)
      window.removeEventListener('keydown', handleGameShortcuts)
    }
  }, [dispatch])

  // 2. Synchronize Redux state to URL search parameters
  useEffect(() => {
    if (isPopstateRef.current) {
      isPopstateRef.current = false
      prevViewRef.current = appState.activeView
      return
    }

    const params = new URLSearchParams()

    if (appState.activeView !== 'directory') {
      params.set('view', appState.activeView)
    }

    if (appState.activeView === 'profile' && appState.activeProfileSlug) {
      params.set('slug', appState.activeProfileSlug)
    } else if (appState.activeView === 'collections' && appState.activeCollectionSlug) {
      params.set('collection', appState.activeCollectionSlug)
    } else if (appState.activeView === 'compare' && stagedSlugs.length > 0) {
      params.set('agents', stagedSlugs.join(','))
    } else if (appState.activeView === 'directory') {
      if (appState.searchQuery.trim()) params.set('q', appState.searchQuery.trim())
      if (appState.selectedCategory !== 'all') params.set('category', appState.selectedCategory)
      if (appState.selectedRuntime !== 'all') params.set('runtime', appState.selectedRuntime)
      if (appState.selectedMonetization !== 'all') params.set('monetization', appState.selectedMonetization)
      if (appState.sortBy !== 'trending') params.set('sort', appState.sortBy)
    }

    const newQueryString = params.toString()
    const targetUrl = newQueryString ? `?${newQueryString}` : window.location.pathname

    if (`?${newQueryString}` !== window.location.search && !(newQueryString === '' && window.location.search === '')) {
      const isViewChange = prevViewRef.current !== appState.activeView
      prevViewRef.current = appState.activeView

      if (isViewChange) {
        window.history.pushState(null, '', targetUrl)
      } else {
        window.history.replaceState(null, '', targetUrl)
      }
    }
  }, [
    appState.activeView,
    appState.activeProfileSlug,
    appState.activeCollectionSlug,
    appState.searchQuery,
    appState.selectedCategory,
    appState.selectedRuntime,
    appState.selectedMonetization,
    appState.sortBy,
    stagedSlugs,
  ])

  return (
    <>
      {appState.activeView === 'directory' ? (
        <AgentHubDashboard />
      ) : (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
          <Navbar />

          <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1">
            {appState.activeView === 'profile' && <AgentProfilePage />}
            {appState.activeView === 'compare' && <ComparePage />}
            {appState.activeView === 'collections' && <ComparePage />}
            {appState.activeView === 'submit' && <SubmissionPage />}
            {appState.activeView === 'arcade' && <ArcadePage />}
          </main>

          <StagingDock />

          <footer className="border-t py-8 text-center text-xs text-muted-foreground">
            <div className="container max-w-7xl mx-auto px-4 space-y-2">
              <p className="font-semibold text-foreground">
                AgentHub — Standardized Directory & Technical Benchmark for Autonomous AI Agents
              </p>
              <p>
                Operating with dynamic time-decay discovery algorithms, verified telemetry, and deduplicated community audits.
              </p>
            </div>
          </footer>
        </div>
      )}

      {/* Global Embedded Tetris Mini-Game Popup */}
      <TetrisModal
        isOpen={appState.isTetrisOpen}
        onClose={() => dispatch(closeTetris())}
      />

      {/* Global The World's Hardest Game Secret Easter Egg Modal */}
      <HardestGameModal
        isOpen={appState.isHardestGameOpen}
        onClose={() => {
          dispatch(closeHardestGame())
          if (appState.searchQuery.trim().toLowerCase() === 'game') {
            dispatch(setSearchQuery(''))
          }
        }}
      />

      {/* Global Invoker Spell Knowledge Trainer Modal */}
      <InvokerTrainerModal
        isOpen={appState.isInvokerOpen}
        onClose={() => {
          dispatch(closeInvoker())
          if (['invoker', 'dota', 'spell'].includes(appState.searchQuery.trim().toLowerCase())) {
            dispatch(setSearchQuery(''))
          }
        }}
      />

      {/* Global Dota 2 Pudge Meat Hook Precision Trainer Modal */}
      <PudgeHookTrainerModal
        isOpen={appState.isPudgeOpen}
        onClose={() => {
          dispatch(closePudge())
          if (['pudge', 'hook', 'meat', 'fresh meat'].includes(appState.searchQuery.trim().toLowerCase())) {
            dispatch(setSearchQuery(''))
          }
        }}
      />
    </>
  )
}

export default App
