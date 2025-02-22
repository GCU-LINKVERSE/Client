import { useState, useCallback } from 'react';

/**
 * 주소를 위도/경도로 변환하는 훅
 * @returns {Object} { coordinates, getCoordinates }
 */
const useAddressToCoordinates = () => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  /**
   * 주소를 위도/경도로 변환하는 함수
   * @param {string} address 
   * @returns {Promise<{lat: number, lng: number}>} 
   */
  const getCoordinates = useCallback((address: string) => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!window.kakao || !window.kakao.maps) {
        reject(new Error('Kakao Maps API가 로드되지 않았습니다.'));
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = {
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x),
          };
          setCoordinates(coords); 
          resolve(coords);
        } else {
          reject(new Error(`주소 변환 실패: ${address}`));
        }
      });
    });
  }, []);

  return { coordinates, getCoordinates };
};

export default useAddressToCoordinates;