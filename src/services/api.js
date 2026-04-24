const API_BASE = 'http://localhost:8000/api'

/**
 * Centralized API client for InstaClone backend.
 * Automatically attaches the Sanctum bearer token from localStorage.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle 204 No Content
  if (response.status === 204) {
    return { ok: true, status: 204, data: null }
  }

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed')
    error.status = response.status
    error.data = data
    error.errors = data.errors || null
    throw error
  }

  return data
}

// ─── Auth ───
export const auth = {
  register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  logout() {
    return request('/auth/logout', { method: 'POST' })
  },

  refresh() {
    return request('/auth/refresh', { method: 'POST' })
  },

  me() {
    return request('/auth/me')
  },
}

// ─── Users ───
export const users = {
  search(q, params = {}) {
    const query = new URLSearchParams({ q, ...params })
    return request(`/users/search?${query}`)
  },

  getProfile(username) {
    return request(`/users/${username}`)
  },

  updateProfile(payload) {
    return request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return request('/users/me/avatar', {
      method: 'POST',
      body: formData,
    })
  },
}

// ─── Follow ───
export const follow = {
  followers(userId, page = 1) {
    return request(`/users/${userId}/followers?page=${page}`)
  },

  following(userId, page = 1) {
    return request(`/users/${userId}/following?page=${page}`)
  },

  isFollowing(userId) {
    return request(`/users/${userId}/is-following`)
  },

  follow(userId) {
    return request(`/users/${userId}/follow`, { method: 'POST' })
  },

  unfollow(userId) {
    return request(`/users/${userId}/unfollow`, { method: 'DELETE' })
  },
}

// ─── Posts ───
export const posts = {
  create(image, caption = '') {
    const formData = new FormData()
    formData.append('image', image)
    if (caption) formData.append('caption', caption)
    return request('/posts', {
      method: 'POST',
      body: formData,
    })
  },

  get(postId) {
    return request(`/posts/${postId}`)
  },

  update(postId, caption) {
    return request(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ caption }),
    })
  },

  delete(postId) {
    return request(`/posts/${postId}`, { method: 'DELETE' })
  },

  byUser(userId, page = 1) {
    return request(`/users/${userId}/posts?page=${page}`)
  },
}

// ─── Feed ───
export const feed = {
  get(params = {}) {
    const query = new URLSearchParams(params)
    return request(`/feed?${query}`)
  },
}

// ─── Likes ───
export const likes = {
  like(postId) {
    return request(`/posts/${postId}/like`, { method: 'POST' })
  },

  unlike(postId) {
    return request(`/posts/${postId}/unlike`, { method: 'DELETE' })
  },

  list(postId, page = 1) {
    return request(`/posts/${postId}/likes?page=${page}`)
  },
}

// ─── Comments ───
export const comments = {
  list(postId, page = 1) {
    return request(`/posts/${postId}/comments?page=${page}`)
  },

  create(postId, body) {
    return request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  },

  update(commentId, body) {
    return request(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ body }),
    })
  },

  delete(commentId) {
    return request(`/comments/${commentId}`, { method: 'DELETE' })
  },
}

// ─── Notifications ───
export const notifications = {
  list(params = {}) {
    const query = new URLSearchParams(params)
    return request(`/notifications?${query}`)
  },

  unreadCount() {
    return request('/notifications/unread-count')
  },

  markAllRead() {
    return request('/notifications/read', { method: 'PUT' })
  },
}
