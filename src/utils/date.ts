const MS_PER_DAY = 24 * 60 * 60 * 1000

export const toDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const todayString = (): string => toDateString(new Date())

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(`${dateStr}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

export const diffDays = (fromDate: string, toDate = todayString()): number => {
  const from = new Date(`${fromDate}T00:00:00`).getTime()
  const to = new Date(`${toDate}T00:00:00`).getTime()
  return Math.round((to - from) / MS_PER_DAY)
}

export const compareDate = (a: string, b: string): number => {
  if (a === b) return 0
  return a > b ? 1 : -1
}

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '未记录'
  const parts = dateStr.split('-')
  return `${Number(parts[1])}月${Number(parts[2])}日`
}

export const getWeekDays = (base = new Date()) => {
  const current = new Date(base)
  const day = current.getDay()
  const offset = day === 0 ? -6 : 1 - day
  current.setDate(current.getDate() + offset)

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(current)
    date.setDate(current.getDate() + index)
    return {
      date: toDateString(date),
      day: date.getDate(),
      week: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
    }
  })
}

export const getMonthGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = []

  const prevLastDay = new Date(year, month - 1, 0).getDate()
  for (let index = startWeek - 1; index >= 0; index -= 1) {
    const date = new Date(year, month - 2, prevLastDay - index)
    days.push({ date: toDateString(date), day: date.getDate(), isCurrentMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month - 1, day)
    days.push({ date: toDateString(date), day, isCurrentMonth: true })
  }

  while (days.length % 7 !== 0) {
    const offset = days.length - startWeek - daysInMonth + 1
    const date = new Date(year, month, offset)
    days.push({ date: toDateString(date), day: date.getDate(), isCurrentMonth: false })
  }

  return days
}
