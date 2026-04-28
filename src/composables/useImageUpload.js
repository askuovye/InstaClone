import { ref } from 'vue'

export function useImageUpload(options = {}) {
  const { maxSizeMB = 5, validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] } = options
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const selectedFile = ref(null)
  const previewUrl = ref(null)
  const error = ref('')

  function validateFile(file) {
    if (!validTypes.includes(file.type)) {
      error.value = 'Invalid file type. Please upload an image.'
      return false
    }
    if (file.size > maxSizeBytes) {
      error.value = `Image must be under ${maxSizeMB} MB.`
      return false
    }
    return true
  }

  function handleFile(file) {
    error.value = ''
    if (!validateFile(file)) return false

    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    return true
  }

  function clearFile() {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    selectedFile.value = null
    previewUrl.value = null
    error.value = ''
  }

  return {
    selectedFile,
    previewUrl,
    error,
    handleFile,
    clearFile
  }
}
