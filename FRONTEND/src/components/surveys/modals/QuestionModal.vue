<template>
  <Teleport to="body">
  <div class="modal-overlay question-modal-overlay" @click.self="$emit('close')">
    <div class="question-modal">
      <div class="modal-header">
        <h3>{{ isEditing ? 'تعديل السؤال' : 'إضافة سؤال جديد' }}</h3>
        <button class="close-btn" @click="$emit('close')">✖️</button>
      </div>
      
      <div class="modal-body">
        <div class="question-editor">
          <!-- معاينة السؤال -->
          <div class="question-preview">
            <div class="preview-header">
              <span class="preview-badge">معاينة</span>
              <span class="question-type-label">{{ selectedQuestionType?.name || questionType.name }}</span>
            </div>
            <div class="preview-content">
              <div class="preview-question-text">
                {{ localQuestion.text || 'نص السؤال سيظهر هنا...' }}
              </div>
              
              <!-- معاينة الأنواع المختلفة -->
              <div v-if="showTextInput" class="preview-field">
                <input
                  type="text"
                  :placeholder="localQuestion.placeholder || 'اكتب إجابتك هنا...'"
                  class="preview-input"
                  disabled
                />
              </div>
              
              <div v-if="showTextArea" class="preview-field">
                <textarea
                  :placeholder="localQuestion.placeholder || 'اكتب إجابتك هنا...'"
                  class="preview-textarea"
                  rows="3"
                  disabled
                ></textarea>
              </div>
              
              <div v-if="showOptions" class="preview-field">
                <div class="options-preview">
                  <div 
                    v-for="(option, index) in localQuestion.options" 
                    :key="index"
                    class="option-preview-item"
                  >
                    <input
                      :type="localQuestion.selectionType === 'multiple' ? 'checkbox' : 'radio'"
                      :name="'preview-option-' + questionType.id"
                      :id="'option-' + index"
                      disabled
                    />
                    <label :for="'option-' + index">
                      {{ option.text || `الخيار ${index + 1}` }}
                    </label>
                  </div>
                  <div v-if="localQuestion.hasOtherOption" class="option-preview-item other-option">
                    <input
                      :type="localQuestion.selectionType === 'multiple' ? 'checkbox' : 'radio'"
                      :name="'preview-option-' + questionType.id"
                      id="other-option"
                      disabled
                    />
                    <label for="other-option">
                      <input type="text" placeholder="أخرى..." class="other-input" disabled />
                    </label>
                  </div>
                </div>
              </div>
              
              <div v-if="showNumberInput" class="preview-field">
                <input
                  type="number"
                  :placeholder="localQuestion.placeholder || 'أدخل رقم...'"
                  :min="localQuestion.minValue"
                  :max="localQuestion.maxValue"
                  class="preview-number-input"
                  disabled
                />
                <div v-if="localQuestion.minValue || localQuestion.maxValue" class="range-hint">
                  <span v-if="localQuestion.minValue">الحد الأدنى: {{ localQuestion.minValue }}</span>
                  <span v-if="localQuestion.maxValue">الحد الأقصى: {{ localQuestion.maxValue }}</span>
                </div>
              </div>
              
              <div v-if="showDateInput" class="preview-field">
                <div v-if="showRangeInput" class="date-range-preview">
                  <div class="range-from">
                    <label>من:</label>
                    <input type="date" class="preview-date-input" disabled />
                  </div>
                  <div class="range-to">
                    <label>إلى:</label>
                    <input type="date" class="preview-date-input" disabled />
                  </div>
                </div>
                <div v-else>
                  <input type="date" class="preview-date-input" disabled />
                </div>
              </div>
              
              <div v-if="showTimeInput" class="preview-field">
                <div v-if="showRangeInput" class="time-range-preview">
                  <div class="range-from">
                    <label>من:</label>
                    <input type="time" class="preview-time-input" disabled />
                  </div>
                  <div class="range-to">
                    <label>إلى:</label>
                    <input type="time" class="preview-time-input" disabled />
                  </div>
                </div>
                <div v-else>
                  <input type="time" class="preview-time-input" disabled />
                </div>
              </div>
              
              <div v-if="showRating" class="preview-field">
                <div class="rating-preview">
                  <div class="rating-scale">
                    <span class="min-label">{{ localQuestion.scale?.minLabel || 'ضعيف' }}</span>
                    <div class="rating-stars">
                      <span 
                        v-for="i in (localQuestion.scale?.max || 5)" 
                        :key="i"
                        class="star"
                        :class="{ 'filled': i <= (localQuestion.scale?.selected || 3) }"
                      >
                        ★
                      </span>
                    </div>
                    <span class="max-label">{{ localQuestion.scale?.maxLabel || 'ممتاز' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- إعدادات السؤال -->
          <div class="question-settings">
            <!-- نص السؤال -->
            <div class="form-group">
              <label for="questionText" class="form-label">
                <span class="required">*</span>
                نص السؤال
              </label>
              <textarea
                id="questionText"
                v-model="localQuestion.text"
                placeholder="أدخل نص السؤال هنا..."
                rows="4"
                required
                class="large-textarea"
                @input="autoResize"
              ></textarea>
              <div class="char-count">
                <span>{{ localQuestion.text?.length || 0 }}</span> / 500 حرف
              </div>
            </div>

            <div class="form-group">
              <label for="questionHint" class="form-label">
                نص التوضيح (اختياري)
              </label>
              <input
                id="questionHint"
                type="text"
                v-model="localQuestion.hint"
                placeholder="نص توضيحي يظهر أسفل السؤال..."
                class="form-input"
              />
            </div>
            
            <!-- الخيارات لأنواع الاختيار -->
            <div v-if="showOptions" class="form-group options-section">
              <label class="form-label">
                <span class="required">*</span>
                خيارات الإجابة
              </label>
              <div class="options-container">
                <div 
                  v-for="(option, index) in localQuestion.options" 
                  :key="index"
                  class="option-item"
                >
                  <div class="option-number">{{ index + 1 }}</div>
                  <input
                    type="text"
                    v-model="option.text"
                    :placeholder="`الخيار ${index + 1}`"
                    class="option-input large-input"
                    @keyup.enter="addOption"
                  />
                  <button 
                    v-if="localQuestion.options.length > 2"
                    class="remove-option-btn"
                    @click="removeOption(index)"
                    type="button"
                  >
                    <span class="remove-icon">🗑️</span>
                  </button>
                </div>
                <button class="add-option-btn" @click="addOption" type="button">
                  <span class="add-icon">➕</span>
                  إضافة خيار جديد
                </button>
              </div>
            </div>
            
            <!-- إعدادات النطاق للأرقام -->
            <div v-if="showNumberInput" class="form-group range-settings">
              <label class="form-label">نطاق الرقم (اختياري)</label>
              <div class="range-inputs">
                <div class="range-input-group">
                  <input
                    type="number"
                    v-model="localQuestion.minValue"
                    placeholder="الحد الأدنى"
                    class="range-input"
                  />
                  <span class="range-label">الحد الأدنى</span>
                </div>
                <div class="range-input-group">
                  <input
                    type="number"
                    v-model="localQuestion.maxValue"
                    placeholder="الحد الأقصى"
                    class="range-input"
                  />
                  <span class="range-label">الحد الأقصى</span>
                </div>
              </div>
            </div>
            
            <!-- إعدادات المقياس للتقييم -->
            <div v-if="showRating" class="form-group rating-settings">
              <label class="form-label">إعدادات المقياس</label>
              <div class="rating-controls">
                <div class="scale-range">
                  <label>النطاق:</label>
                  <select v-model="localQuestion.scale.max" class="scale-select">
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="7">7</option>
                    <option value="10">10</option>
                  </select>
                </div>
                <div class="scale-labels">
                  <input
                    type="text"
                    v-model="localQuestion.scale.minLabel"
                    placeholder="تسمية البداية"
                    class="scale-label-input"
                  />
                  <input
                    type="text"
                    v-model="localQuestion.scale.maxLabel"
                    placeholder="تسمية النهاية"
                    class="scale-label-input"
                  />
                </div>
              </div>
            </div>
            
            <!-- الإعدادات العامة -->
            <div class="settings-section">
              <h4 class="settings-title">إعدادات السؤال</h4>
              <div class="settings-grid">
                <div class="setting-item">
                  <label class="checkbox-label large-checkbox">
                    <input 
                      type="checkbox" 
                      v-model="localQuestion.required" 
                      class="checkbox-input"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-text">هذا السؤال إلزامي</span>
                  </label>
                </div>
                
                <div v-if="showOtherOption" class="setting-item">
                  <label class="checkbox-label large-checkbox">
                    <input 
                      type="checkbox" 
                      v-model="localQuestion.hasOtherOption" 
                      class="checkbox-input"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-text">إضافة خيار "أخرى"</span>
                  </label>
                </div>
                
                <div v-if="showSelectionType" class="setting-item">
                  <label class="form-label">نوع الاختيار</label>
                  <select v-model="localQuestion.selectionType" class="selection-type-select large-select">
                    <option value="single">اختيار مفرد (يمكن اختيار واحد فقط)</option>
                    <option value="multiple">اختيار متعدد (يمكن اختيار أكثر من خيار)</option>
                  </select>
                </div>
                
                <div v-if="showTextInput || showTextArea" class="setting-item">
                  <label class="form-label">نص النص التوضيحي</label>
                  <input
                    type="text"
                    v-model="localQuestion.placeholder"
                    placeholder="اكتب النص التوضيحي الذي يظهر في حقل الإدخال..."
                    class="form-input large-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          إلغاء
        </button>
        <button class="btn btn-primary" @click="saveQuestion" :disabled="!isValid">
          {{ isEditing ? 'تحديث السؤال' : 'إضافة السؤال' }}
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  questionType: {
    type: Object,
    required: true
  },
  questionData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'close'])

