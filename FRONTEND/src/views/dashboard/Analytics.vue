<template>
  <div class="analytics-dashboard">
    <!-- Animated Header Section -->
    <div class="dashboard-header animate-fade-in">
      <div class="header-content">
        <div class="header-icon-container">
          <div class="icon-wrapper animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bar-chart-2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
        </div>
        <div class="header-text">
          <h1 class="animate-slide-up">لوحة التحليلات المتقدمة</h1>
          <p class="header-subtitle animate-slide-up delay-1">نظرة شاملة وتفاعلية على أداء النظام والاستبيانات</p>
        </div>
      </div>
      <div class="header-actions">
        <button 
          class="btn-refresh animate-scale-hover" 
          @click="refreshData" 
          :disabled="loading"
          :class="{ 'animate-spin': loading }"
        >
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-refresh-cw">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-loader">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
          <span>{{ loading ? 'جارٍ التحديث...' : 'تحديث البيانات' }}</span>
        </button>
      </div>
    </div>

    <!-- Enhanced Navigation Tabs -->
    <div class="dashboard-tabs animate-fade-in delay-2">
      <button 
        class="tab-btn animate-scale-hover" 
        :class="{ active: activeTab === 'overview', 'animate-bounce': activeTab === 'overview' }"
        @click="switchTab('overview')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        نظرة عامة
      </button>
      <button 
        class="tab-btn animate-scale-hover" 
        :class="{ active: activeTab === 'surveys', 'animate-bounce': activeTab === 'surveys' }"
        @click="switchTab('surveys')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        تحليل الاستبيانات
      </button>
      <button 
        class="tab-btn animate-scale-hover" 
        :class="{ active: activeTab === 'schools', 'animate-bounce': activeTab === 'schools' }"
        @click="switchTab('schools')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        تحليل المدارس
      </button>
      <button 
        class="tab-btn animate-scale-hover" 
        :class="{ active: activeTab === 'users', 'animate-bounce': activeTab === 'users' }"
        @click="switchTab('users')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        تحليل المستخدمين
      </button>
    </div>

    <!-- حالة التحميل -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>

    <!-- رسالة خطأ -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="refreshData">إعادة المحاولة</button>
    </div>

    <!-- عرض فارغ عند عدم وجود بيانات -->
    <div v-else-if="!globalStats && activeTab === 'overview'" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>لا توجد بيانات متاحة</h3>
      <p>لا توجد بيانات تحليلية متاحة حالياً. يرجى التحقق من الاتصال أو المحاولة لاحقاً.</p>
    </div>

    <!-- Overview Dashboard (Redesigned) -->
    <div v-else-if="activeTab === 'overview'" class="overview-dashboard fade-in">
      
      <!-- Key Metrics Cards (PRO DESIGN) - Reduced Size -->
      <div class="metrics-grid small">
        <!-- Surveys Card -->
        <div class="metric-card card-blue small">
          <div class="metric-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="metric-content">
            <p class="metric-label">إجمالي الاستبيانات</p>
            <h3 class="metric-value">{{ formatNumber(globalStats?.total_surveys || 0) }}</h3>
          </div>
          <div class="metric-bg-shape"></div>
        </div>

        <!-- Responses Card -->
        <div class="metric-card card-green small">
          <div class="metric-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="metric-content">
            <p class="metric-label">إجمالي الإجابات</p>
            <h3 class="metric-value">{{ formatNumber(globalStats?.total_responses || 0) }}</h3>
          </div>
          <div class="metric-bg-shape"></div>
        </div>

        <!-- Schools Card -->
        <div class="metric-card card-orange small">
          <div class="metric-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4"></path></svg>
          </div>
          <div class="metric-content">
            <p class="metric-label">المدارس المسجلة</p>
            <h3 class="metric-value">{{ formatNumber(globalStats?.total_schools || 0) }}</h3>
          </div>
          <div class="metric-bg-shape"></div>
        </div>

        <!-- Users Card -->
        <div class="metric-card card-purple small">
          <div class="metric-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="metric-content">
            <p class="metric-label">المستخدمين</p>
            <h3 class="metric-value">{{ formatNumber(globalStats?.total_users || 0) }}</h3>
          </div>
          <div class="metric-bg-shape"></div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-row">
        
        <!-- Monthly Activity Chart -->
        <div class="chart-card large">
          <div class="chart-header">
            <h3>📊 النشاط الشهري</h3>
            <span class="chart-subtitle">عدد الاستبيانات المنشورة خلال الأشهر الماضية</span>
          </div>
          <div class="chart-body bar-chart-container">
            <div class="y-axis">
              <span>{{ maxMonthlyCount }}</span>
              <span>{{ Math.round(maxMonthlyCount / 2) }}</span>
              <span>0</span>
            </div>
            <div class="bars-wrapper">
              <div 
                v-for="(item, index) in monthlyActivity" 
                :key="index" 
                class="bar-group"
              >
                <div 
                  class="bar" 
                  :style="{ height: `${(item.count / (maxMonthlyCount || 1)) * 100}%` }"
                  :title="`${item.count} استبيان`"
                >
                  <span class="bar-value">{{ item.count }}</span>
                </div>
                <span class="bar-label">{{ item.month }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Survey Type Distribution Chart -->
        <div class="chart-card small">
          <div class="chart-header">
            <h3>📋 توزيع الاستبيانات حسب النوع</h3>
            <span class="chart-subtitle">نسبة الاستبيانات الدورية مقابل العادية</span>
          </div>
          <div class="chart-body donut-chart-container">
            <div class="donut-chart">
              <svg viewBox="0 0 100 100" class="donut-svg">
                <!-- Background -->
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" stroke-width="15" />
                <!-- Segments -->
                <circle 
                  v-for="(item, index) in surveysByType"
                  :key="index"
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  :stroke="item.color"
                  stroke-width="15"
                  :stroke-dasharray="calculateStrokeDashArray(index)"
                  :stroke-dashoffset="calculateStrokeDashOffset(index)"
                  class="donut-segment"
                />
              </svg>
              <div class="donut-center">
                <span class="center-number">{{ totalSurveys }}</span>
                <span class="center-text">إجمالي</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-item" v-for="item in surveysByType" :key="item.name">
                <span class="legend-dot" :style="{background: item.color}"></span>
                <span class="legend-name">{{ item.name }}</span>
                <span class="legend-val">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity (Timeline) -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>⚡ النشاط الأخير</h3>
          <span class="chart-subtitle">آخر العمليات التي تمت على النظام</span>
        </div>
        <div class="activity-timeline">
          <div 
            v-for="(activity, index) in recentActivities" 
            :key="index" 
            class="timeline-item"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="activity-title">{{ activity.text }}</span>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
              <div class="timeline-meta">
                <span class="user-badge">👤 {{ activity.created_by }}</span>
                <span 
                  class="status-badge-mini" 
                  :class="getActivityStatusClass(activity.status)"
                >
                  {{ activity.status }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="recentActivities.length === 0" class="empty-timeline">
            لا يوجد نشاط حديث لعرضه
          </div>
        </div>
      </div>

    </div>

    <!-- Schools Analytics - Enhanced Professional Design -->
    <div v-else-if="activeTab === 'schools'" class="schools-analytics animate-fade-in">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل تحليلات المدارس...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="loadSchoolAnalytics">إعادة المحاولة</button>
      </div>
      
      <div v-else-if="schoolAnalyticsData" class="schools-content">
        <!-- Enhanced Schools Overview Cards - Updated Structure for NEW API -->
        <div class="overview-cards enhanced-overview">
          <div class="overview-card enhanced-card primary">
            <div class="card-icon enhanced-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M12 12h.01"></path>
                <path d="M9 16h6"></path>
              </svg>
            </div>
            <div class="card-content enhanced-content">
              <div class="card-value">{{ formatNumber(schoolAnalyticsData.total_schools) }}</div>
              <div class="card-label">إجمالي المدارس</div>
              <div class="card-trend neutral">
                <span>إجمالي المسجل في النظام</span>
              </div>
            </div>
          </div>
          
          <div class="overview-card enhanced-card success">
            <div class="card-icon enhanced-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="card-content enhanced-content">
              <div class="card-value">{{ schoolAnalyticsData.total_directorates || 0 }}</div>
              <div class="card-label">المديريات</div>
              <div class="card-trend neutral">
                <span>{{ calculateAveragePerDirectorate(schoolAnalyticsData.total_schools, schoolAnalyticsData.directorates_distribution) }} مدرسة/مديرية</span>
              </div>
            </div>
          </div>
          
          <div class="overview-card enhanced-card warning">
            <div class="card-icon enhanced-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div class="card-content enhanced-content">
              <div class="card-value">{{ schoolAnalyticsData.total_complexes || 0 }}</div>
              <div class="card-label">المجمعات</div>
              <div class="card-trend neutral">
                <span>{{ calculateClustersPerDirectorate(schoolAnalyticsData.total_complexes, schoolAnalyticsData.total_directorates) }} مجمع/مديرية</span>
              </div>
            </div>
          </div>

          <div class="overview-card enhanced-card danger" v-if="schoolAnalyticsData.empty_schools_count !== undefined">
            <div class="card-icon enhanced-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div class="card-content enhanced-content">
              <div class="card-value">{{ schoolAnalyticsData.empty_schools_count || 0 }}</div>
              <div class="card-label">مدارس شاغرة</div>
              <div class="card-trend negative">
                <span>بحاجة لتحديث البيانات</span>
              </div>
            </div>
          </div>
          
          <div class="overview-card enhanced-card info">
            <div class="card-icon enhanced-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="card-content enhanced-content">
              <div class="card-value">
                {{ 
                  schoolAnalyticsData.avg_schools_per_complex !== undefined && schoolAnalyticsData.avg_schools_per_complex !== null 
                  ? schoolAnalyticsData.avg_schools_per_complex.toFixed(1) 
                  : calculateAverageSchoolsPerCluster(schoolAnalyticsData.total_schools, schoolAnalyticsData.total_complexes) 
                }}
              </div>
              <div class="card-label">مدرسة/مجمع</div>
              <div class="card-trend neutral">
                <span>متوسط المدارس في المجمعات</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Enhanced Schools Charts Section -->
        <div class="charts-section enhanced-charts">
          <!-- Balanced Directorates Distribution Chart -->
          <div class="chart-container enhanced-container animate-slide-up delay-1">
            <div class="chart-header">
              <h3 class="chart-title">توزيع المدارس حسب المديريات</h3>
              <div class="chart-actions">
                <button 
                  class="chart-action-btn" 
                  :class="{ active: viewType === 'list' }"
                  @click="switchViewType('list')"
                  title="عرض القائمة"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Grid View (Balanced Layout) -->
            <div v-if="viewType === 'grid'" class="balanced-directorates-view">
              <div class="view-header">
                <div class="stats-summary">
                  <div class="stat-item">
                    <span class="stat-number">{{ Object.keys(sortedDirectorates).length }}</span>
                    <span class="stat-label">مديرية</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ schoolAnalyticsData.total_schools || 0 }}</span>
                    <span class="stat-label">مدرسة</span>
                  </div>
                </div>
               
              </div>
              
              <div class="balanced-directorates-grid">
                <div 
                  v-for="(count, directorate, index) in sortedDirectorates" 
                  :key="directorate"
                  class="balanced-directorate-item"
                  :class="getBalancedSizeClass(count)"
                  @mouseenter="highlightDirectorate(index)"
                  @mouseleave="unhighlightDirectorate()"
                >
                  <div class="directorate-rank">#{{ index + 1 }}</div>
                  <div class="directorate-name-balanced">{{ truncateDirectorateName(directorate, 25) }}</div>
                  <div class="directorate-stats-balanced">
                    <div class="school-count-display">{{ count }}</div>
                    <div class="percentage-display">{{ calculatePercentage(count, schoolAnalyticsData.total_schools) }}%</div>
                  </div>
                  <div class="progress-bar-container">
                    <div 
                      class="progress-fill-balanced"
                      :style="{ width: calculateBalancedWidth(count) + '%' }"
                      :class="getBalancedSizeClass(count)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- List View (Detailed Table) -->
            <div v-else class="detailed-directorates-view">
              <div class="list-header">
                <div class="summary-stats">
                  <div class="summary-card-alt">
                    <div class="card-icon-alt">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div class="card-content-alt">
                      <div class="card-value-alt">{{ Object.keys(sortedDirectorates).length }}</div>
                      <div class="card-label-alt">إجمالي المديريات</div>
                    </div>
                  </div>
                  
                  <div class="summary-card-alt">
                    <div class="card-icon-alt">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M12 12h.01"></path>
                        <path d="M9 16h6"></path>
                      </svg>
                    </div>
                    <div class="card-content-alt">
                      <div class="card-value-alt">{{ calculateAverageSchoolsPerDirectorate() }}</div>
                      <div class="card-label-alt">متوسط المدارس/مديرية</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="directorates-table-container">
                <table class="directorates-table">
                  <thead>
                    <tr>
                      <th>الترتيب</th>
                      <th>اسم المديرية</th>
                      <th>عدد المدارس</th>
                      <th>النسبة المئوية</th>
                      <th>شريط التقدم</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(count, directorate, index) in sortedDirectorates" 
                      :key="directorate"
                      class="table-row"
                      :class="{ 'highlighted-row': highlightedRow === index }"
                      @mouseenter="highlightedRow = index"
                      @mouseleave="highlightedRow = null"
                    >
                      <td class="rank-cell">#{{ index + 1 }}</td>
                      <td class="name-cell">{{ directorate }}</td>
                      <td class="count-cell">{{ count }}</td>
                      <td class="percentage-cell">{{ calculatePercentage(count, schoolAnalyticsData.total_schools) }}%</td>
                      <td class="progress-cell">
                        <div class="table-progress-bar">
                          <div 
                            class="table-progress-fill"
                            :style="{ width: calculatePercentage(count, schoolAnalyticsData.total_schools) + '%' }"
                            :class="getTableProgressClass(count)"
                          ></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <!-- Enhanced Clusters Distribution Chart -->
          <div class="chart-container enhanced-container animate-slide-up delay-2">
            <div class="chart-header">
              <h3 class="chart-title">توزيع المجمعات والمدارس</h3>
              <div class="chart-actions">
                <button class="chart-action-btn" @click="sortByClusters()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="6" y1="12" x2="21" y2="12"></line>
                    <line x1="9" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div class="enhanced-clusters-view">
              <div class="clusters-summary">
                <div class="summary-card">
                  <div class="summary-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ schoolAnalyticsData.total_complexes || 0 }}</div>
                    <div class="summary-label">إجمالي المجمعات</div>
                  </div>
                </div>
                
                <div class="summary-card">
                  <div class="summary-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ Math.round(schoolAnalyticsData.avg_schools_per_complex) || calculateAverageSchoolsPerCluster(schoolAnalyticsData.total_schools, schoolAnalyticsData.total_complexes) }}</div>
                    <div class="summary-label">مدرسة/مجمع</div>
                  </div>
                </div>
              </div>
              
              <div class="clusters-detailed-view">
                <h4 class="section-subtitle">توزيع المجمعات حسب عدد المدارس</h4>
                <div class="clusters-bars-container">
                  <div 
                    v-for="(cluster, index) in clustersData" 
                    :key="index"
                    class="cluster-bar-item"
                  >
                    <div class="cluster-info">
                      <span class="cluster-name">{{ cluster.name }}</span>
                      <span class="cluster-schools">{{ cluster.schools }} مدرسة</span>
                    </div>
                    <div class="cluster-bar-track">
                      <div 
                        class="cluster-bar-fill"
                        :style="{ width: `${calculateClusterBarWidth(cluster.schools)}%` }"
                        :class="getClusterBarClass(cluster.schools)"
                      >
                        <span class="cluster-bar-label">{{ cluster.schools }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state enhanced-empty">
        <div class="empty-icon">🏫</div>
        <h3>لا توجد بيانات تحليلية للمدارس</h3>
        <p>لا توجد بيانات تحليلية متاحة حالياً للمدارس. يرجى التحقق من الاتصال أو المحاولة لاحقاً.</p>
        <div class="empty-actions">
          <button class="btn-primary enhanced-btn" @click="loadSchoolAnalytics">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 1 21 12.79z"></path>
            </svg>
            تحديث البيانات
          </button>
          <button class="btn-secondary enhanced-btn" @click="refreshData">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            إعادة تحميل
          </button>
        </div>
      </div>
    </div>

    <!-- Users Analytics -->
    <div v-else-if="activeTab === 'users'" class="users-analytics animate-fade-in">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل تحليلات المستخدمين...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="loadUserAnalytics">إعادة المحاولة</button>
      </div>
      
      <div v-else-if="userAnalyticsData" class="users-content">
        <!-- Users Overview Cards -->
        <div class="overview-cards">
          <div class="overview-card primary">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ formatNumber(userAnalyticsData.total_users) }}</h3>
              <p>إجمالي المستخدمين</p>
            </div>
          </div>
          
          <div class="overview-card success">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ formatNumber(userAnalyticsData.admins) }}</h3>
              <p>المدراء</p>
            </div>
          </div>
          
          <div class="overview-card warning">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ formatNumber(userAnalyticsData.school_users) }}</h3>
              <p>مستخدمي المدارس</p>
            </div>
          </div>
          
          <div class="overview-card info" v-if="userAnalyticsData.users_without_schools !== undefined">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ formatNumber(userAnalyticsData.users_without_schools) }}</h3>
              <p>بدون مدارس</p>
            </div>
          </div>
        </div>
        
        <!-- Users Charts Section -->
        <div class="charts-section">
          <!-- Users Role Distribution -->
          <div class="chart-container animate-slide-up delay-1">
            <h3 class="chart-title">توزيع المستخدمين حسب الأدوار</h3>
            <div class="pie-chart">
              <div class="pie-container">
                <svg viewBox="0 0 100 100" class="pie-svg">
                  <circle cx="50" cy="50" r="45" fill="#f1f5f9" />
                  <path 
                    v-for="(count, role, index) in userAnalyticsData.roles_distribution"
                    :key="role"
                    :d="getPieSlicePath(index, userAnalyticsData.roles_distribution)"
                    :fill="getRoleColor(role)"
                    class="pie-slice"
                  />
                </svg>
              </div>
              <div class="pie-center">
                <span class="total-value">{{ userAnalyticsData.total_users }}</span>
                <span class="total-label">إجمالي</span>
              </div>
            </div>
            <div class="legend">
              <div class="legend-item" v-for="(count, role) in userAnalyticsData.roles_distribution" :key="role">
                <div class="legend-color" :style="{ backgroundColor: getRoleColor(role) }"></div>
                <span>{{ formatRoleName(role) }} ({{ count }} - {{ calculatePercentageFromDistribution(role, userAnalyticsData.roles_distribution) }}%)</span>
              </div>
            </div>
          </div>
          
          <!-- User Activity Metrics -->
          <div class="chart-container animate-slide-up delay-2">
            <h3 class="chart-title">مترىات الأداء</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-icon primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div class="metric-content">
                  <h4>{{ userAnalyticsData.users_without_schools || 0 }}</h4>
                  <p>المستخدمون بدون مدارس</p>
                </div>
              </div>
              
              <div class="metric-card" v-if="userAnalyticsData.generated_at">
                <div class="metric-icon success">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div class="metric-content">
                  <h4>{{ formatDate(userAnalyticsData.generated_at) }}</h4>
                  <p>آخر تحديث</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>لا توجد بيانات تحليلية للمستخدمين</h3>
        <p>لا توجد بيانات تحليلية متاحة حالياً للمستخدمين.</p>
        <button class="btn-primary" @click="loadUserAnalytics">تحديث البيانات</button>
      </div>
    </div>
    <div v-else-if="activeTab === 'surveys'" class="survey-analytics animate-fade-in">
      <div class="survey-controls animate-slide-up">
        <div class="survey-selector">
          <label>اختر استبيان للتحليل:</label>
          <select v-model="selectedSurveyId" @change="loadSurveyAnalytics" class="modern-select">
            <option value="">-- اختر استبيان --</option>
            <option 
              v-for="survey in surveys" 
              :key="survey.id" 
              :value="survey.id"
            >
              {{ survey.title }}
            </option>
          </select>
        </div>
        
      </div>

      <div v-if="selectedSurveyId && surveyAnalysis[selectedSurveyId]" class="analysis-content">
        <!-- Survey Info Section -->
        <div class="survey-info-section animate-slide-up delay-0">
          <div class="survey-info-card">
            <h2 class="section-title">معلومات الاستبيان</h2>
            <div class="survey-info-grid">
              <div class="info-item">
                <label>العنوان:</label>
                <span>{{ selectedSurveyComputed?.title || '-' }}</span>
              </div>
              <div class="info-item">
                <label>الوصف:</label>
                <span>{{ selectedSurveyComputed?.description || '-' }}</span>
              </div>
              <div class="info-item">
                <label>الحالة:</label>
                <span class="status-badge" :class="getStatusClass(selectedSurveyComputed?.status_id)">
                  {{ selectedSurveyComputed?.status_label || 'غير محدد' }}
                </span>
              </div>
              <div class="info-item">
                <label>تاريخ البدء:</label>
                <span>{{ formatDate(selectedSurveyComputed?.dates?.start) || '-' }}</span>
              </div>
              <div class="info-item">
                <label>تاريخ الانتهاء:</label>
                <span>{{ formatDate(selectedSurveyComputed?.dates?.end) || '-' }}</span>
              </div>
              <div class="info-item">
                <label>النوع:</label>
                <span>{{ selectedSurveyComputed?.is_periodic ? 'دوري' : 'عادي' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Schools Response Status -->
        <div class="schools-status-section animate-slide-up delay-1">
          <h2 class="section-title">حالة إجابة المدارس</h2>
          <div class="schools-status-grid">
            <div class="status-card responded">
              <div class="status-icon">✅</div>
              <div class="status-content">
                <h3>{{ respondedSchools.length }}</h3>
                <p>مدارس أجابت</p>
              </div>
            </div>
            <div class="status-card not-responded">
              <div class="status-icon">⏳</div>
              <div class="status-content">
                <h3>{{ notRespondedSchools.length }}</h3>
                <p>مدارس لم تجب</p>
              </div>
            </div>
          </div>
          
          <!-- Schools Lists -->
          <div class="schools-lists">
            <div class="schools-list-card">
              <h3>المدارس التي أجابت ({{ respondedSchools.length }})</h3>
              <div class="schools-list">
                <div v-for="school in respondedSchools" :key="school.school_id" class="school-item responded">
                  <span class="school-name">{{ school.school_name }}</span>
                  <span class="response-date">{{ formatDate(school.submitted_at) }}</span>
                  <span v-if="school.submitted_by" class="submitted-by">بواسطة: {{ getSubmitterName(school.submitted_by) }}</span>
                </div>
                <div v-if="respondedSchools.length === 0" class="empty-list">
                  لا توجد مدارس أجابت بعد
                </div>
              </div>
            </div>
            
            <div class="schools-list-card">
              <h3>المدارس التي لم تجب ({{ notRespondedSchools.length }})</h3>
              <div class="schools-list">
                <div v-for="school in notRespondedSchools" :key="school.school_id" class="school-item not-responded">
                  <span class="school-name">{{ school.school_name }}</span>
                  <span class="status-text">لم تجب</span>
                </div>
                <div v-if="notRespondedSchools.length === 0" class="empty-list">
                  جميع المدارس أجابت
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Survey Summary Cards -->
        <div class="summary-section animate-slide-up delay-2">
          <h2 class="section-title">ملخص الاستبيان</h2>
          <div class="summary-metrics">
            <div class="summary-card primary">
              <div class="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div class="card-content">
                <h3>{{ surveySummary[selectedSurveyId]?.total || 0 }}</h3>
                <p>إجمالي المدارس</p>
              </div>
            </div>
            
            <div class="summary-card success">
              <div class="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div class="card-content">
                <h3>{{ surveySummary[selectedSurveyId]?.submitted || 0 }}</h3>
                <p>المدارس المستجيبة</p>
              </div>
            </div>
            
            <div class="summary-card warning">
              <div class="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="card-content">
                <h3>{{ surveySummary[selectedSurveyId]?.pending || 0 }}</h3>
                <p>المدارس المعلقة</p>
              </div>
            </div>
            
            <div class="summary-card info">
              <div class="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="card-content">
                <h3>{{ surveySummary[selectedSurveyId]?.rate || 0 }}%</h3>
                <p>نسبة الإنجاز</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Target Schools and Users Table -->
        <div class="target-schools-section animate-slide-up delay-3">
          <h2 class="section-title">المدارس المستهدفة والمستخدمين</h2>
          <div class="table-container table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>اسم المدرسة</th>
                  <th>حالة الإجابة</th>
                  <th>تاريخ الإجابة</th>
                  <th>تم الإرسال بواسطة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(targetSchool) in targetSchoolsWithUsers" :key="targetSchool.school_id">
                  <td data-label="اسم المدرسة">
                    <strong>{{ targetSchool.school_name }}</strong>
                  </td>
                  <td data-label="حالة الإجابة">
                    <span class="status-badge" :class="targetSchool.has_responded ? 'active' : 'draft'">
                      {{ targetSchool.has_responded ? 'أجابت' : 'لم تجب' }}
                    </span>
                  </td>
                  <td data-label="تاريخ الإجابة">{{ targetSchool.has_responded ? formatDate(targetSchool.responded_at) : '-' }}</td>
                  <td data-label="تم الإرسال بواسطة">{{ getSubmitterName(targetSchool.submitted_by) }}</td>
                  <td data-label="الإجراءات" class="actions-cell">
                    <button 
                      v-if="targetSchool.has_responded"
                      class="action-btn btn-view-responses"
                      @click="viewSchoolResponses(targetSchool.school_id)"
                    >
                      عرض الإجابات
                    </button>
                    <span v-else class="no-responses">-</span>
                  </td>
                </tr>
                <tr v-if="targetSchoolsWithUsers.length === 0">
                  <td colspan="5" class="empty-table">لا توجد مدارس مستهدفة</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="selectedSurveyId && !surveyAnalysis[selectedSurveyId]" class="loading-analysis animate-fade-in">
        <div class="spinner"></div>
        <p>جاري تحميل التحليل...</p>
      </div>

      <div v-else class="empty-state animate-fade-in">
        <div class="empty-icon">📋</div>
        <h3>اختر استبيان لعرض التحليل</h3>
        <p>من فضلك اختر استبيان من القائمة أعلاه لعرض التحليل التفصيلي</p>
      </div>
    </div>

    <!-- Responses Modal -->
<div v-if="showResponsesModal" class="modal-overlay" @click.self="showResponsesModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="header-content-wrapper">
            <img src="/logo.png" alt="شعار الوزارة" class="ministry-logo" />
            <div class="header-titles">
              <h3>إجابات المدرسة</h3>
              <span class="school-subtitle">{{ getSchoolName(selectedSchoolForResponses) }}</span>
            </div>
          </div>
          <button class="close-modal" @click="showResponsesModal = false">&times;</button>
        </div>

        <div class="modal-body custom-scrollbar">
          <div v-if="schoolResponses[selectedSchoolForResponses] && schoolResponses[selectedSchoolForResponses].length > 0" class="content-wrapper">
            
            <div class="info-card">
              <div class="info-icon">📋</div>
              <div class="info-text">
                <strong>عدد الأسئلة المجابة:</strong>
                <span>{{ schoolResponses[selectedSchoolForResponses].length }} سؤال</span>
              </div>
            </div>

            <div class="responses-container">
              <div 
                v-for="(response, index) in schoolResponses[selectedSchoolForResponses]" 
                :key="index"
                class="response-card-styled"
              >
                <div class="question-header">
                  <span class="q-number">س{{ index + 1 }}</span>
                  <h4 class="q-text">{{ response.question_text || 'نص السؤال غير متوفر' }}</h4>
                  <span class="type-badge">{{ getQuestionType(response.type) || response.type }}</span>
                </div>
                
                <div class="answer-box">
                  <span class="answer-label">الإجابة:</span>
                  <p class="answer-value">{{ parseAnswerValue(response.answer_value, response.type) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state-modal">
            <div class="empty-icon-modal">📭</div>
            <p>لا توجد إجابات مسجلة لهذه المدرسة</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showResponsesModal = false">
            إغلاق
          </button>
        </div>
      </div>
    </div>

    <!-- Survey Analysis Modal: render only in Surveys tab and when a survey is selected -->
    <SurveyAnalysisModal
      v-if="activeTab === 'surveys' && selectedSurveyId"
      :survey-id="selectedSurveyId"
      :survey-title="selectedSurveyComputed?.title || 'استبيان'"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics.js'
import { useSurveyStore } from '@/stores/surveys.js'
import { useSchoolsStore } from '@/stores/schools.js'
import { useUsersStore } from '@/stores/users.js'
import SurveyAnalysisModal from '@/components/analytics/SurveyAnalysisModal.vue'

// Stores
const analyticsStore = useAnalyticsStore()
const surveyStore = useSurveyStore()
const schoolsStore = useSchoolsStore()
const usersStore = useUsersStore()

// Reactive state
const activeTab = ref('overview')
const selectedSurveyId = ref(null)
const selectedSchoolId = ref(null)
const schoolAnalyticsData = ref(null)
const userAnalyticsData = ref(null)
const selectedSurvey = ref(null)
const schoolResponses = ref({})
const showResponsesModal = ref(false)
const selectedSchoolForResponses = ref(null)

// Chart interaction states
const hoveredBar = ref(null)
const highlightedSegment = ref(null)
const chartViews = ref({
  monthly: 'bar',
  distribution: 'donut'
})

// Directorate visualization states
const viewType = ref('grid') // 'grid' or 'list'
const highlightedDirectorate = ref(null)
const highlightedRow = ref(null)

// Computed properties
const globalStats = computed(() => analyticsStore.globalStats)
const surveySummary = computed(() => analyticsStore.surveySummary)
const surveyTracking = computed(() => analyticsStore.surveyTracking)
const surveyAnalysis = computed(() => analyticsStore.surveyAnalysis)
const surveys = computed(() => surveyStore.surveys)
const schools = computed(() => schoolsStore.schools)
const users = computed(() => usersStore.users)

// Get selected survey details - use computed for reactivity
const selectedSurveyComputed = computed(() => {
  if (!selectedSurveyId.value) return null
  
  // Prioritize the individually loaded survey
  if (selectedSurvey.value && selectedSurvey.value.id === selectedSurveyId.value) {
    return selectedSurvey.value
  }
  
  // Fall back to finding in surveys store
  return surveys.value.find(s => s.id === selectedSurveyId.value)
})

// Schools that responded and didn't respond
const respondedSchools = computed(() => {
  if (!selectedSurveyId.value || !surveyTracking.value[selectedSurveyId.value]) return []
  return surveyTracking.value[selectedSurveyId.value].filter(s => s.status === 'SUBMITTED')
})

const notRespondedSchools = computed(() => {
  if (!selectedSurveyId.value || !surveyTracking.value[selectedSurveyId.value]) return []
  return surveyTracking.value[selectedSurveyId.value].filter(s => s.status === 'PENDING')
})

// Target schools with their users
const targetSchoolsWithUsers = computed(() => {
  if (!selectedSurveyId.value || !surveyTracking.value[selectedSurveyId.value]) return []
  
  return surveyTracking.value[selectedSurveyId.value].map(tracking => {
    const school = schools.value.find(s => s.id === tracking.school_id)
    const schoolUsers = users.value.filter(u => {
      if (u.school_id === tracking.school_id) return true
      if (u.school && Array.isArray(u.school) && u.school.some(s => s.id === tracking.school_id)) return true
      if (u.school && u.school.id === tracking.school_id) return true
      return false
    })
    
    return {
      school_id: tracking.school_id,
      school_name: tracking.school_name || school?.name || `مدرسة #${tracking.school_id}`,
      users: schoolUsers,
      has_responded: tracking.status === 'SUBMITTED',
      responded_at: tracking.submitted_at || null,
      submitted_by: tracking.submitted_by || null
    }
  })
})
const loading = computed(() => {
  return analyticsStore.loading || 
         surveyStore.loading || 
         schoolsStore.loading || 
         usersStore.loading
})
const error = computed(() => {
  return analyticsStore.error || 
         surveyStore.error || 
         schoolsStore.error || 
         usersStore.error
})

// Enhanced data structures - Use only API data, no static values
const keyMetrics = computed(() => {
  if (!globalStats.value?.cards) return [];
  
  // Only use real data from API, no fallback values
  // Map fields from 'cards' object in the API response
  return [
    {
      key: 'surveys',
      label: 'إجمالي الاستبيانات',
      value: globalStats.value.cards.total_surveys,
      target: 0,
      trend: 0,
      color: 'primary',
      icon: SurveyIcon
    },
    {
      key: 'responses',
      label: 'إجمالي الإجابات',
      value: globalStats.value.cards.total_responses,
      target: 0,
      trend: 0,
      color: 'success',
      icon: ResponseIcon
    },
    {
      key: 'schools',
      label: 'إجمالي المدارس',
      value: globalStats.value.cards.total_schools,
      target: 0,
      trend: 0,
      color: 'warning',
      icon: SchoolIcon
    },
    {
      key: 'users',
      label: 'إجمالي المستخدمين',
      value: globalStats.value.cards.total_users,
      target: 0,
      trend: 0,
      color: 'info',
      icon: UserIcon
    }
  ].filter(metric => metric.value !== undefined && metric.value !== null);
});

const monthlyActivity = computed(() => {
  // Use real data from global analytics if available
  // Map from 'charts.monthly_activity'
  if (globalStats.value?.charts?.monthly_activity) {
    return globalStats.value.charts.monthly_activity.map(item => ({
      month: item.month?.trim() || '',
      count: item.count || 0,
      type: 'completed'
    }));
  }
  
  return [];
});

const maxMonthlyCount = computed(() => {
  if (monthlyActivity.value && monthlyActivity.value.length > 0) {
    const max = Math.max(...monthlyActivity.value.map(item => item.count));
    return Math.max(max * 1.2, 10);
  }
  return 10;
});

// Enhanced chart computed properties

const totalSurveys = computed(() => {
  return surveysByType.value.reduce((sum, item) => sum + item.value, 0);
});

const donutCircumference = computed(() => {
  return 2 * Math.PI * 40; // 2πr where r = 40
});

const totalResponses = computed(() => {
  return globalStats.value?.cards?.total_responses || 0;
});

const surveysByType = computed(() => {
  // Only use real data from API, no static fallback data
  // Map from 'charts.surveys_by_type'
  if (globalStats.value?.charts?.surveys_by_type) {
    const typeData = globalStats.value.charts.surveys_by_type;
    return [
      { name: 'دوري', value: typeData.periodic || 0, color: '#4CAF50' },
      { name: 'عادي', value: typeData.regular || 0, color: '#2196F3' }
    ].filter(item => item.value > 0);
  }
  
  return [];
});

const recentActivities = computed(() => {
  // Only use real data from API
  const activities = [];
  
  // Use real data from global analytics if available
  if (globalStats.value?.recent_activity && globalStats.value.recent_activity.length > 0) {
    globalStats.value.recent_activity.forEach(activity => {
      activities.push({
        text: activity.title || 'نشاط جديد',
        time: formatDateRelative(activity.date),
        created_by: activity.created_by || 'غير محدد',
        status: activity.status || 'نشط',
        type: 'survey',
        icon: SurveyIcon
      });
    });
    
    // Limit to 4 activities
    return activities.slice(0, 4);
  }
  
  return [];
});

// Icon components
const SurveyIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `
}

const ResponseIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  `
}

const SchoolIcon = {
  
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M12 12h.01"></path>
      <path d="M9 16h6"></path>
    </svg>
  `
}

const UserIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  `
}

const CompletedIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `
}

// Chart Interaction Methods
const highlightBar = (index) => {
  hoveredBar.value = index;
};

const unhighlightBar = () => {
  hoveredBar.value = null;
};

const highlightSegment = (index) => {
  highlightedSegment.value = index;
};

const unhighlightSegment = () => {
  highlightedSegment.value = null;
};

const toggleChartView = (chartType) => {
  const views = ['bar', 'line'];
  const currentIndex = views.indexOf(chartViews.value[chartType]);
  const nextIndex = (currentIndex + 1) % views.length;
  chartViews.value[chartType] = views[nextIndex];
};

const exportChart = (chartType) => {
  // Implementation for chart export
  console.log(`Exporting ${chartType} chart`);
  // TODO: Implement actual chart export functionality
};


const getSurveyStatusText = (type) => {
  const texts = {
    completed: 'مكتمل',
    active: 'نشط',
    pending: 'معلق'
  };
  return texts[type] || type;
};

const calculateStrokeDashArray = (index) => {
  const item = surveysByType.value[index];
  if (!item) return '0';
  
  const percentage = (item.value / totalSurveys.value) * 100;
  const strokeLength = (percentage / 100) * donutCircumference.value;
  const gapLength = donutCircumference.value - strokeLength;
  
  return `${strokeLength} ${gapLength}`;
};

const calculateStrokeDashOffset = (index) => {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    const item = surveysByType.value[i];
    if (item) {
      const percentage = (item.value / totalSurveys.value) * 100;
      offset += (percentage / 100) * donutCircumference.value;
    }
  }
  return offset;
};

// Methods
const switchTab = (tab) => {
  activeTab.value = tab
  refreshData()
}

const refreshData = async () => {
  try {
    // Always fetch global analytics for overview tab
    if (activeTab.value === 'overview' || !analyticsStore.globalStats) {
      await analyticsStore.fetchGlobalAnalytics();
    }
    
    // Fetch all necessary data
    await Promise.allSettled([
      surveyStore.fetchSurveys(),
      schoolsStore.fetchSchools(),
      usersStore.fetchUsers()
    ]);
    
    // If on surveys tab and we have a selected survey, load its analytics
    if (activeTab.value === 'surveys' && selectedSurveyId.value) {
      await loadSurveyAnalytics();
    }
    
    // If on schools tab, load school analytics
    if (activeTab.value === 'schools') {
      await loadSchoolAnalytics();
    }
    
    // If on users tab, load user analytics
    if (activeTab.value === 'users') {
      await loadUserAnalytics();
    }
  } catch (err) {
    console.error('❌ Error refreshing data:', err)
  }
}

const loadSurveyAnalytics = async () => {
  if (!selectedSurveyId.value) return
  
  try {
    // Load survey details
    const surveyData = await surveyStore.fetchSurveyById(selectedSurveyId.value)
    if (surveyData) {
      selectedSurvey.value = surveyData
    }
    
    // Load analytics
    await analyticsStore.fetchSurveyAnalytics(selectedSurveyId.value)
  } catch (err) {
    console.error('❌ Error loading survey analytics:', err)
  }
}

// Get school name by ID
const getSchoolName = (schoolId) => {
  const school = schools.value.find(s => s.id === schoolId)
  return school?.name || `مدرسة #${schoolId}`
}

// Get status class
const getStatusClass = (statusId) => {
  if (statusId === 2) return 'status-active'
  if (statusId === 3) return 'status-completed'
  return 'status-draft'
}

// View school responses
const viewSchoolResponses = async (schoolId) => {
  selectedSchoolForResponses.value = schoolId
  showResponsesModal.value = true
  
  try {
    // Fetch responses for this specific school and survey using the correct endpoint
    const response = await import('@/api/index.js').then(module => 
      module.responseService.getSchoolResponse(selectedSurveyId.value, schoolId)
    )
    
    if (response && response.data) {
      // The response data structure matches what you provided
      schoolResponses.value[schoolId] = response.data.answers || []
    } else {
      schoolResponses.value[schoolId] = []
    }
  } catch (err) {
    console.error('❌ Error loading school responses:', err)
    schoolResponses.value[schoolId] = []
  }
}

// Enhanced schools analytics computed properties - Use only API data
const maxDirectorateCount = computed(() => {
  if (!schoolAnalyticsData.value?.directorates_distribution) return 0;
  const values = Object.values(schoolAnalyticsData.value.directorates_distribution);
  return values.length > 0 ? Math.max(...values) : 0;
});

// Fix for "Green Block" issue: Ensure Y-axis always has a reasonable minimum max value (e.g. 10)
const maxYAxisValue = computed(() => {
  if (!monthlyActivity.value || monthlyActivity.value.length === 0) return 10;
  const max = Math.max(...monthlyActivity.value.map(item => item.count));
  // If max is small (e.g. 3), use 10 as axis max so the bar is 30% height, not 100%
  return Math.max(max * 1.2, 10); 
});

const yAxisTicks = computed(() => {
  const max = maxYAxisValue.value;
  // Create 5 ticks: 0, 20%, 40%, 60%, 80%, 100% of max
  const ticks = [];
  for (let i = 0; i <= 5; i++) {
    ticks.push(Math.round((max / 5) * i));
  }
  return ticks.reverse(); // Standard Y-axis order (top to bottom)
});

const getBarColor = (type) => {
  // Use brand gradients instead of solid colors
  if (type === 'completed') return 'var(--primary-dark)'; // Dark Green
  if (type === 'active') return 'var(--primary-teal)'; // Teal
  return 'var(--primary-gold)'; // Gold for drafts/pending
};

const loadSchoolAnalytics = async () => {
  try {
    const data = await analyticsStore.fetchAllSchoolAnalytics();
    schoolAnalyticsData.value = data;
  } catch (err) {
    console.error('❌ Error loading school analytics:', err);
  }
};

// Enhanced schools analytics methods
const exportSchoolChart = (chartType) => {
  console.log(`Exporting school ${chartType} chart`);
};

const sortDirectorates = () => {
  // This will trigger recomputation of sortedDirectorates
  console.log('Sorting directorates by count');
};

// Removed duplicate truncateDirectorateName function - using the enhanced version below

const getDirectorateBarClass = (count, maxCount) => {
  const percentage = (count / maxCount) * 100;
  if (percentage >= 70) return 'high';
  if (percentage >= 40) return 'medium';
  return 'low';
};

const calculateRadialDashArray = (count, total) => {
  const percentage = (count / total) * 100;
  const strokeLength = (percentage / 100) * radialCircumference.value;
  const gapLength = radialCircumference.value - strokeLength;
  return `${strokeLength} ${gapLength}`;
};

const calculateRadialOffset = (activeCount, totalCount) => {
  const percentage = (activeCount / totalCount) * 100;
  return -(percentage / 100) * radialCircumference.value;
};

const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

const calculateParticipationRate = (active, total) => {
  if (total === 0) return 0;
  return Math.round((active / total) * 100);
};

const calculateAveragePerDirectorate = (totalSchools, directorates) => {
  const directorateCount = Object.keys(directorates || {}).length;
  if (directorateCount === 0) return 0;
  return Math.round(totalSchools / directorateCount);
};

const calculateClustersPerDirectorate = (clustersCount, directoratesCount) => {
  if (!directoratesCount || directoratesCount === 0) return 0;
  return Math.round(clustersCount / directoratesCount);
};

const calculateAverageSchoolsPerCluster = (totalSchools, clustersCount) => {
  if (!clustersCount || clustersCount === 0) return 0;
  return Math.round(totalSchools / clustersCount);
};

const sortByClusters = () => {
  console.log('Sorting by clusters');
  // Implementation would sort the clusters data
};

const calculateSizeFactor = (count) => {
  if (!schoolAnalyticsData.value?.total_schools) return 1;
  const percentage = (count / schoolAnalyticsData.value.total_schools) * 100;
  return Math.max(0.5, percentage / 20); // Scale factor between 0.5 and 5
};

const getDirectorateSizeClass = (count) => {
  if (!schoolAnalyticsData.value?.total_schools) return 'medium';
  const percentage = (count / schoolAnalyticsData.value.total_schools) * 100;
  if (percentage >= 15) return 'large';
  if (percentage >= 8) return 'medium';
  return 'small';
};

const calculateClusterBarWidth = (schoolsCount) => {
  const maxSchools = Math.max(...clustersData.value.map(c => c.schools), 1);
  return (schoolsCount / maxSchools) * 100;
};

const getClusterBarClass = (schoolsCount) => {
  if (schoolsCount >= 20) return 'high';
  if (schoolsCount >= 10) return 'medium';
  return 'low';
};

// Balanced visualization methods
const switchViewType = (type) => {
  viewType.value = type;
};

const highlightDirectorate = (index) => {
  highlightedDirectorate.value = index;
};

const unhighlightDirectorate = () => {
  highlightedDirectorate.value = null;
};

const getBalancedSizeClass = (count) => {
  if (count >= 20) return 'high';
  if (count >= 10) return 'medium';
  return 'low';
};

const calculateBalancedWidth = (count) => {
  // Use logarithmic scaling to handle large disparities
  const maxCount = Math.max(...Object.values(sortedDirectorates.value), 1);
  const logMax = Math.log(maxCount + 1);
  const logCurrent = Math.log(count + 1);
  return (logCurrent / logMax) * 100;
};

const truncateDirectorateName = (name, maxLength = 20) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
};

const calculateAverageSchoolsPerDirectorate = () => {
  const totalDirectorates = Object.keys(sortedDirectorates.value).length;
  if (totalDirectorates === 0) return 0;
  return Math.round(schoolAnalyticsData.value.total_schools / totalDirectorates);
};

const getTableProgressClass = (count) => {
  if (count >= 20) return 'high';
  if (count >= 10) return 'medium';
  return 'low';
};

const loadUserAnalytics = async () => {
  try {
    const data = await analyticsStore.fetchAllUserAnalytics();
    userAnalyticsData.value = data;
  } catch (err) {
    console.error('❌ Error loading user analytics:', err);
  }
}

// Helper methods
const calculateCompletionRate = (surveyId) => {
  const summary = surveySummary.value[surveyId]
  if (!summary) return 0
  
  const total = summary.total_schools || 1
  const responded = summary.responded_schools || 0
  return Math.round((responded / total) * 100)
}

const calculatePercentage = (part, whole) => {
  if (!whole || whole === 0) return 0;
  return Math.round((part / whole) * 100);
};

// Alternative version for roles distribution object
const calculatePercentageFromDistribution = (roleName, distribution) => {
  if (!distribution || Object.keys(distribution).length === 0) return 0;
  
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const roleCount = distribution[roleName] || 0;
  
  if (!total || total === 0) return 0;
  return Math.round((roleCount / total) * 100);
};

const isChoiceQuestion = (stats) => {
  return stats && typeof stats === 'object' && !stats.average && !stats.samples
}

const getQuestionType = (typeCode) => {
  const types = {
    'SINGLE_CHOICE': 'اختيار واحد',
    'MULTIPLE_CHOICE': 'اختيار متعدد',
    'NUMBER': 'رقم',
    'SHORT_TEXT': 'نص قصير',
    'LONG_TEXT': 'نص طويل',
    'DATE': 'تاريخ',
    'TIME': 'وقت',
    'DATE_RANGE': 'مدى زمني',
    'RATING': 'تقييم'
  }
  return types[typeCode] || typeCode
}

const getSubmitterName = (identifier) => {
  if (!identifier) return '-'
  
  // محاولة البحث عن المستخدم في القائمة المحملة لجلب الاسم الحقيقي
  if (users.value && users.value.length > 0) {
    // البحث عن طريق اسم المستخدم (username)
    const userByUsername = users.value.find(u => u.username === identifier)
    if (userByUsername) return userByUsername.name || userByUsername.username
    
    // البحث عن طريق المعرف (ID) في حال كان القيمة رقمية
    const userById = users.value.find(u => u.id == identifier)
    if (userById) return userById.name || userById.username
  }
  
  return identifier
}

// Helper method to get total from object values
const getTotalFromObject = (obj) => {
  if (!obj || typeof obj !== 'object') return 0
  return Object.values(obj).reduce((sum, val) => sum + (val || 0), 0)
}

const getActivityStatusClass = (status) => {
  if (status === 'نشط') return 'badge-active';
  if (status === 'مسودة') return 'badge-draft';
  return 'badge-closed';
}

// Helper method to clean text samples (remove quotes)
const cleanTextSample = (text) => {
  if (typeof text === 'string') {
    // Remove surrounding quotes
    return text.replace(/^["'](.*)["']$/, '$1')
  }
  return text
}

// Enhanced helper method to parse answer values from the backend
// Handles JSON strings, escaped strings, and different question types
const parseAnswerValue = (answerValue, questionType = null) => {
  if (!answerValue || answerValue === 'null' || answerValue === 'undefined') return '-'
  
  try {
    let parsedValue = answerValue
    
    // Handle string-encoded JSON (most common case for range questions)
    if (typeof answerValue === 'string') {
      // Try to parse as JSON first
      try {
        parsedValue = JSON.parse(answerValue)
      } catch (jsonError) {
        // If JSON parsing fails, check if it's an escaped string
        if (answerValue.startsWith('"') && answerValue.endsWith('"')) {
          // Remove surrounding quotes for escaped strings
          parsedValue = answerValue.slice(1, -1)
        } else {
          // Keep as plain string
          parsedValue = answerValue
        }
      }
    }
    
    // Handle different data types
    if (Array.isArray(parsedValue)) {
      // Handle array answers (multiple choice)
      return parsedValue.map(item => cleanTextSample(item)).join(', ')
    } 
    else if (parsedValue && typeof parsedValue === 'object') {
      // Handle object answers (date ranges, datetime ranges)
      return formatStructuredAnswer(parsedValue, questionType)
    }
    else if (typeof parsedValue === 'string') {
      // Handle string answers
      return cleanTextSample(parsedValue)
    }
    else {
      // Handle numbers and other primitives
      return String(parsedValue)
    }
  } catch (e) {
    console.warn('Error parsing answer value:', answerValue, e)
    // Fallback to original value with cleaning
    return cleanTextSample(String(answerValue))
  }
}

// Format structured answers based on question type
const formatStructuredAnswer = (answerObj, questionType) => {
  try {
    // Handle Date Range (type 8)
    if (questionType === 'DATE_RANGE' || questionType === 'مجال تاريخ' || questionType === 8) {
      if (answerObj.startDate && answerObj.endDate) {
        const startDate = formatDate(answerObj.startDate)
        const endDate = formatDate(answerObj.endDate)
        return `من: ${startDate} - إلى: ${endDate}`
      } else if (answerObj.startDate) {
        return `من: ${formatDate(answerObj.startDate)}`
      } else if (answerObj.endDate) {
        return `إلى: ${formatDate(answerObj.endDate)}`
      }
    }
    
    // Handle DateTime Range (type 9)
    else if (questionType === 'DATETIME_RANGE' || questionType === 'مجال تاريخ ووقت' || questionType === 9) {
      if (answerObj.startDate && answerObj.startTime && answerObj.endDate && answerObj.endTime) {
        const startDateTime = `${formatDate(answerObj.startDate)} ${answerObj.startTime}`
        const endDateTime = `${formatDate(answerObj.endDate)} ${answerObj.endTime}`
        return `من: ${startDateTime} - إلى: ${endDateTime}`
      } else if (answerObj.startDate && answerObj.startTime) {
        return `من: ${formatDate(answerObj.startDate)} ${answerObj.startTime}`
      } else if (answerObj.endDate && answerObj.endTime) {
        return `إلى: ${formatDate(answerObj.endDate)} ${answerObj.endTime}`
      }
    }
    
    // Handle other structured objects (fallback)
    return Object.entries(answerObj)
      .map(([key, value]) => `${key}: ${cleanTextSample(String(value))}`)
      .join(', ')
      
  } catch (e) {
    console.warn('Error formatting structured answer:', answerObj, e)
    return JSON.stringify(answerObj)
  }
}


// Enhanced schools analytics computed properties - Use only API data
const sortedDirectorates = computed(() => {
  // Only use real data from API, no static/fallback data
  if (!schoolAnalyticsData.value?.directorates_distribution) return {};
  
  const entries = Object.entries(schoolAnalyticsData.value.directorates_distribution);
  return Object.fromEntries(entries.sort(([,a], [,b]) => b - a));
});

const radialCircumference = computed(() => {
  return 2 * Math.PI * 50; // 2πr where r = 50
});

// Dynamic clusters data from API - No static fallback data
const clustersData = computed(() => {
  // Only use real API data, no static fallback
  if (schoolAnalyticsData.value?.complexes_distribution && Array.isArray(schoolAnalyticsData.value.complexes_distribution)) {
    // Transform API data format {name: string, count: number} to {name: string, schools: number}
    return schoolAnalyticsData.value.complexes_distribution
      .map(item => ({
        name: item.name || 'غير محدد',
        schools: Math.round(item.count || 0)
      }))
      .filter(item => item.schools >= 0); // Include items even with 0 schools for completeness if needed, or > 0 to hide empty
  }
  
  // Return empty array when no API data is available
  return [];
});

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('en-US')
}

const formatDateRelative = (dateString) => {
  if (!dateString) return 'غير محدد';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'الآن';
    if (diffHours < 24) return `قبل ${diffHours} ساعات`;
    if (diffDays < 7) return `قبل ${diffDays} أيام`;
    
    // For older dates, show formatted date
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'غير محدد';
  }
};

// Simple helper function for pie chart segment width calculation
const calculateSegmentWidth = (index) => {
  const total = surveysByType.value.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return 0;
  
  const percentage = (surveysByType.value[index]?.value || 0) / total * 100;
  return Math.max(percentage, 5); // Minimum 5% width for visibility
};

const getRoleColor = (role) => {
  const roleUpper = role.toUpperCase();
  const colors = {
    'ADMIN': '#0f766e',
    'SCHOOL_USER': '#f59e0b',
    'ANALYST': '#3b82f6',
    'ANALAYZER_USER': '#3b82f6', // Handle typo in backend
    'ANALYZER_USER': '#3b82f6'
  };
  return colors[roleUpper] || '#64748b';
};

const formatRoleName = (role) => {
  const roleMap = {
    'ADMIN': 'مدير',
    'SCHOOL_USER': 'مستخدم مدرسة',
    'ANALAYZER_USER': 'محلل',
    'ANALYZER_USER': 'محلل',
    'ANALYST': 'محلل'
  };
  
  const roleUpper = role.toUpperCase();
  if (roleMap[roleUpper]) {
    return roleMap[roleUpper];
  }
  
  // Fallback: replace underscores with spaces and capitalize
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    console.error('Error formatting date:', dateString, e)
    return 'Invalid Date'
  }
};

