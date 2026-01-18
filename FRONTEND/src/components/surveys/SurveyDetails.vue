<template>
  <div class="survey-details-page">
    <div class="back-section">
      <button class="back-btn" @click="$router.back()">
        ← العودة
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>جاري تحميل تفاصيل الاستبيان...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>حدث خطأ أثناء تحميل البيانات</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadSurveyDetails">
        إعادة المحاولة
      </button>
    </div>

    <!-- Survey Content -->
    <div v-else-if="survey && survey.id" class="survey-content">
      <!-- Header Section -->
      <div class="survey-header">
        <div class="survey-icon">📋</div>
        <div class="survey-info">
          <h1>{{ survey.title }}</h1>
          <div class="survey-meta">
            <span class="status-badge" :class="getStatusClass(survey.status_id)">
              {{ survey.status_label }}
            </span>
            <span class="survey-type">
              {{ survey.is_periodic ? '🔄 استبيان دوري' : '📝 استبيان لمرة واحدة' }}
            </span>
            <span class="created-date">
              📅 {{ formatDate(survey.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Details Section -->
      <div class="details-section">
        <!-- Basic Information -->
        <div class="details-card">
          <div class="card-header">
            <h3>📋 المعلومات الأساسية</h3>
          </div>
          <div class="card-content">
            <div class="detail-row">
              <span class="detail-label">الوصف:</span>
              <span class="detail-value">{{ survey.description || 'لا يوجد وصف' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">تاريخ الانتهاء:</span>
              <span class="detail-value">{{ formatDate(survey.end_date || survey.dates?.end) }}</span>
            </div>
            <div v-if="survey.frequency" class="detail-row">
              <span class="detail-label">التكرار:</span>
              <span class="detail-value">{{ survey.frequency }}</span>
            </div>
          </div>
        </div>

        <!-- Clean Questions Display -->
        <div v-if="survey.questions && survey.questions.length > 0" class="details-card">
          <div class="card-header">
            <h3>❓ الأسئلة ({{ survey.questions.length }})</h3>
          </div>
          <div class="card-content questions-clean-container">
            <div 
              v-for="(question, index) in survey.questions"
              :key="question.id || index"
              class="clean-question-item"
            >
              <div class="clean-q-header">
                <span class="clean-q-number">{{ index + 1 }}.</span>
                <h4 class="clean-q-text">
                  {{ question.text }}
                  <span v-if="question.is_required || question.required" class="required-mark">*</span>
                </h4>
              </div>
              
              <!-- Text Questions (1, 2) -->
              <div v-if="[1, 2].includes(question.type_id)" class="clean-answer-area">
                <input 
                  v-if="question.type_id === 1"
                  type="text" 
                  class="clean-input" 
                  placeholder="إجابة نصية قصيرة"
                  disabled
                />
                <textarea 
                  v-else
                  class="clean-textarea" 
                  placeholder="إجابة نصية طويلة"
                  rows="3"
                  disabled
                ></textarea>
              </div>

              <!-- Single Choice (3) -->
              <div v-else-if="question.type_id === 3" class="clean-answer-area">
                <div v-for="(option, idx) in question.options" :key="idx" class="clean-option">
                  <input type="radio" :name="'q_' + question.id" disabled />
                  <span>{{ typeof option === 'object' ? (option.text || option.label || option.value) : option }}</span>
                </div>
              </div>

              <!-- Multiple Choice (4) -->
              <div v-else-if="question.type_id === 4" class="clean-answer-area">
                <div v-for="(option, idx) in question.options" :key="idx" class="clean-option">
                  <input type="checkbox" disabled />
                  <span>{{ typeof option === 'object' ? (option.text || option.label || option.value) : option }}</span>
                </div>
              </div>

              <!-- Number (5) -->
              <div v-else-if="question.type_id === 5" class="clean-answer-area">
                <input type="number" class="clean-input" placeholder="رقم" disabled />
              </div>

              <!-- Date (6) -->
              <div v-else-if="question.type_id === 6" class="clean-answer-area">
                <input type="date" class="clean-input" disabled />
              </div>

              <!-- Time (7) -->
              <div v-else-if="question.type_id === 7" class="clean-answer-area">
                <input type="time" class="clean-input" disabled />
              </div>

              <!-- Rating (10) -->
              <div v-else-if="question.type_id === 10" class="clean-answer-area">
                <div class="clean-rating">
                  <span v-for="n in 5" :key="n" class="star-icon">⭐</span>
                </div>
              </div>

              <!-- Default -->
              <div v-else class="clean-answer-area">
                <input type="text" class="clean-input" placeholder="إجابة" disabled />
              </div>
            </div>
          </div>
        </div>

        <!-- Targets Section -->
        <div v-if="survey.targets && survey.targets.length > 0" class="details-card">
          <div class="card-header">
            <h3>🎯 الأهداف المحددة</h3>
          </div>
          <div class="card-content">
            <div class="targets-grid">
              <div 
                v-for="target in survey.targets" 
                :key="target.id" 
                class="target-card"
              >
                <div class="target-icon">🏫</div>
                <div class="target-info">
                  <h4>{{ target.name || target.school_name }}</h4>
                  <p v-if="target.directorate">{{ target.directorate }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>لم يتم العثور على الاستبيان</h3>
      <p>قد يكون الاستبيان محذوف أو الرابط غير صحيح</p>
      <button class="back-home-btn" @click="$router.push('/surveys')">
        العودة لقائمة الاستبيانات
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/surveys'

const route = useRoute()
const store = useSurveyStore()

// Reactive data
const survey = ref(null)
const loading = ref(true)
const error = ref(null)

// Load survey details
const loadSurveyDetails = async () => {
  try {
    loading.value = true
    error.value = null
    
    const surveyId = Number(route.params.id)
    
    if (!surveyId || isNaN(surveyId)) {
      throw new Error('معرف الاستبيان غير صحيح')
    }

    const data = await store.fetchSurveyById(surveyId)
    
    if (!data) {
      throw new Error('لم يتم العثور على الاستبيان')
    }
    
    survey.value = data
    
  } catch (err) {
    console.error('Error loading survey details:', err)
    error.value = err.message || 'حدث خطأ أثناء تحميل تفاصيل الاستبيان'
  } finally {
    loading.value = false
  }
}

// Format dates
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

// Get status class based on status ID
const getStatusClass = (statusId) => {
  const statusClasses = {
    1: 'status-draft',
    2: 'status-active',
    3: 'status-closed'
  }
  return statusClasses[statusId] || 'status-default'
}

// Lifecycle
onMounted(loadSurveyDetails)
</script>

<style scoped>
.survey-details-page {
  padding: 24px;
  direction: rtl;
  min-height: calc(100vh - 128px);
  background: #f8fafc;
  color: #002623;
  max-width: 100%;
  font-family: 'Inter', 'Outfit', sans-serif;
}

/* Back Button */
.back-btn {
  margin-bottom: 24px;
  cursor: pointer;
  background: white;
  color: #002623;
  border: 1px solid #e2e8f0;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.back-btn:hover {
  background: #002623;
  color: #b9a779;
  border-color: #002623;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.15);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 40px 0;
  color: #002623;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid var(--primary-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Survey Header */
.survey-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #002623, #001a18);
  border: 1px solid #b9a779;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.2);
  margin-bottom: 24px;
  color: white;
  flex-wrap: wrap;
}

.survey-icon {
  font-size: 32px;
}

.survey-info h1 {
  margin: 0 0 12px 0;
  color: #b9a779;
  font-size: 24px;
  font-weight: 700;
}

.survey-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  border: 1px solid #b9a779;
  background: rgba(0, 38, 35, 0.8);
}

.status-draft { background: var(--dark-bg); }
.status-active { background: var(--status-success); }
.status-closed { background: var(--status-error); }
.status-default { background: var(--text-muted); }

.survey-type {
  background: rgba(185, 167, 121, 0.2);
  color: #b9a779;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(185, 167, 121, 0.4);
}

.created-date {
  color: var(--text-secondary);
  font-weight: 500;
}

/* Details Section */
.details-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-card {
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.1);
  overflow: hidden;
  color: var(--primary-dark);
}

.card-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #002623, #001a18);
  border-bottom: 2px solid #b9a779;
  color: white;
}

.card-header h3 {
  margin: 0;
  color: #b9a779;
  font-size: 18px;
  font-weight: 600;
}

.card-content {
  padding: 24px;
}

.detail-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-secondary);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  min-width: 120px;
  font-weight: 600;
  color: var(--primary-dark);
}

.detail-value {
  flex: 1;
  color: var(--text-muted);
  line-height: 1.6;
}

/* Questions Container */
.questions-clean-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.clean-question-item {
  padding: 20px;
  background: var(--bg-hover);
  border-radius: 12px;
  border: 1px solid var(--border-secondary);
}

.clean-q-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.clean-q-number {
  font-weight: 700;
  color: var(--primary-dark);
  font-size: 16px;
  min-width: 24px;
}

.clean-q-text {
  margin: 0;
  color: var(--primary-dark);
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  line-height: 1.5;
}

.required-mark {
  color: var(--status-error);
  font-weight: 700;
}

.clean-answer-area {
  margin-right: 36px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-secondary);
}

