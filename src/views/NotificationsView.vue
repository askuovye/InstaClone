<script setup>
import NotificationItem from '../components/NotificationItem.vue'
import { notifications } from '../data/mock'
</script>

<template>
  <div class="max-w-2xl mx-auto w-full">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-white">Notifications</h2>
      <button class="text-sm font-medium text-primary hover:text-green-400 transition-colors">Mark all as read</button>
    </div>

    <div class="bg-surface rounded-2xl border border-border overflow-hidden">
      <!-- Group by date in real app, here just iterating -->
      <div class="divide-y divide-border">
        <NotificationItem 
          v-for="notification in notifications" 
          :key="notification.id" 
          :notification="notification" 
        />
      </div>
    </div>
  </div>
</template>
