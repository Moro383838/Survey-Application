<template>
  <div class="survey-analysis-component">
    <button class="action-btn animate-scale-hover" @click="openModal">
      <span class="btn-icon">📊</span>
      <span>عرض التحليل الشامل</span>
    </button>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <div class="header-content-wrapper">
            <img src="/logo.png" alt="شعار الوزارة" class="ministry-logo" />
            <div class="header-titles">
              <h3>التحليل الشامل للاستبيان</h3>
              <span class="school-subtitle">{{ surveyTitle }}</span>
            </div>
          </div>
          <button class="close-modal" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body custom-scrollbar">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحليل البيانات...</p>
          </div>
 
          <div v-else-if="questions && questions.length > 0" class="analysis-content">
            
            <div v-for="(q, index) in questions" :key="q.question_id" class="question-analysis-card">
              <div class="qa-header">
                <span class="q-number">س{{ index + 1 }}</span>
                <h4 class="q-text">{{ q.text }}</h4>
                <span class="type-badge">{{ getQuestionTypeLabel(q.type) }}</span>
              </div>

              <div class="qa-body">
                
                <div v-if="q.type === 'NUMBER'" class="stats-grid">
                  <div class="stat-box average">
                    <span class="stat-label">المتوسط</span>
                    <span class="stat-value">{{ formatNumber(q.stats?.average) }}</span>
                  </div>
                  <div class="stat-box min">
                    <span class="stat-label">أقل قيمة</span>
                    <span class="stat-value">{{ formatNumber(q.stats?.min) }}</span>
                  </div>
                  <div class="stat-box max">
                    <span class="stat-label">أعلى قيمة</span>
                    <span class="stat-value">{{ formatNumber(q.stats?.max) }}</span>
                  </div>
                </div>

                <div v-else-if="isChoiceType(q.type)" class="choices-bars">
                  <div v-if="q.stats && Object.keys(q.stats).length > 0">
                    <div v-for="(count, option) in q.stats" :key="option" class="choice-row">
                      <div class="choice-info">
                        <span class="choice-label">{{ cleanText(option) }}</span>
                        <span class="choice-count">{{ count }} إجابة</span>
                      </div>
                      <div class="progress-bg">
                        <div class="progress-fill" :style="{ width: calculatePercentage(count, q.stats) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="no-data-text">لا توجد إجابات مسجلة</div>
                </div>

                <div v-else class="text-responses">
                  <div v-if="Array.isArray(q.stats) && q.stats.length > 0" class="text-list">
                    <div v-for="(answer, i) in q.stats" :key="i" class="text-bubble">
                      {{ cleanText(answer) }}
                    </div>
                  </div>
                  <div v-else class="no-data-text">لا توجد إجابات نصية</div>
                </div>

              </div>
            </div>

          </div>

          <div v-else class="empty-state-modal">
            <div class="empty-icon-modal">📭</div>
            <p>لا توجد بيانات لتحليلها في هذا الاستبيان</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'

const props = defineProps({
  surveyId: {
    type: [Number, String],
    required: true
  },
  surveyTitle: {
    type: String,
    default: 'الاستبيان'
  }
})

const analyticsStore = useAnalyticsStore()
const showModal = ref(false)
const loading = ref(false)
const questions = ref([])

const openModal = async () => {
  showModal.value = true
  await loadAnalysis()
}

const closeModal = () => {
  showModal.value = false
  questions.value = [] // Reset on close
}

const loadAnalysis = async () => {
  if (!props.surveyId) return
  loading.value = true
  try {
    const resp = await analyticsStore.fetchSurveyQuestionsAnalysis(props.surveyId)

    // Normalize Data Structure
    let normalized = []
    
    // Handle different possible API responses
    if (Array.isArray(resp)) {
      normalized = resp
    } else if (resp && Array.isArray(resp.data)) {
      normalized = resp.data
    } else if (resp && typeof resp === 'object') {
       // Check for 'questions' key
       if (Array.isArray(resp.questions)) {
          normalized = resp.questions
       } else if (resp.data && Array.isArray(resp.data.questions)) {
          normalized = resp.data.questions
       } else {
         // Fallback: If it's an object of questions { q1: {}, q2: {} }
         const values = Object.values(resp)
         if (values.length > 0 && values[0]?.question_id) {
           normalized = values
         }
       }
    }

    questions.value = normalized || []
  } catch (error) {
    console.error('Failed loading survey analysis:', error)
    questions.value = []
  } finally {
    loading.value = false
  }
}

// Helpers
const getQuestionTypeLabel = (type) => {
  const types = {
    'LONG_TEXT': 'نص طويل',
    'SHORT_TEXT': 'نص قصير',
    'SINGLE_CHOICE': 'خيار واحد',
    'MULTIPLE_CHOICE': 'خيار متعدد',
    'NUMBER': 'رقمي',
    'DATE': 'تاريخ',
    'TIME': 'وقت',
    'DATE_RANGE': 'نطاق تاريخ',
    'DATETIME_RANGE': 'نطاق تاريخ ووقت'
  }
  return types[type] || type
}

const isChoiceType = (type) => {
  return ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RATING'].includes(type)
}

const formatNumber = (val) => {
  return val !== null && val !== undefined && !isNaN(val) ? Number(val).toFixed(2).replace(/\.00$/, '') : '-'
}

const cleanText = (text) => {
  if (typeof text !== 'string') return text
  // Remove surrounding quotes if they exist (e.g. "\"value\"")
  return text.replace(/^"|"$/g, '').replace(/\\"/g, '"')
}

const calculatePercentage = (count, allStats) => {
  if (!allStats) return 0
  const total = Object.values(allStats).reduce((a, b) => a + (Number(b) || 0), 0)
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}
</script>

<style scoped>
/* استيراد التنسيقات المشتركة */
@import '../../assets/analytics.css';

/* تخصيصات إضافية لهذا المكون */
@import '../../assets/SurveyAnalysisModal.css';
</style>