
import axios from 'axios'
// https://considerate-miracle-production-42bb.up.railway.app/api/v1
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1'
  , timeout: 10000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/user/profile')
}

export const userService = {
  getAll: () => api.get('/user'),
  getById: (id) => api.get(`/user/${id}`),
  create: (userData) => api.post('/user', userData),
  update: (id, userData) => api.put(`/user/${id}`, userData),
  delete: (id) => api.delete(`/user/${id}`),
  getUserSurveys: (userId) => api.get(`/user/${userId}/surveys`),
  changeRole: (userId, roleData) => api.put(`/user/${userId}/role`, roleData),
  getStats: () => api.get('/user/analytics/stats')
}


export const schoolService = {
  getAll: () => api.get('/school'),
  getById: (id) => api.get(`/school/${id}`),
  create: (schoolData) => api.post('/school', schoolData),
  update: (id, schoolData) => api.put(`/school/${id}`, schoolData),
  delete: (id) => api.delete(`/school/${id}`),
  getStats: () => api.get('/school/analytics/stats'),

}
export const aidService = {
  getRoles: () => api.get('/Aid/roles'),
  getDirectorates: () => api.get('/Aid/directorates'),
  getComplexes: (directorateId) => api.get(`/Aid/complexes/${directorateId}`),
  getQuestionTypes: () => api.get('/Aid/question-types'),
  getFrequencies: () => api.get('/Aid/frequencies'), // لما المستخدم يعمل استبيان و يختار دوري لاوم يحدد مدو الدورة اذا يومي او شهري او اسبوعي 
}

export const surveyService = {
  // العمليات الأساسية (CRUD)
  getAll: () => api.get('/survey'),
  getById: (id) => api.get(`/survey/${id}`),
  create: (surveyData) => api.post('/survey', surveyData),
  update: (id, surveyData) => api.put(`/survey/${id}`, surveyData),
  delete: (id) => api.delete(`/survey/${id}`),

  addQuestion: (surveyId, questionData) => api.post(`/survey/${surveyId}/questions`, questionData),
  deleteQuestion: (questionId) => api.delete(`/survey/questions/${questionId}`),
  setTargets: (surveyId, targetsData) => api.post(`/survey/${surveyId}/targets`, targetsData),
  publishSurvey: (surveyId) => api.post(`/survey/${surveyId}/publish`),
  unpublishSurvey: (surveyId, params) => api.post(`/survey/${surveyId}/unpublish`, params),
  closeSurvey: (surveyId) => api.post(`/survey/${surveyId}/close`),

  // عمليات إضافية
  getResponses: (id) => api.get(`/survey/${id}/responses`),
  getSurveyStats: (id) => api.get(`/analytics/survey/${id}/summary`), // إحصائيات استبيان محدد

  // ✅ دالة جلب أنواع الأسئلة (Mocking Backend Data)
  // تحاكي هذه الدالة البيانات القادمة من جدول question_types في قاعدة البيانات
  getQuestionTypes: () => {
    // نستخدم Promise لمحاكاة طلب شبكة (Network Request)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            { id: 1, code: 'SHORT_TEXT', label: 'نص قصير' },
            { id: 2, code: 'LONG_TEXT', label: 'نص طويل' },
            { id: 3, code: 'SINGLE_CHOICE', label: 'اختيار واحد' },
            { id: 4, code: 'MULTIPLE_CHOICE', label: 'اختيار متعدد' },
            { id: 5, code: 'NUMBER', label: 'رقم' },
            { id: 6, code: 'DATE', label: 'تاريخ' },
            { id: 7, code: 'TIME', label: 'وقت' },
            { id: 8, code: 'DATE_RANGE', label: 'مجال تاريخ' },
            { id: 9, code: 'DATETIME_RANGE', label: 'مجال تاريخ ووقت' },
            // يمكنك إضافة IMAGE و RATING إذا تم دعمهم في الباك اند
          ]
        })
      }, 50) // تأخير بسيط جداً
    })
  }
}

// ✅ Response Service (للمدارس - تسليم الإجابات)
export const responseService = {
  getAvailableSurveys: () => api.get('/response/available'),
  getSurveyProfile: (surveyId) => api.get(`/response/profile/${surveyId}`),
  submitResponse: (surveyId, responseData) => api.post(`/response/submit/${surveyId}`, responseData),
  getSchoolResponse: (surveyId, schoolId) => api.get(`/response/survey/${surveyId}/school/${schoolId}`)
}

// ✅ Analytics Service (للتحليلات والإحصائيات)
export const analyticsService = {
  getSurveySummary: (surveyId) => api.get(`/analytics/survey/${surveyId}/summary`),
  getSurveyTracking: (surveyId) => api.get(`/analytics/survey/${surveyId}/tracking`),
  getSurveyAnalysis: (surveyId) => api.get(`/analytics/survey/${surveyId}/analysis`),
  getGlobalAnalytics: () => api.get('/analytics/global')
}
export default api