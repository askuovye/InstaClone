<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { users } from '../services/api'
import { useImageUpload } from '../composables/useImageUpload'

const authStore = useAuthStore()
const router = useRouter()

const bio = ref('')
const name = ref('')
const isSubmitting = ref(false)
const error = ref('')

const { selectedFile, previewUrl, handleFile, error: uploadError } = useImageUpload({ maxSizeMB: 2 })

onMounted(() => {
  if (authStore.user) {
    bio.value = authStore.user.bio || ''
    name.value = authStore.user.name || ''
    if (authStore.user.avatar_url) {
      previewUrl.value = authStore.user.avatar_url
    }
  }
})

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) {
    if (!handleFile(file)) {
      error.value = uploadError.value
    } else {
      error.value = ''
    }
  }
}

async function save() {
  if (bio.value.length > 150) {
    error.value = 'Bio must be under 150 characters.'
    return
  }
  isSubmitting.value = true
  error.value = ''
  try {
    if (selectedFile.value) {
      await users.uploadAvatar(selectedFile.value)
    }
    // Update profile if bio or name changed
    await users.updateProfile({ name: name.value, bio: bio.value })
    await authStore.fetchUser() // Refresh auth state
    router.push('/profile')
  } catch (e) {
    error.value = e.message || 'Failed to update profile.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto px-4 md:px-8 py-8 min-h-[calc(100vh-8rem)]">
    <div class="mb-8 border-b border-border/50 pb-4">
      <h1 class="text-3xl font-black tracking-tight italic bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
        EDIT PROFILE
      </h1>
      <p class="text-xs text-white/30 font-bold mt-1 tracking-widest">UPDATE YOUR PUBLIC INFORMATION</p>
    </div>

    <div v-if="error" class="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold">
      <i class="bi bi-exclamation-triangle-fill text-sm mt-0.5"></i>
      <span>{{ error }}</span>
    </div>
    
    <div class="mb-8">
      <label class="block text-xs text-white/50 mb-3 font-black tracking-widest">AVATAR</label>
      <div class="flex items-center gap-6">
        <div class="w-20 h-20 rounded-2xl overflow-hidden bg-surface border-2 border-border flex-shrink-0 flex items-center justify-center">
          <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" />
          <i v-else class="bi bi-person-fill text-white/20 text-4xl"></i>
        </div>
        <div class="flex-1">
          <label class="inline-block px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs font-black tracking-widest cursor-pointer hover:bg-primary/20 transition-colors">
            CHANGE IMAGE
            <input type="file" @change="onFileChange" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden" />
          </label>
          <p class="text-xs text-white/30 mt-2">Max 2 MB (JPEG, PNG, WebP)</p>
        </div>
      </div>
    </div>
    
    <div class="mb-6">
      <label class="block text-xs text-white/50 mb-2 font-black tracking-widest">DISPLAY NAME</label>
      <input v-model="name" type="text" placeholder="Your name" class="w-full bg-surface/60 border border-border focus:border-primary/50 focus:bg-surface rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all duration-200" />
    </div>

    <div class="mb-8">
      <label class="block text-xs text-white/50 mb-2 font-black tracking-widest">BIO</label>
      <textarea v-model="bio" rows="4" placeholder="Tell us about yourself..." class="w-full bg-surface/60 border border-border focus:border-primary/50 focus:bg-surface rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 resize-none outline-none transition-all duration-200"></textarea>
      <p class="text-right text-xs mt-1.5 font-bold" :class="bio.length > 150 ? 'text-red-400' : 'text-white/30'">{{ bio.length }} / 150</p>
    </div>

    <div class="flex gap-4 pt-4 border-t border-border/50">
      <button @click="$router.back()" class="flex-1 py-3.5 bg-surface hover:bg-surface/80 border border-border rounded-xl text-xs font-black tracking-widest transition-colors">CANCEL</button>
      <button @click="save" :disabled="isSubmitting" class="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-black rounded-xl text-xs font-black tracking-widest disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
        <i v-if="isSubmitting" class="bi bi-arrow-repeat text-sm animate-spin"></i>
        <i v-else class="bi bi-save text-sm"></i>
        {{ isSubmitting ? 'SAVING...' : 'SAVE CHANGES' }}
      </button>
    </div>
  </div>
</template>
