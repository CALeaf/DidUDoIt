export const COLORS = [
  { id: 'indigo', label: '靛蓝', hex: '#6366f1', btn: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-100', ring: 'ring-indigo-400' },
  { id: 'rose',   label: '玫红', hex: '#f43f5e', btn: 'bg-rose-500',   text: 'text-rose-500',   light: 'bg-rose-100',   ring: 'ring-rose-400'   },
  { id: 'emerald',label: '翠绿', hex: '#10b981', btn: 'bg-emerald-500',text: 'text-emerald-600',light: 'bg-emerald-100',ring: 'ring-emerald-400'},
  { id: 'amber',  label: '琥珀', hex: '#f59e0b', btn: 'bg-amber-500',  text: 'text-amber-600',  light: 'bg-amber-100',  ring: 'ring-amber-400'  },
  { id: 'sky',    label: '天蓝', hex: '#0ea5e9', btn: 'bg-sky-500',    text: 'text-sky-500',    light: 'bg-sky-100',    ring: 'ring-sky-400'    },
  { id: 'purple', label: '紫色', hex: '#9333ea', btn: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-100', ring: 'ring-purple-400' },
]

export const getColor = (id) => COLORS.find(c => c.id === id) || COLORS[0]
