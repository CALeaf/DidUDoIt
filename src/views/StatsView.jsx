import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { calcStreak, calcAvgInterval, getLast30Days, getCheckinsByDate, isExcluded, toDateStr } from '../utils'
import { getColor } from '../colors'

const icons = {
  streak: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4M7 4H4a1 1 0 00-1 1v3a4 4 0 004 4h.5M17 4h3a1 1 0 011 1v3a4 4 0 01-4 4h-.5M7 4h10v6a5 5 0 01-10 0V4z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  freq: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function StatCard({ label, value, sub, hex, icon }) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col gap-2.5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: hex + '18', color: hex }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight" style={{ color: hex }}>{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
  )
}

function BarChart({ data, hex }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const W = 320, H = 56, barW = 6, gap = (W - data.length * barW) / (data.length - 1)
  return (
    <svg viewBox={`0 0 ${W} ${H + 4}`} className="w-full" style={{ height: 68 }}>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={0} x2={W} y1={H - f * H} y2={H - f * H}
          stroke="#f3f4f6" strokeWidth={1} />
      ))}
      {data.map((d, i) => {
        const bh = Math.max((d.count / max) * H, d.count > 0 ? 5 : 2)
        return (
          <rect key={d.date} x={i * (barW + gap)} y={H - bh} width={barW} height={bh}
            fill={d.count > 0 ? hex : '#e5e7eb'} rx={3} />
        )
      })}
    </svg>
  )
}

export default function StatsView({ store }) {
  const { checkins, excludes, activeHabit } = store
  const color = getColor(activeHabit.color)

  const streak    = useMemo(() => calcStreak(checkins, excludes), [checkins, excludes])
  const avgInt    = useMemo(() => calcAvgInterval(checkins, excludes), [checkins, excludes])
  const last30    = useMemo(() => getLast30Days(checkins), [checkins])
  const byDate    = useMemo(() => getCheckinsByDate(checkins), [checkins])
  const totalDays = Object.keys(byDate).length

  const avgLabel = avgInt === null ? '—'
    : avgInt === 1 ? '每天'
    : `每${avgInt}天`
  const avgSub = avgInt !== null && avgInt > 1 ? '打卡 1 次' : avgInt === 1 ? '都打卡' : undefined

  const months = useMemo(() => {
    const result = []
    const now = new Date()
    for (let m = 0; m < 6; m++) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const days = eachDayOfInterval({ start: startOfMonth(d), end: endOfMonth(d) })
      const excl = days.filter(day => isExcluded(toDateStr(day), excludes)).length
      const hit  = days.filter(day => byDate[toDateStr(day)] && !isExcluded(toDateStr(day), excludes)).length
      const elig = days.length - excl
      result.push({ label: format(d, 'M月', { locale: zhCN }), fullLabel: format(d, 'yyyy年M月', { locale: zhCN }), hit, elig, excl })
    }
    return result
  }, [byDate, excludes])

  return (
    <div className="px-5 pb-8">
      <h2 className="text-xl font-bold text-gray-900 pt-5 mb-5">统计</h2>

      {/* 2×2 stat grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="当前连续" value={streak.current} sub="天" hex={color.hex} icon={icons.streak} />
        <StatCard label="最长连续" value={streak.longest} sub="天" hex={color.hex} icon={icons.trophy} />
        <StatCard label="累计打卡" value={totalDays} sub={`共 ${checkins.length} 次`} hex={color.hex} icon={icons.calendar} />
        <StatCard label="平均频率" value={avgLabel} sub={avgSub} hex={color.hex} icon={icons.freq} />
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p className="text-sm font-semibold text-gray-700 mb-3">近 30 天</p>
        <BarChart data={last30} hex={color.hex} />
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-gray-400">{last30[0]?.date?.slice(5)}</span>
          <span className="text-[11px] text-gray-400">今天</span>
        </div>
      </div>

      {/* Monthly summary */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p className="text-sm font-semibold text-gray-700 mb-4">月度总结</p>
        <div className="space-y-4">
          {months.map((m, i) => {
            const pct = m.elig > 0 ? m.hit / m.elig : 0
            return (
              <div key={m.fullLabel}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className={`text-sm ${i === 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                    {m.fullLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    {m.excl > 0 && <span className="text-[11px] text-gray-300">豁免{m.excl}天</span>}
                    <span className="text-sm font-semibold" style={{ color: pct > 0 ? color.hex : '#9ca3af' }}>
                      {Math.round(pct * 100)}%
                    </span>
                    <span className="text-xs text-gray-400">{m.hit}/{m.elig}天</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct * 100}%`, background: color.hex }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
