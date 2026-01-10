<template>
 <div class="question-types-container">
    <!-- Header Section -->
    <div class="container-header">
      <div class="header-icon">❓</div>
      <div class="header-content">
        <h3>مكتبة الأسئلة</h3>
        <p>اختر من أنواع الأسئلة المتاحة أو استخدم الأسئلة المحفوظة</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats" v-if="!isLoading">
      <div class="stat-item">
        <span class="stat-number">{{ questionTypes.length }}</span>
        <span class="stat-label">نوع سؤال</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ savedQuestionsCount }}</span>
        <span class="stat-label">سؤال محفوظ</span>
      </div>
    </div>

    <!-- حالة التحميل -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>جاري تحميل أنواع الأسئلة...</p>
    </div>

    <!-- حالة الخطأ -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="retryFetch" class="retry-btn">إعادة المحاولة</button>
    </div>

    <!-- Question Types Grid -->
    <div v-else class="types-grid">
      <div 
        v-for="type in questionTypes" 
        :key="type.id"
        class="type-card"
        :style="getCardStyle(type.code)"
        @click="emit('select-type', type)"
      >
        <div class="type-icon">{{ type.icon }}</div>
        <div class="type-info">
          <h4 class="type-name">{{ type.label }}</h4>
          <p class="type-description">{{ type.description }}</p>
        </div>
        <div class="type-actions">
          <button class="add-btn" @click.stop="emit('add-question', type)">
            <span>➕</span>
            <span>إضافة</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ... باقي المحتوى ... -->
      <!-- Saved Questions Section -->
      <div class="saved-questions" v-if="savedQuestions.length > 0">
        <div class="section-header">
          <h4>الأسئلة المحفوظة</h4>
          <button class="manage-btn" @click="emit('manage-saved')">
            <span>📁</span>
            <span>إدارة</span>
          </button>
        </div>
        
        <div class="saved-list">
          <div 
            v-for="question in savedQuestions.slice(0, 3)" 
            :key="question.id"
            class="saved-item"
            @click="emit('use-saved-question', question)"
          >
            <div class="saved-icon">{{ getQuestionIcon(question.type_id) }}</div>
            <div class="saved-content">
              <p class="saved-text">{{ truncateText(question.text, 40) }}</p>
              <span class="saved-type">{{ question.type_label }}</span>
            </div>
          </div>
          
          <div v-if="savedQuestions.length > 3" class="show-more" @click="emit('view-all-saved')">
            <span>➕ {{ savedQuestions.length - 3 }} أسئلة إضافية</span>
          </div>
        </div>
      </div>
  
      <!-- Recent Templates -->
      <div class="recent-templates" v-if="recentTemplates.length > 0">
        <div class="section-header">
          <h4>القوالب المستخدمة حديثاً</h4>
        </div>
        
        <div class="templates-list">
          <div 
            v-for="template in recentTemplates" 
            :key="template.id"
            class="template-item"
            @click="emit('use-template', template)"
          >
            <div class="template-icon">📋</div>
            <div class="template-info">
              <h5>{{ template.name }}</h5>
              <p>{{ template.questions_count }} سؤال</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="action-btn import-btn" @click="emit('import-questions')">
          <span class="action-icon">📥</span>
          <span>استيراد أسئلة</span>
        </button>
        <button class="action-btn template-btn" @click="emit('create-template')">
          <span class="action-icon">✨</span>
          <span>حفظ كقالب</span>
        </button>
        <button class="action-btn preview-btn" @click="emit('preview-survey')">
          <span class="action-icon">👁️</span>
          <span>معاينة</span>
        </button>
      </div>
    </div>
  </template>
  
 <script setup>
import { computed, onMounted } from 'vue'
import { useSurveyStore } from '@/stores/surveys'

const surveyStore = useSurveyStore()

const props = defineProps({
  savedQuestions: {
    type: Array,
    default: () => []
  },
  recentTemplates: {
    type: Array,
    default: () => []
  }
})

