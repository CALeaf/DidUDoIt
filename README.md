# DidUDoIt · 打卡

> 免费、开源、无广告的个人习惯打卡 app，数据存在本地，可安装到 iPhone 主屏幕。

## 功能

- **多习惯管理** — 创建多个打卡项目，独立颜色和数据
- **多次打卡** — 同一天可打卡多次，全部记录时间
- **豁免时间段** — 标记生理期、出差等特殊时段，连续天数统计自动排除
- **日历视图** — 4 级颜色区分（1次 / 2次 / 3次+ / 豁免✕）
- **统计** — 当前连续、最长连续、累计天数、平均频率、月度完成率
- **导入 / 导出** — 支持 CSV 和 JSON，可跨 app 迁移数据

## 在 iPhone 上安装

1. 用 **Safari** 打开 → [https://caleaf.github.io/DidUDoIt](https://caleaf.github.io/DidUDoIt)
2. 点底部分享按钮 **「□↑」**
3. 选 **「添加到主屏幕」**
4. 完成，像普通 app 一样使用，数据保存在本地

> 仅支持 Safari（iOS 16.4+）。Chrome / Firefox 不支持 PWA 安装到主屏幕。

## 本地开发

```bash
git clone https://github.com/CALeaf/DidUDoIt.git
cd DidUDoIt
npm install
npm run dev
```

## 数据格式（导入）

**CSV**（每行一条记录）：
```
2024-01-15,09:30
2024-01-16T21:00:00
```

**JSON**：
```json
[
  { "timestamp": "2024-01-15T09:30:00.000Z" },
  { "timestamp": "2024-01-16T21:00:00.000Z" }
]
```

## 技术栈

- React 18 + Vite
- Tailwind CSS
- date-fns
- PWA（vite-plugin-pwa）
- 数据本地存储（localStorage）

---

MIT License
