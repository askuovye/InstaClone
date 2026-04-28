import http from './http'

/**
 * Service for authentication-related API operations.
 */
export const authService = {
  /**
   * Register a new user.
   * @param {Object} payload { name, username, email, password, password_confirmation }
   */
  register(payload) {
    return http.post('/auth/register', payload)
  },

  /**
   * Log in an existing user.
   * @param {Object} payload { email, password }
   */
  login(payload) {
    return http.post('/auth/login', payload)
  },

  /**
   * Log out the current user.
   */
  logout() {
    return http.post('/auth/logout')
  },

  /**
   * Refresh the authentication token.
   */
  refresh() {
    return http.post('/auth/refresh')
  },

  /**
   * Fetch the current authenticated user's details.
   */
  me() {
    return http.get('/auth/me')
  },
}
