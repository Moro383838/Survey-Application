<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="header-right">
          <img src="/logo.png" alt="شعار الوزارة" class="ministry-logo" />
          <div class="header-text">
            <h3>إنشاء استبيان جديد</h3>
            <p>إعداد وتخصيص نموذج الاستبيان</p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        
        <div class="survey-editor">
          <div class="editor-toolbar">
            <div class="survey-title-wrapper">
              <input 
                type="text" 
                v-model="formData.title" 
                placeholder="عنوان الاستبيان غير معنون"
                class="title-input"
              />
              <span class="input-focus-border"></span>
            </div>
            
            <div class="toolbar-actions">
              <button 
                class="btn-icon-text text-danger" 
                @click="clearForm" 
                title="مسح جميع الحقول"
              >
                <span class="icon">🗑️</span>
                <span class="text">مسح</span>
              </button>
            </div>
          </div>
          
          <div class="editor-content custom-scrollbar">
            <div class="content-section details-card">
              <div class="section-header">
                <h4>📝 التفاصيل الأساسية</h4>
              </div>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>الوصف <span class="required">*</span></label>
                  <textarea 
                    v-model="formData.description" 
                    placeholder="أدخل وصفاً توضيحياً للاستبيان..." 
                    rows="2"
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label>تاريخ البدء <span class="required">*</span></label>
                  <input type="datetime-local" v-model="formData.startDate" />
                </div>
                
                <div class="form-group">
                  <label>تاريخ الانتهاء <span class="required">*</span></label>
                  <input type="datetime-local" v-model="formData.endDate" />
                </div>

                <div class="form-group checkbox-group">
                  <label class="custom-checkbox">
                    <input type="checkbox" v-model="formData.isPeriodic">
                    <span class="checkmark"></span>
                    <span class="label-text">استبيان دوري (يتكرر تلقائياً)</span>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="questions.length > 0" class="content-section questions-section">
              <div class="section-header">
                <h4>📋 الأسئلة المضافة <span class="badge">{{ questions.length }}</span></h4>
              </div>
              <div class="questions-list">
                <div v-for="(question, index) in questions" :key="index" class="question-card-item">
                  <div class="q-header">
                    <span class="q-number">#{{ index + 1 }}</span>
                    <span class="q-type">{{ question.type_label }}</span>
                    <div class="q-actions">
                      <button @click="editQuestion(index)" title="تعديل">✏️</button>
                      <button @click="removeQuestion(index)" title="حذف" class="delete">🗑️</button>
                    </div>
                  </div>
                  <div class="q-body">
                    {{ question.text }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon">👈</div>
              <p>اختر نوع السؤال من القائمة الجانبية لإضافته</p>
            </div>
          </div>
        </div>
        
        <div class="question-sidebar">
          <div class="sidebar-header">
            <h4>بنك الأسئلة</h4>
            <p>انقر لإضافة سؤال</p>
          </div>
          
          <div class="sidebar-content custom-scrollbar">
            <div 
              v-for="type in processedQuestionTypes" 
              :key="type.id"
              class="sidebar-item"
              @click="addQuestion(type)"
            >
              <div class="item-icon">{{ type.icon }}</div>
              <div class="item-info">
                <span class="item-title">{{ type.name }}</span>
                <span class="item-desc">{{ type.description }}</span>
              </div>
              <div class="item-add">+</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-left">
          <span class="status-text" v-if="error">{{ error }}</span>
        </div>
        <div class="footer-actions">
          <button class="btn btn-secondary" @click="emit('close')">إلغاء</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="isLoading">
            {{ isLoading ? 'جاري الحفظ...' : 'حفظ كمسودة' }}
          </button>
          <button class="btn btn-success" @click="handleSubmitAndPublish" :disabled="isLoading">
            نشر الاستبيان
          </button>
        </div>
      </div>
    </div>

    <QuestionModal 
      v-if="showQuestionModal"
      :question-type="selectedQuestionType"
      :question-data="editingQuestion"
      @save="saveQuestion"
      @close="closeQuestionModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSurveyStore } from '@/stores/surveys'
import { surveyService } from '@/api/index.js'
import QuestionModal from '@/components/surveys/modals/QuestionModal.vue'

const emit = defineEmits(['close', 'survey-added'])
const surveyStore = useSurveyStore()

const isLoading = ref(false)
const error = ref('')
const questions = ref([])
const showQuestionModal = ref(false)
const selectedQuestionType = ref(null)
const editingQuestionIndex = ref(-1)
const editingQuestion = ref(null)

const formData = reactive({
  title: '',
  description: '',
  isPeriodic: false,
  startDate: '',
  endDate: ''
})

// ✅ معالجة البيانات: تحويل label إلى name لضمان عمل المكونات
const processedQuestionTypes = computed(() => {
  return surveyStore.questionTypes.map(type => ({
    ...type,
    name: type.label, // هام جداً: نسخ التسمية العربية إلى خاصية name
    type_label: type.label
  }))
})

onMounted(async () => {
  if (surveyStore.questionTypes.length === 0) {
    await surveyStore.fetchQuestionTypes()
  }
})

// --- Methods ---

const addQuestion = (type) => {
  selectedQuestionType.value = type
  editingQuestionIndex.value = -1
  editingQuestion.value = null
  showQuestionModal.value = true
}

const editQuestion = (index) => {
  const question = questions.value[index]
  // البحث في القائمة المعالجة
  const type = processedQuestionTypes.value.find(t => t.id === question.type_id)
  selectedQuestionType.value = type
  
  editingQuestionIndex.value = index
  editingQuestion.value = { ...question }
  showQuestionModal.value = true
}

const removeQuestion = (index) => {
  if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
    questions.value.splice(index, 1)
  }
}

