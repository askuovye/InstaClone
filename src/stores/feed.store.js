import { defineStore } from 'pinia'
import { postService as postApi } from '../services/post.service'
import { useAuthStore } from './auth'
import { useUserPostsStore } from './userPosts.store'

/**
 * Store for managing the main home feed with cursor-based pagination.
 */
export const useFeedStore = defineStore('feed', {
  state: () => ({
    posts: [],
    loading: false,
    loadingMore: false,
    error: null,
    nextCursor: null,
    hasMore: true,
    initialLoad: true,
    feedSource: 'feed' // 'feed' or 'own'
  }),

  actions: {
    /**
     * Load the home feed. Falls back to own posts if the feed is empty.
     * @param {boolean} [append=false] Whether to append new posts or refresh the list.
     */
    async loadFeed(append = false) {
      if (this.loading || this.loadingMore) return

      if (append) this.loadingMore = true
      else this.loading = true

      this.error = null

      try {
        const authStore = useAuthStore()
        const authUser = authStore.user

        if (this.feedSource === 'feed') {
          const params = { per_page: 10 }
          if (append && this.nextCursor) params.cursor = this.nextCursor

          const data = await postApi.getFeed(params)
          const newPosts = Array.isArray(data.data) ? data.data : []

          if (!append && newPosts.length === 0 && authUser?.id) {
            // Feed is empty — switch to own posts via userPostsStore
            this.feedSource = 'own'
            const userPostsStore = useUserPostsStore()
            userPostsStore.reset()
            await userPostsStore.loadUserPosts(authUser.id, false)
            this.posts = userPostsStore.posts
            this.hasMore = userPostsStore.hasMore
            return
          }

          if (append) {
            this.posts.push(...newPosts)
          } else {
            this.posts = newPosts
          }

          this.nextCursor = data.next_cursor || null
          this.hasMore = !!data.next_cursor
        } else {
          // Continue loading own posts if already in that mode
          const userPostsStore = useUserPostsStore()
          await userPostsStore.loadUserPosts(authUser?.id, append)
          this.posts = userPostsStore.posts
          this.hasMore = userPostsStore.hasMore
        }
      } catch (e) {
        console.error('Feed load failed:', e)
        this.error = e.message || 'Failed to load feed'
      } finally {
        this.loading = false
        this.loadingMore = false
        this.initialLoad = false
      }
    },

    /**
     * Optimistically toggle a like on a post in the feed.
     * @param {number|string} postId 
     */
    async toggleLike(postId) {
      const post = this.posts.find(p => p.id === postId)
      if (!post) return

      const wasLiked = post.liked_by_me
      post.liked_by_me = !wasLiked
      post.likes_count += wasLiked ? -1 : 1

      try {
        if (wasLiked) {
          await postApi.unlike(post.id)
        } else {
          await postApi.like(post.id)
        }
      } catch (e) {
        // Rollback
        post.liked_by_me = wasLiked
        post.likes_count += wasLiked ? 1 : -1
        console.error('Like toggle failed:', e)
      }
    },

    removePost(postId) {
      this.posts = this.posts.filter(p => p.id !== postId)
    },

    reset() {
      this.posts = []
      this.nextCursor = null
      this.hasMore = true
      this.initialLoad = true
      this.feedSource = 'feed'
    }
  }
})
