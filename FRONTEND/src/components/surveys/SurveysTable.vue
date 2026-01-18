<template>
  <div class="table-wrapper">
    <table class="custom-table">
      <thead>
        <tr>
          <th style="width: 25%">الاستبيان</th>
          <th>النوع</th>
          <th>تاريخ الإنشاء</th>
          <th class="text-center">عدد الأسئلة</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(survey) in surveys" :key="survey.id">
          <td>
            <div class="survey-name-cell">
              <span class="survey-title">{{ survey.title }}</span>
            </div>
          </td>
          <td>{{ survey.is_periodic ? 'دوري' : 'عادي' }}</td>
          <td>{{ formatDate(survey.created_at) }}</td>
          <td class="text-center">
            <span class="count-badge red-badge">{{ survey.questions?.length || 0 }}</span>
          </td>
          <td>
            <span class="status-text" :class="getStatusClass(survey.status_id)">
              {{ survey.status_label || 'مسودة' }}
            </span>
          </td>
          <td>
            <div class="actions-group">
              <button class="action-btn btn-details" @click="$emit('view', survey)">
                <span class="dot">●</span> تفاصيل
              </button>

              <button 
                class="action-btn btn-publish" 
                @click="$emit('publish', survey)" 
                v-if="survey.status_id == 1"
              >نشر
              </button>

              <button 
                class="action-btn btn-edit" 
                @click="$emit('edit', survey)" 
                v-if="survey.status_id == 1 || survey.status_id == 2"
              >
                تعديل
              </button>

              <button 
                class="action-btn btn-unpublish" 
                @click="$emit('unpublish', survey)" 
                v-if="survey.status_id == 2"
              >
                إلغاء النشر
              </button>
              
              <button 
                class="action-btn btn-delete" 
                @click="$emit('close', survey)" 
                v-if="survey.status_id != 3"
              >
                إغلاق
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  
import { useSurveyStore } from '@/stores/surveys'
import { useAuthStore } from '@/stores/auth'
import { onMounted, computed } from 'vue'

const surveyStore = useSurveyStore()
const authStore = useAuthStore()

const props = defineProps({
  surveys: {
    type: Array,
    required: true
  }
})

onMounted(async () => {
  await surveyStore.fetchSurveys()
})

defineEmits(['view', 'edit', 'delete', 'close', 'publish', 'unpublish'])

// Check if user is admin
const isAdmin = computed(() => authStore.isAdmin)

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ar-EG') // Arabic Date Format
}

const getStatusClass = (statusId) => {
  if (statusId === 2) return 'active' // نشط
  if (statusId === 3) return 'closed' // مغلق
  return 'draft'
}
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
}

.custom-table th {
  background: linear-gradient(135deg, #002623, #001a18);
  color: #b9a779;
  font-weight: 600;
  padding: 16px;
  text-align: right;
  border-bottom: 2px solid var(--primary-gold);
  font-size: 14px;
}

.custom-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
}

.custom-table tr:hover td {
  background-color: #f8fafc;
}

/* Survey Name Cell */
.survey-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.survey-icon-small {
  background: var(--bg-hover);
  padding: 6px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid var(--primary-gold);
}

.survey-title {
  font-weight: 600;
  color: var(--primary-dark);
}

/* Badges */
.count-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.red-badge {
  background-color: #fee2e2;
  color: #ef4444;
}

.text-center {
  text-align: center !important;
}

.btn-close {
  background-color: #ffedd5;
  color: #f97316;
}
.btn-close .icon {
  font-size: 12px;
}
/* Status Text */
.status-text {
  font-weight: 500;
}
.status-text.active { color: var(--status-success); }
.status-text.draft { color: var(--text-muted); }
.status-text.closed { color: #ef4444; }

/* Actions Buttons - Matching the screenshot style */
.actions-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.8;
}

/* Details Button (Blue/Teal) */
.btn-details {
  background-color: #e0f2fe;
  color: #0284c7;
}
.btn-details .dot {
  font-size: 10px;
}

/* Delete Button (Red) */
.btn-delete {
  background-color: #fee2e2;
  color: #ef4444;
}
.btn-delete .icon {
  font-size: 12px;
}

/* Edit Button (Orange) */
.btn-edit {
  background-color: #ffedd5;
  color: #f97316;
}
.btn-edit .icon {
  font-size: 12px;
}

/* Unpublish Button (Purple) */
.btn-unpublish {
  background-color: #f3e8ff;
  color: #9333ea;
}
.btn-unpublish .icon {
  font-size: 12px;
}

/* Publish Button (Green) */
.btn-publish {
  background-color: #dcfce7;
  color: #16a34a;
}
.btn-publish .icon {
  font-size: 12px;
}
</style>