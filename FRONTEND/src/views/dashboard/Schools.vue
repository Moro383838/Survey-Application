<template>
    <div class="schools-page">
      <div class="page-header fixed-header">
        <div class="header-left">
          <h1>🏫 إدارة المدارس</h1>
          <p>قم بإدارة المدارس المسجلة في النظام</p>
        </div>
        <div class="header-right">
          <button class="add-btn" @click="showAddModal = true">
            ➕ إضافة مدرسة جديدة
          </button>
        </div>
      </div>
      <div class="search-section">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchText" 
            @input="handleSearch"
            placeholder="ابحث عن مدرسة..."
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>جاري تحميل المدارس...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>حدث خطأ</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchSchools">
          🔄 إعادة المحاولة
        </button>
      </div>

      <div v-else>
        <SchoolsTable 
          :schools="paginatedSchools"
          :loading="loading"
          @edit="handleEdit"
          @delete="handleDelete"
          @refresh="fetchSchools"
          @view="viewDetails"
        />

        <div v-if="filteredSchools.length > 0" class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="setPage(currentPage - 1)"
          >
            السابق
          </button>
          
          <span class="pagination-info">
            الصفحة {{ currentPage }} من {{ Math.ceil(filteredSchools.length / itemsPerPage) }}
          </span>
          
          <button 
            class="pagination-btn" 
            :disabled="currentPage >= Math.ceil(filteredSchools.length / itemsPerPage)"
            @click="setPage(currentPage + 1)"
          >
            التالي
          </button>
        </div>
      </div>
  
      <AddSchoolModal 
        v-if="showAddModal"
        @close="showAddModal = false"
        @school-added="handleSchoolAdded"
      />

      <EditSchoolModal 
        v-if="showEditModal && selectedSchool"
        :school="selectedSchool"
        @close="showEditModal = false"
        @school-updated="handleSchoolUpdated"
      />

      <ViewSchoolModal 
        v-if="showViewModal && selectedSchool"
        :school="selectedSchool"
        @close="showViewModal = false"
      />

      <DeleteSchoolModal 
        v-if="showDeleteModal && selectedSchool"
        :school="selectedSchool"
        @close="showDeleteModal = false"
        @school-deleted="handleSchoolDeleted"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import SchoolsTable from '@/components/schools/SchoolsTable.vue'
  import AddSchoolModal from '@/components/schools/AddSchoolModal.vue'
  import EditSchoolModal from '@/components/schools/EditSchoolModal.vue'
  import DeleteSchoolModal from '@/components/schools/DeleteSchoolModal.vue'
  import ViewSchoolModal from '@/components/schools/ViewSchoolModal.vue'
  import { schoolService } from '@/api/index.js'
  
  const router = useRouter()

  const schools = ref([])
  const stats = ref({})
  const loading = ref(false)
  const error = ref('')
  const searchText = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const showViewModal = ref(false)
  const showDeleteModal = ref(false)
  const selectedSchool = ref(null)
  
  const filteredSchools = computed(() => {
    if (!searchText.value) return schools.value
    
    const query = searchText.value.toLowerCase()
    return schools.value.filter(school => 
      school.name?.toLowerCase().includes(query) ||
      school.code?.toLowerCase().includes(query) ||
      school.region?.toLowerCase().includes(query)
    )
  })
  
  const uniqueRegionsCount = computed(() => {
  if (!schools.value || schools.value.length === 0) return 0
  // استخراج المناطق، فلترة القيم الفارغة، ثم استخدام Set لإزالة التكرار
  const regions = schools.value
    .map(school => school.region)
    .filter(region => region && region.trim() !== '')
  
  return new Set(regions).size
})
  
  const paginatedSchools = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filteredSchools.value.slice(start, start + itemsPerPage.value)
  })
  const fetchSchools = async () => {
    loading.value = true
    error.value = ''
    
    try {
      console.log('🔄 جاري تحميل المدارس...')
      const response = await schoolService.getAll()
      console.log('📦 بيانات المدارس:', response.data)
      schools.value = response.data || []

        console.log('🔍  schools.value:', typeof schools.value)
        console.log('🔍 schools.value ', Array.isArray(schools.value))
        console.log('🔍 schools.value:', schools.value)
      await fetchStats()
      
    } catch (err) {
      error.value = 'فشل في تحميل المدارس: ' + (err.response?.data?.error || err.message)
      console.error('❌ خطأ في جلب المدارس:', err)
    } finally {
      loading.value = false
    }
  }
  const fetchStats = async () => {
  try {
    // محاولة جلب الإحصائيات من السيرفر
    const response = await schoolService.getStats()
    const serverStats = response.data || {}

    // ✅ حساب أعلى عدد موظفين محلياً (لأن السيرفر لا يرجعه حالياً)
    // نبحث عن أعلى قيمة users_count في مصفوفة المدارس
    const maxStaff = schools.value.reduce((max, school) => {
      const count = Number(school.users_count) || 0
      return count > max ? count : max
    }, 0)

    stats.value = {
      ...serverStats,
      max_staff_count: maxStaff // إضافة القيمة المحسوبة يدوياً
    }

  } catch (error) {
    console.warn('⚠️ تعذر جلب الإحصائيات من السيرفر، استخدام حسابات محلية.')
    
    // حسابات محلية بالكامل عند فشل السيرفر
    const maxStaff = schools.value.reduce((max, school) => {
      const count = Number(school.users_count) || 0
      return count > max ? count : max
    }, 0)

    stats.value = {
      total_schools: schools.value.length || 0,
      max_staff_count: maxStaff, // ✅ القيمة الصحيحة
      empty_schools_count: schools.value.filter(s => !s.users_count || s.users_count == 0).length,
      active_schools: schools.value.length || 0
    }
  }
}
  const handleSearch = () => {
    currentPage.value = 1 
  }

  const setPage = (page) => {
    if (page < 1 || page > Math.ceil(filteredSchools.value.length / itemsPerPage)) return
    currentPage.value = page
  }

  const openAddModal = () => {
    showAddModal.value = true
  }

  const handleEdit = (school) => {
    selectedSchool.value = school
    showEditModal.value = true
  }
  
  const handleDelete = (school) => {
    selectedSchool.value = school
    showDeleteModal.value = true
  }
  
  const viewDetails = (school) => {
    selectedSchool.value = school
    showViewModal.value = true
  }

  const handleSchoolAdded = () => {
    showAddModal.value = false
    fetchSchools()
  }
  
  const handleSchoolUpdated = () => {
    showEditModal.value = false
    fetchSchools()
  }
  
  const handleSchoolDeleted = () => {
    showDeleteModal.value = false
    fetchSchools()
  }

  onMounted(() => {
    fetchSchools()
  })
  </script>
  
  <style scoped>
  .schools-page {
    padding: 24px;
    max-width: 100%;
    width: 100%;
    margin: 0;
  }
  
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
    color: white;
  }
  
  .fixed-header {
    position: relative;
    z-index: 1;
    margin-bottom: 20px;
  }
  
  .header-left h1 {
    color: #b9a779;
    margin-bottom: 4px;
    font-size: 20px;
    font-weight: 700;
  }
  
  .header-left p {
    color: #b9a779;
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
  }
  
  .header-right {
    display: flex;
    gap: 12px;
  }
  
