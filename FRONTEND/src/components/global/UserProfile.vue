<!-- src/components/global/UserProfile.vue -->
<template>
    <div class="user-profile-global">
      <!-- النمط المضغوط (Compact) -->
      <div v-if="variant === 'compact'" class="profile-compact" @click="toggleExpanded">
        <div class="compact-avatar" :style="avatarStyle">
          {{ userInitials }}
        </div>
        <div class="compact-info">
          <div class="compact-name">{{ userName }}</div>
          <div class="compact-role">{{ roleLabel }}</div>
        </div>
        <div class="compact-arrow">
          <span :class="{'expanded': isExpanded}">▼</span>
        </div>
      </div>
  
      <!-- النمط الممتد (Expanded) -->
      <div v-if="variant === 'expanded' || (variant === 'compact' && isExpanded)" 
           class="profile-expanded"
           :class="{'compact-expanded': variant === 'compact'}">
        <div class="expanded-header">
          <div class="expanded-avatar" :style="avatarStyle">
            {{ userInitials }}
            <div class="status-dot" :class="{'online': user?.isActive}"></div>
          </div>
          <div class="expanded-info">
            <div class="expanded-name">{{ userName }}</div>
            <div class="expanded-role">
              <span class="role-tag" :class="user?.role?.toLowerCase()">
                {{ roleLabel }}
              </span>
            </div>
          </div>
        </div>
  
        <div class="expanded-details">
          <!-- المدارس المرتبطة -->
          <div v-if="hasSchools" class="detail-section">
            <div class="section-title">
              <span class="section-icon">🏫</span>
              <span>المدارس المرتبطة</span>
            </div>
            <div class="schools-list">
              <div v-for="(school, index) in displayedSchools" 
                   :key="index" 
                   class="school-item">
                <div class="school-name">{{ school.name || school }}</div>
                <div class="school-meta" v-if="school.code">
                  <span class="school-code">كود: {{ school.code }}</span>
                </div>
              </div>
              <div v-if="schoolsCount > 3" class="more-schools">
                + {{ schoolsCount - 3 }} مدارس أخرى
              </div>
            </div>
          </div>
  
          <!-- تاريخ التسجيل -->
          <div class="detail-section">
            <div class="section-title">
              <span class="section-icon">📅</span>
              <span>معلومات التسجيل</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">تاريخ التسجيل</div>
                <div class="info-value">{{ formattedDate }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref, watch } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  
  const props = defineProps({
    // تحديد نوع العرض: compact (مضغوط) أو expanded (ممتد)
    variant: {
      type: String,
      default: 'compact',
      validator: (value) => ['compact', 'expanded'].includes(value)
    },
    
    // بيانات مستخدم معينة (اختياري، إذا لم يتم تمريره يستخدم المستخدم الحالي)
    user: {
      type: Object,
      default: null
    },
    
    // عرض إجراءات المستخدم
    showActions: {
      type: Boolean,
      default: true
    },
    
    // عرض المزيد من التفاصيل
    showDetails: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits(['view-profile', 'edit', 'click'])
  
  const authStore = useAuthStore()
  const router = useRouter()
  const isExpanded = ref(false)
  
  // استخدام المستخدم الممرر أو المستخدم الحالي
  const currentUser = computed(() => {
    return props.user || authStore.user || {}
  })
  
  // الأحرف الأولى
  const userInitials = computed(() => {
    if (!currentUser.value.username) return 'م'
    
    const names = currentUser.value.name?.split(' ') || currentUser.value.username.split(' ')
    if (names.length > 1) {
      return (names[0][0] + names[1][0]).toUpperCase()
    }
    return names[0][0].toUpperCase()
  })
  
  // اسم المستخدم للعرض
  const userName = computed(() => {
    return currentUser.value.name || currentUser.value.username || 'مستخدم'
  })
  
  // تنسيق الاسم الأولي (اسم المستخدم)
  const avatarStyle = computed(() => {
    const colors = {
      ADMIN: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      SCHOOL_USER: 'linear-gradient(135deg, #059669, #10b981)',
      ANALAYZER_USER: 'linear-gradient(135deg, #d97706, #f59e0b)',
      USER: 'linear-gradient(135deg, #6b7280, #9ca3af)'
    }
    
    const color = colors[currentUser.value.role] || colors.USER
    return { background: color }
  })
  
  // تسمية الدور
  const roleLabel = computed(() => {
    const roles = {
      ADMIN: 'مدير النظام',
      SCHOOL_USER: 'مستخدم مدرسة',
      ANALAYZER_USER: 'محلل',
      USER: 'مستخدم'
    }
    return roles[currentUser.value.role] || 'مستخدم'
  })
  
  // المدارس المرتبطة
  const userSchools = computed(() => {
    if (!currentUser.value) return []
    
    // إذا كانت المدارس في صيغة مصفوفة
    if (Array.isArray(currentUser.value.schools)) {
      return currentUser.value.schools
    }
    
    // إذا كانت المدارس في صيغة نصية
    if (currentUser.value.school_names) {
      return currentUser.value.school_names.split(',')
        .map(name => name.trim())
        .filter(name => name && name !== 'N/A')
        .map(name => ({ name }))
    }
    
    return []
  })
  
  const hasSchools = computed(() => userSchools.value.length > 0)
  const schoolsCount = computed(() => userSchools.value.length)
  const displayedSchools = computed(() => userSchools.value.slice(0, 3))
  
  // تنسيق التاريخ
  const formattedDate = computed(() => {
    if (!currentUser.value.createdAt) return 'غير متوفر'
    
    try {
      const date = new Date(currentUser.value.createdAt)
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return currentUser.value.createdAt
    }
  })
  
  const formattedUpdatedAt = computed(() => {
    if (!currentUser.value.updatedAt) return 'غير متوفر'
    
    try {
      const date = new Date(currentUser.value.updatedAt)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'اليوم'
      if (diffDays === 1) return 'أمس'
      if (diffDays < 7) return `قبل ${diffDays} أيام`
      if (diffDays < 30) return `قبل ${Math.floor(diffDays / 7)} أسابيع`
      
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return currentUser.value.updatedAt
    }
  })
  
  // دوال الإجراءات
  const toggleExpanded = () => {
    if (props.variant === 'compact') {
      isExpanded.value = !isExpanded.value
    }
    emit('click', currentUser.value)
  }
  
  const handleViewProfile = () => {
    if (currentUser.value.id) {
      router.push(`/dashboard/users/${currentUser.value.id}`)
    }
    emit('view-profile', currentUser.value)
  }
  
  const handleEdit = () => {
    emit('edit', currentUser.value)
  }
  
  // إذا تغير المستخدم، نطوي العرض الممتد
  watch(() => props.user, () => {
    isExpanded.value = false
  })
  </script>
  
  <style scoped>
  .user-profile-global {
    position: relative;
    font-family: var(--font-primary, 'ITF Qomra Arabic Light', 'Segoe UI', 'Tajawal', sans-serif);
  }
  
  /* التصميم المضغوط */
  .profile-compact {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: white;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 200px;
    max-width: 300px;
  }
  
  .profile-compact:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .compact-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.875rem;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .compact-info {
    flex: 1;
    min-width: 0;
  }
  
  .compact-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .compact-role {
    font-size: 0.75rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .compact-arrow {
    color: #94a3b8;
    font-size: 0.75rem;
    transition: transform 0.2s ease;
  }
  
  .compact-arrow .expanded {
    transform: rotate(180deg);
  }
  
  /* التصميم الممتد */
  .profile-expanded {
    background: white;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    width: 320px;
  }
  
    .compact-expanded {
    position: absolute;
    top: 100%;
    right: 0;       
    left: auto;
    margin-top: 0.5rem;
    z-index: 1000;
    }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .expanded-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-bottom: 1px solid #e2e8f0;
  }
  
  .expanded-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.25rem;
    position: relative;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .status-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
  }
  
  .status-dot.online {
    background-color: #10b981;
  }
  
  .status-dot:not(.online) {
    background-color: #9ca3af;
  }
  
  .expanded-info {
    flex: 1;
  }
  
  .expanded-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }
  
  .role-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .role-tag.admin {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
  }
  
  .role-tag.school_user {
    background: linear-gradient(135deg, #059669, #10b981);
    color: white;
  }
  
  .role-tag.analayzer_user {
    background: linear-gradient(135deg, #d97706, #f59e0b);
    color: white;
  }
  
  .role-tag.user {
    background: linear-gradient(135deg, #6b7280, #9ca3af);
    color: white;
  }
  
  /* تفاصيل الملف */
  .expanded-details {
    padding: 1.5rem;
  }
  
  .detail-section {
    margin-bottom: 1.5rem;
  }
  
  .detail-section:last-child {
    margin-bottom: 0;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.75rem;
  }
  
  .section-icon {
    font-size: 1rem;
  }
  
  /* المدارس */
  .schools-list {
    background: #f8fafc;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
  
  .school-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e2e8f0;
    transition: background 0.2s ease;
  }
  
  .school-item:last-child {
    border-bottom: none;
  }
  
  .school-item:hover {
    background: #f1f5f9;
  }
  
  .school-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }
  
  .school-meta {
    font-size: 0.75rem;
    color: #64748b;
  }
  
  .school-code {
    background: #e2e8f0;
    padding: 0.125rem 0.5rem;
    border-radius: 0.5rem;
    display: inline-block;
  }
  
  .more-schools {
    padding: 0.75rem 1rem;
    text-align: center;
    font-size: 0.75rem;
    color: #64748b;
    background: #f1f5f9;
  }
  
  /* معلومات التسجيل */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  
  .info-item {
    background: #f8fafc;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }
  
  .info-label {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.25rem;
  }
  
  .info-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1e293b;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .status-badge.active {
    background: #d1fae5;
    color: #059669;
  }
  
  .status-badge.inactive {
    background: #f1f5f9;
    color: #64748b;
  }
  
  /* الإجراءات السريعة */
  .quick-actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .quick-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .quick-btn:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
  }
  
  .btn-icon {
    font-size: 0.875rem;
  }
  
  /* تصميم متجاوب */
  @media (max-width: 640px) {
    .profile-compact {
      min-width: auto;
      max-width: none;
    }
    
    .compact-expanded {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90vw;
      max-width: 400px;
      margin-top: 0;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>