const isLoading = computed(() => surveyStore.isLoading)
const error = computed(() => surveyStore.error)

// ✅ الحصول على الأنواع من الـ store مباشرة
const questionTypes = computed(() => surveyStore.questionTypes)

const savedQuestionsCount = computed(() => props.savedQuestions.length)

onMounted(async () => {
  // ✅ جلب أنواع الأسئلة من الـ API إذا لم تكن موجودة
  if (surveyStore.questionTypes.length === 0) {
    await surveyStore.fetchQuestionTypes()
  }
})

const retryFetch = async () => {
  await surveyStore.fetchQuestionTypes()
}

// تعديل getCardStyle لاستخدام code بدلاً من id
const getCardStyle = (code) => {
  const colors = {
    SHORT_TEXT: { bg: '#e6f4f1', border: '#428177', text: '#054239' },
    LONG_TEXT: { bg: '#f0f7f6', border: '#054239', text: '#002623' },
    SINGLE_CHOICE: { bg: '#f9f6ef', border: '#b9a779', text: '#988561' },
    MULTIPLE_CHOICE: { bg: '#f5f2ea', border: '#988561', text: '#7a6c4f' },
    NUMBER: { bg: '#e8e6e0', border: '#002623', text: '#000000' },
    DATE: { bg: '#f0e6f4', border: '#8a2be2', text: '#6a1bb3' },
    TIME: { bg: '#e6f4ff', border: '#007bff', text: '#0056b3' },
    DATE_RANGE: { bg: '#fff0e6', border: '#ff6600', text: '#cc5200' },
    DATETIME_RANGE: { bg: '#ffe6e6', border: '#ff0000', text: '#cc0000' }
  }
  
  const colorSet = colors[code] || colors.SHORT_TEXT
  
  return {
    backgroundColor: colorSet.bg,
    borderColor: colorSet.border,
    color: colorSet.text
  }
}

const emit = defineEmits([
  'select-type',
  'add-question',
  'use-saved-question',
  'use-template',
  'manage-saved',
  'view-all-saved',
  'import-questions',
  'create-template',
  'preview-survey'
]) 
  // Computed Properties
  const getTypeDescription = (typeId) => {
  const descriptions = {
    1: 'إجابة نصية قصيرة (حتى 255 حرف)',
    2: 'إجابة نصية طويلة (فقرات متعددة)',
    3: 'اختيار واحد من الخيارات (radio buttons)',
    4: 'اختيار متعدد مع إمكانية تحديد أكثر من خيار',
    5: 'إدخال رقم مع إمكانية تحديد نطاق',
    6: 'تحديد تاريخ',
    7: 'تحديد وقت',
    8: 'تحديد فترة زمنية (من تاريخ إلى تاريخ)',
    9: 'تحديد فترة زمنية مع وقت'
  }
  return descriptions[typeId] || 'نوع سؤال'
}
  
