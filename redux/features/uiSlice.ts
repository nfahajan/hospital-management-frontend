import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UIState {
  theme: 'light' // Only light mode supported
  sidebarOpen: boolean
  modalOpen: boolean
  modalType?: string
  modalData?: any
  notifications: any[]
  loading: {
    global: boolean
    [key: string]: boolean
  }
}

const initialState: UIState = {
  theme: 'light', // Always light mode
  sidebarOpen: false,
  modalOpen: false,
  modalType: undefined,
  modalData: undefined,
  notifications: [],
  loading: {
    global: false,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme is always light, so no theme toggles
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload
      if (!action.payload) {
        state.modalType = undefined
        state.modalData = undefined
      }
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modalOpen = true
      state.modalType = action.payload.type
      state.modalData = action.payload.data
    },
    closeModal: (state) => {
      state.modalOpen = false
      state.modalType = undefined
      state.modalData = undefined
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading
    },
  },
})

export const { 
  setSidebarOpen,
  toggleSidebar,
  setModalOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setLoading
} = uiSlice.actions

export default uiSlice.reducer 