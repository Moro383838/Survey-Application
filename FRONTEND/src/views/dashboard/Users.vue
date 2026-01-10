<template>
  <div class="users-page">
    <div class="page-header">
      <div class="header-left">
        <h1>👥 إدارة المستخدمين</h1>
        <p>قم بإدارة حسابات المستخدمين في النظام</p>
      </div>
      <div class="header-right">
        <button class="add-btn" @click="showAddModal = true">
          ➕ إضافة مستخدم جديد
        </button>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-icon">🗂️</div>
        <div class="stat-info">
          <h3>{{ stats.admins }}</h3>
          <p>مديرين</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>{{ stats.schoolUsers }}</h3>
          <p>مستخدمين مدرسة</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <h3>{{ stats.analayzerUsers }}</h3>
          <p>محللين بيانات</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <h3>{{ stats.total }}</h3>
          <p>إجمالي المستخدمين</p>
        </div>
      </div>
    </div>
    
    
    <div class="search-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchText" 
          @input="handleSearch"
          placeholder="ابحث عن مستخدم..."
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>جاري تحميل المستخدمين...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>حدث خطأ</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadUsers">
        🔄 إعادة المحاولة
      </button>
    </div>

    <div v-else class="content-container">
      <UsersTable 
        :users="paginatedUsers"
        @edit="handleEdit"
        @delete="handleDelete"
        @refresh="loadUsers"
        @view="viewUserDetails"
      />

      <div v-if="totalUsers > 0" class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1"
          @click="setPage(currentPage - 1)"
        >
          السابق
        </button>
        
        <span class="pagination-info">
          الصفحة {{ currentPage }} من {{ Math.ceil(totalUsers / itemsPerPage) }}
        </span>
        
        <button 
          class="pagination-btn" 
          :disabled="currentPage >= Math.ceil(totalUsers / itemsPerPage)"
          @click="setPage(currentPage + 1)"
        >
          التالي
        </button>
      </div>
    </div>
  </div>

  <AddUserModal 
    v-if="showAddModal"
    @close="showAddModal = false"
    @user-added="handleUserAdded"
  />

  <EditUserModal 
    v-if="showEditModal && selectedUser"
    :user="selectedUser"
    @close="showEditModal = false"
    @user-updated="handleUserUpdated"
  />

  <DeleteUserModal 
    v-if="showDeleteModal && selectedUser"
    :user="selectedUser"
    @close="showDeleteModal = false"
    @user-deleted="handleUserDeleted"
  />
  <UsersDetails 
    v-if="showDeleteModal && selectedUser"
    :user="selectedUser"
    @close="showDeleteModal = false"
    @user-deleted="viewUserDetails"
  />
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UsersTable from '@/components/users/UsersTable.vue'
import AddUserModal from '@/components/users/AddUserModal.vue'
import EditUserModal from '@/components/users/EditUserModal.vue'
import { useUsersStore } from '@/stores/users.js'
import DeleteUserModal from '@/components/users/DeleteUserModal.vue'
import {useRouter} from 'vue-router'

const router = useRouter()

const usersStore = useUsersStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedUser = ref(null)
const searchText = ref('')
const showDeleteModal = ref(false)

const loading = computed(() => usersStore.loading)
const error = computed(() => usersStore.error)
const paginatedUsers = computed(() => usersStore.paginatedUsers)
const stats = computed(() => usersStore.stats)
const totalUsers = computed(() => usersStore.totalUsers)
const currentPage = computed(() => usersStore.currentPage)
const itemsPerPage = computed(() => usersStore.itemsPerPage)


// const loadUsers = () => {
//   console.log('Store:', usersStore)
//   usersStore.fetchUsers()
// }
const loadUsers = async () => {
  await usersStore.fetchUsers()
}

const handleSearch = () => {
  usersStore.setPage(1)
  usersStore.searchUsers(searchText.value)
}

const handleDelete = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}


const setPage = (page) => {
  usersStore.setPage(page)
}

const handleEdit = (user) => {
  selectedUser.value = user
  showEditModal.value = true
}

const handleUserAdded = () => {
  showAddModal.value = false
  loadUsers() 
}

const handleUserDeleted = () => {
  showDeleteModal.value = false
  loadUsers() 
}

const handleUserUpdated = () => {
  showEditModal.value = false
  loadUsers() 
}
const viewUserDetails = (user) => {
  console.log('عرض تفاصيل المستخدم:', user)
   router.push(`/dashboard/users/${user.id}`)
}


onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  min-height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: var(--gradient-primary);
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.2);
  border: 2px solid var(--primary-gold);
  color: white;
}

.header-left h1 {
  color: white;
  margin-bottom: 8px;
  font-size: 24px;
}

.header-left p {
  color: var(--gold-light);
  margin: 0;
}

.add-btn {
  background: linear-gradient(135deg, #52B5AB, #126E70);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(185, 167, 121, 0.4);
  background: var(--primary-white);
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

.search-input:focus {
  outline: none;
  border-color: var(--primary-gold);
  box-shadow: 0 0 0 3px rgba(185, 167, 121, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}


.content-container {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}


.loading-state {
  text-align: center;
  padding: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .add-btn {
    justify-content: center;
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