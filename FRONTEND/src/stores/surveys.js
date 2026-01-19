import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api, { aidService, surveyService } from '@/api/index.js'
import { useAuthStore } from '@/stores/auth.js'

export const useSurveyStore = defineStore('survey', () => {
  // State
  const surveys = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const stats = ref({})

  // Base URL للـ API
  const API_BASE_URL = '/survey/'

  // أنواع الأسئلة (من قاعدة البيانات)
  const questionTypes = ref([])

  // Computed
  const filteredSurveys = computed(() => {
    return surveys.value
  })

  const paginatedSurveys = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return surveys.value.slice(start, start + itemsPerPage.value)
  })

  // Actions
  const fetchQuestionTypes = async () => {
    try {
      const response = await aidService.getQuestionTypes()

      if (response.data && Array.isArray(response.data)) {
        // تحويل البيانات لتناسب الواجهة إذا لزم الأمر
        questionTypes.value = response.data.map(type => ({
          ...type,
          name: type.label || type.name, // دعم كلا التسميتين
          icon: getTypeIcon(type.code)
        }))
      } else {
        questionTypes.value = getDefaultQuestionTypes()
      }
    } catch (err) {
      console.error('❌ خطأ في جلب أنواع الأسئلة:', err)
      questionTypes.value = getDefaultQuestionTypes()
    }
  }

  // مساعد للحصول على الأيقونة بناءً على الكود
  const getTypeIcon = (code) => {
    const icons = {
      'SHORT_TEXT': '📝',
      'LONG_TEXT': '📄',
      'SINGLE_CHOICE': '🔘',
      'MULTIPLE_CHOICE': '☑️',
      'NUMBER': '🔢',
      'DATE': '📅',
      'TIME': '⏰',
      'DATE_RANGE': '📆',
      'DATETIME_RANGE': '🗓️'
    }
    return icons[code] || '❓'
  }

  const getDefaultQuestionTypes = () => [
    { id: 1, name: 'نص قصير', icon: '📝', code: 'SHORT_TEXT' },
    { id: 2, name: 'نص طويل', icon: '📄', code: 'LONG_TEXT' },
    { id: 3, name: 'اختيار واحد', icon: '🔘', code: 'SINGLE_CHOICE' },
    { id: 4, name: 'اختيار متعدد', icon: '☑️', code: 'MULTIPLE_CHOICE' },
    { id: 5, name: 'رقم', icon: '🔢', code: 'NUMBER' },
    { id: 6, name: 'تاريخ', icon: '📅', code: 'DATE' },
    { id: 7, name: 'وقت', icon: '⏰', code: 'TIME' },
    { id: 8, name: 'مجال تاريخ', icon: '📆', code: 'DATE_RANGE' },
    { id: 9, name: 'مجال تاريخ ووقت', icon: '🗓️', code: 'DATETIME_RANGE' }
  ]


  const fetchSurveys = async () => {
    loading.value = true
    error.value = null

    try {

      // Ensure auth store is available and token is current
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const response = await api.get(API_BASE_URL)

      if (response.data && Array.isArray(response.data)) {
        surveys.value = response.data.map(s => {
          // Backfill status_id if missing based on label
          let sId = s.status_id
          if (!sId && s.status_label) {
            if (s.status_label === 'مسودة') sId = 1
            else if (s.status_label === 'نشط') sId = 2
            else if (s.status_label === 'مغلق' || s.status_label === 'مكتمل') sId = 3
          }
          return { ...s, status_id: sId }
        })
      } else {
        surveys.value = []
        console.warn('⚠️ API عاد ببيانات غير متوقعة:', response.data)
      }

      calculateStats()

    } catch (err) {
      error.value = 'فشل في تحميل الاستبيانات: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ في جلب الاستبيانات:', err)

      // Check if error is 401 (Unauthorized) and redirect to login
      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        // Optionally redirect to login page
        // window.location.href = '/login'
      }

      // بيانات تجريبية للتنمية
      surveys.value = getMockSurveys()
      calculateStats()
    } finally {
      loading.value = false
    }
  }

  const fetchSurveyById = async (id) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 جاري جلب الاستبيان ${id}...`)

      // Ensure auth store is available and token is current
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const response = await api.get(`${API_BASE_URL}${id}/`)

      if (response.data) {
        console.log('✅ تم جلب الاستبيان بنجاح:', response.data)
        return response.data
      }

      throw new Error('لم يتم العثور على الاستبيان')

    } catch (err) {
      error.value = 'فشل في تحميل الاستبيان: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في جلب الاستبيان ${id}:`, err)

      // Check if error is 401 (Unauthorized) and redirect to login
      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        // Optionally redirect to login page
        // window.location.href = '/login'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const calculateStats = () => {
    const total = surveys.value.length
    const active = surveys.value.filter(s => s.status_id === 2).length
    const draft = surveys.value.filter(s => s.status_id === 1).length
    const completed = surveys.value.filter(s => s.status_id === 3).length

    stats.value = {
      total_surveys: total,
      active_surveys: active,
      draft_surveys: draft,
      completed_surveys: completed,
      periodic_surveys: surveys.value.filter(s => s.is_periodic).length
    }
  }

  const fetchStats = async () => {
    try {
      calculateStats()
    } catch (err) {
      console.error('❌ خطأ في جلب إحصائيات الاستبيانات:', err)
    }
  }

  const searchSurveys = (text) => {
    currentPage.value = 1
  }

  const setPage = (page) => {
    currentPage.value = page
  }

  const createSurvey = async (payload) => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 جاري إنشاء الاستبيان:', payload)

      // Ensure auth store is available and token is current
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      // تحويل البيانات لتتوافق مع API
      const apiPayload = {
        title: payload.title,
        description: payload.description,
        isPeriodic: !!payload.isPeriodic,
        startDate: payload.startDate,
        endDate: payload.endDate,
        frequencyId: payload.isPeriodic ? payload.frequencyId : null
      }

      const response = await api.post(API_BASE_URL, apiPayload)

      if (response.data) {
        // Don't add to list yet as we only get ID back
        // surveys.value.unshift(response.data)
        console.log('✅ تم إنشاء الاستبيان بنجاح:', response.data)
        return response.data
      }

    } catch (err) {
      error.value = 'حدث خطأ أثناء إنشاء الاستبيان: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ في إنشاء الاستبيان:', err)

      // Check if error is 401 (Unauthorized) and redirect to login
      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        // Optionally redirect to login page
        // window.location.href = '/login'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSurvey = async (id, payload) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 جاري تحديث الاستبيان ${id}:`, payload)

      // Ensure auth store is available and token is current
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const formatDateForAPI = (dateString) => {
        if (!dateString) return null
        if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
          // Return the local datetime string without timezone conversion
          return dateString
        }
        return dateString
      }

      // Handle frequencyId based on isPeriodic value
      let frequencyIdToSend = null
      if (payload.isPeriodic && payload.frequencyId) {
        frequencyIdToSend = payload.frequencyId
      }

      const apiPayload = {
        title: payload.title,
        description: payload.description || '',
        isPeriodic: !!payload.isPeriodic,
        startDate: formatDateForAPI(payload.startDate),
        endDate: formatDateForAPI(payload.endDate),
        frequencyId: payload.isPeriodic ? payload.frequencyId : null
      }

      // إزالة الحقول الفارغة (لكن نحتفظ بـ boolean fields و description)
      Object.keys(apiPayload).forEach(key => {
        // Always keep boolean fields (isPeriodic) and description
        if (key === 'description' || typeof apiPayload[key] === 'boolean') return
        // Remove only null or undefined values
        if (apiPayload[key] === null || apiPayload[key] === undefined) {
          delete apiPayload[key]
        }
      })

      console.log('📤 Sending update payload:', JSON.stringify(apiPayload, null, 2))
      console.log('🔍 isPeriodic value being sent:', apiPayload.isPeriodic)
      const response = await api.put(`${API_BASE_URL}${id}/`, apiPayload)

      // Backend returns success message, so we need to fetch updated survey data
      console.log('📥 Backend response:', response.data)

      // Fetch the updated survey data
      const updatedSurvey = await fetchSurveyById(id)

      if (updatedSurvey) {
        const index = surveys.value.findIndex(s => s.id === id)
        if (index !== -1) {
          console.log('🔄 Updating survey in local list:')
          console.log('  Old is_periodic:', surveys.value[index].is_periodic)
          console.log('  New is_periodic:', updatedSurvey.is_periodic)
          surveys.value[index] = updatedSurvey
        }
        calculateStats()
        console.log('✅ تم تحديث الاستبيان بنجاح:', updatedSurvey)
        return updatedSurvey
      }

      // If fetch fails, return the response anyway
      return response.data

    } catch (err) {
      error.value = 'حدث خطأ أثناء تحديث الاستبيان: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ في تحديث الاستبيان:', err)

      // Check if error is 401 (Unauthorized) and redirect to login
      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        // Optionally redirect to login page
        // window.location.href = '/login'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSurvey = async (id) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔄 جاري حذف الاستبيان ${id}...`)

      // Ensure auth store is available and token is current
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      await api.delete(`${API_BASE_URL}${id}/`)

      surveys.value = surveys.value.filter(s => s.id !== id)
      calculateStats()

      console.log(`✅ تم حذف الاستبيان ${id} بنجاح`)
      return true

    } catch (err) {
      error.value = 'حدث خطأ أثناء حذف الاستبيان: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في حذف الاستبيان ${id}:`, err)

      // Check if error is 401 (Unauthorized) and redirect to login
      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        // Optionally redirect to login page
        // window.location.href = '/login'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const getSurveyById = (id) => {
    return surveys.value.find(s => s.id === id)
  }

  const publishSurvey = async (id) => {
    loading.value = true
    error.value = null
    try {
      console.log(`🚀 جاري نشر الاستبيان ${id}...`)

      // Ensure auth store is available and token is current
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const response = await api.post(`${API_BASE_URL}${id}/publish/`)

      if (response.data) {
        const index = surveys.value.findIndex(s => s.id === id)
        if (index !== -1) {
          surveys.value[index] = response.data
        }
        calculateStats()
        console.log('✅ تم نشر الاستبيان بنجاح:', response.data)
        return response.data
      }
    } catch (err) {
      error.value = 'حدث خطأ أثناء نشر الاستبيان: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في نشر الاستبيان ${id}:`, err)

      if (err.response?.data) {
        console.error('❌ تفاصيل خطأ السيرفر:', err.response.data)
      }

      // Check if error is 401 (Unauthorized) and redirect to login
      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const unpublishSurvey = async (id, resetData = false) => {
    loading.value = true
    error.value = null
    try {
      console.log(`📤 جاري إلغاء نشر الاستبيان ${id}...`)

      // Ensure auth store is available and token is current
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const payload = typeof resetData === 'object' ? resetData : { reset: resetData }
      const response = await surveyService.unpublishSurvey(id, payload)

      // Backend returns message, so we need to fetch updated survey
      const updatedSurvey = await fetchSurveyById(id)

      if (updatedSurvey) {
        const index = surveys.value.findIndex(s => s.id === id)
        if (index !== -1) {
          surveys.value[index] = updatedSurvey
        }
        calculateStats()
        console.log('✅ تم إلغاء نشر الاستبيان بنجاح')
        return updatedSurvey
      }
      return response.data
    } catch (err) {
      error.value = 'حدث خطأ أثناء إلغاء نشر الاستبيان: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في إلغاء نشر الاستبيان ${id}:`, err)

      if (err.response?.data) {
        console.error('❌ تفاصيل خطأ السيرفر (Unpublish):', err.response.data)
      }

      // Check if error is 401 (Unauthorized) and redirect to login
      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const addQuestion = async (surveyId, payload) => {
    loading.value = true
    error.value = null
    try {
      console.log(`📝 جاري إضافة سؤال للاستبيان ${surveyId}:`, payload)

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const apiPayload = {
        text: payload.text,
        typeId: payload.type_id,
        isRequired: payload.required,
        order: payload.order || 0
      }

      if ([3, 4].includes(payload.type_id) && payload.options) {
        apiPayload.options = payload.options.map(o => typeof o === 'object' ? o.text : o)
      }

      const response = await api.post(`${API_BASE_URL}${surveyId}/questions/`, apiPayload)
      console.log('✅ تم إضافة السؤال بنجاح:', response.data)
      return response.data
    } catch (err) {
      error.value = 'حدث خطأ أثناء إضافة السؤال: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في إضافة السؤال للاستبيان ${surveyId}:`, err)

      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const editQuestion = async (questionId, payload) => {
    loading.value = true
    error.value = null
    try {
      console.log(`✏️ جاري تعديل السؤال ${questionId}:`, payload)

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const apiPayload = {
        text: payload.text,
        typeId: payload.type_id,
        isRequired: payload.required,
        order: payload.order || 0
      }

      if ([3, 4].includes(payload.type_id) && payload.options) {
        apiPayload.options = payload.options.map(o => typeof o === 'object' ? o.text : o)
      }

      // Backend route is PUT /api/v1/surveys/questions/:questionId
      // Ensure the URL matches your backend routes structure
      const response = await api.put(`${API_BASE_URL}questions/${questionId}`, apiPayload)
      console.log('✅ تم تعديل السؤال بنجاح:', response.data)
      return response.data
    } catch (err) {
      error.value = 'حدث خطأ أثناء تعديل السؤال: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في تعديل السؤال ${questionId}:`, err)

      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteQuestionFromSurvey = async (questionId) => {
    loading.value = true
    error.value = null
    try {
      console.log(`🗑️ جاري حذف السؤال ${questionId}...`)

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      // Backend route is DELETE /api/v1/surveys/questions/:questionId
      await api.delete(`${API_BASE_URL}questions/${questionId}`)

      console.log('✅ تم حذف السؤال بنجاح')
      return true
    } catch (err) {
      error.value = 'حدث خطأ أثناء حذف السؤال: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في حذف السؤال ${questionId}:`, err)

      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }


  const setTargets = async (surveyId, payload) => {
    loading.value = true
    error.value = null
    try {
      console.log(`🎯 جاري تحديد المستهدفين للاستبيان ${surveyId}:`, payload)

      // Ensure auth store is available and token is current
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      // Build sanitized payload
      const apiPayload = {}

      const directorateIds = Array.from(payload.directorateIds || []).map(Number)
      if (directorateIds.length > 0) apiPayload.directorateIds = directorateIds

      const complexIds = Array.from(payload.complexIds || []).map(Number)
      if (complexIds.length > 0) apiPayload.complexIds = complexIds

      const schoolIds = Array.from(payload.schoolIds || []).map(Number)
      if (schoolIds.length > 0) apiPayload.schoolIds = schoolIds

      console.log('📦 Payload Being Sent:', JSON.stringify(apiPayload, null, 2))

      // Ensure at least one target is selected
      if (Object.keys(apiPayload).length === 0) {
        throw new Error('يجب اختيار فئة واحدة على الأقل (مديرية، مجمع، أو مدرسة)')
      }

      const response = await api.post(`${API_BASE_URL}${surveyId}/targets/`, apiPayload)
      console.log('✅ تم تحديد المستهدفين بنجاح:', response.data)
      return response.data
    } catch (err) {
      const serverError = err.response?.data?.error || err.response?.data?.message
      console.error('❌ Server Error Details:', err.response?.data)
      error.value = 'خطأ في الحفظ: ' + (serverError || err.message)

      // Check if error is 401 (Unauthorized) and redirect to login
      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const draftSurvey = async (id) => {
    try {
      const survey = surveys.value.find(s => s.id === id)
      if (!survey) throw new Error('الاستبيان غير موجود')

      const payload = {
        ...survey,
        status_id: 1
      }

      return await updateSurvey(id, payload)
    } catch (err) {
      throw err
    }
  }

  const closeSurvey = async (id) => {
    loading.value = true
    error.value = null
    try {
      console.log(`🔒 جاري إغلاق الاستبيان ${id}...`)

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const response = await surveyService.closeSurvey(id)

      // Backend returns message, so we need to fetch updated survey
      const updatedSurvey = await fetchSurveyById(id)

      if (updatedSurvey) {
        const index = surveys.value.findIndex(s => s.id === id)
        if (index !== -1) {
          surveys.value[index] = updatedSurvey
        }
        calculateStats()
        console.log('✅ تم إغلاق الاستبيان بنجاح')
        return updatedSurvey
      }

      return response.data
    } catch (err) {
      error.value = 'حدث خطأ أثناء إغلاق الاستبيان: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في إغلاق الاستبيان ${id}:`, err)

      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const getSurveyResponses = async (surveyId) => {
    loading.value = true
    error.value = null
    try {
      console.log(`🔄 جاري جلب إجابات الاستبيان ${surveyId}...`)

      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('غير مصرح بالوصول - الرجاء تسجيل الدخول')
      }

      const response = await surveyService.getResponses(surveyId)

      if (response.data) {
        console.log('✅ تم جلب الإجابات بنجاح')
        return response
      }

      throw new Error('لم يتم العثور على إجابات')
    } catch (err) {
      error.value = 'فشل في تحميل الإجابات: ' + (err.response?.data?.message || err.message)
      console.error(`❌ خطأ في جلب إجابات الاستبيان ${surveyId}:`, err)

      if (err.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshSurveys = async () => {
    try {
      await fetchSurveys()
    } catch (err) {
      console.error('❌ خطأ في تحديث الاستبيانات:', err)
    }
  }



  return {
    // State
    surveys,
    loading,
    error,
    currentPage,
    itemsPerPage,
    stats,
    questionTypes,

    // Computed
    filteredSurveys,
    paginatedSurveys,

    // Actions
    refreshSurveys,
    fetchSurveys,
    fetchSurveyById,
    fetchStats,
    fetchQuestionTypes,
    searchSurveys,
    setPage,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    getSurveyById,
    publishSurvey,
    unpublishSurvey,
    draftSurvey,
    closeSurvey,
    addQuestion,
    editQuestion,
    deleteQuestionFromSurvey,
    setTargets,
    getSurveyResponses
  }
})