import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { schoolService, aidService } from '@/api/index.js'

export const useSchoolsStore = defineStore('schools', () => {

  // --- State ---
  const schools = ref([])
  const directorates = ref([]) // قائمة المديريات
  const complexes = ref([])    // قائمة المجمعات
  
  const loading = ref(false)
  const error = ref(null)
  const searchText = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const stats = ref({})

  // --- Computed ---
  const filteredSchools = computed(() => {
    if (!searchText.value) return schools.value
    
    const query = searchText.value.toLowerCase()
    return schools.value.filter(school => 
      school.name?.toLowerCase().includes(query) ||
      school.code?.toLowerCase().includes(query) ||
      school.region?.toLowerCase().includes(query)
    )
  })

  // --- Actions ---

  // 1. جلب المدارس
  const fetchSchools = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await schoolService.getAll()
      schools.value = response.data || []
    } catch (err) {
      error.value = 'فشل في تحميل المدارس: ' + (err.response?.data?.error || err.message)
      console.error('❌ خطأ في جلب المدارس:', err)
    } finally {
      loading.value = false
    }
  }

  // 2. جلب الإحصائيات
  const fetchStats = async () => {
    try {
      const response = await schoolService.getStats()
      // ✅ تحديث: تخزين البيانات كما تأتي من الباك إند
      const data = response.data
      
      stats.value = {
        total_schools: data.total_schools || 0,
        empty_schools_count: data.empty_schools_count || 0,
        active_schools: (data.total_schools - (data.empty_schools_count || 0)) || 0, // حساب المدارس النشطة
        directorates_distribution: data.directorates_distribution || {}
      }
    } catch (err) {
      console.warn('خطأ في تحميل الاحصائيات')
      // حساب محلي في حال الفشل
    }
  }

  // 3. إضافة مدرسة
  const addSchool = async (schoolData) => {
    try {
      const response = await schoolService.create(schoolData)
      schools.value.push(response.data)
      return response.data
    } catch (err) {
      throw err
    }
  }

  // 4. تعديل مدرسة
  const updateSchool = async (id, payload) => {
    try {
      const { data } = await schoolService.update(id, payload)
      const index = schools.value.findIndex(s => s.id === Number(id))
      if (index !== -1) {
        schools.value[index] = { ...schools.value[index], ...data }
      }
      return data
    } catch (err) {
      throw err
    }
  }

  // 5. حذف مدرسة
  const deleteSchool = async (id) => {
    try {
      await schoolService.delete(id)
      schools.value = schools.value.filter(s => s.id !== id)
    } catch (err) {
      throw err
    }
  }

  // --- Aid Service Actions (جديد) ---

  // جلب المديريات
  const fetchDirectorates = async () => {
    try {
      const response = await aidService.getDirectorates()
      directorates.value = response.data || []
      return directorates.value
    } catch (err) {
      console.error('فشل جلب المديريات', err)
      throw err
    }
  }

  // جلب المجمعات بناءً على المديرية
  const fetchComplexes = async (directorateId) => {
    // تصفير القائمة القديمة
    complexes.value = []
    try {
      const response = await aidService.getComplexes(directorateId)
      complexes.value = response.data || []
      return complexes.value
    } catch (err) {
      console.error('فشل جلب المجمعات', err)
      throw err
    }
  }

  const getSchoolById = (id) => {
    return schools.value.find(s => s.id === id)
  }

  return {
    schools,
    directorates,
    complexes,
    loading,
    error,
    searchText,
    currentPage,
    itemsPerPage,
    filteredSchools,
    stats,
    
    fetchSchools,
    fetchStats,
    addSchool,
    updateSchool,
    deleteSchool,
    getSchoolById,
    
    // تصدير الدوال الجديدة
    fetchDirectorates,
    fetchComplexes
  }
})