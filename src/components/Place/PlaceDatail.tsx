'use client'

import React, { useEffect, useState } from 'react'
import KakaoMap from '@/components/Map/KakaoMap'
import styles from '@/app/place/styles/Detail.module.css'
import { Place } from '@/types/place'
import VisitorPhoto from '@/components/Place/VisitorPhoto'
import SectionTitle from '@/components/Place/SectionTitle'
import { useBottomSheet } from '@/hooks/useBottomSheet'
import { usePlaceFilters } from '@/hooks/usePlaceFilters'
import { useLikeSystem } from '@/hooks/useLikeSystem'
import { useNavigation } from '@/hooks/useNavigation'
import StoreInfo from '@/components/Place/StoreInfo'
import StoreInfoCampus from '@/components/Place/StoreInfoCampus'
import StoreInfoReservation from '@/components/Place/StoreInfoReservation'
import useTimeParser from '@/hooks/useTimeParser'
import useNavigateToNaverMap from "@/hooks/handleNavigation"
import useAddressToCoordinates from '@/hooks/useAddressToCoordinates';

interface PlaceDetailProps {
  placeData: Place
}

const getStoreInfoComponent = (
  category: number,
  phoneNumber: string | null,
) => {
  if (category === 0 || category === 1 || category === 2) return StoreInfo
  if (category === 3) {
    return phoneNumber === null ? StoreInfoCampus : StoreInfoReservation
  }
  return StoreInfo
}

