<!-- Vue 3 Components for Full Dashboard Icons -->

<!-- 1) SchoolsIcon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-label="Schools">
    <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3z"/>
    <path d="M5 13v5h14v-5l-7 3-7-3z"/>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number,String], default:24 } })
</script>

<!-- 2) SurveysIcon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-label="Surveys">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14l4-4h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
    <path d="M7 7h10v2H7zm0 4h6v2H7z"/>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number,String], default:24 } })
</script>

<!-- 3) UsersIcon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-label="Users">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3z"/>
    <path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z"/>
    <path d="M8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13z"/>
    <path d="M16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number,String], default:24 } })
</script>

<!-- 4) AnalyticsIcon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-label="Analytics">
    <path d="M3 3h2v18H3zM7 13h2v8H7zM11 9h2v12h-2zM15 5h2v16h-2zM19 11h2v10h-2z"/>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number,String], default:24 } })
</script>

<!-- 5) UserGuideBookIcon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-label="User Guide">
    <path d="M18 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10v-2H8V4h10v14l4 2V4c0-1.1-.9-2-2-2z"/>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number,String], default:24 } })
</script>

<!-- 6) UserGuideHelpIcon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-label="Help Guide">
    <path d="M4 4h12v16H4z"/>
    <path d="M18 6h2a2 2 0 0 1 2 2v10l-4-2V6z"/>
    <circle cx="10" cy="10" r="1"/>
    <path d="M10 12c0-2 3-2 3-4a3 3 0 1 0-6 0h2a1 1 0 1 1 2 0c0 1-3 1.5-3 4h2z"/>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number,String], default:24 } })
</script>

<!-- 7) UserManualIcon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-label="User Manual">
    <path d="M3 4h18v2H3z"/>
    <path d="M3 8h18v12H3z"/>
    <path d="M7 12h10v2H7zM7 16h6v2H7z"/>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number,String], default:24 } })
</script>

<!-- 8) UserGuideTipsIcon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" aria-label="User Tips">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm1 4h-2v2h2v-2z"/>
  </svg>
</template>
<script setup>
defineProps({ size: { type: [Number,String], default:24 } })
</script>