const getRoleRotation = (index) => {
  // Calculate the rotation for each segment based on previous segments
  let rotation = 0;
  for (let i = 0; i < index; i++) {
    const roleNames = Object.keys(userAnalyticsData.value?.roles_distribution || {});
    if (i < roleNames.length) {
      const role = roleNames[i];
      const percentage = calculatePercentageFromDistribution(role, userAnalyticsData.value?.roles_distribution || {});
      rotation += (percentage / 100) * 360;
    }
  }
  return rotation;
};

const getRoleClipPath = (index, distribution) => {
  // Calculate the angle for this specific segment
  let startAngle = 0;
  const roleNames = Object.keys(distribution || {});
  
  for (let i = 0; i < index; i++) {
    if (i < roleNames.length) {
      const role = roleNames[i];
      const percentage = calculatePercentageFromDistribution(role, distribution);
      startAngle += (percentage / 100) * 360;
    }
  }
  
  const currentRole = roleNames[index];
  const currentPercentage = calculatePercentageFromDistribution(currentRole, distribution);
  const endAngle = startAngle + (currentPercentage / 100) * 360;
  
  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate points
  const centerX = 50;
  const centerY = 50;
  const radius = 50;
  
  const x1 = centerX + radius * Math.sin(startRad);
  const y1 = centerY - radius * Math.cos(startRad);
  const x2 = centerX + radius * Math.sin(endRad);
  const y2 = centerY - radius * Math.cos(endRad);
  
  // Large arc flag (if the angle is greater than 180 degrees)
  const largeArcFlag = currentPercentage > 50 ? 1 : 0;
  
  return `path('M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z')`;
};

