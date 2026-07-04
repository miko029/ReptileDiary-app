<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { FeedingStatus, Pet, ReptileCabinet } from '@/types'
import { formatDate, getWeekDays, todayString } from '@/utils/date'
import { getFeedingStatus, getStatusClass, isDueOrOverdue } from '@/utils/feeding'
import { addCabinetFeedingRecords, addFeedingRecord, getCabinetLocationText, getCabinets, getFeedingRecords, getPets } from '@/utils/store'

type PetView = Pet & { categoryInitial: string; feedingStatus: FeedingStatus; statusClass: string; locationText: string }

const today = ref(todayString())
const pets = ref<PetView[]>([])
const cabinets = ref<ReptileCabinet[]>([])
const selectedCabinetIndex = ref(0)
const weekDays = ref<Array<{ date: string; day: number; week: string; count: number; fedCount: number; isToday: boolean }>>([])

const dateText = computed(() => formatDate(today.value))
const duePets = computed(() => pets.value.filter(pet => isDueOrOverdue(pet.feedingStatus)))
const cabinetOptions = computed(() => cabinets.value.map(cabinet => cabinet.name))
const selectedCabinet = computed(() => cabinets.value[selectedCabinetIndex.value])
const selectedCabinetPets = computed(() => selectedCabinet.value ? pets.value.filter(pet => pet.cabinetId === selectedCabinet.value.id) : [])
const selectedCabinetPendingPets = computed(() => selectedCabinetPets.value.filter(pet => pet.feedingStatus !== '今日已喂'))
const stats = computed(() => ({
  total: pets.value.length,
  healthy: pets.value.filter(pet => pet.healthStatus === '健康').length,
  watching: pets.value.filter(pet => pet.healthStatus === '待观察').length,
  abnormal: pets.value.filter(pet => pet.healthStatus === '异常').length,
}))

const refresh = () => {
  today.value = todayString()
  const sourcePets = getPets()
  cabinets.value = getCabinets()
  if (selectedCabinetIndex.value >= cabinets.value.length) selectedCabinetIndex.value = 0
  const records = getFeedingRecords()
  pets.value = sourcePets.map(pet => {
    const feedingStatus = getFeedingStatus(pet, records, today.value)
    return {
      ...pet,
      categoryInitial: pet.category.slice(0, 1),
      feedingStatus,
      statusClass: getStatusClass(feedingStatus),
      locationText: getCabinetLocationText(pet),
    }
  })
  weekDays.value = getWeekDays().map(day => ({
    ...day,
    count: sourcePets.filter(pet => pet.nextFeedingDate === day.date).length,
    fedCount: records.filter(record => record.feedingDate === day.date).length,
    isToday: day.date === today.value,
  }))
}

const quickFeed = (pet: PetView) => {
  uni.showModal({
    title: '喂食打卡',
    content: `确认今天已经喂食 ${pet.name} 吗？`,
    confirmText: '确认打卡',
    success: result => {
      if (!result.confirm) return
      addFeedingRecord(pet.id)
      uni.showToast({ title: '打卡成功', icon: 'success' })
      refresh()
    },
  })
}

const changeCabinet = (index: number) => {
  selectedCabinetIndex.value = index
}

const batchFeedCabinet = () => {
  const cabinet = selectedCabinet.value
  if (!cabinet) {
    uni.showToast({ title: '请先创建爬柜', icon: 'none' })
    return
  }
  if (selectedCabinetPets.value.length === 0) {
    uni.showToast({ title: '该爬柜暂无宠物', icon: 'none' })
    return
  }

  uni.showModal({
    title: '按爬柜打卡',
    content: `确认今天已喂食 ${cabinet.name} 内 ${selectedCabinetPendingPets.value.length} 只未打卡宠物吗？`,
    confirmText: '批量打卡',
    success: result => {
      if (!result.confirm) return
      const summary = addCabinetFeedingRecords(cabinet.id)
      uni.showToast({ title: summary.added ? `已打卡 ${summary.added} 只` : '今天已全部打卡', icon: 'success' })
      refresh()
    },
  })
}

