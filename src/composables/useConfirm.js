import { ref } from 'vue'

const isOpen = ref(false)
const title = ref('')
const message = ref('')
const confirmLabel = ref('Confirm')
const variant = ref('danger')
const loading = ref(false)

let resolvePromise = null

export function useConfirm() {
  function confirm(opts = {}) {
    title.value = opts.title || 'Are you sure?'
    message.value = opts.message || ''
    confirmLabel.value = opts.confirmLabel || 'Confirm'
    variant.value = opts.variant || 'danger'
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleConfirm() {
    isOpen.value = false
    resolvePromise?.(true)
  }

  function handleCancel() {
    isOpen.value = false
    resolvePromise?.(false)
  }

  return {
    isOpen, title, message, confirmLabel, variant, loading,
    confirm, handleConfirm, handleCancel,
  }
}
