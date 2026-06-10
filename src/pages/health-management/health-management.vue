<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { Pet } from '@/types'
import { getHealthRecords, getPets } from '@/utils/store'

type PetHealthView = Pet & { lastRecordDate: string }

const filters = ['全部', '健康', '待观察', '异常']
const activeFilter = ref('全部')
const pets = ref<PetHealthView[]>([])

const stats = computed(() => ({
  healthy: pets.value.filter(pet => pet.healthStatus === '健康').length,
  watching: pets.value.filter(pet => pet.healthStatus === '待观察').length,
  abnormal: pets.value.filter(pet => pet.healthStatus === '异常').length,
}))
const visiblePets = computed(() => pets.value.filter(pet => activeFilter.value === '全部' || pet.healthStatus === activeFilter.value))

const refresh = () => {
  const records = getHealthRecords()
  pets.value = getPets().map(pet => {
    const last = records.find(record => record.petId === pet.id)
    return { ...pet, lastRecordDate: last?.recordDate || '暂无记录' }
  })
}

const goDetail = (petId: string) => uni.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${petId}` })
const addRecord = (petId: string) => uni.navigateTo({ url: `/pages/health-record-form/health-record-form?petId=${petId}` })

onShow(refresh)
</script>

<template>
  <view class="page">
    <view>
      <text class="title">健康管理</text>
      <text class="caption">快速查看需要关注的爬宠</text>
    </view>

    <view class="health-stats section">
      <view class="card stat healthy"><text>{{ stats.healthy }}</text><text>健康</text></view>
      <view class="card stat watching"><text>{{ stats.watching }}</text><text>待观察</text></view>
      <view class="card stat abnormal"><text>{{ stats.abnormal }}</text><text>异常</text></view>
    </view>

    <scroll-view scroll-x class="filter-scroll section">
      <view class="filter-row">
        <button v-for="filter in filters" :key="filter" class="filter" :class="{ active: activeFilter === filter }" @tap="activeFilter = filter">{{ filter }}</button>
      </view>
    </scroll-view>

    <view v-for="pet in visiblePets" :key="pet.id" class="card health-row">
      <view @tap="goDetail(pet.id)">
        <text class="pet-name">{{ pet.name }}</text>
        <text class="caption">{{ pet.species || pet.category }} · 最近记录 {{ pet.lastRecordDate }}</text>
      </view>
      <view class="row actions">
        <text class="tag" :class="pet.healthStatus === '健康' ? 'tag-green' : pet.healthStatus === '待观察' ? 'tag-yellow' : 'tag-red'">{{ pet.healthStatus }}</text>
        <button class="record-btn" @tap="addRecord(pet.id)">记录</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.health-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.stat {
  padding: 24rpx 8rpx;
  text-align: center;
}
.stat text:first-child {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
}
.stat text:last-child {
  display: block;
  margin-top: 6rpx;
  color: #756b60;
  font-size: 24rpx;
}
.healthy text:first-child { color: #2f7d63; }
.watching text:first-child { color: #a56600; }
.abnormal text:first-child { color: #bd3d34; }
.filter-scroll {
  width: 100%;
  white-space: nowrap;
}
.filter-row {
  display: flex;
  gap: 14rpx;
}
.filter {
  height: 60rpx;
  border-radius: 999rpx;
  background: #fffdf9;
  color: #756b60;
  padding: 0 24rpx;
  font-size: 25rpx;
  line-height: 60rpx;
}
.filter.active {
  background: #2f7d63;
  color: #ffffff;
}
.health-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 16rpx;
  padding: 24rpx;
}
.pet-name {
  display: block;
  font-size: 31rpx;
  font-weight: 800;
}
.actions { gap: 12rpx; }
.record-btn {
  width: 90rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: #2f7d63;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 58rpx;
}
</style>
