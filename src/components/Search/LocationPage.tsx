'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar/SearchBar'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import Image from 'next/image'
import LocationModal from '@/components/Modals/DirectSelect/LocationModal'

const KAKAO_API_KEY = '7d67efb24d65fe323f795b1b4a52dd77'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface LocationPageProps {
  onLocationClick: (location: {
    place: string
    lat: number
    lng: number
  }) => void
  isDirectModal: boolean
}

interface Address {
  address_name: string
}

interface RoadAddress {
  building_name?: string
  address_name: string
}

// "주소 검색 API" 응답 타입 (address_name은 address 내부에 존재)
interface AddressDocument {
  address?: Address
  road_address?: RoadAddress
  x: string
  y: string
}

// "장소 검색 API" 응답 타입 (place_name 포함)
interface PlaceDocument {
  place_name: string
  address_name: string
  road_address_name?: string
  x: string
  y: string
}

// API 응답 타입
interface AddressAPIResponse {
  documents: AddressDocument[]
}

interface PlaceAPIResponse {
  documents: PlaceDocument[]
}

const LocationPage: React.FC<LocationPageProps> = ({
  onLocationClick,
  isDirectModal,
}) => {
  {
    const router = useRouter()
    const searchParams = useSearchParams()
    const from = searchParams.get('from')
    const queryParam = searchParams.get('query') || ''

    const [searchQuery, setSearchQuery] = useState(queryParam)
    const [locations, setLocations] = useState<
      { place: string; jibun: string; road: string; lat: number; lng: number }[]
    >([])

    const [isModalVisible, setIsModalVisible] = useState(isDirectModal)
    const [finalLocation, setFinalLocation] = useState<{
      place: string
      lat: number
      lng: number
    } | null>(null)

    const fetchAddressByQuery = useCallback(async (query: string) => {
      if (!query.trim()) {
        setLocations([])
        return
      }

      try {
        const queryEncoded = encodeURIComponent(query)

        // 🔹 1. 주소 검색 API 요청
        const addressResponse = await fetch(
          `https://dapi.kakao.com/v2/local/search/address.json?query=${queryEncoded}`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_API_KEY}`,
              Referer: 'https://localhost:3000',
            },
          },
        )
        const addressData: AddressAPIResponse = await addressResponse.json()

        // 🔹 2. 장소 검색 API 요청
        const placeResponse = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${queryEncoded}`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_API_KEY}`,
              Referer: 'https://localhost:3000',
            },
          },
        )
        const placeData: PlaceAPIResponse = await placeResponse.json()

        const combinedResults: {
          place: string
          jibun: string
          road: string
          lat: number
          lng: number
        }[] = []

        addressData.documents.forEach((doc) => {
          combinedResults.push({
            place:
              doc.road_address?.building_name ||
              doc.road_address?.address_name ||
              doc.address?.address_name ||
              '주소 정보 없음',
            jibun: doc.address?.address_name || '지번 주소 없음',
            road: doc.road_address?.address_name || '도로명 주소 없음',
            lat: parseFloat(doc.y) || 0,
            lng: parseFloat(doc.x) || 0,
          })
        })

        placeData.documents.forEach((doc) => {
          combinedResults.push({
            place: doc.place_name,
            jibun: doc.address_name || '지번 주소 없음',
            road: doc.road_address_name || '도로명 주소 없음',
            lat: parseFloat(doc.y) || 0,
            lng: parseFloat(doc.x) || 0,
          })
        })

        setLocations(combinedResults)
      } catch (error) {
        console.error('🔹 검색 오류 발생:', error)
      }
    }, [])

    const fetchCombinedLocationData = useCallback(
      async (latitude: number, longitude: number) => {
        try {
          const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/keyword.json?query=주변&x=${longitude}&y=${latitude}&radius=5000&sort=distance`,
            {
              headers: {
                Authorization: `KakaoAK ${KAKAO_API_KEY}`,
                Referer: 'https://localhost:3000',
              },
            },
          )
          const data = await response.json()
          console.log('🔹 Kakao API 응답:', data)

          if (!data.documents || !Array.isArray(data.documents)) {
            throw new Error('Kakao API 응답 데이터 형식이 올바르지 않습니다.')
          }

          const nearbyPlaces = data.documents.map((place: PlaceDocument) => ({
            place: place.place_name,
            jibun: place.address_name || '지번 주소 없음',
            road: place.road_address_name || '도로명 주소 없음',
            lat: parseFloat(place.y) || 0, // ✅ 위도 값 추가
            lng: parseFloat(place.x) || 0, // ✅ 경도 값 추가
          }))

          setLocations(nearbyPlaces)
        } catch (error) {
          console.error('🔹 내 위치 기반 검색 오류 발생:', error)
        }
      },
      [],
    )

    useEffect(() => {
      const fetchCurrentLocationAndUpdate = async () => {
        try {
          const { lat, lng } = await getCurrentLocation()
          await fetchCombinedLocationData(lat, lng) // 🔹 내 위치를 기반으로 리스트업 실행
        } catch (error) {
          console.error('🔹 현재 위치 가져오기 실패:', error)
        }
      }

      if (queryParam === 'current') {
        fetchCurrentLocationAndUpdate()
      } else if (queryParam.trim()) {
        fetchAddressByQuery(queryParam) // 검색어가 있을 경우 fetchAddressByQuery 실행
      }
    }, [queryParam, fetchAddressByQuery, fetchCombinedLocationData]) // 종속성 배열에서 fetchCombinedLocationData와 fetchAddressByQuery를 제거

    // 선택한 장소를 기반으로 가장 가까운 지하철역 조회 API 호출
    const fetchNearestTransit = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/transit`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude }),
        })

        if (!response.ok) throw new Error('Failed to fetch nearest transit')

        const data = await response.json()

        return {
          transitName: data.data.transitName || '출발지 미정',
          latitude: data.data.latitude,
          longitude: data.data.longitude,
        }
      } catch (error) {
        console.error('Failed to fetch nearest transit:', error)
        return { transitName: '출발지 미정', latitude, longitude }
      }
    }

    // 사용자가 리스트에서 특정 위치를 선택했을 때 실행
    const handleLocationSelect = async (location: {
      place: string
      lat: number
      lng: number
    }) => {
      try {
        // 선택한 위치의 가장 가까운 지하철역 조회
        const transitInfo = await fetchNearestTransit(
          location.lat,
          location.lng,
        )

        const transitName = transitInfo.transitName || location.place
        const transitLat = transitInfo.latitude || location.lat
        const transitLng = transitInfo.longitude || location.lng

        setFinalLocation({
          place: transitName,
          lat: transitLat,
          lng: transitLng,
        }) // 🚆 최종 출발지 설정

        if (isDirectModal) {
          setIsModalVisible(true)
        } else {
          // Middle 페이지로 지하철역 정보 전달
          router.push(
            `/letsmeet/middle?selectedLocation=${encodeURIComponent(transitName)}&lat=${transitLat}&lng=${transitLng}`,
          )
        }
      } catch (error) {
        console.error('Transit API 호출 실패:', error)
      }
    }

    const handleBackClick = () => {
      router.push(`/search?from=${from}&direct=${isDirectModal}`)
    }

    return (
      <div className="flex flex-col items-center justify-start h-screen bg-white overflow-y-auto">
        {/* 검색창 */}
        <div className="flex w-full px-3 py-[11px] justify-center items-center gap-2 rounded-b-[24px] bg-white shadow-[0_0_10px_0_rgba(30,30,30,0.1)]">
          {/* 뒤로가기 버튼 */}
          <Image
            src="/arrow_back.svg"
            alt="뒤로 가기"
            width={24}
            height={24}
            className="w-6 h-6 cursor-pointer"
            onClick={handleBackClick}
          />
          <SearchBar
            placeholder="출발지를 입력해주세요!"
            onSearch={() => {
              if (searchQuery.trim()) {
                fetchAddressByQuery(searchQuery)
              } else {
                alert('검색어를 입력해주세요.')
              }
            }}
            onChange={(value) => setSearchQuery(value)} // 🔹 SearchBar 입력값을 searchQuery 상태에 저장
          />

          {/* 검색 버튼 */}
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                fetchAddressByQuery(searchQuery) // 버튼 클릭 시 입력값을 함수로 전달
              } else {
                alert('검색어를 입력해주세요.')
              }
            }}
            className="text-xl text-center font-pretendard font-medium leading-[17px] tracking-[-0.5px] text-[#9562fb] cursor-pointer"
          >
            검색
          </button>
        </div>

        <div className="mt-3 w-full flex flex-col mb-[21px]">
          {locations.map((location, index) => (
            <div
              key={index}
              className="flex h-[80px] py-4 px-7 flex-col justify-center items-start gap-2 self-stretch rounded-full bg-white"
              onClick={() => {
                handleLocationSelect(location) //  `location` 전달
                onLocationClick(location) // `onLocationClick`에 location 객체 전달
              }}
            >
              <p className="text-[#1e1e1e] text-center font-pretendard text-[16px] font-normal leading-[17px] tracking-[-0.5px]">
                {location.place}
              </p>
              <p className="text-[#afafaf] font-pretendard text-[12px] font-normal leading-[17px] tracking-[-0.5px]">
                {location.jibun}
              </p>
            </div>
          ))}
        </div>
        {/* 중앙 위치 직접선택 모달 */}
        {isModalVisible && finalLocation && (
          <LocationModal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onClickRight={() => setIsModalVisible(false)}
            initialTitle={finalLocation.place}
            onTitleChange={() => {}}
            selectedLocation={finalLocation}
          />
        )}
      </div>
    )
  }
}
export default LocationPage
