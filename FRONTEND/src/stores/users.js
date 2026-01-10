import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/api/index.js'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchText = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const filteredUsers = computed(() => {
    if (!searchText.value) return users.value

    const q = searchText.value.toLowerCase()
    return users.value.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q)
    )
  })

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filteredUsers.value.slice(start, start + itemsPerPage.value)
  })

  const totalUsers = computed(() => filteredUsers.value.length)

  const stats = computed(() => {
    const usersList = users.value
    
    if (!Array.isArray(usersList) || usersList.length === 0) {
      return {
        admins: 0,
        schoolUsers: 0,
        analayzerUsers: 0,
        total: 0,
        schoolsCount: 0
      }
    }

    const admins = usersList.filter(u => u.role === 'ADMIN').length
    const schoolUsers = usersList.filter(u => u.role === 'SCHOOL_USER').length
    const analayzerUsers = usersList.filter(u => u.role === 'ANALAYZER_USER').length

    const allSchools = new Set()
    
    usersList.forEach(user => {
      if (user.school_names && user.school_names !== 'N/A' && user.school_names.trim() !== '') {
        const schoolsArray = user.school_names.split(',').map(name => name.trim())
        schoolsArray.forEach(school => {
          if (school && school !== 'N/A') {
            allSchools.add(school)
          }
        })
      }
    })

    return {
      admins,
      schoolUsers,
      analayzerUsers,
      total: usersList.length,
      schoolsCount: allSchools.size
    }
  })

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
  
    try {
      const response = await userService.getAll()
      
      if (response.data && Array.isArray(response.data.users)) {
        users.value = response.data.users
        console.log(`✅ تم تحميل ${users.value.length} مستخدم`)
      } else {
        console.warn('⚠️ البيانات ليست في التنسيق المتوقع:', response.data)
        users.value = []
        error.value = 'تنسيق البيانات غير صحيح'
      }
      
    } catch (err) {
      error.value = 'فشل تحميل المستخدمين'
      console.error('❌ خطأ في جلب المستخدمين:', err)
      users.value = []
    } finally {
      loading.value = false
    }
  }

  const getUserById = async (id) => {
    const { data } = await userService.getById(id)
    return data
  }
  const searchUsers = (text) => {
    searchText.value = text
    currentPage.value = 1
  }

  const setPage = (page) => {
    currentPage.value = page
  }

  // ✅ التعديل هنا: إزالة role من البيانات المرسلة
  const addUser = async (payload) => {
    try {
      console.log('📤 إرسال بيانات المستخدم:', payload)
      
      const apiPayload = {
        username: payload.username,
        password: payload.password,
        // role: payload.role, ❌ تم الحذف لأن الباك يرفضه
        roleId: payload.roleId // ✅ نرسل فقط roleId
      }
      
      if (payload.schoolIds && Array.isArray(payload.schoolIds) && payload.schoolIds.length > 0) {
        apiPayload.schoolIds = payload.schoolIds.map(id => Number(id))
      }
      
      console.log('📦 Payload المعدل المرسل للباك:', apiPayload)
      
      const { data } = await userService.create(apiPayload)
      
      if (data.success === false || data.error) {
        throw new Error(data.message || data.error || 'فشل إنشاء المستخدم')
      }
      
      await fetchUsers() 
      
      return data.user || data.data || data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'حدث خطأ أثناء إضافة المستخدم'
      
      error.value = errorMessage
      console.error('❌ خطأ في إضافة المستخدم:', err)
      
      throw new Error(errorMessage)
    }
  }

  // ✅ التعديل هنا أيضاً: إزالة role من بيانات التحديث
  const updateUser = async (id, payload) => {
    try {
      const updateData = {
        username: payload.username,
        // role: payload.role, ❌ تم الحذف
        roleId: payload.roleId // ✅ نرسل فقط roleId
      }
      
      if (payload.password && payload.password.trim() !== '') {
        updateData.password = payload.password
      }
      
      if (payload.schoolIds && Array.isArray(payload.schoolIds)) {
        updateData.schoolIds = payload.schoolIds.map(id => Number(id))
      } else if (payload.schoolIds === null || payload.schoolIds === undefined) {
        updateData.schoolIds = []
      }
      
      const { data } = await userService.update(id, updateData)
      
      if (data.success === false || data.error) {
        throw new Error(data.message || data.error || 'فشل تحديث المستخدم')
      }
      
      await fetchUsers()
      
      return data.user || data.data || data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'حدث خطأ أثناء تحديث المستخدم'
      
      error.value = errorMessage
      console.error('❌ خطأ في تحديث المستخدم:', err)
      throw new Error(errorMessage)
    }
  }

  const deleteUser = async (id) => {
    try {
      await userService.delete(id)
      users.value = users.value.filter(u => u.id !== id)
      console.log(`✅ تم حذف المستخدم ${id} بنجاح`)
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'حدث خطأ أثناء حذف المستخدم'
      error.value = errorMessage
      console.error('❌ خطأ في حذف المستخدم:', err)
      throw new Error(errorMessage)
    }
  }

  const getSchoolById = (id) => {
    return users.value.find(s => s.id === id)
  }

  return {
    users,
    loading,
    error,
    searchText,
    currentPage,
    itemsPerPage,
    filteredUsers,
    paginatedUsers,
    totalUsers,
    stats,
    fetchUsers,
    searchUsers,
    setPage,
    addUser,
    updateUser,
    deleteUser,
    getSchoolById,
    getUserById
  }
})