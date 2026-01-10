<template>
  <div class="available-surveys-page">
    <!-- رأس الصفحة -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">📝</div>
        <div>
          <h1>الاستبيانات المتاحة</h1>
          <p class="header-subtitle">
            الاستبيانات المطلوب منك تعبئتها 
            <span v-if="selectedSchoolName" class="school-context">
              (لمدرسة: {{ selectedSchoolName }})
            </span>
          </p>
        </div>
      </div>
      <button class="btn-refresh" @click="refreshSurveys" :disabled="loading">
        <span class="btn-icon">🔄</span>
        تحديث
      </button>
    </div>

    <!-- حالة التحميل -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل الاستبيانات...</p>
    </div>

    <!-- رسالة خطأ -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="refreshSurveys">إعادة المحاولة</button>
    </div>

    <!-- لا توجد استبيانات -->
    <div v-else-if="!hasAvailableSurveys" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>لا توجد استبيانات متاحة</h3>
      <p>جميع الاستبيانات المطلوبة تم تعبئتها</p>
    </div>

    <!-- قائمة الاستبيانات -->
    <div v-else class="surveys-grid">
      <div 
        v-for="survey in availableSurveys" 
        :key="survey.survey_id"
        class="survey-card"
        @click="viewSurvey(survey.survey_id)"
      >
        <div class="card-header">
          <div class="survey-title">{{ survey.title }}</div>
          <div class="survey-status status-pending">⏳ قيد الانتظار</div>
        </div>
        <div class="card-body">
          <p class="survey-description">{{ survey.description || survey.desc || 'لا يوجد وصف' }}</p>
          <div class="survey-meta">
            <span class="meta-item">
              <span class="meta-icon">🏫</span>
              مدرستك: {{ survey.school_name || getSchoolName(survey.my_school_id) || 'غير محدد' }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">📅</span>
              {{ formatDate(survey.created_at) }}
            </span>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-fill" @click.stop="fillSurvey(survey.survey_id)">
            <span class="btn-icon">✏️</span>
            تعبئة الاستبيان
          </button>
        </div>
      </div>
    </div>

    <!-- مودال تعبئة الاستبيان -->
    <div v-if="selectedSurvey" class="modal-overlay" @click.self="closeModal">
      <div class="survey-fill-modal">
        <div class="modal-header">
          <h2>{{ currentSurvey?.title }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body" v-if="currentSurvey">
          <div class="survey-description-section">
            <p>{{ currentSurvey.description || currentSurvey.desc || 'لا يوجد وصف للاستبيان' }}</p>
          </div>
          <div class="questions-section">
            <div 
              v-for="(question, index) in currentSurvey.questions" 
              :key="question.id || index"
              class="question-item"
            >
              <label class="question-label">
                {{ question.text }}
                <span v-if="question.required" class="required">*</span>
              </label>

              <!-- 1 & 2: Text Inputs -->
              <div v-if="[1, 2].includes(question.type_id)" class="input-wrapper">
                <textarea 
                  v-if="question.type_id === 2"
                  class="form-input textarea"
                  v-model="answers[question.id]"
                  placeholder="اكتب إجابتك هنا..."
                  rows="4"
                ></textarea>
                <input 
                  v-else
                  type="text"
                  class="form-input"
                  v-model="answers[question.id]"
                  placeholder="اكتب إجابتك هنا..."
                />
              </div>

              <!-- 3: Single Choice -->
              <div v-else-if="question.type_id == 3" class="choices-wrapper">
                <div 
                  v-for="(option, optIndex) in question.options" 
                  :key="optIndex"
                  class="choice-item"
                >
                  <label class="choice-label">
                    <input 
                      type="radio" 
                      :name="'q_' + question.id"
                      :value="typeof option === 'object' ? (option.text || option.label || option.value || option.content) : option"
                      v-model="answers[question.id]"
                    />
                    <span class="choice-text">{{ typeof option === 'object' ? (option.text || option.label || option.value || option.content) : option }}</span>
                  </label>
                </div>
              </div>

              <!-- 4: Multiple Choice -->
              <div v-else-if="question.type_id == 4" class="choices-wrapper">
                <div 
                  v-for="(option, optIndex) in question.options" 
                  :key="optIndex"
                  class="choice-item"
                >
                  <label class="choice-label">
                    <input 
                      type="checkbox" 
                      :value="typeof option === 'object' ? (option.text || option.label || option.value || option.content) : option"
                      v-model="answers[question.id]"
                    />
                    <span class="choice-text">{{ typeof option === 'object' ? (option.text || option.label || option.value || option.content) : option }}</span>
                  </label>
                </div>
              </div>

              <!-- 5: Number -->
              <div v-else-if="question.type_id === 5" class="input-wrapper">
                <input 
                  type="number"
                  class="form-input"
                  v-model="answers[question.id]"
                  placeholder="أدخل رقماً"
                />
              </div>

              <!-- 6: Date -->
              <div v-else-if="question.type_id === 6" class="input-wrapper">
                <input 
                  type="date"
                  class="form-input"
                  v-model="answers[question.id]"
                />
              </div>

              <!-- 7: Time -->
              <div v-else-if="question.type_id === 7" class="input-wrapper">
                <input 
                  type="time"
                  class="form-input"
                  v-model="answers[question.id]"
                />
              </div>

              <!-- 8: Date Range -->
              <div v-else-if="question.type_id === 8" class="input-wrapper date-range-wrapper">
                <div class="date-range-inputs">
                  <div class="date-input-group">
                    <label>من:</label>
                    <input 
                      type="date"
                      class="form-input"
                      v-model="answers[question.id + '_start']"
                      :required="question.required"
                    />
                  </div>
                  <div class="date-input-group">
                    <label>إلى:</label>
                    <input 
                      type="date"
                      class="form-input"
                      v-model="answers[question.id + '_end']"
                      :required="question.required"
                    />
                  </div>
                </div>
                <div v-if="getDateRangeError(question.id)" class="error-message">
                  {{ getDateRangeError(question.id) }}
                </div>
              </div>

              <!-- 9: DateTime Range -->
              <div v-else-if="question.type_id === 9" class="input-wrapper datetime-range-wrapper">
                <div class="datetime-range-inputs">
                  <div class="datetime-input-group">
                    <label>من:</label>
                    <div class="datetime-fields">
                      <input 
                        type="date"
                        class="form-input date-field"
                        v-model="answers[question.id + '_start_date']"
                        :required="question.required"
                      />
                      <input 
                        type="time"
                        class="form-input time-field"
                        v-model="answers[question.id + '_start_time']"
                        :required="question.required"
                      />
                    </div>
                  </div>
                  <div class="datetime-input-group">
                    <label>إلى:</label>
                    <div class="datetime-fields">
                      <input 
                        type="date"
                        class="form-input date-field"
                        v-model="answers[question.id + '_end_date']"
                        :required="question.required"
                      />
                      <input 
                        type="time"
                        class="form-input time-field"
                        v-model="answers[question.id + '_end_time']"
                        :required="question.required"
                      />
                    </div>
                  </div>
                </div>
                <div v-if="getDateTimeRangeError(question.id)" class="error-message">
                  {{ getDateTimeRangeError(question.id) }}
                </div>
              </div>

              <!-- Default Fallback -->
              <div v-else class="input-wrapper">
                <input 
                  type="text"
                  class="form-input"
                  v-model="answers[question.id]"
                  placeholder="اكتب إجابتك هنا..."
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">إلغاء</button>
          <button 
            class="btn-submit" 
            @click="submitResponse"
            :disabled="loading || !isFormValid"
          >
            {{ loading ? 'جاري الإرسال...' : 'تسليم الإجابة' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResponseStore } from '@/stores/response.js'
import { useAuthStore } from '@/stores/auth.js'

const responseStore = useResponseStore()
const authStore = useAuthStore()

const selectedSurvey = ref(null)
const answers = ref({})

const availableSurveys = computed(() => {
  if (!authStore.selectedSchoolId) return responseStore.availableSurveys
  return responseStore.availableSurveys.filter(s => s.my_school_id === authStore.selectedSchoolId)
})

const selectedSchoolName = computed(() => {
  const school = authStore.userSchoolsList.find(s => s.id === authStore.selectedSchoolId)
  return school?.name || ''
})

const currentSurvey = computed(() => responseStore.currentSurvey)
const loading = computed(() => responseStore.loading)
const error = computed(() => responseStore.error)
const hasAvailableSurveys = computed(() => availableSurveys.value.length > 0)

// جلب الاستبيانات المتاحة
const refreshSurveys = async () => {
  await responseStore.fetchAvailableSurveys()
}

// عرض استبيان محدد
const viewSurvey = async (surveyId) => {
  selectedSurvey.value = surveyId
  try {
    await responseStore.fetchSurveyProfile(surveyId)
    // تهيئة answers
    answers.value = {}
    if (responseStore.currentSurvey?.questions) {
      responseStore.currentSurvey.questions.forEach(q => {
        if (q.type_id == 4) { // Multiple Choice input (Loose equality for string/number)
          answers.value[q.id] = []
        }
        // Initialize date range questions
        else if (q.type_id == 8) { // Date Range
          answers.value[q.id + '_start'] = ''
          answers.value[q.id + '_end'] = ''
        }
        // Initialize datetime range questions
        else if (q.type_id == 9) { // DateTime Range
          answers.value[q.id + '_start_date'] = ''
          answers.value[q.id + '_start_time'] = ''
          answers.value[q.id + '_end_date'] = ''
          answers.value[q.id + '_end_time'] = ''
        }
      })
    }
  } catch (err) {
    console.error('❌ خطأ في جلب الاستبيان:', err)
  }
}

// تعبئة الاستبيان
const fillSurvey = async (surveyId) => {
  await viewSurvey(surveyId)
}

// إغلاق المودال
const closeModal = () => {
  selectedSurvey.value = null
  answers.value = {}
}

// تحديث إجابة
const updateAnswer = (questionId, value) => {
  answers.value[questionId] = value
}

// معالجة تغيير Checkbox (اختيار متعدد)
const handleCheckboxChange = (questionId, value, event) => {
  if (!answers.value[questionId]) {
    answers.value[questionId] = []
  }
  
  // Ensure it's an array
  if (!Array.isArray(answers.value[questionId])) {
    answers.value[questionId] = []
  }

  if (event.target.checked) {
    answers.value[questionId].push(value)
  } else {
    answers.value[questionId] = answers.value[questionId].filter(item => item !== value)
  }
}

// Validation functions for date ranges
const getDateRangeError = (questionId) => {
  const startDate = answers.value[questionId + '_start']
  const endDate = answers.value[questionId + '_end']
  
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start > end) {
      return 'تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء'
    }
  }
  
  return ''
}

const getDateTimeRangeError = (questionId) => {
  const startDate = answers.value[questionId + '_start_date']
  const startTime = answers.value[questionId + '_start_time']
  const endDate = answers.value[questionId + '_end_date']
  const endTime = answers.value[questionId + '_end_time']
  
  if (startDate && startTime && endDate && endTime) {
    const startDateTime = new Date(`${startDate}T${startTime}`)
    const endDateTime = new Date(`${endDate}T${endTime}`)
    
    if (startDateTime > endDateTime) {
      return 'وقت البدء يجب أن يكون قبل وقت الانتهاء'
    }
  }
  
  return ''
}

// التحقق من صحة النموذج
const isFormValid = computed(() => {
  if (!currentSurvey.value || !currentSurvey.value.questions) return false
  
  const requiredQuestions = currentSurvey.value.questions.filter(q => q.required)
  return requiredQuestions.every(q => {
    // Handle date range questions (type 8)
    if (q.type_id === 8) {
      const startDate = answers.value[q.id + '_start']
      const endDate = answers.value[q.id + '_end']
      
      // If required, both dates must be provided
      if (q.required && (!startDate || !endDate)) return false
      
      // Validate date range logic
      if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        if (start > end) return false
      }
      
      return true
    }
    
    // Handle datetime range questions (type 9)
    if (q.type_id === 9) {
      const startDate = answers.value[q.id + '_start_date']
      const startTime = answers.value[q.id + '_start_time']
      const endDate = answers.value[q.id + '_end_date']
      const endTime = answers.value[q.id + '_end_time']
      
      // If required, all datetime fields must be provided
      if (q.required && (!startDate || !startTime || !endDate || !endTime)) return false
      
      // Validate datetime range logic
      if (startDate && startTime && endDate && endTime) {
        const startDateTime = new Date(`${startDate}T${startTime}`)
        const endDateTime = new Date(`${endDate}T${endTime}`)
        if (startDateTime > endDateTime) return false
      }
      
      return true
    }
    
    // Handle regular questions
    const val = answers.value[q.id]
    
    // Check if value exists
    if (val === undefined || val === null) return false
    
    // If array (checkboxes), check length
    if (Array.isArray(val)) return val.length > 0
    
    // If string, check trim
    if (typeof val === 'string') return val.trim() !== ''
    
    // Other types (number, etc.) are valid if not null/undefined
    return true
  })
})

