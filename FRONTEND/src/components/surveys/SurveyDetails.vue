<template>
  <div class="modal-overlay" @click.self="router.back()">
    <div class="modal">
      <div class="modal-header">
        <div class="header-content-wrapper">
          <img src="/logo.png" alt="شعار الوزارة" class="ministry-logo" />
          <h3>تفاصيل الاستبيان</h3>
        </div>
        <button class="close-modal" @click="router.back()">&times;</button>
      </div>

      <div class="modal-body custom-scrollbar">
        
        <div v-if="loading" class="state-container">
          <div class="loading-spinner"></div>
          <p>جاري جلب البيانات...</p>
        </div>

        <div v-else-if="error" class="error-message">
          <span class="error-icon">❌</span>
          <span>{{ error }}</span>
          <button class="retry-link" @click="loadSurveyDetails">إعادة المحاولة</button>
        </div>

        <div v-else-if="survey && survey.id" class="content-wrapper">
          
          <div class="profile-header">
            <div class="survey-icon-large">📋</div>
            <h3 class="survey-title">{{ survey.title }}</h3>
            <span class="detail-badge" :class="getStatusClass(survey.status_id)">
              {{ survey.status_label }}
            </span>
            <span class="detail-badge survey-type-badge">
              {{ survey.is_periodic ? 'استبيان دوري' : 'استبيان لمرة واحدة' }}
            </span>
          </div>

          <div class="survey-details-box">
            <div class="detail-item">
              <span class="detail-label">الوصف:</span>
              <span class="detail-value">{{ survey.description || 'لا يوجد وصف' }}</span>
            </div>
            

            <div class="detail-item">
              <span class="detail-label">تاريخ البدء:</span>
              <span class="detail-value">{{ formatDate(survey.start_date || survey.dates?.start) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">تاريخ الانتهاء:</span>
              <span class="detail-value">{{ formatDate(survey.end_date || survey.dates?.end) }}</span>
            </div>

            <div v-if="survey.frequency" class="detail-item">
              <span class="detail-label">التكرار:</span>
              <span class="detail-value">{{ survey.frequency }}</span>
            </div>
          </div>

          <div v-if="survey.questions && survey.questions.length > 0" class="questions-section">
            <div class="section-title">
              <h4>❓ الأسئلة ({{ survey.questions.length }})</h4>
            </div>
            
            <div class="questions-list">
              <div 
                v-for="(question, index) in survey.questions"
                :key="question.id || index" 
                class="question-item"
              >
                <div class="question-info">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <span class="question-text">
                    {{ question.text }}
                    <span v-if="question.is_required || question.required" class="required-mark">*</span>
                  </span>
                </div>
                <div class="question-type">
                  {{ getQuestionTypeText(question.type_id) }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="hasTargets" class="targets-section">
            <div class="section-title">
              <h4>🎯 الأهداف المحددة</h4>
            </div>
            
            <div class="targets-summary">
              <div v-if="targetCounts.directorates > 0" class="target-category">
                <span class="category-label">المديريات:</span>
                <span class="category-count">{{ targetCounts.directorates }}</span>
              </div>
              <div v-if="targetCounts.complexes > 0" class="target-category">
                <span class="category-label">المجمعات:</span>
                <span class="category-count">{{ targetCounts.complexes }}</span>
              </div>
              <div v-if="targetCounts.schools > 0" class="target-category">
                <span class="category-label">المدارس:</span>
                <span class="category-count">{{ targetCounts.schools }}</span>
              </div>
              <div class="target-total">
                <span class="total-label">المجموع الكلي:</span>
                <span class="total-count">{{ targetCounts.total }}</span>
              </div>
            </div>

            <div v-if="survey.targets && survey.targets.length > 0" class="targets-list">
              <div v-for="target in survey.targets" :key="target.id" class="target-item">
                <div class="target-info">
                  <span class="target-name">{{ target.name || target.school_name }}</span>
                  <span class="target-directorate" v-if="target.directorate">{{ target.directorate }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="router.back()">
          إغلاق
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSurveyStore } from '@/stores/surveys'

const props = defineProps({
  survey: {
    type: Object,
    default: null
  },
  id: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const store = useSurveyStore()

const survey = ref(null)
const loading = ref(true)
const error = ref(null)

const loadSurveyDetails = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Determine survey ID from either props.survey or props.id
    const surveyId = props.survey?.id || props.id
    
    if (!surveyId) {
      throw new Error('معرف الاستبيان غير متوفر')
    }
    
    const data = await store.fetchSurveyById(Number(surveyId))
    
    if (!data) {
      throw new Error('لم يتم العثور على الاستبيان')
    }
    
    survey.value = data
    
  } catch (err) {
    console.error('❌ خطأ في تحميل تفاصيل الاستبيان:', err)
    error.value = err.message || 'فشل في تحميل البيانات'
  } finally {
    loading.value = false
  }
}

onMounted(loadSurveyDetails)

// --- دوال مساعدة ---
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ar-SA')
}

// --- خصائص محسوبة للأهداف ---
const hasTargets = computed(() => {
  if (!survey.value?.targets) return false
  
  // Check for different target structures
  const targets = survey.value.targets
  
  // Direct arrays
  if (Array.isArray(targets) && targets.length > 0) return true
  
  // Nested structure with IDs
  if (targets.directorate_ids && targets.directorate_ids.length > 0) return true
  if (targets.complex_ids && targets.complex_ids.length > 0) return true
  if (targets.school_ids && targets.school_ids.length > 0) return true
  
  return false
})

const targetCounts = computed(() => {
  const targets = survey.value?.targets || {}
  
  // Handle different target data structures
  let directorates = 0
  let complexes = 0
  let schools = 0
  
  if (Array.isArray(targets)) {
    // Flat array of targets
    schools = targets.length
  } else {
    // Nested structure
    directorates = targets.directorate_ids?.length || 0
    complexes = targets.complex_ids?.length || 0
    schools = targets.school_ids?.length || 0
  }
  
  return {
    directorates,
    complexes,
    schools,
    total: directorates + complexes + schools
  }
})

const getStatusClass = (statusId) => {
  const classes = {
    1: 'draft',
    2: 'active',
    3: 'closed'
  }
  return classes[statusId] || ''
}

const getQuestionTypeText = (typeId) => {
  const types = {
    1: 'نص قصير',
    2: 'نص طويل',
    3: 'خيار واحد',
    4: 'خيارات متعددة',
    5: 'رقم',
    6: 'تاريخ',
    7: 'وقت',
    10: 'تقييم'
  }
  return types[typeId] || 'نوع غير معروف'
}
</script>

<style scoped>
/* --- هيكل المودال الأساسي (مطابق لقالب الحذف) --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px; /* نفس عرض قالب الحذف */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* لضمان ظهور التمرير إذا طالت القائمة */
}

/* --- الهيدر --- */
.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #003d36, #001a18);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #b9a779;
  flex-shrink: 0;
}

