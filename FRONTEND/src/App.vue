<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: var(--font-primary, 'ITF Qomra Arabic Light', 'Segoe UI', 'Tajawal', sans-serif);
}

body {
  direction: rtl;
  text-align: right;
  background-color: var(--bg-page, #f8fafc);
  color: #1e293b;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-page, #f8fafc);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-gold, #b9a779);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--gold-dark, #9a8660);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>