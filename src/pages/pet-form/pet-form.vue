<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { HealthStatus, Pet, PetCategory, PetSex } from '@/types'
import { todayString } from '@/utils/date'
import { getPetById, getSettings, savePet } from '@/utils/store'

const categoryOptions: PetCategory[] = ['蛇', '蜥蜴', '守宫', '龟', '蜘蛛', '其他']
const sexOptions: PetSex[] = ['未知', '公', '母']
const healthOptions: HealthStatus[] = ['健康', '待观察', '异常']

const id = ref('')
const title = ref('添加宠物')
const form = reactive({
  name: '',
  category: '守宫' as PetCategory,
  sex: '未知' as PetSex,
  species: '',
  morph: '',
  purchaseDate: '',
  birthDate: '',
  feedingCycleDays: 7,
  lastFeedingDate: todayString(),
  healthStatus: '健康' as HealthStatus,
  notes: '',
  photoUrl: '',
})

onLoad(query => {
  const pet = query?.id ? getPetById(String(query.id)) : undefined
  if (pet) {
    id.value = pet.id
    title.value = '编辑宠物'
    Object.assign(form, pet)
    uni.setNavigationBarTitle({ title: '编辑宠物' })
    return
  }
  form.feedingCycleDays = getSettings().defaultFeedingCycleDays
})

const save = () => {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
  }
  if (!form.feedingCycleDays || form.feedingCycleDays <= 0) {
    uni.showToast({ title: '喂食周期需大于 0', icon: 'none' })
    return
  }
  const pet = savePet({ ...(form as Pet), id: id.value || undefined })
  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => uni.redirectTo({ url: `/pages/pet-detail/pet-detail?id=${pet.id}` }), 350)
}
</script>

<template>
  <view class="page">
    <view class="form-head">
      <text class="title">{{ title }}</text>
      <text class="caption">名称、分类和喂食周期为必填项。</text>
    </view>

    <view class="card form-card">
      <view class="field"><text class="label">名称 *</text><input v-model="form.name" class="input" placeholder="如：小黄" /></view>
      <view class="field">
        <text class="label">分类 *</text>
        <picker :range="categoryOptions" :value="categoryOptions.indexOf(form.category)" @change="form.category = categoryOptions[Number($event.detail.value)]">
          <view class="picker-line">{{ form.category }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">性别</text>
        <picker :range="sexOptions" :value="sexOptions.indexOf(form.sex)" @change="form.sex = sexOptions[Number($event.detail.value)]">
          <view class="picker-line">{{ form.sex }}</view>
        </picker>
      </view>
      <view class="field"><text class="label">品种</text><input v-model="form.species" class="input" placeholder="如：豹纹守宫" /></view>
      <view class="field"><text class="label">基因</text><input v-model="form.morph" class="input" placeholder="如：Tremper Albino" /></view>
      <view class="field">
        <text class="label">购入日期</text>
        <picker mode="date" :value="form.purchaseDate" @change="form.purchaseDate = String($event.detail.value)">
          <view class="picker-line">{{ form.purchaseDate || '请选择' }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">出生日期</text>
        <picker mode="date" :value="form.birthDate" @change="form.birthDate = String($event.detail.value)">
          <view class="picker-line">{{ form.birthDate || '请选择' }}</view>
        </picker>
      </view>
      <view class="field"><text class="label">喂食周期 *</text><input v-model.number="form.feedingCycleDays" class="input" type="number" placeholder="每多少天喂一次" /></view>
      <view class="field">
        <text class="label">上次喂食日期</text>
        <picker mode="date" :value="form.lastFeedingDate" @change="form.lastFeedingDate = String($event.detail.value)">
          <view class="picker-line">{{ form.lastFeedingDate || '请选择' }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">健康状态</text>
        <picker :range="healthOptions" :value="healthOptions.indexOf(form.healthStatus)" @change="form.healthStatus = healthOptions[Number($event.detail.value)]">
          <view class="picker-line">{{ form.healthStatus }}</view>
        </picker>
      </view>
      <view class="field"><text class="label">备注</text><textarea v-model="form.notes" class="textarea" placeholder="记录饲养习惯、食欲偏好或注意事项" /></view>
    </view>

    <button class="primary-btn save-btn" @tap="save">保存档案</button>
  </view>
</template>

<style scoped>
.form-head { margin-bottom: 24rpx; }
.form-card { padding: 0 26rpx; }
.field {
  padding: 28rpx 0;
  border-bottom: 1rpx solid #eee6da;
}
.field:last-child { border-bottom: 0; }
.label {
  display: block;
  margin-bottom: 14rpx;
  color: #4d4035;
  font-size: 27rpx;
  font-weight: 600;
}
.picker-line {
  height: 76rpx;
  box-sizing: border-box;
  border-radius: 16rpx;
  background: #f5efe5;
  color: #25211d;
  padding: 0 22rpx;
  font-size: 28rpx;
  line-height: 76rpx;
}
.save-btn { margin-top: 28rpx; }
</style>
