<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="header-content-wrapper">
          <img src="/logo.png" alt="شعار الوزارة" class="ministry-logo" />
          <h3>تأكيد إغلاق الاستبيان</h3>
        </div>
        <button class="close-modal" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="close-content">
          <div class="warning-icon">⚠️</div>
          <h3 class="warning-title">هل أنت متأكد؟</h3>
          <p class="warning-message">
            سيتم إغلاق الاستبيان "<strong>{{ survey?.title }}</strong>" وعدم قبول إجابات جديدة.
            <br>
            يمكنك إعادة فتحه لاحقاً إذا لزم الأمر.
          </p>
          
          <div class="survey-details" v-if="survey">
            <div class="detail-item">
              <span class="detail-label">الوصف:</span>
              <span class="detail-value">{{ truncateText(survey.description, 50) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">الحالة:</span>
              <span class="detail-value">{{ survey.status_label || 'غير محدد' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">النوع:</span>
              <span class="detail-value">{{ survey.is_periodic ? 'دوري' : 'عادي' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">عدد الأسئلة:</span>
              <span class="detail-value">{{ survey.questions?.length || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">تاريخ الإنشاء:</span>
              <span class="detail-value">{{ formatDate(survey.created_at) }}</span>
            </div>
          </div>

          <div v-if="error" class="error-message">
            <span class="error-icon">❌</span>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')" :disabled="isLoading">
          إلغاء
        </button>
        
        <button class="btn btn-warning" @click="confirmClose" :disabled="isLoading">
          <span v-if="isLoading" class="button-loading">
            <span class="loading-spinner"></span>
            جاري الإغلاق...
          </span>
          <span v-else>نعم، أغلق الاستبيان</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSurveyStore } from '@/stores/surveys'

const props = defineProps({
  survey: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'survey-closed'])
const store = useSurveyStore()

const isLoading = ref(false)
const error = ref(null)

const confirmClose = async () => {
  isLoading.value = true
  error.value = null

  try {
    console.log('🔒 جاري إغلاق الاستبيان:', props.survey.id)
    
    // استدعاء دالة إغلاق الاستبيان من الـ store
    await store.closeSurvey(props.survey.id)
    
    console.log('✅ تم إغلاق الاستبيان بنجاح')
    
    // إرسال حدث بأن الاستبيان تم إغلاقه
    emit('survey-closed')
    emit('close')
    
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء إغلاق الاستبيان'
    console.error('❌ خطأ في إغلاق الاستبيان:', err)
  } finally {
    isLoading.value = false
  }
}

const truncateText = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
  direction: rtl;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* تعديل لون الهيدر ليكون برتقالي بدلاً من أحمر */
.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #002623, #001a18);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #b9a779;
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

.modal-body {
  padding: 32px;
}

.close-content {
  text-align: center;
}

.warning-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #f97316;
}

.warning-title {
  color: #ea580c;
  font-size: 24px;
  margin-bottom: 12px;
  font-weight: 700;
}

.warning-message {
  color: #4b5563;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.warning-message strong {
  color: #ea580c;
}

.survey-details {
  background: #fffbeb;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  text-align: right;
  border: 1px solid #fef3c7;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #fef3c7;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #92400e;
  font-weight: 500;
  font-size: 14px;
}

.detail-value {
  color: #78350f;
  font-weight: 700;
  font-size: 14px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #fca5a5;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 1.5rem;
  justify-content: center;
}

.error-icon {
  font-size: 1.125rem;
}

.modal-footer {
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

/* زر الإغلاق بلون برتقالي */
.btn-warning {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
}

.btn-warning:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .warning-icon {
    font-size: 48px;
  }
  
  .warning-title {
    font-size: 20px;
  }
  
  .warning-message {
    font-size: 14px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>