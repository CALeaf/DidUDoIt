import { useState, useEffect } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { getMonthDays, getMonthPadding, toDateStr } from '../utils'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function DateRangePicker({ startDate, endDate, onChange, hex }) {
  const [current, setCurrent] = useState(new Date())
  const [phase, setPhase] = useState('start')

  useEffect(() => {
    if (!startDate) setPhase('start')
    else if (!endDate) setPhase('end')
  }, [startDate, endDate])

  const year = current.getFullYear()
  const month = current.getMonth()
  const days = getMonthDays(year, month)
  const padding = getMonthPadding(year, month)

  const handleDay = (ds) => {
    if (phase === 'start') {
      onChange({ startDate: ds, endDate: '' })
      setPhase('end')
    } else {
      if (ds < startDate) {
        onChange({ startDate: ds, endDate: '' })
      } else if (ds === startDate) {
        onChange({ startDate: ds, endDate: ds })
        setPhase('start')
      } else {
        onChange({ startDate, endDate: ds })
        setPhase('start')
      }
    }
  }

  const hasRange = startDate && endDate && startDate !== endDate

  const inStrip   = (ds) => hasRange && ds >= startDate && ds <= endDate
  const isStart   = (ds) => ds === startDate
  const isEnd     = (ds) => ds === endDate && hasRange
  const isMid     = (ds) => hasRange && ds > startDate && ds < endDate
  const isSelected = (ds) => ds === startDate || (hasRange && ds === endDate)

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrent(subMonths(current, 1))}
          className="p-1.5 rounded-lg text-gray-400 active:bg-gray-100 active:text-gray-600">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700">{format(current, 'MMM yyyy')}</span>
        <button
          onClick={() => setCurrent(addMonths(current, 1))}
          className="p-1.5 rounded-lg text-gray-400 active:bg-gray-100 active:text-gray-600">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Picking hint */}
      <p className="text-[11px] text-center font-medium mb-2" style={{ color: hex + 'cc' }}>
        {phase === 'start' ? 'Tap start date' : 'Tap end date'}
      </p>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-400 font-medium py-0.5">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: padding }).map((_, i) => <div key={`p${i}`} />)}
        {days.map(day => {
          const ds = toDateStr(day)
          const sel = isSelected(ds)
          const mid = isMid(ds)
          const start = isStart(ds)
          const end = isEnd(ds)

          return (
            <button key={ds} onClick={() => handleDay(ds)}
              className="relative flex items-center justify-center py-0.5 active:opacity-70">
              {/* range strip */}
              {inStrip(ds) && (
                <div className="absolute top-0.5 bottom-0.5 pointer-events-none"
                  style={{
                    left: start ? '50%' : 0,
                    right: end ? '50%' : 0,
                    background: hex + '22',
                  }} />
              )}
              {/* circle */}
              <div className="relative w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium"
                style={{
                  background: sel ? hex : 'transparent',
                  color: sel ? '#fff' : mid ? hex : '#374151',
                }}>
                {day.getDate()}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected range summary */}
      {startDate && (
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs">
          <span className="font-semibold" style={{ color: hex }}>{startDate}</span>
          {endDate && <>
            <span className="text-gray-300">→</span>
            <span className="font-semibold" style={{ color: hex }}>{endDate}</span>
          </>}
          {!endDate && <span className="text-gray-400">→ pick end date</span>}
        </div>
      )}
    </div>
  )
}
