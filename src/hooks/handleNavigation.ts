const useNavigateToNaverMap = () => {
  const navigateToNaverMap = (
    destination: string | undefined,
    lat?: number,
    lng?: number,
    placeName?: string,
  ) => {
    if (!destination || lat === undefined || lng === undefined) return

    const destinationName = placeName || destination

    const naverDirectionsUrl = `https://map.naver.com/p/directions/-/${lng},${lat},${encodeURIComponent(destinationName)},PLACE_POI/-/transit?c=15.00,0,0,0,dh`

    window.open(naverDirectionsUrl, '_blank')
  }

  return { navigateToNaverMap }
}

export default useNavigateToNaverMap
