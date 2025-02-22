'use client'

import { create } from 'zustand'

interface NotificationState {
  notification: string | null
  showNotification: (message: string) => void
  hideNotification: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notification: null,
  showNotification: (message) => set({ notification: message }),
  hideNotification: () => set({ notification: null }),
}))
