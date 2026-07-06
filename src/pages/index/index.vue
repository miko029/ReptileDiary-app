<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { FeedingStatus, Pet, ReptileCabinet } from '@/types'
import { getWeekDays, todayString } from '@/utils/date'
import { getFeedingStatus, getStatusClass, isDueOrOverdue } from '@/utils/feeding'
import { addCabinetFeedingRecords, addFeedingRecord, getCabinetLocationText, getCabinets, getFeedingRecords, getPets } from '@/utils/store'

type PetView = Pet & { categoryInitial: string; feedingStatus: FeedingStatus; statusClass: string; locationText: string }

const today = ref(todayString())
const pets = ref<PetView[]>([])
const cabinets = ref<ReptileCabinet[]>([])
const selectedCabinetIndex = ref(0)
const weekDays = ref<Array<{ date: string; day: number; week: string; count: number; fedCount: number; isToday: boolean }>>([])

const duePets = computed(() => pets.value.filter(pet => isDueOrOverdue(pet.feedingStatus)))
const todayFeedPreview = computed(() => duePets.value.slice(0, 3))
const fedTodayCount = computed(() => pets.value.filter(pet => pet.feedingStatus === '今日已喂').length)
const cabinetOptions = computed(() => cabinets.value.map(cabinet => cabinet.name))
const selectedCabinet = computed(() => cabinets.value[selectedCabinetIndex.value])
const selectedCabinetPets = computed(() => selectedCabinet.value ? pets.value.filter(pet => pet.cabinetId === selectedCabinet.value.id) : [])
const selectedCabinetPendingPets = computed(() => selectedCabinetPets.value.filter(pet => pet.feedingStatus !== '今日已喂'))
const weeklyFeedingTotal = computed(() => weekDays.value.reduce((total, day) => total + day.fedCount, 0))

const petStage = (pet: PetView) => {
  if (pet.feedingCycleDays <= 3) return '幼体'
  if (pet.feedingCycleDays <= 7) return '亚成体'
  return '成体'
}

const refresh = () => {
  today.value = todayString()
  const sourcePets = getPets()
  cabinets.value = getCabinets()
  if (selectedCabinetIndex.value >= cabinets.value.length) selectedCabinetIndex.value = 0
  const records = getFeedingRecords()
  pets.value = sourcePets.map(pet => {
    const feedingStatus = getFeedingStatus(pet, records, today.value)
    return { ...pet, categoryInitial: pet.category.slice(0, 1), feedingStatus, statusClass: getStatusClass(feedingStatus), locationText: getCabinetLocationText(pet) }
  })
  weekDays.value = getWeekDays().map(day => ({
    ...day,
    count: sourcePets.filter(pet => pet.nextFeedingDate === day.date).length,
    fedCount: records.filter(record => record.feedingDate === day.date).length,
    isToday: day.date === today.value,
  }))
}

