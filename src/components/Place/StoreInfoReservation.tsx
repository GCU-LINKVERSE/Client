'use client'

import React, { useState } from 'react'
import KakaoMap from '@/components/Map/KakaoMap' // KakaoMap 컴포넌트 임포트
import { Place } from '@/types/place'
import useTimeParser from "@/hooks/useTimeParser"

const StoreInfo = ({ selectedPlace }: { selectedPlace: Place }) => {
  const { todayEntry, otherEntries } = useTimeParser(selectedPlace?.time)
  const [activeDropdown, setActiveDropdown] = useState<
    'time' | 'capacity' | null
  >(null) 

  if (!selectedPlace) {
    return null 
  }

  const toggleDropdown = (dropdown: 'time' | 'capacity') => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  return (
    <div>
      {/* 상단 정보 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 32px 20px 50px',
        }}
      >
        {/* 영업 시간 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src="/clock-icon.svg"
            alt="Clock Icon"
            style={{ width: '28px', height: '28px', marginBottom: '4px' }}
          />
          <p style={{ fontSize: '12px', color: '#8E8D8D', margin: 0 }}>
            영업 시간
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexDirection: 'column',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#9562FB',
                margin: 0,
              }}
            >
              {selectedPlace.time && !selectedPlace.time.startsWith('월') ? (
                '상세보기'
              ) : (
                todayEntry ? todayEntry.hours : '운영 정보 없음'
              )}
            </p>
            <img
              src={
                activeDropdown === 'time'
                  ? '/drop-down-button.svg'
                  : '/drop-button.svg'
              }
              alt="Drop Button"
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              onClick={() => toggleDropdown('time')}
            />
          </div>
        </div>

        {/* 최대 인원 */}
        {/* <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src="/people.svg"
            alt="People Icon"
            style={{ width: '28px', height: '28px', marginBottom: '4px' }}
          />
          <p style={{ fontSize: '12px', color: '#8E8D8D', margin: 0 }}>
            최대 인원
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexDirection: 'column',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#9562FB',
                margin: 0,
              }}
            >
              12명
            </p>
            <img
              src={
                activeDropdown === 'capacity'
                  ? '/drop-down-button.svg'
                  : '/drop-button.svg'
              }
              alt="Drop Button"
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              onClick={() => toggleDropdown('capacity')}
            />
          </div>
        </div> */}

        {/* 예약하기 버튼 */}
        <button
          style={{
            backgroundColor: '#49C657',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '24px',
            padding: '16px 64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            width: '60%',
            height: '60px',
          }}
          onClick={() => {
            if (selectedPlace.phoneNumber) {
              window.location.href = `${selectedPlace.phoneNumber}`;
            }
          }}
          disabled={!selectedPlace.phoneNumber} 
        >
          <img
            src="/reservation.svg"
            alt="Reservation Icon"
            style={{ width: '24px', height: '24px' }} // 아이콘 크기를 적절히 줄임
          />
          <span
            style={{
              color: '#FFFFFF',
              textAlign: 'center',
              fontFamily: 'Pretendard',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '17px', // 비율 유지
              letterSpacing: '-0.5px',
              whiteSpace: 'nowrap',
            }}
          >
            예약하기
          </span>
        </button>
      </div>

      {/* 영업 시간 드롭다운 */}
      {activeDropdown === 'time' && (
        <div
          style={{
            display: 'flex',
            width: '393px',
            padding: '16px 32px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '17px',
            letterSpacing: '-0.5px',
            marginBottom: '8px',
          }}
        >
         {/* "월"로 시작하지 않으면 "상세보기" 출력 */}
         {selectedPlace.time && !selectedPlace.time.startsWith('월') ? (
            <>
              <p>
                {selectedPlace.time.split('\n').map((line, index) => (
                  <div key={index} style={{ lineHeight: '20 px', fontWeight: 'normal' , fontFamily: 'Pretendard, sans-serif' }}>
                    {line}
                  </div>
                ))}
              </p>
            </>
          ) : (
            <>
              {todayEntry ? (
                <p>
                  {todayEntry.day}({new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}) {todayEntry.hours}
                </p>
              ) : (
                <p style={{ fontWeight: 'bold', color: '#FF0000' }}>오늘 운영 정보 없음</p>
              )}
              {otherEntries.map((entry) => (
                <p key={entry.day} style={{ color: '#AFAFAF' }}>
                  {entry.day} {entry.hours}
                </p>
              ))}
            </>
          )}
        </div>
      )}

      {/* 지도 */}
      <div>
        {/* 지도 영역 */}
        <div
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#F5F6F8',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginTop: '16px',
            marginLeft: '32px',
            marginRight: '32px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '200px', // 지도의 높이를 조정
              position: 'relative',
            }}
          >
            {/* KakaoMap 컴포넌트 삽입 */}
            <KakaoMap selectedPlace={selectedPlace} />
          </div>
          {/* 하단 텍스트 영역 */}
          <div
            style={{
              padding: '12px 5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E6E6E6',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#AFAFAF',
                margin: 0,
              }}
            >
              {selectedPlace.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreInfo
