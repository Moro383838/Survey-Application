<template>
    <div class="school-details-page">
      <div class="back-section">
        <button class="back-btn" @click="$router.back()">
          ← العودة
        </button>
      </div>

      <div class="school-header">
        <div class="school-avatar">🏫</div>
        <div class="school-info">
          <h1>{{ school.name }}</h1>
          <p>{{ school.region }} • الرمز: {{ school.code }}</p>
        </div>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ school.users_count || 0 }}</h3>
            <p>عدد الموظفين</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <h3>{{ formatDate(school.created_at) }}</h3>
            <p>تاريخ الإنشاء</p>
          </div>
        </div>
      </div>

      <div class="details-section">
        <div class="details-card">
          <h3>📋 المعلومات الأساسية</h3>
          
          <div class="detail-item">
            <span class="detail-label">اسم المدرسة:</span>
            <span class="detail-value">{{ school.name }}</span>
          </div>
          <div class="detail-item">
              <span class="detail-label">المديرية:</span>
              <span class="detail-value">{{ school.directorate_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">المجمع:</span>
              <span class="detail-value">{{ school.complex_name }}</span>
            </div>
          <div class="detail-item">
            <span class="detail-label">الرمز الوزاري:</span>
            <span class="detail-value">{{ school.code }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">المنطقة:</span>
            <span class="detail-value">{{ school.region }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">تاريخ الإنشاء:</span>
            <span class="detail-value">{{ formatDate(school.created_at) }}</span>
          </div>
            <div class="detail-item"> 
                <span class="detail-label">المستخدمين المرتبطين:</span> 
                <span class="detail-value">{{ school.linked_users?.map(user => user?.username).join(', ') || 'لا يوجد مستخدمين مرتبطين' }}</span>
            </div>
        </div>
        <div class="users-section" v-if="schoolUsers.length > 0">
          <h3>👥 المستخدمين المرتبطين</h3>
          <div class="users-list">
            <div v-for="user in schoolUsers" :key="user.id" class="user-card">
              <div class="user-avatar">{{ getInitials(school.linked_users.map(user => user.username).join(', ') || 'لا يوجد مستخدمين مرتبطين') }}</div>
              <div class="user-info">
                <strong>{{ school.linked_users.map(user => user.username).join(', ') || 'لا يوجد مستخدمين مرتبطين' }}</strong>
                <span class="user-role">{{ getRoleText(school.linked_users.map(user => user.role).join(', ') || 'لا يوجد مستخدمين مرتبطين') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button class="btn btn-secondary" @click="$router.back()">
          إغلاق
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { schoolService } from '@/api/index.js'
  
  const route = useRoute()
  const school = ref({})
  const schoolUsers = ref([])
  const loading = ref(true)
  
  onMounted(async () => {
    await loadSchoolDetails()
  })
  
  const loadSchoolDetails = async () => {
    try {
      const response = await schoolService.getById(route.params.id)
      school.value = response.data || {}
      await loadSchoolUsers()
    } catch (error) {
      console.error('❌ خطأ في تحميل تفاصيل المدرسة:', error)
    } finally {
      loading.value = false
    }
  }
  
  const loadSchoolUsers = async () => {
    try {
      const response = await schoolService.getById(route.params.id)
      schoolUsers.value = response.data || []
    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات المدرسة:', error)
    }
  }
  
  const getInitials = (username) => {
    if (!username) return 'م'
    return username.charAt(0).toUpperCase()
  }
  
  const getRoleText = (role) => {
    const roles = {
      'ADMIN': 'مدير النظام',
      'SCHOOL_USER': 'مستخدم مدرسة',
      'ANALAYZER_USER': 'محلل بيانات'
    }
    return roles[role] || role
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }
  </script>
  
  <style scoped>
  .school-details-page {
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
  
  .school-header {
    display: flex;
    align-items: center;
    gap: 20px;
    background: white;
    padding: 30px;
    border-radius: 16px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .school-avatar {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #52B5AB, #126E70);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: white;
  }
  
  .school-info h1 {
    margin: 0 0 8px 0;
    color: #1e293b;
    font-size: 28px;
  }
  
  .school-info p {
    margin: 0;
    color: #64748b;
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
  
  .details-card, .users-section {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .details-card h3, .users-section h3 {
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
  
  .users-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .user-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.3s;
  }
  
  .user-card:hover {
    background: #f1f5f9;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #52B5AB, #126E70);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-info strong {
    color: #1e293b;
    font-size: 15px;
  }
  
  .user-role {
    color: #64748b;
    font-size: 13px;
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
  
  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  
  .btn-secondary:hover {
    background: #e2e8f0;
  }

  @media (max-width: 768px) {
    .school-details-page {
      padding: 12px;
    }

    .school-header {
      flex-direction: column;
      text-align: center;
      padding: 20px;
    }

    .school-avatar {
      width: 60px;
      height: 60px;
      font-size: 28px;
    }

    .school-info h1 {
      font-size: 22px;
    }

    .stats {
      grid-template-columns: 1fr;
    }

    .details-card, .users-section {
      padding: 20px;
    }

    .detail-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .detail-label {
      font-size: 13px;
    }

    .detail-value {
      font-size: 15px;
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