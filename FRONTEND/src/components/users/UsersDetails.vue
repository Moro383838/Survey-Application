<template>
    <div class="user-details-page">
      <div class="back-section">
        <button class="back-btn" @click="$router.back()">
          ← العودة
        </button>
      </div>
      <div class="user-header">
        <div class="user-avatar">{{ getInitials(user?.username) }}</div>
        <div class="user-info">
          <h1>{{ user?.username }}</h1>
        </div>
      </div>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon">🏫</div>
          <div class="stat-info">
            <h3>{{ getSchoolsCount() }}</h3>
            <p>مدارس مرتبطة</p>
          </div>
        </div>
      </div>
      <div class="details-section">
        <div class="details-card">
          <h3>📋 المعلومات الأساسية</h3>
          
          <div class="detail-item">
            <span class="detail-label">اسم المستخدم:</span>
            <span class="detail-value">{{ user?.username || '-' }}</span>
          </div>
          <div v-if="hasSchools" class="details-card">
          <h3>🏫 المدارس المرتبطة</h3>
          <div class="schools-list">
            <div v-for="school in user.schools" :key="school.id" class="school-item">
              <span class="school-icon">🏫</span>{{ school.name }}
              <span class="school-name">{{ school.name }}</span>
            </div>
          </div>
      </div>
        </div>
    </div>

      <div class="actions-section">
        <button class="btn btn-danger" @click="deleteUser">
          🗑️ حذف المستخدم
        </button>
        <button class="btn btn-secondary" @click="$router.back()">
          إغلاق
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useUsersStore } from '@/stores/users'
    
    const route = useRoute()
    const router = useRouter()
    const usersStore = useUsersStore()
    
    const user = ref(null)
    const userStats = ref(null)
    const loading = ref(true)
    const error = ref(null)
    
    /* تحميل المستخدم */
    const loadUserDetails = async () => {
      try {
        loading.value = true
        error.value = null
    
        // 1️⃣ حاول تجيبه من الستور (لو كان محمّل مسبقًا)
        const cachedUser = usersStore.users.find(
          u => u.id === Number(route.params.id)
        )
    
        if (cachedUser) {
          user.value = cachedUser
        } else {
          // 2️⃣ لو مو موجود → جيبه من السيرفر
          const fetchedUser = await usersStore.getUserById(Number(route.params.id))
          user.value = fetchedUser
        }
    
        await loadUserStats()
      } catch (err) {
        console.error('❌ خطأ في تحميل تفاصيل المستخدم:', err)
        error.value = 'فشل في تحميل تفاصيل المستخدم'
      } finally {
        loading.value = false
      }
    }
    
    /* إحصائيات وهمية (مؤقتًا) */
    const loadUserStats = async () => {
      userStats.value = {
        surveys: Math.floor(Math.random() * 20),
        responses: Math.floor(Math.random() * 100),
        rating: (Math.random() * 5).toFixed(1)
      }
    }
    
    onMounted(loadUserDetails)

    const getInitials = (username) => {
      if (!username) return 'م'
      return username.charAt(0).toUpperCase()
    }
    
const getRoleText = (role) => {
  const roles = {
    // حالة النصوص
    'ADMIN': 'مدير النظام',
    'SCHOOL_USER': 'مستخدم مدرسة',
    'ANALAYZER_USER': 'محلل بيانات',
    // حالة الأرقام (IDs)
    1: 'مدير النظام',
    2: 'مستخدم مدرسة',
    3: 'محلل بيانات'
  }
  return roles[role] || 'غير محدد'
}
    
    const hasSchools = computed(() => {
      return user.value?.schools && Array.isArray(user.value.schools) && user.value.schools.length > 0
    })
    
    const getSchoolsArray = () => {
      return user.value?.schools?.map(school => school?.name) || []
    }
    
    const getSchoolsCount = () => getSchoolsArray().length
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const getPermissionsText = () => ({
      ADMIN: 'صلاحيات كاملة',
      SCHOOL_USER: 'إدارة المدارس المعينة',
      ANALAYZER_USER: 'تحليل البيانات'
    }[user.value?.role] || 'صلاحيات محدودة')

    const deleteUser = async () => {
      if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.value.username}"؟`)) return
    
      try {
        await usersStore.deleteUser(user.value.id)
        router.push('/dashboard/users')
      } catch (err) {
        alert(err.message || 'فشل حذف المستخدم')
      }
    }
    </script>
    
  <style scoped>
  .user-details-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .back-section {
    margin-bottom: 20px;
  }
  
  .back-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s;
  }
  
  .back-btn:hover {
    background: #f1f5f9;
  }
  
  .user-header {
    display: flex;
    align-items: center;
    gap: 20px;
    background: white;
    padding: 30px;
    border-radius: 16px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .user-avatar {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #52B5AB, #126E70);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
    font-weight: bold;
  }
  
  .user-info h1 {
    margin: 0 0 8px 0;
    color: #1e293b;
    font-size: 28px;
  }
  
  .user-info p {
    margin: 0;
    color: #64748b;
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
  }
  
  .stat-icon {
    font-size: 24px;
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #D9FFFA;
    color: #126E70;
  }
  
  .stat-info h3 {
    font-size: 24px;
    color: #1e293b;
    margin: 0 0 4px 0;
  }
  
  .stat-info p {
    color: #64748b;
    margin: 0;
  }
  
  .details-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .details-card {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .details-card h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 18px;
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .detail-item:last-child {
    border-bottom: none;
  }
  
  .detail-label {
    color: #64748b;
    font-weight: 500;
  }
  
  .detail-value {
    color: #1e293b;
    font-weight: 600;
  }
  
  .role-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }
  
  .role-badge.admin {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .role-badge.school-user {
    background: #D9FFFA;
    color: #126E70;
  }
  
  .role-badge.analayzer-user {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    color: #166534;
  }
  
  .status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }
  
  .status-badge.active {
    background: #d1fae5;
    color: #065f46;
  }
  
  .status-badge.inactive {
    background: #fef3c7;
    color: #92400e;
  }
  
  .permissions-badge {
    display: inline-block;
    padding: 6px 12px;
    background: #f8fafc;
    color: #475569;
    border-radius: 8px;
    font-size: 13px;
    border: 1px solid #e2e8f0;
  }
  
  .schools-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .school-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s;
  }
  
  .school-item:hover {
    background: #f1f5f9;
  }
  
  .school-icon {
    font-size: 20px;
  }
  
  .school-name {
    color: #1e293b;
    font-weight: 500;
  }
  
  .actions-section {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 30px;
    padding: 20px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .btn {
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #52B5AB, #126E70);
    color: white;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(82, 181, 171, 0.3);
  }
  
  .btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }
  
  .btn-danger:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
  }
  
  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  
  .btn-secondary:hover {
    background: #e2e8f0;
  }
  
  @media (max-width: 768px) {
    .user-header {
      flex-direction: column;
      text-align: center;
    }
    
    .stats {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .actions-section {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>