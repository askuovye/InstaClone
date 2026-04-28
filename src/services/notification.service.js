import http from './http'

/**
 * Service for notification-related API operations.
 */
export const notificationService = {
  /**
   * List notifications for the current user.
   */
  list(params = {}) {
    return http.get('/notifications', { params })
  },

  /**
   * Fetch the count of unread notifications.
   */
  unreadCount() {
    return http.get('/notifications/unread-count')
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead() {
    return http.put('/notifications/read')
  },
}
