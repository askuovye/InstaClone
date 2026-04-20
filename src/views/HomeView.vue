<script setup>
import StoryBar from '../components/StoryBar.vue'
import PostCard from '../components/PostCard.vue'
import { stories, feed } from '../data/mock'
</script>

<template>
  <div class="max-w-2xl mx-auto w-full">
    <!-- Stories Section -->
    <div class="mb-8">
      <StoryBar :stories="stories" />
    </div>

    <!-- Feed Section -->
    <div class="space-y-6">
      <PostCard v-for="post in feed" :key="post.id" :post="post" />
    </div>
    
    <!-- End of Feed -->
    <div class="text-center py-8 text-gray-500">
      <span class="material-symbols-rounded text-4xl mb-2 text-primary/50">check_circle</span>
      <p>You're all caught up!</p>
    </div>
  </div>
</template>
