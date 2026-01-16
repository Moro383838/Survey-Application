<template>
  <div class="surveys-page">
    <!-- Fixed Page Header -->
    <div class="page-header fixed-header">
      <div class="header-content">
        <div>
          <h1>إدارة الاستبيانات</h1>
          <p class="header-subtitle">عرض وإدارة جميع الاستبيانات في النظام</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-add-survey" @click="router.push('/surveys/create-wizard')">
          <span class="btn-icon">➕</span>
          إنشاء استبيان جديد
        </button>
      </div>
    </div>

    <!-- بطاقات الإحصائيات -->
    <div class="stats-cards">
      <div class="stat-card" :style="statCardStyle(0)">
        <div class="stat-info">
          <h3>{{ stats.total_surveys || 0 }}</h3>
          <p>إجمالي الاستبيانات</p>
        </div>
      </div>
      <div class="stat-card" :style="statCardStyle(1)">
        <div class="stat-info">
          <h3>{{ stats.active_surveys || 0 }}</h3>
          <p>نشطة</p>
        </div>
      </div>
      <div class="stat-card" :style="statCardStyle(2)">
        <div class="stat-info">
          <h3>{{ stats.draft_surveys || 0 }}</h3>
          <p>مسودة</p>
        </div>
      </div>
      <div class="stat-card" :style="statCardStyle(3)">
        <div class="stat-info">
          <h3>{{ stats.completed_surveys || 0 }}</h3>
          <p>مكتملة</p>
        </div>
      </div>
      <div class="stat-card" :style="statCardStyle(4)">
        <div class="stat-info">
          <h3>{{ stats.periodic_surveys || 0 }}</h3>
          <p>دورية</p>
        </div>
      </div>
    </div>

    <!-- البحث والتصفية -->
    <div class="controls-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="ابحث في الاستبيانات..."
            class="search-input"
            @input="handleSearch"
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">
            ✖️
          </button>
        </div>
      </div>

      <div class="filters-container">
        <select v-model="statusFilter" class="filter-select" @change="applyFilters">
          <option value="">جميع الحالات</option>
          <option value="1">مسودة</option>
          <option value="2">نشط</option>
          <option value="3">مكتمل</option>
        </select>

        <select v-model="typeFilter" class="filter-select" @change="applyFilters">
          <option value="">جميع الأنواع</option>
          <option value="periodic">دوري</option>
          <option value="regular">عادي</option>
        </select>

        <input
          type="date"
          v-model="dateFilter"
          class="filter-select date-filter"
          @change="applyFilters"
          placeholder="تاريخ الإنشاء"
        />

        <button class="btn-refresh" @click="refreshSurveys" :disabled="store.loading">
          <span v-if="store.loading" class="loading-spinner-small"></span>
          <span v-else>🔄</span>
          تحديث
        </button>
      </div>
    </div>

    <!-- جدول الاستبيانات -->
    <div class="table-section">
      <SurveysTable
        :surveys="paginatedSurveys"
        @view="handleViewSurvey"
        @edit="handleEditSurvey"
        @delete="handleDeleteSurvey"
        @close="handleCloseSurvey"
        @publish="handlePublishSurvey"
        @unpublish="handleUnpublishSurvey"
        @draft="handleDraftSurvey"
      />

      <!-- حالة التحميل -->
      <div v-if="store.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>جاري تحميل الاستبيانات...</p>
      </div>

      <!-- حالة عدم وجود بيانات -->
      <div v-if="!store.loading && store.surveys.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>لا توجد استبيانات</h3>
        <p>ابدأ بإنشاء أول استبيان لك</p>
        <button class="btn-primary" @click="router.push('/surveys/create-wizard')">
          <span class="btn-icon">➕</span>
          إنشاء استبيان جديد
        </button>
      </div>

      <!-- حالة عدم وجود نتائج بحث -->
      <div v-if="!store.loading && store.surveys.length > 0 && filteredSurveys.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>لا توجد نتائج</h3>
        <p>لم يتم العثور على استبيانات تطابق بحثك</p>
        <button class="btn-secondary" @click="clearFilters">
          ✨ إعادة تعيين البحث
        </button>
      </div>
    </div>

    <!-- الترقيم -->
    <div v-if="filteredSurveys.length > 0" class="pagination-section">
      <div class="pagination-info">
        عرض {{ startIndex + 1 }}-{{ endIndex }} من {{ filteredSurveys.length }} استبيان
      </div>
      <div class="pagination-controls">
        <button
          class="pagination-btn"
          @click="prevPage"
          :disabled="store.currentPage === 1"
        >
          ‹ السابق
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-number"
            :class="{ active: page === store.currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-if="hasMorePages" class="page-ellipsis">...</span>
        </div>
        <button
          class="pagination-btn"
          @click="nextPage"
          :disabled="store.currentPage === totalPages"
        >
          التالي ›
        </button>
      </div>
      <div class="items-per-page">
        <label>العناصر لكل صفحة:</label>
        <select v-model="store.itemsPerPage" @change="handlePageSizeChange" class="page-size-select">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>

    <!-- مودال إضافة استبيان -->
    <AddSurveyModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @survey-added="handleSurveyAdded"
    />

    <!-- مودال تعديل استبيان -->
    <EditSurveyModal
      v-if="showEditModal"
      :survey="selectedSurvey"
      @close="showEditModal = false"
      @survey-updated="handleSurveyUpdated"
    />

    <!-- مودال حذف استبيان -->
    <DeleteSurveyModal
      v-if="showDeleteModal"
      :survey="selectedSurvey"
      @close="showDeleteModal = false"
      @survey-deleted="handleSurveyDeleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSurveyStore } from '@/stores/surveys'
import SurveysTable from '@/components/surveys/SurveysTable.vue'
import AddSurveyModal from '@/components/surveys/modals/AddSurveyModal.vue'
import EditSurveyModal from '@/components/surveys/modals/EditSurveyModal.vue'
import DeleteSurveyModal from '@/components/surveys/modals/DeleteSurveyModal.vue'

const router = useRouter()
const store = useSurveyStore()

// حالة المكون
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedSurvey = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateFilter = ref('')
const debounceTimer = ref(null)

// الحسابات
const filteredSurveys = computed(() => {
  let filtered = store.surveys

  // البحث بالنص
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(survey =>
      survey.title?.toLowerCase().includes(query) ||
      survey.description?.toLowerCase().includes(query) ||
      survey.status_label?.toLowerCase().includes(query)
    )
  }

  // التصفية بالحالة
  if (statusFilter.value) {
    filtered = filtered.filter(survey =>
      String(survey.status_id) === statusFilter.value
    )
  }

  // التصفية بالنوع
  if (typeFilter.value) {
    if (typeFilter.value === 'periodic') {
      filtered = filtered.filter(survey => survey.is_periodic)
    } else if (typeFilter.value === 'regular') {
      filtered = filtered.filter(survey => !survey.is_periodic)
    }
  }

  // التصفية بتاريخ الإنشاء
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value)
    filterDate.setHours(0, 0, 0, 0)
    
    filtered = filtered.filter(survey => {
      if (!survey.created_at) return false
      const surveyDate = new Date(survey.created_at)
      surveyDate.setHours(0, 0, 0, 0)
      return surveyDate.getTime() === filterDate.getTime()
    })
  }

  return filtered
})

const paginatedSurveys = computed(() => {
  const start = (store.currentPage - 1) * store.itemsPerPage
  const end = start + store.itemsPerPage
  return filteredSurveys.value.slice(start, end)
})

const stats = computed(() => store.stats || {})

const totalPages = computed(() => {
  return Math.ceil(filteredSurveys.value.length / store.itemsPerPage)
})

const startIndex = computed(() => {
  return (store.currentPage - 1) * store.itemsPerPage
})

const endIndex = computed(() => {
  const end = startIndex.value + store.itemsPerPage
  return end > filteredSurveys.value.length ? filteredSurveys.value.length : end
})

const visiblePages = computed(() => {
  const pages = []
  const current = store.currentPage
  const total = totalPages.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages.filter((value, index, self) => self.indexOf(value) === index)
})

const hasMorePages = computed(() => {
  return totalPages.value > 7 && store.currentPage < totalPages.value - 3
})

// دورة الحياة
onMounted(async () => {
  await loadInitialData()
})

// الطرق
const loadInitialData = async () => {
  try {
    await Promise.all([
      store.fetchSurveys(),
      store.fetchStats()
    ])
  } catch (error) {
    console.error('❌ خطأ في تحميل البيانات:', error)
  }
}

const refreshSurveys = async () => {
  try {
    await loadInitialData()
  } catch (error) {
    console.error('❌ خطأ في تحديث البيانات:', error)
  }
}

const handleSearch = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  debounceTimer.value = setTimeout(() => {
    store.setPage(1)
  }, 300)
}

const applyFilters = () => {
  store.setPage(1)
}

const clearSearch = () => {
  searchQuery.value = ''
  store.setPage(1)
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
  dateFilter.value = ''
  store.setPage(1)
}

