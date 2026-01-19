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
    <button @click="handleLogout" class="logout-btn" title="تسجيل الخروج">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      <span class="logout-text">تسجيل الخروج</span>
    </button>
  </template>
  
  <style scoped>
  .logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: linear-gradient(135deg, #fef2f2, #fecaca);
    color: #dc2626;
    border: 1px solid #fca5a5;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    min-width: 36px;
    height: 36px;
    transition: all 0.2s ease;
  }
  
  .logout-text {
    display: none; /* Hidden by default on mobile */
  }
  
  .logout-btn:hover {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    transform: translateY(-1px);
  }
  
  /* Show text on larger screens */
  @media (min-width: 768px) {
    .logout-btn {
      padding: 0.5rem 1rem;
      width: auto;
    }
    
    .logout-text {
      display: inline;
    }
  }
  </style>
  