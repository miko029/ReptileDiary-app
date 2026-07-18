<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { FeedingStatus, Pet, ReptileCabinet } from '@/types'
import { diffDays } from '@/utils/date'
import { getFeedingStatus, getStatusClass } from '@/utils/feeding'
import { getCabinetLocationText, getCabinets, getFeedingRecords, getPets } from '@/utils/store'

type PetView = Pet & { categoryInitial: string; feedingStatus: FeedingStatus; statusClass: string; daysSinceLast: string; locationText: string }

const filters = ['全部', '健康', '待观察', '异常', '待喂食', '已逾期']
const activeFilter = ref('全部')
const keyword = ref('')
const pets = ref<PetView[]>([])
const cabinets = ref<ReptileCabinet[]>([])

const totalSlots = computed(() => cabinets.value.reduce((total, cabinet) => total + cabinet.slots.length, 0))
const occupiedSlots = computed(() => new Set(pets.value.filter(pet => pet.cabinetSlotId).map(pet => pet.cabinetSlotId)).size)

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
  cabinets.value = getCabinets()
  pets.value = getPets().map(pet => {
    const feedingStatus = getFeedingStatus(pet, records)
    const days = pet.lastFeedingDate ? diffDays(pet.lastFeedingDate) : ''
    return {
      ...pet,
      categoryInitial: pet.category.slice(0, 1),
      feedingStatus,
      statusClass: getStatusClass(feedingStatus),
      daysSinceLast: days === '' ? '未记录' : `${days} 天前`,
      locationText: getCabinetLocationText(pet),
    }
  })
}

