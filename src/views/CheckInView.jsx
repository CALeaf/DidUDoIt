import { useState, useMemo } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { fmtTime, calcStreak } from '../utils'
import { getColor } from '../colors'

export default function CheckInView({ store }) {
  const { checkins, excludes, activeHabit, addCheckin, deleteCheckin } = store
  const [flash, setFlash] = useState(false)
  const color = getColor(activeHabit.color)

  const todayCheckins = checkins
    .filter(c => isToday(parseISO(c.timestamp)))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const streak = useMemo(() => calcStreak(checkins, excludes), [checkins, excludes])

  const handleCheckin = () => {
    addCheckin()
    setFlash(true)
    setTimeout(() => setFlash(false), 900)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hero — flex-1 so it fills available space and centers content */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 py-6"
        style={{ background: `linear-gradient(180deg, ${color.hex}18 0%, transparent 100%)` }}
      >
        <p className="text-sm text-gray-400 tracking-wide mb-4">
          {format(new Date(), 'yyyy年M月d日 EEEE', { locale: zhCN })}
        </p>

        {streak.current > 1 && (
          <div
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 mb-5 text-sm font-semibold"
            style={{ background: color.hex + '18', color: color.hex }}
          >
            <span>🔥</span>
            <span>连续 {streak.current} 天</span>
          </div>
        )}
        {streak.current <= 1 && <div className="mb-5" />}

        {/* Button */}
        <button
          onTouchEnd={e => { e.preventDefault(); handleCheckin() }}
          onClick={handleCheckin}
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center select-none transition-all duration-200 active:scale-95"
          style={{
            background: flash ? '#22c55e' : color.hex,
            boxShadow: flash
              ? '0 20px 50px rgba(34,197,94,0.38)'
              : `0 20px 50px ${color.hex}48`
          }}
        >
          <svg viewBox="0 0 24 24" className="w-12 h-12 mb-1 text-white" fill="none" stroke="currentColor" strokeWidth={2.2}>
            {flash
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            }
          </svg>
          <span className="text-white font-semibold text-lg">{flash ? '已打卡！' : '打卡'}</span>
        </button>

        <p className="mt-6 text-sm text-gray-500">
          今日{' '}
          <span className="font-bold text-base" style={{ color: color.hex }}>
            {todayCheckins.length}
          </span>{' '}
          次
        </p>
      </div>

      {/* Records */}
      {todayCheckins.length > 0 && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">今日记录</p>
          <div className="space-y-2">
            {todayCheckins.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: i === 0 ? color.hex : color.hex + '70' }}
                  >
                    {todayCheckins.length - i}
                  </div>
                  <span className="text-gray-700 font-medium tabular-nums">{fmtTime(c.timestamp)}</span>
                </div>
                <button
                  onClick={() => deleteCheckin(c.id)}
                  className="text-gray-300 active:text-red-400 p-1.5 -mr-1"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
