<template>
  <div class="dashboard-container" dir="rtl">
    <header class="dashboard-header">
      <!-- Header Top Section -->
      <div class="dashboard-header__top">
        <!-- Mobile Menu Button (Hamburger) -->
        <button class="menu-btn lg:hidden" @click="isMenuOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="dashboard-header__emblem">
          <img src="/Syrian Arab Republic.svg" alt="شعار النظام" class="emblem-svg" />
        </div>
        
        <div class="dashboard-header__center">
          <h1 class="dashboard-header__title">لوحة التحكم</h1>
          <p class="dashboard-header__subtitle">نظام الاستبيانات الإلكتروني</p>
        </div>

        <div class="dashboard-header__user">
          <div class="user-section">
            <div class="user-avatar">
              <span class="user-avatar__text">{{ userInitials }}</span>
            </div>
            <div class="user-info hidden md:flex">
              <h3 class="user-info__name">{{ username }}</h3>
              <p class="user-info__role">
                <span class="role-badge" :class="{ 'role-badge--admin': authStore.isAdmin, 'role-badge--user': !authStore.isAdmin }">
                  {{ authStore.isAdmin ? 'مدير النظام' : (authStore.hasAnalyticsAccess ? 'محلل بيانات' : 'مستخدم') }}
                </span>
              </p>
            </div>
          </div>
          <div class="header-divider"></div>
          <LogOut />
        </div>
      </div>
    </header>
    
    <!-- Navigation (Drawer on Mobile, Bar on Desktop) -->
    <NavBar 
      :is-open="isMenuOpen" 
      @close="isMenuOpen = false"
      @tab-change="handleTabChange" 
      ref="navBarRef" 
    />

    <main class="dashboard-content">
      <component :is="currentComponent" />
    </main>
  </div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LogOut from '@/components/global/LogOut.vue'
import NavBar from '@/components/global/NavBar.vue'

// Import tab components
import Surveys from '@/views/dashboard/Surveys.vue'
import Users from '@/views/dashboard/Users.vue'
import Schools from '@/views/dashboard/Schools.vue'
import Analytics from '@/views/dashboard/Analytics.vue'

const authStore = useAuthStore()
const username = authStore.userName
const router = useRouter()

const user = computed(() => authStore.user || { username: username, role: authStore.isAdmin ? 'ADMIN' : (authStore.hasAnalyticsAccess ? 'ANALAYZER_USER' : 'USER') })

const userInitials = computed(() => {
  if (!user.value?.username) return 'م'
  const names = user.value.username.split(' ')
  return names.length > 1 ? names[0][0] + names[1][0] : names[0][0]
})

// Mobile Menu State
const isMenuOpen = ref(false)

// Tab management
const navBarRef = ref(null)
const currentComponent = shallowRef(authStore.isAdmin ? Surveys : Analytics)

const tabComponents = {
  surveys: Surveys,
  users: Users,
  schools: Schools,
  analytics: Analytics
}

const handleTabChange = (tabName) => {
  // الحماية: المحلل لا يمكنه الدخول لتبويبات المشرف
  if (!authStore.isAdmin && (tabName === 'surveys' || tabName === 'users' || tabName === 'schools')) {
    return
  }

  if (tabComponents[tabName]) {
    currentComponent.value = tabComponents[tabName]
  }
}

if (!authStore.isAdmin && !authStore.hasAnalyticsAccess) {
  router.push('/home')
}
</script>

<style scoped>
/* Base (Mobile) Styles */
.dashboard-container {
  min-height: 100vh;
  background: #f8fafc; /* Lighter background for better contrast */
  direction: rtl;
  text-align: right;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.dashboard-header {
  background: var(--gradient-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  width: 100%;
}

.dashboard-header__top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 64px;
}

/* Mobile Menu Button */
.menu-btn {
  background: transparent;
  border: none;
  color: var(--primary-gold);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 20;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Center Content (Title) */
.dashboard-header__center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  width: 100%;
  pointer-events: none; /* Let clicks pass through to buttons */
}

.dashboard-header__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-gold);
  margin: 0;
  line-height: 1.2;
}

.dashboard-header__subtitle {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  display: none; /* Hide subtitle on very small screens */
}

/* Emblem (Hidden on mobile to save space, or very small) */
.dashboard-header__emblem {
  display: none; 
}

/* User Section */
.dashboard-header__user {
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 20;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: var(--primary-gold);
  border: 2px solid var(--primary-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-dark);
  font-weight: 700;
  font-size: 14px;
}

.header-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 8px;
}

/* Content Area */
.dashboard-content {
  padding: 0;
  padding-top: 64px;
  width: 100%;
}

/* Utility Helpers */
.hidden { display: none !important; }
.flex { display: flex !important; }
@media (min-width: 768px) {
  .md\:flex { display: flex !important; }
}
@media (min-width: 1024px) {
  .lg:hidden { display: none !important; }
}

/* Desktop Styles (Min-width: 1024px) */
@media (min-width: 1024px) {
  .dashboard-header {
    height: 80px;
    padding: 0 32px;
  }

  .dashboard-header__top {
    height: 80px;
    padding: 0;
  }

  .menu-btn {
    display: none;
  }

  .dashboard-header__center {
    width: auto;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .dashboard-header__title {
    font-size: 24px;
  }

  .dashboard-header__subtitle {
    display: block;
    font-size: 12px;
  }

  .dashboard-header__emblem {
    display: block;
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    width: 120px; /* Smaller than before to fit */
    height: 120px;
    opacity: 0.1;
    pointer-events: none;
  }
  
  .emblem-svg {
    width: 100%;
    height: 100%;
  }

  /* User Info visible on desktop */
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .user-info__name {
    font-size: 14px;
    color: white;
    font-weight: 600;
  }

  .role-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }
  
  .role-badge--admin { background: var(--primary-gold); color: var(--primary-dark); }
  .role-badge--user { background: var(--gold-light); color: var(--primary-dark); }

  /* Content Spacing for Desktop Fixed Header + Nav */
  .dashboard-content {
    margin-top: 0;
    padding-top: 136px; /* 80px Header + 56px Nav */
  }
}
</style>