<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>تأكيد حذف المدرسة</h3>
        <button class="close-modal" @click="emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="delete-content">
          <div class="warning-icon">⚠️</div>
          <h3 class="warning-title">هل أنت متأكد؟</h3>
          <p class="warning-message">
            سيتم حذف المدرسة "<strong>{{ school?.name }}</strong>" بشكل دائم.
            <br>
            لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div class="school-details" v-if="school">
            <div class="detail-item">
              <span class="detail-label">الرمز الوزاري:</span>
              <span class="detail-value">{{ school.code }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">المنطقة:</span>
              <span class="detail-value">{{ school.region }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">عدد الموظفين:</span>
              <span class="detail-value">{{ school.users_count || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">تاريخ الإنشاء:</span>
              <span class="detail-value">{{ formatDate(school.created_at) }}</span>
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
        <button 
          class="btn btn-danger" 
          @click="confirmDelete"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="button-loading">
            <span class="loading-spinner"></span>
            <span>جاري الحذف...</span>
          </span>
          <span v-else>نعم، احذف المدرسة</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref  } from 'vue'
import { schoolService } from '@/api/index.js'

const props = defineProps({
  school: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'school-deleted'])

const isLoading = ref(false)
const error = ref(null)

const confirmDelete = async () => {
  isLoading.value = true
  error.value = null

  try {
    console.log('🗑️ جاري حذف المدرسة:', props.school)
    
    await schoolService.delete(props.school.id)
    
    console.log('✅ تم حذف المدرسة بنجاح')
    emit('school-deleted')
    
  } catch (err) {
    error.value = err.response?.data?.error || 
                 err.response?.data?.message || 
                 'حدث خطأ أثناء حذف المدرسة'
    
    console.error('❌ خطأ في حذف المدرسة:', {
      error: err,
      response: err.response?.data,
      schoolId: props.school.id
    })
  } finally {
    isLoading.value = false
  }
}
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA')
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 24px;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.close-modal:hover {
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
  margin-bottom: 16px;
}

.warning-title {
  color: #dc2626;
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
  color: #dc2626;
}
.school-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  text-align: right;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
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
  padding: 10px 20px;
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
}

.btn-danger:disabled {
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