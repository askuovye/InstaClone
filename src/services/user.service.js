import http from './http'

/**
 * Service for user and profile-related API operations.
 */
export const userService = {
  /**
   * Search for users by query.
   */
  search(q, params = {}) {
    return http.get('/users/search', { params: { q, ...params } })
  },

  /**
   * Get a user's profile details.
   */
  getProfile(username) {
    return http.get(`/users/${username}`)
  },

  /**
   * Update the current user's profile info.
   */
  updateProfile(payload) {
    return http.put('/users/me', payload)
  },

  /**
   * Upload a new avatar for the current user.
   */
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return http.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Fetch user suggestions.
   */
  suggestions(params = {}) {
    return http.get('/users/suggestions', { params })
  },

  /**
   * List followers of a user.
   */
  followers(userId, page = 1) {
    return http.get(`/users/${userId}/followers`, { params: { page } })
  },

  /**
   * List users a specific user is following.
   */
  following(userId, page = 1) {
    return http.get(`/users/${userId}/following`, { params: { page } })
  },

  /**
   * Check if the current user is following a specific user.
   */
  isFollowing(userId) {
    return http.get(`/users/${userId}/is-following`)
  },

  /**
   * Follow a user.
   */
  follow(userId) {
    return http.post(`/users/${userId}/follow`)
  },

  /**
   * Unfollow a user.
   */
  unfollow(userId) {
    return http.delete(`/users/${userId}/unfollow`)
  },
}
