<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/AppShell.vue'
import { posts } from '../services/api'

const router = useRouter()

// ─── State ────────────────────────────────────────────────
const fileInput = ref(null)
const previewImage = ref(null)
const selectedFile = ref(null)
const caption = ref('')
const isSubmitting = ref(false)
const isDragging = ref(false)
const errorMessage = ref('')
const fieldErrors = ref({})
const toastMessage = ref('')
const toastVisible = ref(false)
const toastType = ref('success')

// ─── Computed ─────────────────────────────────────────────
const captionLength = computed(() => caption.value.length)
const captionRemaining = computed(() => 2200 - captionLength.value)
const canSubmit = computed(() => selectedFile.value && !isSubmitting.value)

// ─── File Handling ────────────────────────────────────────
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const maxSize = 5 * 1024 * 1024 // 5 MB

function validateFile(file) {
  if (!validTypes.includes(file.type)) {
    showToast('Only JPEG, PNG, and WebP images are allowed.', 'error')
    return false
  }
  if (file.size > maxSize) {
    showToast('Image must be under 5 MB.', 'error')
    return false
  }
  return true
}

function setFile(file) {
  if (!validateFile(file)) return
  selectedFile.value = file
  errorMessage.value = ''
  fieldErrors.value = {}

  // Generate preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (file) setFile(file)
}

function removeImage() {
  previewImage.value = null
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// ─── Drag & Drop ──────────────────────────────────────────
function onDragEnter(e) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

// ─── Submit ───────────────────────────────────────────────
async function handleSubmit() {
  if (!selectedFile.value || isSubmitting.value) return

  // Validate caption length
  if (caption.value.length > 2200) {
    showToast('Caption is too long (max 2200 characters).', 'error')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  fieldErrors.value = {}

  try {
    await posts.create(selectedFile.value, caption.value)
    showToast('Post shared successfully!', 'success')

    // Short delay so user sees success toast, then navigate
    setTimeout(() => {
      router.push('/')
    }, 800)
  } catch (e) {
    console.error('Post creation failed:', e)

    if (e.errors) {
      fieldErrors.value = e.errors
      // Show the first error
      const firstField = Object.keys(e.errors)[0]
      errorMessage.value = e.errors[firstField]?.[0] || e.message
    } else {
      errorMessage.value = e.message || 'Failed to create post. Please try again.'
    }

    showToast(errorMessage.value, 'error')
    isSubmitting.value = false
  }
}

// ─── Toast ────────────────────────────────────────────────
function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 3500)
}

