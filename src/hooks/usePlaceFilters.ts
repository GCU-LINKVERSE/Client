import { useState, useEffect } from 'react'
import { fetchFilters } from '@/services/place'
import { Place } from '@/types/place'

export const usePlaceFilters = (placeData: Place) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    const getActiveFilters = async () => {
      try {
        const filterData = await fetchFilters() // fetchFilters로 필터 응답 받기

        if (!filterData.success || !Array.isArray(filterData.data)) return []

        // `placeData.category`에 맞는 카테고리 필터 찾기
        const categoryFilters = filterData.data[placeData.category]
        if (!categoryFilters) return []

        const { filters } = categoryFilters // 해당 카테고리의 필터 객체 (filter1, filter2 등)

        // placeData에서 filter로 시작하는 필드를 찾아서 그 값이 true일 경우에만 filters의 해당하는 값을 activeFilters에 추가
        const activeFilters = Object.keys(filters)
          .filter(
            (key) =>
              key.startsWith('filter') &&
              placeData[key as keyof Place] === true,
          ) // placeData의 필터 값이 true인 필드만 찾기
          .map((key) => filters[key as keyof typeof filters]) // filters의 해당 값 추가
          .filter((filter) => filter !== undefined) // undefined 값 필터링

        setActiveFilters(activeFilters) // 활성화된 필터들 상태 업데이트
      } catch (error) {
        console.error('필터 가져오기 오류:', error)
      }
    }

    getActiveFilters() // 필터 가져오기 실행
  }, [placeData]) // placeData가 바뀔 때마다 필터 재조회

  return { activeFilters }
}