const getQuestionIcon = (typeId) => {
  const icons = {
    1: '📝',
    2: '📄',
    3: '🔘',
    4: '☑️',
    5: '🔢',
    6: '📅',
    7: '⏰',
    8: '📆',
    9: '🗓️'
  }
  return icons[typeId] || '❓'
}
  
  const truncateText = (text, length) => {
    if (!text) return 'لا يوجد نص'
    return text.length > length ? text.substring(0, length) + '...' : text
  }
  </script>
  
  <style scoped>
    .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #428177;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
    background: #fee2e2;
    border-radius: 12px;
    text-align: center;
  }

  .error-icon {
    font-size: 32px;
    color: #ef4444;
  }

  .retry-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .retry-btn:hover {
    background: #dc2626;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
    .question-item.number {
        border-left: 4px solid #4a90e2;
      }

      .question-item.date {
        border-left: 4px solid #36b37e;
      }

      .question-item.time {
        border-left: 4px solid #ff8b00;
      }

      .question-item.date-range {
        border-left: 4px solid #6554c0;
      }

      .question-item.datetime-range {
        border-left: 4px solid #ff5630;
      }
  .question-types-container {
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 38, 35, 0.08);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  /* Header */
  .container-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 2px solid #edebe0;
  }
  
  .header-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #52B5AB, #126E70);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: white;
  }
  
  .header-content h3 {
    color: #054239;
    margin: 0 0 6px 0;
    font-size: 20px;
    font-weight: 700;
  }
  
  .header-content p {
    color: #5D6D7E;
    margin: 0;
    font-size: 14px;
  }
  
  /* Quick Stats */
  .quick-stats {
    display: flex;
    gap: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }
  
  .stat-number {
    font-size: 28px;
    font-weight: 700;
    color: #054239;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 13px;
    color: #5D6D7E;
  }
  
  /* Question Types Grid */
  .types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .type-card {
    border: 2px solid;
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .type-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .type-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .type-info {
    flex: 1;
  }
  
  .type-name {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 700;
  }
  
  .type-description {
    margin: 0;
    font-size: 13px;
    color: #666;
    line-height: 1.4;
  }
  
  .type-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  .add-btn {
    background: rgba(66, 129, 119, 0.1);
    color: #428177;
    border: 1px solid rgba(66, 129, 119, 0.3);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
  }
  
  .add-btn:hover {
    background: #428177;
    color: white;
  }
  
  /* Saved Questions */
  .saved-questions {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .section-header h4 {
    color: #054239;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }
  
  .manage-btn {
    background: rgba(185, 167, 121, 0.1);
    color: #b9a779;
    border: 1px solid rgba(185, 167, 121, 0.3);
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .saved-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .saved-item {
    background: white;
    border: 1px solid #edebe0;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .saved-item:hover {
    border-color: #b9a779;
    transform: translateX(5px);
  }
  
  .saved-icon {
    font-size: 20px;
    width: 40px;
    height: 40px;
    background: rgba(66, 129, 119, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #428177;
  }
  
  .saved-content {
    flex: 1;
  }
  
  .saved-text {
    margin: 0 0 4px 0;
    color: #002623;
    font-size: 14px;
    line-height: 1.4;
  }
  
  .saved-type {
    font-size: 11px;
    color: #5D6D7E;
    background: #edebe0;
    padding: 2px 8px;
    border-radius: 10px;
  }
  
  .show-more {
    text-align: center;
    padding: 12px;
    color: #428177;
    font-weight: 600;
    cursor: pointer;
    border-top: 1px dashed #edebe0;
    margin-top: 8px;
  }
  
  /* Recent Templates */
  .recent-templates {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
  }
  
  .templates-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .template-item {
    background: white;
    border: 1px solid #edebe0;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .template-item:hover {
    border-color: #428177;
  }
  
  .template-icon {
    font-size: 24px;
    color: #428177;
  }
  
  .template-info h5 {
    margin: 0 0 4px 0;
    color: #002623;
    font-size: 14px;
  }
  
  .template-info p {
    margin: 0;
    color: #5D6D7E;
    font-size: 12px;
  }
  
  /* Quick Actions */
  .quick-actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid #edebe0;
  }
  
  .action-btn {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
  }
  
  .import-btn {
    background: rgba(66, 129, 119, 0.1);
    color: #428177;
    border-color: rgba(66, 129, 119, 0.3);
  }
  
  .import-btn:hover {
    background: #428177;
    color: white;
  }
  
  .template-btn {
    background: rgba(185, 167, 121, 0.1);
    color: #b9a779;
    border-color: rgba(185, 167, 121, 0.3);
  }
  
  .template-btn:hover {
    background: #b9a779;
    color: white;
  }
  
  .preview-btn {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.3);
  }
  
  .preview-btn:hover {
    background: #10b981;
    color: white;
  }
  
  .action-icon {
    font-size: 16px;
  }
  
  /* Responsive */
  @media (max-width: 1200px) {
    .types-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .question-types-container {
      padding: 16px;
    }
    
    .types-grid {
      grid-template-columns: 1fr;
    }
    
    .quick-actions {
      flex-direction: column;
    }
  }
  </style>