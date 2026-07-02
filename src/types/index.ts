export type PetCategory = '蛇' | '蜥蜴' | '守宫' | '龟' | '蜘蛛' | '其他'
export type PetSex = '公' | '母' | '未知'
export type HealthStatus = '健康' | '待观察' | '异常'
export type FeedingStatus = '今日待喂' | '今日已喂' | '未到时间' | '已逾期'
export type Appetite = '正常' | '减弱' | '拒食'
export type Activity = '活跃' | '正常' | '少动'
export type ShedStatus = '是' | '否'

export interface Pet {
  id: string
  name: string
  category: PetCategory
  sex: PetSex
  species: string
  morph: string
  purchaseDate: string
  birthDate: string
  feedingCycleDays: number
  lastFeedingDate: string
  nextFeedingDate: string
  healthStatus: HealthStatus
  cabinetId: string
  cabinetSlotId: string
  notes: string
  photoUrl: string
  createdAt: string
  updatedAt: string
}

export interface CabinetSlot {
  id: string
  name: string
  notes: string
}

export interface ReptileCabinet {
  id: string
  name: string
  slots: CabinetSlot[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface FeedingRecord {
  id: string
  petId: string
  feedingDate: string
  foodType: string
  foodAmount: number | ''
  notes: string
  createdAt: string
}

export interface HealthRecord {
  id: string
  petId: string
  recordDate: string
  weight: number | ''
  shedStatus: ShedStatus
  appetite: Appetite
  activity: Activity
  healthStatus: HealthStatus
  notes: string
  createdAt: string
}

export interface UserSettings {
  feedingReminderEnabled: boolean
  reminderTime: string
  overdueReminderEnabled: boolean
  advanceReminderEnabled: boolean
  defaultFeedingCycleDays: number
}

export interface CalendarMark {
  petId: string
  petName: string
  category: PetCategory
  status: '已喂' | '应喂' | '逾期'
}
