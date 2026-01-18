// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import SchoolDetails from '@/components/schools/SchoolDetails.vue'
import dashboard from '@/views/Dashboard.vue'  
const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: dashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/question-library',
    name: 'QuestionLibrary',
    component: () => import('@/components/surveys/QuestionTypesContainer.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/available-surveys',
    name: 'AvailableSurveys',
    component: () => import('@/components/surveys/AvailableSurveys.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },
  {
    path: '/dashboard/analytics',
    name: 'Analytics',
    component: () => import('@/views/dashboard/Analytics.vue'),
    meta: { requiresAuth: true, requiresAnalyticsAccess: true }
  },
  {
    path: '/dashboard/users',
    name: 'Users',
    component: () => import('@/views/dashboard/Users.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/dashboard/schools',
    name: 'Schools',
    component: () => import('@/views/dashboard/Schools.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/schools/:id',
    name: 'SchoolDetails',
    component: SchoolDetails,
    props: true
  },
  {
    path: '/dashboard/users/:id',
    name: 'UsersDetails',
    component: () => import('@/components/users/UsersDetails.vue')
  },
  {
    path: '/surveys',
    name: 'Surveys',
    component: () => import('@/views/dashboard/Surveys.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/surveys/create-wizard',
    name: 'CreateSurveyWizard',
    component: () => import('@/components/surveys/CreateSurveyWizard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/surveys/edit-wizard/:id',
    name: 'EditSurveyWizard',
    component: () => import('@/components/surveys/EditSurveyWizard.vue'),
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/surveys/:id',
    name: 'SurveyDetails',
    component: () => import('@/components/surveys/SurveyDetails.vue'),
    props: true,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // إعادة تحميل الحالة من localStorage
  if (!authStore.user && localStorage.getItem('user')) {
    authStore.initialize()
  }

  // إذا كانت الصفحة تتطلب مصادقة
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('⛔ غير مصرح - توجيه إلى تسجيل الدخول')
    next('/')
    return
  }

  // إذا كانت الصفحة تتطلب عدم مصادقة
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next('/dashboard')
    } else if (authStore.hasAnalyticsAccess) {
      // ANALAYZER_USER goes directly to analytics
      next('/dashboard/analytics')
    } else {
      next('/home')
    }
    return
  }

  // إذا كانت الصفحة تتطلب صلاحيات مدير
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/home')
    return
  }

  // إذا كانت الصفحة تتطلب صلاحيات تحليل (مدير أو محلل)
  if (to.meta.requiresAnalyticsAccess) {
    const userRole = authStore.user?.role
    const hasAnalyticsAccess = userRole === 'ADMIN' || userRole === 'ANALAYZER_USER'
    
    if (!hasAnalyticsAccess) {
      next('/home')
      return
    }
  }

  next()
})

export default router