const quickFeed = (pet: PetView) => {
  if (pet.feedingStatus === '今日已喂') return
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
  if (!cabinet) return uni.showToast({ title: '请先创建爬柜', icon: 'none' })
  if (selectedCabinetPets.value.length === 0) return uni.showToast({ title: '该爬柜暂无宠物', icon: 'none' })
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
const goReminder = () => uni.navigateTo({ url: '/pages/reminder-settings/reminder-settings' })
const goHealth = () => uni.navigateTo({ url: '/pages/health-record-form/health-record-form' })
const goDetail = (petId: string) => uni.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${petId}` })

onShow(refresh)
</script>

<template>
  <view class="page home-page">
    <view class="top-bar">
      <view class="greeting">
        <view class="avatar">🦎</view>
        <view><text class="greeting-text">今天也要好好照顾</text><text class="greeting-text">小宝贝们呀~ 🐢</text></view>
      </view>
      <view class="top-actions">
        <button class="top-action" @tap="goCalendar"><text class="top-icon">▦</text><text>喂食日历</text></button>
        <button class="top-action" @tap="goReminder"><text class="badge">{{ duePets.length }}</text><text class="top-icon">♧</text><text>提醒</text></button>
      </view>
    </view>

    <view class="hero-card">
      <view class="hero-glow"></view>
      <text class="hero-emoji">🦎</text>
      <view class="hero-overlay" @tap="goHealth"><text>☁</text><text>记录</text><text>美好日常</text></view>
    </view>

    <view class="today-card card">
      <view class="card-head"><text class="card-title">今日待喂</text><text class="card-meta">{{ fedTodayCount }}/{{ pets.length }} 已喂食</text></view>
      <view v-if="todayFeedPreview.length" class="feed-list">
        <view v-for="pet in todayFeedPreview" :key="pet.id" class="feed-row" @tap="goDetail(pet.id)">
          <view class="pet-photo">{{ pet.categoryInitial }}</view>
          <view class="feed-main">
            <view class="name-line"><text class="pet-name">{{ pet.name }}</text><text class="stage-pill">{{ petStage(pet) }}</text></view>
            <text class="pet-desc">{{ pet.species || pet.category }}</text>
            <text class="pet-location">{{ pet.locationText }}</text>
          </view>
          <button class="feed-status" :class="{ fed: pet.feedingStatus === '今日已喂' }" @tap.stop="quickFeed(pet)">{{ pet.feedingStatus === '今日已喂' ? '已喂食' : '去喂食' }}</button>
        </view>
      </view>
      <view v-else class="empty-today"><text class="empty-icon">✓</text><text class="empty-title">今天都安排好了</text><text class="caption">没有待喂或逾期的爬宠。</text></view>
      <view class="cabinet-strip">
        <picker :range="cabinetOptions" :value="selectedCabinetIndex" :disabled="cabinets.length === 0" @change="changeCabinet(Number($event.detail.value))">
          <view class="cabinet-picker" :class="{ disabled: cabinets.length === 0 }"><text>{{ selectedCabinet?.name || '暂无爬柜' }}</text><text class="caption">未打卡 {{ selectedCabinetPendingPets.length }} 只</text></view>
        </picker>
        <button class="cabinet-btn" @tap="batchFeedCabinet">整柜打卡</button>
      </view>
      <view class="view-all" @tap="goPets"><text>查看全部</text><text>›</text></view>
    </view>

    <view class="dashboard-grid">
      <view class="quick-card card">
        <text class="card-title">快捷记录</text>
        <view class="quick-record-grid">
          <button class="record-item feed" @tap="goPets"><text>🍖</text><text>喂食</text></button>
          <button class="record-item poop" @tap="goHealth"><text>💩</text><text>排便</text></button>
          <button class="record-item weight" @tap="goHealth"><text>⚖</text><text>称重</text></button>
          <button class="record-item note" @tap="goHealth"><text>📋</text><text>记录</text></button>
        </view>
      </view>
      <view class="week-stat-card card">
        <view class="card-head"><text class="card-title">本周喂食统计</text><text class="stat-bell">♧</text></view>
        <view class="week-total"><text class="week-number">{{ weeklyFeedingTotal }}</text><text>次</text></view>
        <text class="week-trend">比上周 +2 ↑</text>
        <view class="bar-chart"><view v-for="day in weekDays" :key="day.date" class="bar-item"><view class="bar-track"><view class="bar-fill" :class="{ today: day.isToday }" :style="{ height: `${Math.max(18, day.fedCount * 18 + day.count * 8)}rpx` }"></view></view><text>{{ day.week }}</text></view></view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.home-page{min-height:100vh;box-sizing:border-box;padding:24rpx 32rpx 40rpx;background:#f7f3ed}.top-bar{display:flex;align-items:center;justify-content:space-between;gap:16rpx}.greeting{display:flex;align-items:center;gap:22rpx;min-width:0}.avatar{width:96rpx;height:96rpx;box-sizing:border-box;border:6rpx solid #fdfaf3;border-radius:50%;background:#c8d9b0;text-align:center;line-height:84rpx;font-size:50rpx}.greeting-text{display:block;color:#3d3020;font-size:28rpx;font-weight:600;line-height:44rpx}.top-actions{display:flex;gap:16rpx;flex-shrink:0}.top-action{position:relative;width:126rpx;min-height:112rpx;margin:0;padding:16rpx 0 14rpx;border:1rpx solid #eee6da;border-radius:24rpx;background:#fff;color:#5b8c4a;font-size:20rpx;font-weight:600;line-height:1.2}.top-action::after,.record-item::after,.feed-status::after,.cabinet-btn::after{border:0}.top-icon{display:block;margin-bottom:8rpx;font-size:32rpx}.badge{position:absolute;top:-10rpx;right:-8rpx;min-width:32rpx;height:32rpx;border-radius:999rpx;background:#e05a40;color:#fff;font-size:18rpx;line-height:32rpx}.hero-card{position:relative;height:420rpx;margin-top:24rpx;overflow:hidden;border-radius:32rpx;background:radial-gradient(circle at 25% 18%,rgba(255,255,255,.8),transparent 28%),linear-gradient(145deg,#d9e6d1 0%,#9faf74 48%,#80623c 100%)}.hero-glow{position:absolute;left:-60rpx;bottom:-90rpx;width:430rpx;height:280rpx;border-radius:50%;background:rgba(71,50,24,.24);transform:rotate(-14deg)}.hero-emoji{position:absolute;left:92rpx;top:44rpx;font-size:210rpx;transform:rotate(-10deg)}.hero-overlay{position:absolute;right:32rpx;bottom:30rpx;display:flex;flex-direction:column;align-items:center;min-width:104rpx;padding:20rpx 28rpx;border-radius:24rpx;background:rgba(139,90,43,.9);color:#f5ecd8;font-size:26rpx;font-weight:600;line-height:40rpx}.card{border:1rpx solid #eee6da;border-radius:32rpx;background:#fff}.today-card{margin-top:32rpx;padding:32rpx 32rpx 26rpx}.card-head{display:flex;align-items:center;justify-content:space-between;gap:16rpx}.card-title{color:#3d3020;font-size:30rpx;font-weight:600;line-height:44rpx}.card-meta,.caption{color:#8a7860;font-size:24rpx;line-height:36rpx}.feed-list{margin-top:22rpx;padding:24rpx 0;border-top:1rpx solid #eee6da;border-bottom:1rpx solid #eee6da}.feed-row{display:flex;align-items:center;gap:22rpx;min-height:94rpx}.feed-row+.feed-row{margin-top:18rpx}.pet-photo{width:92rpx;height:92rpx;box-sizing:border-box;border:4rpx solid #eae0cc;border-radius:50%;background:linear-gradient(135deg,#3d3020,#c8d9b0);color:#fff;text-align:center;line-height:84rpx;font-size:34rpx;font-weight:600}.feed-main{min-width:0;flex:1}.name-line{display:flex;align-items:center;gap:10rpx}.pet-name{color:#3d3020;font-size:28rpx;font-weight:600;line-height:42rpx}.stage-pill{padding:4rpx 12rpx;border-radius:999rpx;background:#c8d9b0;color:#3d6030;font-size:20rpx;line-height:24rpx}.pet-desc,.pet-location{display:block;color:#8a7860;font-size:22rpx;line-height:32rpx}.feed-status{width:112rpx;height:56rpx;margin:0;padding:0;border-radius:999rpx;background:#e8a835;color:#fff;font-size:24rpx;font-weight:600;line-height:56rpx}.feed-status.fed{background:#5b8c4a}.empty-today{display:flex;flex-direction:column;align-items:center;padding:40rpx 0 34rpx;border-top:1rpx solid #eee6da;border-bottom:1rpx solid #eee6da;margin-top:22rpx}.empty-icon{width:64rpx;height:64rpx;border-radius:50%;background:#e1edd8;color:#5b8c4a;text-align:center;line-height:64rpx;font-size:32rpx;font-weight:600}.empty-title{margin-top:16rpx;color:#3d3020;font-size:28rpx;font-weight:600}.cabinet-strip{display:flex;align-items:center;gap:16rpx;margin-top:22rpx}.cabinet-picker{display:flex;flex-direction:column;justify-content:center;width:342rpx;min-height:72rpx;box-sizing:border-box;padding:0 20rpx;border-radius:20rpx;background:#f7f3ed;color:#3d3020;font-size:26rpx;font-weight:600}.cabinet-picker.disabled{color:#b0a090}.cabinet-btn{width:164rpx;height:72rpx;margin:0;padding:0;border-radius:999rpx;background:#5b8c4a;color:#fff;font-size:24rpx;font-weight:600;line-height:72rpx}.view-all{display:flex;align-items:center;justify-content:center;gap:8rpx;padding-top:18rpx;color:#8a7860;font-size:26rpx;font-weight:500}.dashboard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24rpx;margin-top:32rpx}.quick-card,.week-stat-card{min-height:324rpx;box-sizing:border-box;padding:32rpx}.quick-record-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18rpx;margin-top:22rpx}.record-item{display:flex;flex-direction:column;align-items:center;gap:8rpx;height:110rpx;margin:0;padding:0;border-radius:24rpx;background:transparent;color:#8a7860;font-size:24rpx;line-height:32rpx}.record-item text:first-child{width:88rpx;height:88rpx;border-radius:24rpx;text-align:center;line-height:88rpx;font-size:40rpx}.record-item.feed text:first-child{background:#f5dfb0}.record-item.poop text:first-child{background:#d0e8c8}.record-item.weight text:first-child{background:#f5c4b0}.record-item.note text:first-child{background:#b0d0e8}.stat-bell{color:#5b8c4a;font-size:28rpx}.week-total{display:flex;align-items:baseline;gap:6rpx;margin-top:22rpx;color:#3d3020;font-size:28rpx;font-weight:500}.week-number{font-size:56rpx;font-weight:600;line-height:72rpx}.week-trend{display:block;color:#5b8c4a;font-size:24rpx;line-height:36rpx}.bar-chart{display:flex;align-items:flex-end;justify-content:space-between;margin-top:18rpx}.bar-item{display:flex;flex-direction:column;align-items:center;gap:8rpx;color:#8a7860;font-size:18rpx}.bar-track{display:flex;align-items:flex-end;width:20rpx;height:80rpx}.bar-fill{width:20rpx;min-height:18rpx;border-radius:8rpx 8rpx 2rpx 2rpx;background:#8ec27d}.bar-fill.today{background:#e8a835}
</style>
