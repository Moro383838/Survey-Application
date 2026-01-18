<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>تفاصيل المدرسة</h3>
        <button class="close-modal" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="school-details" v-if="school">
          <div class="detail-section">
            <h4 class="section-title">المعلومات الأساسية</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">اسم المدرسة:</span>
                <span class="detail-value">{{ school.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">الرمز:</span>
                <span class="detail-value">{{ school.code || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">المنطقة:</span>
                <span class="detail-value">{{ school.region || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">المديرية:</span>
                <span class="detail-value">{{ school.directorate_name || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">المجمع:</span>
                <span class="detail-value">{{ school.complex_name || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">عدد الموظفين:</span>
                <span class="detail-value staff-count" :class="{ 'zero-staff': school.users_count == 0 }">
                  {{ school.users_count || 0 }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="school.created_at || school.updated_at">
            <h4 class="section-title">التواريخ</h4>
            <div class="detail-grid">
              <div class="detail-item" v-if="school.created_at">
                <span class="detail-label">تاريخ الإنشاء:</span>
                <span class="detail-value">{{ formatDate(school.created_at) }}</span>
              </div>
              <div class="detail-item" v-if="school.updated_at">
                <span class="detail-label">آخر تحديث:</span>
                <span class="detail-value">{{ formatDate(school.updated_at) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="school.description">
            <h4 class="section-title">الوصف</h4>
            <p class="description-text">{{ school.description }}</p>
          </div>
        </div>
        
        <div v-else class="loading-state">
          <div class="loading-spinner"></div>
          <p>جاري تحميل تفاصيل المدرسة...</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">
          إغلاق
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  school: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
  direction: rtl;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #054239, #005f57);
  color: #b9a779;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  color: #b9a779;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  opacity: 0.8;
}

.close-modal:hover {
  opacity: 1;
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.school-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.section-title {
  color: #054239;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #b9a779;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.detail-value {
  font-size: 16px;
  color: #1e293b;
  font-weight: 500;
}

.staff-count {
  display: inline-block;
  padding: 4px 12px;
  background: #e2e8f0;
  color: #1e293b;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.staff-count.zero-staff {
  background: #fef2f2;
  color: #dc2626;
}

.description-text {
  color: #334155;
  line-height: 1.6;
  margin: 0;
  font-size: 15px;
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #054239;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.modal-footer {
  padding: 20px 32px;
  background: #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #cbd5e1;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    max-width: 95%;
  }
  
  .modal-body {
    padding: 20px;
  }
}
</style>