import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analyticsService } from '@/api/index.js'

export const useAnalyticsStore = defineStore('analytics', () => {
  // ==========================
  //  State (حالة التطبيق)
  // ==========================
  const globalStats = ref(null)
  const surveySummary = ref({})
  const surveyTracking = ref({})
  const surveyAnalysis = ref({})
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  //  Computed (القيم المحسوبة)
  // ==========================
  const hasGlobalStats = computed(() => globalStats.value !== null)

  // ==========================
  //  Actions (العمليات)
  // ==========================

  // جلب الإحصائيات العامة للنظام
  const fetchGlobalAnalytics = async () => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🔄 جاري جلب الإحصائيات العامة...')
      
      // Use the dedicated global analytics endpoint
      const response = await analyticsService.getGlobalAnalytics()
      
      if (response.data) {
        // The API returns the exact structure we need
        const apiData = response.data;
        
        const globalData = {
          total_surveys: apiData.cards?.total_surveys || 0,
          total_responses: apiData.cards?.total_responses || 0,
          total_schools: apiData.cards?.total_schools || 0,
          total_users: apiData.cards?.total_users || 0,
          charts: apiData.charts || {},
          recent_activity: apiData.recent_activity || [],
          surveys_by_type: apiData.charts?.surveys_by_type || {}
        }
        
        globalStats.value = globalData
        console.log('✅ تم جلب الإحصائيات العامة بنجاح', globalData)
      } else {
        throw new Error('No data received from global analytics endpoint')
      }
    } catch (err) {
      console.warn('⚠️ فشل في استخدام نقطة النهاية العامة، العودة إلى الطريقة القديمة...', err)
      
      // Fallback to old method
      try {
        // Fetch data from existing services
        const [userStats, schoolStats, surveysData] = await Promise.allSettled([
          import('@/api/index.js').then(module => module.userService.getStats()),
          import('@/api/index.js').then(module => module.schoolService.getStats()),
          import('@/api/index.js').then(module => module.surveyService.getAll())
        ])
        
        const globalData = {
          total_surveys: surveysData.status === 'fulfilled' ? surveysData.value.data.length : 0,
          total_responses: 0, // We don't have a direct endpoint for total responses
          total_schools: schoolStats.status === 'fulfilled' ? (schoolStats.value.data.total_schools || schoolStats.value.data.length || 0) : 0,
          total_users: userStats.status === 'fulfilled' ? (userStats.value.data.total_users || userStats.value.data.length || 0) : 0,
          // Add top surveys if available
          top_surveys: surveysData.status === 'fulfilled' ? surveysData.value.data.slice(0, 5) : []
        }
        
        // Calculate total responses from surveys if possible
        if (surveysData.status === 'fulfilled') {
          const surveyIds = surveysData.value.data.map(s => s.id)
          let totalResponses = 0
          
          // Try to get responses for each survey
          for (const surveyId of surveyIds) {
            try {
              const response = await import('@/api/index.js').then(module => 
                module.surveyService.getSurveyStats(surveyId)
              )
              totalResponses += response.data.total_responses || 0
            } catch (e) {
              // Continue if we can't get specific survey stats
            }
          }
          globalData.total_responses = totalResponses
        }
        
        globalStats.value = globalData
        console.log('✅ تم جلب الإحصائيات العامة بالطريقة الاحتياطية', globalData)
      } catch (fallbackErr) {
        error.value = 'فشل في تحميل الإحصائيات: ' + (fallbackErr.response?.data?.message || fallbackErr.message)
        console.error('❌ خطأ في الطريقة الاحتياطية:', fallbackErr)
        // Set default values if there's an error
        globalStats.value = {
          total_surveys: 0,
          total_responses: 0,
          total_schools: 0,
          total_users: 0,
          top_surveys: []
        }
      }
    } finally {
      loading.value = false
    }
  }

  // جلب ملخص استبيان محدد
  const fetchSurveySummary = async (surveyId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await analyticsService.getSurveySummary(surveyId)
      if (response.data) {
        surveySummary.value[surveyId] = response.data
        return response.data
      }
    } catch (err) {
      error.value = 'فشل في تحميل الملخص: ' + (err.response?.data?.message || err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // جلب تتبع استبيان محدد
  const fetchSurveyTracking = async (surveyId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await analyticsService.getSurveyTracking(surveyId)
      if (response.data) {
        surveyTracking.value[surveyId] = response.data
        return response.data
      }
    } catch (err) {
      error.value = 'فشل في تحميل التتبع: ' + (err.response?.data?.message || err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // جلب تحليل تفصيلي لاستبيان محدد
  const fetchSurveyAnalysis = async (surveyId) => {
    loading.value = true
    error.value = null
    
    try {
      console.log(`🔄 جاري جلب تحليل الاستبيان ${surveyId}...`)
      const response = await analyticsService.getSurveyAnalysis(surveyId)
      
      if (response.data) {
        surveyAnalysis.value[surveyId] = response.data
        console.log('✅ تم جلب التحليل بنجاح')
        return response.data
      }
    } catch (err) {
      error.value = 'فشل في تحميل التحليل: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // جلب جميع البيانات لاستبيان محدد
  const fetchSurveyAnalytics = async (surveyId) => {
    try {
      await Promise.all([
        fetchSurveySummary(surveyId),
        fetchSurveyTracking(surveyId),
        fetchSurveyAnalysis(surveyId)
      ])
    } catch (err) {
      console.error('❌ خطأ في جلب تحليلات الاستبيان:', err)
      throw err
    }
  }

  // جلب تحليل المدارس
  const fetchSchoolAnalytics = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await import('@/api/index.js').then(module => module.schoolService.getStats())
      
      if (response.data) {
        // Transform school statistics for analytics - NEW API STRUCTURE
        const apiData = response.data;
        
        const schoolAnalytics = {
          // Cards data mapping
          total_schools: apiData.cards?.total_schools || 0,
          total_directorates: apiData.cards?.total_directorates || 0,
          total_complexes: apiData.cards?.total_complexes || 0,
          empty_schools_count: apiData.cards?.empty_schools_count || 0,
          avg_schools_per_complex: apiData.cards?.avg_schools_per_complex || 0,
          
          // Charts data mapping
          directorates_distribution: apiData.charts?.directorates_distribution || {},
          complexes_distribution: apiData.charts?.complexes_distribution || [],
          
          // Metadata
          generated_at: apiData.generated_at || new Date().toISOString(),
          
          // Legacy mappings for backward compatibility
          active_schools: apiData.cards?.total_schools || 0,
          clusters_count: apiData.cards?.total_complexes || 0,
          directorates_count: apiData.cards?.total_directorates || 0,
          schools_by_status: {
            active: apiData.cards?.total_schools || 0,
            inactive: apiData.cards?.empty_schools_count || 0
          }
        }
        
        return schoolAnalytics
      }
    } catch (err) {
      error.value = 'فشل في تحميل تحليلات المدارس: ' + (err.response?.data?.message || err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // جلب تحليل المستخدمين
  const fetchUserAnalytics = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await import('@/api/index.js').then(module => module.userService.getStats())
      
      if (response.data) {
        // Extract data - backend returns data directly, not nested
        const userData = response.data.fn_users_stats || response.data;
        
        // Handle roles_distribution - normalize role names
        const rolesDist = userData.roles_distribution || {};
        
        // Transform user statistics for analytics
        const userAnalytics = {
          total_users: userData.total_users || 0,
          roles_distribution: rolesDist,
          users_without_schools: userData.users_without_schools || 0,
          generated_at: userData.generated_at,
          // Extract counts from roles_distribution
          admins: rolesDist.ADMIN || 0,
          school_users: rolesDist.SCHOOL_USER || 0,
          analyst_users: rolesDist.ANALAYZER_USER || rolesDist.ANALYZER_USER || rolesDist.ANALYST || 0,
          users_by_role: rolesDist,
          schools_count: userData.schools_count || 0
        }
        
        console.log('✅ تم جلب تحليلات المستخدمين:', userAnalytics)
        return userAnalytics
      }
    } catch (err) {
      error.value = 'فشل في تحميل تحليلات المستخدمين: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ في جلب تحليلات المستخدمين:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // جلب جميع تحليلات المدارس
  const fetchAllSchoolAnalytics = async () => {
    try {
      const schoolData = await fetchSchoolAnalytics()
      return schoolData
    } catch (err) {
      console.error('❌ خطأ في جلب تحليلات المدارس:', err)
      throw err
    }
  }

  // جلب جميع تحليلات المستخدمين
  const fetchAllUserAnalytics = async () => {
    try {
      const userData = await fetchUserAnalytics()
      return userData
    } catch (err) {
      console.error('❌ خطأ في جلب تحليلات المستخدمين:', err)
      throw err
    }
  }

  // ==========================
  //  Return
  // ==========================
  return {
    globalStats,
    surveySummary,
    surveyTracking,
    surveyAnalysis,
    loading,
    error,
    hasGlobalStats,
    
    fetchGlobalAnalytics,
    fetchSurveySummary,
    fetchSurveyTracking,
    fetchSurveyAnalysis,
    fetchSurveyAnalytics,
    fetchSchoolAnalytics,
    fetchUserAnalytics,
    fetchAllSchoolAnalytics,
    fetchAllUserAnalytics
  }
})

