import { useState, useMemo } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { fmtTime, calcStreak, exportJSON, shareOrDownload } from '../utils'
import { getColor } from '../colors'

export default function CheckInView({ store }) {
  const { checkins, excludes, activeHabit, activeId, addCheckin, deleteCheckin, markBackup } = store
  const [flash, setFlash] = useState(false)
  const [backupDismissed, setBackupDismissed] = useState(false)
  const color = getColor(activeHabit.color)

  const todayCheckins = checkins
    .filter(c => isToday(parseISO(c.timestamp)))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const streak = useMemo(() => calcStreak(checkins, excludes), [checkins, excludes])

  const daysSinceBackup = useMemo(() => {
    const last = localStorage.getItem(`lastBackup_${activeId}`)
    if (!last) return checkins.length > 0 ? 999 : null
    return Math.floor((Date.now() - new Date(last)) / 86400000)
  }, [activeId, checkins.length])

  const showBackupBanner = !backupDismissed && daysSinceBackup !== null && daysSinceBackup >= 14

  const handleBackupNow = async () => {
    const date = new Date().toISOString().slice(0, 10)
    await shareOrDownload(exportJSON(checkins, activeHabit.name), `${activeHabit.name}_${date}.json`, 'application/json')
    markBackup()
    setBackupDismissed(true)
  }

  const handleCheckin = () => {
    addCheckin()
    setFlash(true)
    setTimeout(() => setFlash(false), 900)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6"
        style={{ background: `linear-gradient(180deg, ${color.hex}18 0%, transparent 100%)` }}>

        {showBackupBanner && (
          <div className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 mb-4" style={{ background: '#fef9ec' }}>
            <span className="text-base shrink-0">💾</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-700">
                {daysSinceBackup >= 999 ? 'Never backed up' : `Last backup ${daysSinceBackup}d ago`}
              </p>
              <p className="text-[11px] text-amber-500">Export to keep your data safe</p>
            </div>
            <button onClick={handleBackupNow}
              className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1.5 rounded-xl shrink-0 active:bg-amber-200">
              Export
            </button>
            <button onClick={() => setBackupDismissed(true)} className="text-amber-300 active:text-amber-500 shrink-0 p-0.5">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <p className="text-sm text-gray-400 tracking-wide mb-4">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>

        {streak.current > 1 && (
          <div className="flex items-center gap-1.5 rounded-full px-4 py-1.5 mb-5 text-sm font-semibold"
            style={{ background: color.hex + '18', color: color.hex }}>
            <span>🔥</span>
            <span>{streak.current} day streak</span>
          </div>
        )}
        {streak.current <= 1 && <div className="mb-5" />}

        <button
          onTouchEnd={e => { e.preventDefault(); handleCheckin() }}
          onClick={handleCheckin}
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center select-none transition-all duration-200 active:scale-95"
          style={{
            background: flash ? '#22c55e' : color.hex,
            boxShadow: flash ? '0 20px 50px rgba(34,197,94,0.38)' : `0 20px 50px ${color.hex}48`
          }}>
          <svg viewBox="0 0 24 24" className="w-12 h-12 mb-1 text-white" fill="none" stroke="currentColor" strokeWidth={2.2}>
            {flash
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            }
          </svg>
          <span className="text-white font-semibold text-lg">{flash ? 'Done!' : 'Check In'}</span>
        </button>

        <p className="mt-6 text-sm text-gray-500">
          <span className="font-bold text-base" style={{ color: color.hex }}>{todayCheckins.length}</span>
          {' '}time{todayCheckins.length !== 1 ? 's' : ''} today
        </p>
      </div>

      {todayCheckins.length > 0 && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Today's Records</p>
          <div className="space-y-2">
            {todayCheckins.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: i === 0 ? color.hex : color.hex + '70' }}>
                    {todayCheckins.length - i}
                  </div>
                  <span className="text-gray-700 font-medium tabular-nums">{fmtTime(c.timestamp)}</span>
                </div>
                <button onClick={() => deleteCheckin(c.id)} className="text-gray-300 active:text-red-400 p-1.5 -mr-1">
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
