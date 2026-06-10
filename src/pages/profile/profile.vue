<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { UserSettings } from '@/types'
import { compareDate, todayString } from '@/utils/date'
import { getFeedingRecords, getPets, getSettings } from '@/utils/store'

const settings = ref<UserSettings>(getSettings())
const stats = ref({ total: 0, weekFed: 0, todayDue: 0, abnormal: 0 })

const refresh = () => {
  const pets = getPets()
  const records = getFeedingRecords()
  const today = todayString()
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 6)
  const weekStartStr = `${weekStart.getFullYear()}-${`${weekStart.getMonth() + 1}`.padStart(2, '0')}-${`${weekStart.getDate()}`.padStart(2, '0')}`
  settings.value = getSettings()
  stats.value = {
    total: pets.length,
    weekFed: records.filter(record => record.feedingDate >= weekStartStr).length,
    todayDue: pets.filter(pet => pet.nextFeedingDate && compareDate(pet.nextFeedingDate, today) <= 0).length,
    abnormal: pets.filter(pet => pet.healthStatus === '异常').length,
  }
}

const exportData = () => {
  uni.showModal({
    title: '数据导出',
    content: '第一版已预留导出入口。接入云开发后可导出 CSV 或 JSON 文件。',
    showCancel: false,
  })
}

const about = () => {
  uni.showModal({
    title: '关于爬宠管家',
    content: '用于记录爬宠档案、喂食计划、喂食记录和健康状态的多端应用。',
    showCancel: false,
  })
}

const goReminder = () => uni.navigateTo({ url: '/pages/reminder-settings/reminder-settings' })
const goCycle = () => uni.navigateTo({ url: '/pages/feed-cycle-settings/feed-cycle-settings' })
const goHealth = () => uni.navigateTo({ url: '/pages/health-management/health-management' })

onShow(refresh)
</script>

<template>
  <view class="page">
    <view class="profile-head card">
      <view class="avatar">爬</view>
      <view>
        <text class="title">爬宠管家</text>
        <text class="caption">记录喂食、健康和长期状态</text>
      </view>
    </view>

    <view class="stats-grid section">
      <view class="card stat"><text>{{ stats.total }}</text><text>总宠物</text></view>
      <view class="card stat"><text>{{ stats.weekFed }}</text><text>本周已喂</text></view>
      <view class="card stat"><text>{{ stats.todayDue }}</text><text>今日待喂</text></view>
      <view class="card stat"><text>{{ stats.abnormal }}</text><text>异常宠物</text></view>
    </view>

    <view class="card menu section">
      <button class="menu-row" @tap="goReminder"><text>提醒设置</text><text>›</text></button>
      <button class="menu-row" @tap="goCycle"><text>默认喂食周期</text><text>{{ settings.defaultFeedingCycleDays }} 天 ›</text></button>
      <button class="menu-row" @tap="goHealth"><text>健康管理</text><text>›</text></button>
      <button class="menu-row" @tap="exportData"><text>数据导出</text><text>预留 ›</text></button>
      <button class="menu-row" @tap="about"><text>关于产品</text><text>›</text></button>
    </view>
  </view>
</template>

<style scoped>
.profile-head {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 30rpx;
}
.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  background: #2f7d63;
  color: #ffffff;
  text-align: center;
  line-height: 96rpx;
  font-size: 40rpx;
  font-weight: 800;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}
.stat {
  padding: 28rpx 10rpx;
  text-align: center;
}
.stat text:first-child {
  display: block;
  color: #2f7d63;
  font-size: 44rpx;
  font-weight: 800;
}
.stat text:last-child {
  color: #756b60;
  font-size: 24rpx;
}
.menu { padding: 0 24rpx; }
.menu-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 94rpx;
  border-bottom: 1rpx solid #eee6da;
  color: #25211d;
  font-size: 29rpx;
  line-height: 94rpx;
  text-align: left;
}
.menu-row:last-child { border-bottom: 0; }
.menu-row text:last-child {
  color: #8b8177;
  font-size: 26rpx;
}
</style>
