<template>
  <div class="create-survey-page">
    
    <!-- 1. رأس الصفحة -->
    <div class="page-header">
      <div class="header-right">
        <h2>إنشاء استبيان جديد</h2>
        <p class="subtitle">قم بإعداد الأسئلة والإعدادات قبل النشر</p>
      </div>
      <div class="actions">
        <button class="btn-cancel" @click="$router.push('/surveys')">إلغاء</button>
        <!-- زر الحفظ كمسودة -->
        <button class="btn-draft" @click="handleSaveDraft" :disabled="loading">
          <span v-if="loading">⏳ جاري الحفظ...</span>
          <span v-else>💾 حفظ كمسودة</span>
        </button>
        <!-- زر النشر -->
        <button class="btn-publish" @click="openTargetModal" :disabled="loading || !surveyId">
          🚀 نشر الاستبيان
        </button>
      </div>
    </div>

    <div class="workspace">
      <!-- 2. القائمة الجانبية (بنك الأسئلة) -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>بنك الأسئلة</h3>
          <small>اضغط لإضافة سؤال</small>
        </div>
        
        <div class="tools-grid">
          <button @click="addQuestion(1)" class="tool-btn">
            <span class="icon">📝</span>
            <span>نص قصير</span>
          </button>
          <button @click="addQuestion(2)" class="tool-btn">
            <span class="icon">📄</span>
            <span>نص طويل</span>
          </button>
          <button @click="addQuestion(3)" class="tool-btn">
            <span class="icon">⭕</span>
            <span>خيار واحد</span>
          </button>
          <button @click="addQuestion(4)" class="tool-btn">
            <span class="icon">☑️</span>
            <span>خيار متعدد</span>
          </button>
          <button @click="addQuestion(5)" class="tool-btn">
            <span class="icon">🔢</span>
            <span>رقم</span>
          </button>
          <button @click="addQuestion(8)" class="tool-btn">
            <span class="icon">📅</span>
            <span>مجال تاريخ</span>
          </button>
        </div>
      </aside>

      <!-- 3. منطقة العمل الرئيسية -->
      <main class="main-form">
        
        <!-- بطاقة المعلومات الأساسية -->
        <div class="card basic-info">
          <input 
            v-model="formData.title" 
            type="text" 
            class="title-input" 
            placeholder="عنوان الاستبيان (مثال: تقرير النظافة الأسبوعي)"
          />
          
          <div class="form-group">
            <label>وصف الاستبيان</label>
            <textarea 
              v-model="formData.description" 
              class="desc-input"
              placeholder="اكتب تعليمات للمدارس حول كيفية التعبئة..."
            ></textarea>
          </div>

          <div class="dates-row">
            <div class="form-group">
              <label>تاريخ البدء (اختياري للنشر التلقائي)</label>
              <input type="datetime-local" v-model="formData.startDate" class="date-input">
            </div>
            <div class="form-group">
              <label>تاريخ الانتهاء (للإغلاق التلقائي)</label>
              <input type="datetime-local" v-model="formData.endDate" class="date-input">
            </div>
          </div>

          <div class="periodic-section">
            <label class="switch-label">
              <input type="checkbox" v-model="formData.isPeriodic">
              <span class="label-text">تفعيل التكرار الدوري (أتمتة)</span>
            </label>
            
            <select v-if="formData.isPeriodic" v-model="formData.frequencyId" class="freq-select">
              <option :value="null">اختر التكرار...</option>
              <option :value="2">يومي</option>
              <option :value="3">أسبوعي</option>
              <option :value="4">شهري</option>
            </select>
          </div>
        </div>

        <!-- قائمة الأسئلة المضافة -->
        <div class="questions-list">
          <!-- حالة فارغة -->
          <div v-if="formData.questions.length === 0" class="empty-state">
            <div class="empty-icon">👈</div>
            <p>القائمة فارغة. اختر نوع السؤال من القائمة الجانبية للبدء.</p>
          </div>

          <!-- بطاقة السؤال -->
          <div 
            v-for="(q, index) in formData.questions" 
            :key="index" 
            class="card question-card"
          >
            <div class="q-header">
              <div class="q-meta">
                <span class="q-num">سؤال {{ index + 1 }}</span>
                <span class="type-tag">{{ getTypeName(q.typeId) }}</span>
              </div>
              <div class="q-actions">
                <label class="required-toggle">
                  <input type="checkbox" v-model="q.isRequired"> 
                  <span>مطلوب</span>
                </label>
                <button class="btn-icon delete" @click="removeQuestion(index)" title="حذف">✕</button>
              </div>
            </div>

            <!-- نص السؤال -->
            <div class="q-body">
              <input 
                v-model="q.text" 
                type="text" 
                class="q-text-input" 
                placeholder="اكتب نص السؤال هنا..."
              >

              <!-- منطقة الخيارات (للأنواع 3 و 4) -->
              <div v-if="[3, 4].includes(q.typeId)" class="options-container">
                <div v-for="(opt, optIdx) in q.options" :key="optIdx" class="option-row">
                  <span class="opt-bullet">{{ q.typeId === 3 ? '○' : '□' }}</span>
                  <input 
                    v-model="q.options[optIdx]" 
                    class="opt-input"
                    placeholder="خيار جديد" 
                  />
                  <button class="remove-opt" @click="removeOption(index, optIdx)">×</button>
                </div>
                <button class="btn-add-opt" @click="addOption(index)">+ إضافة خيار</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- نافذة الاستهداف (Modal) -->
    <div v-if="showTargetModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>🎯 تحديد الجمهور المستهدف</h3>
          <button class="close-modal" @click="showTargetModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <p>اختر المديرية التي تريد إرسال الاستبيان لجميع مدارسها:</p>
          
          <div class="form-group">
            <label>المديرية:</label>
            <select v-model="selectedDirectorate" class="full-width-select">
              <option :value="null">-- اختر المديرية --</option>
              <option :value="1">مديرية تربية دمشق</option>
              <option :value="2">مديرية تربية ريف دمشق</option>
              <!-- يمكنك جلب هذه القائمة من API Lookups -->
            </select>
          </div>

          <div class="info-box" v-if="selectedDirectorate">
            سيتم إرسال الاستبيان إلى كافة المدارس التابعة للمديرية المختارة وتفعيل الإشعارات.
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showTargetModal = false">إلغاء</button>
          <button class="btn-primary" @click="handlePublish" :disabled="loading || !selectedDirectorate">
            {{ loading ? 'جاري النشر...' : 'تأكيد ونشر' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// ==========================================
// 1. إعدادات الاتصال (مهم جداً لتعمل فوراً)
// ==========================================
// تأكد من أن البورت مطابق لسيرفرك (3000 أو 5000)
axios.defaults.baseURL = 'http://localhost:3000/api'; 

// جلب التوكن من LocalStorage (الذي خزنته عند الـ Login)
const token = localStorage.getItem('token'); 
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ==========================================
// 2. حالة الصفحة (State)
// ==========================================
const loading = ref(false)
const showTargetModal = ref(false)
const surveyId = ref(null) // لحفظ الـ ID بعد أول عملية حفظ
const selectedDirectorate = ref(null)

const formData = reactive({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  isPeriodic: false,
  frequencyId: null,
  questions: []
})

// ==========================================
// 3. المنطق (Methods)
// ==========================================

// إضافة سؤال للقائمة المحلية
const addQuestion = (typeId) => {
  formData.questions.push({
    text: '',
    typeId: typeId,
    isRequired: true,
    options: [3, 4].includes(typeId) ? [''] : [], // إضافة خيار فارغ مبدئياً
    order: formData.questions.length + 1
  })
  // تمرير تلقائي للأسفل
  setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, 100)
}

const removeQuestion = (index) => {
  formData.questions.splice(index, 1)
}

const addOption = (qIndex) => {
  formData.questions[qIndex].options.push('')
}

const removeOption = (qIndex, optIndex) => {
  formData.questions[qIndex].options.splice(optIndex, 1)
}

const getTypeName = (id) => {
  const types = { 1: 'نص قصير', 2: 'نص طويل', 3: 'خيار واحد', 4: 'خيار متعدد', 5: 'رقم', 8: 'مجال تاريخ' }
  return types[id] || 'سؤال'
}

// --- عملية الحفظ (Draft) ---
const handleSaveDraft = async () => {
  if (!formData.title) return alert('⚠️ يرجى كتابة عنوان للاستبيان')
  if (formData.questions.length === 0) return alert('⚠️ يرجى إضافة سؤال واحد على الأقل')

  loading.value = true
  try {
    // 1. تجهيز بيانات الاستبيان
    const surveyPayload = {
      title: formData.title,
      description: formData.description,
      isPeriodic: formData.isPeriodic,
      frequencyId: formData.frequencyId,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null
    }

    let currentId = surveyId.value

    // 2. إنشاء أو تحديث الاستبيان
    if (!currentId) {
      const res = await axios.post('/surveys', surveyPayload)
      currentId = res.data.surveyId
      surveyId.value = currentId
    } else {
      await axios.put(`/surveys/${currentId}`, surveyPayload)
    }

    // 3. إضافة الأسئلة (Loop)
    // نرسل كل الأسئلة دفعة واحدة (Parallel)
    const questionPromises = formData.questions.map((q, idx) => {
      return axios.post(`/surveys/${currentId}/questions`, {
        text: q.text,
        typeId: q.typeId,
        isRequired: q.isRequired,
        options: q.options.filter(o => o.trim() !== ''), // تنظيف الخيارات الفارغة
        order: idx + 1,
        logic: null // يمكن تطويره لاحقاً
      })
    })

    await Promise.all(questionPromises)
    
    alert('✅ تم حفظ المسودة بنجاح! يمكنك إكمال العمل لاحقاً أو النشر الآن.')

  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.error || err.message
    alert(`❌ حدث خطأ: ${msg}`)
  } finally {
    loading.value = false
  }
}

// --- عملية النشر (Publish) ---
const openTargetModal = () => {
  if (!surveyId.value) {
    alert('يرجى حفظ المسودة أولاً قبل النشر')
    return
  }
  showTargetModal.value = true
}

const handlePublish = async () => {
  loading.value = true
  try {
    // 1. تحديد المستهدفين (المديرية المختارة)
    await axios.post(`/surveys/${surveyId.value}/targets`, {
      directorateIds: [selectedDirectorate.value]
    })

    // 2. النشر النهائي
    await axios.post(`/surveys/${surveyId.value}/publish`)

    alert('🎉 تم نشر الاستبيان بنجاح!')
    showTargetModal.value = false
    router.push('/surveys') // العودة للقائمة

  } catch (err) {
    const msg = err.response?.data?.error || err.message
    alert(`❌ فشل النشر: ${msg}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* التصميم الأساسي */
.create-survey-page {
  padding: 30px;
  background-color: #f1f5f9;
  min-height: 100vh;
  direction: rtl;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.header-right h2 { margin: 0; color: #1e293b; }
.subtitle { color: #64748b; margin: 5px 0 0; font-size: 0.9em; }

/* Grid Layout */
.workspace {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;
}

/* Sidebar */
.sidebar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
}
.sidebar-header { margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
.sidebar-header h3 { margin: 0; font-size: 1.1em; color: #334155; }

.tools-grid { display: grid; gap: 10px; }
.tool-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
  font-weight: 500;
  text-align: right;
}
.tool-btn:hover {
  border-color: #10b981;
  color: #10b981;
  background: #ecfdf5;
  transform: translateX(-3px);
}

/* Main Form */
.main-form { display: flex; flex-direction: column; gap: 24px; }

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Inputs Styling */
.title-input {
  font-size: 1.5rem;
  font-weight: bold;
  border: none;
  border-bottom: 2px solid #e2e8f0;
  width: 100%;
  padding: 10px 0;
  margin-bottom: 20px;
  outline: none;
  color: #1e293b;
}
.title-input:focus { border-color: #10b981; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 8px; color: #475569; font-size: 0.9em; font-weight: 600; }

.desc-input, .q-text-input, .opt-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  transition: 0.2s;
}
.desc-input:focus, .q-text-input:focus { border-color: #10b981; outline: none; }

.dates-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* Questions */
.question-card {
  border-right: 4px solid transparent;
  transition: 0.2s;
}
.question-card:hover { border-right-color: #10b981; }

.q-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
.q-meta { display: flex; gap: 10px; align-items: center; }
.q-num { font-weight: bold; color: #334155; }
.type-tag { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; color: #64748b; }

.q-actions { display: flex; gap: 15px; align-items: center; }
.required-toggle { display: flex; gap: 5px; align-items: center; font-size: 0.9em; cursor: pointer; }
.btn-icon.delete { background: none; border: none; color: #ef4444; font-size: 1.2em; cursor: pointer; }

.options-container {
  margin-top: 15px;
  padding-right: 15px;
  border-right: 2px solid #e2e8f0;
}
.option-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.remove-opt { background: none; border: none; color: #ef4444; font-weight: bold; cursor: pointer; }
.btn-add-opt {
  background: none; border: 1px dashed #cbd5e1; color: #64748b;
  padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9em; margin-top: 5px;
}
.btn-add-opt:hover { border-color: #10b981; color: #10b981; }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  color: #94a3b8;
}
.empty-icon { font-size: 2em; margin-bottom: 10px; }

/* Main Buttons */
.btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-left: 10px; }
.btn-draft { background: #334155; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-left: 10px; }
.btn-publish { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
.btn-publish:disabled, .btn-draft:disabled { opacity: 0.7; cursor: not-allowed; }

/* Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100;
}
.modal { background: white; padding: 0; border-radius: 12px; width: 450px; overflow: hidden; }
.modal-header { padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.close-modal { background: none; border: none; font-size: 1.5em; cursor: pointer; }
.modal-body { padding: 25px; }
.modal-footer { padding: 15px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; }
.full-width-select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 5px; }
.info-box { background: #ecfdf5; color: #065f46; padding: 10px; border-radius: 6px; margin-top: 15px; font-size: 0.9em; }
.btn-primary { background: #10b981; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; }
.btn-secondary { background: white; border: 1px solid #cbd5e1; padding: 8px 20px; border-radius: 6px; cursor: pointer; }
</style>