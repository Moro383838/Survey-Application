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
                <select v-model="form.frequency" class="form-input" :disabled="frequenciesLoading">
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
                      <p class="q-text">{{ q.text }}</p>
                      <div v-if="q.options && q.options.length > 0" class="q-options">
                        <span v-for="opt in q.options" :key="opt.id" class="opt-tag">{{ opt.text }}</span>
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
                    <label class="input-label">بحث عن مدرسة</label>
                     <div class="search-box">
                      <input 
                        type="text" 
                        v-model="schoolSearch" 
                        placeholder="ابحث باسم المدرسة أو الكود..."
                        class="form-input"
                      />
                      <span class="search-icon">🔍</span>
                      
                      <!-- Autocomplete Results -->
                      <div v-if="schoolSearch && filteredSchools.length > 0" class="search-dropdown">
                        <div 
                          v-for="school in filteredSchools" 
                          :key="school.id"
                          class="dropdown-item"
                          @click="addSchoolTarget(school)"
                        >
                          <span class="d-name">{{ school.name }}</span>
                          <span class="d-meta">{{ school.code }}</span>
                          <span class="plus-icon">+</span>
                        </div>
                      </div>
                    </div>
                    <p class="helper-text">ابحث بالاسم أو الكود لإضافة المدرسة.</p>
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
                <span>{{ form.isPeriodic ? `دوري (${form.frequency})` : 'لمرة واحدة' }}</span>
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
  frequency: ''
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
      form.frequency = survey.frequency || 'monthly'
      
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
    router.push('/surveys')
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
      if (!form.frequency && frequencies.value.length > 0) {
        form.frequency = frequencies.value[0].id
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
      // Update existing survey
      await surveyStore.updateSurvey(surveyId.value, {
        title: form.title,
        description: form.description,
        isPeriodic: form.isPeriodic,
        startDate: form.startDate,
        endDate: form.endDate,
        questions: questions.value,
        targets: targets
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
  selectedType.value = questionTypes.value.find(t => t.id === q.type_id)
  editingQuestion.value = { ...q }
  editingIndex.value = index
  showQuestionModal.value = true
}

const removeQuestion = (index) => {
  questions.value.splice(index, 1)
}

const saveQuestion = async (qData) => {
  loading.value = true
  try {
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
    closeQuestionModal()
  } catch (err) {
    console.error('Failed to add/edit question', err)
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
      // Update survey first, then publish if needed
      await surveyStore.updateSurvey(surveyId.value, {
        title: form.title,
        description: form.description,
        isPeriodic: form.isPeriodic,
        startDate: form.startDate,
        endDate: form.endDate,
        questions: questions.value,
        targets: targets
      })
    }
    await surveyStore.publishSurvey(surveyId.value)
    // Show success message and navigate to surveys dashboard
    alert('تم نشر الاستبيان بنجاح!')
    router.push('/surveys')
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
      // Show success message and navigate to surveys dashboard
      alert('تم حفظ المسودة بنجاح!')
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
.wizard-page {
  padding: 24px;
  max-width: 100%;
  width: 100%;
  margin: 0;
  direction: rtl;
  font-family: 'Inter', 'Outfit', sans-serif;
  min-height: calc(100vh - 128px);
  overflow-x: hidden; /* Prevent horizontal spill */
}

@media (max-width: 640px) {
  .wizard-page {
    padding: 16px; /* Reduced padding on mobile */
  }
}

.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #002623, #001a18);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 38, 35, 0.2);
  border: 1px solid #b9a779;
}

@media (max-width: 768px) {
  .wizard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.header-content h1 {
  font-size: 24px;
  color: #b9a779;
  font-weight: 700;
  margin: 0;
}

.header-content p {
  color: #b9a779;
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 14px;
}

/* Stepper */
.stepper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #64748b;
  transition: all 0.3s ease;
  border: 4px solid white;
}

.step.active .step-circle {
  background: #054239;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(5, 66, 57, 0.1);
}

.step.completed .step-circle {
  background: #b9a779;
  color: white;
}

.step-label {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.step.active .step-label {
  color: #054239;
  font-weight: bold;
}

.step-line {
  position: absolute;
  top: 20px;
  right: 50%;
  left: -50%;
  height: 2px;
  background: #e2e8f0;
  z-index: -1;
}

.step.completed .step-line {
  background: #b9a779;
}

@media (max-width: 600px) {
  .step-label {
    display: none;
  }
}

/* Progress Bar */
.progress-container {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  margin-bottom: 3rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #054239, #428177);
  transition: width 0.4s ease;
}

/* Cards */
.card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.card-header {
  margin-bottom: 2rem;
}

.card-header h3 {
  font-size: 1.5rem;
  margin: 0;
  color: #0f172a;
}

.card-header p {
  color: #64748b;
  margin: 0.5rem 0 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
}

.full-width {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #334155;
}

.form-input, .form-textarea {
  padding: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus {
  border-color: #b9a779;
  outline: none;
  box-shadow: 0 0 0 4px rgba(185, 167, 121, 0.2);
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 0.75rem;
}

/* Question Builder Layout */
.builder-layout {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .builder-layout {
    flex-direction: column;
  }
  .sidebar {
    flex: 0 0 auto;
    width: 100%;
  }
  .types-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 cols for types on mobile */
  }

  /* Ensure inputs don't overflow */
  .form-input, .form-textarea, .form-select {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box; /* Critical for preventing padding overflow */
  }
  
  .card {
     padding: 1.5rem; /* Reduce card padding on mobile */
  }
}

.sidebar {
  flex: 0 0 300px;
}

.types-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.type-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.type-card:hover {
  border-color: #b9a779;
  background: #fdfaf3;
  transform: translateX(-5px);
}

.main-content {
  flex: 1;
}

/* Question Cards */
.question-card {
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.question-card:hover {
  border-color: #054239;
}

/* Question Options Layout Fix */
.q-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.opt-tag {
  background: white;
  color: #054239;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid #b9a779;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.opt-tag:hover {
  background: #fdfaf3;
  transform: translateY(-1px);
}

.q-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.q-number {
  background: #054239;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.q-type-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.q-actions {
  margin-right: auto;
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: #f1f5f9;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
}

.btn-icon.danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Buttons */
.btn {
  padding: 0.875rem 2rem;
  border-radius: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 1rem;
}

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

.btn-outline {
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #64748b;
}

.wizard-header .btn-outline {
  border-color: #b9a779;
  color: #b9a779;
}

.btn-outline:hover {
  border-color: #054239;
  color: #054239;
}

.wizard-header .btn-outline:hover {
  background: rgba(185, 167, 121, 0.1);
  border-color: #b9a779;
  color: #b9a779;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.card-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 2rem;
}

.actions-between {
  justify-content: space-between;
}

.final-btns {
  display: flex;
  gap: 1rem;
}

/* Targeting Step Styles */
.targeting-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 1rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #054239;
}

.tab-btn.active {
  background: #054239;
  color: white;
  box-shadow: 0 4px 12px rgba(5, 66, 57, 0.2);
}

.tab-content {
  min-height: 300px;
}


/* 2-Column Targeting Layout */
.targeting-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .targeting-layout {
    grid-template-columns: 1fr;
  }
}

/* Selection Column (Input) */
.selection-column {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-label {
  font-weight: 700;
  color: #334155;
  font-size: 1rem;
}

.form-select {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  font-family: inherit;
  font-size: 0.95rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #054239;
  box-shadow: 0 0 0 4px rgba(5, 66, 57, 0.1);
}

.helper-text {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

/* Selected Column (Output List) */
.selected-column {
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  background: white;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.selected-header {
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-header h4 {
  margin: 0;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.count-badge {
  background: #054239;
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
}

.clear-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.clear-btn:hover {
  background: #fee2e2;
}

.selected-list {
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.dir-item {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.comp-item {
  background: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

.school-item {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  width: 100%;
  justify-content: space-between;
}

.remove-btn {
  background: rgba(0,0,0,0.05);
  border: none;
  color: inherit;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding-bottom: 2px;
}

.remove-btn:hover {
  background: rgba(0,0,0,0.15);
}

.empty-list {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-style: italic;
  min-height: 200px;
}

/* Autocomplete Dropdown in Search */
.search-dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 250px;
  overflow-y: auto;
  z-index: 20;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.d-name {
  font-weight: 600;
  color: #1e293b;
}

.d-meta {
  font-size: 0.8rem;
  color: #64748b;
  margin-right: auto;
  margin-left: 0.5rem;
}

.plus-icon {
  color: #054239;
  font-weight: bold;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #054239;
  box-shadow: 0 0 0 4px rgba(5, 66, 57, 0.1);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

/* Selected Summary Tags */
.selected-summary {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.selected-summary h4 {
  margin: 0 0 1rem 0;
  color: #334155;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.directorate-tag {
  background: #e0f2fe;
  color: #0369a1;
}

.complex-tag {
  background: #f3e8ff;
  color: #7e22ce;
}

.school-tag {
  background: #ecfdf5;
  color: #047857;
}

.remove-tag {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0;
  color: currentColor;
  opacity: 0.7;
}

.remove-tag:hover {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
  font-size: 1.1rem;
  background: #f8fafc;
  border-radius: 1rem;
  border: 2px dashed #e2e8f0;
}
.wizard-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.review-item {
  display: flex;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed #e2e8f0;
}

.review-item label {
  font-weight: bold;
}

.preview-questions {
  margin-top: 2rem;
}

.preview-q {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
}

/* RTL Specifics */
input[type="datetime-local"] {
  direction: ltr;
}

/* Loading text for frequency dropdown */
.loading-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
}
</style>