.add-btn {
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

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(185, 167, 121, 0.3);
  background: linear-gradient(135deg, #b9a779, #d4c4a0);
  color: #002623;
}

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 38, 35, 0.15);
  }
  
  .stat-icon {
    font-size: 32px;
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-hover);
    color: var(--primary-dark);
    border: 1px solid var(--primary-gold);
  }
  
  .stat-info h3 {
    font-size: 28px;
    color: #1e293b;
    margin: 0 0 4px 0;
  }
  
  .stat-info p {
    color: #64748b;
    margin: 0;
  }
  
  .search-section {
    margin-bottom: 20px;
  }
  
  .search-box {
    position: relative;
    max-width: 400px;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s;
  }
  
  .search-input:focus-visible {
    outline: none;
    border-color: var(--primary-gold);
    box-shadow: 0 0 0 4px rgba(0, 38, 35, 0.12);
  }

  .add-btn:focus-visible,
  .refresh-btn:focus-visible,
  .pagination-btn:focus-visible,
  .retry-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(0, 38, 35, 0.12);
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
  
  /* حالة التحميل */
  .loading-state {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-secondary);
    border-top: 4px solid var(--primary-gold);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-state {
    text-align: center;
    padding: 40px;
    background: #fef2f2;
    border-radius: 12px;
    border: 1px solid #fecaca;
  }
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .error-state h3 {
    color: #dc2626;
    margin-bottom: 8px;
  }
  
  .error-state p {
    color: #991b1b;
    margin-bottom: 20px;
  }
  
  .retry-btn {
    background: #dc2626;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 auto;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .pagination-btn {
    padding: 8px 16px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .pagination-btn:hover:not(:disabled) {
    background: #f1f5f9;
  }
  
  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-info {
    color: #64748b;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .schools-page {
      padding: 140px 16px 16px 16px;
    }
    
    .page-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      padding: 16px;
    }
    
    .header-left h1 {
      font-size: 18px;
    }
    
    .header-right {
      justify-content: stretch;
    }
    
    .add-btn, .refresh-btn {
      flex: 1;
      justify-content: center;
      width: 100%;
    }
    
    .stats {
      grid-template-columns: 1fr 1fr;
    }
    
    .pagination {
      flex-direction: column;
      gap: 10px;
    }
  }
  
  @media (max-width: 480px) {
    .stats {
      grid-template-columns: 1fr;
    }
  }
  </style>