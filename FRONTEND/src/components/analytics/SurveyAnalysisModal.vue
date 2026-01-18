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
}

const loadAnalysis = async () => {
  if (!props.surveyId) return
  loading.value = true
  try {
    // استدعاء الدالة التي أضفناها للستور
    const resp = await analyticsStore.fetchSurveyQuestionsAnalysis(props.surveyId)

    // Normalize different API shapes:
    // - Array of questions
    // - { questions: [...] }
    // - { data: { questions: [...] } }
    // - { data: [...] }
    let normalized = []

    if (!resp) normalized = []
    else if (Array.isArray(resp)) normalized = resp
    else if (Array.isArray(resp.data)) normalized = resp.data
    else if (Array.isArray(resp.questions)) normalized = resp.questions
    else if (Array.isArray(resp.data?.questions)) normalized = resp.data.questions
    else if (typeof resp === 'object') {
      // If object with keys as question ids map to stats, convert to array
      const possibleArray = Object.values(resp)
      if (possibleArray.length > 0 && Array.isArray(possibleArray[0])) {
        // e.g., { q1: [...], q2: [...] } -> flatten to objects
        normalized = possibleArray.flat()
      } else {
        // Fallback: try to extract questions-like objects
        normalized = []
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

// دوال مساعدة
const getQuestionTypeLabel = (type) => {
  const types = {
    'LONG_TEXT': 'نص طويل',
    'SHORT_TEXT': 'نص قصير',
    'SINGLE_CHOICE': 'خيار واحد',
    'MULTIPLE_CHOICE': 'خيار متعدد',
    'NUMBER': 'رقمي',
    'DATE': 'تاريخ'
  }
  return types[type] || type
}

const isChoiceType = (type) => {
  return ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RATING'].includes(type)
}

const formatNumber = (val) => {
  return val !== null && val !== undefined ? val : '-'
}

const cleanText = (text) => {
  if (typeof text !== 'string') return text
  return text.replace(/^"|"$/g, '') // إزالة علامات التنصيص إذا وجدت
}

const calculatePercentage = (count, allStats) => {
  const total = Object.values(allStats).reduce((a, b) => a + b, 0)
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}
</script>

<style scoped>
/* استيراد التنسيقات المشتركة */
@import '../../assets/analytics.css';

/* تخصيصات إضافية لهذا المكون */
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #002623, #0a4f45);
  color: #b9a779;
  border: 1px solid #b9a779;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px; /* مسافة قبل الجدول */
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.2);
  background: #002623;
}

.btn-icon {
  font-size: 18px;
}

/* تنسيق بطاقات الأسئلة */
.question-analysis-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}

.qa-header {
  background: #f8fafc;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.qa-body {
  padding: 16px;
}

/* إحصائيات الأرقام */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-box {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-box.average { border-color: #b9a779; background: rgba(185, 167, 121, 0.05); }
.stat-box.min { border-color: #cbd5e1; }
.stat-box.max { border-color: #002623; color: white; background: #002623; }
.stat-box.max .stat-label { color: #b9a779; }
.stat-box.max .stat-value { color: white; }

.stat-label { font-size: 12px; color: #64748b; display: block; margin-bottom: 4px; }
.stat-value { font-size: 18px; font-weight: 700; color: #1e293b; }

/* خيارات */
.choice-row { margin-bottom: 12px; }
.choice-info { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
.progress-bg { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: #002623; border-radius: 4px; transition: width 0.5s; }

/* نصوص */
.text-list { display: flex; flex-direction: column; gap: 8px; }
.text-bubble {
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 0 12px 12px 12px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  color: #334155;
  border-right: 3px solid #b9a779;
}

.no-data-text { color: #94a3b8; font-style: italic; font-size: 13px; text-align: center; padding: 10px; }
</style>