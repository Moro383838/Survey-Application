import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analyticsService, schoolService, userService } from '@/api/index.js'

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

      const response = await analyticsService.getGlobalAnalytics()

      if (response.data) {
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
      }
    } catch (err) {
      error.value = 'فشل في تحميل الإحصائيات: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ في جلب الإحصائيات العامة:', err)
      globalStats.value = {
        total_surveys: 0,
        total_responses: 0,
        total_schools: 0,
        total_users: 0,
        top_surveys: []
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
      const response = await schoolService.getStats()

      if (response.data) {
        // Handle different API response structures
        let apiData = response.data;

        // Case 1: Wrapped in array with function name key (Postgres function result)
        if (Array.isArray(apiData) && apiData.length > 0 && apiData[0]?.fn_get_school_statistics) {
          apiData = apiData[0].fn_get_school_statistics;
        }
        // Case 2: Wrapped in 'data' property
        else if (apiData.data) {
          apiData = apiData.data;
        }
        // Case 3: Direct object (already clean)
        else if (apiData.fn_get_school_statistics) {
          apiData = apiData.fn_get_school_statistics;
        }

        // Extract cards and charts data (handle both formats)
        const cards = apiData.cards || apiData;
        const charts = apiData.charts || apiData;

        // Distribution data
        const dirDist = charts.directorates_distribution || apiData.directorates_distribution || {};
        const compDist = charts.complexes_distribution || apiData.complexes_distribution || [];

        // Derived counts if missing
        const totalDir = cards.total_directorates ?? Object.keys(dirDist).length;
        const totalComp = cards.total_complexes ?? (Array.isArray(compDist) ? compDist.length : (apiData.clusters_count || 0));
        const totalSchools = cards.total_schools ?? (apiData.active_schools || 0);

        const schoolAnalytics = {
          // Cards data mapping
          total_schools: totalSchools,
          total_directorates: totalDir,
          total_complexes: totalComp,
          empty_schools_count: cards.empty_schools_count ?? apiData.schools_by_status?.inactive ?? 0,
          avg_schools_per_complex: cards.avg_schools_per_complex ?? (totalComp > 0 ? (totalSchools / totalComp) : 0),

          // Charts data mapping
          directorates_distribution: dirDist,
          complexes_distribution: compDist,

          // Metadata
          generated_at: apiData.generated_at || new Date().toISOString(),

          // Legacy mappings
          active_schools: totalSchools,
          clusters_count: totalComp,
          directorates_count: totalDir
        }

        return schoolAnalytics
      }
    } catch (err) {
      error.value = 'فشل في تحميل تحليلات المدارس: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ في جلب تحليلات المدارس:', err)
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
      const response = await userService.getStats()

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
  // أضف هذا داخل actions في ملف src/stores/analytics.js

  // جلب تحليل أسئلة استبيان محدد
  const fetchSurveyQuestionsAnalysis = async (surveyId) => {
    loading.value = true
    error.value = null
    try {
      // Reuse the analyticsService exported helper
      const response = await analyticsService.getSurveyAnalysis(surveyId)

      // Normalize response shapes: return data or entire response
      if (response && response.data) return response.data
      return response
    } catch (err) {
      console.error('❌ خطأ في جلب تحليل الاستبيان:', err)
      throw err
    } finally {
      loading.value = false
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
    fetchAllUserAnalytics,
    fetchSurveyQuestionsAnalysis
  }
})