const handleViewSurvey = (survey) => {
  router.push(`/surveys/${survey.id}`)
}

const handleEditSurvey = async (survey) => {
  // إذا كان نشط، يجب إلغاء نشره أولاً
  if (survey.status_id == 2) {
    if (!confirm('هذا الاستبيان نشط حالياً. لتعديله يجب إلغاء نشره أولاً (تحويله لمسودة).\nهل تريد المتابعة؟')) return
    
    // سؤال عن إعادة التعيين
    const shouldReset = confirm('هل تريد أيضاً تصفير (حذف) جميع الإجابات السابقة وجعل المدارس تجيب من جديد؟\n\n- موافق (OK): نعم، احذف الإجابات القديمة.\n- إلغاء (Cancel): لا، احتفظ بالإجابات القديمة.')

    try {
      await store.unpublishSurvey(survey.id, { reset: shouldReset })
      router.push(`/surveys/edit-wizard/${survey.id}`)
    } catch (err) {
      console.error(err)
      alert('فشل إلغاء نشر الاستبيان')
    }
  } else {
    // مسودة أو مغلق
    router.push(`/surveys/edit-wizard/${survey.id}`)
  }
}

const handleDeleteSurvey = (survey) => {
  selectedSurvey.value = survey
  showDeleteModal.value = true
}

const handlePublishSurvey = async (survey) => {
  if (!confirm('هل أنت متأكد من نشر هذا الاستبيان؟ سيصبح مرئياً للمستخدمين.')) return
  
  try {
    await store.publishSurvey(survey.id)
    await refreshSurveys()
  } catch (error) {
    console.error('❌ خطأ في نشر الاستبيان:', error)
  }
}

const handleUnpublishSurvey = async (survey) => {
  try {
    await store.unpublishSurvey(survey.id, false) // false = don't reset answers
    await refreshSurveys()
  } catch (error) {
    console.error('❌ خطأ في إلغاء نشر الاستبيان:', error)
  }
}

const handleCloseSurvey = async (survey) => {
  try {
    await store.closeSurvey(survey.id)
    await refreshSurveys()
  } catch (error) {
    console.error('❌ خطأ في إغلاق الاستبيان:', error)
  }
}

const handleDraftSurvey = async (survey) => {
  try {
    await store.draftSurvey(survey.id)
    await refreshSurveys()
  } catch (error) {
    console.error('❌ خطأ في تحويل الاستبيان لمسودة:', error)
  }
}

const handleSurveyAdded = () => {
  showAddModal.value = false
  refreshSurveys()
}

const handleSurveyUpdated = () => {
  showEditModal.value = false
  refreshSurveys()
}

const handleSurveyDeleted = () => {
  showDeleteModal.value = false
  refreshSurveys()
}

const prevPage = () => {
  if (store.currentPage > 1) {
    store.setPage(store.currentPage - 1)
  }
}

const nextPage = () => {
  if (store.currentPage < totalPages.value) {
    store.setPage(store.currentPage + 1)
  }
}

const goToPage = (page) => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    store.setPage(page)
  }
}

const handlePageSizeChange = () => {
  store.setPage(1)
}

const statCardStyle = (index) => {
  const colors = [
    { bg: '#e6f4f1', border: '#428177', text: '#054239' },
    { bg: '#f0f7f6', border: '#10b981', text: '#065f46' },
    { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' }
  ]

  const colorSet = colors[index % colors.length]

  return {
    backgroundColor: colorSet.bg,
    borderColor: colorSet.border,
    color: colorSet.text
  }
}

// المراقبة
watch([searchQuery, statusFilter, typeFilter], () => {
  if (!showAddModal.value && !showEditModal.value && !showDeleteModal.value) {
    store.setPage(1)
  }
})
</script>

<style scoped>
.surveys-page {
  padding: 24px;
  max-width: 100%;
  width: 100%;
  margin: 0;
  position: relative;
  min-height: calc(100vh - 128px);
  background-color: #ffff;
}

/* رأس الصفحة */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #002623, #001a18);
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 38, 35, 0.12);
  color: #ffffff;
}

/* Fixed Header Styles - Removed sticky behavior */
.fixed-header {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.header-icon {
  font-size: 32px;
  opacity: 0.9;
}

.header-content h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.header-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.btn-add-survey{
  background: linear-gradient(135deg, #002623, #001a18);
  color: #b9a779;
  border: 1px solid #b9a779;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-add-survey:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(185, 167, 121, 0.3);
  background: linear-gradient(135deg, #b9a779, #d4c4a0);
  color: #002623;
}
/* بطاقات الإحصائيات */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 18px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 6px 20px rgba(0, 38, 35, 0.08);
  transition: all 0.3s ease;
  border: 3px solid;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 38, 35, 0.15);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.9);
}

