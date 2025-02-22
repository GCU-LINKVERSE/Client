import { useEffect, useRef, useState, useCallback } from 'react'
import { getCurrentLocation } from './getCurrentLocation'

/**
 * @typedef {Object} KakaoMapProps
 * @property {import('@/types/place').Place} [selectedPlace]
 * @property {'collapsed' | 'middle' | 'expanded' | ''} [bottomSheetState]
 * @property {(fn: () => void) => void} [onMoveToCurrentLocation]
 */

/**
 * @param {KakaoMapProps} props
 */
const KakaoMap = ({
  selectedPlace,
  bottomSheetState,
  onMoveToCurrentLocation,
}) => {
  const mapContainerRef = useRef(null)
  const [map, setMap] = useState(null)
  const [placeMarker, setPlaceMarker] = useState(null)
  const [currentMarker, setCurrentMarker] = useState(null)
  const [originalPosition, setOriginalPosition] = useState(null)
  onMoveToCurrentLocation?.()

  // 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      const location = await getCurrentLocation()

      const kakaoMapScript = document.createElement('script')
      kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`
      kakaoMapScript.async = true

      kakaoMapScript.onload = () => {
        window.kakao.maps.load(() => {
          const mapContainer = mapContainerRef.current
          if (!mapContainer) return

          const mapOption = {
            center: new window.kakao.maps.LatLng(location.lat, location.lng),
            level: 3,
          }

          const kakaoMap = new window.kakao.maps.Map(mapContainer, mapOption)

          // 현재 위치 마커 추가
          const markerImage = new window.kakao.maps.MarkerImage(
            '/myLocation.svg',
            new window.kakao.maps.Size(32, 60),
            { offset: new window.kakao.maps.Point(16, 60) },
          )

          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(location.lat, location.lng),
            image: markerImage,
          })
          marker.setMap(kakaoMap)

          setMap(kakaoMap)
          setCurrentMarker(marker)
        })
      }

      document.head.appendChild(kakaoMapScript)

      return () => {
        document.head.removeChild(kakaoMapScript)
      }
    }

    initializeMap()
  }, [])

  // 선택된 장소의 주소를 지도에 표시
  useEffect(() => {
    if (!map || !selectedPlace?.address) return

    const geocoder = new window.kakao.maps.services.Geocoder()

    geocoder.addressSearch(selectedPlace.address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)

        // 지도 중심 이동
        map.setCenter(coords)

        // 기존 장소 마커 제거
        if (placeMarker) placeMarker.setMap(null)

        // 장소 타입에 따른 마커 이미지 설정
        const markerImageSrc =
          selectedPlace.category === 0
            ? '/food_location.svg'
            : selectedPlace.category === 1
              ? '/cafe_location.svg'
              : selectedPlace.category === 2
                ? '/game_location.svg'
                : '/campus_location.svg'

        const markerImage = new window.kakao.maps.MarkerImage(
          markerImageSrc,
          new window.kakao.maps.Size(32, 60),
          { offset: new window.kakao.maps.Point(13, 30) },
        )

        // 새 장소 마커 추가
        const newMarker = new window.kakao.maps.Marker({
          position: coords,
          image: markerImage,
        })
        newMarker.setMap(map)
        setPlaceMarker(newMarker)

        // 마커의 원래 위치 저장
        setOriginalPosition(coords)
      } else {
        console.error('주소 검색 실패:', selectedPlace.address)
      }
    })
  }, [map, selectedPlace])

  // Bottom Sheet 상태 변경에 따른 지도 중심 및 마커 위치 조정
  useEffect(() => {
    if (!map || !originalPosition) return

    const adjustMarkerAndMapPosition = () => {
      let offsetY = 0

      // BottomSheet 상태에 따라 위로 이동할 거리 계산
      if (bottomSheetState === 'middle') {
        offsetY = 0.002
      } else if (bottomSheetState === 'expanded') {
        offsetY = 0.005
      } else {
        offsetY = 0
      }

      const newCenter = new window.kakao.maps.LatLng(
        originalPosition.getLat() - offsetY,
        originalPosition.getLng(),
      )

      map.setCenter(newCenter)
      if (placeMarker) {
        placeMarker.setPosition(originalPosition)
      }
    }

    adjustMarkerAndMapPosition()
  }, [map, placeMarker, bottomSheetState, originalPosition])

  // 현재 위치로 이동
  const moveToCurrentLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation()

      if (!map) return

      const newLocation = new window.kakao.maps.LatLng(
        location.lat,
        location.lng,
      )

      map.setCenter(newLocation)

      if (currentMarker) {
        currentMarker.setPosition(newLocation)
      } else {
        const markerImage = new window.kakao.maps.MarkerImage(
          '/myLocation.svg',
          new window.kakao.maps.Size(32, 60),
          { offset: new window.kakao.maps.Point(16, 60) },
        )

        const newMarker = new window.kakao.maps.Marker({
          position: newLocation,
          image: markerImage,
        })
        newMarker.setMap(map)
        setCurrentMarker(newMarker)
      }
    } catch (error) {
      console.error('현재 위치로 이동 중 오류:', error)
    }
  }, [map, currentMarker])

  // 외부 이벤트와 연동
  useEffect(() => {
    if (onMoveToCurrentLocation) {
      onMoveToCurrentLocation(moveToCurrentLocation)
    }
  }, [onMoveToCurrentLocation, moveToCurrentLocation])

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    ></div>
  )
}

export default KakaoMap
