<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { ensureSeedData } from '@/utils/store'

onLaunch(() => {
  ensureSeedData()
})
</script>

<style>
page {
  min-height: 100%;
  background: #f7f3ed;
  color: #25211d;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  font-size: 28rpx;
}

button {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  line-height: 1.2;
}

button::after {
  border: 0;
}

.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24rpx 28rpx 132rpx;
  background: #f7f3ed;
}

.section {
  margin-top: 24rpx;
}

.card {
  box-sizing: border-box;
  border: 1rpx solid rgba(62, 51, 39, 0.08);
  border-radius: 20rpx;
  background: #fffdf9;
  box-shadow: 0 12rpx 36rpx rgba(73, 56, 39, 0.06);
}

.row {
  display: flex;
  align-items: center;
}

.between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.caption {
  display: block;
  color: #8b8177;
  font-size: 24rpx;
}

.title {
  display: block;
  color: #25211d;
  font-size: 36rpx;
  font-weight: 700;
}

.section-title {
  display: block;
  color: #25211d;
  font-size: 32rpx;
  font-weight: 700;
}

.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999rpx;
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.tag-green {
  background: #e7f6ef;
  color: #2f7d63;
}

.tag-yellow {
  background: #fff4d8;
  color: #a56600;
}

.tag-red {
  background: #ffe7e4;
  color: #bd3d34;
}

.tag-blue {
  background: #e8f1ff;
  color: #356fb0;
}

.tag-gray {
  background: #ede8df;
  color: #756b60;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border-radius: 18rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.primary-btn {
  background: #2f7d63;
  color: #ffffff;
}

.secondary-btn {
  background: #e9dfd2;
  color: #4d4035;
}

.danger-btn {
  background: #ffe7e4;
  color: #bd3d34;
}

.input,
.textarea {
  box-sizing: border-box;
  width: 100%;
  border-radius: 16rpx;
  background: #f5efe5;
  color: #25211d;
  font-size: 28rpx;
}

.input {
  height: 76rpx;
  padding: 0 22rpx;
}

.textarea {
  min-height: 160rpx;
  padding: 20rpx 22rpx;
}

.empty {
  padding: 72rpx 32rpx;
  text-align: center;
}

.empty-icon {
  margin: 0 auto 20rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 32rpx;
  background: #e7f6ef;
  color: #2f7d63;
  font-size: 48rpx;
  line-height: 96rpx;
  text-align: center;
}
</style>
