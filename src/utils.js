import { format, parseISO, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'

export function exportCSV(checkins) {
  const rows = [...checkins]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(c => {
      const d = parseISO(c.timestamp)
      return `${c.timestamp},${format(d, 'yyyy-MM-dd')},${format(d, 'HH:mm')}`
    })
  return ['timestamp,date,time', ...rows].join('\n')
}

export function exportJSON(checkins, habitName) {
  return JSON.stringify({
    habit: habitName,
    exported: format(new Date(), 'yyyy-MM-dd'),
    count: checkins.length,
    checkins: [...checkins]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(c => ({ timestamp: c.timestamp }))
  }, null, 2)
}

export async function shareOrDownload(content, filename, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType })
    const file = new File([blob], filename, { type: mimeType })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename })
      return
    }
  } catch { /* fall through */ }
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const toDateStr = (date) => format(date, 'yyyy-MM-dd')

export const fmtTime = (iso) => format(parseISO(iso), 'HH:mm')

export function getCheckinsByDate(checkins) {
  const map = {}
  for (const c of checkins) {
    const d = toDateStr(parseISO(c.timestamp))
    if (!map[d]) map[d] = []
    map[d].push(c)
  }
  return map
}

export function isExcluded(dateStr, excludes) {
  return excludes.some(e => dateStr >= e.startDate && dateStr <= e.endDate)
}

export function calcStreak(checkins, excludes) {
  if (checkins.length === 0) return { current: 0, longest: 0 }
  const byDate = getCheckinsByDate(checkins)
  const today = toDateStr(new Date())

  // Current streak: go back from today, skip excluded days
  let current = 0
  let d = new Date()
  let skippedToday = false
  for (let i = 0; i < 730; i++) {
    const ds = toDateStr(d)
    if (isExcluded(ds, excludes)) {
      d = addDays(d, -1)
      continue
    }
    if (byDate[ds]) {
      current++
    } else {
      // Allow today to not be checked in yet
      if (!skippedToday && ds === today) {
        skippedToday = true
        d = addDays(d, -1)
        continue
      }
      break
    }
    d = addDays(d, -1)
  }

  // Longest streak across all history
  const sortedDates = Object.keys(byDate).sort()
  let longest = 0
  let cur = 0
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      cur = 1
    } else {
      const prev = parseISO(sortedDates[i - 1])
      const curr = parseISO(sortedDates[i])
      const diff = differenceInDays(curr, prev)
      // Gap is consecutive if all days between are excluded
      let gapOk = true
      for (let j = 1; j < diff; j++) {
        if (!isExcluded(toDateStr(addDays(prev, j)), excludes)) { gapOk = false; break }
      }
      cur = gapOk ? cur + 1 : 1
    }
    longest = Math.max(longest, cur)
  }

  return { current, longest: Math.max(longest, current) }
}

export function getMonthDays(year, month) {
  const start = startOfMonth(new Date(year, month, 1))
  const end = endOfMonth(start)
  return eachDayOfInterval({ start, end })
}

export function getMonthPadding(year, month) {
  // How many empty cells before the 1st (Monday-first week)
  const firstDay = getDay(new Date(year, month, 1))
  return firstDay === 0 ? 6 : firstDay - 1
}

// Returns average number of eligible days per check-in day, from first check-in to today.
// e.g. 3.0 means "on average once every 3 days"
export function calcAvgInterval(checkins, excludes) {
  const byDate = getCheckinsByDate(checkins)
  const checkinDates = Object.keys(byDate).sort()
  if (checkinDates.length === 0) return null

  const first = parseISO(checkinDates[0])
  const today = new Date()
  let eligible = 0
  let d = new Date(first)
  while (d <= today) {
    if (!isExcluded(toDateStr(d), excludes)) eligible++
    d = addDays(d, 1)
  }

  const interval = eligible / checkinDates.length
  return Math.round(interval * 10) / 10
}

export function getLast30Days(checkins) {
  const byDate = getCheckinsByDate(checkins)
  return Array.from({ length: 30 }, (_, i) => {
    const d = toDateStr(addDays(new Date(), i - 29))
    return { date: d, count: byDate[d]?.length || 0 }
  })
}

// Apple CoreData reference date offset (seconds from 2001-01-01 to Unix epoch)
const APPLE_EPOCH_OFFSET = 978307200

export function parseImport(text) {
  const trimmed = text.trim()
  // Try JSON
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed)
      // Tracklist app format: array of habits with records[].recordTime (Apple epoch)
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.records) && data[0]?.recordTime === undefined) {
        return {
          _type: 'tracklist',
          habits: data.map(h => ({
            title: h.title || '(no name)',
            count: h.records.length,
            records: h.records.map(r => ({
              timestamp: new Date((r.recordTime + APPLE_EPOCH_OFFSET) * 1000).toISOString()
            }))
          }))
        }
      }
      const arr = Array.isArray(data) ? data : [data]
      return arr.map(item => {
        const ts = item.timestamp || item.time || item.datetime || item.date
        if (!ts) return null
        const d = new Date(ts)
        return isNaN(d) ? null : { timestamp: d.toISOString() }
      }).filter(Boolean)
    } catch { /* fall through to CSV */ }
  }

  // CSV: each line is date[,time] or ISO timestamp
  const results = []
  for (const line of trimmed.split('\n')) {
    const parts = line.trim().split(/[,\t]/)
    if (!parts[0]) continue
    let iso
    if (parts.length >= 2) {
      // date + time columns
      iso = `${parts[0].trim()}T${parts[1].trim().padStart(5, '0')}:00`
    } else {
      iso = parts[0].trim()
    }
    const d = new Date(iso)
    if (!isNaN(d)) results.push({ timestamp: d.toISOString() })
  }
  return results
}
