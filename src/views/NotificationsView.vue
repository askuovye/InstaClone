<script setup>
import NotificationItem from '../components/NotificationItem.vue'
import AppShell from '../components/AppShell.vue'
import { notifications } from '../data/mock'
</script>

<template>
  <AppShell>
    <div class="max-w-2xl mx-auto w-full px-4 md:px-8 pt-4">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white">Notifications</h2>
        <button class="text-sm font-medium text-primary hover:text-green-400 transition-colors">Mark all as read</button>
      </div>

      <div class="bg-surface rounded-2xl border border-border overflow-hidden">
        <div class="divide-y divide-border">
          <NotificationItem 
            v-for="notification in notifications" 
            :key="notification.id" 
            :notification="notification" 
          />
        </div>
      </div>
    </div>
  </AppShell>
</template>