const goAdd = () => uni.navigateTo({ url: '/pages/pet-form/pet-form' })
const goCabinets = () => uni.navigateTo({ url: '/pages/cabinet-management/cabinet-management' })
const goDetail = (petId: string) => uni.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${petId}` })

onShow(refresh)
</script>

<template>
  <view class="pets-page">
    <view class="page-head">
      <view>
        <text class="page-title">我的爬宠</text>
        <text class="page-caption">搜索、筛选并查看每只宠物状态</text>
      </view>
      <button class="add-mini" @tap="goAdd">+</button>
    </view>

    <view class="search-box">
      <text class="search-icon">⌕</text>
      <input v-model="keyword" class="search-input" placeholder="搜索名称、品种或基因" placeholder-class="search-placeholder" />
    </view>

    <button class="cabinet-entry" @tap="goCabinets">
      <text class="cabinet-icon">▥</text>
      <view class="cabinet-copy">
        <text class="cabinet-title">爬柜管理</text>
        <text class="cabinet-desc">{{ cabinets.length }} 个爬柜 · {{ totalSlots }} 个柜位 · 已用 {{ occupiedSlots }} 个</text>
      </view>
      <view class="cabinet-action"><text>管理</text><text class="chevron">›</text></view>
    </button>

    <scroll-view scroll-x class="filter-scroll">
      <view class="filter-row">
        <button v-for="filter in filters" :key="filter" class="filter" :class="{ active: activeFilter === filter }" @tap="activeFilter = filter">{{ filter }}</button>
      </view>
    </scroll-view>

    <view v-if="visiblePets.length === 0" class="empty-card">
      <view class="empty-icon">爬</view>
      <text class="section-title">没有匹配的宠物</text>
      <text class="caption">可以调整筛选条件，或添加一只新的爬宠。</text>
    </view>

    <view v-for="pet in visiblePets" :key="pet.id" class="pet-card" @tap="goDetail(pet.id)">
      <view class="pet-card-head">
        <view class="pet-title-row">
          <view class="avatar">{{ pet.categoryInitial }}</view>
          <view class="pet-copy">
            <text class="pet-name">{{ pet.name }}</text>
            <text class="pet-species">{{ pet.category }} · {{ pet.species || '未填写品种' }}</text>
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
.pets-page{width:100%;max-width:430px;min-height:100vh;box-sizing:border-box;margin:0 auto;padding:0 32rpx 132rpx;overflow-x:hidden;background:#f7f3ed;color:#3d3020}.page-head{display:flex;align-items:center;justify-content:space-between;height:128rpx;padding-top:16rpx;box-sizing:border-box}.page-title{display:block;font-size:40rpx;font-weight:600;line-height:72rpx}.page-caption{display:block;color:#8a7860;font-size:24rpx;line-height:40rpx}.add-mini{display:flex;align-items:center;justify-content:center;width:92rpx;height:92rpx;margin:0;padding:0;border-radius:32rpx;background:#5b8c4a;box-shadow:0 8rpx 12rpx rgba(104,161,60,.35);color:#fff;font-size:48rpx;font-weight:400;line-height:92rpx}.add-mini::after,.cabinet-entry::after,.filter::after{border:0}.search-box{display:flex;align-items:center;gap:16rpx;height:88rpx;margin-top:24rpx;padding:0 32rpx;border-radius:24rpx;background:#eee6da;box-sizing:border-box}.search-icon{width:32rpx;color:#8a7860;font-size:32rpx;line-height:32rpx;transform:rotate(-15deg)}.search-input{height:42rpx;min-width:0;flex:1;color:#3d3020;font-size:28rpx;line-height:42rpx}.search-placeholder{color:#8b8177}.cabinet-entry{display:flex;align-items:center;width:100%;height:156rpx;margin:24rpx 0 0;padding:32rpx;border:1rpx solid #eee6da;border-radius:32rpx;background:#fff;color:#3d3020;text-align:left;box-sizing:border-box}.cabinet-icon{width:52rpx;flex-shrink:0;color:#8a7860;font-size:40rpx;line-height:52rpx}.cabinet-copy{min-width:0;flex:1;margin-left:26rpx}.cabinet-title{display:block;font-size:32rpx;font-weight:500;line-height:48rpx}.cabinet-desc{display:block;overflow:hidden;color:#8a7860;font-size:24rpx;line-height:36rpx;white-space:nowrap;text-overflow:ellipsis}.cabinet-action{display:flex;align-items:center;gap:8rpx;margin-left:12rpx;color:#5b8c4a;font-size:26rpx;font-weight:500;white-space:nowrap}.chevron{font-size:36rpx}.filter-scroll{width:100%;margin-top:24rpx;white-space:nowrap}.filter-row{display:flex;gap:16rpx;padding-bottom:2rpx}.filter{display:inline-flex;align-items:center;justify-content:center;height:64rpx;margin:0;padding:0 34rpx;border:1rpx solid #c8b8a0;border-radius:999rpx;background:transparent;color:#8a7860;font-size:28rpx;font-weight:500;line-height:64rpx;white-space:nowrap}.filter.active{border-color:#5b8c4a;background:#5b8c4a;color:#fff}.pet-card{margin-top:24rpx;padding:32rpx;border:1rpx solid #eee6da;border-radius:32rpx;background:#fff;box-sizing:border-box}.pet-card-head{display:flex;align-items:center;justify-content:space-between}.pet-title-row{display:flex;align-items:center;min-width:0;gap:24rpx}.avatar{width:96rpx;height:96rpx;flex-shrink:0;border-radius:24rpx;background:#e1edd8;color:#5b8c4a;text-align:center;line-height:96rpx;font-size:36rpx;font-weight:600}.pet-copy{min-width:0}.pet-name{display:block;font-size:32rpx;font-weight:600;line-height:48rpx}.pet-species{display:block;max-width:400rpx;overflow:hidden;color:#8a7860;font-size:24rpx;line-height:40rpx;white-space:nowrap;text-overflow:ellipsis}.arrow{color:#8a7860;font-size:42rpx;line-height:42rpx}.tag-row{display:flex;gap:16rpx;margin-top:24rpx}.tag{padding:0 16rpx;font-size:24rpx;line-height:44rpx}.pet-meta{display:grid;grid-template-columns:auto auto minmax(0,1fr);align-items:center;gap:32rpx;margin-top:24rpx;padding-top:20rpx;border-top:1rpx solid #eee6da;color:#8a7860;font-size:24rpx;line-height:40rpx;white-space:nowrap}.pet-meta text:last-child{overflow:hidden;text-overflow:ellipsis}.empty-card{display:flex;flex-direction:column;align-items:center;margin-top:24rpx;padding:72rpx 32rpx;border:1rpx solid #eee6da;border-radius:32rpx;background:#fff}.empty-card .section-title{margin-top:12rpx}
@media(max-width:360px){.pets-page{padding-right:28rpx;padding-left:28rpx}.page-caption{font-size:22rpx}.cabinet-entry{padding-right:26rpx;padding-left:26rpx}.cabinet-copy{margin-left:18rpx}.cabinet-desc{max-width:320rpx}.filter{padding:0 28rpx}.pet-card{padding:28rpx}.pet-meta{gap:18rpx;font-size:21rpx}}
@media(min-width:431px){.pets-page{padding-right:16px;padding-left:16px;padding-bottom:66px}.page-head{height:64px;padding-top:8px}.page-title{font-size:20px;line-height:36px}.page-caption{font-size:12px;line-height:20px}.add-mini{width:46px;height:46px;border-radius:16px;font-size:24px;line-height:46px}.search-box{gap:8px;height:44px;margin-top:12px;padding:0 16px;border-radius:12px}.search-icon{width:16px;font-size:16px}.search-input{height:21px;font-size:14px;line-height:21px}.cabinet-entry{height:78px;margin-top:12px;padding:16px;border-radius:16px}.cabinet-icon{width:26px;font-size:20px;line-height:26px}.cabinet-copy{margin-left:13px}.cabinet-title{font-size:16px;line-height:24px}.cabinet-desc{font-size:12px;line-height:18px}.cabinet-action{gap:4px;margin-left:6px;font-size:13px}.chevron{font-size:18px}.filter-scroll{margin-top:12px}.filter-row{gap:8px}.filter{height:32px;padding:0 17px;font-size:14px;line-height:32px}.pet-card{margin-top:12px;padding:16px;border-radius:16px}.pet-title-row{gap:12px}.avatar{width:48px;height:48px;border-radius:12px;line-height:48px;font-size:18px}.pet-name{font-size:16px;line-height:24px}.pet-species{max-width:200px;font-size:12px;line-height:20px}.arrow{font-size:21px;line-height:21px}.tag-row{gap:8px;margin-top:12px}.tag{padding:0 8px;font-size:12px;line-height:22px}.pet-meta{gap:16px;margin-top:12px;padding-top:10px;font-size:12px;line-height:20px}.empty-card{margin-top:12px;padding:36px 16px;border-radius:16px}}
</style>
