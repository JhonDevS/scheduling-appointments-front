export function filterBySearch(items, query, fields) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return items
  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? '').toLowerCase().includes(normalized)),
  )
}

export function filterTimelineByDate(timeline, dateKey) {
  return timeline.filter((item) => item.dateKey === dateKey)
}
