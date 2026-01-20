<template>
  <div class="login-page">
    <!-- Header -->
    <header class="login-header">
      <div class="header-content">
        <div class="logo-section">
          <img src="/Syrian Arab Republic.svg" alt="شعار الجمهورية" class="header-logo" />
        </div>
        <div class="system-info">
          <h1>نظام الاستبيانات</h1>
          <p>الإلكتروني للمدارس</p>
        </div>
      </div>
    </header>
    <!-- Main Content -->
    <main class="login-main">
      <div class="login-card">
        <div class="card-header">
          <div class="seal-container">
            <img src="../../public/logo.png" alt="شعار النظام" class="card-seal" />
          </div>
          <h2 class="card-title">تسجيل الدخول</h2>
          <p class="card-subtitle">أدخل بياناتك للوصول إلى النظام</p>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">اسم المستخدم</label>
            <div class="input-container">
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                required
                placeholder="أدخل اسم المستخدم"
                :disabled="isLoading"
              />
              <span class="input-icon">👤</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">كلمة المرور</label>
            <div class="input-container">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                required
                placeholder="أدخل كلمة المرور"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :disabled="isLoading"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
          </div>

          <button
            type="submit"
            class="login-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span>{{ isLoading ? 'جاري التحقق...' : 'تسجيل الدخول' }}</span>
          </button>
        </form>
      </div>
    </main>

    <!-- Footer -->
    <footer class="login-footer">
      <p>2025 نظام الاستبيانات الإلكتروني للمدارس. جميع الحقوق محفوظة.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)
const error = ref(null)
const isLoading = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  error.value = null

  try {
    console.log('📝 محاولة تسجيل دخول...')
    
    await authStore.login({
      username: form.username,
      password: form.password
    })

    console.log('✅ تسجيل دخول ناجح في التطبيق')
    console.log('👤 المستخدم:', authStore.user)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Redirect based on user role
    if (authStore.isAdmin || authStore.hasAnalyticsAccess) {
      // Both Admins and Analysts go to the Dashboard
      router.push('/dashboard')
    } else {
      router.push('/home')
    }
    
  } catch (err) {
    console.error('❌ خطأ في التسجيل:', err)
    error.value = 'بيانات الدخول غير صحيحة'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

/* Header */
.login-header {
  background: var(--gradient-primary);
  padding: 0.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 10;
  overflow: visible;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-logo {
  height: 120px;
  width: auto;
  display: block;
  flex-shrink: 1;

  transform: scale(2.3);
  transform-origin: center;
}


.system-info h1 {
  color: #ffff;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  text-align: left;
}

.system-info p {
  color: #ffff;
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.8;
  text-align: left;
}

/* Main */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

/* Card */
.login-card {
  background-color: #ffffff;
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: relative;
  border-top: 5px solid var(--primary-gold);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.seal-container {
  width: 80px;
  height: 80px;
  margin: -60px auto 1rem; /* Pull up */
  background: #ffffff;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--primary-gold);
}

.card-seal {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-title {
  color: var(--primary-dark);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.card-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: var(--primary-dark);
  font-weight: 600;
  font-size: 0.95rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  padding-left: 2.5rem; /* Space for icon/toggle */
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  color: #002623;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  background-color: #ffffff;
  border-color: var(--primary-gold);
  box-shadow: 0 0 0 3px rgba(185, 167, 121, 0.1);
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #002623;
  opacity: 0.5;
}

.password-toggle {
  position: absolute;
  left: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #002623;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.password-toggle:hover {
  opacity: 1;
}

/* Button */
.login-button {
  background: var(--gradient-primary);
  color: #ffffff;
  border: 1px solid var(--primary-gold);
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
}

.login-button:hover:not(:disabled) {
  background: var(--gradient-gold);
  color: var(--primary-dark);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #fca5a5;
}

/* Footer */
.login-footer {
  background: var(--gradient-primary);
  padding: 1.5rem;
  text-align: center;
  color: var(--primary-gold);
  font-size: 0.85rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 640px) {
  .login-header {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }

  /* Reduce logo height on small screens so it doesn't overwhelm layout */
  .header-logo {
    height: 100px;
    max-height: 100px;
  }
}
</style>