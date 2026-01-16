<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>تفاصيل المدرسة</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل التفاصيل...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="loadSchoolData">إعادة المحاولة</button>
      </div>
      
      <div v-else-if="schoolData" class="school-details">
        <div class="school-header">
          <div class="school-icon">🏫</div>
          <div class="school-info">
            <h3>{{ schoolData.name }}</h3>
            <p class="school-code">الرمز: {{ schoolData.code || '-' }}</p>
          </div>
        </div>
        
        <div class="details-grid">
          <div class="detail-card">
            <h4>المعلومات الأساسية</h4>
            <div class="detail-item">
              <span class="label">اسم المدرسة:</span>
              <span class="value">{{ schoolData.name || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">الرمز:</span>
              <span class="value">{{ schoolData.code || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">المنطقة:</span>
              <span class="value">{{ schoolData.region || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">عدد الموظفين:</span>
              <span class="value">{{ schoolData.users_count || 0 }}</span>
            </div>
          </div>
          
          <div v-if="schoolData.users && schoolData.users.length > 0" class="detail-card">
            <h4>الموظفون</h4>
            <div class="users-list">
              <div v-for="user in schoolData.users" :key="user.id" class="user-item">
                <span class="user-initials">{{ getInitials(user.username) }}</span>
                <span class="user-name">{{ user.username }}</span>
                <span class="user-role">{{ getRoleText(user.role) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { schoolService } from '@/api/index.js'

const props = defineProps({
  school: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const schoolData = ref(null)
const loading = ref(true)
const error = ref(null)

const closeModal = () => {
  emit('close')
}

const loadSchoolData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await schoolService.getById(props.school.id)
    schoolData.value = response.data
  } catch (err) {
    console.error('Error loading school data:', err)
    error.value = 'فشل في تحميل تفاصيل المدرسة'
  } finally {
    loading.value = false
  }
}

const getInitials = (username) => {
  if (!username) return 'م'
  return username.charAt(0).toUpperCase()
}

const getRoleText = (role) => {
  const roles = {
    'ADMIN': 'مدير النظام',
    'SCHOOL_USER': 'مستخدم مدرسة',
    'ANALAYZER_USER': 'محلل بيانات',
    1: 'مدير النظام',
    2: 'مستخدم مدرسة',
    3: 'محلل بيانات'
  }
  return roles[role] || 'غير محدد'
}

onMounted(() => {
  loadSchoolData()
})
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  background: linear-gradient(135deg, #002623, #001a18);
  border-bottom: 2px solid #b9a779;
}

.modal-header h2 {
  margin: 0;
  color: #b9a779;
  font-size: 20px;
}

.close-btn {
  background: rgba(185, 167, 121, 0.1);
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #b9a779;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(185, 167, 121, 0.2);
  color: white;
}

.loading-state, .error-state {
  padding: 40px 24px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #054239;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  background: #054239;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #04362e;
  transform: translateY(-2px);
}

.school-details {
  padding: 24px;
}

.school-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.school-icon {
  font-size: 48px;
}

.school-info h3 {
  margin: 0 0 4px 0;
  color: #1e293b;
  font-size: 20px;
}

.school-code {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.details-grid {
  display: grid;
  gap: 20px;
}

.detail-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
}

.detail-card h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #edf2f7;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  color: #1e293b;
  font-weight: 600;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.user-initials {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #054239, #04362e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.user-name {
  color: #1e293b;
  font-weight: 500;
  flex: 1;
}

.user-role {
  color: #64748b;
  font-size: 12px;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .school-header {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>