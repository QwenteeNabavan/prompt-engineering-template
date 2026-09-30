import { configureStore } from '@reduxjs/toolkit'
import { agentsApi } from '@/store/api/agentsApi'
import appReducer from '@/store/slices/appSlice'
import compareReducer from '@/store/slices/compareSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    compare: compareReducer,
    [agentsApi.reducerPath]: agentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(agentsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
