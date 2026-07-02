<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type { FeedingRecord, HealthRecord, Pet } from '@/types'
import { todayString } from '@/utils/date'
import { getFeedingStatus, getStatusClass } from '@/utils/feeding'
import { addFeedingRecord, deletePetCascade, getCabinetLocationText, getFeedingRecords, getHealthRecords, getPetById } from '@/utils/store'

const id = ref('')
const pet = ref<Pet | null>(null)
const feedingRecords = ref<FeedingRecord[]>([])
const healthRecords = ref<HealthRecord[]>([])

const categoryInitial = computed(() => pet.value?.category.slice(0, 1) || '')
const feedingStatus = computed(() => pet.value ? getFeedingStatus(pet.value, feedingRecords.value) : '')
const statusClass = computed(() => getStatusClass(feedingStatus.value as any))
const locationText = computed(() => pet.value ? getCabinetLocationText(pet.value) : '')

const refresh = () => {
  const current = getPetById(id.value)
  if (!current) {
    uni.showToast({ title: '宠物不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 500)
    return
  }
  pet.value = current
  feedingRecords.value = getFeedingRecords().filter(record => record.petId === current.id)
  healthRecords.value = getHealthRecords().filter(record => record.petId === current.id)
  uni.setNavigationBarTitle({ title: current.name })
}

const feedToday = () => {
  if (!pet.value) return
  uni.showModal({
    title: '喂食打卡',
    content: `确认今天已经喂食 ${pet.value.name} 吗？`,
    confirmText: '确认',
    success: result => {
      if (!result.confirm || !pet.value) return
      addFeedingRecord(pet.value.id, todayString())
      uni.showToast({ title: '打卡成功', icon: 'success' })
      refresh()
    },
  })
}

const removePet = () => {
  if (!pet.value) return
  uni.showModal({
    title: '删除宠物',
    content: `确认删除 ${pet.value.name}？喂食记录和健康记录会一并删除。`,
    confirmColor: '#BD3D34',
    success: result => {
      if (!result.confirm || !pet.value) return
      deletePetCascade(pet.value.id)
      uni.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 400)
    },
  })
}

const editPet = () => {
  if (!pet.value) return
  uni.navigateTo({ url: `/pages/pet-form/pet-form?id=${pet.value.id}` })
}

const addHealth = () => {
  if (!pet.value) return
  uni.navigateTo({ url: `/pages/health-record-form/health-record-form?petId=${pet.value.id}` })
}

onLoad(query => {
  id.value = String(query?.id || '')
})
onShow(refresh)
</script>

<template>
  <view v-if="pet" class="page">
    <view class="detail-hero">
      <view class="detail-avatar">{{ categoryInitial }}</view>
      <view class="detail-main">
        <view class="between">
          <text class="title">{{ pet.name }}</text>
          <text class="tag" :class="pet.healthStatus === '健康' ? 'tag-green' : pet.healthStatus === '待观察' ? 'tag-yellow' : 'tag-red'">{{ pet.healthStatus }}</text>
        </view>
        <text class="hero-meta">{{ pet.category }} · {{ pet.species || '未填写品种' }} · {{ pet.sex }}</text>
        <text class="hero-meta">{{ pet.morph || '未填写基因' }}</text>
        <text class="hero-meta">位置：{{ locationText }}</text>
      </view>
    </view>

    <view class="card schedule-card section">
      <view class="between">
        <view>
          <text class="section-title">喂食信息</text>
          <text class="caption">周期：每 {{ pet.feedingCycleDays }} 天</text>
        </view>
        <text class="tag" :class="statusClass">{{ feedingStatus }}</text>
      </view>
      <view class="schedule-grid">
        <view><text class="caption">上次喂食</text><text class="schedule-value">{{ pet.lastFeedingDate || '未记录' }}</text></view>
        <view><text class="caption">下次喂食</text><text class="schedule-value">{{ pet.nextFeedingDate || '待计算' }}</text></view>
      </view>
      <button class="primary-btn" @tap="feedToday">喂食打卡</button>
    </view>

    <view class="action-grid section">
      <button class="secondary-btn" @tap="editPet">编辑</button>
      <button class="secondary-btn" @tap="addHealth">健康记录</button>
      <button class="danger-btn" @tap="removePet">删除</button>
    </view>

    <view class="card info-card section">
      <text class="section-title">基础档案</text>
      <view class="info-row"><text>饲养位置</text><text>{{ locationText }}</text></view>
      <view class="info-row"><text>购入日期</text><text>{{ pet.purchaseDate || '未记录' }}</text></view>
      <view class="info-row"><text>出生日期</text><text>{{ pet.birthDate || '未记录' }}</text></view>
      <view class="info-row"><text>备注</text><text>{{ pet.notes || '无' }}</text></view>
    </view>

    <view class="section">
      <text class="section-title">喂食记录</text>
      <view v-if="feedingRecords.length === 0" class="card empty small-empty">暂无喂食记录</view>
      <view v-for="record in feedingRecords" :key="record.id" class="card record-row">
        <view>
          <text class="record-date">{{ record.feedingDate }}</text>
          <text class="caption">{{ record.foodType || '常规喂食' }} {{ record.foodAmount ? `· ${record.foodAmount}` : '' }}</text>
        </view>
        <text class="caption">{{ record.notes || '无备注' }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">健康记录</text>
      <view v-if="healthRecords.length === 0" class="card empty small-empty">暂无健康记录</view>
      <view v-for="record in healthRecords" :key="record.id" class="card record-row">
        <view>
          <text class="record-date">{{ record.recordDate }}</text>
          <text class="caption">体重 {{ record.weight || '-' }}g · 食欲{{ record.appetite }} · 活动{{ record.activity }}</text>
        </view>
        <text class="tag" :class="record.healthStatus === '健康' ? 'tag-green' : record.healthStatus === '待观察' ? 'tag-yellow' : 'tag-red'">{{ record.healthStatus }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.detail-hero {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 32rpx;
  border-radius: 28rpx;
  background: #fffdf9;
  box-shadow: 0 12rpx 36rpx rgba(73, 56, 39, 0.06);
}
.detail-avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 32rpx;
  background: #e7f6ef;
  color: #2f7d63;
  text-align: center;
  line-height: 110rpx;
  font-size: 48rpx;
  font-weight: 800;
}
.detail-main { flex: 1; min-width: 0; }
.hero-meta {
  display: block;
  margin-top: 8rpx;
  color: #756b60;
  font-size: 25rpx;
}
.schedule-card,
.info-card { padding: 28rpx; }
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
  margin: 28rpx 0;
}
.schedule-grid > view {
  padding: 22rpx;
  border-radius: 18rpx;
  background: #f5efe5;
}
.schedule-value {
  display: block;
  margin-top: 8rpx;
  font-size: 30rpx;
  font-weight: 800;
}
.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}
.info-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eee6da;
  color: #756b60;
  font-size: 26rpx;
}
.info-row:last-child { border-bottom: 0; }
.record-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 16rpx;
  padding: 22rpx;
}
.record-date {
  display: block;
  font-size: 29rpx;
  font-weight: 800;
}
.small-empty {
  margin-top: 16rpx;
  padding: 36rpx;
  color: #8b8177;
}
</style>
