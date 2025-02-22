'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PlaceDetail from '@/components/Place/PlaceDatail'
import { fetchPlaceData } from '@/services/place'
import { Place } from '@/types/place'

const PlacePage = () => {
  const params = useParams()
  const [placeData, setPlaceData] = useState<Place | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlaceData = async () => {
      if (!params?.id) return

      try {
        const data = await fetchPlaceData(params.id.toString())
        setPlaceData(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '데이터를 불러오는 중 오류 발생',
        )
      } finally {
        setLoading(false)
      }
    }

    loadPlaceData()
  }, [params?.id])

  // 로딩 중 상태 처리
  if (loading) return <div></div>

  // 에러 발생 시 처리
  if (error) return <div>오류 발생: {error}</div>

  // placeData가 없을 경우 처리
  if (!placeData) return <div>데이터를 찾을 수 없습니다.</div>

  // placeData가 있을 때만 PlaceDetail 렌더링
  return <PlaceDetail placeData={placeData} />
}

export default PlacePage
