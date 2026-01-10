<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h3>إضافة مستخدم جديد</h3>
        <button class="close-modal" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">اسم المستخدم *</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="formData.username"
                required
                placeholder="أدخل اسم المستخدم"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">كلمة المرور *</label>
              <input 
                type="password" 
                class="form-input" 
                v-model="formData.password"
                required
                placeholder="أدخل كلمة المرور"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">الدور *</label>
              <select class="form-select" v-model="formData.role" required @change="handleRoleChange">
                <option value="">اختر الدور</option>
                <option value="ADMIN">مدير النظام</option>
                <option value="SCHOOL_USER">مستخدم مدرسة</option>
                <option value="ANALAYZER_USER">محلل بيانات</option>
              </select>
            </div>
            <div class="form-group" v-if="showSchoolSelection">
              <label class="form-label">المدارس</label>
              <div class="multi-select-container">
                <div class="selected-schools" v-if="selectedSchools.length > 0">
                  <span class="school-tag" v-for="school in selectedSchools" :key="school.id">
                    {{ school.name }}
                    <button type="button" class="remove-tag" @click="removeSchool(school.id)">
                      &times;
                    </button>
                  </span>
                </div>
                <select 
                  class="form-select" 
                  v-model="tempSchoolId"
                  @change="addSchool"
                  :disabled="isSchoolSelectDisabled"
                >
                  <option value="">اختر مدرسة</option>
                  <option 
                    v-for="school in availableSchools" 
                    :key="school.id" 
                    :value="school.id"
                    :disabled="isSchoolSelected(school.id)"
                  >
                    {{ school.name }}
                  </option>
                </select>
                <p class="hint-text" v-if="formData.role === 'SCHOOL_USER'">
                  يمكنك اختيار أكثر من مدرسة
                </p>
              </div>
            </div>
          </div>
          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal" type="button">
          إلغاء
        </button>
        <button 
          class="btn btn-primary" 
          @click="handleSubmit"
          :disabled="isLoading"
          type="button"
        >
          <span v-if="isLoading" class="button-loading">
            <span class="loading-spinner"></span>
            <span>جاري الإضافة...</span>
          </span>
          <span v-else>حفظ المستخدم</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { schoolService } from '@/api/index.js'
import { useUsersStore } from '@/stores/users.js'

const emit = defineEmits(['close', 'user-added'])
const usersStore = useUsersStore()

const formData = reactive({
  username: '',
  password: '',
  role: '',
  roleId: null,
  schoolIds: [] // ✅ توحيد التسمية هنا
})

const schools = ref([])
const tempSchoolId = ref('')
const selectedSchools = ref([])
const isLoading = ref(false)
const error = ref(null)

const showSchoolSelection = computed(() => {
  return formData.role && formData.role !== 'ADMIN' && formData.role !== 'ANALAYZER_USER'
})

const isSchoolSelectDisabled = computed(() => {
  return formData.role === 'ANALAYZER_USER' && selectedSchools.value.length >= 1
})

const availableSchools = computed(() => {
  return schools.value.filter(school => 
    !selectedSchools.value.some(selected => selected.id === school.id)
  )
})

const getRoleId = (roleName) => {
  const roles = {
    'ADMIN': 1,
    'SCHOOL_USER': 2,
    'ANALAYZER_USER': 3
  }
  return roles[roleName] || null
}

const loadSchools = async () => {
  try {
    const response = await schoolService.getAll()
    schools.value = response.data || []
  } catch (err) {
    console.error('❌ خطأ في تحميل المدارس:', err)
  }
}

const handleRoleChange = () => {
  formData.roleId = getRoleId(formData.role)
  
  // إعادة تعيين المدارس عند تغيير الدور
  if (formData.role !== 'SCHOOL_USER') {
    selectedSchools.value = []
    formData.schoolIds = []
  }
}

