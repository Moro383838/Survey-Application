<template>
  <div class="table-wrapper">
    <table class="custom-table">
      <thead>
        <tr>
          <th style="width: 20%">الاستبيان</th>
          <th>المنشئ</th>
          <th>التكرار</th>
          <th>تاريخ الإنشاء</th>
          <th class="text-center">المستهدف</th>
          <th class="text-center">الإجابات</th>
          <th class="text-center">الإنجاز</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(survey) in surveys" :key="survey.id">
          <td data-label="الاستبيان">
            <div class="survey-name-cell">
              <span class="survey-title">{{ survey.title }}</span>
            </div>
          </td>
          <td data-label="المنشئ">{{ survey.created_by_name || '-' }}</td>
          <td data-label="التكرار">
            <span class="frequency-badge">{{ survey.frequency_label || (survey.is_periodic ? 'دوري' : 'لمرة واحدة') }}</span>
          </td>
          <td data-label="تاريخ الإنشاء">{{ formatDate(survey.created_at) }}</td>
          <td data-label="المستهدف" class="text-center">
            <span class="count-badge target-badge">{{ survey.target_count || 0 }}</span>
          </td>
          <td data-label="الإجابات" class="text-center">
            <span class="count-badge response-badge">{{ survey.response_count || 0 }}</span>
          </td>
          <td data-label="الإنجاز" class="text-center">
            <div class="completion-container">
              <span class="completion-rate" :class="getCompletionClass(survey.completion_rate)">
                {{ survey.completion_rate }}%
              </span>
            </div>
          </td>
          <td data-label="الحالة">
            <span class="status-text" :class="getStatusClass(survey.status_id)">
              {{ survey.status_id === 3 ? 'مغلق' : (survey.status_label || 'مسودة') }}
            </span>
          </td>
          <td data-label="الإجراءات" class="actions-cell">
            <div class="actions-group">
              <button class="action-btn btn-details" @click="$emit('view', survey)">
                <span class="dot">●</span> تفاصيل
              </button>

              <button 
                class="action-btn btn-publish" 
                @click="$emit('publish', survey)" 
                v-if="authStore.isAdmin && survey.status_id == 1"
              >نشر
              </button>

              <button 
                class="action-btn btn-edit" 
                @click="$emit('edit', survey)" 
                v-if="authStore.isAdmin && (survey.status_id == 1 || survey.status_id == 2)"
              >
                تعديل
              </button>

              <button 
                class="action-btn btn-unpublish" 
                @click="$emit('unpublish', survey)" 
                v-if="authStore.isAdmin && survey.status_id == 2"
              >
                إلغاء النشر
              </button>
              
              <button 
                class="action-btn btn-delete" 
                @click="$emit('close', survey)" 
                v-if="authStore.isAdmin && survey.status_id != 3"
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

const getCompletionClass = (rate) => {
  const num = parseFloat(rate);
  if (num >= 100) return 'fully-completed';
  if (num > 0) return 'partially-completed';
  return 'not-started';
}
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px; /* Force scroll on desktop if needed, overridden on mobile */
}

.custom-table th {
  background: #005f57;
  color: var(--primary-gold);
  font-weight: 600;
  padding: 16px;
  text-align: right;
  border: none !important;
  border-bottom: 2px solid var(--primary-gold) !important;
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

.target-badge {
  background-color: #f1f5f9;
  color: #475569;
}

.response-badge {
  background-color: #dcfce7;
  color: #16a34a;
}

.frequency-badge {
  color: #6366f1;
  font-weight: 500;
}

.text-center {
  text-align: center !important;
}

/* Completion Styles */
.completion-rate {
  font-weight: 700;
  font-size: 13px;
}

.fully-completed { color: #16a34a; }
.partially-completed { color: #f59e0b; }
.not-started { color: #94a3b8; }

/* Status Text */
.status-text {
  font-weight: 500;
}
.status-text.active { color: var(--status-success); }
.status-text.draft { color: var(--text-muted); }
.status-text.closed { color: #ef4444; }

/* Actions Buttons */
.actions-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap; /* Allow wrapping on small screens */
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
  white-space: nowrap;
}

.action-btn:hover {
  opacity: 0.8;
}

/* Specific Button Colors */
.btn-details { background-color: #e0f2fe; color: #0284c7; }
.btn-delete { background-color: #fee2e2; color: #ef4444; }
.btn-edit { background-color: #ffedd5; color: #f97316; }
.btn-unpublish { background-color: #f3e8ff; color: #9333ea; }
.btn-publish { background-color: #dcfce7; color: #16a34a; }

/* =========================================
   Mobile Card View (Responsive Framework Behavior) 
   ========================================= */
@media (max-width: 768px) {
  .table-wrapper {
    overflow-x: visible; /* Remove horizontal scroll */
  }

  .custom-table {
    min-width: 100%;
    display: block;
  }

  .custom-table thead {
    display: none; /* Hide standard header */
  }

  .custom-table tbody {
    display: block;
    width: 100%;
  }

  .custom-table tr {
    display: block;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 16px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .custom-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
    text-align: left;
  }

  .custom-table td:last-child {
    border-bottom: none;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-top: 8px;
  }

  /* Add Labels using data-label attribute */
  .custom-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    font-size: 13px;
  }

  .actions-group {
    width: 100%;
    justify-content: flex-start;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
    padding: 10px;
  }
}
</style>