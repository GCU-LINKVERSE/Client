'use client'

import { useState, useCallback } from 'react'
import { DateRange } from 'react-day-picker'
import { eachDayOfInterval, format } from 'date-fns'
import { useFormatDate } from './useFormatDate'

type DateInfo = [string, string] // [yyyy-MM-dd, day of week]
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

type UseHandleSelectReturn = {
  selectedDates: DateRange | Date[] | Date | undefined
  stringDates: DateInfo[]
  handleSelect: (selection: DateRange | Date[] | Date | undefined) => void
  mode: 'range' | 'week'
  selected: DayOfWeek[] | null
}

export function useHandleSelect(): UseHandleSelectReturn {
  const [selectedDates, setSelectedDates] = useState<
    DateRange | Date[] | Date | undefined
  >()
  const [stringDates, setStringDates] = useState<DateInfo[]>([])
  const [mode, setMode] = useState<'range' | 'week'>('range')
  const [selected, setSelected] = useState<DayOfWeek[] | null>([])
  const { formatDateToString } = useFormatDate()

  const formatDateInfo = useCallback(
    (date: Date): DateInfo => [
      formatDateToString(date),
      format(date, 'EEE').toLowerCase() as DayOfWeek,
    ],
    [formatDateToString],
  )

  const handleSelect = useCallback(
    (selection: DateRange | Date[] | Date | undefined) => {
      setTimeout(() => {
        setSelectedDates(selection)
        if (selection) {
          if (Array.isArray(selection)) {
            // multiple mode (week) 처리
            setMode('week')
            const formattedDates = selection.map(formatDateInfo)
            setStringDates(formattedDates)
            const selectedDays = Array.from(
              new Set(formattedDates.map(([, day]) => day)),
            ) as DayOfWeek[]
            setSelected(selectedDays)
            // console.log('[multiple] 선택된 날짜:', formattedDates)
            // console.log('[multiple] 선택된 요일:', selectedDays)
          } else if ('from' in selection && selection.from) {
            // range mode 처리
            setMode('range')
            setSelected(null)
            if (selection.to) {
              const dates = eachDayOfInterval({
                start: selection.from,
                end: selection.to,
              })
              const formattedDates = dates.map(formatDateInfo)
              setStringDates(formattedDates)
              // console.log('[range] 선택된 날짜:', formattedDates)
            } else {
              const startDayOnlyInfo = formatDateInfo(selection.from)
              setStringDates([startDayOnlyInfo])
              // console.log('[range] 첫 날짜만 선택:', startDayOnlyInfo)
            }
          } else if (selection instanceof Date) {
            // single 모드 처리
            setMode('range')
            setSelected(null)
            const formattedDate = formatDateInfo(selection)
            setStringDates([formattedDate])
            // console.log('[single] 선택된 날짜:', formattedDate)
          }
        } else {
          setStringDates([])
          setMode('range')
          setSelected([])
          // console.log('No date selected')
        }
      }, 0)
    },
    [formatDateInfo],
  )

  return { selectedDates, stringDates, handleSelect, mode, selected }
}
