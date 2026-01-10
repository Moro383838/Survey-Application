<template>
    <div class="question-card">
      <div class="question-header">
        <span class="question-type-icon">🔢</span>
        <h3 class="question-type-title">رقم</h3>
      </div>
      
      <div class="question-content">
        <!-- نص السؤال -->
        <div class="question-text-section">
          <label class="section-label">نص السؤال</label>
          <div class="question-text-display">
            {{ question.text || 'أدخل نص السؤال' }}
          </div>
        </div>
        
        <!-- معاينة إدخال الرقم -->
        <div class="number-preview">
          <input 
            type="number" 
            :placeholder="question.placeholder || 'أدخل رقم...'"
            :min="question.minValue"
            :max="question.maxValue"
            class="number-input"
            disabled
          />
          
          <div v-if="question.minValue || question.maxValue" class="range-hint">
            <span v-if="question.minValue">الحد الأدنى: {{ question.minValue }}</span>
            <span v-if="question.maxValue">الحد الأقصى: {{ question.maxValue }}</span>
          </div>
        </div>
        
        <!-- الإعدادات -->
        <div class="settings-section">
          <label class="section-label">الإعدادات</label>
          <div class="settings-list">
            <div class="setting-item">
              <span class="setting-label">النطاق</span>
              <span class="setting-value">
                {{ question.minValue || 'لا يوجد' }} - {{ question.maxValue || 'لا يوجد' }}
              </span>
            </div>
            
            <div v-if="question.required" class="setting-item">
              <div class="setting-checkbox">
                <div class="checkbox-indicator">✓</div>
                <span>هذا السؤال إلزامي</span>
              </div>
            </div>
            
            <div class="setting-item">
              <span class="setting-label">الوحدة</span>
              <span class="setting-value">
                {{ question.unit || 'لا توجد وحدة' }}
              </span>
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
  defineProps({
    question: {
      type: Object,
      default: () => ({
        text: '',
        placeholder: 'أدخل رقم...',
        minValue: null,
        maxValue: null,
        unit: '',
        required: true
      })
    }
  })
  
  defineEmits(['cancel', 'save'])
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
  
  .number-preview {
    margin-bottom: 24px;
  }
  
  .number-input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 15px;
    background: #f8f9fa;
    color: #666;
  }
  
  .range-hint {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    color: #666;
    font-size: 13px;
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
  </style>