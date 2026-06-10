<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Activity, Appetite, HealthStatus, Pet, ShedStatus } from '@/types'
import { todayString } from '@/utils/date'
import { addHealthRecord, getPetById, getPets } from '@/utils/store'

const shedOptions: ShedStatus[] = ['否', '是']
const appetiteOptions: Appetite[] = ['正常', '减弱', '拒食']
const activityOptions: Activity[] = ['正常', '活跃', '少动']
const healthOptions: HealthStatus[] = ['健康', '待观察', '异常']

const pets = ref<Pet[]>([])
const petId = ref('')
const petName = ref('')
const form = reactive({
  recordDate: todayString(),
  weight: '' as number | '',
  shedStatus: '否' as ShedStatus,
  appetite: '正常' as Appetite,
  activity: '正常' as Activity,
  healthStatus: '健康' as HealthStatus,
  notes: '',
})

onLoad(query => {
  pets.value = getPets()
  petId.value = String(query?.petId || pets.value[0]?.id || '')
  petName.value = getPetById(petId.value)?.name || ''
})

const selectPet = (index: number) => {
  const pet = pets.value[index]
  petId.value = pet.id
  petName.value = pet.name
}

const save = () => {
  if (!petId.value) {
    uni.showToast({ title: '请先添加宠物', icon: 'none' })
    return
  }
  addHealthRecord({ petId: petId.value, ...form })
  uni.showToast({ title: '记录成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 350)
}
</script>

<template>
  <view class="page">
    <view class="form-head">
      <text class="title">添加健康记录</text>
      <text class="caption">记录体重、蜕皮、食欲和活动状态。</text>
    </view>

    <view class="card form-card">
      <view class="field">
        <text class="label">宠物</text>
        <picker :range="pets" range-key="name" @change="selectPet(Number($event.detail.value))">
          <view class="picker-line">{{ petName || '请选择宠物' }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">记录日期</text>
        <picker mode="date" :value="form.recordDate" @change="form.recordDate = String($event.detail.value)">
          <view class="picker-line">{{ form.recordDate }}</view>
        </picker>
      </view>
      <view class="field"><text class="label">体重 g</text><input v-model.number="form.weight" class="input" type="number" placeholder="如：45" /></view>
      <view class="field">
        <text class="label">是否蜕皮</text>
        <picker :range="shedOptions" :value="shedOptions.indexOf(form.shedStatus)" @change="form.shedStatus = shedOptions[Number($event.detail.value)]"><view class="picker-line">{{ form.shedStatus }}</view></picker>
      </view>
      <view class="field">
        <text class="label">食欲</text>
        <picker :range="appetiteOptions" :value="appetiteOptions.indexOf(form.appetite)" @change="form.appetite = appetiteOptions[Number($event.detail.value)]"><view class="picker-line">{{ form.appetite }}</view></picker>
      </view>
      <view class="field">
        <text class="label">活动状态</text>
        <picker :range="activityOptions" :value="activityOptions.indexOf(form.activity)" @change="form.activity = activityOptions[Number($event.detail.value)]"><view class="picker-line">{{ form.activity }}</view></picker>
      </view>
      <view class="field">
        <text class="label">健康状态</text>
        <picker :range="healthOptions" :value="healthOptions.indexOf(form.healthStatus)" @change="form.healthStatus = healthOptions[Number($event.detail.value)]"><view class="picker-line">{{ form.healthStatus }}</view></picker>
      </view>
      <view class="field"><text class="label">备注</text><textarea v-model="form.notes" class="textarea" placeholder="如：今天蜕皮完整" /></view>
    </view>

    <button class="primary-btn save-btn" @tap="save">保存健康记录</button>
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
