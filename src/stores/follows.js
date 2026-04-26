import { defineStore } from 'pinia'
import { follow as followApi } from '../services/api'
import { useAuthStore } from './auth'

export const useFollowsStore = defineStore('follows', {
  state: () => ({
    // Store follow status using Sets for O(1) lookups
    followingIds: new Set(),
    loadingIds: new Set(),
  }),

  getters: {
    isFollowing: (state) => (userId) => state.followingIds.has(userId),
    isLoading: (state) => (userId) => state.loadingIds.has(userId),
  },

  actions: {
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
