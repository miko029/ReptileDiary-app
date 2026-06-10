import type { FeedingRecord, FeedingStatus, Pet } from '@/types'
import { addDays, compareDate, todayString } from './date'

export const calculateNextFeedingDate = (lastFeedingDate: string, feedingCycleDays: number): string => {
  if (!lastFeedingDate || feedingCycleDays <= 0) return ''
  return addDays(lastFeedingDate, feedingCycleDays)
}

export const normalizePetSchedule = (pet: Pet): Pet => {
  const baseDate = pet.lastFeedingDate || pet.createdAt.slice(0, 10)
  const nextFeedingDate = pet.nextFeedingDate || calculateNextFeedingDate(baseDate, pet.feedingCycleDays)
  return { ...pet, nextFeedingDate }
}

export const hasFeedingOnDate = (records: FeedingRecord[], petId: string, date: string): boolean =>
  records.some(record => record.petId === petId && record.feedingDate === date)

export const getFeedingStatus = (pet: Pet, records: FeedingRecord[], date = todayString()): FeedingStatus => {
  if (hasFeedingOnDate(records, pet.id, date)) return '今日已喂'
  if (!pet.nextFeedingDate) return '未到时间'
  const comparison = compareDate(pet.nextFeedingDate, date)
  if (comparison === 0) return '今日待喂'
  if (comparison < 0) return '已逾期'
  return '未到时间'
}

export const getStatusClass = (status: FeedingStatus): string => {
  if (status === '今日已喂') return 'tag-green'
  if (status === '今日待喂') return 'tag-blue'
  if (status === '已逾期') return 'tag-red'
  return 'tag-gray'
}

export const isDueOrOverdue = (status: FeedingStatus): boolean =>
  status === '今日待喂' || status === '已逾期'