const getSegmentStyle = (index, distribution, role) => {
  // Calculate the angle for this specific segment
  let startAngle = 0;
  const roleNames = Object.keys(distribution || {});
  
  for (let i = 0; i < index; i++) {
    if (i < roleNames.length) {
      const prevRole = roleNames[i];
      const percentage = calculatePercentageFromDistribution(prevRole, distribution);
      startAngle += (percentage / 100) * 360;
    }
  }
  
  const currentPercentage = calculatePercentageFromDistribution(role, distribution);
  const endAngle = startAngle + (currentPercentage / 100) * 360;
  
  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate points
  const centerX = 50;
  const centerY = 50;
  const radius = 50;
  
  const x1 = centerX + radius * Math.sin(startRad);
  const y1 = centerY - radius * Math.cos(startRad);
  const x2 = centerX + radius * Math.sin(endRad);
  const y2 = centerY - radius * Math.cos(endRad);
  
  // Large arc flag (if the angle is greater than 180 degrees)
  const largeArcFlag = currentPercentage > 50 ? 1 : 0;
  
  return {
    'background': getRoleColor(role),
    'clip-path': `path('M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z')`
  };
};

const getPieSlicePath = (index, distribution) => {
  // Calculate the angle for this specific segment
  let startAngle = 0;
  const roleNames = Object.keys(distribution || {});
  
  for (let i = 0; i < index; i++) {
    if (i < roleNames.length) {
      const prevRole = roleNames[i];
      const percentage = calculatePercentageFromDistribution(prevRole, distribution);
      startAngle += (percentage / 100) * 360;
    }
  }
  
  const currentRole = roleNames[index];
  const currentPercentage = calculatePercentageFromDistribution(currentRole, distribution);
  const endAngle = startAngle + (currentPercentage / 100) * 360;
  
  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate points
  const centerX = 50;
  const centerY = 50;
  const radius = 45;
  
  const x1 = centerX + radius * Math.sin(startRad);
  const y1 = centerY - radius * Math.cos(startRad);
  const x2 = centerX + radius * Math.sin(endRad);
  const y2 = centerY - radius * Math.cos(endRad);
  
  // Large arc flag (if the angle is greater than 180 degrees)
  const largeArcFlag = currentPercentage > 50 ? 1 : 0;
  
  // Create SVG path
  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

// Lifecycle
onMounted(async () => {
  // Load initial data
  await refreshData();
  
  // If there are surveys, set the first one as selected by default
  if (surveys.value && surveys.value.length > 0 && !selectedSurveyId.value) {
    selectedSurveyId.value = surveys.value[0].id;
    await loadSurveyAnalytics();
  }
})
</script>

<style scoped>
  @import "../../assets/analytics.css";
  @import "../../assets/tables.css";
</style>