// تسليم الإجابة
const submitResponse = async () => {
  if (!isFormValid.value || !selectedSurvey.value) return
  
  try {
    const schoolId = authStore.selectedSchoolId || authStore.user?.school?.[0]?.id || authStore.user?.schools?.[0]?.id
    
    // Process answers to handle date range questions properly
    const processedAnswers = []
    
    // Get all question IDs from the survey
    const questionIds = currentSurvey.value.questions.map(q => q.id)
    
    questionIds.forEach(questionId => {
      const question = currentSurvey.value.questions.find(q => q.id === questionId)
      
      if (question.type_id === 8) { // Date Range
        const startDate = answers.value[questionId + '_start']
        const endDate = answers.value[questionId + '_end']
        
        if (startDate || endDate) {
          processedAnswers.push({
            questionId: questionId,
            value: {
              startDate: startDate || null,
              endDate: endDate || null
            }
          })
        }
      }
      else if (question.type_id === 9) { // DateTime Range
        const startDate = answers.value[questionId + '_start_date']
        const startTime = answers.value[questionId + '_start_time']
        const endDate = answers.value[questionId + '_end_date']
        const endTime = answers.value[questionId + '_end_time']
        
        if (startDate || startTime || endDate || endTime) {
          processedAnswers.push({
            questionId: questionId,
            value: {
              startDate: startDate || null,
              startTime: startTime || null,
              endDate: endDate || null,
              endTime: endTime || null
            }
          })
        }
      }
      else {
        // Regular questions
        const value = answers.value[questionId]
        if (value !== undefined && value !== null && value !== '') {
          processedAnswers.push({
            questionId: questionId,
            value: value
          })
        }
      }
    })
    
    const responseData = {
      schoolId: schoolId,
      answers: processedAnswers
    }
    
    await responseStore.submitResponse(selectedSurvey.value, responseData)
    closeModal()
    await refreshSurveys()
    
    // إظهار رسالة نجاح
    alert('✅ تم تسليم الإجابة بنجاح')
  } catch (err) {
    console.error('❌ خطأ في تسليم الإجابة:', err)
    alert('❌ حدث خطأ أثناء تسليم الإجابة: ' + (err.message || 'خطأ غير معروف'))
  }
}

// تنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return 'غير محدد'
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// الحصول على اسم المدرسة من القائمة المحلية
const getSchoolName = (schoolId) => {
  if (!schoolId) return null
  const school = authStore.userSchoolsList.find(s => s.id === schoolId)
  return school ? school.name : null
}

// الحصول على مكون السؤال المناسب
const getQuestionComponent = (typeCode) => {
  // يمكن إضافة مكونات مخصصة هنا
  return 'div' // مؤقتاً
}

onMounted(() => {
  refreshSurveys()
})
</script>

<style scoped>
.available-surveys-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 32px;
  background: var(--gradient-primary);
  border: 2px solid var(--primary-gold);
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 48px;
}

.header-content h1 {
  margin: 0;
  color: white;
  font-size: 28px;
}

.header-subtitle {
  margin: 4px 0 0;
  color: var(--gold-light);
  font-size: 14px;
}

.school-context {
  color: #b9a779;
  font-weight: 700;
  margin-right: 4px;
}

.btn-refresh {
  padding: 12px 24px;
  background: var(--gradient-gold);
  color: var(--primary-dark);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: #b9a779;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #002623;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.btn-retry {
  margin-top: 16px;
  padding: 10px 20px;
  background: #002623;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.surveys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.survey-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.survey-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(185, 167, 121, 0.2);
  border-color: var(--primary-gold);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.survey-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
}