const goPets = () => uni.switchTab({ url: '/pages/pets/pets' })
const goCalendar = () => uni.switchTab({ url: '/pages/calendar/calendar' })
const goAddPet = () => uni.navigateTo({ url: '/pages/pet-form/pet-form' })
const goDetail = (petId: string) => uni.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${petId}` })

onShow(refresh)
</script>

<template>
  <view class="page">
    <view class="hero">
      <view>
        <text class="hero-date">{{ dateText }}</text>
        <text class="hero-title">今天该喂谁</text>
        <text class="hero-subtitle">按喂食周期自动整理待喂、逾期和健康状态。</text>
      </view>
      <view class="hero-mark">爬</view>
    </view>

    <view class="stats-card card">
      <view class="stat-item"><text class="stat-number">{{ stats.total }}</text><text class="caption">总宠物</text></view>
      <view class="stat-item"><text class="stat-number green">{{ stats.healthy }}</text><text class="caption">健康</text></view>
      <view class="stat-item"><text class="stat-number yellow">{{ stats.watching }}</text><text class="caption">待观察</text></view>
      <view class="stat-item"><text class="stat-number red">{{ stats.abnormal }}</text><text class="caption">异常</text></view>
    </view>

    <view class="quick-grid section">
      <button class="quick-action" @tap="goPets">宠物列表</button>
      <button class="quick-action" @tap="goCalendar">喂食日历</button>
      <button class="quick-action primary" @tap="goAddPet">添加宠物</button>
    </view>

    <view class="batch-card card">
      <view class="between batch-head">
        <view>
          <text class="section-title">按爬柜喂食打卡</text>
          <text class="caption">一次记录整个爬柜今天已喂。</text>
        </view>
        <text class="tag tag-blue">{{ selectedCabinetPets.length }} 只</text>
      </view>
      <picker :range="cabinetOptions" :value="selectedCabinetIndex" :disabled="cabinets.length === 0" @change="changeCabinet(Number($event.detail.value))">
        <view class="picker-line" :class="{ disabled: cabinets.length === 0 }">{{ selectedCabinet?.name || '暂无爬柜' }}</view>
      </picker>
      <view class="batch-meta">
        <text class="caption">未打卡 {{ selectedCabinetPendingPets.length }} 只</text>
        <text class="caption">已打卡 {{ selectedCabinetPets.length - selectedCabinetPendingPets.length }} 只</text>
      </view>
      <button class="primary-btn batch-btn" @tap="batchFeedCabinet">整柜打卡</button>
    </view>

    <view class="section">
      <view class="between section-head">
        <text class="section-title">待喂食宠物</text>
        <text class="caption">{{ duePets.length }} 只</text>
      </view>

      <view v-if="duePets.length === 0" class="card empty">
        <view class="empty-icon">✓</view>
        <text class="section-title">今天都安排好了</text>
        <text class="caption">没有待喂或逾期的爬宠。</text>
      </view>

      <view v-for="pet in duePets" :key="pet.id" class="pet-row card" @tap="goDetail(pet.id)">
        <view class="pet-avatar">{{ pet.categoryInitial }}</view>
        <view class="pet-main">
          <view class="between">
            <text class="pet-name">{{ pet.name }}</text>
            <text class="tag" :class="pet.statusClass">{{ pet.feedingStatus }}</text>
          </view>
          <text class="caption">{{ pet.species || pet.category }} · 上次 {{ pet.lastFeedingDate || '未记录' }}</text>
          <text class="caption">位置 {{ pet.locationText }}</text>
          <text class="caption">下次喂食 {{ pet.nextFeedingDate || '待设置' }}</text>
        </view>
        <button class="feed-btn" @tap.stop="quickFeed(pet)">打卡</button>
      </view>
    </view>

    <view class="section">
      <view class="between section-head">
        <text class="section-title">本周喂食安排</text>
        <text class="link" @tap="goCalendar">查看月历</text>
      </view>
      <view class="week-card card">
        <view v-for="day in weekDays" :key="day.date" class="day-cell" :class="{ today: day.isToday }">
          <text class="caption">周{{ day.week }}</text>
          <text class="day-number">{{ day.day }}</text>
          <text class="day-count">{{ day.count }} 应喂</text>
          <text class="fed-count">{{ day.fedCount }} 已喂</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.hero {
  display: flex;
  justify-content: space-between;
  min-height: 260rpx;
  box-sizing: border-box;
  padding: 36rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #2f7d63 0%, #6b8f4e 100%);
  color: #ffffff;
}
.hero-date,
.hero-subtitle {
  display: block;
  opacity: 0.86;
  font-size: 26rpx;
}
.hero-title {
  display: block;
  margin-top: 20rpx;
  font-size: 50rpx;
  font-weight: 800;
}
.hero-subtitle {
  width: 430rpx;
  margin-top: 18rpx;
  line-height: 1.55;
}
.hero-mark {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.18);
  text-align: center;
  line-height: 96rpx;
  font-size: 42rpx;
  font-weight: 800;
}
.stats-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: -34rpx;
  padding: 26rpx 8rpx;
}
.stat-item {
  text-align: center;
}
.stat-number {
  display: block;
  color: #25211d;
  font-size: 40rpx;
  font-weight: 800;
}
.green { color: #2f7d63; }
.yellow { color: #a56600; }
.red { color: #bd3d34; }
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.quick-action {
  min-height: 84rpx;
  border-radius: 18rpx;
  background: #fffdf9;
  color: #4d4035;
  font-size: 27rpx;
  font-weight: 700;
  line-height: 84rpx;
}
.quick-action.primary {
  background: #2f7d63;
  color: #ffffff;
}
.batch-card {
  margin-top: 18rpx;
  padding: 26rpx;
}
.batch-head {
  align-items: flex-start;
  margin-bottom: 20rpx;
}
.picker-line {
  min-height: 78rpx;
  box-sizing: border-box;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #f6f1ea;
  color: #25211d;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 78rpx;
}
.picker-line.disabled {
  color: #aaa29a;
}
.batch-meta {
  display: flex;
  gap: 24rpx;
  margin-top: 14rpx;
}
.batch-btn {
  margin-top: 22rpx;
}
.section-head {
  margin-bottom: 18rpx;
}
.link {
  color: #2f7d63;
  font-size: 26rpx;
  font-weight: 700;
}
.pet-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 18rpx;
  padding: 24rpx;
}
.pet-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 22rpx;
  background: #e7f6ef;
  color: #2f7d63;
  text-align: center;
  line-height: 76rpx;
  font-size: 34rpx;
  font-weight: 800;
}
.pet-main {
  min-width: 0;
  flex: 1;
}
.pet-name {
  font-size: 31rpx;
  font-weight: 800;
}
.feed-btn {
  width: 104rpx;
  height: 62rpx;
  border-radius: 999rpx;
  background: #2f7d63;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 62rpx;
}
.week-card {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 18rpx 10rpx;
}
.day-cell {
  min-height: 134rpx;
  box-sizing: border-box;
  padding: 12rpx 4rpx;
  border-radius: 18rpx;
  text-align: center;
}
.day-cell.today {
  background: #e7f6ef;
}
.day-number {
  display: block;
  margin-top: 8rpx;
  font-size: 32rpx;
  font-weight: 800;
}
.day-count,
.fed-count {
  display: block;
  margin-top: 4rpx;
  color: #8b8177;
  font-size: 20rpx;
}
</style>
