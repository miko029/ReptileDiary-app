import type { FeedingRecord, HealthRecord, HealthStatus, Pet, ReptileCabinet, UserSettings } from '@/types'
import { calculateNextFeedingDate, normalizePetSchedule } from './feeding'
import { addDays, todayString } from './date'

const PETS_KEY = 'reptile_diary_pets'
const FEEDING_KEY = 'reptile_diary_feeding_records'
const HEALTH_KEY = 'reptile_diary_health_records'
const SETTINGS_KEY = 'reptile_diary_settings'
const CABINETS_KEY = 'reptile_diary_cabinets'

const nowIso = () => new Date().toISOString()
const id = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`

const read = <T>(key: string, fallback: T): T => {
  const value = uni.getStorageSync(key)
  return value || fallback
}

const write = <T>(key: string, value: T) => {
  uni.setStorageSync(key, value)
}

export const defaultSettings: UserSettings = {
  feedingReminderEnabled: true,
  reminderTime: '20:00',
  overdueReminderEnabled: true,
  advanceReminderEnabled: false,
  defaultFeedingCycleDays: 7,
}

export const ensureSeedData = () => {
  if (uni.getStorageSync(PETS_KEY)) return
  const today = todayString()
  const pets: Pet[] = [
    {
      id: 'pet_demo_1',
      name: '小栗',
      category: '守宫',
      sex: '母',
      species: '豹纹守宫',
      morph: 'Tremper Albino',
      purchaseDate: addDays(today, -70),
      birthDate: addDays(today, -260),
      feedingCycleDays: 3,
      lastFeedingDate: addDays(today, -3),
      nextFeedingDate: today,
      healthStatus: '健康',
      cabinetId: 'cabinet_demo_1',
      cabinetSlotId: 'slot_demo_1',
      notes: '食欲稳定，偏爱杜比亚。',
      photoUrl: '',
      createdAt: `${addDays(today, -70)}T10:00:00.000Z`,
      updatedAt: nowIso(),
    },
    {
      id: 'pet_demo_2',
      name: '青团',
      category: '蛇',
      sex: '未知',
      species: '玉米蛇',
      morph: 'Anery',
      purchaseDate: addDays(today, -130),
      birthDate: addDays(today, -420),
      feedingCycleDays: 7,
      lastFeedingDate: addDays(today, -9),
      nextFeedingDate: addDays(today, -2),
      healthStatus: '待观察',
      cabinetId: 'cabinet_demo_1',
      cabinetSlotId: 'slot_demo_2',
      notes: '最近活动减少，喂食时多观察。',
      photoUrl: '',
      createdAt: `${addDays(today, -130)}T10:00:00.000Z`,
      updatedAt: nowIso(),
    },
  ]

  const feedingRecords: FeedingRecord[] = [
    {
      id: 'feed_demo_1',
      petId: 'pet_demo_1',
      feedingDate: addDays(today, -3),
      foodType: '杜比亚',
      foodAmount: 3,
      notes: '进食正常',
      createdAt: nowIso(),
    },
    {
      id: 'feed_demo_2',
      petId: 'pet_demo_2',
      feedingDate: addDays(today, -9),
      foodType: '乳鼠',
      foodAmount: 1,
      notes: '吞咽顺利',
      createdAt: nowIso(),
    },
  ]

  const healthRecords: HealthRecord[] = [
    {
      id: 'health_demo_1',
      petId: 'pet_demo_2',
      recordDate: addDays(today, -1),
      weight: 128,
      shedStatus: '否',
      appetite: '减弱',
      activity: '少动',
      healthStatus: '待观察',
      notes: '继续观察活动和进食意愿。',
      createdAt: nowIso(),
    },
  ]

  const cabinets: ReptileCabinet[] = [
    {
      id: 'cabinet_demo_1',
      name: 'A 号爬柜',
      slots: [
        { id: 'slot_demo_1', name: 'A1', notes: '' },
        { id: 'slot_demo_2', name: 'A2', notes: '' },
        { id: 'slot_demo_3', name: 'A3', notes: '' },
      ],
      notes: '客厅东侧',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  write(PETS_KEY, pets)
  write(FEEDING_KEY, feedingRecords)
  write(HEALTH_KEY, healthRecords)
  write(CABINETS_KEY, cabinets)
  write(SETTINGS_KEY, defaultSettings)
}

const normalizePet = (pet: Pet): Pet =>
  normalizePetSchedule({
    ...pet,
    cabinetId: pet.cabinetId || '',
    cabinetSlotId: pet.cabinetSlotId || '',
  })

export const getPets = (): Pet[] => read<Pet[]>(PETS_KEY, []).map(normalizePet)
export const getPetById = (petId: string): Pet | undefined => getPets().find(pet => pet.id === petId)
export const getFeedingRecords = (): FeedingRecord[] => read<FeedingRecord[]>(FEEDING_KEY, [])
export const getHealthRecords = (): HealthRecord[] => read<HealthRecord[]>(HEALTH_KEY, [])
export const getCabinets = (): ReptileCabinet[] => read<ReptileCabinet[]>(CABINETS_KEY, [])

export const getCabinetLocationText = (pet: Pick<Pet, 'cabinetId' | 'cabinetSlotId'>, fallback = '未设置位置'): string => {
  const cabinet = getCabinets().find(item => item.id === pet.cabinetId)
  if (!cabinet) return fallback
  const slot = cabinet.slots.find(item => item.id === pet.cabinetSlotId)
  return slot ? `${cabinet.name} · ${slot.name}` : cabinet.name
}

export const getSettings = (): UserSettings => ({ ...defaultSettings, ...read<UserSettings>(SETTINGS_KEY, defaultSettings) })
export const saveSettings = (settings: UserSettings) => write(SETTINGS_KEY, settings)

export const savePet = (payload: Partial<Pet> & Pick<Pet, 'name' | 'category' | 'feedingCycleDays'>): Pet => {
  const pets = getPets()
  const current = payload.id ? pets.find(pet => pet.id === payload.id) : undefined
  const createdAt = current?.createdAt || nowIso()
  const lastFeedingDate = payload.lastFeedingDate || current?.lastFeedingDate || todayString()
  const pet: Pet = {
    id: payload.id || id('pet'),
    name: payload.name.trim(),
    category: payload.category,
    sex: payload.sex || '未知',
    species: payload.species || '',
    morph: payload.morph || '',
    purchaseDate: payload.purchaseDate || '',
    birthDate: payload.birthDate || '',
    feedingCycleDays: Number(payload.feedingCycleDays),
    lastFeedingDate,
    nextFeedingDate: calculateNextFeedingDate(lastFeedingDate, Number(payload.feedingCycleDays)),
    healthStatus: payload.healthStatus || current?.healthStatus || '健康',
    cabinetId: payload.cabinetId || '',
    cabinetSlotId: payload.cabinetSlotId || '',
    notes: payload.notes || '',
    photoUrl: payload.photoUrl || '',
    createdAt,
    updatedAt: nowIso(),
  }

  write(PETS_KEY, current ? pets.map(item => (item.id === pet.id ? pet : item)) : [pet, ...pets])
  return pet
}

export const deletePetCascade = (petId: string) => {
  write(PETS_KEY, getPets().filter(pet => pet.id !== petId))
  write(FEEDING_KEY, getFeedingRecords().filter(record => record.petId !== petId))
  write(HEALTH_KEY, getHealthRecords().filter(record => record.petId !== petId))
}

export const saveCabinet = (payload: Partial<ReptileCabinet> & Pick<ReptileCabinet, 'name' | 'slots'>): ReptileCabinet => {
  const cabinets = getCabinets()
  const current = payload.id ? cabinets.find(cabinet => cabinet.id === payload.id) : undefined
  const cabinet: ReptileCabinet = {
    id: payload.id || id('cabinet'),
    name: payload.name.trim(),
    slots: payload.slots
      .filter(slot => slot.name.trim())
      .map(slot => ({ id: slot.id || id('slot'), name: slot.name.trim(), notes: slot.notes || '' })),
    notes: payload.notes || '',
    createdAt: current?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  write(CABINETS_KEY, current ? cabinets.map(item => (item.id === cabinet.id ? cabinet : item)) : [cabinet, ...cabinets])
  return cabinet
}

export const deleteCabinet = (cabinetId: string) => {
  write(CABINETS_KEY, getCabinets().filter(cabinet => cabinet.id !== cabinetId))
  write(PETS_KEY, getPets().map(pet => (pet.cabinetId === cabinetId ? { ...pet, cabinetId: '', cabinetSlotId: '', updatedAt: nowIso() } : pet)))
}

export const addFeedingRecord = (petId: string, feedingDate = todayString(), notes = '', foodType = '常规喂食', foodAmount: number | '' = '') => {
  const pet = getPetById(petId)
  if (!pet) return
  const records = getFeedingRecords()
  const duplicated = records.some(record => record.petId === petId && record.feedingDate === feedingDate)
  const nextRecords = duplicated
    ? records.map(record => (record.petId === petId && record.feedingDate === feedingDate ? { ...record, notes, foodType, foodAmount } : record))
    : [{ id: id('feed'), petId, feedingDate, foodType, foodAmount, notes, createdAt: nowIso() }, ...records]

  const nextDate = calculateNextFeedingDate(feedingDate, pet.feedingCycleDays)
  write(FEEDING_KEY, nextRecords)
  write(PETS_KEY, getPets().map(item => (item.id === petId ? { ...item, lastFeedingDate: feedingDate, nextFeedingDate: nextDate, updatedAt: nowIso() } : item)))
}

export const addHealthRecord = (payload: Omit<HealthRecord, 'id' | 'createdAt'>) => {
  const record: HealthRecord = { ...payload, id: id('health'), createdAt: nowIso() }
  write(HEALTH_KEY, [record, ...getHealthRecords()])
  updatePetHealthStatus(payload.petId, payload.healthStatus)
}

export const updatePetHealthStatus = (petId: string, status: HealthStatus) => {
  write(PETS_KEY, getPets().map(pet => (pet.id === petId ? { ...pet, healthStatus: status, updatedAt: nowIso() } : pet)))
}
