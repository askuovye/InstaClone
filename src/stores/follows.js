import { defineStore } from 'pinia'
import { userService as followApi } from '../services/user.service'
import { useAuthStore } from './auth'

export const useFollowsStore = defineStore('follows', {
  state: () => ({
    // Store follow status using Sets for O(1) lookups
    followingIds: new Set(),
    loadingIds: new Set(),
  }),

  getters: {
    isFollowing: (state) => (userId) => state.followingIds.has(Number(userId)) || state.followingIds.has(String(userId)),
    isLoading: (state) => (userId) => state.loadingIds.has(Number(userId)) || state.loadingIds.has(String(userId)),
  },

  actions: {
    async loadFollowing(currentUserId) {
      if (!currentUserId) return
      try {
        // Fetch a large number or paginate if needed, but for now let's assume one big fetch
        const response = await followApi.following(currentUserId, 1)
        // Laravel paginated collections nest the array in .data
        const users = response.data || (Array.isArray(response) ? response : [])
        const ids = users.map(u => u.id)
        this.followingIds = new Set(ids)
      } catch (e) {
        console.error('Failed to load following list:', e)
      }
    },
    initializeFollowStatus(userId, isFollowing) {
      if (isFollowing) {
        this.followingIds.add(userId)
      } else {
        this.followingIds.delete(userId)
      }
    },

    async toggleFollow(userId) {
      if (!userId || this.loadingIds.has(userId)) return

      const wasFollowing = this.followingIds.has(userId)
      
      // Optimistic update
      if (wasFollowing) {
        this.followingIds.delete(userId)
      } else {
        this.followingIds.add(userId)
      }
      this.loadingIds.add(userId)

      try {
        if (wasFollowing) {
          await followApi.unfollow(userId)
        } else {
          await followApi.follow(userId)
        }
      } catch (e) {
        // Rollback
        if (wasFollowing) {
          this.followingIds.add(userId)
        } else {
          this.followingIds.delete(userId)
        }
        console.error('Follow toggle failed:', e)
        throw e
      } finally {
        this.loadingIds.delete(userId)
      }
    }
  }
})