// ─── File size formatter ──────────────────────────────────
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <AppShell>
    <div class="max-w-3xl mx-auto w-full px-4 md:px-8 pt-6 pb-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-xl font-black tracking-widest text-white">NEW POST</h2>
          <p class="text-xs text-white/30 font-bold mt-1">Share a photo with your followers</p>
        </div>
        <button @click="handleSubmit" :disabled="!canSubmit"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black tracking-widest
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed"
          :class="canSubmit
            ? 'bg-primary text-black hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(5,204,71,0.4)]'
            : 'bg-surface text-white/30 border border-border'">
          <span v-if="isSubmitting" class="material-symbols-rounded text-sm animate-spin">autorenew</span>
          <span v-else class="material-symbols-rounded text-sm">send</span>
          {{ isSubmitting ? 'SHARING...' : 'SHARE' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- ═══ IMAGE UPLOAD AREA ═══ -->
        <div>
          <!-- Drop zone (no image selected) -->
          <div v-if="!previewImage"
            class="upload-zone aspect-[4/5] border-2 border-dashed rounded-2xl
              flex flex-col items-center justify-center relative overflow-hidden
              cursor-pointer transition-all duration-300 group"
            :class="isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border bg-surface/40 hover:border-primary/50 hover:bg-surface/60'"
            @click="fileInput?.click()"
            @dragenter="onDragEnter"
            @dragover.prevent
            @dragleave="onDragLeave"
            @drop="onDrop">

            <div class="flex flex-col items-center gap-4">
              <div class="w-20 h-20 rounded-2xl bg-dark/80 border border-border
                flex items-center justify-center
                group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300">
                <span class="material-symbols-rounded text-primary/60 group-hover:text-primary transition-colors"
                  style="font-size: 2.5rem">add_photo_alternate</span>
              </div>

              <div class="text-center">
                <p class="text-white/50 font-bold text-sm">
                  {{ isDragging ? 'Drop your image here' : 'Click or drag to upload' }}
                </p>
                <p class="text-white/20 text-xs mt-1.5">JPEG, PNG, or WebP · Max 5 MB</p>
              </div>
            </div>

            <!-- Corner decorations -->
            <div class="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg opacity-20"
              :class="isDragging ? 'border-primary' : 'border-white'"></div>
            <div class="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg opacity-20"
              :class="isDragging ? 'border-primary' : 'border-white'"></div>
            <div class="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg opacity-20"
              :class="isDragging ? 'border-primary' : 'border-white'"></div>
            <div class="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-lg opacity-20"
              :class="isDragging ? 'border-primary' : 'border-white'"></div>
          </div>

          <!-- Image preview (image selected) -->
          <div v-else class="relative aspect-[4/5] rounded-2xl overflow-hidden group">
            <img :src="previewImage" class="w-full h-full object-cover" alt="Post preview" />

            <!-- Overlay on hover -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300
              flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="flex items-center gap-3">
                <button @click="fileInput?.click()"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl
                    bg-white/20 backdrop-blur-md text-white text-xs font-black tracking-wider
                    hover:bg-white/30 transition-all duration-200">
                  <span class="material-symbols-rounded text-sm">edit</span>
                  CHANGE
                </button>
                <button @click="removeImage"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl
                    bg-red-500/20 backdrop-blur-md text-red-300 text-xs font-black tracking-wider
                    hover:bg-red-500/30 transition-all duration-200">
                  <span class="material-symbols-rounded text-sm">delete</span>
                  REMOVE
                </button>
              </div>
            </div>

            <!-- File info badge -->
            <div v-if="selectedFile" class="absolute bottom-3 left-3 right-3
              flex items-center gap-2 px-3 py-2 rounded-lg
              bg-dark/80 backdrop-blur-sm border border-border">
              <span class="material-symbols-rounded text-primary text-sm">image</span>
              <span class="text-xs text-white/60 truncate flex-1">{{ selectedFile.name }}</span>
              <span class="text-xs text-white/30 flex-shrink-0">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
          </div>

          <!-- Hidden file input -->
          <input ref="fileInput" type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            class="sr-only" @change="handleFileUpload" />
        </div>

        <!-- ═══ CAPTION & DETAILS ═══ -->
        <div class="flex flex-col gap-6">

          <!-- Caption -->
          <div>
            <label class="flex items-center justify-between mb-2">
              <span class="flex items-center gap-2 text-xs font-black tracking-widest text-white/40">
                <span class="material-symbols-rounded text-sm">description</span>
                CAPTION
              </span>
              <span class="text-xs font-bold"
                :class="captionRemaining < 0 ? 'text-red-400' : captionRemaining < 200 ? 'text-yellow-400' : 'text-white/20'">
                {{ captionRemaining }}
              </span>
            </label>
            <textarea
              v-model="caption"
              placeholder="Write a caption for your post..."
              rows="6"
              maxlength="2200"
              class="w-full bg-surface/60 border rounded-xl px-4 py-3.5
                text-sm text-white placeholder-white/20 resize-none outline-none
                transition-all duration-200"
              :class="fieldErrors.caption
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-border focus:border-primary/50 focus:bg-surface'"
            ></textarea>
            <p v-if="fieldErrors.caption" class="text-xs text-red-400 mt-1.5">
              {{ fieldErrors.caption[0] }}
            </p>
          </div>

          <!-- Tips -->
          <div class="glass-card rounded-xl border border-border bg-surface/30 p-4">
            <h3 class="text-xs font-black tracking-widest text-white/30 mb-3">TIPS</h3>
            <ul class="space-y-2">
              <li class="flex items-start gap-2.5 text-xs text-white/40">
                <span class="material-symbols-rounded text-primary/50 text-sm mt-0.5">check_circle</span>
                Use high-quality square or portrait images for best results
              </li>
              <li class="flex items-start gap-2.5 text-xs text-white/40">
                <span class="material-symbols-rounded text-primary/50 text-sm mt-0.5">check_circle</span>
                Write engaging captions to get more interactions
              </li>
              <li class="flex items-start gap-2.5 text-xs text-white/40">
                <span class="material-symbols-rounded text-primary/50 text-sm mt-0.5">check_circle</span>
                Supported formats: JPEG, PNG, WebP (max 5 MB)
              </li>
            </ul>
          </div>

          <!-- Error display -->
          <div v-if="errorMessage && !fieldErrors.caption"
            class="flex items-start gap-3 px-4 py-3 rounded-xl
              bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            <span class="material-symbols-rounded text-sm mt-0.5">error</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Submit (mobile - visible on small screens) -->
          <button @click="handleSubmit" :disabled="!canSubmit"
            class="mobile-submit-btn w-full flex items-center justify-center gap-2
              py-3.5 rounded-xl text-sm font-black tracking-widest
              transition-all duration-200
              disabled:opacity-30 disabled:cursor-not-allowed"
            :class="canSubmit
              ? 'bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20'
              : 'bg-surface text-white/30 border border-border'">
            <span v-if="isSubmitting" class="material-symbols-rounded text-sm animate-spin">autorenew</span>
            <span v-else class="material-symbols-rounded text-sm">send</span>
            {{ isSubmitting ? 'SHARING...' : 'SHARE POST' }}
          </button>
        </div>
      </div>

      <!-- ─── Toast Notification ─── -->
      <Transition name="toast">
        <div v-if="toastVisible"
          class="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5
            rounded-xl border backdrop-blur-xl shadow-2xl"
          :class="toastType === 'success'
            ? 'bg-primary/15 border-primary/40 text-primary'
            : 'bg-red-500/15 border-red-500/40 text-red-400'">
          <span class="material-symbols-rounded icon-filled text-lg">
            {{ toastType === 'success' ? 'check_circle' : 'error' }}
          </span>
          <span class="text-sm font-bold">{{ toastMessage }}</span>
        </div>
      </Transition>
    </div>
  </AppShell>
</template>

<style scoped>
.glass-card {
  backdrop-filter: blur(12px);
}

/* Upload zone pulse on drag */
.upload-zone.scale-\[1\.02\] {
  transform: scale(1.02);
}

/* Toast animation */
.toast-enter-active { animation: toast-in 0.4s ease; }
.toast-leave-active { animation: toast-in 0.3s ease reverse; }

@keyframes toast-in {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Mobile submit visible on small screens, hidden on md+ */
.mobile-submit-btn {
  display: flex;
}
@media (min-width: 768px) {
  .mobile-submit-btn {
    display: none;
  }
}

/* Skeleton pulse */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}
.animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
</style>
