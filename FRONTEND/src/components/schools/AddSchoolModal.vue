<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">🏫</div>
          <h3>إضافة مدرسة جديدة</h3>
        </div>
        <button class="close-modal" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-body custom-scrollbar">
        
        <form @submit.prevent="handleSubmit" class="add-form">
          <div v-if="error" class="error-banner">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="name">
                اسم المدرسة <span class="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                placeholder="مثال: ثانوية الأمل"
                required
                :disabled="isLoading"
                class="form-input"
              >
            </div>
            
            <div class="form-group">
              <label for="code">
                الرمز الوزاري <span class="required">*</span>
              </label>
              <input
                type="text"
                id="code"
                v-model="formData.code"
                placeholder="مثال: 12345"
                required
                :disabled="isLoading"
                class="form-input"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="region">
                المنطقة <span class="required">*</span>
              </label>
              <input
                type="text"
                id="region"
                v-model="formData.region"
                placeholder="مثال: الرياض"
                required
                :disabled="isLoading"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="directorate">المديرية</label>
              <div class="select-wrapper">
                <select
                  id="directorate"
                  v-model="formData.directorateId"
                  @change="onDirectorateChange"
                  :disabled="isLoading || loadingResources"
                  class="form-select"
                >
                  <option value="" disabled selected>اختر المديرية</option>
                  <option 
                    v-for="dir in store.directorates" 
                    :key="dir.id" 
                    :value="dir.id"
                  >
                    {{ dir.name }}
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="complex">المجمع</label>
              <div class="select-wrapper">
                <select
                  id="complex"
                  v-model="formData.complexId"
                  :disabled="!formData.directorateId || isLoading || loadingComplexes"
                  class="form-select"
                >
                  <option value="" disabled selected>
                    {{ loadingComplexes ? 'جاري التحميل...' : 'اختر المجمع' }}
                  </option>
                  <option 
                    v-for="comp in store.complexes" 
                    :key="comp.id" 
                    :value="comp.id"
                  >
                    {{ comp.name }}
                  </option>
                </select>
                <span class="select-arrow">▼</span>
              </div>
            </div>
          </div>

        </form>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')" type="button">
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
            جاري الإضافة...
          </span>
          <span v-else>حفظ المدرسة</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSchoolsStore } from '@/stores/schools'

const emit = defineEmits(['close', 'school-added'])
const store = useSchoolsStore()

const isLoading = ref(false)
const loadingResources = ref(false)
const loadingComplexes = ref(false)
const error = ref(null)

const formData = reactive({
  name: '',
  code: '',
  region: '',
  directorateId: '',
  complexId: ''
})

// تحميل المديريات عند فتح المودال
onMounted(async () => {
  loadingResources.value = true
  try {
    await store.fetchDirectorates()
  } catch (err) {
    console.error('فشل تحميل المديريات:', err)
  } finally {
    loadingResources.value = false
  }
})

// عند تغيير المديرية، نحمل المجمعات
const onDirectorateChange = async () => {
  formData.complexId = '' // تصفير المجمع المختار
  if (!formData.directorateId) return

  loadingComplexes.value = true
  try {
    await store.fetchComplexes(formData.directorateId)
  } catch (err) {
    console.error('فشل تحميل المجمعات:', err)
  } finally {
    loadingComplexes.value = false
  }
}

const handleSubmit = async () => {
  // تحقق بسيط
  if (!formData.name || !formData.code || !formData.region) {
    error.value = 'يرجى تعبئة جميع الحقول المطلوبة (*)'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // تجهيز البيانات للإرسال
    const payload = {
      name: formData.name,
      code: formData.code,
      region: formData.region,
      // نرسل الـ IDs إذا تم اختيارهم
      directorateId: formData.directorateId || null,
      complexId: formData.complexId || null
    }

    await store.addSchool(payload)
    
    emit('school-added')
    emit('close')
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'حدث خطأ أثناء إضافة المدرسة'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* --- الخلفية والمودال (التعديل الأساسي هنا) --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 38, 35, 0.85); /* تعتيم الخلفية */
  display: flex;
  justify-content: center;
  align-items: center; /* توسيط عمودي وأفقي */
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
  padding: 20px;
  direction: rtl;
}

.modal {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 650px; /* عرض متوسط ومناسب */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  /* الأنيميشن الجديد: ظهور وتكبير */
  animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- الرأس --- */
.modal-header {
  padding: 24px 30px;
  background: linear-gradient(135deg, #002623, #001a18);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #b9a779;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(185, 167, 121, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border: 1px solid rgba(185, 167, 121, 0.2);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #b9a779;
}

.close-modal {
  background: rgba(185, 167, 121, 0.1);
  border: none;
  color: #b9a779;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
}

.close-modal:hover {
  background: rgba(185, 167, 121, 0.2);
  transform: rotate(90deg);
  color: white;
}

/* --- الجسم --- */
.modal-body {
  padding: 32px;
  overflow-y: auto;
  background: #f8fafc;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.required {
  color: #ef4444;
}

/* تحسين حقول الإدخال */
.form-input, .form-select {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
  background: white;
  width: 100%;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #b9a779;
  box-shadow: 0 0 0 4px rgba(185, 167, 121, 0.2);
}

.form-input:disabled, .form-select:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.7;
}

/* تنسيق القائمة المنسدلة */
.select-wrapper {
  position: relative;
}

.form-select {
  appearance: none; /* إخفاء السهم الافتراضي */
  padding-left: 30px;
}

.select-arrow {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 10px;
  color: #64748b;
}

/* --- رسائل الخطأ --- */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
}

.error-icon {
  font-size: 18px;
}

/* --- التذييل --- */
.modal-footer {
  padding: 24px 32px;
  background: white;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-secondary:hover { background: #e2e8f0; color: #1e293b; }

.btn-primary {
  background: linear-gradient(135deg, #002623, #001a18);
  color: #b9a779;
  border: 1px solid #b9a779;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #b9a779, #d4c4a0);
  color: #002623;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(185, 167, 121, 0.3);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* --- الحركات (Animations) --- */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* --- تجاوب الشاشات --- */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
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