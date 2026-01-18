// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/api/index.js'

export const useAuthStore = defineStore('auth', () => {


  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const hasAnalyticsAccess = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'ANALAYZER_USER')
  const userName = computed(() => user.value?.username || 'مستخدم')
  const selectedSchoolId = ref(localStorage.getItem('selectedSchoolId') ? parseInt(localStorage.getItem('selectedSchoolId')) : null)

  const userSchoolsList = computed(() => {
    if (!user.value) return []
    return user.value.school || user.value.schools || []
  })

  const setSelectedSchool = (id) => {
    selectedSchoolId.value = id
    localStorage.setItem('selectedSchoolId', id)
  }

  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login({
        username: credentials.username,
        password: credentials.password
      })

      console.log(' حالة الاستجابة:', response.status)
      const data = response.data
      console.log(' بيانات الاستجابة:', data)

      if (!data.token) {
        throw new Error(data.message || 'فشل تسجيل الدخول')
      }

      token.value = data.token
      user.value = data.user || data

      // تعيين المدرسة الافتراضية إذا لم تكن محددة
      const schools = user.value.school || user.value.schools || []
      if (schools.length > 0 && !selectedSchoolId.value) {
        setSelectedSchool(schools[0].id)
      }

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return data

    } catch (err) {
      error.value = err.message || 'حدث خطأ في الاتصال بالخادم'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    selectedSchoolId.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('selectedSchoolId')
  }

  const initialize = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedSchoolId = localStorage.getItem('selectedSchoolId')

    if (storedToken) token.value = storedToken
    if (storedSchoolId) selectedSchoolId.value = parseInt(storedSchoolId)

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        // إذا لم يكن هناك مدرسة مختارة، اختر الأولى
        const schools = user.value.school || user.value.schools || []
        if (schools.length > 0 && !selectedSchoolId.value) {
          setSelectedSchool(schools[0].id)
        }
      } catch (err) {
        localStorage.removeItem('user')
      }
    }
  }

  initialize()

  return {
    user,
    token,
    isLoading,
    error,
    selectedSchoolId,
    userSchoolsList,

    isAuthenticated,
    isAdmin,
    hasAnalyticsAccess,
    userName,

    login,
    logout,
    initialize,
    setSelectedSchool
  }
})