const saveQuestion = (questionData) => {
  if (editingQuestionIndex.value >= 0) {
    questions.value[editingQuestionIndex.value] = {
      ...questionData,
      id: questions.value[editingQuestionIndex.value].id || Date.now()
    }
  } else {
    questions.value.push({
      ...questionData,
      id: Date.now()
    })
  }
  closeQuestionModal()
}

const closeQuestionModal = () => {
  showQuestionModal.value = false
  selectedQuestionType.value = null
  editingQuestionIndex.value = -1
  editingQuestion.value = null
}

const clearForm = () => {
  if(confirm('هل تريد مسح جميع البيانات المدخلة؟')) {
    formData.title = ''
    formData.description = ''
    formData.isPeriodic = false
    formData.startDate = ''
    formData.endDate = ''
    questions.value = []
    error.value = ''
  }
}

const validateForm = () => {
  if (!formData.title.trim()) { error.value = 'عنوان الاستبيان مطلوب'; return false }
  if (!formData.description.trim()) { error.value = 'وصف الاستبيان مطلوب'; return false }
  if (!formData.startDate) { error.value = 'تاريخ البدء مطلوب'; return false }
  if (!formData.endDate) { error.value = 'تاريخ الانتهاء مطلوب'; return false }
  if (questions.value.length === 0) { error.value = 'يجب إضافة سؤال واحد على الأقل'; return false }
  return true
}

const handleSubmit = async (publish = false) => {
  if (!validateForm()) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    // ✅ أولاً: إنشاء الاستبيان الأساسي
    const surveyPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      isPeriodic: formData.isPeriodic,
      startDate: formData.startDate,
      endDate: formData.endDate
    }
    
    const surveyResponse = await surveyStore.createSurvey(surveyPayload)
    const surveyId = surveyResponse.surveyId || surveyResponse.id
    
    // ✅ ثانياً: إضافة الأسئلة واحدة تلو الأخرى
    if (questions.value.length > 0) {
      for (const question of questions.value) {
        // تحويل الخيارات من مصفوفة كائنات إلى مصفوفة نصوص
        const questionPayload = {
          text: question.text,
          typeId: question.type_id,
          isRequired: question.required || false,
          order: question.order || 1,
          logic: question.logic || null
        }
        
        // إضافة خاصية الخيارات فقط للأنواع التي تتطلبها (3: اختيار واحد، 4: اختيار متعدد، إلخ)
        if ([3, 4].includes(question.type_id) && question.options && question.options.length > 0) {
          // تحويل مصفوفة الكائنات [{text: "option1"}, {text: "option2"}] إلى مصفوفة نصوص ["option1", "option2"]
          questionPayload.options = question.options
            .filter(opt => opt.text && opt.text.trim())
            .map(opt => opt.text.trim())
        }
        
        await surveyService.addQuestion(surveyId, questionPayload)
      }
    }
    
    // ✅ ثالثاً: إذا كان النشر مطلوباً
    if (publish) {
      await surveyStore.publishSurvey(surveyId)
    }
    
    // ✅ رابعاً: إعادة تحميل قائمة الاستبيانات
    await surveyStore.fetchSurveys()
    
    emit('survey-added', surveyResponse)
    emit('close')
    
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء الحفظ'
  } finally {
    isLoading.value = false
  }
}

const handleSubmitAndPublish = () => handleSubmit(true)
</script>

<style scoped>
/* الأساسيات */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  backdrop-filter: blur(4px); direction: rtl;
}