.header-content-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ministry-logo {
  height: 40px;
  width: auto;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #b9a779;
}

.close-modal {
  background: rgba(185, 167, 121, 0.1);
  border: none;
  color: #b9a779;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  border-radius: 8px;
}

.close-modal:hover {
  transform: rotate(90deg);
  background: rgba(185, 167, 121, 0.2);
  color: white;
}

/* --- جسم المودال --- */
.modal-body {
  padding: 32px;
  overflow-y: auto;
}

/* البروفايل العلوي */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.survey-icon-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #003d36, #0a4f45);
  color: #b9a779;
  font-size: 32px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  border: 2px solid #b9a779;
}

.survey-title {
  color: #003d36;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-align: center;
}

/* صندوق التفاصيل الرمادي */
.survey-details-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
}

.detail-value {
  color: #374151;
  font-weight: 600;
  font-size: 14px;
}

/* Badges */
.detail-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin: 4px;
}

.detail-badge.draft { background: #dbeafe; color: #1e40af; }
.detail-badge.active { background: #d1fae5; color: #059669; }
.detail-badge.closed { background: #fee2e2; color: #dc2626; }
.detail-badge.survey-type-badge { background: #e6f0ee; color: #054239; }

/* قسم الأسئلة */
.questions-section {
  margin-bottom: 24px;
}

.section-title h4 {
  font-size: 16px;
  color: #003d36;
  margin: 0 0 12px 0;
  border-bottom: 1px solid #b9a779;
  display: inline-block;
  padding-bottom: 4px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s;
}

.question-item:hover {
  border-color: #b9a779;
  box-shadow: 0 2px 4px rgba(0, 38, 35, 0.1);
}

.question-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.question-number {
  font-weight: 700;
  color: #003d36;
  min-width: 20px;
}

.question-text {
  color: #374151;
  font-weight: 500;
  flex: 1;
}

.required-mark {
  color: #ef4444;
  font-weight: 700;
}

.question-type {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
  align-self: flex-start;
}

/* قسم الأهداف */
.targets-section {
  margin-bottom: 24px;
}

.targets-summary {
  background: #f0f9ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #bae6fd;
}

.target-category, .target-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0f2fe;
}

.target-category:last-child {
  border-bottom: none;
}

.target-total {
  font-weight: 700;
  background: #e0f2fe;
  margin: 8px -20px -20px -20px;
  padding: 12px 20px;
  border-radius: 0 0 12px 12px;
  border-bottom: none;
}

.category-label, .total-label {
  color: #0c4a6e;
  font-weight: 500;
}

.category-count, .total-count {
  color: #0284c7;
  font-weight: 700;
  background: #bae6fd;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.total-count {
  background: #0284c7;
  color: white;
}

.targets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.target-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s;
}

.target-item:hover {
  border-color: #b9a779;
}

.target-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.target-name {
  color: #374151;
  font-weight: 600;
  font-size: 14px;
}

.target-directorate {
  color: #9ca3af;
  font-size: 12px;
}

/* --- التذييل --- */
.modal-footer {
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* حالات التحميل والخطأ */
.state-container {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 30px; height: 30px;
  border: 3px solid #e2e8f0;
  border-top-color: #003d36;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
}

.retry-link {
  background: none; border: none;
  text-decoration: underline;
  color: #dc2626;
  cursor: pointer;
  font-weight: 600;
  margin-right: auto;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>