<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="header-right">
          <img src="/logo.png" alt="شعار الوزارة" class="ministry-logo" />
          <div class="header-text">
            <h3>تعديل الاستبيان</h3>
            <p>تعديل بيانات وأسئلة الاستبيان الحالي</p>
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
                placeholder="عنوان الاستبيان"
                class="title-input"
              />
              <span class="input-focus-border"></span>
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
                    placeholder="وصف الاستبيان..." 
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
                    <span class="label-text">استبيان دوري</span>
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
                    <span class="q-type">{{ getQuestionTypeLabel(question.type_id) }}</span>
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
              <p>القائمة فارغة، أضف أسئلة من القائمة الجانبية</p>
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
            {{ isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
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
import QuestionModal from '@/components/surveys/modals/QuestionModal.vue'

// استقبال الاستبيان المراد تعديله كـ prop
const props = defineProps({
  survey: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'survey-updated'])
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

// معالجة أنواع الأسئلة للقائمة الجانبية
const processedQuestionTypes = computed(() => {
  return surveyStore.questionTypes.map(type => ({
    ...type,
    name: type.label,
    type_label: type.label
  }))
})

// عند فتح المودال، نملأ البيانات من الـ prop
onMounted(async () => {
  // جلب الأنواع إذا لم تكن موجودة
  if (surveyStore.questionTypes.length === 0) {
    await surveyStore.fetchQuestionTypes()
  }

  // تعبئة النموذج بالبيانات القديمة
  if (props.survey) {
    formData.title = props.survey.title
    formData.description = props.survey.description
    formData.isPeriodic = props.survey.is_periodic || false
    // تنسيق التواريخ لمدخلات datetime-local
    if (props.survey.dates) {
      formData.startDate = formatForInput(props.survey.dates.start)
      formData.endDate = formatForInput(props.survey.dates.end)
    }
    // نسخ الأسئلة (Deep Copy لتجنب تعديل الأصل مباشرة)
    questions.value = JSON.parse(JSON.stringify(props.survey.questions || []))
  }
})

// دالة مساعدة لتنسيق التاريخ للـ Input
const formatForInput = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toISOString().slice(0, 16)
}

const getQuestionTypeLabel = (typeId) => {
  const type = surveyStore.questionTypes.find(t => t.id === typeId)
  return type ? type.label : 'سؤال'
}

// --- دوال التعامل مع الأسئلة (مطابقة للإضافة) ---

const addQuestion = (type) => {
  selectedQuestionType.value = type
  editingQuestionIndex.value = -1
  editingQuestion.value = null
  showQuestionModal.value = true
}

const editQuestion = (index) => {
  const question = questions.value[index]
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
      id: questions.value[editingQuestionIndex.value].id // الحفاظ على ID إذا وجد
    }
  } else {
    questions.value.push({ ...questionData }) // سؤال جديد لا يملك ID بعد
  }
  closeQuestionModal()
}

const closeQuestionModal = () => {
  showQuestionModal.value = false
  selectedQuestionType.value = null
  editingQuestionIndex.value = -1
  editingQuestion.value = null
}

// --- الحفظ ---

const handleSubmit = async () => {
  if (!formData.title.trim()) { error.value = 'العنوان مطلوب'; return }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const payload = {
      title: formData.title,
      description: formData.description,
      isPeriodic: formData.isPeriodic,
      startDate: formData.startDate,
      endDate: formData.endDate,
      questions: questions.value, // إرسال الأسئلة المعدلة
      targets: props.survey.targets || []
    }
    
    // استدعاء دالة التحديث في الـ Store
    const response = await surveyStore.updateSurvey(props.survey.id, payload)
    
    emit('survey-updated', response)
    emit('close')
    
  } catch (err) {
    error.value = err.message || 'حدث خطأ أثناء التحديث'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* نفس التنسيقات المستخدمة في AddSurveyModal تماماً لضمان التطابق */
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

/* Header */
.modal-header {
  background: var(--primary-dark); padding: 16px 24px; border-bottom: 1px solid var(--primary-teal);
  display: flex; justify-content: space-between; align-items: center;
  color: white;
}
.header-right { display: flex; gap: 16px; align-items: center; }
.ministry-logo { 
  height: 50px; width: auto; object-fit: contain;
}
.header-text h3 { margin: 0; font-size: 18px; font-weight: 700; color: white; }
.header-text p { margin: 0; font-size: 13px; color: var(--gold-light); }
.close-btn { background: none; border: none; font-size: 28px; color: #e2e8f0; cursor: pointer; }
.close-btn:hover { color: white; }

/* Body Layout */
.modal-body { display: flex; flex: 1; overflow: hidden; }

/* Editor (Right) */
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
  background: var(--primary-teal); transition: width 0.3s;
}
.title-input:focus + .input-focus-border { width: 100%; }

/* Content Scrollable */
.editor-content { flex: 1; overflow-y: auto; padding: 24px; background: #f8fafc; }
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
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--primary-teal); }

/* Sidebar (Left) */
.question-sidebar {
  flex: 1; min-width: 300px; max-width: 350px;
  background: white; display: flex; flex-direction: column;
}
.sidebar-header { padding: 20px; background: var(--primary-dark); border-bottom: 1px solid var(--primary-teal); }
.sidebar-header h4 { margin: 0; color: white; font-size: 16px; }
.sidebar-header p { margin: 4px 0 0; color: var(--gold-light); font-size: 12px; opacity: 0.8; }
.sidebar-content {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.sidebar-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: white; cursor: pointer; transition: all 0.2s;
}
.sidebar-item:hover {
  border-color: var(--primary-teal); transform: translateX(-4px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}
.item-icon { font-size: 20px; }
.item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.item-title { font-weight: 700; color: #1e293b; font-size: 14px; }
.item-desc { font-size: 11px; color: #64748b; line-height: 1.3; }
.item-add { color: var(--primary-teal); font-weight: bold; font-size: 18px; }

/* Questions Cards */
.question-card-item {
  background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px;
  overflow: hidden;
}
.q-header {
  background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
}
.q-number { font-weight: bold; color: var(--primary-teal); font-size: 13px; }
.q-type { font-size: 12px; background: #e6f0ee; color: var(--primary-dark); padding: 2px 8px; border-radius: 4px; }
.q-body { padding: 12px; font-size: 14px; color: #334155; }
.q-actions button { background: none; border: none; cursor: pointer; font-size: 14px; margin-left: 6px; }
.q-actions button:hover { transform: scale(1.1); }

/* Footer */
.modal-footer {
  padding: 16px 24px; background: white; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-actions { display: flex; gap: 12px; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; }
.btn-secondary { background: #f1f5f9; color: #475569; }
.btn-primary { background: var(--primary-dark); color: white; }
.btn-primary:hover { background: #04332c; }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.required { color: #ef4444; }
.status-text { color: #ef4444; font-size: 13px; font-weight: 600; }

@media (max-width: 1024px) {
  .modal-body { flex-direction: column; }
  .survey-editor { border-left: none; border-bottom: 1px solid #e2e8f0; }
  .question-sidebar { max-width: 100%; height: 250px; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>