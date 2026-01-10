<template>
    <div class="question-item" @click="handleClick">
      <div class="question-item-icon" :style="iconStyle">{{ type.icon }}</div>
      <div class="question-item-content">
        <h4 class="question-item-title">{{ type.name }}</h4>
        <p class="question-item-desc">{{ getDescription(type.id) }}</p>
      </div>
      <button class="question-item-add-btn" @click.stop="handleClick">
        <span class="add-icon">➕</span>
        <span class="add-text">إضافة</span>
      </button>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    type: {
      type: Object,
      required: true,
      default: () => ({
        id: 1,
        name: 'نص قصير',
        icon: '📝'
      })
    }
  })
  
  const emit = defineEmits(['add'])
  
  // تنسيق الأيقونة بناءً على نوع السؤال
  const iconStyle = computed(() => {
    const colors = {
      1: { bg: '#e6f4f1', color: '#428177' },
      2: { bg: '#f0f7f6', color: '#054239' },
      3: { bg: '#f9f6ef', color: '#b9a779' },
      4: { bg: '#f5f2ea', color: '#988561' },
      5: { bg: '#e8e6e0', color: '#002623' },
      6: { bg: '#f0e6f4', color: '#8a2be2' }
    }
    
    const colorSet = colors[props.type.id] || colors[1]
    
    return {
      backgroundColor: colorSet.bg,
      color: colorSet.color,
      border: `2px solid ${colorSet.color}`
    }
  })
  
  // الحصول على الوصف المناسب
  const getDescription = (typeId) => {
  const descriptions = {
    1: 'نص قصير للإجابات القصيرة',
    2: 'نص طويل للإجابات المفصلة',
    3: 'اختيار واحد من الخيارات',
    4: 'اختيار متعدد من الخيارات',
    5: 'إدخال رقم',
    6: 'تحديد تاريخ',
    7: 'تحديد وقت',
    8: 'تحديد فترة زمنية (تاريخ)',
    9: 'تحديد فترة زمنية مع وقت'
  }
  return descriptions[typeId] || 'نوع سؤال'
}
  
  const handleClick = () => {
    emit('add', props.type)
  }
  </script>
  
  <style scoped>
  .question-item {
    background: white;
    border: 2px solid #edebe0;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    height: 100%;
    min-height: 120px;
  }
  
  .question-item:hover {
    border-color: #b9a779;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(185, 167, 121, 0.15);
  }
  
  .question-item-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  .question-item:hover .question-item-icon {
    transform: scale(1.1) rotate(5deg);
  }
  
  .question-item-content {
    flex: 1;
    min-width: 0;
  }
  
  .question-item-title {
    color: #002623;
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
  }
  
  .question-item-desc {
    color: #988561;
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .question-item-add-btn {
    background: rgba(66, 129, 119, 0.1);
    color: #428177;
    border: 2px solid rgba(66, 129, 119, 0.3);
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  
  .question-item-add-btn:hover {
    background: #428177;
    color: white;
    border-color: #428177;
    transform: scale(1.05);
  }
  
  .add-icon {
    font-size: 14px;
  }
  
  .add-text {
    font-size: 12px;
  }
  
  /* التكيف مع الشاشات */
  @media (max-width: 768px) {
    .question-item {
      flex-direction: column;
      text-align: center;
      padding: 16px;
    }
    
    .question-item-content {
      text-align: center;
    }
    
    .question-item-add-btn {
      width: 100%;
      justify-content: center;
    }
  }
  
  @media (max-width: 480px) {
    .question-item-icon {
      width: 50px;
      height: 50px;
      font-size: 24px;
    }
    
    .question-item-title {
      font-size: 15px;
    }
    
    .question-item-desc {
      font-size: 12px;
    }
  }
  </style>