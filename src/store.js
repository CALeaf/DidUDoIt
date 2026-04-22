import { useState, useEffect } from 'react'

const HABITS_KEY = 'habits_v2'
const ACTIVE_KEY = 'activeHabitId_v2'
const checkinsKey = (id) => `checkins_${id}`
const excludesKey = (id) => `excludes_${id}`

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

// Migrate single-habit v1 data if present
const initHabits = () => {
  const saved = load(HABITS_KEY, null)
  if (saved) return saved
  const id = crypto.randomUUID()
  const name = localStorage.getItem('habitName_v1') || '我的打卡'
  const v1Checkins = load('checkins_v1', null)
  const v1Excludes = load('excludes_v1', null)
  if (v1Checkins) localStorage.setItem(checkinsKey(id), JSON.stringify(v1Checkins))
  if (v1Excludes) localStorage.setItem(excludesKey(id), JSON.stringify(v1Excludes))
  const habits = [{ id, name, color: 'indigo' }]
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
  return habits
}

export function useStore() {
  const [habits, setHabitsState] = useState(initHabits)

  const [activeId, setActiveIdState] = useState(() => {
    const saved = localStorage.getItem(ACTIVE_KEY)
    const ids = load(HABITS_KEY, []).map(h => h.id)
    return (saved && ids.includes(saved)) ? saved : ids[0]
  })

  const [checkins, setCheckins] = useState(() => load(checkinsKey(activeId), []))
  const [excludes, setExcludes] = useState(() => load(excludesKey(activeId), []))

  useEffect(() => {
    setCheckins(load(checkinsKey(activeId), []))
    setExcludes(load(excludesKey(activeId), []))
  }, [activeId])

  const activeHabit = habits.find(h => h.id === activeId) || habits[0]

  const persistHabits = (next) => {
    setHabitsState(next)
    localStorage.setItem(HABITS_KEY, JSON.stringify(next))
  }

  const setActiveHabit = (id) => {
    setActiveIdState(id)
    localStorage.setItem(ACTIVE_KEY, id)
  }

  const addHabit = (name, color = 'indigo') => {
    const id = crypto.randomUUID()
    const next = [...habits, { id, name, color }]
    persistHabits(next)
    setActiveHabit(id)
    return id
  }

  const updateHabit = (id, fields) => {
    persistHabits(habits.map(h => h.id === id ? { ...h, ...fields } : h))
  }

  const deleteHabit = (id) => {
    if (habits.length === 1) return
    localStorage.removeItem(checkinsKey(id))
    localStorage.removeItem(excludesKey(id))
    const next = habits.filter(h => h.id !== id)
    persistHabits(next)
    if (activeId === id) setActiveHabit(next[0].id)
  }

  const persist = (key, data, setter) => { setter(data); localStorage.setItem(key, JSON.stringify(data)) }

  const addCheckin = () => {
    const entry = { id: crypto.randomUUID(), timestamp: new Date().toISOString() }
    persist(checkinsKey(activeId), [...checkins, entry], setCheckins)
    return entry
  }

  const deleteCheckin = (id) => {
    persist(checkinsKey(activeId), checkins.filter(c => c.id !== id), setCheckins)
  }

  const addExclude = (startDate, endDate, reason) => {
    const entry = { id: crypto.randomUUID(), startDate, endDate, reason }
    persist(excludesKey(activeId), [...excludes, entry], setExcludes)
  }

  const deleteExclude = (id) => {
    persist(excludesKey(activeId), excludes.filter(e => e.id !== id), setExcludes)
  }

  const importCheckins = (incoming) => {
    const existing = new Set(checkins.map(c => c.timestamp))
    const toAdd = incoming
      .filter(c => !existing.has(c.timestamp))
      .map(c => ({ id: crypto.randomUUID(), timestamp: c.timestamp }))
    const merged = [...checkins, ...toAdd].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    persist(checkinsKey(activeId), merged, setCheckins)
    return toAdd.length
  }

  return {
    habits, activeHabit, activeId,
    setActiveHabit, addHabit, updateHabit, deleteHabit,
    checkins, excludes,
    addCheckin, deleteCheckin, addExclude, deleteExclude, importCheckins
  }
}
