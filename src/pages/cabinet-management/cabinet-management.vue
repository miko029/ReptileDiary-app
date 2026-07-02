<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { CabinetSlot, ReptileCabinet } from '@/types'
import { deleteCabinet, getCabinets, getPets, saveCabinet } from '@/utils/store'

const cabinets = ref<ReptileCabinet[]>([])
const editingId = ref('')
const form = reactive({
  name: '',
  notes: '',
  slots: [{ id: '', name: '', notes: '' }] as CabinetSlot[],
})

const title = computed(() => (editingId.value ? '编辑爬柜' : '新增爬柜'))

const refresh = () => {
  cabinets.value = getCabinets()
}

const resetForm = () => {
  editingId.value = ''
  form.name = ''
  form.notes = ''
  form.slots = [{ id: '', name: '', notes: '' }]
}

const editCabinet = (cabinet: ReptileCabinet) => {
  editingId.value = cabinet.id
  form.name = cabinet.name
  form.notes = cabinet.notes
  form.slots = cabinet.slots.length ? cabinet.slots.map(slot => ({ ...slot })) : [{ id: '', name: '', notes: '' }]
}

const addSlot = () => {
  form.slots.push({ id: '', name: '', notes: '' })
}

const removeSlot = (index: number) => {
  if (form.slots.length === 1) {
    form.slots[0] = { id: '', name: '', notes: '' }
    return
  }
  form.slots.splice(index, 1)
}

const save = () => {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入爬柜名称', icon: 'none' })
    return
  }
  if (!form.slots.some(slot => slot.name.trim())) {
    uni.showToast({ title: '请至少填写一个柜位', icon: 'none' })
    return
  }
  saveCabinet({ id: editingId.value || undefined, name: form.name, notes: form.notes, slots: form.slots })
  uni.showToast({ title: '保存成功', icon: 'success' })
  resetForm()
  refresh()
}

const removeCabinet = (cabinet: ReptileCabinet) => {
  const usedCount = getPets().filter(pet => pet.cabinetId === cabinet.id).length
  uni.showModal({
    title: '删除爬柜',
    content: usedCount ? `有 ${usedCount} 只宠物正在使用该爬柜，删除后会清空它们的位置。` : `确认删除 ${cabinet.name} 吗？`,
    confirmColor: '#BD3D34',
    success: result => {
      if (!result.confirm) return
      deleteCabinet(cabinet.id)
      if (editingId.value === cabinet.id) resetForm()
      refresh()
      uni.showToast({ title: '已删除', icon: 'success' })
    },
  })
}

onShow(refresh)
</script>

<template>
  <view class="page">
    <view class="between page-head">
      <view>
        <text class="title">爬柜管理</text>
        <text class="caption">维护爬柜和柜位，给每只宠物绑定实际饲养位置。</text>
      </view>
      <button v-if="editingId" class="secondary-mini" @tap="resetForm">新增</button>
    </view>

    <view class="card form-card">
      <text class="section-title">{{ title }}</text>
      <view class="field"><text class="label">爬柜名称 *</text><input v-model="form.name" class="input" placeholder="如：A 号爬柜" /></view>
      <view class="field"><text class="label">位置备注</text><input v-model="form.notes" class="input" placeholder="如：客厅东侧、恒温架上层" /></view>
      <view class="field">
        <view class="between slot-head">
          <text class="label">柜位 *</text>
          <button class="text-btn" @tap="addSlot">添加柜位</button>
        </view>
        <view v-for="(slot, index) in form.slots" :key="index" class="slot-row">
          <input v-model="slot.name" class="input slot-input" :placeholder="`柜位 ${index + 1}`" />
          <button class="remove-btn" @tap="removeSlot(index)">删除</button>
        </view>
      </view>
      <button class="primary-btn save-btn" @tap="save">保存爬柜</button>
    </view>

    <view class="section">
      <text class="section-title">已有爬柜</text>
      <view v-if="cabinets.length === 0" class="card empty small-empty">暂无爬柜，先新增一个爬柜和柜位。</view>
      <view v-for="cabinet in cabinets" :key="cabinet.id" class="card cabinet-card">
        <view class="between">
          <view>
            <text class="cabinet-name">{{ cabinet.name }}</text>
            <text class="caption">{{ cabinet.notes || '无备注' }}</text>
          </view>
          <view class="row actions">
            <button class="text-btn" @tap="editCabinet(cabinet)">编辑</button>
            <button class="danger-text" @tap="removeCabinet(cabinet)">删除</button>
          </view>
        </view>
        <view class="slot-tags">
          <text v-for="slot in cabinet.slots" :key="slot.id" class="tag tag-gray">{{ slot.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page-head { margin-bottom: 24rpx; }
.secondary-mini {
  width: 112rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: #e9dfd2;
  color: #4d4035;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 64rpx;
}
.form-card { padding: 28rpx; }
.field {
  padding: 24rpx 0 0;
}
.label {
  display: block;
  margin-bottom: 14rpx;
  color: #4d4035;
  font-size: 27rpx;
  font-weight: 600;
}
.slot-head .label { margin-bottom: 0; }
.text-btn,
.danger-text {
  color: #2f7d63;
  font-size: 26rpx;
  font-weight: 700;
}
.danger-text { color: #bd3d34; }
.slot-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 14rpx;
}
.slot-input { flex: 1; }
.remove-btn {
  width: 96rpx;
  height: 76rpx;
  border-radius: 16rpx;
  background: #ffe7e4;
  color: #bd3d34;
  font-size: 25rpx;
  line-height: 76rpx;
}
.save-btn { margin-top: 26rpx; }
.small-empty {
  margin-top: 16rpx;
  padding: 40rpx 24rpx;
  color: #8b8177;
}
.cabinet-card {
  margin-top: 16rpx;
  padding: 24rpx;
}
.cabinet-name {
  display: block;
  color: #25211d;
  font-size: 31rpx;
  font-weight: 800;
}
.actions { gap: 22rpx; }
.slot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}
</style>