.clean-input, .clean-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: var(--primary-dark);
}

.clean-input:focus, .clean-textarea:focus {
  border-color: var(--primary-gold) !important;
  box-shadow: 0 0 0 3px rgba(185, 167, 121, 0.1) !important;
}

.clean-textarea {
  resize: vertical;
  min-height: 100px;
}

.clean-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.clean-rating {
  display: flex;
  gap: 4px;
}

.star-icon {
  font-size: 20px;
}

/* Targets Grid */
.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.target-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-hover);
  border-radius: 12px;
  border: 1px solid var(--border-secondary);
}

.target-icon {
  font-size: 24px;
}

.target-info h4 {
  margin: 0 0 4px 0;
  color: var(--primary-dark);
  font-size: 16px;
  font-weight: 600;
}

.target-info p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.1);
  margin: 40px 0;
  color: var(--primary-dark);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-state h3 {
  margin: 0 0 16px 0;
  color: var(--primary-dark);
  font-size: 24px;
  font-weight: 700;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: var(--text-muted);
  font-size: 16px;
  text-align: center;
}

.back-home-btn {
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: 1px solid var(--primary-gold);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-home-btn:hover {
  background: var(--primary-gold);
  color: var(--primary-dark);
  transform: translateY(-2px);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .survey-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 24px;
  }
  
  .survey-meta {
    justify-content: center;
  }
  
  .targets-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-label {
    min-width: unset;
  }
  
  .clean-answer-area {
    margin-right: 0;
  }
}
.survey-details-page {
  padding: 24px;
  direction: rtl;
  min-height: 100vh;
  background: #f8fafc;
}

