import { ref, watch, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export function useTimeSince(dateRef) {
  const label = ref('--')
  const hours = ref(0)
  const minutes = ref(0)
  const urgency = ref('normal')
  let timer = null

  function update() {
    if (!dateRef.value) {
      label.value = '--'
      hours.value = 0
      minutes.value = 0
      urgency.value = 'normal'
      return
    }
    const diff = dayjs.duration(dayjs().diff(dayjs(dateRef.value)))
    hours.value = Math.floor(diff.asHours())
    minutes.value = diff.minutes()
    label.value = `${hours.value}h ${minutes.value}m ago`

    const totalHours = diff.asHours()
    if (totalHours >= 4) urgency.value = 'alert'
    else if (totalHours >= 3) urgency.value = 'warning'
    else urgency.value = 'normal'
  }

  // React immediately when dateRef changes (e.g. API response arrives)
  watch(() => dateRef.value, () => {
    update()
  }, { immediate: true })

  onMounted(() => {
    timer = setInterval(update, 30000)
  })

  onUnmounted(() => {
    clearInterval(timer)
  })

  return { label, hours, minutes, urgency }
}
