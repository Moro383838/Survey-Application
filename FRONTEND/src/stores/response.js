import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { responseService } from '@/api/index.js'

export const useResponseStore = defineStore('response', () => {
  // ==========================
  //  State (حالة التطبيق)
  // ==========================
  const availableSurveys = ref([])
  const currentSurvey = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const submittedResponses = ref([])

  // ==========================
  //  Computed (القيم المحسوبة)
  // ==========================
  const hasAvailableSurveys = computed(() => availableSurveys.value.length > 0)

  // ==========================
  //  Actions (العمليات)
  // ==========================

  // جلب الاستبيانات المتاحة للمدرسة
  const fetchAvailableSurveys = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 جاري جلب الاستبيانات المتاحة...')
      const response = await responseService.getAvailableSurveys()

      if (response.data && Array.isArray(response.data)) {
        availableSurveys.value = response.data
        console.log(`✅ تم جلب ${availableSurveys.value.length} استبيان متاح`)
      } else {
        availableSurveys.value = []
      }
    } catch (err) {
      error.value = 'فشل في تحميل الاستبيانات المتاحة: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ:', err)
      availableSurveys.value = []
    } finally {
      loading.value = false
    }
  }

  // جلب تفاصيل استبيان محدد
  const fetchSurveyProfile = async (surveyId) => {
    loading.value = true
    error.value = null

    try {
      const response = await responseService.getSurveyProfile(surveyId)
      if (response.data) {
        currentSurvey.value = response.data
        return response.data
      }
      throw new Error('لم يتم العثور على الاستبيان')
    } catch (err) {
      error.value = 'فشل التحميل: ' + (err.response?.data?.message || err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // تسليم إجابة على استبيان
  const submitResponse = async (surveyId, responseData) => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 جاري تسليم الإجابة...', { surveyId, responseData })

      // تحضير البيانات حسب ما يتوقعه الباك اند
      const payload = {
        schoolId: responseData.schoolId,
        answers: responseData.answers || []
      }

      const response = await responseService.submitResponse(surveyId, payload)

      if (response.data) {
        // إضافة الإجابة المقدمة إلى القائمة
        submittedResponses.value.push({
          surveyId,
          ...response.data,
          submittedAt: new Date()
        })

        // إزالة الاستبيان من القائمة المتاحة
        availableSurveys.value = availableSurveys.value.filter(s => s.survey_id !== surveyId)

        console.log('✅ تم تسليم الإجابة بنجاح')
        return response.data
      }
    } catch (err) {
      error.value = 'خطأ في تسليم الإجابة: ' + (err.response?.data?.message || err.message)
      console.error('❌ خطأ في التسليم:', err)
      if (err.response?.data) {
        console.error('❌ تفاصيل خطأ السيرفر (Submit):', err.response.data)
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  // التحقق من أن الاستبيان تم الإجابة عليه
  const isSubmitted = (surveyId) => {
    return submittedResponses.value.some(r => r.surveyId === surveyId)
  }

  // ==========================
  //  Return
  // ==========================
  return {
    availableSurveys,
    currentSurvey,
    loading,
    error,
    submittedResponses,
    hasAvailableSurveys,

    fetchAvailableSurveys,
    fetchSurveyProfile,
    submitResponse,
    isSubmitted
  }
})

