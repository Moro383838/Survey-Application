<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LogOut from '@/components/global/LogOut.vue'

const authStore = useAuthStore()
const router = useRouter()

const userName = computed(() => authStore.user?.username || authStore.user?.name || '')
const selectedSchool = computed(() => {
  return authStore.userSchoolsList.find(s => s.id === authStore.selectedSchoolId) || authStore.userSchoolsList[0]
})
const schoolName = computed(() => selectedSchool.value?.name || 'المدرسة')

const handleSchoolChange = (event) => {
  authStore.setSelectedSchool(parseInt(event.target.value))
}

// Dashboard cards for school users
const dashboardCards = [
  {
    id: 1,
    title: 'الاستبيانات المتاحة',
    description: 'عرض والإجابة على الاستبيانات المطلوبة',
    icon: '📝',
    color: 'var(--primary-dark)',
    route: '/available-surveys'
  },
  {
    id: 2,
    title: 'الاستبيانات المكتملة',
    description: 'عرض الاستبيانات التي تم تعبئتها',
    icon: '✅',
    color: '#b9a779',
    route: '#'
  },
  {
    id: 3,
    title: 'الإحصائيات',
    description: 'عرض إحصائيات المشاركة',
    icon: '📊',
    color: 'var(--primary-dark)',
    route: '#'
  }
]

const navigateTo = (route) => {
  if (route !== '#') {
    router.push(route)
  }
}
</script>

<template>
  <div class="home-container">
    <header class="home-header">
      <div class="header-content">
        <div class="header-logo">
          <img src="/logo.png" alt="شعار النظام" class="logo-img" />
          <div class="logo-text">
            <h1>الصفحة الرئيسية</h1>
            <p>مرحباً بك في نظام الاستبيانات</p>
          </div>
        </div>

        <div class="header-actions">
          <!-- School Selector -->
          <div class="school-selector-container" v-if="authStore.userSchoolsList.length > 1">
            <span class="selector-label">المدرسة النشطة:</span>
            <select 
              :value="authStore.selectedSchoolId" 
              @change="handleSchoolChange"
              class="school-select"
            >
              <option 
                v-for="school in authStore.userSchoolsList" 
                :key="school.id" 
                :value="school.id"
              >
                {{ school.name }}
              </option>
            </select>
          </div>

          <div class="user-welcome" v-if="authStore.user">
            <span class="welcome-icon">👋</span>
            <span>مرحباً، {{ userName }}</span>
          </div>

          <LogOut />
        </div>
      </div>
    </header>

    <main class="home-main">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-card">
          <div class="welcome-icon-large">🏫</div>
          <h2>مرحباً بك في {{ schoolName }}</h2>
          <p>يمكنك من هنا الوصول إلى جميع الاستبيانات المتاحة لمدرستك</p>
        </div>
      </div>

      <!-- Dashboard Cards -->
      <div class="dashboard-section">
        <h3 class="section-title">الخدمات المتاحة</h3>
        <div class="cards-grid">
          <div 
            v-for="card in dashboardCards" 
            :key="card.id"
            class="dashboard-card"
            :style="{ '--card-color': card.color }"
            @click="navigateTo(card.route)"
            :class="{ 'disabled': card.route === '#' }"
          >
            <div class="card-icon">{{ card.icon }}</div>
            <h4 class="card-title">{{ card.title }}</h4>
            <p class="card-description">{{ card.description }}</p>
            <div class="card-arrow">←</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h3 class="section-title">إجراءات سريعة</h3>
        <div class="quick-actions">
          <button class="quick-action-btn primary" @click="navigateTo('/available-surveys')">
            <span class="btn-icon">📝</span>
            <span>عرض الاستبيانات المتاحة</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f8fafc;
  direction: rtl;
}

.home-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 2px solid var(--primary-gold);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-img {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.logo-text h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
  line-height: 1.2;
}

.logo-text p {
  font-size: 0.875rem;
  color: var(--primary-gold);
  margin: 0;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f5f1e8, #e8dfc8);
  border: 1px solid var(--primary-gold);
  border-radius: 0.75rem;
  color: var(--primary-dark);
  font-weight: 500;
}

.welcome-icon {
  font-size: 1.125rem;
}

/* School Selector */
.school-selector-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.selector-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

.school-select {
  border: none;
  background: none;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--primary-dark);
  cursor: pointer;
  outline: none;
  padding: 0.25rem;
}

.school-select:focus {
  color: var(--primary-gold);
}

/* Main Content */
.home-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 3rem;
}

.welcome-card {
  background: var(--gradient-primary);
  color: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 38, 35, 0.2);
}

.welcome-icon-large {
  font-size: 64px;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.welcome-card h2 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.welcome-card p {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.9;
}

/* Dashboard Section */
.dashboard-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 4px;
  background: var(--card-color);
}

.dashboard-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--card-color);
}

.dashboard-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.card-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.card-arrow {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  font-size: 1.5rem;
  color: var(--card-color);
  opacity: 0;
  transition: all 0.3s ease;
}

.dashboard-card:hover:not(.disabled) .card-arrow {
  opacity: 1;
  transform: translateX(-4px);
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 2rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn.primary {
  background: var(--primary-dark);
  color: white;
}

.quick-action-btn.primary:hover {
  background: var(--primary-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.3);
}

.btn-icon {
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .home-main {
    padding: 1rem;
  }

  .welcome-card {
    padding: 2rem 1.5rem;
  }

  .welcome-card h2 {
    font-size: 1.5rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>