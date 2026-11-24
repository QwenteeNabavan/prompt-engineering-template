import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { syncFromUrl, closeFeaturesMenu, type ActiveView } from '@/store/slices/appSlice'
import { setComparisonSlugs } from '@/store/slices/compareSlice'
import { Navbar } from '@/components/layout/Navbar'
import { StagingDock } from '@/components/compare/StagingDock'
import { AgentHubDashboard } from '@/components/agenthub/AgentHubDashboard'
import { AgentProfilePage } from '@/features/profile/AgentProfilePage'
import { SubmissionPage } from '@/features/submit/SubmissionPage'
import { ComparePage } from '@/features/compare/ComparePage'
import { FeaturesMenuDrawer } from '@/components/layout/FeaturesMenuDrawer'

const VALID_VIEWS: ActiveView[] = ['directory', 'profile', 'compare', 'collections', 'submit']

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
      if (viewParam && VALID_VIEWS.includes(viewParam)) {
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
        const slugs = agentsParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        dispatch(setComparisonSlugs(slugs))
      }
    }

    parseUrlAndSyncState()
    window.addEventListener('popstate', parseUrlAndSyncState)
    return () => window.removeEventListener('popstate', parseUrlAndSyncState)
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
      if (appState.selectedMonetization !== 'all')
        params.set('monetization', appState.selectedMonetization)
      if (appState.sortBy !== 'trending') params.set('sort', appState.sortBy)
    }

    const newQueryString = params.toString()
    const targetUrl = newQueryString ? `?${newQueryString}` : window.location.pathname

    if (
      `?${newQueryString}` !== window.location.search &&
      !(newQueryString === '' && window.location.search === '')
    ) {
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
          </main>

          <StagingDock />

          <footer className="border-t py-8 text-center text-xs text-muted-foreground">
            <div className="container max-w-7xl mx-auto px-4 space-y-2">
              <p className="font-semibold text-foreground">
                AgentHub v1.1 — Standardized Directory & Technical Benchmark for Autonomous AI
                Agents
              </p>
              <p>
                Operating with dynamic time-decay discovery algorithms, verified telemetry, and
                deduplicated community audits.
              </p>
            </div>
          </footer>
        </div>
      )}

      {/* Global Categorized Features & Navigation Menu Drawer */}
      <FeaturesMenuDrawer
        isOpen={appState.isFeaturesMenuOpen}
        onClose={() => dispatch(closeFeaturesMenu())}
        onOpenSearch={() => {
          if (appState.activeView !== 'directory') {
            dispatch(syncFromUrl({ activeView: 'directory' }))
          }
          setTimeout(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
          }, 50)
        }}
        onOpenSubmit={() => {
          dispatch(syncFromUrl({ activeView: 'submit' }))
        }}
      />
    </>
  )
}

export default App
