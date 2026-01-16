import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/brand-identity.css'
import './assets/main.css'

import router from './router/index.js'

if (import.meta.env.DEV) {
  console.warn = () => { }
}
try {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  app.use(router)

  app.mount('#app')

} catch (error) {
  console.error('❌ Error starting application:', error)
  console.error('🔍 Error details:', error.message)
  console.error('📄 Error stack:', error.stack)
}