/* Back Button */
.back-btn {
  margin-bottom: 20px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #cbd5e1;
  padding: 10px 20px;
  border-radius: 8px;
  color: #475569;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 40px 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #428177;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Survey Header */
.survey-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.survey-icon {
  font-size: 32px;
}

.survey-info h1 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
}

.survey-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.status-draft { background: #94a3b8; }
.status-active { background: #10b981; }
.status-closed { background: #ef4444; }
.status-default { background: #64748b; }

.survey-type {
  background: #e2e8f0;
  color: #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.created-date {
  color: #64748b;
  font-weight: 500;
}

/* Details Section */
.details-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e2e8f0;
}

.details-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 24px;
  background: white;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  margin: 0;
  color: #002623;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-content {
  padding: 32px;
}

.detail-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  min-width: 120px;
  font-weight: 600;
  color: #334155;
}

.detail-value {
  flex: 1;
  color: #64748b;
  line-height: 1.6;
}

/* Questions Container */
.questions-clean-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.clean-question-item {
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s ease;
}

.clean-question-item:hover {
  border-color: #b9a779;
}

.clean-q-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.clean-q-number {
  font-weight: 700;
  color: #0f766e;
  font-size: 16px;
  min-width: 24px;
}

.clean-q-text {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  line-height: 1.5;
}

.required-mark {
  color: #ef4444;
  font-weight: 700;
}

.clean-answer-area {
  margin-right: 36px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.clean-input, .clean-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 16px;
  background: #f8fafc;
}

.clean-textarea {
  resize: vertical;
  min-height: 100px;
}

.clean-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.clean-rating {
  display: flex;
  gap: 4px;
}

.star-icon {
  font-size: 20px;
}

/* Targets Grid */
.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.target-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.target-icon {
  font-size: 24px;
}

.target-info h4 {
  margin: 0 0 4px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.target-info p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 40px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-state h3 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 16px;
  text-align: center;
}

.back-home-btn {
  padding: 12px 24px;
  background: #0f766e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-home-btn:hover {
  background: #0d9488;
  transform: translateY(-2px);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .survey-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 24px;
  }
  
  .survey-meta {
    justify-content: center;
  }
  
  .targets-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-label {
    min-width: unset;
  }
  
  .clean-answer-area {
    margin-right: 0;
  }
}
</style>