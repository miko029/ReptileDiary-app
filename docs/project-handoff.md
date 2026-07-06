# 爬宠管家项目交接记录

本文档整理本次对话里的项目、功能和 Figma 设计信息，方便同步到另一台设备继续开发或设计。

## 项目信息

- 本地项目目录：`C:\Users\Administrator\ReptileDiary-app`
- GitHub 仓库：`https://github.com/miko029/ReptileDiary-app.git`
- 技术栈：uni-app / Vue / TypeScript
- 页面配置文件：`src/pages.json`
- 页面目录：`src/pages`
- 已新增文档：
  - `docs/pages.md`
  - `docs/project-handoff.md`

## 本地开发状态

已在项目中添加过“按爬柜批量喂食打卡”功能：

- `src/utils/store.ts`
  - 新增 `addCabinetFeedingRecords(cabinetId, feedingDate, notes, foodType)`
  - 支持按爬柜给未打卡宠物批量生成喂食记录
- `src/pages/index/index.vue`
  - 新增爬柜选择
  - 新增“按爬柜喂食打卡 / 整柜打卡”入口
- 已执行过类型检查：`npm run typecheck`，当时通过
- 之前启动过本地 H5 预览：`http://localhost:5173/`

## 当前项目页面清单

### 一级 Tab 页面

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `pages/index/index` | 今日概览、待喂、逾期、单只打卡、整柜打卡、本周安排 |
| 宠物列表 | `pages/pets/pets` | 宠物列表、筛选、搜索、爬柜入口、进入详情 |
| 日历 | `pages/calendar/calendar` | 月历查看喂食计划、选中日期安排、补记喂食 |
| 我的 | `pages/profile/profile` | 统计、提醒设置、默认周期、健康管理、数据导出、关于 |

### 二级功能页

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 宠物详情 | `pages/pet-detail/pet-detail` | 单只宠物档案、喂食信息、喂食/健康记录 |
| 新增/编辑宠物 | `pages/pet-form/pet-form` | 宠物建档、喂食周期、健康状态、爬柜位置 |
| 爬柜管理 | `pages/cabinet-management/cabinet-management` | 新增/编辑/删除爬柜，维护柜位 |
| 健康管理 | `pages/health-management/health-management` | 健康状态筛选、健康统计、添加健康记录 |
| 健康记录表单 | `pages/health-record-form/health-record-form` | 体重、蜕皮、食欲、活动、健康状态 |
| 提醒设置 | `pages/reminder-settings/reminder-settings` | 喂食提醒、提醒时间、逾期提醒、提前提醒 |
| 默认喂食周期 | `pages/feed-cycle-settings/feed-cycle-settings` | 新增宠物默认喂食周期 |

## Figma 文件

主 Figma 文件：

`爬宠管家 UI 样式规范`

链接：

`https://www.figma.com/design/a8VuBB7Gdn5jIrnwaiIUi4/%E7%88%AC%E5%AE%A0%E7%AE%A1%E5%AE%B6-UI-%E6%A0%B7%E5%BC%8F%E8%A7%84%E8%8C%83?node-id=0-1&m=dev`

文件 Key：

`a8VuBB7Gdn5jIrnwaiIUi4`

## 已确定的视觉规范

### 主色与基础色

| 用途 | 色值 |
| --- | --- |
| 页面背景 | `#F7F3ED` |
| 卡片背景 | `#FFFFFF` |
| 柔和卡片/输入背景 | `#FDFAF3` / `#EEE6DA` |
| 轻边界 | `#EEE6DA`，建议 `0.5px` |
| 主文字 | `#3D3020` |
| 次级文字 | `#8A7860` |
| 弱文字 | `#B0A090` |
| 主绿色 | `#5B8C4A` |
| 待观察/待喂 | `#E8A835` |
| 异常/逾期 | `#BD3D34` |

### 设计原则

- 移动端 App 规范优先，不按 Web 落地
- 页面背景使用暖米色，普通卡片使用纯白色
- 卡片使用轻边界，不要重阴影
- 卡片圆角建议 `16px`
- 主按钮最小高度建议 `44px`
- 内容区域左右边距建议 `16px`
- 文字不要过粗，优先使用 `Medium`，少用 `Bold`
- 页面要符合 iOS 和国内移动端常见设计习惯

## Figma 已创建/调整的页面节点

| 页面 | 节点 | 状态 |
| --- | --- | --- |
| 我的 | `102:59` | 已创建，纯白卡片版本 |
| 宠物列表 | `105:59` | 已优化为 `宠物列表 / Pets - Optimized with Cabinets` |
| 宠物详情 | `105:148` | 已创建 |
| 新增宠物 | `105:197` | 已创建，修过表单压叠 |
| 爬柜管理 | `105:235` | 已创建 |
| 日历 | `109:59` | 已创建，并按参考链接改为暖棕色 editorial 日历风格 |
| 移动端规范页 | `3:26` | 已优化为移动端 App UI 规范 |

## 重要 Figma 设计决策记录

### 配色选择

