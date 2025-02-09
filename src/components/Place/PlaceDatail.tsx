'use client'

import React from 'react'
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
import useTimeParser from '@/hooks/useTimeParser';


interface PlaceDetailProps {
  placeData: Place
}

const getStoreInfoComponent = (category: number, phoneNumber: string | null) => {
    if (category === 0 || category === 1 || category === 2) return StoreInfo
    if (category === 3) {
      return phoneNumber === null ? StoreInfoCampus : StoreInfoReservation
    }
    return StoreInfo
  }

const PlaceDetail = ({ placeData }: PlaceDetailProps) => {
  const { bottomSheetState, handleStart, handleMove, handleEnd, setBottomSheetState } = useBottomSheet()
  const { activeFilters } = usePlaceFilters(placeData)
  const { liked, likeCount, handleLikeButtonClick } = useLikeSystem(Number(placeData.id))
  const { handleBackClick, handleCloseClick } = useNavigation(setBottomSheetState)
  const StoreInfoComponent = getStoreInfoComponent(placeData.category, placeData.phoneNumber)
  const { todayEntry } = useTimeParser(placeData.time);

  return (
    <div className={styles['detail-container']}>
      <div className={`${styles['map-container']} ${styles[bottomSheetState]}`}>
        <KakaoMap bottomSheetState={bottomSheetState} selectedPlace={placeData} onMoveToCurrentLocation={() => {}} />
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
          <button className={styles['top-left-button']} onClick={handleBackClick}>
            <img src="/arrow_back_ios.svg" alt="뒤로가기" style={{ width: '28px', height: '28px' }} />
          </button>
          <button className={styles['top-right-button']} onClick={handleCloseClick}>
            <img src="/close_ios.svg" alt="닫기" style={{ width: '28px', height: '28px' }} />
          </button>
        </div>
      )}

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
                <div className={`${styles.likeBackground} ${liked ? styles.liked : ''}`} onClick={handleLikeButtonClick}>
                  <div className={styles.likeIcon}></div>
                </div>
                <span>{likeCount}명</span>
              </div>
            </div>

            <div className={styles.tags}>
              {activeFilters.map((filter, index) => (
                <span key={index} className={styles.tag}>{filter}</span>
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
                  {placeData.time && placeData.time.startsWith('월') ? (
                    todayEntry ? todayEntry.hours : '운영 정보 없음'
                  ) : (
                    '상세보기'
                  )}
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
                  cursor: 'pointer',
                  width: '92px',
                  height: '44px',
                }}
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
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{placeData.name}</h3>
                  <div className={styles.likes}>
                    <div className={`${styles.likeBackground} ${liked ? styles.liked : ''}`} onClick={handleLikeButtonClick}>
                      <div className={styles.likeIcon}></div>
                    </div>
                    <span>{likeCount}명</span>
                  </div>
                </div>

                <div className={styles.tags}>
                  {activeFilters.map((filter, index) => (
                    <span key={index} className={styles.tag}>{filter}</span>
                  ))}
                </div>

                <div className={styles.description}>{placeData.word}</div>
              </div>
            </div>

            <div className={styles.tabContent}>
              <StoreInfoComponent selectedPlace={placeData} />
              <div style={{ marginTop: '20px' }}>
                <SectionTitle title="방문자 사진" />
              </div>
              <VisitorPhoto selectedPlace={placeData.pictures} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PlaceDetail