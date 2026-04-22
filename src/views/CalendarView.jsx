import { useState } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { toDateStr, getMonthDays, getMonthPadding, getCheckinsByDate, isExcluded, fmtTime } from '../utils'
import { getColor } from '../colors'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function cellStyle(count, hex) {
  if (count >= 3) return { bg: hex,          text: '#ffffff', subText: 'rgba(255,255,255,0.75)' }
  if (count === 2) return { bg: hex + 'bb',   text: '#ffffff', subText: 'rgba(255,255,255,0.75)' }
  if (count === 1) return { bg: hex + '28',   text: hex,       subText: hex }
  return null
}

export default function CalendarView({ store }) {
  const { checkins, excludes, activeHabit } = store
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const color = getColor(activeHabit.color)

  const year  = current.getFullYear()
  const month = current.getMonth()
  const days    = getMonthDays(year, month)
  const padding = getMonthPadding(year, month)
  const byDate  = getCheckinsByDate(checkins)
  const today   = toDateStr(new Date())

  const selectedCheckins = selected
    ? (byDate[selected] || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : []
  const selectedExclude = selected
    ? excludes.find(e => selected >= e.startDate && selected <= e.endDate)
    : null

  return (
    <div className="flex flex-col pb-6">
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 text-gray-400 active:text-gray-600">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-gray-900">{format(current, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 text-gray-400 active:text-gray-600">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[11px] text-gray-400 py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-3 gap-y-1.5">
        {Array.from({ length: padding }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const ds       = toDateStr(day)
          const excluded = isExcluded(ds, excludes)
          const count    = byDate[ds]?.length || 0
          const isToday  = ds === today
          const isSel    = selected === ds
          const cs       = cellStyle(count, color.hex)

          return (
            <button key={ds} onClick={() => setSelected(isSel ? null : ds)}
              className="aspect-square rounded-xl mx-0.5 flex flex-col items-center justify-center transition-all duration-150"
              style={{
                background: excluded ? '#f3f4f6' : cs ? cs.bg : 'transparent',
                boxShadow: isSel
                  ? `0 0 0 2.5px ${color.hex}`
                  : isToday && !cs && !excluded
                  ? `0 0 0 1.5px ${color.hex}88`
                  : 'none'
              }}>
              {excluded ? (
                <>
                  <span className="text-[11px] text-gray-300 leading-none">{day.getDate()}</span>
                  <span className="text-[13px] font-bold text-gray-300 leading-none mt-0.5">✕</span>
                </>
              ) : (
                <>
                  <span className={`text-sm font-medium leading-none ${!cs && isToday ? 'font-bold' : ''}`}
                    style={{ color: cs ? cs.text : isToday ? color.hex : '#374151' }}>
                    {day.getDate()}
                  </span>
                  {count > 0 && (
                    <span className="text-[9px] mt-0.5 leading-none" style={{ color: cs?.subText }}>
                      {count}×
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-5 mt-4 flex-wrap">
        {[
          { bg: color.hex,        label: '3+' },
          { bg: color.hex + 'bb', label: '2×' },
          { bg: color.hex + '28', label: '1×' },
          { bg: null,             label: 'Exempt', cross: true },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: l.cross ? '#f3f4f6' : l.bg, color: l.cross ? '#9ca3af' : '#fff' }}>
              {l.cross ? '✕' : null}
            </div>
            <span className="text-xs text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Day detail */}
      {selected && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <p className="text-sm font-semibold text-gray-800 mb-3">
            {format(new Date(selected), 'EEEE, MMMM d')}
          </p>
          {selectedExclude && (
            <div className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 mb-3" style={{ background: '#fef9ec' }}>
              <span className="text-base leading-none mt-0.5">✕</span>
              <div>
                <p className="text-xs font-semibold text-amber-700">Exempt</p>
                <p className="text-sm text-amber-600 mt-0.5">{selectedExclude.reason}</p>
                <p className="text-[11px] text-amber-400 mt-1">{selectedExclude.startDate} — {selectedExclude.endDate}</p>
              </div>
            </div>
          )}
          {selectedCheckins.length === 0 && !selectedExclude && (
            <p className="text-sm text-gray-400">No records for this day</p>
          )}
          {selectedCheckins.length > 0 && (
            <div className="space-y-1">
              {selectedCheckins.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 py-1">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: color.hex + (i === 0 ? '' : '99') }}>
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700 tabular-nums">{fmtTime(c.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
