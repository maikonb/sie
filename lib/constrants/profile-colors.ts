export const PROFILE_COLORS = [
  { value: "bg-red-500", label: "Vermelho" },
  { value: "bg-orange-500", label: "Laranja" },
  { value: "bg-amber-500", label: "Âmbar" },
  { value: "bg-yellow-500", label: "Amarelo" },
  { value: "bg-lime-500", label: "Lima" },
  { value: "bg-green-500", label: "Verde" },
  { value: "bg-emerald-500", label: "Verde (Emerald)" },
  { value: "bg-teal-500", label: "Verde-azulado" },
  { value: "bg-cyan-500", label: "Ciano" },
  { value: "bg-sky-500", label: "Azul-céu" },
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-indigo-500", label: "Índigo" },
  { value: "bg-violet-500", label: "Violeta" },
  { value: "bg-purple-500", label: "Roxo" },
  { value: "bg-fuchsia-500", label: "Fúcsia" },
  { value: "bg-pink-500", label: "Rosa" },
  { value: "bg-rose-500", label: "Rosa (Rose)" },
]

export type ProfileColor = (typeof PROFILE_COLORS)[number]