.stat-info h3 {
  margin: 0 0 8px 0;
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
}

.stat-info p {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  opacity: 0.9;
}

/* البحث والتصفية */
.controls-section {
  background: white;
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 16px rgba(0, 38, 35, 0.08);
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 300px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  right: 20px;
  color: #988561;
  font-size: 20px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 16px 60px 16px 20px;
  border: 3px solid #edebe0;
  border-radius: 14px;
  font-size: 16px;
  color: #002623;
  background: #f8f9fa;
  transition: all 0.3s ease;
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  border-color: #428177;
  background: white;
  box-shadow: 0 0 0 4px rgba(66, 129, 119, 0.15);
}

.search-input::placeholder {
  color: #988561;
  opacity: 0.7;
}

.clear-search {
  position: absolute;
  left: 20px;
  background: none;
  border: none;
  color: #988561;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.clear-search:hover {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.filters-container {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 14px 20px;
  border: 3px solid #edebe0;
  border-radius: 12px;
  font-size: 15px;
  color: #002623;
  background: white;
  cursor: pointer;
  min-width: 160px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #428177;
  box-shadow: 0 0 0 3px rgba(66, 129, 119, 0.15);
}

.date-filter {
  min-width: 180px;
  cursor: pointer;
}

.date-filter::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.7;
}

.date-filter::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.btn-refresh {
  background: #edebe0;
  color: #054239;
  border: 3px solid #b9a779;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-refresh:hover:not(:disabled) {
  background: #d1d5db;
  transform: translateY(-2px);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner-small {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(5, 66, 57, 0.3);
  border-top-color: #054239;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* قسم الجدول */
.table-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 38, 35, 0.08);
  min-height: 400px;
  position: relative;
}

/* حالة التحميل */
.loading-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #edebe0;
  border-top-color: #428177;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #054239;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

/* حالة عدم وجود بيانات */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: #f8f9fa;
  border-radius: 20px;
  margin: 40px 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  color: #b9a779;
  opacity: 0.7;
}

.empty-state h3 {
  color: #054239;
  margin-bottom: 12px;
  font-size: 28px;
  font-weight: 700;
}

.empty-state p {
  color: #5D6D7E;
  margin-bottom: 32px;
  font-size: 18px;
  line-height: 1.6;
}

.btn-primary, .btn-secondary {
  padding: 16px 32px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #428177, #054239);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(66, 129, 119, 0.4);
}

.btn-secondary {
  background: #edebe0;
  color: #054239;
  border: 3px solid #b9a779;
}

.btn-secondary:hover {
  background: #d1d5db;
  transform: translateY(-3px);
}

/* الترقيم */
.pagination-section {
  background: white;
  border-radius: 18px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 38, 35, 0.08);
  flex-wrap: wrap;
  gap: 20px;
}

.pagination-info {
  color: #5D6D7E;
  font-size: 15px;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  background: white;
  color: #054239;
  border: 2px solid #b9a779;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.pagination-btn:hover:not(:disabled) {
  background: #edebe0;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: white;
  color: #054239;
  border: 2px solid #edebe0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: #b9a779;
  transform: translateY(-2px);
}

.page-number.active {
  background: #428177;
  color: white;
  border-color: #428177;
}

.page-ellipsis {
  color: #988561;
  font-weight: 600;
  padding: 0 8px;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #5D6D7E;
  font-weight: 600;
}

.page-size-select {
  padding: 10px 16px;
  border: 2px solid #edebe0;
  border-radius: 8px;
  font-size: 14px;
  color: #002623;
  background: white;
  cursor: pointer;
  min-width: 80px;
}

.page-size-select:focus {
  outline: none;
  border-color: #428177;
}

/* التكيف مع الشاشات */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    min-width: 100%;
  }
  
  .filters-container {
    width: 100%;
    justify-content: stretch;
  }
  
  .filter-select {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .surveys-page {
    padding: 140px 16px 16px 16px;
  }
  
  .page-header {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-content h1 {
    font-size: 20px;
  }
  
  .header-subtitle {
    font-size: 12px;
  }
  
  .btn-add-survey {
    width: 100%;
    justify-content: center;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .table-section {
    padding: 16px;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .items-per-page {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .btn-add-survey, .btn-primary, .btn-secondary {
    width: 100%;
  }
  
  .filters-container {
    flex-direction: column;
  }
  
  .filter-select, .btn-refresh {
    width: 100%;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>