import http from './http'

/**
 * Service for comment-related API operations.
 */
export const commentService = {
  /**
   * List comments for a specific post.
   */
  list(postId, page = 1) {
    return http.get(`/posts/${postId}/comments`, { params: { page } })
  },

  /**
   * Create a new comment on a post.
   */
  create(postId, body) {
    return http.post(`/posts/${postId}/comments`, { body })
  },

  /**
   * Update an existing comment.
   */
  update(commentId, body) {
    return http.put(`/comments/${commentId}`, { body })
  },

  /**
   * Delete a comment.
   */
  delete(commentId) {
    return http.delete(`/comments/${commentId}`)
  },
}
