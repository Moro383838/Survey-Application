<template>
  <div class="login-container">
    <header class="login-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-container">
            <img src="/logo.png" alt="شعار النظام" class="logo-img" />
            <div class="logo-text">
              <h1>نظام الاستبيانات</h1>
              <p>الإلكتروني للمدارس</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="login-main">
      <div class="login-background">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="bg-shape shape-3"></div>
      </div>

      <div class="login-card-container">
        <div class="login-card">
          <div class="card-logo">
            <div class="card-logo-icon">
              <img src="/logo.png" alt="شعار النظام" class="logo-imgg" />
            </div>
            <h2 class="card-title">تسجيل الدخول</h2>
            <p class="card-subtitle">أدخل بياناتك للوصول إلى النظام</p>
          </div>

          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
              <label for="username" class="form-label">
                <span class="label-icon">👤</span>
                اسم المستخدم
              </label>
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
                <div class="input-border"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">
                <span class="label-icon">🔒</span>
                كلمة المرور
              </label>
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
                  <span class="toggle-icon">
                    {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                  </span>
                </button>
                <div class="input-border"></div>
              </div>
            </div>

            <div v-if="error" class="error-message">
              <span class="error-icon">⚠️</span>
              <span>{{ error }}</span>
            </div>

            <button
              type="submit"
              class="login-button"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="button-loading">
                <span class="loading-spinner"></span>
                <span>جاري التحقق...</span>
              </span>
              <span v-else class="button-content">
                <span> تسجيل الدخول </span>
                <span class="button-icon">→</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
    <footer class="login-footer">
      <div class="footer-content">
        <p>2025 نظام الاستبيانات الإلكتروني للمدارس. جميع الحقوق محفوظة.</p>
        <div class="footer-links">
          <span>الإصدار 1.0.0</span>
          <span class="divider">•</span>
        </div>
      </div>
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
    if (authStore.isAdmin) {
      router.push('/dashboard')
    } else if (authStore.hasAnalyticsAccess) {
      // ANALAYZER_USER goes directly to analytics
      router.push('/dashboard/analytics')
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
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #002623 0%, #001a18 50%, #002623 100%);
  display: flex;
  flex-direction: column;
}

.login-header {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #b9a779;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.logo-imgg {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.logo-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #002623;
  margin: 0;
  line-height: 1.2;
}

.logo-text p {
  font-size: 0.875rem;
  color: #b9a779;
  margin: 0;
  font-weight: 600;
}

.login-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, #b9a779, #d4af37);
  opacity: 0.05;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation: float 20s infinite ease-in-out;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: float 15s infinite ease-in-out reverse;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 20%;
  animation: float 25s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.login-card-container {
  width: 100%;
  max-width: 480px;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 
    0 10px 40px rgba(0, 38, 35, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.05);
  border: 2px solid #b9a779;
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #b9a779, #d4af37);
  border-radius: 24px 24px 0 0;
}

.card-logo {
  text-align: center;
  margin-bottom: 2.5rem;
}

.card-logo-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #002623, #001a18);
  border: 3px solid #b9a779;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 38, 35, 0.2);
}

.card-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #002623;
  margin-bottom: 0.5rem;
}

.card-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #002623;
}

.label-icon {
  font-size: 1.125rem;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #1e293b;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  background: white;
  border-color: #b9a779;
  box-shadow: 0 0 0 3px rgba(185, 167, 121, 0.1);
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #b9a779, #d4af37);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  border-radius: 0 0 12px 12px;
}

.form-input:focus + .input-border {
  transform: scaleX(1);
}

.password-toggle {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #64748b;
  transition: color 0.3s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #b9a779;
}

.password-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-icon {
  font-size: 1.125rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #fca5a5;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-icon {
  font-size: 1.125rem;
}

.login-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #002623, #001a18);
  border: 2px solid #b9a779;
  color: white;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #b9a779, #d4af37);
  color: #002623;
  box-shadow: 
   0 10px 25px rgba(185, 167, 121, 0.3),
   0 5px 10px rgba(185, 167, 121, 0.2);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.button-icon {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.login-button:hover .button-icon {
  transform: translateX(-4px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-top: 2px solid #b9a779;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.footer-content p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #b9a779;
  font-weight: 600;
}

.divider {
  color: #cbd5e1;
}

@media (max-width: 640px) {
  .login-header {
    padding: 1rem;
  }
  
  .logo-text h1 {
    font-size: 1.25rem;
  }
  
  .login-main {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }
  
  .card-logo-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
  }
  
  .footer-content {
    text-align: center;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .divider {
    display: none;
  }
}
</style>