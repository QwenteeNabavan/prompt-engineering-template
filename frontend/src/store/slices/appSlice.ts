import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ActiveView = 'directory' | 'profile' | 'compare' | 'collections' | 'submit'

interface AppState {
  activeView: ActiveView
  activeProfileSlug: string | null
  activeCollectionSlug: string | null
  searchQuery: string
  selectedCategory: string
  selectedRuntime: string
  selectedMonetization: string
  sortBy: string
  isFeaturesMenuOpen: boolean
}

const initialState: AppState = {
  activeView: 'directory',
  activeProfileSlug: null,
  activeCollectionSlug: null,
  searchQuery: '',
  selectedCategory: 'all',
  selectedRuntime: 'all',
  selectedMonetization: 'all',
  sortBy: 'trending',
  isFeaturesMenuOpen: false,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveView(state, action: PayloadAction<ActiveView>) {
      state.activeView = action.payload
    },
    openAgentProfile(state, action: PayloadAction<string>) {
      state.activeView = 'profile'
      state.activeProfileSlug = action.payload
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    openCollectionDetail(state, action: PayloadAction<string>) {
      state.activeView = 'collections'
      state.activeCollectionSlug = action.payload
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload
    },
    setSelectedRuntime(state, action: PayloadAction<string>) {
      state.selectedRuntime = action.payload
    },
    setSelectedMonetization(state, action: PayloadAction<string>) {
      state.selectedMonetization = action.payload
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload
    },
    openFeaturesMenu(state) {
      state.isFeaturesMenuOpen = true
    },
    closeFeaturesMenu(state) {
      state.isFeaturesMenuOpen = false
    },
    toggleFeaturesMenu(state) {
      state.isFeaturesMenuOpen = !state.isFeaturesMenuOpen
    },
    syncFromUrl(state, action: PayloadAction<Partial<AppState>>) {
      if (action.payload.activeView !== undefined) state.activeView = action.payload.activeView
      if (action.payload.activeProfileSlug !== undefined)
        state.activeProfileSlug = action.payload.activeProfileSlug
      if (action.payload.activeCollectionSlug !== undefined)
        state.activeCollectionSlug = action.payload.activeCollectionSlug
      if (action.payload.searchQuery !== undefined) state.searchQuery = action.payload.searchQuery
      if (action.payload.selectedCategory !== undefined)
        state.selectedCategory = action.payload.selectedCategory
      if (action.payload.selectedRuntime !== undefined)
        state.selectedRuntime = action.payload.selectedRuntime
      if (action.payload.selectedMonetization !== undefined)
        state.selectedMonetization = action.payload.selectedMonetization
      if (action.payload.sortBy !== undefined) state.sortBy = action.payload.sortBy
    },
  },
})

export const {
  setActiveView,
  openAgentProfile,
  openCollectionDetail,
  setSearchQuery,
  setSelectedCategory,
  setSelectedRuntime,
  setSelectedMonetization,
  setSortBy,
  openFeaturesMenu,
  closeFeaturesMenu,
  toggleFeaturesMenu,
  syncFromUrl,
} = appSlice.actions

export default appSlice.reducer
