'use client'

import {
  type DateRange,
  DayPicker,
  type SelectMultipleEventHandler,
  type SelectRangeEventHandler,
  type SelectSingleEventHandler,
} from 'react-day-picker'
import { useState, useCallback, useEffect, useMemo } from 'react'
import '../../styles/CustomCalendarStyle.css'
import { ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { isBefore } from 'date-fns' // 날짜 비교를 위한 date-fns 라이브러리 사용

type Mode = 'range' | 'multiple' | 'single'

interface CustomCalendarProps {
  initialMode?: Mode
  selected?: DateRange | Date[] | Date
  onSelect?: (date: DateRange | Date[] | Date | undefined) => void
}

export default function CustomCalendar({
  initialMode = 'range',
  selected,
  onSelect,
}: CustomCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date())
  const [mode, setMode] = useState<Mode>(initialMode)
  const [selectedWeekdaysByMonth, setSelectedWeekdaysByMonth] = useState<
    Record<string, number[]>
  >({})
  const [rangeSelection, setRangeSelection] = useState<DateRange | undefined>()
  const [hasNewSelection, setHasNewSelection] = useState(false)

  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const getMonthKey = useCallback((date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}`
  }, [])

  const getDatesByWeekdays = useCallback(
    (weekdays: number[], month: Date) => {
      const dates: Date[] = []
      const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
      const lastDayOfMonth = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
      )

      for (
        let day = new Date(firstDayOfMonth);
        day <= lastDayOfMonth;
        day.setDate(day.getDate() + 1)
      ) {
        if (weekdays.includes(day.getDay()) && !isBefore(day, today)) {
          dates.push(new Date(day))
        }
      }
      return dates
    },
    [today],
  )

  const handleWeekdayClick = useCallback(
    (weekday: number) => {
      setHasNewSelection(true)
      const monthKey = getMonthKey(month)
      // console.log(monthKey)
      setSelectedWeekdaysByMonth((prev) => {
        const currentMonthWeekdays = prev[monthKey] || []
        let newWeekdays: number[]

        if (currentMonthWeekdays.includes(weekday)) {
          // 이미 선택된 요일을 클릭한 경우 제거
          newWeekdays = currentMonthWeekdays.filter((day) => day !== weekday)
        } else {
          // 새로운 요일을 선택한 경우 추가
          newWeekdays = [...currentMonthWeekdays, weekday]
        }

        const newSelectedWeekdaysByMonth = {
          [monthKey]: newWeekdays,
        }

        if (newWeekdays.length > 0) {
          // 요일이 하나라도 선택된 경우
          setMode('multiple')
          const dates = getDatesByWeekdays(newWeekdays, month)
          // console.log('dates', dates)
          onSelect?.(dates)
        } else {
          // 모든 요일 선택이 해제된 경우
          setMode('range')
          onSelect?.({ from: undefined, to: undefined })
        }

        return newSelectedWeekdaysByMonth
      })
    },
    [month, getMonthKey, getDatesByWeekdays, onSelect],
  )

  const handleMonthChange = useCallback(
    (newMonth: Date) => {
      setMonth(newMonth)
      // console.log('swdbm', selectedWeekdaysByMonth)
      if (mode === 'multiple') {
        if (hasNewSelection) {
          // Reset weekday selections when changing months after a new selection
          setSelectedWeekdaysByMonth({})
          setMode('range')
          onSelect?.({ from: undefined, to: undefined })
          setHasNewSelection(false)
        }
      }
    },
    [hasNewSelection, mode, onSelect],
  )

  const handleDayClick = useCallback(
    (day: Date) => {
      if (mode === 'multiple') {
        setHasNewSelection(true)
        setMode('range')
        const monthKey = getMonthKey(day)
        setSelectedWeekdaysByMonth((prev) => ({ ...prev, [monthKey]: [] }))
        onSelect?.({ from: day, to: undefined })
      }
    },
    [mode, getMonthKey, onSelect],
  )

  const handleRangeSelect: SelectRangeEventHandler = (range) => {
    if (mode === 'range') {
      setRangeSelection(range)
      if (!range || !range.from) {
        // ✅ 범위가 유효하지 않을 경우 초기화
        onSelect?.({ from: undefined, to: undefined })
      } else {
        onSelect?.(range)
      }
    }
  }

  const handleMultipleSelect: SelectMultipleEventHandler = (dates) => {
    if (mode === 'multiple') {
      if (!Array.isArray(dates)) {
        // ✅ 배열이 아닐 경우 빈 배열을 전달하여 안전하게 처리
        onSelect?.([])
      } else {
        onSelect?.(dates)
      }
    }
  }

  const handleSingleSelect: SelectSingleEventHandler = (date) => {
    if (mode === 'single') {
      onSelect?.(date)
    }
  }

  useEffect(() => {
    if (selected && 'from' in selected) {
      setRangeSelection(selected)
    }
  }, [selected])

  const commonProps = {
    month,
    onMonthChange: handleMonthChange,
    showOutsideDays: false,
    onDayClick: handleDayClick,
    disabled: (date: Date) => isBefore(date, today), // 오늘 이전 날짜를 비활성화
    modifiers: {
      firstWeekday: (date: Date) => {
        // 요일별 첫번째 날짜 찾기
        const monthKey = getMonthKey(date)
        const selectedWeekdays = selectedWeekdaysByMonth[monthKey] || []
        const weekdayToFirstDateMap = selectedWeekdays.reduce(
          (acc, weekday) => {
            const dates = getDatesByWeekdays([weekday], date)
            if (dates.length > 0) {
              acc[weekday] = dates[0].getTime() // 요일별 첫 번째 날짜
            }
            return acc
          },
          {} as Record<number, number>,
        )
        return Object.values(weekdayToFirstDateMap).includes(date.getTime())
      },
      lastWeekday: (date: Date) => {
        // 요일별 마지막 날짜 찾기
        const monthKey = getMonthKey(date)
        const selectedWeekdays = selectedWeekdaysByMonth[monthKey] || []
        const weekdayToLastDateMap = selectedWeekdays.reduce(
          (acc, weekday) => {
            const dates = getDatesByWeekdays([weekday], date)
            if (dates.length > 0) {
              acc[weekday] = dates[dates.length - 1].getTime() // 요일별 마지막 날짜
            }
            return acc
          },
          {} as Record<number, number>,
        )
        return Object.values(weekdayToLastDateMap).includes(date.getTime())
      },
      oneWeekday: (date: Date) => {
        // 특정 요일이 해당 월에서 단 하루만 존재하는 경우 찾기
        const monthKey = getMonthKey(date)
        const selectedWeekdays = selectedWeekdaysByMonth[monthKey] || []
        const weekdayCountMap = selectedWeekdays.reduce(
          (acc, weekday) => {
            const dates = getDatesByWeekdays([weekday], date)
            if (dates.length === 1) {
              acc[weekday] = dates[0].getTime() // 유일한 날짜 저장
            }
            return acc
          },
          {} as Record<number, number>,
        )
        return Object.values(weekdayCountMap).includes(date.getTime())
      },
    },
    modifiersClassNames: {
      firstWeekday: 'weekday-first',
      lastWeekday: 'weekday-last',
      oneWeekday: 'weekday-one',
    },
    classNames: {
      months: 'calendar-months',
      month: 'calendar-month',
      caption: 'calendar-caption',
      caption_label: 'calendar-caption-label',
      nav: 'calendar-nav',
      nav_button: 'calendar-nav-button',
      nav_button_previous: 'calendar-nav-button-prev',
      nav_button_next: 'calendar-nav-button-next',
      table: 'calendar-table',
      head_row: 'calendar-head-row',
      head_cell: 'calendar-head-cell',
      row: 'calendar-row',
      cell: 'calendar-cell',
      day: 'calendar-day',
      day_selected: 'calendar-day-selected',
      day_today: 'calendar-day-today',
      day_outside: 'calendar-day-outside',
      day_range_start: 'calendar-day-range-start',
      day_range_middle: 'calendar-day-range-middle',
      day_range_end: 'calendar-day-range-end',
      day_disabled: 'calendar-day-disabled', // 비활성화된 날짜의 클래스
    },
    components: {
      Caption: ({ displayMonth }: { displayMonth: Date }) => (
        <div className="flex items-center px-1 py-3 gap-2">
          <span className="text-xl font-semibold">
            {displayMonth.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <div className="flex gap-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleMonthChange(
                  new Date(
                    displayMonth.getFullYear(),
                    displayMonth.getMonth() - 1,
                  ),
                )
              }}
              className="text-[#3b82f6] hover:text-blue-700 w-6"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleMonthChange(
                  new Date(
                    displayMonth.getFullYear(),
                    displayMonth.getMonth() + 1,
                  ),
                )
              }}
              className="text-[#3b82f6] hover:text-blue-700 w-6"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      ),
      Head: () => {
        const monthKey = getMonthKey(month)
        const selectedWeekdays = selectedWeekdaysByMonth[monthKey] || []
        return (
          <thead>
            <tr className="calendar-head-row">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                (day, index) => (
                  <th
                    key={index}
                    className={`calendar-head-cell cursor-pointer ${
                      selectedWeekdays.includes(index) ? 'text-[#9562fa]' : ''
                    }`}
                    onClick={() => handleWeekdayClick(index)}
                  >
                    {day}
                  </th>
                ),
              )}
            </tr>
          </thead>
        )
      },
    },
  }

  return (
    <div data-mode={mode}>
      {mode === 'range' && (
        <DayPicker
          mode="range"
          selected={rangeSelection}
          onSelect={handleRangeSelect}
          {...commonProps}
        />
      )}
      {mode === 'multiple' && (
        <DayPicker
          mode="multiple"
          selected={Array.isArray(selected) ? (selected as Date[]) : undefined}
          onSelect={handleMultipleSelect}
          {...commonProps}
        />
      )}
      {mode === 'single' && (
        <DayPicker
          mode="single"
          selected={selected instanceof Date ? selected : undefined}
          onSelect={handleSingleSelect}
          {...commonProps}
        />
      )}
    </div>
  )
}
