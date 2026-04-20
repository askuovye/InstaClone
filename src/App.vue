<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopNavBar from './components/TopNavBar.vue'
import SideNavBar from './components/SideNavBar.vue'
import BottomNavBar from './components/BottomNavBar.vue'

const route = useRoute()
const isStandalone = computed(() => route.meta.hideNavigation)
</script>

<template>
  <div v-if="isStandalone" class="h-screen w-full bg-dark text-white">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>

  <div v-else class="min-h-screen bg-dark text-white flex flex-col md:flex-row pb-16 md:pb-0">
    <!-- Desktop Side Nav (Hidden on Mobile) -->
    <SideNavBar class="hidden md:flex flex-col w-64 border-r border-border min-h-screen sticky top-0" />

    <div class="flex-1 flex flex-col w-full">
      <TopNavBar class="sticky top-0 z-50 glass-panel" />
      
      <main class="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Mobile Bottom Nav (Hidden on Desktop) -->
    <BottomNavBar class="md:hidden fixed bottom-0 w-full z-50 glass-panel border-t border-border" />
  </div>
</template>

<style scoped>
</style>
