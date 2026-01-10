<script setup>
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  const handleLogout = () => {
    authStore.logout()
    router.replace('/login')
  }
  </script>
  
  <template>
    <button @click="handleLogout" class="logout-btn">
      <span class="logout-icon">🚪</span>
      <span>تسجيل الخروج</span>
    </button>
  </template>
  
  <style scoped>
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #fef2f2, #fecaca);
    color: #dc2626;
    border: 1px solid #fca5a5;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }
  .logout-btn:hover {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
  }
  </style>
  