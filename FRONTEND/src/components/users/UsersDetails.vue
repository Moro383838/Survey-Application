<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="header-content-wrapper">
          <img src="/logo.png" alt="شعار الوزارة" class="ministry-logo" />
          <h3>تفاصيل المستخدم</h3>
        </div>
        <button class="close-modal" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body custom-scrollbar">
        
        <div v-if="loading" class="state-container">
          <div class="loading-spinner"></div>
          <p>جاري جلب البيانات...</p>
        </div>

        <div v-else-if="error" class="error-message">
          <span class="error-icon">❌</span>
          <span>{{ error }}</span>
          <button class="retry-link" @click="loadUserDetails">إعادة المحاولة</button>
        </div>

        <div v-else-if="user" class="content-wrapper">
          
          <div class="profile-header">
            <div class="user-avatar-large">{{ getInitials(user.username) }}</div>
            <h3 class="user-title">{{ user.username }}</h3>
            <span class="detail-badge" :class="getRoleClass(user.role)">
              {{ getRoleText(user.role) }}
            </span>
          </div>

          <div class="user-details-box">
            <div class="detail-item">
              <span class="detail-label">الاسم الكامل:</span>
              <span class="detail-value">{{ user.name || '-' }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">تاريخ التسجيل:</span>
              <span class="detail-value">{{ formatDate(user.created_at) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">الصلاحيات:</span>
              <span class="detail-value">{{ getPermissionsText() }}</span>
            </div>
          </div>

          <div class="schools-section">
            <div class="section-title">
              <h4>🏫 المدارس المرتبطة ({{ getSchoolsCount() }})</h4>
            </div>
            
            <div v-if="hasSchools" class="schools-list">
              <div v-for="school in user.schools" :key="school.id" class="school-item">
                <div class="school-info">
                  <span class="school-name">{{ school.name }}</span>
                  <span class="school-code">رمز: {{ school.code }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-schools">
              <span>لا يوجد مدارس مرتبطة بهذا المستخدم</span>
            </div>
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          إغلاق
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
const usersStore = useUsersStore()

const user = ref(null)
const loading = ref(true)
const error = ref(null)

const loadUserDetails = async () => {
  try {
    loading.value = true
    error.value = null
    // جلب التفاصيل الكاملة من الستور
    const fetchedUser = await usersStore.getUserById(props.user.id)
    user.value = fetchedUser
  } catch (err) {
    console.error('❌ خطأ في تحميل تفاصيل المستخدم:', err)
    error.value = 'فشل في تحميل البيانات'
  } finally {
    loading.value = false
  }
}

onMounted(loadUserDetails)

// --- دوال مساعدة ---
const getInitials = (username) => {
  if (!username) return '?'
  return username.charAt(0).toUpperCase()
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
  const classes = {
    'ADMIN': 'admin',
    'SCHOOL_USER': 'school-user',
    'ANALAYZER_USER': 'analayzer-user'
  }
  return classes[role] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ar-SA')
}

const getPermissionsText = () => ({
  ADMIN: 'صلاحيات كاملة',
  SCHOOL_USER: 'إدارة المدارس المعينة',
  ANALAYZER_USER: 'تحليل البيانات'
}[user.value?.role] || 'صلاحيات محدودة')

const hasSchools = computed(() => {
  return user.value?.schools && user.value.schools.length > 0
})

const getSchoolsCount = () => {
  return user.value?.schools?.length || 0
}
</script>

<style scoped>
/* --- هيكل المودال الأساسي (مطابق لقالب الحذف) --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
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

.user-avatar-large {
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

.user-title {
  color: #003d36;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

/* صندوق التفاصيل الرمادي */
.user-details-box {
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
}
.detail-badge.admin { background: #dbeafe; color: #1e40af; }
.detail-badge.school-user { background: #e6f0ee; color: #054239; }
.detail-badge.analayzer-user { background: #f0fdf4; color: #166534; }

/* قسم المدارس */
.schools-section {
  margin-top: 10px;
}

.section-title h4 {
  font-size: 16px;
  color: #003d36;
  margin: 0 0 12px 0;
  border-bottom: 1px solid #b9a779;
  display: inline-block;
  padding-bottom: 4px;
}

.schools-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.school-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.2s;
}

.school-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.school-name {
  color: #374151;
  font-weight: 600;
  font-size: 14px;
}

.school-code {
  color: #9ca3af;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.empty-schools {
  text-align: center;
  color: #9ca3af;
  padding: 10px;
  font-size: 14px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #e5e7eb;
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