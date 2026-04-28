// Shared Date formatters with hoisted Intl formatters for performance
const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const longDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const then = new Date(dateStr).getTime()
  const now = Date.now()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins || 1}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  
  return shortDateFormatter.format(then)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return longDateFormatter.format(new Date(dateStr))
}
