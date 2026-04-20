<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref(null)
const previewImage = ref(null)

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = () => {
  // Mock upload logic
  setTimeout(() => {
    router.push('/')
  }, 1000)
}
</script>

<template>
  <div class="max-w-3xl mx-auto w-full">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-white">Create New Post</h2>
      <button @click="handleSubmit" class="bg-primary text-black font-bold px-6 py-2 rounded-full hover:bg-green-400 transition-colors">
        Share
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Media Upload Area -->
      <div 
        class="aspect-[4/5] bg-surface border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-colors hover:border-primary/50"
        @click="$refs.fileInput.click()"
      >
        <template v-if="!previewImage">
          <div class="w-16 h-16 rounded-full bg-dark flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
            <span class="material-symbols-rounded !text-3xl">add_photo_alternate</span>
          </div>
          <p class="text-gray-300 font-medium">Click to upload media</p>
          <p class="text-xs text-gray-500 mt-2">JPG, PNG, GIF or MP4</p>
        </template>
        <template v-else>
          <img :src="previewImage" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="text-white font-bold flex items-center gap-2">
              <span class="material-symbols-rounded">edit</span> Change Media
            </span>
          </div>
        </template>
        <input ref="fileInput" type="file" accept="image/*,video/*" class="hidden" @change="handleFileUpload">
      </div>

      <!-- Caption & Settings Area -->
      <div class="space-y-6">
        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <span class="material-symbols-rounded text-sm">description</span> Caption
          </label>
          <textarea 
            class="w-full h-32 bg-surface border border-border text-white rounded-xl p-4 resize-none focus:outline-none focus:border-primary transition-colors"
            placeholder="Write a caption... Use #tags to reach more creators."
          ></textarea>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <span class="material-symbols-rounded text-sm">location_on</span> Location
          </label>
          <input 
            type="text" 
            class="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            placeholder="Add location"
          >
        </div>

        <div class="pt-6 border-t border-border">
          <h3 class="text-sm font-medium text-gray-300 mb-4">Advanced Settings</h3>
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-white text-sm">Hide like and view counts</span>
            <div class="relative">
              <input type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white border border-border"></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
