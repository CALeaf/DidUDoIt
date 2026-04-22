import { useState } from 'react'
import { useStore } from './store'
import HabitPicker from './components/HabitPicker'
import CheckInView from './views/CheckInView'
import CalendarView from './views/CalendarView'
import StatsView from './views/StatsView'
import SettingsView from './views/SettingsView'

const TABS = [
  { id: 'checkin', label: '打卡', icon: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-5" />
    </svg>
  )},
  { id: 'calendar', label: '日历', icon: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )},
  { id: 'stats', label: '统计', icon: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V14M9 20V8M14 20v-6M19 20V4" />
    </svg>
  )},
  { id: 'settings', label: '设置', icon: (active) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )}
]

export default function App() {
  const [activeTab, setActiveTab] = useState('checkin')
  const store = useStore()
  const { habits, activeHabit, setActiveHabit, addHabit } = store

  const views = { checkin: CheckInView, calendar: CalendarView, stats: StatsView, settings: SettingsView }
  const View = views[activeTab]

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50">
      <div className="pt-safe shrink-0">
        <HabitPicker
          habits={habits}
          activeHabit={activeHabit}
          onSelect={setActiveHabit}
          onAdd={addHabit}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <View store={store} />
      </div>
      <nav className="flex border-t border-gray-200 bg-white pb-safe shrink-0">
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`}
            >
              {tab.icon(active)}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
