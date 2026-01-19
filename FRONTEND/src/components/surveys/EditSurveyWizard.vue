<template>
  <div class="wizard-page">
    <div class="wizard-header">
      <div class="header-content">
        <h1>{{ isEditMode ? 'تعديل استبيان' : 'إنشاء استبيان جديد' }}</h1>
        <p>{{ isEditMode ? 'قم بتعديل بيانات وأسئلة الاستبيان الحالي' : 'اتبع الخطوات التالية لإنشاء ونشر استبيانك' }}</p>
      </div>
      <div class="wizard-actions">
        <button class="btn btn-outline" @click="$router.push('/dashboard')">
          إلغاء
        </button>
      </div>
    </div>

    <!-- Progress Stepper -->
    <div class="stepper">
      <div v-for="step in steps" :key="step.number" 
           :class="['step', { active: currentStep === step.number, completed: currentStep > step.number }]">
        <div class="step-circle">
          <span v-if="currentStep > step.number">✓</span>
          <span v-else>{{ step.number }}</span>
        </div>
        <div class="step-label">{{ step.label }}</div>
        <div v-if="step.number < 4" class="step-line"></div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="wizard-content">
      <!-- Step 1: Basic Info -->
      <div v-if="currentStep === 1" class="step-view">
        <div class="card">
          <div class="card-header">
            <h3>الإعدادات الأساسية</h3>
            <p>أدخل المعلومات الأساسية للاستبيان</p>
          </div>
          <div class="card-body">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>عنوان الاستبيان</label>
                <input v-model="form.title" type="text" placeholder="عنوان الاستبيان..." class="form-input">
              </div>
              <div class="form-group full-width">
                <label>وصف الاستبيان</label>
                <textarea v-model="form.description" rows="4" placeholder="وصف موجز..." class="form-textarea"></textarea>
              </div>
              <div class="form-group">
                <label>تاريخ البدء</label>
                <input v-model="form.startDate" type="datetime-local" class="form-input">
              </div>
              <div class="form-group">
                <label>تاريخ الانتهاء</label>
                <input v-model="form.endDate" type="datetime-local" class="form-input">
              </div>
              <div class="form-group">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="form.isPeriodic">
                  <span class="checkmark"></span>
                  استبيان دوري
                </label>
              </div>
              <div v-if="form.isPeriodic" class="form-group">
                <label>التكرار</label>
                <select v-model="form.frequencyId" class="form-input" :disabled="frequenciesLoading">
                  <option value="">اختر التكرار...</option>
                  <option 
                    v-for="freq in frequencies" 
                    :key="freq.id" 
                    :value="freq.id"
                  >
                    {{ freq.name }}
                  </option>
                </select>
                <div v-if="frequenciesLoading" class="loading-text">
                  جاري تحميل خيارات التكرار...
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button @click="handleStep1Next" :disabled="loading" class="btn btn-primary">
              <span v-if="loading">جاري الحفظ...</span>
              <span v-else>التالي: بناء الأسئلة</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Question Builder -->
      <div v-if="currentStep === 2" class="step-view question-builder">
        <div class="builder-layout">
          <!-- Sidebar: Question Types -->
          <div class="sidebar">
            <h3>أنواع الأسئلة</h3>
            <div class="types-grid">
              <div v-for="type in questionTypes" :key="type.id" 
                   @click="openQuestionModal(type)" class="type-card">
                <span class="type-icon">{{ type.icon }}</span>
                <span class="type-name">{{ type.name }}</span>
              </div>
            </div>
          </div>

          <!-- Main Area: Added Questions -->
          <div class="main-content">
            <div class="card">
              <div class="card-header">
                <h3>الأسئلة المُضافة ({{ questions.length }})</h3>
              </div>
              <div class="card-body">
                <div v-if="questions.length === 0" class="empty-state">
                  <div class="empty-icon">📝</div>
                  <p>لم يتم إضافة أي أسئلة بعد. اختر من الأنواع في القائمة الجانبية.</p>
                </div>
                <div class="questions-list">
                  <div v-for="(q, index) in questions" :key="index" class="question-card">
                    <div class="q-header">
                      <span class="q-number">س{{ index + 1 }}</span>
                      <span class="q-type-badge">{{ q.type_label }}</span>
                      <div class="q-actions">
                        <button @click="editQuestion(index)" class="btn-icon">✏️</button>
                        <button @click="removeQuestion(index)" class="btn-icon danger">🗑️</button>
                      </div>
                    </div>
                    <div class="q-body">
                      <p class="q-text">{{ q.text || q.question_text || 'نص السؤال مفقود' }}</p>
                      <div v-if="q.options && q.options.length > 0" class="q-options">
                        <span v-for="(opt, idx) in q.options" :key="idx" class="opt-tag">{{ typeof opt === 'object' ? (opt.text || opt.label || opt.value) : opt }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <button @click="currentStep = 1" class="btn btn-outline">السابق</button>
                <button @click="currentStep = 3" class="btn btn-primary">التالي: تحديد المستهدفين</button>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- خطوة 3: تحديد المستهدفين -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="card">
            <div class="card-header">
              <h3>تحديد الفئات المستهدفة</h3>
              <p>اختر المديريات أو المجمعات أو المدارس المعنية بهذا الاستبيان</p>
            </div>

            <!-- Tabs Navigation -->
            <div class="targeting-tabs">
              <button 
                class="tab-btn" 
                :class="{ active: activeTargetTab === 'directorates' }"
                @click="activeTargetTab = 'directorates'"
              >
                🏢 المديريات
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: activeTargetTab === 'complexes' }"
                @click="activeTargetTab = 'complexes'"
              >
                🏘️ المجمعات
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: activeTargetTab === 'schools' }"
                @click="activeTargetTab = 'schools'"
              >
                🏫 المدارس
              </button>
            </div>

            <div class="tab-content">
              
              <!-- Generic Layout for all tabs: Selection on Right, List on Left -->
              <div class="targeting-layout">
                
                <!-- Right Column: Selection Input -->
                <div class="selection-column">
                  
                  <!-- Directorates Input -->
                  <div v-if="activeTargetTab === 'directorates'" class="input-wrapper">
                    <label class="input-label">أضف مديرية</label>
                    <select class="form-select" @change="e => toggleDirectorate(Number(e.target.value))" :value="''">
                       <option value="" disabled selected>اختر مديرية لإضافتها...</option>
                       <option 
                         v-for="dir in schoolsStore.directorates" 
                         :key="dir.id" 
                         :value="dir.id"
                         :disabled="targets.directorateIds.includes(dir.id)"
                       >
                         {{ dir.name }}
                       </option>
                    </select>
                    <p class="helper-text">اختر المديرية لإضافتها للقائمة.</p>
                  </div>

                  <!-- Complexes Input -->
                  <div v-if="activeTargetTab === 'complexes'" class="input-wrapper">
                    <label class="input-label">أولاً: اختر المديرية</label>
                    <select class="form-select mb-4" v-model="selectedComplexDirectorate" @change="fetchComplexesForDir">
                       <option value="" disabled selected>اختر المديرية...</option>
                       <option 
                         v-for="dir in schoolsStore.directorates" 
                         :key="dir.id" 
                         :value="dir.id"
                       >
                         {{ dir.name }}
                       </option>
                    </select>

                    <div v-if="selectedComplexDirectorate" class="fade-in">
                      <label class="input-label">ثانياً: أضف مجمع</label>
                       <select class="form-select" @change="e => toggleComplex(Number(e.target.value))" :value="''">
                         <option value="" disabled selected>اختر مجمع لإضافته...</option>
                         <option 
                           v-for="comp in schoolsStore.complexes" 
                           :key="comp.id" 
                           :value="comp.id"
                           :disabled="targets.complexIds.includes(comp.id)"
                         >
                           {{ comp.name }}
                         </option>
                      </select>
                      <p class="helper-text">اختر المجمع التعليمي لإضافته للقائمة.</p>
                    </div>
                  </div>

                  <!-- Schools Input (Search) -->
                  <div v-if="activeTargetTab === 'schools'" class="input-wrapper">
                    <label class="input-label">أضف مدرسة</label>
                    <div class="searchable-dropdown-container">
                      <div class="search-box">
                        <input 
                          type="text" 
                          v-model="schoolSearch" 
                          placeholder="ابحث باسم المدرسة أو الكود..."
                          class="form-input dropdown-search-input"
                          @focus="showSchoolDropdown = true"
                        />
                        <span class="search-icon">🔍</span>
                      </div>
                      
                      <!-- Searchable Dropdown List -->
                      <div v-if="showSchoolDropdown" class="searchable-dropdown-list">
                        <div 
                          v-for="school in filteredSchools" 
                          :key="school.id"
                          class="dropdown-list-item"
                          :class="{ 'item-selected': targets.schoolIds.includes(school.id) }"
                          @click="selectSchoolFromDropdown(school)"
                        >
                          <div class="item-main">
                            <span class="item-name">{{ school.name }}</span>
                            <span class="item-code">{{ school.code }}</span>
                          </div>
                          <span v-if="targets.schoolIds.includes(school.id)" class="selected-check">✅</span>
                        </div>
                        <div v-if="filteredSchools.length === 0" class="no-results-found">
                          لا توجد نتائج بحث
                        </div>
                      </div>
                    </div>
                    <p class="helper-text">اضغط على الحقل للبحث واختيار المدارس.</p>
                  </div>

                </div>

                <!-- Left Column: Selected Items List -->
                <div class="selected-column">
                  <div class="selected-header">
                    <h4>
                      {{ 
                        activeTargetTab === 'directorates' ? 'المديريات المحددة' : 
                        activeTargetTab === 'complexes' ? 'المجمعات المحددة' : 'المدارس المحددة' 
                      }}
                      <span class="count-badge">
                         {{ 
                            activeTargetTab === 'directorates' ? targets.directorateIds.length : 
                            activeTargetTab === 'complexes' ? targets.complexIds.length : targets.schoolIds.length 
                          }}
                      </span>
                    </h4>
                    <button class="clear-btn" @click="clearCurrentTabTargets">مسح الكل</button>
                  </div>

                  <div class="selected-list">
                    <!-- Directorates List -->
                    <template v-if="activeTargetTab === 'directorates'">
                       <div v-for="id in targets.directorateIds" :key="id" class="selected-item dir-item">
                         <span class="item-text">{{ getDirectorateName(id) }}</span>
                         <button @click="toggleDirectorate(id)" class="remove-btn">×</button>
                       </div>
                       <div v-if="targets.directorateIds.length === 0" class="empty-list">
                         لم يتم تحديد أي مديريات
                       </div>
                    </template>

                    <!-- Complexes List -->
                    <template v-if="activeTargetTab === 'complexes'">
                       <div v-for="id in targets.complexIds" :key="id" class="selected-item comp-item">
                         <span class="item-text">{{ getComplexName(id) }}</span>
                         <button @click="toggleComplex(id)" class="remove-btn">×</button>
                       </div>
                       <div v-if="targets.complexIds.length === 0" class="empty-list">
                         لم يتم تحديد أي مجمعات
                       </div>
                    </template>

                    <!-- Schools List -->
                    <template v-if="activeTargetTab === 'schools'">
                       <div v-for="id in targets.schoolIds" :key="id" class="selected-item school-item">
                         <div class="school-info">
                            <span class="item-text">{{ getSchoolName(id) }}</span>
                         </div>
                         <button @click="toggleSchool(id)" class="remove-btn">×</button>
                       </div>
                       <div v-if="targets.schoolIds.length === 0" class="empty-list">
                         لم يتم تحديد أي مدارس
                       </div>
                    </template>
                  </div>
                </div>

              </div>
            </div>

            <div class="wizard-actions">
              <button class="btn btn-secondary" @click="currentStep = 2">السابق</button>
              <button 
                class="btn btn-primary" 
                @click="handleStep3Next"
                :disabled="!hasSelectedTargets"
              >
                التالي: المراجعة والنشر
              </button>
            </div>
          </div>
        </div>

      <!-- Step 4: Review & Publish -->
      <div v-if="currentStep === 4" class="step-view">
        <div class="card">
          <div class="card-header">
            <h3>مراجعة نهائية</h3>
            <p>راجع تفاصيل الاستبيان قبل النشر</p>
          </div>
          <div class="card-body">
            <div class="review-grid">
              <div class="review-item">
                <label>العنوان:</label>
                <span>{{ form.title }}</span>
              </div>
              <div class="review-item">
                <label>الفترة:</label>
                <span>{{ formatDate(form.startDate) }} - {{ formatDate(form.endDate) }}</span>
              </div>
              <div class="review-item">
                <label>نوع الاستبيان:</label>
                <span>{{ form.isPeriodic ? `دوري (${getFrequencyLabel(form.frequencyId)})` : 'لمرة واحدة' }}</span>
              </div>
              <div class="review-item">
                <label>عدد الأسئلة:</label>
                <span>{{ questions.length }}</span>
              </div>
              <div class="review-item">
                <label>المستهدفين:</label>
                <span>{{ targets.directorateIds.length }} مديريات، {{ targets.schoolIds.length }} مدارس</span>
              </div>
            </div>

            <div class="preview-questions">
              <h4>معاينة الأسئلة</h4>
              <div v-for="(q, idx) in questions" :key="idx" class="preview-q">
                <strong>س{{ idx+1 }}: {{ q.text }}</strong>
                <small>({{ q.type_label }})</small>
              </div>
            </div>
          </div>
          <div class="card-footer actions-between">
            <button @click="currentStep = 3" class="btn btn-outline">السابق</button>
            <div class="final-btns">
              <button @click="handleSave" :disabled="loading" class="btn btn-secondary">
                <span v-if="loading">جاري الحفظ...</span>
                <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'حفظ كمسودة' }}</span>
              </button>
              <button @click="handlePublish" :disabled="loading" class="btn btn-success">
                <span v-if="loading">جاري النشر...</span>
                <span v-else>{{ isEditMode ? 'حفظ ونشر' : 'نشر الآن 🚀' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reusing existing QuestionModal -->
    <QuestionModal 
      v-if="showQuestionModal"
      :question-type="selectedType"
      :question-data="editingQuestion"
      @save="saveQuestion"
      @close="closeQuestionModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/surveys'
import { useSchoolsStore } from '@/stores/schools'
import { aidService } from '@/api'
import QuestionModal from '@/components/surveys/modals/QuestionModal.vue'

const router = useRouter()
const route = useRoute()
const surveyStore = useSurveyStore()
const schoolsStore = useSchoolsStore()

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id)

// State
const currentStep = ref(1)
const loading = ref(false)
const surveyId = ref(route.params.id ? Number(route.params.id) : null)
const schoolSearch = ref('')
const showQuestionModal = ref(false)
const selectedType = ref(null)
const editingQuestion = ref(null)
const editingIndex = ref(-1)
const showSchoolDropdown = ref(false)

const steps = [
  { number: 1, label: 'المعلومات الأساسية' },
  { number: 2, label: 'بناء الأسئلة' },
  { number: 3, label: 'تحديد المستهدفين' },
  { number: 4, label: 'المراجعة والنشر' }
]

const form = reactive({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  isPeriodic: false,
  frequencyId: ''
})

const questions = ref([])
const directorates = ref([])
const frequencies = ref([])
const frequenciesLoading = ref(false)

// Computed
const progress = computed(() => (currentStep.value / 4) * 100)
const questionTypes = computed(() => surveyStore.questionTypes)
const filteredSchools = computed(() => {
  if (!schoolSearch.value) return []
  return schoolsStore.schools.filter(s => 
    s.name.includes(schoolSearch.value) || s.code.includes(schoolSearch.value)
  ).slice(0, 5)
})

const getFrequencyLabel = (id) => {
  const freq = frequencies.value.find(f => f.id == id)
  return freq ? freq.name : id
}

// Helper function to format datetime-local
const formatDateTimeLocal = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Load existing survey data if in edit mode
const loadSurveyData = async () => {
  if (!isEditMode.value || !surveyId.value) return
  
  loading.value = true
  try {
    const survey = await surveyStore.fetchSurveyById(surveyId.value)
    
    if (survey) {
      // Populate form
      form.title = survey.title || ''
      form.description = survey.description || ''
      form.isPeriodic = survey.is_periodic || false
      form.frequencyId = survey.frequency_id || ''
      
      // Format dates for datetime-local input
      if (survey.dates?.start) {
        form.startDate = formatDateTimeLocal(survey.dates.start)
      }
      if (survey.dates?.end) {
        form.endDate = formatDateTimeLocal(survey.dates.end)
      }
      
      // Load questions
      if (survey.questions && Array.isArray(survey.questions)) {
        questions.value = survey.questions.map(q => ({
          ...q,
          type_label: questionTypes.value.find(t => t.id === q.type_id)?.name || q.type_label || ''
        }))
      }
      
      // Load targets
      if (survey.targets) {
        if (survey.targets.directorate_ids) {
          targets.directorateIds = [...survey.targets.directorate_ids]
        }
        if (survey.targets.complex_ids) {
          targets.complexIds = [...survey.targets.complex_ids]
        }
        if (survey.targets.school_ids) {
          targets.schoolIds = [...survey.targets.school_ids]
        }
      }
    }
  } catch (err) {
    console.error('Failed to load survey data:', err)
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}

// Load frequencies from backend
const loadFrequencies = async () => {
  frequenciesLoading.value = true
  try {
    const response = await aidService.getFrequencies()
    if (response.data && Array.isArray(response.data)) {
      frequencies.value = response.data
      // Set default frequency if not already set and we have data
      if (!form.frequencyId && frequencies.value.length > 0) {
        form.frequencyId = frequencies.value[0].id
      }
    }
  } catch (err) {
    console.error('Failed to load frequencies:', err)
    // Fallback to hardcoded values if API fails
    frequencies.value = [
      { id: 2, name: 'يومي' },
      { id: 3, name: 'أسبوعي' },
      { id: 4, name: 'شهري' },
      { id: 5, name: 'سنوي' }
    ]
  } finally {
    frequenciesLoading.value = false
  }
}

// Watch for periodic checkbox changes
watchEffect(() => {
  if (form.isPeriodic && frequencies.value.length === 0 && !frequenciesLoading.value) {
    loadFrequencies()
  }
})

// Hooks
onMounted(async () => {
  if (surveyStore.questionTypes.length === 0) {
    await surveyStore.fetchQuestionTypes()
  }
  await schoolsStore.fetchSchools()
  await schoolsStore.fetchDirectorates()
  
  // Load survey data if in edit mode
  if (isEditMode.value) {
    await loadSurveyData()
  }
})

// ... Actions ...

const selectedComplexDirectorate = ref('')

const fetchComplexesForDir = async () => {
  if (!selectedComplexDirectorate.value) return
  await schoolsStore.fetchComplexes(selectedComplexDirectorate.value)
}

// Actions
const selectSchoolFromDropdown = (school) => {
  addSchoolTarget(school)
  showSchoolDropdown.value = false
  schoolSearch.value = ''
}
const handleStep1Next = async () => {
  if (!form.title) {
    alert('يرجى إدخال عنوان الاستبيان')
    return
  }
  
  // Validate dates
  if (!validateDates()) return
  
  loading.value = true
  try {
    if (isEditMode.value && surveyId.value) {
      // Update existing survey - فقط المعلومات الأساسية
      // الأسئلة والأهداف يتم تحديثها في الخطوات اللاحقة
      await surveyStore.updateSurvey(surveyId.value, {
        title: form.title,
        description: form.description,
        isPeriodic: form.isPeriodic,
        startDate: form.startDate,
        endDate: form.endDate
      })
    } else {
      // Create new survey
      const res = await surveyStore.createSurvey({
        ...form,
        questions: [],
        targets: []
      })
      surveyId.value = res.surveyId || res.id
    }
    currentStep.value = 2
  } catch (err) {
    console.error('Step 1 failed', err)
    alert('حدث خطأ أثناء تحديث الاستبيان. يرجى المحاولة مرة أخرى.')
  } finally {
    loading.value = false
  }
}

const openQuestionModal = (type) => {
  selectedType.value = type
  editingQuestion.value = null
  editingIndex.value = -1
  showQuestionModal.value = true
}

const editQuestion = (index) => {
  const q = questions.value[index]
  // Use loose comparison (==) to handle string/number mismatches
  const type = questionTypes.value.find(t => t.id == q.type_id)
  
  if (!type) {
    console.error('Question type not found:', q.type_id)
    console.log('Available types:', questionTypes.value)
    alert('عذراً، نوع هذا السؤال غير معروف أو لم يتم تحميله بشكل صحيح.')
    return
  }

  selectedType.value = type
  editingQuestion.value = { ...q }
  editingIndex.value = index
  showQuestionModal.value = true
}

const removeQuestion = async (index) => {
  const q = questions.value[index]
  
  if (q.id) {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.')) return
    
    try {
      await surveyStore.deleteQuestionFromSurvey(q.id)
      questions.value.splice(index, 1)
    } catch (err) {
      alert('فشل حذف السؤال: ' + err.message)
    }
  } else {
    questions.value.splice(index, 1)
  }
}

const saveQuestion = async (qData) => {
  loading.value = true
  try {
    if (editingIndex.value > -1 && qData.id) {
      // Edit existing question
      const res = await surveyStore.editQuestion(qData.id, qData)
      // Update the local questions array with the response data
      questions.value[editingIndex.value] = {
        ...res,
        ...qData,
        type_label: selectedType.value?.name || qData.type_label || ''
      }
    } else {
      // Add new question
      const res = await surveyStore.addQuestion(surveyId.value, qData)
      // The response should contain the created question data
      const newQuestion = {
        ...res,
        ...qData,
        id: res.questionId || res.id || Date.now(),
        type_label: selectedType.value?.name || qData.type_label || ''
      }
      
      if (editingIndex.value > -1) {
        questions.value[editingIndex.value] = newQuestion
      } else {
        questions.value.push(newQuestion)
      }
    }
    closeQuestionModal()
  } catch (err) {
    console.error('Failed to add/edit question', err)
    alert('حدث خطأ أثناء حفظ السؤال.')
  } finally {
    loading.value = false
  }
}

const closeQuestionModal = () => {
  showQuestionModal.value = false
  selectedType.value = null
  editingQuestion.value = null
  editingIndex.value = -1
}

const activeTargetTab = ref('schools')
const targets = reactive({
  directorateIds: [],
  complexIds: [],
  schoolIds: []
})

const hasSelectedTargets = computed(() => {
  return targets.directorateIds.length > 0 || 
         targets.complexIds.length > 0 || 
         targets.schoolIds.length > 0
})

const toggleDirectorate = (id) => {
  const index = targets.directorateIds.indexOf(id)
  if (index === -1) targets.directorateIds.push(id)
  else targets.directorateIds.splice(index, 1)
}

const toggleComplex = (id) => {
  const index = targets.complexIds.indexOf(id)
  if (index === -1) targets.complexIds.push(id)
  else targets.complexIds.splice(index, 1)
}

const toggleSchool = (id) => {
  const index = targets.schoolIds.indexOf(id)
  if (index === -1) targets.schoolIds.push(id)
  else targets.schoolIds.splice(index, 1)
}

const getSchoolName = (id) => {
  const s = schoolsStore.schools.find(school => school.id === id)
  return s ? s.name : `School #${id}`
}

const getDirectorateName = (id) => {
  const d = schoolsStore.directorates.find(dir => dir.id === id)
  return d ? d.name : `Directorate #${id}`
}

const getComplexName = (id) => {
  const c = schoolsStore.complexes?.find(comp => comp.id === id)
  return c ? c.name : `Complex #${id}`
}


const clearCurrentTabTargets = () => {
  if (activeTargetTab.value === 'directorates') targets.directorateIds = []
  else if (activeTargetTab.value === 'complexes') targets.complexIds = []
  else if (activeTargetTab.value === 'schools') targets.schoolIds = []
}


const addSchoolTarget = (school) => {
  if (!targets.schoolIds.includes(school.id)) {
    targets.schoolIds.push(school.id)
  }
  schoolSearch.value = ''
}

const handleStep3Next = async () => {
  loading.value = true
  try {
    await surveyStore.setTargets(surveyId.value, {
      directorateIds: targets.directorateIds,
      complexIds: targets.complexIds,
      schoolIds: targets.schoolIds
    })
    currentStep.value = 4
  } catch (err) {
    console.error('Step 3 failed', err)
  } finally {
    loading.value = false
  }
}

const handlePublish = async () => {
  loading.value = true
  try {
    if (isEditMode.value) {
      // Update survey basic info first (if needed)
      await surveyStore.updateSurvey(surveyId.value, {
        title: form.title,
        description: form.description,
        isPeriodic: form.isPeriodic,
        startDate: form.startDate,
        endDate: form.endDate
      })
    }
    await surveyStore.publishSurvey(surveyId.value)
    router.push('/dashboard')
  } catch (err) {
    console.error('Publish failed', err)
    alert('حدث خطأ أثناء نشر الاستبيان. يرجى المحاولة مرة أخرى.')
  } finally {
    loading.value = false
  }
}

// Computed property to check if we can save (survey exists)
const canSave = computed(() => !!surveyId.value)

// Validation function for dates
const validateDates = () => {
  if (!form.startDate || !form.endDate) return true // Allow empty dates
  
  const startDateObj = new Date(form.startDate)
  const endDateObj = new Date(form.endDate)
  
  if (startDateObj >= endDateObj) {
    alert('خطأ: تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء')
    return false
  }
  return true
}

const handleSave = async () => {
  // Validate dates first
  if (!validateDates()) return
  
  loading.value = true
  try {
    if (surveyId.value) {
      // Save draft - works for both create and edit modes
      await surveyStore.updateSurvey(surveyId.value, {
        title: form.title,
        description: form.description,
        isPeriodic: form.isPeriodic,
        startDate: form.startDate,
        endDate: form.endDate,
        questions: questions.value,
        targets: targets
      })
      router.push('/dashboard')
    }
  } catch (err) {
    console.error('Save failed', err)
    alert('حدث خطأ أثناء حفظ المسودة. يرجى المحاولة مرة أخرى.')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ar-EG')
}
</script>

<style scoped>
  @import '../../assets/surveys/EditSurveyWizard.css';
</style>
