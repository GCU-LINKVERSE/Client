'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KakaoMap from '@/components/Map/KakaoMap'
import Navbar from '@/components/Navigate/NavBar'
import styles from '@/app/place/styles/Home.module.css'
import { fetchLikedStates } from '@/services/place'
import { fetchUserInformation } from '@/services/place'
import { toggleLike } from '@/services/place'
import { fetchLikeCount } from '@/services/place'
import { CardData } from '@/types/card'
import { Place } from '@/types/place'
import { CategoryPerData } from '@/types/categoryPerData'
import { fetchCategoryData } from '@/services/place'
import { fetchFilteredCategoryData } from '@/services/place'
import { fetchFilters } from '@/services/place'


const tabs = [
  { id: 'food', label: '음식점' },
  { id: 'cafe', label: '카페' },
  { id: 'play', label: '놀이' },
  { id: 'campus', label: '캠퍼스' },
]

export default function Home() {
  const [selectedPlace] = useState<Place | undefined>(undefined);
  const [bottomSheetState, setBottomSheetState] = useState<
    'collapsed' | 'middle' | 'expanded'
  >('collapsed')
  const [filters, setFilters] = useState<CategoryPerData[]>([]) // 필터 데이터를 저장
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].id)
  const startY = useRef<number | null>(null)
  const threshold = 50
  const router = useRouter()
  const mapRef = useRef<() => void | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [cardData, setCardData] = useState<CardData[]>([]) // 카드 데이터를 저장
  const [userName, setUserName] = useState('')
  const isDraggingRef = useRef<boolean>(false)
  const [page, setPage] = useState(0); 
  const [loading, setLoading] = useState(false); 
  const bottomSheetRef = useRef<HTMLDivElement | null>(null); 

  const loadMoreData = async (forcePage?: number) => {
    if (loading) return; 
    setLoading(true);
  
    try {
      const categoryIndex = tabs.findIndex((tab) => tab.id === selectedTab);
      if (categoryIndex === -1) return;
  
      const newPage = forcePage !== undefined ? forcePage : page + 1;
  
      const newData = await fetchCategoryData(categoryIndex, newPage);
  
      if (!newData || newData.length === 0) {
        return;
      }
  
      setCardData((prev) => {
        const existingIds = new Set(prev.map((card) => card.id));
        const filteredNewData = newData.filter((card) => !existingIds.has(card.id));
        return [...prev, ...filteredNewData];
      });
  
      setPage(newPage); 
    } catch (error) {
      console.error("Error fetching more data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 0) return; 
    loadMoreData(page);
  }, [page]); 
  
  
  const handleScroll = () => {
    if (loading) return;
  
    const bottomSheet = bottomSheetRef.current;
    if (!bottomSheet) return;
  
    const { scrollTop, scrollHeight, clientHeight } = bottomSheet;
  
    if ((bottomSheetState === "expanded" || bottomSheetState === "middle") && scrollTop + clientHeight >= scrollHeight * 0.9) {  
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const bottomSheet = bottomSheetRef.current;
    if (!bottomSheet) return;
  
    bottomSheet.addEventListener("scroll", handleScroll);
    return () => bottomSheet.removeEventListener("scroll", handleScroll);
  }, [bottomSheetState]);

  useEffect(() => {
    handleTabClick(selectedTab);
  }, [selectedTab]);


  const handleCardClick = (placeId: number) => {
    router.push(`/place/${placeId}`); 
  };

  const handleLikeButtonClick = async (placeId: number, liked: boolean | undefined) => {
    try {
      const updatedLiked = await toggleLike(placeId, liked ?? false)

      const updatedLikesCount = await fetchLikeCount(placeId)

      setCardData((prev) =>
        prev.map((card) =>
          card.id === placeId
            ? { ...card, liked: updatedLiked, likes: updatedLikesCount }
            : card,
        ),
      )
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  useEffect(() => {
    const loadUserInformation = async () => {
      const userInfo = await fetchUserInformation()
      if (userInfo) {
        console.log('User Information:', userInfo)
        setUserName(userInfo.data?.userNickname || '알 수 없는 사용자')
      } else {
        console.warn('Failed to load user information.')
      }
    }

    loadUserInformation()
  }, [])

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  const getDayOfWeek = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date().getDay()];
  };
  
  const parseTime = (time: string | undefined) => {
    if (!time || typeof time !== 'string') return '운영 정보 없음';
  
    const today = getDayOfWeek();
    const validDays = ['월', '화', '수', '목', '금', '토', '일'];

    if (!time.startsWith('월')) {
      return '상세보기'; 
    }
  
  
    const timeEntries = time
      .split('\n')
      .map((entry) => {
        const parts = entry.trim().split(' '); 
        if (parts.length < 2 || !validDays.includes(parts[0])) return null;
        return { day: parts[0], hours: parts.slice(1).join(' ') };
      })
      .filter(Boolean) as { day: string; hours: string }[];
  
    const todayEntry = timeEntries.find((entry) => entry.day === today);
    return todayEntry ? todayEntry.hours : '운영 정보 없음';
  };

  const fetchCategoryDataWithFilters = async (categoryIndex: number, selectedFilters: string[], page: number) => {
    try {
      const filters = getCurrentTabFilters().reduce<Record<string, boolean>>(
        (acc, filter, index) => {
          const filterKey = `filter${index + 1}`;
          acc[filterKey] = selectedFilters.includes(filter);
          return acc;
        },
        {}
      );
      const data = await fetchFilteredCategoryData(categoryIndex, page, filters);
  
      return data.length ? data : [];
    } catch (error) {
      console.log('error :',error)
      return [];
    }
  };
  
  
  const updateCardData = async (data: CardData[]) => {
    return await Promise.all(
      data.map(async (card) => {
        const liked = await fetchLikedStates(card.id.toString());
  
        const filters = Object.entries(card)
          .filter(([key]) => key.startsWith("filter"))
          .reduce<Record<string, boolean>>((acc, [key, value]) => {
            if (typeof value === "boolean") acc[key] = value; 
            return acc;
          }, {});
  
        return {
          ...card,
          filters, 
          liked,
        };
      })
    );
  };
  
  const handleTabClick = async (tabId: string) => {
    setSelectedTab(tabId);
    setSelectedFilters([]); 
  
    const categoryIndex = tabs.findIndex((tab) => tab.id === tabId);
    if (categoryIndex === -1) {
      console.warn('Invalid tabId provided:', tabId);
      return;
    }
  
    try {  
      const data = await fetchCategoryData(categoryIndex, 0);
      const updatedData = await updateCardData(data);
      setCardData(updatedData);
      setPage(1);
    } catch (error) {
      console.error('Error updating card data:', error);
    }
  };
  
  const handleFilterButtonClick = (filter: string) => {
    setSelectedFilters((prevSelected) => {
      const updatedFilters = prevSelected.includes(filter)
        ? prevSelected.filter((item) => item !== filter)
        : [...prevSelected, filter];
  
      const categoryIndex = tabs.findIndex((tab) => tab.id === selectedTab);
      if (categoryIndex !== -1) {
        setPage(0); 
        setCardData([]);
  
        if (updatedFilters.length > 0) {
          fetchCategoryDataWithFilters(categoryIndex, updatedFilters, 0).then((data) => {
            updateCardData(data).then(setCardData);
          });
        } else {
          fetchCategoryData(categoryIndex, 0).then((data) => {
            updateCardData(data).then(setCardData);
          });
        }
      }
  
      return updatedFilters;
    });
  };
  

  useEffect(() => {
    handleTabClick(selectedTab);
  }, [selectedTab]);

  const handleVectorButtonClick = () => {
    if (mapRef.current) {
      mapRef.current() 
    }
  }

  const handleSearchClick = () => {
    router.push('/search?from=/place')
  }

  // 드래그 시작
  const handleStart = (y: number) => {
    startY.current = y
    isDraggingRef.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
  }

  const handleMove = (y: number) => {
    if (!isDraggingRef.current || startY.current === null) return
    const deltaY = startY.current - y

    if (deltaY > threshold && bottomSheetState === 'collapsed') {
      setBottomSheetState('middle')
      startY.current = y 
    } else if (deltaY > threshold && bottomSheetState === 'middle') {
      setBottomSheetState('expanded')
      startY.current = y
    } else if (deltaY < -threshold && bottomSheetState === 'expanded') {
      setBottomSheetState('middle')
      startY.current = y 
    } else if (deltaY < -threshold && bottomSheetState === 'middle') {
      setBottomSheetState('collapsed')
      startY.current = y 
    }

    const handleElement = document.querySelector(`.${styles.dragHandle}`);
      if (handleElement) {
        const handleRect = handleElement.getBoundingClientRect();
        if (handleRect.bottom >= window.innerHeight) {
          console.log('📌 드래그 핸들이 화면 아래 닿음!');
          // 필요한 동작 수행 (예: 특정 이벤트 트리거)
        }
      }
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientY)
  }

  const handleEnd = () => {
    startY.current = null
    isDraggingRef.current = false

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleEnd)
  }

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const { success, data } = await fetchFilters(); 
  
        if (success && Array.isArray(data)) {
          setFilters(data); 
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
  
    loadFilters(); 
  }, []);

  const getCurrentTabFilters = () => {
    const currentCategory = tabs.find((tab) => tab.id === selectedTab)?.label
    const categoryFilters = filters.find(
      (filter) => filter.category === currentCategory,
    )

    if (!categoryFilters || !categoryFilters.filters) {
      return []
    }

    console.log("categoryFilters :",categoryFilters)

    return Object.values(categoryFilters.filters) 
  }

  const getCardFiltersWithNames = (
    cardData: CardData, // 카드 데이터 전체
    currentFilters: string[], // 현재 탭의 필터 이름 배열
  ) => {
    // 1. `filter1`, `filter2` 등 필터 관련 키만 추출
    const trueFilters = Object.entries(cardData)
      .filter(([key, value]) => key.startsWith('filter') && value === true) // "filterX" && true인 경우
      .map(([key]) => key) // 필터 키 이름 ("filter1", "filter2")

    // 2. 필터 이름 매칭
    const filterNames = trueFilters.map((filterKey) => {
      const index = parseInt(filterKey.replace('filter', ''), 10) - 1 // filter1 → 0
      return currentFilters[index] // 현재 탭 필터 이름과 매칭
    })

    return filterNames.filter(Boolean) // undefined 제거
  }

  return (
    <div className={styles['mobile-container']}>
      <Navbar activeTab="플레이스" />
      <div className={styles['search-container']}>
        <div
          className={styles['search-bar']}
          onClick={handleSearchClick}
          style={{ cursor: 'pointer' }}
        >
          <img
            src="/search.svg"
            alt="search"
            className={styles['search-icon']}
          />
          <input type="text" placeholder="원하는 곳을 검색해봐요!" readOnly />
        </div>
        <button
          className={styles['vector-button']}
          onClick={handleVectorButtonClick}
        >
          <img
            src="/vector.svg"
            alt="vector"
            className={styles['vector-icon']}
          />
        </button>
      </div>
      <KakaoMap
        selectedPlace={selectedPlace ?? undefined}
        onMoveToCurrentLocation={(moveToCurrentLocation) =>
          (mapRef.current = moveToCurrentLocation)
        }
      />

      {/* Tabs */}
      <div className={`${styles.tabs} ${styles[bottomSheetState]}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${
              selectedTab === tab.id ? styles.selectedTab : ''
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bottom Sheet */}
      <div
        ref={bottomSheetRef}
        className={`${styles.bottomSheet} ${styles[bottomSheetState]}`}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientY)}
      >
        <div className={styles.dragHandle}></div>
        <div className={styles.content}>
          {/* Dynamic Buttons */}
          <div className={styles.buttonsContainer}>
            {getCurrentTabFilters().map((filter, index) => (
              <button
                key={index}
                className={`${styles.actionButton} ${
                  selectedFilters.includes(filter) ? styles.selected : ''
                }`}
                onClick={() => handleFilterButtonClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className={styles.moimPickContainer}>
            <span className={styles.moimPickText}>MOIM-Pick</span>
            <div className={styles.moimPickLine}></div>
          </div>
          <div className={styles.moimPickSubText}>
            <span className={styles.highlight}>{userName}</span>님을 위해
            선배들이 픽 했어요!
          </div>
          <div className={styles.content}>
            {cardData.map((card, index) => (
              <div key={`${card.id}-${index}`} className={styles.card} onClick={() => handleCardClick(card.id)}>
                <div className={styles.cardImage}>
                  {card.pictures?.[0] ? (
                    <img
                      src={card.pictures[0] || '/no_image.png'}
                      alt={card.name || '카드 이미지'}
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="/no_image.png"
                      alt={card.name || '기본 이미지'}
                      className={styles.cardImage} 
                    />
                  )}
                </div>
                {/* 카드 내용 */}
                <div className={styles.cardContent}>
                  {/* 카드 헤더 */}
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      {truncateText(card.name || '제목 없음', 25)}{' '}
                      {/* 가게명 말줄임표 */}
                    </h3>
                    <div className={styles.likes}>
                      <div
                        className={`${styles.likeBackground} ${card.liked ? styles.liked : ''}`}
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleLikeButtonClick(card.id, card.liked)
                        }}
                      >
                        <div className={styles.likeIcon}></div>
                      </div>
                      <span>{card.likes || 0}명</span> {/* 좋아요 숫자 */}
                    </div>
                  </div>

                  {/* 태그 (true 값만 렌더링) */}
                  <div className={styles.tags}>
                    {getCardFiltersWithNames(card, getCurrentTabFilters()).map(
                      (filterName, index) => (
                        <span key={index} className={styles.tag}>
                          {filterName}
                        </span>
                      ),
                    )}
                  </div>

                  {/* 설명 */}
                  <div className={styles.description}>
                    {truncateText(card.word || '설명이 없습니다.', 40)}{' '}
                    {/* 줄당 20글자, 최대 2줄 */}
                  </div>

                  {/* 운영 시간 */}
                  <div className={styles.footer}>
                    <img
                      src="/clock-icon.svg"
                      alt="시계 아이콘"
                      className={styles.clockIcon}
                    />
                    <span>영업시간 {parseTime(card.time)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.bottomSheetLine}></div>
        </div>
      </div>
    </div>
  )
}