.modal {
  background: #f8fafc; width: 95%; max-width: 1400px; height: 90vh;
  border-radius: 16px; display: flex; flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* 1. الرأس */
.modal-header {
  background: #054239; padding: 16px 24px; border-bottom: 1px solid #36635b;
  display: flex; justify-content: space-between; align-items: center;
  color: white;
}

.header-right { display: flex; gap: 16px; align-items: center; }
.ministry-logo { 
  height: 50px; width: auto; object-fit: contain;
}
.header-text h3 { margin: 0; font-size: 18px; font-weight: 700; color: white; }
.header-text p { margin: 0; font-size: 13px; color: #d1e7dd; }

.close-btn { background: none; border: none; font-size: 28px; color: #e2e8f0; cursor: pointer; }
.close-btn:hover { color: white; }

/* 2. الجسم (Flex Layout) */
.modal-body {
  display: flex; flex: 1; overflow: hidden; /* يمنع تمدد الصفحة */
}

/* المحرر (اليمين) */
.survey-editor {
  flex: 3; display: flex; flex-direction: column; 
  border-left: 1px solid #e2e8f0; background: white;
}

.editor-toolbar {
  padding: 16px 24px; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.survey-title-wrapper { flex: 1; margin-left: 20px; position: relative; }
.title-input {
  width: 100%; border: none; font-size: 20px; font-weight: 700; color: #1e293b;
  padding: 8px 0; outline: none; background: transparent;
}
.title-input::placeholder { color: #cbd5e1; }
.input-focus-border {
  position: absolute; bottom: 0; left: 0; width: 0; height: 2px;
  background: #428177; transition: width 0.3s;
}
.title-input:focus + .input-focus-border { width: 100%; }

.btn-icon-text {
  display: flex; align-items: center; gap: 6px; padding: 8px 12px;
  border: 1px solid transparent; border-radius: 8px; background: #fff1f2;
  color: #e11d48; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-icon-text:hover { background: #ffe4e6; }

/* محتوى المحرر (قابل للتمرير) */
.editor-content {
  flex: 1; overflow-y: auto; padding: 24px; background: #f8fafc;
}

.content-section {
  background: white; border-radius: 12px; padding: 20px;
  border: 1px solid #e2e8f0; margin-bottom: 20px;
}

.section-header { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
.section-header h4 { margin: 0; color: #334155; font-size: 16px; font-weight: 700; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.full-width { grid-column: span 2; }

.form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #475569; }
.form-group input, .form-group textarea {
  width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px;
  font-size: 14px; transition: border-color 0.2s;
}
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #428177; }

/* الشريط الجانبي (اليسار) */
.question-sidebar {
  flex: 1; min-width: 300px; max-width: 350px;
  background: white; display: flex; flex-direction: column;
}

.sidebar-header { padding: 20px; background: #054239; border-bottom: 1px solid #36635b; color: white; }
.sidebar-header h4 { margin: 0; color: white; font-size: 16px; }
.sidebar-header p { margin: 4px 0 0; color: #d1e7dd; font-size: 12px; opacity: 0.8; }

.sidebar-content {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}

/* بطاقة نوع السؤال */
.sidebar-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: white; cursor: pointer; transition: all 0.2s;
}
.sidebar-item:hover {
  border-color: #428177; transform: translateX(-4px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.item-icon { font-size: 20px; }
.item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.item-title { font-weight: 700; color: #1e293b; font-size: 14px; }
.item-desc { font-size: 11px; color: #64748b; line-height: 1.3; }
.item-add { color: #428177; font-weight: bold; font-size: 18px; }

/* 3. التذييل */
.modal-footer {
  padding: 16px 24px; background: white; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
}

.footer-actions { display: flex; gap: 12px; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; }
.btn-secondary { background: #f1f5f9; color: #475569; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-primary { background: #054239; color: white; border: none; }
.btn-primary:hover { background: #04332c; color: white; }
.btn-success { background: #10b981; color: white; }
.btn-success:hover { background: #059669; }

/* بطاقات الأسئلة المضافة */
.question-card-item {
  background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px;
  overflow: hidden;
}
.q-header {
  background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
}
.q-number { font-weight: bold; color: #428177; font-size: 13px; }
.q-type { font-size: 12px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; }
.q-body { padding: 12px; font-size: 14px; color: #334155; }
.q-actions button { background: none; border: none; cursor: pointer; font-size: 14px; margin-left: 6px; }
.q-actions button:hover { transform: scale(1.1); }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.required { color: #ef4444; }
.status-text { color: #ef4444; font-size: 13px; font-weight: 600; }

/* Responsive */
@media (max-width: 1024px) {
  .modal-body { flex-direction: column; }
  .survey-editor { border-left: none; border-bottom: 1px solid #e2e8f0; }
  .question-sidebar { max-width: 100%; height: 250px; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>