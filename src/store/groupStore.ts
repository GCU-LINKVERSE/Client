import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GroupState {
  selectedGroupId: number | null
  setSelectedGroupId: (id: number) => void
  clearSelectedGroupId: () => void // 상태 초기화 함수 추가
}

export const useGroupStore = create(
  persist<GroupState>(
    (set) => ({
      selectedGroupId: null,
      setSelectedGroupId: (id) => set({ selectedGroupId: id }),
      clearSelectedGroupId: () => {
        set({ selectedGroupId: null }) // Zustand 상태 초기화
        localStorage.removeItem('group-storage') // localStorage에서도 삭제
      },
    }),
    {
      name: 'group-storage', // localStorage에 저장될 키 이름
    },
  ),
)
