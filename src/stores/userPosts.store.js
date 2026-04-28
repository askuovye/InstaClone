import { defineStore } from 'pinia'
import { postService as postsApi } from '../services/post.service'

/**
 * Store for managing user-specific post grids with page-based pagination.
 */
export const useUserPostsStore = defineStore('userPosts', {
  state: () => ({
    posts: [],
    total: 0,
    currentPage: 1,
    lastPage: 1,
    loading: false,
    error: null,
    hasMore: true
  }),

  actions: {
    /**
     * Load posts for a specific user.
     * @param {number|string} userId
     * @param {boolean} [append=false]
     */
    async loadUserPosts(userId, append = false) {
      if (!userId || (this.loading && !append)) return
      
      const isInitial = !append
      if (isInitial) {
        this.loading = true
        this.currentPage = 1
      }
      
      this.error = null

      try {
        const data = await postsApi.byUser(userId, this.currentPage)
        const newPosts = Array.isArray(data.data) ? data.data : []

        if (append) {
          this.posts.push(...newPosts)
        } else {
          this.posts = newPosts
        }

        this.total = data.total || 0
        this.lastPage = data.last_page || 1
        this.hasMore = this.currentPage < this.lastPage
        
        if (this.hasMore) {
          this.currentPage++
        }
      } catch (e) {
        console.error('User posts load failed:', e)
        this.error = e.message || 'Failed to load user posts'
      } finally {
        this.loading = false
      }
    },

    reset() {
      this.posts = []
      this.total = 0
      this.currentPage = 1
      this.lastPage = 1
      this.hasMore = true
      this.error = null
    }
  }
})
