<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>🎯 تحديد المستهدفين: {{ survey?.title }}</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <p class="hint">يمكنك اختيار مديريات كاملة أو مدارس محددة.</p>

        <!-- 1. اختيار المديريات -->
        <div class="form-group">
          <label>المديريات:</label>
          <select v-model="selectedDirectorate" class="full-select">
            <option :value="null">-- اختر مديرية لإضافتها --</option>
            <!-- هنا يجب جلب القائمة من الستور -->
            <option v-for="dir in directorates" :key="dir.id" :value="dir.id">
              {{ dir.name }}
            </option>
          </select>
          <button
            class="btn-add-item"
            @click="addDirectorate"
            :disabled="!selectedDirectorate"
          >
            + إضافة المديرية
          </button>
        </div>

        <!-- 2. اختيار المدارس (اختياري) -->
        <div class="form-group">
          <label>مدارس إضافية (محدد):</label>
          <input
            type="text"
            v-model="schoolIdInput"
            placeholder="أدخل معرف المدرسة (ID)"
            class="input-field"
          />
          <button
            class="btn-add-item"
            @click="addSchool"
            :disabled="!schoolIdInput"
          >
            + إضافة مدرسة
          </button>
        </div>

        <!-- القائمة المختارة -->
        <div class="selected-list">
          <div
            v-for="id in payload.directorateIds"
            :key="'d' + id"
            class="tag dir-tag"
          >
            مديرية {{ id }} <span @click="removeDir(id)">×</span>
          </div>
          <div
            v-for="id in payload.schoolIds"
            :key="'s' + id"
            class="tag school-tag"
          >
            مدرسة {{ id }} <span @click="removeSchool(id)">×</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button class="btn-primary" @click="handleSave" :disabled="loading">
          {{ loading ? "جاري الحفظ..." : "حفظ المستهدفين" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

const props = defineProps({ survey: Object });
const emit = defineEmits(["close", "saved"]);

// بيانات وهمية للمديريات (يجب ربطها بـ API Lookups)
const directorates = ref([
  { id: 1, name: "مديرية تربية دمشق" },
  { id: 2, name: "مديرية تربية ريف دمشق" },
]);

const loading = ref(false);
const selectedDirectorate = ref(null);
const schoolIdInput = ref("");

const payload = reactive({
  directorateIds: [],
  schoolIds: [],
});

const addDirectorate = () => {
  if (
    selectedDirectorate.value &&
    !payload.directorateIds.includes(selectedDirectorate.value)
  ) {
    payload.directorateIds.push(selectedDirectorate.value);
    selectedDirectorate.value = null;
  }
};

const addSchool = () => {
  const id = parseInt(schoolIdInput.value);
  if (id && !payload.schoolIds.includes(id)) {
    payload.schoolIds.push(id);
    schoolIdInput.value = "";
  }
};

const removeDir = (id) =>
  (payload.directorateIds = payload.directorateIds.filter((x) => x !== id));
const removeSchool = (id) =>
  (payload.schoolIds = payload.schoolIds.filter((x) => x !== id));

const handleSave = async () => {
  if (payload.directorateIds.length === 0 && payload.schoolIds.length === 0) {
    return alert("يجب اختيار جهة واحدة على الأقل");
  }

  loading.value = true;
  try {
    // استدعاء API الاستهداف الذكي V2
    await axios.post(`/surveys/${props.survey.id}/targets`, payload);
    alert("تم تحديث المستهدفين بنجاح ✅");
    emit("saved");
    emit("close");
  } catch (err) {
    alert("خطأ: " + (err.response?.data?.error || err.message));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  direction: rtl;
}
.modal {
  background: white;
  width: 500px;
  border-radius: 12px;
  overflow: hidden;
}
.modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #002623, #001a18);
  border-bottom: 2px solid #b9a779;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #b9a779;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #b9a779;
}

.close-btn:hover {
  color: white;
}
.modal-body {
  padding: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.full-select,
.input-field {
  width: 70%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.btn-add-item {
  width: 28%;
  padding: 8px;
  background: #002623;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-add-item:hover {
  background: #04332c;
}
.selected-list {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.tag {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.dir-tag {
  background: #dbeafe;
  color: #1e40af;
}
.school-tag {
  background: #fce7f3;
  color: #9d174d;
}
.tag span {
  cursor: pointer;
  font-weight: bold;
}
.modal-footer {
  padding: 15px;
  background: #f8fafc;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn-primary {
  background: linear-gradient(135deg, #002623, #001a18);
  color: #b9a779;
  padding: 8px 20px;
  border: 1px solid #b9a779;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #b9a779, #d4c4a0);
  color: #002623;
}
.btn-secondary {
  background: #fff;
  border: 1px solid #ccc;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
