import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ActiveView = 'directory' | 'profile' | 'compare' | 'collections' | 'submit' | 'arcade'

interface AppState {
  activeView: ActiveView
  activeProfileSlug: string | null
  activeCollectionSlug: string | null
  searchQuery: string
  selectedCategory: string
  selectedRuntime: string
  selectedMonetization: string
  sortBy: string
  isTetrisOpen: boolean
  isHardestGameOpen: boolean
  isInvokerOpen: boolean
  isPudgeOpen: boolean
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
  isTetrisOpen: false,
  isHardestGameOpen: false,
  isInvokerOpen: false,
  isPudgeOpen: false,
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
    openTetris(state) {
      state.isTetrisOpen = true
    },
    closeTetris(state) {
      state.isTetrisOpen = false
    },
    setTetrisOpen(state, action: PayloadAction<boolean>) {
      state.isTetrisOpen = action.payload
    },
    openHardestGame(state) {
      state.isHardestGameOpen = true
    },
    closeHardestGame(state) {
      state.isHardestGameOpen = false
    },
    setHardestGameOpen(state, action: PayloadAction<boolean>) {
      state.isHardestGameOpen = action.payload
    },
    openInvoker(state) {
      state.isInvokerOpen = true
    },
    closeInvoker(state) {
      state.isInvokerOpen = false
    },
    setInvokerOpen(state, action: PayloadAction<boolean>) {
      state.isInvokerOpen = action.payload
    },
    openPudge(state) {
      state.isPudgeOpen = true
    },
    closePudge(state) {
      state.isPudgeOpen = false
    },
    setPudgeOpen(state, action: PayloadAction<boolean>) {
      state.isPudgeOpen = action.payload
    },
    syncFromUrl(state, action: PayloadAction<Partial<AppState>>) {
      if (action.payload.activeView !== undefined) state.activeView = action.payload.activeView
      if (action.payload.activeProfileSlug !== undefined) state.activeProfileSlug = action.payload.activeProfileSlug
      if (action.payload.activeCollectionSlug !== undefined) state.activeCollectionSlug = action.payload.activeCollectionSlug
      if (action.payload.searchQuery !== undefined) state.searchQuery = action.payload.searchQuery
      if (action.payload.selectedCategory !== undefined) state.selectedCategory = action.payload.selectedCategory
      if (action.payload.selectedRuntime !== undefined) state.selectedRuntime = action.payload.selectedRuntime
      if (action.payload.selectedMonetization !== undefined) state.selectedMonetization = action.payload.selectedMonetization
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
  openTetris,
  closeTetris,
  setTetrisOpen,
  openHardestGame,
  closeHardestGame,
  setHardestGameOpen,
  openInvoker,
  closeInvoker,
  setInvokerOpen,
  openPudge,
  closePudge,
  setPudgeOpen,
  syncFromUrl,
} = appSlice.actions

export default appSlice.reducer
