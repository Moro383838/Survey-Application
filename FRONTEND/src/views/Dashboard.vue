<template>
  <div class="dashboard-container">
    <!-- الهيدر -->
    <header class="dashboard-header">
      <div class="header-main">
        <UserProfile 
            variant="compact" 
            :showActions="false"
          />
        <div class="header-logo">
          <img src="/logo.png" alt="شعار النظام" class="logo-img" />
          <div class="logo-text">
            <h1>لوحة التحكم</h1>
            <p>نظام الاستبيانات الإلكتروني</p>
          </div>
        </div>

        <div class="header-user">
          <div class="user-info">
            <div class="user-avatar">
              <span class="avatar-text">{{ userInitials }}</span>
            </div>
            <div class="user-details">
              <h3>{{ username }}</h3>
              <p class="user-role">
                <span class="role-badge" :class="user.role">
                  {{ user.role === 'ADMIN' ? 'مدير النظام' : 'مستخدم' }}
                </span>
              </p>
            </div>
          </div>
          <LogOut />
        </div>
      </div>

      <nav class="dashboard-nav">
        <div class="nav-container">
          <router-link to="/dashboard" class="nav-item active">
            <span class="nav-icon">📊</span>
            <span>لوحة التحكم</span>
          </router-link>
          <router-link to="/surveys/create-wizard" class="nav-item">
            <span class="nav-icon">➕</span>
            <span>إضافة استبيان</span>
          </router-link>
          <router-link to="/surveys" class="nav-item">
            <span class="nav-icon">📋</span>
            <span>الاستبيانات</span>
          </router-link>
          <router-link to="/dashboard/users" class="nav-item">
            <span class="nav-icon">👥</span>
            <span>ادارة المستخدمين</span>
          </router-link>
          <router-link to="/dashboard/schools" class="nav-item">
            <span class="nav-icon">🏫</span>
            <span>المدارس</span>
          </router-link>
          <router-link to="/dashboard/analytics" class="nav-item active">
            <span class="nav-icon">📊</span>
            <span> التحليلات</span>
          </router-link>
        </div>
      </nav>
    </header>
    <main class="dashboard-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LogOut from '@/components/global/LogOut.vue'
import UserProfile from '@/components/global/UserProfile.vue'

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

// Allow both ADMIN and ANALAYZER_USER to access dashboard
if (!authStore.isAdmin && !authStore.hasAnalyticsAccess) {
  router.push('/home')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-header {
  background: linear-gradient(135deg, #002623, #001a18);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid #b9a779;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.logo-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
}

.logo-text p {
  font-size: 0.875rem;
  color: #b9a779;
  margin: 0;
  font-weight: 500;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #b9a779, #d4af37);
  border: 2px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #002623;
  font-weight: 700;
  font-size: 1.125rem;
}

.user-details h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}

.user-role {
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.admin {
  background: linear-gradient(135deg, #b9a779, #d4af37);
  color: #002623;
}

.role-badge.user {
  background: linear-gradient(135deg, #e8dfc8, #b9a779);
  color: #002623;
}

.dashboard-nav {
  background: linear-gradient(135deg, #001a18, #002623);
  border-bottom: 2px solid #b9a779;
  box-shadow: inset 0 -1px 0 rgba(185, 167, 121, 0.2);
}

.nav-container {
  display: flex;
  gap: 0.5rem;
  padding: 0 2rem;
  overflow-x: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  background: none;
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(185, 167, 121, 0.1);
  color: #ffffff;
  border-color: rgba(185, 167, 121, 0.3);
}

.nav-item.active {
  background: linear-gradient(135deg, #b9a779, #d4af37);
  color: #002623;
  font-weight: 600;
  border-color: #b9a779;
}

.nav-icon {
  font-size: 1.125rem;
}

.dashboard-content {
  padding: 0;
}
</style>