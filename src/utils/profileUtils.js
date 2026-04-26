// Shared profile constants and utilities

export const defaultAuthor = {
  name: 'Unknown User',
  username: 'unknown',
  avatar_url: null,
}

export function getAuthorDisplayName(user) {
  if (!user) return defaultAuthor.name
  return user.name || user.username || defaultAuthor.name
}

export function getAuthorUsername(user) {
  if (!user) return defaultAuthor.username
  return user.username || defaultAuthor.username
}
