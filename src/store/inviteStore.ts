import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface InviteState {
  inviteUrl: string | null
  setInviteUrl: (inviteUrl: string) => void
  clearSelectedSurveyId: () => void // 상태 초기화 함수 추가
}

export const useInviteStore = create(
  persist<InviteState>(
    (set) => ({
      inviteUrl: null,
      setInviteUrl: (inviteUrl) => set({ inviteUrl: inviteUrl }),
      clearSelectedSurveyId: () => {
        set({ inviteUrl: null }) // Zustand 상태 초기화
        localStorage.removeItem('invite-storage') // localStorage에서도 삭제
      },
    }),
    {
      name: 'invite-storage', // localStorage에 저장될 키 이름
    },
  ),
)
