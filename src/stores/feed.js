import { defineStore } from 'pinia'
import { feed as feedApi, posts as postsApi, likes as likesApi } from '../services/api'
import { useAuthStore } from './auth'

export const useFeedStore = defineStore('feed', {
  state: () => ({
    posts: [],
    loading: false,
    loadingMore: false,
    error: null,
    nextCursor: null,
    nextPage: 1,
    hasMore: true,
    initialLoad: true,
    feedSource: 'feed' // 'feed' or 'own'
  }),

  actions: {
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

          const data = await feedApi.get(params)
          const newPosts = Array.isArray(data.data) ? data.data : []

          if (!append && newPosts.length === 0 && authUser?.id) {
            // Feed is empty — fall back to user's own posts
            this.feedSource = 'own'
            this.nextPage = 1
            await this.loadOwnPosts(false, authUser.id)
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
          await this.loadOwnPosts(append, authUser?.id)
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

    async loadOwnPosts(append, userId) {
      if (!userId) return

      try {
        const data = await postsApi.byUser(userId, this.nextPage)
        const newPosts = Array.isArray(data.data) ? data.data : []

        if (append) {
          this.posts.push(...newPosts)
        } else {
          this.posts = newPosts
        }

        this.hasMore = !!data.next_page_url
        if (this.hasMore) this.nextPage++
      } catch (e) {
        console.error('Own posts load failed:', e)
        this.error = e.message || 'Failed to load posts'
      }
    },

    async toggleLike(postId) {
      const post = this.posts.find(p => p.id === postId)
      if (!post) return

      const wasLiked = post.liked_by_me
      post.liked_by_me = !wasLiked
      post.likes_count += wasLiked ? -1 : 1

      try {
        if (wasLiked) {
          await likesApi.unlike(post.id)
        } else {
          await likesApi.like(post.id)
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
      this.nextPage = 1
      this.hasMore = true
      this.initialLoad = true
      this.feedSource = 'feed'
    }
  }
})
