<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h3>تعديل المستخدم</h3>
        <button class="close-modal" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">اسم المستخدم *</label>
              <input
                type="text"
                class="form-input"
                v-model="formData.username"
                required
                placeholder="أدخل اسم المستخدم"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">الدور *</label>
              <select
                class="form-select"
                v-model="formData.role"
                required
                @change="handleRoleChange"
              >
                <option value="">اختر الدور</option>
                <option value="ADMIN">مدير النظام</option>
                <option value="SCHOOL_USER">مستخدم مدرسة</option>
                <option value="ANALAYZER_USER">محلل بيانات</option>
              </select>
            </div>
            <div class="form-group" v-if="showSchoolSelection">
              <label class="form-label">المدارس</label>
              <div class="multi-select-container">
                <div class="selected-schools" v-if="selectedSchools.length > 0">
                  <span
                    class="school-tag"
                    v-for="school in selectedSchools"
                    :key="school.id"
                  >
                    {{ school.name }}
                    <button
                      type="button"
                      class="remove-tag"
                      @click="removeSchool(school.id)"
                    >
                      &times;
                    </button>
                  </span>
                </div>
                <select
                  class="form-select"
                  v-model="tempSchoolId"
                  @change="addSchool"
                  :disabled="isSchoolSelectDisabled"
                >
                  <option value="">اختر مدرسة</option>
                  <option
                    v-for="school in availableSchools"
                    :key="school.id"
                    :value="school.id"
                    :disabled="isSchoolSelected(school.id)"
                  >
                    {{ school.name }}
                  </option>
                </select>
                <p class="hint-text" v-if="formData.role === 'SCHOOL_USER'">
                  يمكنك اختيار أكثر من مدرسة
                </p>
                <p class="hint-text" v-if="formData.role === 'ANALAYZER_USER'">
                  يمكن اختيار مدرسة واحدة فقط أو لا شيء
                </p>
              </div>
            </div>
          </div>

          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal" type="button">
          إلغاء
        </button>
        <button
          class="btn btn-primary"
          @click="handleSubmit"
          :disabled="isLoading"
          type="button"
        >
          <span v-if="isLoading" class="button-loading">
            <span class="loading-spinner"></span>
            <span>جاري التحديث...</span>
          </span>
          <span v-else>حفظ التغييرات</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { schoolService } from "@/api/index.js";
import { useUsersStore } from "@/stores/users.js";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "user-updated"]);

const usersStore = useUsersStore();

const formData = reactive({
  username: "",
  role: "",
  roleId: null,
  schoolIds: [],
});

const schools = ref([]);
const tempSchoolId = ref("");
const selectedSchools = ref([]);
const isLoading = ref(false);
const error = ref(null);

const showSchoolSelection = computed(() => {
  return formData.roleId && formData.roleId !== 1 && formData.roleId !== 3;
});

const isSchoolSelectDisabled = computed(() => {
  return (
    formData.role === "ANALAYZER_USER" && selectedSchools.value.length >= 1
  );
});

const availableSchools = computed(() => {
  return schools.value.filter(
    (school) =>
      !selectedSchools.value.some((selected) => selected.id === school.id)
  );
});

const getRoleId = (roleName) => {
  const roles = { ADMIN: 1, SCHOOL_USER: 2, ANALAYZER_USER: 3 };
  return roles[roleName] || null;
};

const getRoleName = (roleId) => {
  const roles = { 1: "ADMIN", 2: "SCHOOL_USER", 3: "ANALAYZER_USER" };
  return roles[roleId] || "";
};

const handleRoleChange = () => {
  formData.roleId = getRoleId(formData.role);

  if (formData.role === "ADMIN") {
    selectedSchools.value = [];
    formData.schoolIds = [];
  }
};

const addSchool = () => {
  if (!tempSchoolId.value) return;

  const school = schools.value.find((s) => s.id == tempSchoolId.value);
  if (school && !isSchoolSelected(school.id)) {
    selectedSchools.value.push(school);
    formData.schoolIds.push(school.id);
    tempSchoolId.value = "";
  }
};

const removeSchool = (schoolId) => {
  selectedSchools.value = selectedSchools.value.filter(
    (s) => s.id !== schoolId
  );
  formData.schoolIds = formData.schoolIds.filter((id) => id !== schoolId);
};

