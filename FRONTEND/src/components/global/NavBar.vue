<template>
  <nav class="navbar" :class="{ 'navbar--mobile-open': isOpen }">
    <div class="nav-wrapper">
      <button 
        @click="handleTabClick('surveys')"
        class="nav-link" 
        :class="{ 'nav-link--active': activeTab === 'surveys' }"
      >
        <span class="nav-link__icon">📋</span>
        <span class="nav-link__text">الاستبيانات</span>
      </button>
      <button 
        @click="handleTabClick('users')"
        class="nav-link" 
        :class="{ 'nav-link--active': activeTab === 'users' }"
      >
        <span class="nav-link__icon">👥</span>
        <span class="nav-link__text">إدارة المستخدمين</span>
      </button>
      <button 
        @click="handleTabClick('schools')"
        class="nav-link" 
        :class="{ 'nav-link--active': activeTab === 'schools' }"
      >
         <span class="nav-link__icon">🏫</span>
        <span class="nav-link__text">المدارس</span>
      </button>
      <button 
        @click="handleTabClick('analytics')"
        class="nav-link" 
        :class="{ 'nav-link--active': activeTab === 'analytics' }"
      >
         <span class="nav-link__icon">📊</span>
        <span class="nav-link__text">التحليلات</span>
      </button>
    </div>
  </nav>
  <!-- Overlay for mobile -->
  <div v-if="isOpen" class="mobile-overlay" @click="$emit('close')"></div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tab-change', 'close'])

const activeTab = ref('surveys')

const handleTabClick = (tab) => {
  activeTab.value = tab
  emit('tab-change', tab)
  emit('close') // Close drawer on selection (mobile)
}

// Expose activeTab for parent component to access
defineExpose({
  activeTab
})
</script>

<style scoped>
/* Mobile First: Sidebar Drawer Style (Hidden by default) */
.navbar {
  background: var(--gradient-primary); /* Fallback */
  background: linear-gradient(180deg, #1a4d46 0%, #133a35 100%);
  position: fixed;
  top: 0;
  right: -280px; /* Hidden off-screen */
  width: 280px;
  height: 100vh;
  z-index: 2000;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-top: 80px; /* Space for close button or header */
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar--mobile-open {
  right: 0; /* Slide in */
}

/* Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1900;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.nav-wrapper {
  display: flex;
  flex-direction: column; /* Stack vertically on mobile */
  gap: 8px;
  padding: 20px;
  width: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: none !important;
  background-color: transparent !important;
  width: 100%;
  justify-content: flex-start;
}

.nav-link--active {
  color: var(--primary-dark) !important;
  font-weight: 700;
  background: var(--primary-gold) !important;
  box-shadow: 0 4px 12px rgba(185, 167, 121, 0.3);
}

.nav-link__icon {
  font-size: 20px;
}

/* Desktop Styles (Min-width: 1024px) - Revert to Horizontal Top Bar */
@media (min-width: 1024px) {
  .navbar {
    top: 80px;
    right: 0;
    left: 0;
    width: 100%;
    height: 56px;
    padding-top: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: none;
    background: var(--gradient-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .nav-wrapper {
    flex-direction: row; /* Horizontal */
    justify-content: center;
    align-items: center;
    padding: 0 32px;
    height: 100%;
  }

  .nav-link {
    width: auto;
    padding: 8px 16px;
    font-size: 14px;
    color: var(--primary-gold);
  }

  .nav-link--active {
    background: var(--gradient-gold) !important;
    color: var(--primary-dark) !important;
  }

  .mobile-overlay {
    display: none; /* Never show overlay on desktop */
  }
}
</style>