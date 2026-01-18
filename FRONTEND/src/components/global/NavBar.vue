<template>
  <nav class="navbar">
    <div class="nav-wrapper">
      <button 
        @click="setActiveTab('surveys')"
        class="nav-link" 
        :class="{ 'nav-link--active': activeTab === 'surveys' }"
      >
        <span class="nav-link__text">الاستبيانات</span>
      </button>
      <button 
        @click="setActiveTab('users')"
        class="nav-link" 
        :class="{ 'nav-link--active': activeTab === 'users' }"
      >
        <span class="nav-link__text">إدارة المستخدمين</span>
      </button>
      <button 
        @click="setActiveTab('schools')"
        class="nav-link" 
        :class="{ 'nav-link--active': activeTab === 'schools' }"
      >
        <span class="nav-link__text">المدارس</span>
      </button>
      <button 
        @click="setActiveTab('analytics')"
        class="nav-link" 
        :class="{ 'nav-link--active': activeTab === 'analytics' }"
      >
        <span class="nav-link__text">التحليلات</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['tab-change'])

const activeTab = ref('surveys')

const setActiveTab = (tab) => {
  activeTab.value = tab
  emit('tab-change', tab)
}

// Expose activeTab for parent component to access
defineExpose({
  activeTab
})
</script>

<style scoped>
.navbar {
  background: var(--gradient-primary);
  border-top: 1px solid var(--primary-teal);
  position: fixed;
  top: 80px; /* Default position below header */
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive positioning to match header height changes */
@media (max-width: 768px) {
  .navbar {
    top: 100px; /* Match tablet header height */
  }
}

@media (max-width: 480px) {
  .navbar {
    top: 80px; /* Match small phone header height */
  }
}

.nav-wrapper {
  display: flex;
  gap: 8px;
  padding: 0 32px;
  overflow-x: auto;
  justify-content: center;
  height: 48px;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: var(--primary-gold);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none !important;
  outline: none !important;
  cursor: pointer;
  box-shadow: none !important;
  background-color: transparent !important;
}

.nav-link::-moz-focus-inner {
  border: 0 !important;
  outline: 0 !important;
}

.nav-link:focus {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

.nav-link:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

.nav-link:-moz-focusring {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

/* Removed hover effect - buttons maintain original appearance */

.nav-link--active {
  color: var(--primary-dark);
  font-weight: 600;
  background: var(--gradient-gold) !important;
  box-shadow: 0 2px 8px rgba(var(--primary-gold-rgb), 0.3);
}

.nav-link__icon {
  font-size: 18px;
}

.nav-link__text {
  display: inline;
}

@media (max-width: 768px) {
  .nav-wrapper {
    padding: 0 20px;
    gap: 4px;
  }

  .nav-link {
    padding: 12px 16px;
    font-size: 14px;
    gap: 6px;
  }

  .nav-link__icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .nav-link__text {
    display: none;
  }

  .nav-link {
    padding: 10px 12px;
  }

  .nav-link__icon {
    font-size: 14px;
  }
}
</style>