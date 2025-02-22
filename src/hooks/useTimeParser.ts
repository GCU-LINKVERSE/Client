import { useMemo } from 'react'

interface TimeEntry {
  day: string
  hours: string
}

interface ParsedTimeData {
  todayEntry: TimeEntry | null
  otherEntries: TimeEntry[]
}

const useTimeParser = (time: string | undefined): ParsedTimeData => {
  const getDayOfWeek = (): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return days[new Date().getDay()]
  }

  return useMemo(() => {
    if (!time || typeof time !== 'string')
      return { todayEntry: null, otherEntries: [] }

    const today = getDayOfWeek()
    const validDays = new Set(['월', '화', '수', '목', '금', '토', '일'])

    const timeEntries: TimeEntry[] = time
      .split('\n')
      .map((entry) => {
        const parts = entry.trim().split(' ')
        if (parts.length < 2 || !validDays.has(parts[0])) return null
        return { day: parts[0], hours: parts.slice(1).join(' ') }
      })
      .filter((entry): entry is TimeEntry => entry !== null)

    const todayEntry = timeEntries.find((entry) => entry.day === today) || null
    const otherEntries = timeEntries.filter((entry) => entry.day !== today)

    return { todayEntry, otherEntries }
  }, [time])
}

export default useTimeParser
