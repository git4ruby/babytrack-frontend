<script setup>
import { onMounted } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { init } = useDarkMode()
onMounted(init)
</script>

<template>
  <router-view />
</template>