const isSchoolSelected = (schoolId) => {
  return selectedSchools.value.some((s) => s.id == schoolId);
};

// ✅ 1. تعريف دالة تحميل المدارس أولاً
const loadSchools = async () => {
  try {
    const response = await schoolService.getAll();
    schools.value = response.data || [];
  } catch (err) {
    console.error("❌ خطأ في تحميل المدارس:", err);
    schools.value = [];
  }
};

// ✅ 2. ثم تعريف دالة تحميل بيانات المستخدم
const loadUserData = (user) => {
  console.log("📋 تحميل بيانات المستخدم للتعديل:", user);

  formData.username = user.username || "";

  if (user.roleId) {
    formData.roleId = Number(user.roleId);
    formData.role = getRoleName(formData.roleId);
  }

  formData.schoolIds = [];
  selectedSchools.value = [];

  if (user.schools && Array.isArray(user.schools)) {
    user.schools.forEach((school) => {
      if (school && school.id) {
        selectedSchools.value.push(school);
        formData.schoolIds.push(school.id);
      }
    });
  } else if (user.schoolId) {
    const school = schools.value.find((s) => s.id == user.schoolId);
    if (school) {
      selectedSchools.value.push(school);
      formData.schoolIds.push(school.id);
    }
  }
};

// ✅ 3. وأخيراً الـ Watcher الذي يستدعي الدوال السابقة
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      if (schools.value.length === 0) {
        loadSchools().then(() => loadUserData(newUser));
      } else {
        loadUserData(newUser);
      }
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  error.value = null;

  try {
    const finalRoleId = Number(formData.roleId);
    if (isNaN(finalRoleId) || finalRoleId === 0) {
      throw new Error("رقم الدور (roleId) غير صالح");
    }

    console.log("✏️ جاري تحديث المستخدم:", {
      id: props.user.id,
      roleId: finalRoleId,
      role: formData.role,
    });

    const updateData = {
      username: formData.username,
      roleId: finalRoleId,
      schoolIds: formData.schoolIds,
    };

    if (formData.password && formData.password.trim() !== "") {
      updateData.password = formData.password;
    }

    await usersStore.updateUser(props.user.id, updateData);
    emit("user-updated");
    closeModal();
  } catch (err) {
    error.value =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "حدث خطأ أثناء تحديث المستخدم";

    console.error("❌ خطأ التحديث:", err);
  } finally {
    isLoading.value = false;
  }
};

const validateForm = () => {
  error.value = null;

  if (!formData.username.trim()) {
    error.value = "اسم المستخدم مطلوب";
    return false;
  }

  if (!formData.role || !formData.roleId) {
    error.value = "الدور مطلوب";
    return false;
  }

  if (formData.role === "SCHOOL_USER" && formData.schoolIds.length === 0) {
    error.value = "يجب اختيار مدرسة واحدة على الأقل لمستخدم المدرسة";
    return false;
  }

  return true;
};

const closeModal = () => {
  emit("close");
};

// يمكن الإبقاء على onMounted كإجراء احتياطي
onMounted(() => {
  if (schools.value.length === 0) {
    loadSchools();
  }
});
</script>

<style scoped>
.multi-select-container {
  margin-top: 8px;
}
.selected-schools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.school-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #d9fffa;
  color: #126e70;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}
.remove-tag {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.remove-tag:hover {
  background: rgba(220, 38, 38, 0.1);
}
.hint-text {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
  margin-bottom: 0;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}
.modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}
.modal-header {
  padding: 24px;
  background: linear-gradient(90deg, #52b5ab, #52b5ab);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
.close-modal {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}
.close-modal:hover {
  transform: rotate(90deg);
}
.modal-body {
  padding: 32px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.form-group {
  margin-bottom: 0;
}
.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}
.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}
.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #52b5ab;
  box-shadow: 0 0 0 3px rgba(82, 181, 171, 0.1);
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
  margin-top: 1rem;
}
.error-icon {
  font-size: 1.125rem;
}
.modal-footer {
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}
.btn-primary {
  background: linear-gradient(135deg, #52b5ab, #52b5ab);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.btn-secondary:hover {
  background: #e2e8f0;
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
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 640px) {
  .modal {
    width: 95%;
    margin: 20px;
  }
  .modal-body {
    padding: 20px;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