const isEditing = computed(() => !!props.questionData)

// تهيئة بيانات السؤال
const localQuestion = ref({
  text: '',
  type_id: props.questionType?.id,
  type_label: props.questionType?.name || '',
  required: true,
  hint: '',
  placeholder: '',
  options: [{ text: '' }, { text: '' }],
  hasOtherOption: false,
  selectionType: 'single',
  minValue: null,
  maxValue: null,
  scale: {
    min: 1,
    max: 5,
    minLabel: 'ضعيف',
    maxLabel: 'ممتاز',
    selected: 3
  }
})

// تحديد الأنواع المختلفة
const showTextInput = computed(() => props.questionType?.id === 1)
const showTextArea = computed(() => props.questionType?.id === 2)
const showOptions = computed(() => [3, 4].includes(props.questionType?.id))
const showNumberInput = computed(() => props.questionType?.id === 5)
const showDateInput = computed(() => [6, 8].includes(props.questionType?.id))
const showTimeInput = computed(() => [7, 9].includes(props.questionType?.id))
const showRangeInput = computed(() => [8, 9].includes(props.questionType?.id))
const showRating = computed(() => props.questionType?.id === 10) // إذا كان لديك نوع تقييم

const showOtherOption = computed(() => showOptions.value)
const showSelectionType = computed(() => props.questionType?.id === 4)