之前比较过两组配色，最终更推荐：

- 主绿色：`#5B8C4A`
- 背景：`#F7F3ED`
- 卡片：`#FFFFFF`
- 主文字：`#3D3020`
- 次级文字：`#8A7860`

原因：

- 更适合爬宠管理工具
- 温和但不脏
- 比高饱和配色更耐看

### 卡片颜色

已经确认普通卡片使用纯白色更好。

结论：

- 页面背景保留暖米色
- 功能卡片使用纯白
- 用 `#EEE6DA` 做轻边界

### 轻边界

建议加。

原因：

- 纯白卡片放在暖米色背景上需要轻微分隔
- 比阴影更克制
- 更适合移动端工具型 App

### 字体粗细

用户反馈之前加粗太粗，已调整：

- 页面标题、宠物名、按钮文字以 `Medium` 为主
- 尽量少用 `Bold`
- 避免 Noto Sans SC Bold 大面积出现

## 宠物列表页优化记录

对比节点：

- 参考页：`137:91`
- 原创建页：`105:59`

参考页 `137:91` 优点：

- 有搜索框
- 顶部层级更清楚，有“我的爬宠”和说明文案
- 宠物卡片信息密度更高
- 卡片里有性别、上次喂食、下次喂食
- 状态筛选更完整

原 `105:59` 优点：

- 视觉更干净
- 纯白卡片和轻边界更符合当前规范
- 有爬柜入口
- 有柜位信息
- 浮动底部导航更统一

最终优化结果：

- 节点仍为 `105:59`
- 页面名：`宠物列表 / Pets - Optimized with Cabinets`
- 新增搜索框
- 增强爬柜管理卡片
- 增加爬柜筛选：全部 / A柜 / B柜 / C柜 / 待喂
- 保留状态筛选：健康 / 待观察 / 异常 / 已逾期
- 宠物卡片加入柜位标签，如 `A-01`、`B-03`
- 宠物卡片加入性别、上次喂食、下次喂食
- 画板高度调整为 `375 x 1207`，适合完整展示长列表

## 日历页优化记录

用户要求日历风格参考链接：

`https://www.figma.com/design/YKuUeDwzv44LmahE0TRx8q/ReptileDiary-app?node-id=78-2&m=dev`

最终调整节点：

- `109:59`
- 页面名：`日历 / Feeding Calendar - Link Style`

主要变化：

- 主色从绿色改为暖棕色系
- 使用大圆角白色月历卡
- 月份切换按钮为浅棕圆形按钮
- 选中日期使用棕色圆角高亮和阴影
- 图例放在月历卡底部
- 下方详情卡参考链接的图片 + 宠物信息 + 状态胶囊 + 操作按钮结构

## 我的页设计记录

节点：

- `102:59`

内容来自当前项目 `profile.vue`：

- 头像/应用信息
- 总宠物
- 本周已喂
- 今日待喂
- 异常宠物
- 提醒设置
- 默认喂食周期
- 健康管理
- 数据导出
- 关于产品

风格：

- 暖米色背景
- 纯白卡片
- 轻边界
- 底部导航高亮“我的”

## 还没完成/建议继续补的页面设计

按当前状态，Figma 设计还建议继续补：

| 页面 | 优先级 | 说明 |
| --- | --- | --- |
| 首页 | P0 | 最重要，需按最新规范重做，突出今日待喂、整柜打卡、本周安排 |
| 健康管理 | P1 | 健康状态列表、健康统计、筛选、记录入口 |
| 健康记录表单 | P1 | 与新增宠物表单共享表单规范 |
| 提醒设置 | P2 | iOS 风格设置列表，开关、时间选择器、说明 |
| 默认喂食周期 | P2 | 轻量设置页，数字输入或步进器 |

核心下一步建议：

1. 先重做首页
2. 再做健康管理
3. 再做健康记录表单
4. 最后补提醒设置和默认喂食周期

## 隐私/同步注意事项

- 本地新增文件不会自动同步到 GitHub
- 如果要同步，需要手动提交和推送：

```bash
git add docs/pages.md docs/project-handoff.md
git commit -m "docs: add project handoff notes"
git push
```

- Codex/Claude 的回答不会因为你本地打开项目而自动进入公司内网
- 但如果使用公司设备、公司网络、代理、终端审计、浏览器审计或远程管理软件，可能会记录访问地址、命令、窗口标题或网络请求
- Figma 文件本身是云端协作文件，有权限的人可以看到文件里的设计修改

## 常用路径

```text
C:\Users\Administrator\ReptileDiary-app
C:\Users\Administrator\ReptileDiary-app\src\pages
C:\Users\Administrator\ReptileDiary-app\src\pages.json
C:\Users\Administrator\ReptileDiary-app\docs\pages.md
C:\Users\Administrator\ReptileDiary-app\docs\project-handoff.md
```

## 当前关键节点速查

```text
我的页：102:59
宠物列表：105:59
宠物详情：105:148
新增宠物：105:197
爬柜管理：105:235
日历：109:59
移动端规范页：3:26
```
