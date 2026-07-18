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
const todayFeedPreview = computed(() => pets.value
  .filter(pet => pet.feedingStatus === '今日已喂' || isDueOrOverdue(pet.feedingStatus))
  .sort((a, b) => Number(b.feedingStatus === '今日已喂') - Number(a.feedingStatus === '今日已喂'))
  .slice(0, 3))
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

const petImages = [
  '/static/figma/pet-gecko.png',
  '/static/figma/pet-bearded-dragon.png',
  '/static/figma/pet-python.png',
]

const petImage = (index: number) => petImages[index % petImages.length]

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
  <view class="home-page">
    <view class="top-bar">
      <view class="greeting">
        <view class="avatar">🦎</view>
        <view><text class="greeting-text">今天也要好好照顾</text><text class="greeting-text">小宝贝们呀~ 🐢</text></view>
      </view>
      <view class="top-actions">
        <button class="top-action calendar-action" @tap="goCalendar"><text class="top-icon">▦</text><text>喂食日历</text></button>
        <button class="top-action reminder-action" @tap="goReminder"><text class="badge">{{ duePets.length }}</text><text class="top-icon">♧</text><text>提醒</text></button>
      </view>
    </view>

    <view class="hero-card">
      <image class="hero-image" src="/static/figma/home-hero.png" mode="aspectFill" />
      <view class="hero-shade"></view>
      <view class="hero-overlay" @tap="goHealth"><text class="camera-icon">⌾</text><text>记录</text><text>美好日常</text></view>
    </view>

    <view class="today-card card">
      <view class="card-head"><text class="card-title">今日待喂</text><text class="card-meta">{{ fedTodayCount }}/{{ pets.length }} 已喂食</text></view>
      <view v-if="todayFeedPreview.length" class="feed-list">
        <view v-for="(pet, index) in todayFeedPreview" :key="pet.id" class="feed-row" @tap="goDetail(pet.id)">
          <view class="pet-photo"><image :src="petImage(index)" mode="aspectFill" /></view>
          <view class="feed-main">
            <text class="pet-name">{{ pet.name }}</text>
            <view class="name-line"><text class="pet-desc">{{ pet.species || pet.category }}</text><text class="stage-pill">{{ petStage(pet) }}</text></view>
          </view>
          <button class="feed-status" :class="{ fed: pet.feedingStatus === '今日已喂' }" @tap.stop="quickFeed(pet)"><text v-if="pet.feedingStatus === '今日已喂'" class="check">✓</text>{{ pet.feedingStatus === '今日已喂' ? '已喂食' : '去喂食' }}</button>
        </view>
      </view>
      <view v-else class="empty-today"><text class="empty-icon">✓</text><text class="empty-title">今天都安排好了</text><text class="caption">没有待喂或逾期的爬宠。</text></view>
      <view class="view-all" @tap="goPets"><text>查看全部</text><text>›</text></view>
    </view>

    <view class="dashboard-grid">
      <view class="quick-card card">
        <text class="card-title">快捷记录</text>
        <view class="quick-record-grid">
          <button class="record-item feed" @tap="goPets"><text>🍖</text><text>喂食</text></button>
          <button class="record-item poop" @tap="goHealth"><text>💩</text><text>排便</text></button>
          <button class="record-item weight" @tap="goHealth"><text>⚖️</text><text>称重</text></button>
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
.home-page{width:100%;max-width:430px;min-height:100vh;box-sizing:border-box;margin:0 auto;padding:24rpx 32rpx 32rpx;background:#f7f3ed;color:#3d3020;overflow-x:hidden}.top-bar{display:flex;align-items:center;justify-content:space-between;height:114rpx;padding:0 8rpx}.greeting{display:flex;align-items:center;gap:24rpx;min-width:0}.avatar{width:96rpx;height:96rpx;box-sizing:border-box;border:6rpx solid #fdfaf3;border-radius:50%;background:#c8d9b0;text-align:center;line-height:84rpx;font-size:50rpx;flex-shrink:0}.greeting-text{display:block;font-size:28rpx;font-weight:600;line-height:44rpx;white-space:nowrap}.top-actions{display:flex;align-items:flex-start;gap:16rpx;flex-shrink:0}.top-action{position:relative;min-height:114rpx;margin:0;padding:17rpx 25rpx;border:1rpx solid #eee6da;border-radius:24rpx;background:#fff;color:#5b8c4a;font-size:20rpx;font-weight:600;line-height:36rpx}.calendar-action{width:130rpx}.reminder-action{width:90rpx}.top-action::after,.record-item::after,.feed-status::after{border:0}.top-icon{display:block;height:36rpx;font-size:32rpx;line-height:36rpx}.badge{position:absolute;z-index:2;top:-9rpx;right:-8rpx;min-width:32rpx;height:32rpx;border-radius:999rpx;background:#e05a40;color:#fff;font-size:18rpx;line-height:32rpx}.hero-card{position:relative;height:420rpx;margin-top:0;overflow:hidden;border-radius:32rpx}.hero-image,.hero-shade{position:absolute;width:100%;height:100%}.hero-shade{background:linear-gradient(180deg,rgba(100,150,80,.1),rgba(60,40,10,.25))}.hero-overlay{position:absolute;right:32rpx;bottom:26rpx;display:flex;flex-direction:column;align-items:center;justify-content:center;width:168rpx;height:154rpx;box-sizing:border-box;border-radius:24rpx;background:rgba(139,90,43,.88);color:#f5ecd8;font-size:26rpx;font-weight:600;line-height:40rpx}.camera-icon{height:32rpx;font-size:32rpx;line-height:32rpx}.card{min-width:0;border:1rpx solid #eee6da;border-radius:32rpx;background:#fff}.today-card{margin-top:32rpx;padding:33rpx 33rpx 24rpx}.card-head{display:flex;align-items:center;justify-content:space-between;gap:16rpx}.card-title{min-width:0;font-size:30rpx;font-weight:600;line-height:46rpx}.card-meta,.caption{color:#8a7860;font-size:24rpx;line-height:40rpx;white-space:nowrap}.feed-list{margin-top:24rpx;padding:25rpx 0;border-top:1rpx solid #eee6da;border-bottom:1rpx solid #eee6da}.feed-row{display:flex;align-items:center;gap:24rpx;height:92rpx}.feed-row+.feed-row{margin-top:24rpx}.pet-photo{width:92rpx;height:92rpx;box-sizing:border-box;padding:4rpx;overflow:hidden;border:4rpx solid #eae0cc;border-radius:50%;flex-shrink:0}.pet-photo image{width:100%;height:100%;border-radius:50%}.feed-main{min-width:0;flex:1}.pet-name{display:block;font-size:28rpx;font-weight:600;line-height:44rpx}.name-line{display:flex;align-items:center;gap:12rpx;height:36rpx}.pet-desc{max-width:120rpx;overflow:hidden;color:#8a7860;font-size:20rpx;line-height:36rpx;white-space:nowrap;text-overflow:ellipsis}.stage-pill{padding:3rpx 12rpx;border-radius:999rpx;background:#c8d9b0;color:#3d6030;font-size:20rpx;line-height:28rpx;white-space:nowrap}.feed-status{display:flex;align-items:center;justify-content:center;gap:8rpx;width:112rpx;height:56rpx;margin:0;padding:0;border-radius:999rpx;background:#e8a835;color:#fff;font-size:24rpx;font-weight:500;line-height:56rpx;flex-shrink:0}.feed-status.fed{width:146rpx;background:#5b8c4a}.check{font-size:22rpx}.empty-today{display:flex;flex-direction:column;align-items:center;margin-top:24rpx;padding:30rpx 0;border-top:1rpx solid #eee6da;border-bottom:1rpx solid #eee6da}.empty-icon{width:64rpx;height:64rpx;border-radius:50%;background:#e1edd8;color:#5b8c4a;text-align:center;line-height:64rpx}.empty-title{margin-top:12rpx;font-size:28rpx;font-weight:600}.view-all{display:flex;align-items:center;justify-content:center;gap:8rpx;height:48rpx;padding-top:16rpx;color:#8a7860;font-size:24rpx;font-weight:500}.dashboard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24rpx;margin-top:32rpx}.quick-card,.week-stat-card{height:422rpx;box-sizing:border-box;padding:33rpx}.quick-record-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16rpx 12rpx;margin-top:24rpx}.record-item{display:flex;flex-direction:column;align-items:center;gap:8rpx;width:100%;min-width:0;height:136rpx;margin:0;padding:0;background:transparent;color:#8a7860;font-size:24rpx;line-height:40rpx}.record-item text:first-child{width:88rpx;height:88rpx;border-radius:28rpx;text-align:center;line-height:88rpx;font-size:40rpx}.record-item.feed text:first-child{background:#f5dfb0}.record-item.poop text:first-child{background:#d0e8c8}.record-item.weight text:first-child{background:#f5c4b0}.record-item.note text:first-child{background:#b0d0e8}.stat-bell{color:#5b8c4a;font-size:28rpx}.week-total{display:flex;align-items:baseline;gap:6rpx;margin-top:24rpx;font-size:28rpx}.week-number{font-size:56rpx;font-weight:600;line-height:72rpx}.week-trend{display:block;color:#5b8c4a;font-size:22rpx;line-height:34rpx;white-space:nowrap}.bar-chart{display:flex;align-items:flex-end;justify-content:space-between;margin-top:24rpx}.bar-item{display:flex;min-width:0;flex-direction:column;align-items:center;gap:8rpx;color:#8a7860;font-size:18rpx}.bar-track{display:flex;align-items:flex-end;width:18rpx;height:80rpx}.bar-fill{width:18rpx;min-height:18rpx;border-radius:8rpx 8rpx 2rpx 2rpx;background:#8ec27d}.bar-fill.today{background:#e8a835}
@media (max-width:360px){.home-page{padding-right:28rpx;padding-left:28rpx}.greeting{gap:16rpx}.greeting-text{font-size:25rpx}.top-actions{gap:10rpx}.top-action{padding-right:16rpx;padding-left:16rpx}.calendar-action{width:116rpx}.reminder-action{width:82rpx}.today-card,.quick-card,.week-stat-card{padding-right:28rpx;padding-left:28rpx}.dashboard-grid{gap:18rpx}.record-item text:first-child{width:80rpx;height:80rpx;line-height:80rpx}}
@media (min-width:431px){.home-page{padding-right:16px;padding-left:16px}.top-bar{height:65px;padding:0 4px}.avatar{width:48px;height:48px;border-width:3px;line-height:42px;font-size:25px}.greeting{gap:12px}.greeting-text{font-size:14px;line-height:22px}.top-actions{gap:8px}.top-action{min-height:57px;padding:8px 12px;border-radius:12px;font-size:10px;line-height:18px}.calendar-action{width:65px}.reminder-action{width:45px}.top-icon{height:18px;font-size:16px;line-height:18px}.badge{top:-5px;right:-4px;min-width:16px;height:16px;font-size:9px;line-height:16px}.hero-card{height:241px;border-radius:16px}.hero-overlay{right:16px;bottom:13px;width:84px;height:77px;border-radius:12px;font-size:13px;line-height:20px}.today-card{margin-top:16px;padding:17px 16px 12px}.card{border-radius:16px}.card-title{font-size:15px;line-height:23px}.card-meta,.caption{font-size:12px;line-height:20px}.feed-list{margin-top:12px;padding:13px 0}.feed-row{gap:12px;height:46px}.feed-row+.feed-row{margin-top:12px}.pet-photo{width:46px;height:46px;padding:2px;border-width:2px}.pet-name{font-size:14px;line-height:22px}.name-line{gap:6px;height:18px}.pet-desc{max-width:60px;font-size:10px;line-height:18px}.stage-pill{padding:2px 6px;font-size:10px;line-height:14px}.feed-status{width:56px;height:28px;font-size:12px;line-height:28px}.feed-status.fed{width:73px}.view-all{height:24px;padding-top:8px;font-size:12px}.dashboard-grid{gap:12px;margin-top:16px}.quick-card,.week-stat-card{height:211px;padding:17px 16px}.quick-record-grid{gap:8px 6px;margin-top:12px}.record-item{gap:4px;height:68px;font-size:12px;line-height:20px}.record-item text:first-child{width:44px;height:44px;border-radius:14px;line-height:44px;font-size:20px}.week-total{gap:3px;margin-top:12px;font-size:14px}.week-number{font-size:28px;line-height:36px}.week-trend{font-size:11px;line-height:17px}.bar-chart{margin-top:12px}.bar-item{gap:4px;font-size:9px}.bar-track{width:9px;height:40px}.bar-fill{width:9px;min-height:9px;border-radius:4px 4px 1px 1px}}
.top-bar{position:relative;z-index:2}
.hero-card{z-index:1;margin-top:16rpx}
.hero-image,.hero-shade{inset:0}
.hero-shade{pointer-events:none}
@media (min-width:431px){.hero-card{margin-top:8px}}
</style>
