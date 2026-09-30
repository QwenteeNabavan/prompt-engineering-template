import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CompareState {
  stagedAgentSlugs: string[]
}

const initialState: CompareState = {
  stagedAgentSlugs: [],
}

export const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addAgentToCompare(state, action: PayloadAction<string>) {
      const slug = action.payload
      if (!state.stagedAgentSlugs.includes(slug)) {
        if (state.stagedAgentSlugs.length < 3) {
          state.stagedAgentSlugs.push(slug)
        }
      }
    },
    removeAgentFromCompare(state, action: PayloadAction<string>) {
      state.stagedAgentSlugs = state.stagedAgentSlugs.filter(
        (s) => s !== action.payload
      )
    },
    clearComparison(state) {
      state.stagedAgentSlugs = []
    },
    setComparisonSlugs(state, action: PayloadAction<string[]>) {
      state.stagedAgentSlugs = action.payload.slice(0, 3)
    },
  },
})

export const {
  addAgentToCompare,
  removeAgentFromCompare,
  clearComparison,
  setComparisonSlugs,
} = compareSlice.actions

export default compareSlice.reducer

