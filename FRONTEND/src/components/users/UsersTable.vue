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
    
    <!-- Scrollable wrapper for responsive table -->
    <div class="table-wrapper">
    
      <div v-if="loading" class="table-loading">
        <div class="loading-spinner"></div>
        <p>جاري تحميل المستخدمين...</p>
      </div>

      <table v-else class="users-table">
      <thead>
        <tr>
          <th>المستخدم</th>
          <th>الدور</th>
          <th>المدرسة</th>
          <th>تاريخ التسجيل</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td data-label="المستخدم">
            <div class="user-cell">
              <div class="user-info">
                <strong>{{ user.username }}</strong>
              </div>
            </div>
          </td>
          <td data-label="الدور">
            <span class="role-badge" :class="getRoleClass(user.role)">
              {{user.role_name}}
            </span>
          </td>
          <td data-label="المدرسة">{{ user.school_names !== 'N/A' ? user.school_names : '-' }}</td>
          <td data-label="تاريخ التسجيل">{{ formatDate(user.created_at) }}</td>
          <td data-label="الإجراءات" class="actions-cell">
            <div class="actions">
              <button class="edit-btn" @click="handleEdit(user)">
                ✏️ تعديل
              </button>
              <button class="delete-btn" @click="handleDelete(user)">
                🗑️ حذف
              </button>
              <button class="view-btn" @click="handleView(user)">
                👁️ عرض
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="users.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">👤</div>
      <h3>لا يوجد مستخدمين</h3>
      <p>لم يتم إضافة أي مستخدمين بعد</p>
    </div>
    </div> <!-- End of table-wrapper -->
  </div>
</template>

<script setup>
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'refresh' , 'view'])

const handleView = (user) => {
  emit('view', user)
}

const handleEdit = (user) => {
    emit('edit', user)
}

const handleDelete = (user) => {
  emit('delete', user)
}

const getInitials = (username) => {
  if (!username) return 'م'
  return username.charAt(0).toUpperCase()
}

const getRoleClass = (roleName) => {
  const roles = {
    'ADMIN': 1,
    'SCHOOL_USER': 2,
    'ANALAYZER_USER': 3
  }
  return roles[ roles] || null
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
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Scrollable wrapper for responsive table */
  .table-wrapper {
    overflow-x: auto;
    width: 100%;
    border-radius: 8px;
  }
  
  .table-wrapper::-webkit-scrollbar {
    height: 8px;
  }
  
  .table-wrapper::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  .table-wrapper::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  .table-wrapper::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
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
  
  .users-table {
    width: 100%;
    min-width: 800px; /* Minimum width to prevent columns from compressing */
    border-collapse: collapse;
    white-space: nowrap; /* Prevent text wrapping in cells */
  }
  
  .users-table th {
  background:#054239;
  padding: 16px 12px;
  text-align: right;
  font-weight: 600;
  color: var(--primary-gold);
  border: none !important;
  border-bottom: 2px solid var(--primary-gold) !important;
  font-size: 14px;
}
  
  .users-table td {
    padding: 16px 12px;
    border-bottom: 1px solid #f1f5f9;
    text-align: right;
  }
  
  .users-table tr:hover {
    background: #f8fafc;
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    direction: rtl;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-info strong {
    color: #1e293b;
    font-size: 15px;
  }
  
  .schools-list {
    max-width: 200px;
    line-height: 1.4;
  }
  
  .role-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }
  
  .role-badge.admin {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .role-badge.school-user {
    background: var(--bg-hover);
    color: var(--primary-dark);
    border: 1px solid var(--primary-gold);
  }
  
  .role-badge.analayzer-user {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    color: #166534;
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
  color: var(--primary-dark);
  border: 1px solid var(--primary-teal);
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
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary-teal);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* =========================================
   Mobile Card View (Responsive Framework Behavior) 
   ========================================= */
  @media (max-width: 768px) {
    .table-wrapper {
      overflow-x: visible; /* Remove horizontal scroll */
    }

    .users-table {
      min-width: 100%;
      display: block;
    }

    .users-table thead {
      display: none; /* Hide standard header */
    }

    .users-table tbody {
      display: block;
      width: 100%;
    }

    .users-table tr {
      display: block;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 16px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      white-space: normal; /* Allow wrapping in card mode */
    }

    .users-table td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      text-align: left;
    }

    .users-table td:last-child {
      border-bottom: none;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      margin-top: 8px;
    }

    /* Add Labels using data-label attribute */
    .users-table td::before {
      content: attr(data-label);
      font-weight: 600;
      color: #64748b;
      font-size: 13px;
    }

    .actions {
      width: 100%;
      justify-content: flex-start;
    }

    .edit-btn, .delete-btn, .view-btn {
      flex: 1;
      justify-content: center;
      padding: 10px;
    }
  }
  </style>