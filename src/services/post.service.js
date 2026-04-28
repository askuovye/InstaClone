import http from './http'

/**
 * Service for post-related API operations.
 * Handles CRUD, discovery, feed, and likes.
 */
export const postService = {
  /**
   * Fetch posts for the explore grid.
   * @param {number} [page=1]
   */
  explore(page = 1) {
  return http.get(`/posts/explore`, { params: { page } })
},

  /**
   * Fetch the user's home feed.
   * @param {Object} params { per_page, cursor }
   */
  getFeed(params = {}) {
    return http.get('/feed', { params })
  },

  /**
   * Create a new post.
   * @param {File} image
   * @param {string} [caption='']
   */
  create(image, caption = '') {
    const formData = new FormData()
    formData.append('image', image)
    if (caption) formData.append('caption', caption)
    return http.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Get a single post by ID.
   */
  get(postId) {
    return http.get(`/posts/${postId}`)
  },

  /**
   * Update a post's caption.
   */
  update(postId, caption) {
    return http.put(`/posts/${postId}`, { caption })
  },

  /**
   * Delete a post.
   */
  delete(postId) {
    return http.delete(`/posts/${postId}`)
  },

  /**
   * Fetch posts for a specific user.
   */
  byUser(userId, page = 1) {
    return http.get(`/users/${userId}/posts`, { params: { page } })
  },

  /**
   * Like a post.
   */
  like(postId) {
    return http.post(`/posts/${postId}/like`)
  },

  /**
   * Unlike a post.
   */
  unlike(postId) {
    return http.delete(`/posts/${postId}/unlike`)
  },

  /**
   * List users who liked a post.
   */
  getLikes(postId, page = 1) {
    return http.get(`/posts/${postId}/likes`, { params: { page } })
  },
}
