<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { UserSettings } from '@/types'
import { getSettings, saveSettings } from '@/utils/store'

type PickerEvent = { detail: { value: string | number } }

const settings = ref<UserSettings>(getSettings())

onShow(() => {
  settings.value = getSettings()
})

const save = () => {
  saveSettings(settings.value)
  uni.showToast({ title: '已保存', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 350)
}

const getSwitchValue = (event: Event) => (event as unknown as { detail: { value: boolean } }).detail.value

const setReminderEnabled = (event: Event) => {
  settings.value.feedingReminderEnabled = getSwitchValue(event)
}

const setOverdueEnabled = (event: Event) => {
  settings.value.overdueReminderEnabled = getSwitchValue(event)
}

const setAdvanceEnabled = (event: Event) => {
  settings.value.advanceReminderEnabled = getSwitchValue(event)
}

const setReminderTime = (event: PickerEvent) => {
  settings.value.reminderTime = String(event.detail.value)
}
</script>

<template>
  <view class="page">
    <view>
      <text class="title">提醒设置</text>
      <text class="caption">第一版以站内提醒逻辑为主，微信订阅消息已预留。</text>
    </view>

    <view class="card settings-card section">
      <view class="setting-row">
        <view><text class="label">开启喂食提醒</text><text class="caption">到达下次喂食日期时提醒</text></view>
        <switch :checked="settings.feedingReminderEnabled" color="#2F7D63" @change="setReminderEnabled" />
      </view>
      <view class="setting-row">
        <view><text class="label">默认提醒时间</text><text class="caption">每天固定时间查看待喂</text></view>
        <picker mode="time" :value="settings.reminderTime" @change="setReminderTime">
          <view class="time-pill">{{ settings.reminderTime }}</view>
        </picker>
      </view>
      <view class="setting-row">
        <view><text class="label">逾期提醒</text><text class="caption">超过下次喂食日期仍未打卡时提醒</text></view>
        <switch :checked="settings.overdueReminderEnabled" color="#2F7D63" @change="setOverdueEnabled" />
      </view>
      <view class="setting-row">
        <view><text class="label">提前一天提醒</text><text class="caption">适合需要提前准备饵料的宠物</text></view>
        <switch :checked="settings.advanceReminderEnabled" color="#2F7D63" @change="setAdvanceEnabled" />
      </view>
    </view>

    <button class="primary-btn save-btn" @tap="save">保存设置</button>
  </view>
</template>

<style scoped>
.settings-card { padding: 0 26rpx; }
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  min-height: 116rpx;
  border-bottom: 1rpx solid #eee6da;
}
.setting-row:last-child { border-bottom: 0; }
.label {
  display: block;
  color: #4d4035;
  font-size: 27rpx;
  font-weight: 600;
}
.time-pill {
  min-width: 118rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: #e7f6ef;
  color: #2f7d63;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 58rpx;
}
.save-btn { margin-top: 28rpx; }
</style>
