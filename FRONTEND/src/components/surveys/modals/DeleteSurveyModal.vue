<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>تأكيد حذف الاستبيان</h3>
        <button class="close-modal" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="delete-content">
          <div class="warning-icon">🗑️</div>
          <h3 class="warning-title">هل أنت متأكد من الحذف؟</h3>
          <p class="warning-message">
            سيتم حذف الاستبيان "<strong>{{ survey?.title }}</strong>" بشكل نهائي.
            <br>
            <span class="danger-text">هذا الإجراء لا يمكن التراجع عنه.</span>
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
        
        <button class="btn btn-danger" @click="confirmDelete" :disabled="isLoading">
          <span v-if="isLoading" class="button-loading">
            <span class="loading-spinner"></span>
            جاري الحذف...
          </span>
          <span v-else>نعم، احذف الاستبيان</span>
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

const emit = defineEmits(['close', 'survey-deleted'])
const store = useSurveyStore()

const isLoading = ref(false)
const error = ref(null)

const confirmDelete = async () => {
  isLoading.value = true
  error.value = null

  try {
    console.log('🗑️ جاري حذف الاستبيان:', props.survey.id)
    
    await store.deleteSurvey(props.survey.id)
    
    console.log('✅ تم حذف الاستبيان بنجاح')
    
    emit('survey-deleted')
    emit('close')
    
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء حذف الاستبيان'
    console.error('❌ خطأ في حذف الاستبيان:', err)
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
  background: rgba(0, 0, 0, 0.6);
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
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  opacity: 0.8;
}

.close-modal:hover {
  opacity: 1;
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
}

.delete-content {
  text-align: center;
}

.warning-icon {
  font-size: 64px;
  margin-bottom: 20px;
  display: inline-block;
  animation: shake 0.5s ease-in-out;
}

.warning-title {
  color: #dc2626;
  font-size: 24px;
  margin-bottom: 12px;
  font-weight: 800;
}

.warning-message {
  color: #4b5563;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.warning-message strong {
  color: #111827;
  font-weight: 700;
}

.danger-text {
  color: #dc2626;
  font-weight: 600;
}

.survey-details {
  background: #fef2f2;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  text-align: right;
  border: 1px solid #fee2e2;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #fecaca;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #991b1b;
  font-weight: 500;
  font-size: 14px;
}

.detail-value {
  color: #7f1d1d;
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

.modal-footer {
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(220, 38, 38, 0.3);
}

.btn-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  color: #334155;
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
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

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-5deg); }
  75% { transform: translateX(5px) rotate(5deg); }
}

@media (max-width: 640px) {
  .modal {
    width: 95%;
    margin: 10px;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
