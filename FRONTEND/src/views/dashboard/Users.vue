<template>
  <div class="users-page">
    <div class="page-header fixed-header">
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

    <UsersDetails
      v-if="showViewModal && selectedUser"
      :user="selectedUser"
      @close="showViewModal = false"
    />

    <DeleteUserModal 
      v-if="showDeleteModal && selectedUser"
      :user="selectedUser"
      @close="showDeleteModal = false"
      @user-deleted="handleUserDeleted"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UsersTable from '@/components/users/UsersTable.vue'
import AddUserModal from '@/components/users/AddUserModal.vue'
import EditUserModal from '@/components/users/EditUserModal.vue'
import UsersDetails from '@/components/users/UsersDetails.vue'
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
const showViewModal = ref(false)

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
  selectedUser.value = user
  showViewModal.value = true
}


onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
  padding: 24px;
  max-width: 100%;
  width: 100%;
  margin: 0;
  position: relative;
  min-height: calc(100vh - 128px);
  background-color: #ffff;
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
  color: #ffffff;
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
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(5,66,57,0.06);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffff;
  color: #054239;
  border: 1px solid #edebe0;
}

.stat-info h3 {
  font-size: 28px;
  color: #054239;
  margin: 0 0 4px 0;
}

.stat-info p {
  color: #054239;
  margin: 0;
  opacity: 0.8;
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
  border: 1px solid #edebe0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #edebe0;
  box-shadow: 0 0 0 3px rgba(237,235,224,0.35);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #054239;
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
  border: 4px solid #edebe0;
  border-top: 4px solid #054239;
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
  background: #edebe0;
  border-radius: 12px;
  border: 1px solid #edebe0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #054239;
}

.error-state h3 {
  color: #054239;
  margin-bottom: 8px;
}

.error-state p {
  color: #054239;
  margin-bottom: 20px;
}

.retry-btn {
  background: #054239;
  color: #ffffff;
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
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(5,66,57,0.06);
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #edebe0;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background: #edebe0;
  color: #054239;
}

.pagination-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination-info {
  color: #054239;
  font-weight: 500;
}

@media (max-width: 768px) {
  .users-page {
    padding: 16px;
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
  
  .add-btn {
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