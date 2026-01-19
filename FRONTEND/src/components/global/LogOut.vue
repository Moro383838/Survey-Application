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
      <div class="logout-icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </div>
      <span class="logout-text">خروج</span>
    </button>
  </template>
  
  <style scoped>
  .logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--primary-gold);
    border: 1px solid rgba(185, 167, 121, 0.3);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);
    width: auto;
    height: 38px;
  }
  
  .logout-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  }
  
  .logout-text {
    display: none; /* Hidden on small mobile */
  }
  
  .logout-btn:hover {
    background: var(--primary-gold);
    color: var(--primary-dark);
    box-shadow: 0 4px 15px rgba(185, 167, 121, 0.4);
    transform: translateY(-2px);
    border-color: var(--primary-gold);
  }

  .logout-btn:hover .logout-icon-wrapper {
    transform: translateX(-3px); /* Shift icon slightly on RTL */
  }
  
  .logout-btn:active {
    transform: translateY(0);
  }
  
  /* Show text on larger screens */
  @media (min-width: 768px) {
    .logout-btn {
      padding: 6px 16px;
    }
    
    .logout-text {
      display: inline;
    }
  }

  /* Specific adjustment for even smaller screens */
  @media (max-width: 480px) {
    .logout-btn {
      padding: 6px;
      min-width: 38px;
    }
  }
  </style>
  