// التحقق من صحة النموذج
const isValid = computed(() => {
  if (!localQuestion.value.text?.trim()) return false
  
  if (showOptions.value) {
    const hasValidOptions = localQuestion.value.options.some(opt => opt.text?.trim())
    if (!hasValidOptions) return false
  }
  
  return true
})

// تحميل بيانات السؤال إذا كان في وضع التعديل
watch(() => props.questionData, (newData) => {
  if (newData) {
    localQuestion.value = { ...localQuestion.value, ...newData }
    if (showOptions.value && (!localQuestion.value.options || localQuestion.value.options.length === 0)) {
      localQuestion.value.options = [{ text: '' }, { text: '' }]
    }
  }
}, { immediate: true })

// الطرق
const addOption = () => {
  localQuestion.value.options.push({ text: '' })
}

const removeOption = (index) => {
  if (localQuestion.value.options.length > 2) {
    localQuestion.value.options.splice(index, 1)
  }
}

const autoResize = (event) => {
  const textarea = event.target
  textarea.style.height = 'auto'
  textarea.style.height = (textarea.scrollHeight) + 'px'
}

const saveQuestion = () => {
  if (!isValid.value) return
  
  // تنظيف الخيارات الفارغة
  if (showOptions.value) {
    localQuestion.value.options = localQuestion.value.options.filter(opt => opt.text?.trim())
  }
  
  emit('save', { ...localQuestion.value })
}
</script>

<style scoped>
.question-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 66, 57, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* 🔥 التغيير هنا: اجعل الرقم كبيراً جداً ليظهر فوق كل شيء */
  z-index: 9999 !important; 
  
  backdrop-filter: blur(5px);
  direction: rtl;
}