const PlaceDetail = ({ placeData }: PlaceDetailProps) => {
  const {
    bottomSheetState,
    handleStart,
    handleMove,
    handleEnd,
    setBottomSheetState,
  } = useBottomSheet()
  const { activeFilters } = usePlaceFilters(placeData)
  const { liked, likeCount, handleLikeButtonClick } = useLikeSystem(
    Number(placeData.id),
  )
  const { handleBackClick, handleCloseClick } =
    useNavigation(setBottomSheetState)
  const StoreInfoComponent = getStoreInfoComponent(
    placeData.category,
    placeData.phoneNumber,
  )
  const { todayEntry } = useTimeParser(placeData.time)
  const [activeTab, setActiveTab] = useState<'상세' | '사진'>('상세')
  const { navigateToNaverMap } = useNavigateToNaverMap();
  const { coordinates, getCoordinates } = useAddressToCoordinates();

  useEffect(() => {
    if (document.getElementById('kakao-maps-script')) {
      return;
    }
  
    const script = document.createElement('script');
    script.id = 'kakao-maps-script';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      console.log('Kakao Maps API 스크립트가 정상적으로 로드되었습니다.');
      window.kakao.maps.load(() => {
        console.log('Kakao Maps API 사용 가능');
      });
    };
  
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!placeData.address) return;
  
    getCoordinates(placeData.address)
      .then((coords) => {
        console.log('도착지 좌표 변환 완료:', coords);
      })
      .catch((error) => {
        console.error('도착지 좌표 변환 실패:', error);
      });
  }, [placeData]);

  return (
    <div className={styles['detail-container']}>
      <div className={`${styles['map-container']} ${styles[bottomSheetState]}`}>
        <KakaoMap
          bottomSheetState={bottomSheetState}
          selectedPlace={placeData}
          onMoveToCurrentLocation={() => {}}
        />
        {/* 뒤로가기 버튼 */}
        <div
          className={styles.backButton}
          onClick={() => window.history.back()}
        >
          <img
            src="/arrow_back.svg"
            alt="뒤로가기"
            className={styles.backIcon}
          />
        </div>

        {/* 창닫기 버튼 */}
        <div
          className={styles.closeButton}
          onClick={() => window.history.back()}
        >
          <img
            src="/close-button.svg"
            alt="창닫기"
            className={styles.closeIcon}
          />
        </div>
      </div>

      {bottomSheetState === 'expanded' && (
        <div className={styles['top-buttons']}>
          <button
            className={styles['top-left-button']}
            onClick={handleBackClick}
          >
            <img
              src="/arrow_back_ios.svg"
              alt="뒤로가기"
              style={{ width: '28px', height: '28px' }}
            />
          </button>
          <button
            className={styles['top-right-button']}
            onClick={handleCloseClick}
          >
            <img
              src="/close_ios.svg"
              alt="닫기"
              style={{ width: '28px', height: '28px' }}
            />
          </button>
        </div>
      )}

      <div
        className={`${styles.bottomSheetTopRightButton} ${styles[bottomSheetState]}`}
      >
        <img
          src="/path.svg"
          alt="Path Icon"
          className={styles.iconInsideButton}

          onClick={() => {
            if (coordinates?.lat && coordinates?.lng) {
              navigateToNaverMap(
                placeData.address,
                coordinates.lat,
                coordinates.lng,
                placeData.name
              );
            } else {
              console.error('도착지 좌표 없음');
            }
          }}
        />
      </div>

      {/* Bottom Sheet */}
      <div
        className={`${styles.bottomSheet} ${styles[bottomSheetState]}`}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientY)}
      >
        <div className={styles.dragHandle}></div>

        {/* Collapsed 상태 */}
        {bottomSheetState === 'collapsed' && (
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{placeData.name}</h3>
              <div className={styles.likes}>
                <div
                  className={`${styles.likeBackground} ${liked ? styles.liked : ''}`}
                  onClick={handleLikeButtonClick}
                >
                  <div className={styles.likeIcon}></div>
                </div>
                <span>{likeCount}명</span>
              </div>
            </div>

            <div className={styles.tags}>
              {activeFilters.map((filter, index) => (
                <span key={index} className={styles.tag}>
                  {filter}
                </span>
              ))}
            </div>

            <h3>{placeData.word}</h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '2px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <img
                  src="/clock-icon.svg"
                  alt="Clock Icon"
                  style={{ width: '18px', height: '18px' }}
                />
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#AFAFAF',
                    letterSpacing: '-0.5px',
                  }}
                >
                  영업시간
                </p>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#9562FB',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {placeData.time && placeData.time.startsWith('월')
                    ? todayEntry
                      ? todayEntry.hours
                      : '운영 정보 없음'
                    : '상세보기'}
                </p>
              </div>
              <button
                style={{
                  backgroundColor: '#61C56C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: placeData.phoneNumber ? 'pointer' : 'default',
                  width: '92px',
                  height: '44px',
                }}
                onClick={() => {
                  if (placeData.phoneNumber) {
                    window.location.href = `tel:${placeData.phoneNumber}`
                  }
                }}
                disabled={!placeData.phoneNumber}
              >
                <img
                  src="/call.svg"
                  alt="Call Icon"
                  style={{ width: '36px', height: '36px' }}
                />
              </button>
            </div>
          </div>
        )}

        {/* Middle & Expanded 상태 */}
        {['middle', 'expanded'].includes(bottomSheetState) && (
          <>
            <div className={styles['image-gallery']}>
              <div className={styles['gallery-large']}>
                <img
                  src={placeData.pictures[0]}
                  alt="Large Gallery"
                  className={styles['gallery-image']}
                />
              </div>

              <div className={styles['gallery-small-container']}>
                {placeData.pictures.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className={styles['gallery-small']}
                    style={{ position: 'relative' }}
                  >
                    <img
                      src={image}
                      alt={`Small Gallery ${index}`}
                      className={styles['gallery-image']}
                      style={{
                        filter: index === 3 ? 'brightness(35%)' : 'none',
                      }}
                    />
                    {index === 3 && (
                      <div className={styles['more-overlay']}>
                        <img
                          src="/photo_library.svg"
                          alt="Photo Library Icon"
                          className={styles['photo-icon']}
                        />
                        +{placeData.pictures.length - 5}
                      </div>
                    )}
                  </div>
                ))}

                {/* 채워지지 않은 자리에 no_image.png 추가 */}
                {placeData.pictures.length < 5 &&
                  Array.from({ length: 5 - placeData.pictures.length }).map(
                    (_, index) => (
                      <div
                        key={index + placeData.pictures.length}
                        className={styles['gallery-small']}
                        style={{ position: 'relative' }}
                      >
                        <img
                          src="/no_image.png"
                          alt={`No Image ${index}`}
                          className={styles['gallery-image']}
                        />
                      </div>
                    ),
                  )}
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{placeData.name}</h3>
                  <div className={styles.likes}>
                    <div
                      className={`${styles.likeBackground} ${liked ? styles.liked : ''}`}
                      onClick={handleLikeButtonClick}
                    >
                      <div className={styles.likeIcon}></div>
                    </div>
                    <span>{likeCount}명</span>
                  </div>
                </div>

                <div className={styles.tags}>
                  {activeFilters.map((filter, index) => (
                    <span key={index} className={styles.tag}>
                      {filter}
                    </span>
                  ))}
                </div>

                <div className={styles.description}>{placeData.word}</div>
                <div className={styles.tabContainer}>
                  {['상세', '사진'].map((tab) => (
                    <div
                      key={tab}
                      className={`${styles.tab} ${activeTab === tab ? styles.selected : ''}`}
                      onClick={() => setActiveTab(tab as '상세' | '사진')}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.tabContent}>
              {activeTab === '상세' && (
                <>
                  <div
                    className={styles.cardContainer}
                    style={{ marginBottom: '10px' }}
                  >
                    <StoreInfoComponent selectedPlace={placeData} />
                    {/* <div style={{ marginTop: '40px' }}>
                      <SectionTitle title="인기 메뉴" />
                    </div> 
                    <Menu selectedPlace={placeData} /> */}
                    <div style={{ marginTop: '20px' }}>
                      <SectionTitle title="방문자 사진" />
                    </div>
                    <VisitorPhoto selectedPlace={placeData.pictures} />
                  </div>
                </>
              )}
              {/* {activeTab === '메뉴' && <Menu selectedPlace={placeData} />} */}
              {activeTab === '사진' && (
                <VisitorPhoto selectedPlace={placeData.pictures} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PlaceDetail
