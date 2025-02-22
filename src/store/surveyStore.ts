import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SurveyState {
  selectedSurveyId: number | null
  setSelectedSurveyId: (id: number) => void
  clearSelectedSurveyId: () => void // 상태 초기화 함수 추가
}

export const useSurveyStore = create(
  persist<SurveyState>(
    (set) => ({
      selectedSurveyId: null,
      setSelectedSurveyId: (id) => set({ selectedSurveyId: id }),
      clearSelectedSurveyId: () => {
        set({ selectedSurveyId: null }) // Zustand 상태 초기화
        localStorage.removeItem('survey-storage') // localStorage에서도 삭제
      },
    }),
    {
      name: 'survey-storage', // localStorage에 저장될 키 이름
    },
  ),
)
