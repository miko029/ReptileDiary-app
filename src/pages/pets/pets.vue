<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { FeedingStatus, Pet } from '@/types'
import { diffDays } from '@/utils/date'
import { getFeedingStatus, getStatusClass } from '@/utils/feeding'
import { getFeedingRecords, getPets } from '@/utils/store'

type PetView = Pet & { categoryInitial: string; feedingStatus: FeedingStatus; statusClass: string; daysSinceLast: string }

const filters = ['全部', '健康', '待观察', '异常', '待喂食', '已逾期']
const activeFilter = ref('全部')
const keyword = ref('')
const pets = ref<PetView[]>([])

const visiblePets = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  return pets.value.filter(pet => {
    const matchKeyword = !key || [pet.name, pet.species, pet.morph].join(' ').toLowerCase().includes(key)
    const matchFilter =
      activeFilter.value === '全部' ||
      pet.healthStatus === activeFilter.value ||
      (activeFilter.value === '待喂食' && pet.feedingStatus === '今日待喂') ||
      (activeFilter.value === '已逾期' && pet.feedingStatus === '已逾期')
    return matchKeyword && matchFilter
  })
})

const refresh = () => {
  const records = getFeedingRecords()
  pets.value = getPets().map(pet => {
    const feedingStatus = getFeedingStatus(pet, records)
    const days = pet.lastFeedingDate ? diffDays(pet.lastFeedingDate) : ''
    return {
      ...pet,
      categoryInitial: pet.category.slice(0, 1),
      feedingStatus,
      statusClass: getStatusClass(feedingStatus),
      daysSinceLast: days === '' ? '未记录' : `${days} 天前`,
    }
  })
}

const goAdd = () => uni.navigateTo({ url: '/pages/pet-form/pet-form' })
const goDetail = (petId: string) => uni.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${petId}` })

onShow(refresh)
</script>

<template>
  <view class="page">
    <view class="between page-head">
      <view>
        <text class="title">我的爬宠</text>
        <text class="caption">搜索、筛选并查看每只宠物状态</text>
      </view>
      <button class="add-mini" @tap="goAdd">+</button>
    </view>

    <input v-model="keyword" class="input search" placeholder="搜索名称、品种或基因" />

    <scroll-view scroll-x class="filter-scroll">
      <view class="filter-row">
        <button v-for="filter in filters" :key="filter" class="filter" :class="{ active: activeFilter === filter }" @tap="activeFilter = filter">{{ filter }}</button>
      </view>
    </scroll-view>

    <view v-if="visiblePets.length === 0" class="card empty section">
      <view class="empty-icon">爬</view>
      <text class="section-title">没有匹配的宠物</text>
      <text class="caption">可以调整筛选条件，或添加一只新的爬宠。</text>
    </view>

    <view v-for="pet in visiblePets" :key="pet.id" class="card pet-card" @tap="goDetail(pet.id)">
      <view class="between">
        <view class="row pet-title-row">
          <view class="avatar">{{ pet.categoryInitial }}</view>
          <view>
            <text class="pet-name">{{ pet.name }}</text>
            <text class="caption">{{ pet.category }} · {{ pet.species || '未填写品种' }}</text>
          </view>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="tag-row">
        <text class="tag" :class="pet.healthStatus === '健康' ? 'tag-green' : pet.healthStatus === '待观察' ? 'tag-yellow' : 'tag-red'">{{ pet.healthStatus }}</text>
        <text class="tag" :class="pet.statusClass">{{ pet.feedingStatus }}</text>
      </view>
      <view class="pet-meta">
        <text>性别：{{ pet.sex }}</text>
        <text>上次喂食：{{ pet.daysSinceLast }}</text>
        <text>下次：{{ pet.nextFeedingDate || '待设置' }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page-head { margin-bottom: 24rpx; }
.add-mini {
  width: 76rpx;
  height: 76rpx;
  border-radius: 22rpx;
  background: #2f7d63;
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 72rpx;
}
.search { margin-bottom: 18rpx; }
.filter-scroll {
  width: 100%;
  white-space: nowrap;
}
.filter-row {
  display: flex;
  gap: 14rpx;
  padding-bottom: 8rpx;
}
.filter {
  display: inline-flex;
  height: 60rpx;
  align-items: center;
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
.pet-card {
  margin-top: 18rpx;
  padding: 24rpx;
}
.pet-title-row { gap: 18rpx; }
.avatar {
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
.pet-name {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
}
.arrow {
  color: #8b8177;
  font-size: 48rpx;
}
.tag-row {
  display: flex;
  gap: 12rpx;
  margin-top: 22rpx;
}
.pet-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-top: 22rpx;
  color: #756b60;
  font-size: 24rpx;
}
</style>
