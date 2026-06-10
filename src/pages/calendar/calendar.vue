<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { CalendarMark } from '@/types'
import { compareDate, getMonthGrid, todayString } from '@/utils/date'
import { addFeedingRecord, getFeedingRecords, getPets } from '@/utils/store'

type CalendarDay = {
  date: string
  day: number
  isCurrentMonth: boolean
  marks: CalendarMark[]
  isToday: boolean
  isSelected: boolean
}

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const today = ref(todayString())
const selectedDate = ref(todayString())
const days = ref<CalendarDay[]>([])

const selectedMarks = computed(() => days.value.find(day => day.date === selectedDate.value)?.marks || [])

const refresh = () => {
  const pets = getPets()
  const records = getFeedingRecords()
  today.value = todayString()
  days.value = getMonthGrid(year.value, month.value).map(day => {
    const fedMarks = records
      .filter(record => record.feedingDate === day.date)
      .map(record => {
        const pet = pets.find(item => item.id === record.petId)
        return pet ? { petId: pet.id, petName: pet.name, category: pet.category, status: '已喂' as const } : undefined
      })
      .filter(Boolean) as CalendarMark[]
    const dueMarks = pets
      .filter(pet => pet.nextFeedingDate === day.date && !fedMarks.some(mark => mark.petId === pet.id))
      .map(pet => ({
        petId: pet.id,
        petName: pet.name,
        category: pet.category,
        status: compareDate(day.date, today.value) < 0 ? '逾期' as const : '应喂' as const,
      }))
    return {
      ...day,
      marks: [...fedMarks, ...dueMarks],
      isToday: day.date === today.value,
      isSelected: day.date === selectedDate.value,
    }
  })
}

const prevMonth = () => {
  if (month.value === 1) {
    year.value -= 1
    month.value = 12
  } else {
    month.value -= 1
  }
  refresh()
}

const nextMonth = () => {
  if (month.value === 12) {
    year.value += 1
    month.value = 1
  } else {
    month.value += 1
  }
  refresh()
}

const selectDay = (date: string) => {
  selectedDate.value = date
  refresh()
}

const feed = (petId: string) => {
  addFeedingRecord(petId, selectedDate.value)
  uni.showToast({ title: '已打卡', icon: 'success' })
  refresh()
}

const goDetail = (petId: string) => uni.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${petId}` })

onShow(refresh)
</script>

<template>
  <view class="page">
    <view class="between calendar-head">
      <button class="month-btn" @tap="prevMonth">‹</button>
      <text class="title">{{ year }}年{{ month }}月</text>
      <button class="month-btn" @tap="nextMonth">›</button>
    </view>

    <view class="week-labels">
      <text>日</text><text>一</text><text>二</text><text>三</text><text>四</text><text>五</text><text>六</text>
    </view>

    <view class="calendar-grid card">
      <view v-for="day in days" :key="day.date" class="calendar-day" :class="{ 'muted-day': !day.isCurrentMonth, today: day.isToday, selected: day.isSelected }" @tap="selectDay(day.date)">
        <text class="day">{{ day.day }}</text>
        <view class="dots">
          <text v-for="mark in day.marks" :key="mark.petId + mark.status" class="dot" :class="mark.status === '已喂' ? 'fed' : mark.status === '逾期' ? 'overdue' : 'due'"></text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">{{ selectedDate }} 详情</text>
      <view v-if="selectedMarks.length === 0" class="card empty small-empty">当天无喂食安排</view>
      <view v-for="mark in selectedMarks" :key="mark.petId + mark.status" class="card mark-row">
        <view @tap="goDetail(mark.petId)">
          <text class="mark-name">{{ mark.petName }}</text>
          <text class="caption">{{ mark.category }} · {{ mark.status }}</text>
        </view>
        <button v-if="mark.status !== '已喂'" class="feed-small" @tap="feed(mark.petId)">打卡</button>
        <text v-else class="tag tag-green">已喂</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.calendar-head { margin-bottom: 22rpx; }
.month-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: #fffdf9;
  color: #2f7d63;
  font-size: 48rpx;
  line-height: 64rpx;
}
.week-labels {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 12rpx;
  color: #8b8177;
  font-size: 24rpx;
  text-align: center;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 12rpx;
}
.calendar-day {
  min-height: 92rpx;
  box-sizing: border-box;
  border-radius: 18rpx;
  padding: 10rpx 0;
  text-align: center;
}
.calendar-day.selected {
  background: #2f7d63;
  color: #ffffff;
}
.calendar-day.today:not(.selected) { background: #e7f6ef; }
.muted-day { opacity: 0.38; }
.day {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}
.dots {
  display: flex;
  justify-content: center;
  gap: 5rpx;
  margin-top: 10rpx;
}
.dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
}
.dot.fed { background: #2f7d63; }
.dot.due { background: #356fb0; }
.dot.overdue { background: #bd3d34; }
.calendar-day.selected .dot { background: #ffffff; }
.small-empty {
  margin-top: 16rpx;
  padding: 36rpx;
  color: #8b8177;
}
.mark-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding: 22rpx;
}
.mark-name {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
}
.feed-small {
  width: 96rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: #2f7d63;
  color: #ffffff;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 58rpx;
}
</style>