.question-modal {
  z-index: 10000 !important;
  background: white;
  border-radius: 24px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(5, 66, 57, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-header {
  padding: 24px 32px;
  background: var(--gradient-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--primary-gold);
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-header h3 {
  color: #b9a779;
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.close-btn {
  background: rgba(185, 167, 121, 0.1);
  border: 1px solid rgba(185, 167, 121, 0.2);
  color: var(--primary-gold);
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(185, 167, 121, 0.2);
  transform: rotate(90deg);
  color: white;
}

.modal-body {
  padding: 0;
}

.question-editor {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
}

.question-preview {
  background: #f8fafc;
  border-radius: 20px;
  padding: 28px;
  border: 2px solid #e2e8f0;
  margin-bottom: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.preview-badge {
  background: var(--gradient-primary);
  color: var(--primary-gold);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid var(--primary-gold);
}

.question-type-label {
  color: var(--primary-dark);
  font-weight: 700;
  font-size: 16px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-question-text {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  font-size: 18px;
  line-height: 1.6;
  color: #0f172a;
  min-height: 60px;
  word-break: break-word;
}

.preview-field {
  margin-top: 16px;
}

.preview-input,
.preview-textarea,
.preview-number-input,
.preview-date-input,
.preview-time-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  color: #64748b;
}

.preview-textarea {
  resize: vertical;
  min-height: 100px;
}

.options-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

.option-preview-item.other-option {
  background: #f8fafc;
}

.other-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  margin-right: 8px;
}

.range-hint {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: #64748b;
  font-size: 14px;
}

.date-range-preview,
.time-range-preview {
  display: flex;
  gap: 20px;
}

.range-from,
.range-to {
  flex: 1;
}

.rating-preview {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.rating-scale {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.min-label,
.max-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.rating-stars {
  display: flex;
  gap: 8px;
}

.star {
  font-size: 28px;
  color: #cbd5e1;
  cursor: default;
}

.star.filled {
  color: #fbbf24;
}

.question-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  color: #0f172a;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.required {
  color: #ef4444;
  font-size: 20px;
}

.large-textarea {
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 16px;
  color: #0f172a;
  background: white;
  transition: all 0.3s ease;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.large-textarea:focus {
  outline: none;
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 4px rgba(0, 95, 87, 0.15);
}

.char-count {
  text-align: left;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.form-input {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 16px;
  color: #0f172a;
  background: white;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #428177;
  box-shadow: 0 0 0 4px rgba(66, 129, 119, 0.15);
}

.large-input {
  padding: 18px;
  font-size: 16px;
}

.options-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e2e8f0;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.option-number {
  width: 36px;
  height: 36px;
  background: var(--primary-teal);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
}

.remove-option-btn {
  background: rgba(239, 68, 68, 0.1);
  color: var(--primary-dark);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-option-btn:hover {
  background: #ef4444;
  color: white;
}

.add-option-btn {
  align-self: flex-start;
  background: rgba(66, 129, 119, 0.1);
  color: #428177;
  border: 2px solid rgba(66, 129, 119, 0.3);
  border-radius: 10px;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.add-option-btn:hover {
  background: #428177;
  color: white;
}

.range-settings {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e2e8f0;
}

.range-inputs {
  display: flex;
  gap: 20px;
}

.range-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.range-input {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
}

.range-label {
  color: #64748b;
  font-size: 14px;
  text-align: center;
}

.rating-settings {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e2e8f0;
}

.rating-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.scale-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scale-select {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: #0f172a;
}

.scale-labels {
  display: flex;
  gap: 20px;
}

.scale-label-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e2e8f0;
}

.settings-title {
  color: #0f172a;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.checkbox-label:hover {
  border-color: #428177;
  background: rgba(66, 129, 119, 0.05);
}

.large-checkbox {
  padding: 16px;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #428177;
}

.checkbox-text {
  color: #0f172a;
  font-weight: 600;
  font-size: 15px;
  flex: 1;
}

.selection-type-select {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  color: #0f172a;
  width: 100%;
}

.large-select {
  padding: 18px;
}

.selection-type-select:focus {
  outline: none;
  border-color: #428177;
}

.modal-footer {
  padding: 24px 32px;
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.btn {
  padding: 16px 32px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  min-width: 160px;
}

.btn-secondary {
  background: linear-gradient(135deg, #ffffff, #f1f5f9);
  color: #64748b;
  border: 2px solid #cbd5e1;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(100, 116, 139, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #002623, #001a18);
  color: #b9a779;
  border: 1px solid #b9a779;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #b9a779, #d4c4a0);
  color: #002623;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(185, 167, 121, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .question-modal {
    width: 98%;
    margin: 10px;
  }
  
  .question-editor {
    padding: 20px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .range-inputs {
    flex-direction: column;
  }
  
  .date-range-preview,
  .time-range-preview {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .question-preview {
    padding: 20px;
  }
  
  .preview-question-text {
    font-size: 16px;
    padding: 16px;
  }
  
  .option-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .option-number {
    align-self: flex-start;
  }
}
</style>