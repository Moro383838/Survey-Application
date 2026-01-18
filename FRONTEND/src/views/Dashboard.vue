<template>
  <div class="dashboard-container" dir="rtl">
    <header class="dashboard-header">
      <!-- Header Top Section -->
      <div class="dashboard-header__top">
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
            <div class="user-info">
              <h3 class="user-info__name">{{ username }}</h3>
              <p class="user-info__role">
                <span class="role-badge" :class="{ 'role-badge--admin': user.role === 'ADMIN', 'role-badge--user': user.role !== 'ADMIN' }">
                  {{ user.role === 'ADMIN' ? 'مدير النظام' : 'مستخدم' }}
                </span>
              </p>
            </div>
          </div>
          <LogOut />
        </div>
      </div>
    </header>
    
    <!-- Fixed Navigation Bar -->
    <NavBar @tab-change="handleTabChange" ref="navBarRef" />

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

const username = JSON.parse(localStorage.getItem('user')).username
const role = JSON.parse(localStorage.getItem('user')).role
const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user || { username: username, role: role })

const userInitials = computed(() => {
  if (!user.value?.username) return 'م'
  const names = user.value.username.split(' ')
  return names.length > 1 ? names[0][0] + names[1][0] : names[0][0]
})

// Tab management
const navBarRef = ref(null)
const currentComponent = shallowRef(Surveys)

const tabComponents = {
  surveys: Surveys,
  users: Users,
  schools: Schools,
  analytics: Analytics
}

const handleTabChange = (tabName) => {
  if (tabComponents[tabName]) {
    currentComponent.value = tabComponents[tabName]
  }
}

if (!authStore.isAdmin && !authStore.hasAnalyticsAccess) {
  router.push('/home')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #ffffff;
  direction: rtl;
  text-align: right;
}

.dashboard-header {
  background: var(--gradient-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100; /* Above navbar */
}

.dashboard-header__top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 32px;
  min-height: 80px;
}

.dashboard-header__emblem {
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  width: 280px;
  height: 280px;
  max-width: 400px;
  z-index: 10;
  pointer-events: none;
}

.emblem-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dashboard-header__center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.dashboard-header__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-gold);
  margin: 0 0 4px 0;
  line-height: 1.2;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(185, 167, 121, 0.3);
  letter-spacing: 1px;
}

.dashboard-header__subtitle {
  font-size: 12px;
  color: var(--primary-gold);
  margin: 0;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 15px rgba(185, 167, 121, 0.2);
}

.dashboard-header__user {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: auto;
  z-index: 10;
  position: relative;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: var(--primary-gold);
  border: 2px solid var(--primary-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-dark);
  font-weight: 700;
  font-size: 14px;
  text-align: center;
}

.user-avatar__text {
  display: block;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-info__name {
  font-size: 13px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
}

.user-info__role {
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.role-badge--admin {
  background: var(--primary-gold);
  color: var(--primary-dark);
}

.role-badge--user {
  background: var(--gold-light);
  color: var(--primary-dark);
}

.dashboard-content {
  padding: 0;
  margin-top: 128px; /* Default space for header (80px) + navbar (48px) */
}

/* Responsive margin to match changing header/navbar heights */
@media (max-width: 768px) {
  .dashboard-content {
    margin-top: 148px; /* Space for header (100px) + navbar (48px) */
  }
}

@media (max-width: 480px) {
  .dashboard-content {
    margin-top: 128px; /* Space for header (80px) + navbar (48px) */
  }
}

@media (max-width: 768px) {
  .dashboard-header__top {
    padding: 12px 20px;
    min-height: 100px;
  }

  .dashboard-header__emblem {
    width: 180px;
    height: 180px;
  }

  .dashboard-header__title {
    font-size: 22px;
  }

  .dashboard-header__subtitle {
    font-size: 12px;
  }

  .dashboard-header__user {
    gap: 12px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    min-width: 40px;
    font-size: 14px;
  }

  .user-info__name {
    font-size: 13px;
  }

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
  .dashboard-header__emblem {
    width: 120px;
    height: 120px;
  }

  .dashboard-header__top {
    min-height: 80px;
  }

  .dashboard-header__title {
    font-size: 18px;
  }

  .dashboard-header__subtitle {
    font-size: 11px;
  }

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

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #ffffff;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-gold);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9a8660;
}

@keyframes emblem-entrance {
  0% {
    opacity: 0;
    transform: translateY(-30%) scale(0.8);
  }
  100% {
    opacity: 0.1;
    transform: translateY(-50%) scale(1);
  }
}
</style>