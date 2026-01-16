<template>
  <div class="table-container">
    <div class="table-header">
      <div style="flex: 1;"></div>
      <div>
        <button class="refresh-btn" @click="$emit('refresh')">
          <span>🔄</span> تحديث القائمة
        </button>
      </div>
    </div>
    <div v-if="loading" class="table-loading">
      <div class="loading-spinner"></div>
      <p>جاري تحميل المدارس...</p>
    </div>
    <table v-else class="schools-table">
      <thead>
        <tr>
          <th>المدرسة</th>
          <th>الرمز</th>
          <th>المنطقة</th>
          <th>المديرية</th> <!-- حقل جديد -->
          <th>المجمع</th>   
          <th>عدد الموظفين</th>
          <th>تاريخ الإنشاء</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="school in schools" :key="school.id">
          <td>
            <div class="school-cell">
              <div class="school-info">
                <strong>{{ school.name }}</strong>
              </div>
            </div>
          </td>
          <td>{{ school.code }}</td>
          <td>{{ school.region }}</td>
          <td>{{ school.directorate_name }}</td> <!-- عرض اسم المديرية -->
          <td>{{ school.complex_name }}</td>
          <td>
            <span class="staff-count" :class="{ 'zero-staff': school.users_count == 0 }">
              {{ school.users_count || 0 }}
            </span></td>
          <td>{{ formatDate(school.created_at) }}</td>
          <td>
            <div class="actions">
              <button class="edit-btn" @click="handleEdit(school)">
                 تعديل
              </button>
              <button class="delete-btn" @click="handleDelete(school)">
                 حذف
              </button>
              <button class="view-btn" @click="handleView(school)">
                 تفاصيل
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="schools.length === 0 && !loading" class="empty-state">
      <h3>لا توجد مدارس</h3>
      <p>لم يتم إضافة أي مدارس بعد</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  schools: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'refresh', 'view'])

const handleEdit = (school) => {
  console.log('📝 SchoolsTable: طلب تعديل المدرسة', school)
  emit('edit', school)
}

const handleDelete = (school) => {
  console.log('🗑️ SchoolsTable: طلب حذف المدرسة', school)
  emit('delete', school)
}

const handleView = (school) => {
  console.log('👁️ SchoolsTable: طلب عرض تفاصيل المدرسة', school)
  emit('view', school)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA')
  } catch {
    return dateString
  }
}
</script>
<style scoped>
.table-container {
  background: white;
  border-radius: 3px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.refresh-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
}

.refresh-btn:hover {
  background: #e2e8f0;
}

.schools-table {
  width: 100%;
  border-collapse: collapse;
}

.schools-table th {
  background: linear-gradient(135deg, #002623, #001a18);
  padding: 16px 12px;
  text-align: right;
  font-weight: 600;
  color: #b9a779;
  border-bottom: 2px solid #b9a779;
  font-size: 14px;
}

.schools-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  text-align: right;
}

.schools-table tr:hover {
  background: #f8fafc;
}

.school-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  direction: rtl;
}

.school-avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border: 1px solid var(--primary-gold);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.school-info strong {
  color: #1e293b;
  font-size: 15px;
}

.staff-count {
  display: inline-block;
  padding: 6px 12px;
  background: var(--bg-hover);
  color: var(--primary-dark);
  border: 1px solid var(--primary-gold);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.staff-count.zero-staff {
  background: #fef2f2;
  color: #dc2626;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn, .delete-btn, .view-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.edit-btn {
  background: white;
  color: #002623;
  border: 1px solid #e2e8f0;
}

.edit-btn:hover {
  background: #b9a779;
  color: white;
  border-color: #b9a779;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fee2e2;
}

.view-btn {
  background: #D9FFFA;
  color: #126E70;
}

.view-btn:hover {
  background: #D9FFFA;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #475569;
  margin-bottom: 8px;
}

.empty-state p {
  color: #94a3b8;
}

.table-loading {
  text-align: center;
  padding: 40px;
}

.table-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-secondary);
  border-top: 3px solid var(--primary-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>