<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getSettings, saveSettings } from '@/utils/store'

const presets = [3, 5, 7, 10, 14, 21]
const defaultFeedingCycleDays = ref(getSettings().defaultFeedingCycleDays)

onShow(() => {
  defaultFeedingCycleDays.value = getSettings().defaultFeedingCycleDays
})

const save = () => {
  if (!defaultFeedingCycleDays.value || defaultFeedingCycleDays.value <= 0) {
    uni.showToast({ title: '周期需大于 0', icon: 'none' })
    return
  }
  saveSettings({ ...getSettings(), defaultFeedingCycleDays: defaultFeedingCycleDays.value })
  uni.showToast({ title: '已保存', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 350)
}
</script>

<template>
  <view class="page">
    <view>
      <text class="title">默认喂食周期</text>
      <text class="caption">新增宠物时会自动带入这个周期，也可以在宠物档案中单独修改。</text>
    </view>

    <view class="card cycle-card section">
      <text class="label">默认周期（天）</text>
      <input v-model.number="defaultFeedingCycleDays" class="input cycle-input" type="number" />
      <view class="preset-grid">
        <button v-for="preset in presets" :key="preset" class="preset" :class="{ active: defaultFeedingCycleDays === preset }" @tap="defaultFeedingCycleDays = preset">每 {{ preset }} 天</button>
      </view>
    </view>

    <view class="card tips section">
      <text class="section-title">常见参考</text>
      <text class="caption">守宫幼体常见 2-3 天，成体 3-7 天；蛇类常见 7-14 天。实际仍以品种、年龄、温度、食欲和兽医建议为准。</text>
    </view>

    <button class="primary-btn save-btn" @tap="save">保存默认周期</button>
  </view>
</template>

<style scoped>
.cycle-card { padding: 28rpx; }
.label {
  display: block;
  margin-bottom: 16rpx;
  color: #4d4035;
  font-size: 27rpx;
  font-weight: 600;
}
.cycle-input { margin-bottom: 22rpx; }
.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}
.preset {
  height: 64rpx;
  border-radius: 999rpx;
  background: #f5efe5;
  color: #756b60;
  font-size: 25rpx;
  line-height: 64rpx;
}
.preset.active {
  background: #2f7d63;
  color: #ffffff;
}
.tips { padding: 28rpx; }
.tips .caption {
  margin-top: 14rpx;
  line-height: 1.65;
}
.save-btn { margin-top: 28rpx; }
</style>
