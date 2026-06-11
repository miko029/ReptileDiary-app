# 爬宠管家多端应用

这是一个基于 **uni-app + Vue3 + TypeScript** 的多端项目

## 支持端

- 微信小程序：`pnpm dev:mp-weixin` / `pnpm build:mp-weixin`
- H5：`pnpm dev:h5` / `pnpm build:h5`
- App：`pnpm build:app`

## 第一版功能

- 首页：今日待喂、逾期提醒、健康概况、本周喂食安排
- 宠物：添加、编辑、删除、搜索、筛选、详情
- 喂食：快速打卡、自动计算下一次喂食日期、喂食记录
- 日历：按月查看已喂、应喂、逾期
- 健康：健康管理、健康记录、健康状态同步
- 我的：提醒设置、默认喂食周期、健康管理、数据导出预留

## 开发预览

```bash
pnpm install
pnpm dev:h5
```

微信小程序预览：

```bash
pnpm dev:mp-weixin
```

然后用微信开发者工具打开：

```text
/Users/miko0029/Downloads/ReptileDiary-app
```

小程序根目录为：

```text
dist/build/mp-weixin/
```

## 数据说明

当前 MVP 使用 `uni.setStorageSync` 做跨端本地存储。后续接微信云开发、uniCloud 或自建后端时，主要替换：

```text
src/utils/store.ts
```

页面、类型和喂食计算逻辑可以继续复用。
