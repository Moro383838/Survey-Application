<!-- src/components/users/DeleteUserModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h3>تأكيد الحذف</h3>
        <button class="close-modal" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="delete-content">
          <div class="warning-icon">⚠️</div>
          <h3 class="warning-title">هل أنت متأكد؟</h3>
          <p class="warning-message">
            سيتم حذف المستخدم "<strong>{{ userToDelete.username }}</strong>" بشكل دائم.
            <br>
            لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div class="user-details" v-if="userToDelete">
            <div class="detail-item">
              <span class="detail-label">اسم المستخدم:</span>
              <span class="detail-value">{{ userToDelete.username }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">الدور:</span>
              <span class="detail-badge" :class="getRoleClass(userToDelete.role)">
                {{ getRoleText(userToDelete.role) }}
              </span>
            </div>
            <div class="detail-item" v-if="userToDelete.school_names && userToDelete.school_names !== 'N/A'">
              <span class="detail-label">المدارس:</span>
              <span class="detail-value">{{ formatSchoolNames(userToDelete.school_names) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">تاريخ الإضافة:</span>
              <span class="detail-value">{{ formatDate(userToDelete.created_at) }}</span>
            </div>
          </div>
          <div v-if="error" class="error-message">
            <span class="error-icon">❌</span>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal" :disabled="isLoading">
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
          <span v-else>نعم، احذف المستخدم</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUsersStore } from '@/stores/users.js'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'user-deleted'])

const usersStore = useUsersStore()
const isLoading = ref(false)
const error = ref(null)

const userToDelete = ref({ ...props.user })
const confirmDelete = async () => {
  isLoading.value = true
  error.value = null

  try {
    console.log('🗑️ جاري حذف المستخدم:', userToDelete.value)
    await usersStore.deleteUser(userToDelete.value.id)
    console.log('✅ تم حذف المستخدم بنجاح')
    emit('user-deleted')
    closeModal()
    
  } catch (err) {
    error.value = err.response?.data?.error || 
                 err.response?.data?.message || 
                 'حدث خطأ أثناء حذف المستخدم'
    
    console.error('❌ خطأ في حذف المستخدم:', {
      error: err,
      response: err.response?.data,
      userId: userToDelete.value.id
    })
  } finally {
    isLoading.value = false
  }
}
const closeModal = () => {
  emit('close')
}

const formatSchoolNames = (schoolNames) => {
  if (!schoolNames || schoolNames === 'N/A') return 'غير محدد'
  
  const namesArray = schoolNames.split(',').map(name => name.trim())
  const uniqueNames = [...new Set(namesArray)]
  
  return uniqueNames.join('، ')
}

const getRoleText = (role) => {
  const roles = {
    'ADMIN': 'مدير النظام',
    'SCHOOL_USER': 'مستخدم مدرسة',
    'ANALAYZER_USER': 'محلل بيانات'
  }
  return roles[role] || role
}

const getRoleClass = (role) => {
  const roleClass = {
    'ADMIN': 'admin',
    'SCHOOL_USER': 'school-user',
    'ANALAYZER_USER': 'analayzer-user'
  }
  return roleClass[role] || 'user'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA')
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
.user-details {
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

.detail-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.detail-badge.admin {
  background: #dbeafe;
  color: #1e40af;
}

.detail-badge.school-user {
  background: #D9FFFA;
  color: #126E70;
}

.detail-badge.analayzer-user {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  color: #166534;
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