.survey-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.card-body {
  margin-bottom: 16px;
}

.survey-description {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.survey-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.meta-icon {
  font-size: 14px;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.btn-fill {
  width: 100%;
  padding: 12px;
  background: var(--gradient-primary);
  color: white;
  border: 1px solid var(--primary-gold);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-fill:hover {
  background: var(--gradient-gold);
  color: var(--primary-dark);
  box-shadow: 0 4px 15px rgba(185, 167, 121, 0.3);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.survey-fill-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px 24px;
  background: var(--gradient-primary);
  border-bottom: 2px solid var(--primary-gold);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.modal-header h2 {
  margin: 0;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #1e293b;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.survey-description-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.questions-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.question-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 16px;
}

.required {
  color: #ef4444;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel, .btn-submit {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-submit {
  background: var(--gradient-primary);
  color: white;
  border: 1px solid var(--primary-gold);
}

.btn-submit:hover:not(:disabled) {
  background: var(--gradient-gold);
  color: var(--primary-dark);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form Styles */
.input-wrapper {
  margin-top: 8px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #002623;
  box-shadow: 0 0 0 3px rgba(0, 38, 35, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.choices-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.choice-item {
  display: flex;
  align-items: center;
}

.choice-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
  width: 100%;
}

.choice-label:hover {
  background: #f1f5f9;
}

.choice-label input[type="radio"],
.choice-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #002623;
  cursor: pointer;
}

.choice-text {
  color: #334155;
  font-size: 15px;
}

/* Date Range Styles */
.date-range-wrapper,
.datetime-range-wrapper {
  margin-top: 12px;
}

.date-range-inputs,
.datetime-range-inputs {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.date-input-group,
.datetime-input-group {
  flex: 1;
  min-width: 200px;
}

.date-input-group label,
.datetime-input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.datetime-fields {
  display: flex;
  gap: 12px;
}

.date-field,
.time-field {
  flex: 1;
  min-width: 120px;
}

.error-message {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #fecaca;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .date-range-inputs,
  .datetime-range-inputs {
    flex-direction: column;
    gap: 16px;
  }
  
  .datetime-fields {
    flex-direction: column;
    gap: 8px;
  }
  
  .date-input-group,
  .datetime-input-group {
    min-width: unset;
  }
}
</style>