const addSchool = () => {
  if (!tempSchoolId.value) return
  
  const school = schools.value.find(s => s.id == tempSchoolId.value)
  if (school && !isSchoolSelected(school.id)) {
    selectedSchools.value.push(school)
    formData.schoolIds.push(school.id)
    tempSchoolId.value = ''
  }
}

const removeSchool = (schoolId) => {
  selectedSchools.value = selectedSchools.value.filter(s => s.id !== schoolId)
  formData.schoolIds = formData.schoolIds.filter(id => id !== schoolId)
}

const isSchoolSelected = (schoolId) => {
  return selectedSchools.value.some(s => s.id == schoolId)
}

const validateForm = () => {
  error.value = null
  if (!formData.username.trim()) { error.value = 'اسم المستخدم مطلوب'; return false } 
  if (!formData.password) { error.value = 'كلمة المرور مطلوبة'; return false }
  if (!formData.role) { error.value = 'الدور مطلوب'; return false }
  if (!formData.roleId) { error.value = 'حدث خطأ في تحديد نوع الدور'; return false }
  
  if (formData.role === 'SCHOOL_USER' && formData.schoolIds.length === 0) {
    error.value = 'يجب اختيار مدرسة واحدة على الأقل لمستخدم المدرسة'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  error.value = ''

  try {
    const payload = {
      username: formData.username,
      password: formData.password,
      role: formData.role,
      roleId: formData.roleId, // ✅ إرسال roleId
      schoolIds: formData.role === 'SCHOOL_USER' ? formData.schoolIds : []
    }

    await usersStore.addUser(payload)
    
    emit('user-added')
    closeModal()
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء إضافة المستخدم'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.username = ''
  formData.password = ''
  formData.role = ''
  formData.roleId = null
  formData.schoolIds = []
  selectedSchools.value = []
  tempSchoolId.value = ''
  error.value = null
}

const closeModal = () => {
  resetForm()
  emit('close')
}

onMounted(() => {
  loadSchools()
})
</script>

<style scoped>
/* (نفس التنسيقات الموجودة سابقاً) */
.multi-select-container { margin-top: 8px; }
.selected-schools { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.school-tag { display: inline-flex; align-items: center; gap: 4px; background: #D9FFFA; color: #126E70; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: 500; }
.remove-tag { background: none; border: none; color: #dc2626; cursor: pointer; font-size: 16px; padding: 0; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.remove-tag:hover { background: rgba(220, 38, 38, 0.1); }
.hint-text { font-size: 12px; color: #64748b; margin-top: 6px; margin-bottom: 0; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.3s ease; }
.modal { background: white; border-radius: 20px; width: 90%; max-width: 500px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden; animation: slideUp 0.3s ease; }
.modal-header { padding: 24px; background: linear-gradient(90deg, #52B5AB, #126E70); color: white; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 20px; font-weight: 600; margin: 0; }
.close-modal { background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease; }
.close-modal:hover { transform: rotate(90deg); }
.modal-body { padding: 32px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-group { margin-bottom: 0; }
.form-label { display: block; margin-bottom: 8px; font-weight: 600; color: #475569; font-size: 14px; }
.form-input, .form-select { width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; transition: all 0.3s ease; background: white; }
.form-input:focus, .form-select:focus { outline: none; border-color: #52B5AB; box-shadow: 0 0 0 3px rgba(82, 181, 171, 0.1); }
.error-message { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: linear-gradient(135deg, #fee2e2, #fecaca); border: 1px solid #fca5a5; border-radius: 12px; color: #dc2626; font-size: 0.875rem; font-weight: 500; margin-top: 1rem; }
.error-icon { font-size: 1.125rem; }
.modal-footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; }
.btn { padding: 10px 20px; border-radius: 12px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; }
.btn-primary { background: linear-gradient(135deg, #52B5AB, #126E70); color: white; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(82, 181, 171, 0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }
.button-loading { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
.loading-spinner { width: 1.25rem; height: 1.25rem; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) { .modal { width: 95%; margin: 20px; } .modal-body { padding: 20px; } .form-row { grid-template-columns: 1fr; } }
</style>  