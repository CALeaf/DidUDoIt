import { useState, useRef, useEffect } from 'react'
import { parseImport, exportCSV, exportJSON, shareOrDownload } from '../utils'
import { COLORS, getColor } from '../colors'
import DateRangePicker from '../components/DateRangePicker'

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ icon, title, sub, right, onClick, danger }) {
  const content = (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${onClick ? 'active:bg-gray-50' : ''} ${danger ? 'active:bg-red-50' : ''}`}>
      {icon && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gray-100">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-gray-800'}`}>{title}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  )
  return onClick ? <button className="w-full text-left" onClick={onClick}>{content}</button> : <div>{content}</div>
}

export default function SettingsView({ store }) {
  const { activeHabit, updateHabit, deleteHabit, habits, excludes, addExclude, deleteExclude, importCheckins, checkins } = store
  const color = getColor(activeHabit.color)

  const [nameInput, setNameInput]     = useState(activeHabit.name)
  const [nameSaved, setNameSaved]     = useState(false)
  const [showAddExc, setShowAddExc]   = useState(false)
  const [showAllExc, setShowAllExc]   = useState(false)
  const [excForm, setExcForm]         = useState({ startDate: '', endDate: '', reason: '' })
  const [importMsg, setImportMsg]     = useState('')
  const [tracklistHabits, setTracklistHabits] = useState(null)
  const [showDelConfirm, setShowDel]  = useState(false)
  const fileRef = useRef()


  // sync name input only when switching to a different habit
  useEffect(() => { setNameInput(activeHabit.name) }, [activeHabit.id])

  const saveName = () => {
    if (!nameInput.trim()) return
    updateHabit(activeHabit.id, { name: nameInput.trim() })
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 1500)
  }

  const submitExclude = () => {
    if (!excForm.startDate || !excForm.endDate || excForm.startDate > excForm.endDate) return
    addExclude(excForm.startDate, excForm.endDate, excForm.reason.trim())
    setExcForm({ startDate: '', endDate: '', reason: '' })
    setShowAddExc(false)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const parsed = parseImport(await file.text())
    if (parsed?._type === 'tracklist') {
      setTracklistHabits(parsed.habits)
      setImportMsg('')
      e.target.value = ''
      return
    }
    setImportMsg(parsed.length === 0
      ? 'No valid records found. Check the file format.'
      : `Imported ${importCheckins(parsed)} new records (${parsed.length} parsed)`)
    e.target.value = ''
  }

  const handleTracklistPick = (records) => {
    const count = importCheckins(records)
    setImportMsg(`Imported ${count} new records`)
    setTracklistHabits(null)
  }

  const handleExport = async (fmt) => {
    const name = activeHabit.name
    const date = new Date().toISOString().slice(0, 10)
    if (fmt === 'csv') {
      await shareOrDownload(exportCSV(checkins), `${name}_${date}.csv`, 'text/csv')
    } else {
      await shareOrDownload(exportJSON(checkins, name), `${name}_${date}.json`, 'application/json')
    }
  }

  const ShareIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )

  return (
    <div className="px-5 pb-8">
      <h2 className="text-xl font-bold text-gray-900 pt-5 mb-5">Settings</h2>

      {/* Name */}
      <Section title="Habit Name">
        <div className="flex items-center px-4 py-3 gap-3">
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            className="flex-1 text-gray-800 text-base outline-none bg-transparent"
            placeholder="Name your habit"
          />
          <button
            onClick={saveName}
            className="text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
            style={nameSaved ? { color: '#16a34a', background: '#f0fdf4' } : { color: color.hex, background: color.hex + '15' }}
          >
            {nameSaved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </Section>

      {/* Color */}
      <Section title="Color">
        <div className="flex items-center gap-3 px-4 py-4">
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => updateHabit(activeHabit.id, { color: c.id })}
              className="w-9 h-9 rounded-full transition-all duration-150"
              style={{
                background: c.hex,
                transform: activeHabit.color === c.id ? 'scale(1.15)' : 'scale(1)',
                boxShadow: activeHabit.color === c.id ? `0 0 0 3px white, 0 0 0 5px ${c.hex}` : 'none',
                opacity: activeHabit.color === c.id ? 1 : 0.65
              }}
            />
          ))}
        </div>
      </Section>

      {/* Exclude periods */}
      <Section title="Skip Periods">
        {excludes.length === 0 && !showAddExc && (
          <p className="px-4 py-3 text-sm text-gray-400">No skip periods added</p>
        )}
        {(showAllExc ? excludes : excludes.slice(0, 3)).map(e => (
          <div key={e.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex-1 min-w-0">
              {e.reason
                ? <p className="text-sm font-medium text-gray-800 truncate">{e.reason}</p>
                : <p className="text-sm text-gray-400 italic">No reason</p>
              }
              <p className="text-xs text-gray-400 mt-0.5">{e.startDate} — {e.endDate}</p>
            </div>
            <button onClick={() => deleteExclude(e.id)} className="text-gray-300 active:text-red-400 p-1 shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {showAddExc && (
          <div className="px-4 py-3 border-t border-gray-50 space-y-3">
            <input
              autoFocus
              value={excForm.reason}
              onChange={e => setExcForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Reason (e.g. vacation, illness)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-300"
            />
            <DateRangePicker
              startDate={excForm.startDate}
              endDate={excForm.endDate}
              onChange={({ startDate, endDate }) => setExcForm(f => ({ ...f, startDate, endDate }))}
              hex={color.hex}
            />
            <div className="flex gap-2">
              <button onClick={submitExclude} className="flex-1 text-white rounded-xl py-2.5 text-sm font-semibold" style={{ background: color.hex }}>
                Confirm
              </button>
              <button onClick={() => setShowAddExc(false)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm active:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        )}
        {excludes.length > 3 && !showAddExc && (
          <button onClick={() => setShowAllExc(v => !v)}
            className="w-full px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-50 active:bg-gray-50">
            {showAllExc ? 'Show less ▲' : `Show ${excludes.length - 3} more ▼`}
          </button>
        )}
        {!showAddExc && (
          <button
            onClick={() => setShowAddExc(true)}
            className="w-full px-4 py-3 text-sm font-semibold text-left border-t border-gray-50 active:bg-gray-50"
            style={{ color: color.hex }}
          >
            + Add Skip Period
          </button>
        )}
      </Section>

      {/* Export */}
      <Section title="Export Data">
        <div className="divide-y divide-gray-50">
          <Row
            icon={<span className="text-[11px] font-bold text-green-600">CSV</span>}
            title="Export as CSV"
            sub="Open with Excel or Numbers"
            right={<ShareIcon />}
            onClick={() => handleExport('csv')}
          />
          <Row
            icon={<span className="text-[11px] font-bold text-blue-500">JSON</span>}
            title="Export as JSON"
            sub="For re-import or developer use"
            right={<ShareIcon />}
            onClick={() => handleExport('json')}
          />
        </div>
      </Section>

      {/* Import */}
      <Section title="Import Data">
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            Supports CSV (one ISO timestamp per row or date,time)<br />
            and JSON (<code className="bg-gray-100 px-1 rounded">[{'{'}timestamp{'}'}]</code>)
          </p>
          {tracklistHabits ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Which habit to import?</p>
              {tracklistHabits.map((h, i) => (
                <button key={i} onClick={() => handleTracklistPick(h.records)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 active:opacity-70 transition-opacity"
                  style={{ background: color.hex + '12', color: color.hex }}>
                  <span className="text-sm font-semibold">{h.title}</span>
                  <span className="text-xs opacity-70">{h.count} records</span>
                </button>
              ))}
              <button onClick={() => setTracklistHabits(null)}
                className="w-full text-xs text-gray-400 py-1 active:text-gray-600">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-4 text-sm font-semibold active:opacity-70 transition-opacity"
              style={{ borderColor: color.hex + '50', color: color.hex }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Choose File to Import
            </button>
          )}
          <input ref={fileRef} type="file" accept=".csv,.json,.txt,.data" className="hidden" onChange={handleFile} />
          {importMsg && (
            <p className={`mt-3 text-sm text-center font-medium ${importMsg.includes('Imported') ? 'text-green-600' : 'text-red-500'}`}>
              {importMsg}
            </p>
          )}
        </div>
      </Section>

      {/* Delete habit */}
      {habits.length > 1 && (
        <Section title="Danger Zone">
          {showDelConfirm ? (
            <div className="px-4 py-4 space-y-3">
              <p className="text-sm text-gray-600">
                Delete "{activeHabit.name}"? All records will be <span className="text-red-500 font-semibold">permanently deleted</span>.
              </p>
              <div className="flex gap-2">
                <button onClick={() => deleteHabit(activeHabit.id)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold active:bg-red-600">
                  Delete
                </button>
                <button onClick={() => setShowDel(false)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm active:bg-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <Row title={`Delete "${activeHabit.name}"`} danger onClick={() => setShowDel(true)} />
          )}
        </Section>
      )}
    </div>
  )
}
