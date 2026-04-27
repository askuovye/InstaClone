<script setup>
const props = defineProps({
  tabs: { type: Array, required: true },
  activeTab: { type: String, required: true },
  showTabs: { type: Boolean, default: false }
})

const emit = defineEmits(['update:activeTab'])
</script>

<template>
  <div class="tabs-wrap mb-6 transition-all duration-500"
    :class="showTabs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'">
    <div class="flex gap-1 p-1 bg-surface/60 border border-border rounded-xl w-fit">
      <button v-for="tab in tabs" :key="tab.key"
        @click="$emit('update:activeTab', tab.key)"
        class="tab-btn px-5 py-2.5 rounded-lg text-xs font-black tracking-widest transition-all duration-200"
        :class="activeTab === tab.key
          ? 'bg-primary text-black'
          : 'text-white/40 hover:text-white/70'">
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
