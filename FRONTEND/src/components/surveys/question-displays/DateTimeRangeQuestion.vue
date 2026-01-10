<template>
    <div class="question-card">
      <div class="question-header">
        <span class="question-type-icon">🗓️</span>
        <h3 class="question-type-title">مجال تاريخ ووقت</h3>
      </div>
      
      <div class="question-content">
        <!-- نص السؤال -->
        <div class="question-text-section">
          <label class="section-label">نص السؤال</label>
          <div class="question-text-display">
            {{ question.text || 'أدخل نص السؤال' }}
          </div>
        </div>
        
        <!-- إدخال مجال التاريخ والوقت للمرتبط -->
        <div class="datetimerange-input">
          <div class="range-inputs">
            <div class="range-from">
              <label>من:</label>
              <div class="datetime-inputs">
                <input 
                  type="date" 
                  class="date-input" 
                  v-model="startDate"
                  :min="question.minDate"
                  :max="endDate || question.maxDate"
                  :required="question.required"
                  @change="validateRange"
                />
                <input 
                  type="time" 
                  class="time-input" 
                  v-model="startTime"
                  :required="question.required"
                  @change="validateRange"
                />
              </div>
            </div>
            <div class="range-to">
              <label>إلى:</label>
              <div class="datetime-inputs">
                <input 
                  type="date" 
                  class="date-input" 
                  v-model="endDate"
                  :min="startDate || question.minDate"
                  :max="question.maxDate"
                  :required="question.required"
                  @change="validateRange"
                />
                <input 
                  type="time" 
                  class="time-input" 
                  v-model="endTime"
                  :required="question.required"
                  @change="validateRange"
                />
              </div>
            </div>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
        
        <!-- الإعدادات -->
        <div class="settings-section">
          <label class="section-label">الإعدادات</label>
          <div class="settings-list">
            <div class="setting-item">
              <span class="setting-label">تنسيق التاريخ</span>
              <span class="setting-value">
                {{ question.dateFormat || 'YYYY-MM-DD' }}
              </span>
            </div>
            
            <div class="setting-item">
              <span class="setting-label">تنسيق الوقت</span>
              <span class="setting-value">
                {{ question.timeFormat || '24 ساعة' }}
              </span>
            </div>
            
            <div class="setting-item">
              <span class="setting-label">الحد الأدنى للمدة</span>
              <span class="setting-value">
                {{ question.minDuration || 'لا يوجد' }}
              </span>
            </div>
            
            <div class="setting-item">
              <span class="setting-label">الحد الأقصى للمدة</span>
              <span class="setting-value">
                {{ question.maxDuration || 'لا يوجد' }}
              </span>
            </div>
            
            <div v-if="question.required" class="setting-item">
              <div class="setting-checkbox">
                <div class="checkbox-indicator">✓</div>
                <span>هذا السؤال إلزامي</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="question-footer">
        <button class="btn btn-secondary" @click="$emit('cancel')">
          إلغاء
        </button>
        <button class="btn btn-primary" @click="$emit('save')">
          حفظ
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    question: {
      type: Object,
      default: () => ({
        text: '',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24 ساعة',
        minDate: null,
        maxDate: null,
        minDuration: null,
        maxDuration: null,
        required: true
      })
    },
    modelValue: {
      type: Object,
      default: () => ({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      })
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'cancel', 'save'])
  
  // Reactive data
  const startDate = ref(props.modelValue?.startDate || '')
  const startTime = ref(props.modelValue?.startTime || '')
  const endDate = ref(props.modelValue?.endDate || '')
  const endTime = ref(props.modelValue?.endTime || '')
  const errorMessage = ref('')
  
  // Watch for modelValue changes
  watch(() => props.modelValue, (newVal) => {
    if (newVal) {
      startDate.value = newVal.startDate || ''
      startTime.value = newVal.startTime || ''
      endDate.value = newVal.endDate || ''
      endTime.value = newVal.endTime || ''
    }
  }, { deep: true })
  
  // Watch for local changes and emit updates
  watch([startDate, startTime, endDate, endTime], () => {
    emit('update:modelValue', {
      startDate: startDate.value,
      startTime: startTime.value,
      endDate: endDate.value,
      endTime: endTime.value
    })
    validateRange()
  })
  
  // Validation function
  const validateRange = () => {
    errorMessage.value = ''
    
    if (!startDate.value && !endDate.value && !startTime.value && !endTime.value) return
    
    if (props.question.required && (!startDate.value || !endDate.value || !startTime.value || !endTime.value)) {
      errorMessage.value = 'يرجى ملء جميع الحقول'
      return
    }
    
    if (startDate.value && endDate.value && startTime.value && endTime.value) {
      const startDateTime = new Date(`${startDate.value}T${startTime.value}`)
      const endDateTime = new Date(`${endDate.value}T${endTime.value}`)
      
      if (startDateTime > endDateTime) {
        errorMessage.value = 'وقت البدء يجب أن يكون قبل وقت الانتهاء'
        return
      }
      
      // Check min/max duration if specified
      if (props.question.minDuration || props.question.maxDuration) {
        const diffMs = endDateTime - startDateTime
        const diffHours = diffMs / (1000 * 60 * 60)
        
        if (props.question.minDuration && diffHours < props.question.minDuration) {
          errorMessage.value = `المدة الدنيا هي ${props.question.minDuration} ساعات`
          return
        }
        
        if (props.question.maxDuration && diffHours > props.question.maxDuration) {
          errorMessage.value = `المدة القصوى هي ${props.question.maxDuration} ساعات`
          return
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .question-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .question-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .question-type-icon {
    font-size: 24px;
  }
  
  .question-type-title {
    color: #333;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
  
  .question-content {
    margin: 24px 0;
  }
  
  .section-label {
    display: block;
    color: #666;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  
  .question-text-display {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 16px;
    font-size: 16px;
    min-height: 60px;
    margin-bottom: 24px;
    color: #333;
  }
  
  .datetimerange-preview {
    margin-bottom: 24px;
  }
  
  .range-inputs {
    display: flex;
    gap: 16px;
  }
  
  .range-from, .range-to {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .range-from label, .range-to label {
    color: #666;
    font-size: 14px;
    font-weight: 600;
  }
  
  .datetime-inputs {
    display: flex;
    gap: 8px;
  }
  
  .date-input, .time-input {
    flex: 1;
    padding: 14px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 15px;
    background: white;
    color: #333;
    font-family: inherit;
    transition: all 0.2s ease;
  }
  
  .date-input:focus, .time-input:focus {
    border-color: #428177;
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 129, 119, 0.1);
  }
  
  .date-input:invalid, .time-input:invalid {
    border-color: #ef4444;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 14px;
    margin-top: 8px;
    padding: 8px;
    background: #fee2e2;
    border-radius: 4px;
    border: 1px solid #fecaca;
  }
  
  .settings-list {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 16px;
  }
  
  .setting-item {
    padding: 12px 0;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .setting-item:last-child {
    border-bottom: none;
  }
  
  .setting-label {
    color: #666;
    font-weight: 600;
    margin-right: 8px;
  }
  
  .setting-value {
    color: #333;
  }
  
  .setting-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .checkbox-indicator {
    width: 18px;
    height: 18px;
    background: #428177;
    color: white;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
  
  .question-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 2px solid #f0f0f0;
  }
  
  .btn {
    padding: 10px 24px;
    border-radius: 6px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    font-size: 14px;
    min-width: 100px;
  }
  
  .btn-secondary {
    background: #f0f0f0;
    color: #666;
  }
  
  .btn-secondary:hover {
    background: #e0e0e0;
  }
  
  .btn-primary {
    background: #428177;
    color: white;
  }
  
  .btn-primary:hover {
    background: #054239;
  }
  
  @media (max-width: 768px) {
    .range-inputs {
      flex-direction: column;
    }
    
    .datetime-inputs {
      flex-direction: column;
    }
  }
  </style>