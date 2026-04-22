import { useState } from 'react'
import { COLORS, getColor } from '../colors'

export default function HabitPicker({ habits, activeHabit, onSelect, onAdd }) {
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('rose')
  const color = getColor(activeHabit.color)

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd(newName.trim(), newColor)
    setNewName('')
    setNewColor('rose')
    setAdding(false)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger bar */}
      <div className="flex items-center justify-center px-4 py-2 bg-white border-b border-gray-100">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full active:bg-gray-100 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.hex }} />
          <span className="text-base font-semibold text-gray-800 max-w-[180px] truncate">{activeHabit.name}</span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setOpen(false); setAdding(false) }} />
          <div className="relative bg-white rounded-t-3xl pb-safe overflow-hidden">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 mb-2">选择习惯</p>

            {habits.map(h => {
              const c = getColor(h.color)
              const isActive = h.id === activeHabit.id
              return (
                <button
                  key={h.id}
                  onClick={() => { onSelect(h.id); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 active:bg-gray-50 ${isActive ? 'bg-gray-50' : ''}`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.hex }} />
                  <span className={`flex-1 text-left text-base ${isActive ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {h.name}
                  </span>
                  {isActive && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}

            <div className="border-t border-gray-100 mt-1">
              {adding ? (
                <div className="px-5 py-4 space-y-3">
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="新习惯名称"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base outline-none focus:border-indigo-400"
                  />
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setNewColor(c.id)}
                        className={`w-8 h-8 rounded-full transition-all ${newColor === c.id ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                        style={{ background: c.hex, ringColor: c.hex }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium active:bg-indigo-700">
                      创建
                    </button>
                    <button onClick={() => setAdding(false)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm active:bg-gray-200">
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-indigo-600 active:bg-gray-50"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-base font-medium">新建习惯</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
