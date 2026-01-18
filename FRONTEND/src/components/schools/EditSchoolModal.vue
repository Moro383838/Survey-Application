<template>
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>تعديل المدرسة</h3>
          <button class="close-modal" @click="emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="edit-form">
            <div v-if="error" class="error-message">
              <span class="error-icon">❌</span>
              <span>{{ error }}</span>
            </div>
            <div class="form-group">
              <label for="name">
                <span class="required">*</span>
                اسم المدرسة
              </label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                placeholder="أدخل اسم المدرسة"
                required
                :disabled="isLoading"
              >
              <div v-if="errors.name" class="field-error">
                {{ errors.name }}
              </div>
            </div>
            <div class="form-group">
              <label for="code">
                <span class="required">*</span>
                الرمز الوزاري
              </label>
              <input
                type="text"
                id="code"
                v-model="formData.code"
                placeholder="أدخل الرمز الوزاري"
                required
                :disabled="isLoading"
              >
              <div v-if="errors.code" class="field-error">
                {{ errors.code }}
              </div>
            </div>
            <div class="form-group">
              <label for="region">
                <span class="required">*</span>
                المنطقة
              </label>
              <input
                type="text"
                id="region"
                v-model="formData.region"
                placeholder="أدخل المنطقة"
                required
                :disabled="isLoading"
              >
              <div v-if="errors.region" class="field-error">
                {{ errors.region }}
              </div>
            </div>
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">تاريخ الإنشاء:</span>
                <span class="info-value">{{ formatDate(school.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">عدد الموظفين:</span>
                <span class="info-value">{{ school.users_count || 0 }}</span>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button 
            class="btn btn-secondary" 
            @click="emit('close')" 
            :disabled="isLoading"
          >
            إلغاء
          </button>
          <button 
            class="btn btn-primary" 
            @click="handleSubmit"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="button-loading">
              <span class="loading-spinner"></span>
              <span>جاري الحفظ...</span>
            </span>
            <span v-else>💾 حفظ التعديلات</span>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive,  watch } from 'vue'
  import { schoolService } from '@/api/index.js'
  
  const props = defineProps({
  school: {
    type: Object,
    required: false,
    default: null
  }
})

  
  const emit = defineEmits(['close', 'school-updated'])
  
  const isLoading = ref(false)
  const error = ref('')
  const errors = reactive({})
  
  const formData = reactive({
    name: '',
    code: '',
    region: ''
  })
  
  watch(() => props.school, (newSchool) => {
  if (newSchool) {
    formData.name = newSchool.name || ''
    formData.code = newSchool.code || ''
    formData.region = newSchool.region || ''
  }
}, { immediate: true })

  
  const validateForm = () => {
    errors.name = ''
    errors.code = ''
    errors.region = ''
    
    let isValid = true
  
    if (!formData.name.trim()) {
      errors.name = 'اسم المدرسة مطلوب'
      isValid = false
    }
  
    if (!formData.code.trim()) {
      errors.code = 'الرمز الوزاري مطلوب'
      isValid = false
    }
  
    if (!formData.region.trim()) {
      errors.region = 'المنطقة مطلوبة'
      isValid = false
    }
  
    return isValid
  }
  const handleSubmit = async () => {
    console.log('📝 بدء عملية التعديل للمدرسة:', props.school.id)
    
    if (!validateForm()) {
      error.value = 'يرجى تعبئة جميع الحقول المطلوبة'
      return
    }
  
    isLoading.value = true
    error.value = ''
    
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        region: formData.region.trim()
      }
      
      console.log('🔄 جاري تحديث المدرسة:', {
        id: props.school.id,
        payload
      })
      
      const response = await schoolService.update(props.school.id, payload)
      
      console.log('✅ تم تحديث المدرسة بنجاح:', response.data)
      emit('school-updated', response.data)
      emit('close')
      
    } catch (err) {
      error.value = err.response?.data?.message || 
                    err.response?.data?.error || 
                    'حدث خطأ أثناء تعديل المدرسة'
      
      console.error('❌ خطأ في تعديل المدرسة:', {
        error: err,
        response: err.response?.data,
        schoolId: props.school.id
      })
      if (err.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach(key => {
          if (errors.hasOwnProperty(key)) {
            errors[key] = err.response.data.errors[key][0]
          }
        })
      }
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
  background: linear-gradient(135deg, #054239, #005f57);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #b9a779;
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
  
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-group label {
    color: #374151;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .required {
    color: #dc2626;
    font-size: 18px;
  }
  
  .form-group input {
    padding: 12px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.3s ease;
    background: white;
  }
  
  .form-group input:focus {
  outline: none;
  border-color: #b9a779;
  box-shadow: 0 0 0 4px rgba(185, 167, 121, 0.2);
}
  
  .form-group input:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .field-error {
    color: #dc2626;
    font-size: 13px;
    margin-top: 4px;
  }
  .info-section {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    margin-top: 10px;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .info-item:last-child {
    border-bottom: none;
  }
  
  .info-label {
    color: #6b7280;
    font-weight: 500;
    font-size: 14px;
  }
  
  .info-value {
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
    margin-bottom: 1rem;
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
  
  .btn-primary {
  background: linear-gradient(135deg, #054239, #001a18);
  color: #b9a779;
  border: 1px solid #b9a779;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #b9a779, #d4c4a0);
  color: #054239;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(185, 167, 121, 0.3);
}
  
  .btn-primary:disabled {
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
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
      justify-content: center;
    }
    
    .info-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
  </style>