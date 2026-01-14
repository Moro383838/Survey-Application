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

    <!-- Overview Dashboard -->
    <div v-else-if="activeTab === 'overview'" class="overview-dashboard animate-fade-in">
      <!-- Key Metrics Cards -->
      <div class="metrics-grid">
        <div 
          v-for="(metric, index) in keyMetrics" 
          :key="metric.key"
          class="metric-card animate-slide-up"
          :class="[`delay-${index}`, metric.trend > 0 ? 'positive' : 'negative']"
        >
          <div class="card-header">
            <div class="metric-icon" :class="metric.color">
              <component :is="metric.icon" />
            </div>
            <div class="trend-indicator" v-if="metric.trend !== 0" :class="{ up: metric.trend > 0, down: metric.trend < 0 }">
              <svg v-if="metric.trend > 0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                <polyline points="16 17 22 17 22 11"></polyline>
              </svg>
              <span>{{ Math.abs(metric.trend) }}%</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="metric-value">{{ formatNumber(metric.value) }}</h3>
            <p class="metric-label">{{ metric.label }}</p>
          </div>
          <div class="progress-bar" v-if="metric.target > 0">
            <div 
              class="progress-fill" 
              :style="{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }"
              :class="metric.color"
            ></div>
          </div>
        </div>
      </div>

      <!-- Charts Section - Redesigned with Modern Professional Charts -->
      <div class="charts-section">
        <!-- Monthly Activity Chart - Enhanced Bar Chart -->
        <div class="chart-container animate-slide-up delay-3">
          <div class="chart-header">
            <h3 class="chart-title">نشاط الاستبيانات الشهرية</h3>
            <div class="chart-actions">
              <button class="chart-action-btn" @click="toggleChartView('monthly')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3v18h18"></path>
                  <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="enhanced-bar-chart">
            <div class="chart-y-axis">
              <div 
                v-for="tick in yAxisTicks" 
                :key="tick" 
                class="y-axis-tick"
              >
                <span class="tick-label">{{ tick }}</span>
                <div class="tick-line"></div>
              </div>
            </div>
            <div class="bars-container">
              <div 
                v-for="(item, index) in monthlyActivity" 
                :key="index"
                class="enhanced-bar-item"
                @mouseenter="highlightBar(index)"
                @mouseleave="unhighlightBar()"
              >
                <div class="bar-tooltip" v-if="hoveredBar === index">
                  <div class="tooltip-content">
                    <strong>{{ item.month }}</strong>
                    <div class="tooltip-value">{{ item.count }} استبيان</div>
                    <div class="tooltip-type" :class="item.type">
                      {{ getSurveyStatusText(item.type) }}
                    </div>
                  </div>
                </div>
                <div 
                  class="enhanced-bar" 
                  :style="{ 
                    height: `${(item.count / maxYAxisValue) * 100}%`,
                    '--bar-color': getBarColor(item.type)
                  }"
                  :class="[
                    item.type === 'completed' ? 'completed' : 
                    item.type === 'active' ? 'active' : 'pending',
                    { 'highlighted': hoveredBar === index }
                  ]"
                >
                  <div class="bar-value-label">{{ item.count }}</div>
                </div>
                <span class="enhanced-bar-label">{{ item.month }}</span>
              </div>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color completed"></div>
              <span>مكتمل</span>
            </div>
            <div class="legend-item">
              <div class="legend-color active"></div>
              <span>نشط</span>
            </div>
            <div class="legend-item">
              <div class="legend-color pending"></div>
              <span>معلق</span>
            </div>
          </div>
        </div>
        
        <!-- Surveys Distribution Chart - Enhanced Donut Chart -->
        <div class="chart-container animate-slide-up delay-4">
          <div class="chart-header">
            <h3 class="chart-title">توزيع الاستبيانات حسب النوع</h3>
            <div class="chart-actions">
              <button class="chart-action-btn" @click="exportChart('distribution')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="enhanced-donut-chart" v-if="surveysByType.length > 0">
            <div class="donut-container">
              <svg class="donut-svg" viewBox="0 0 100 100">
                <!-- Background circle -->
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="16" />
                <!-- Data segments -->
                <circle 
                  v-for="(item, index) in surveysByType" 
                  :key="index"
                  cx="50" 
                  cy="50" 
                  r="40"
                  fill="none"
                  :stroke="item.color"
                  stroke-width="16"
                  :stroke-dasharray="calculateStrokeDashArray(index)"
                  :stroke-dashoffset="calculateStrokeDashOffset(index)"
                  class="donut-segment"
                  @mouseenter="highlightSegment(index)"
                  @mouseleave="unhighlightSegment()"
                />
              </svg>
              <div class="donut-center">
                <div class="center-value">{{ totalSurveys }}</div>
                <div class="center-label">إجمالي</div>
              </div>
            </div>
            <div class="donut-data">
              <div 
                v-for="(item, index) in surveysByType" 
                :key="index"
                class="data-item"
                :class="{ 'highlighted': highlightedSegment === index }"
                @mouseenter="highlightSegment(index)"
                @mouseleave="unhighlightSegment()"
              >
                <div class="data-color" :style="{ backgroundColor: item.color }"></div>
                <div class="data-content">
                  <div class="data-label">{{ item.name }}</div>
                  <div class="data-value">{{ item.value }}</div>
                  <div class="data-percentage">{{ calculatePercentage(item.value, totalSurveys) }}%</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="chart-empty-state">
            <div class="empty-icon">📊</div>
            <h4>لا توجد بيانات متاحة</h4>
            <p>لم يتم العثور على استبيانات لعرض التوزيع</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity animate-slide-up delay-5">
        <h3 class="section-title">النشاط الأخير</h3>
        <div class="activity-list">
          <div 
            v-for="(activity, index) in recentActivities" 
            :key="index"
            class="activity-item animate-fade-in"
            :class="`delay-${index % 3}`"
          >
            <div class="activity-icon" :class="activity.type">
              <component :is="activity.icon" />
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
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
              <div class="card-value">{{ schoolAnalyticsData.total_directorates }}</div>
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
              <div class="card-value">{{ schoolAnalyticsData.total_complexes }}</div>
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
              <div class="card-value">{{ schoolAnalyticsData.empty_schools_count }}</div>
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
                  :class="{ active: viewType === 'grid' }"
                  @click="switchViewType('grid')"
                  title="عرض الشبكة"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
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
                <button class="chart-action-btn" @click="exportSchoolChart('directorates')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
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
                    <span class="stat-number">{{ schoolAnalyticsData.total_schools }}</span>
                    <span class="stat-label">مدرسة</span>
                  </div>
                </div>
                <div class="scale-info">
                  <span class="scale-label">المقياس:</span>
                  <div class="scale-indicators">
                    <div class="scale-item high">
                      <div class="scale-box"></div>
                      <span>أكثر من 20 مدرسة</span>
                    </div>
                    <div class="scale-item medium">
                      <div class="scale-box"></div>
                      <span>10-20 مدرسة</span>
                    </div>
                    <div class="scale-item low">
                      <div class="scale-box"></div>
                      <span>أقل من 10 مدارس</span>
                    </div>
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
                  <span v-if="school.submitted_by" class="submitted-by">بواسطة: {{ school.submitted_by }}</span>
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
          <div class="target-schools-table-wrapper">
            <table class="target-schools-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>اسم المدرسة</th>
                  <th>حالة الإجابة</th>
                  <th>تاريخ الإجابة</th>
                  <th>تم الإرسال بواسطة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(targetSchool, index) in targetSchoolsWithUsers" :key="targetSchool.school_id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ targetSchool.school_name }}</td>
                  <td>
                    <span class="response-status" :class="targetSchool.has_responded ? 'responded' : 'not-responded'">
                      {{ targetSchool.has_responded ? 'أجابت' : 'لم تجب' }}
                    </span>
                  </td>
                  <td>{{ targetSchool.has_responded ? formatDate(targetSchool.responded_at) : '-' }}</td>
                  <td>{{ targetSchool.submitted_by || '-' }}</td>
                  <td>
                    <button 
                      v-if="targetSchool.has_responded"
                      class="btn-view-responses"
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

        <!-- Detailed Analysis -->
        <div class="detailed-analysis animate-slide-up delay-2">
          <h2 class="section-title">التحليل التفصيلي</h2>
          <div class="questions-analysis">
            <div 
              v-for="(questionAnalysis, index) in surveyAnalysis[selectedSurveyId]" 
              :key="index"
              class="question-card animate-fade-in"
              :class="`delay-${index % 4}`"
            >
              <div class="question-header">
                <h3 class="question-title">{{ questionAnalysis.text }}</h3>
                <span class="question-type">{{ getQuestionType(questionAnalysis.type) }}</span>
              </div>
              
              <!-- Choice-based Questions (Single/Multiple Choice) -->
              <div v-if="questionAnalysis.stats && typeof questionAnalysis.stats === 'object' && !Array.isArray(questionAnalysis.stats) && (questionAnalysis.type_code === 'SINGLE_CHOICE' || questionAnalysis.type_code === 'MULTIPLE_CHOICE')" class="choices-analysis">
                <div class="choices-grid">
                  <div 
                    v-for="(count, choice, choiceIndex) in questionAnalysis.stats" 
                    :key="choice"
                    class="choice-bar-container animate-slide-up"
                    :class="`delay-${choiceIndex % 3}`"
                  >
                    <div class="choice-info">
                      <span class="choice-label">{{ choice }}</span>
                      <span class="choice-percentage">{{ calculatePercentage(count, getTotalFromObject(questionAnalysis.stats)) }}%</span>
                    </div>
                    <div class="choice-progress">
                      <div 
                        class="progress-bar-fill" 
                        :style="{ width: calculatePercentage(count, getTotalFromObject(questionAnalysis.stats)) + '%' }"
                      ></div>
                    </div>
                    <div class="choice-count">{{ count }} إجابة</div>
                  </div>
                </div>
              </div>

              <!-- Numeric Questions -->
              <div v-else-if="questionAnalysis.stats && typeof questionAnalysis.stats === 'object' && questionAnalysis.stats.average !== undefined && questionAnalysis.type_code === 'NUMBER'" class="numeric-analysis">
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">المتوسط</span>
                    <span class="stat-value">{{ questionAnalysis.stats.average !== null ? questionAnalysis.stats.average.toFixed(2) : '-' }}</span>
                  </div>
                  <div class="stat-item" v-if="questionAnalysis.stats.max !== undefined && questionAnalysis.stats.max !== null">
                    <span class="stat-label">أعلى قيمة</span>
                    <span class="stat-value">{{ questionAnalysis.stats.max }}</span>
                  </div>
                  <div class="stat-item" v-if="questionAnalysis.stats.min !== undefined && questionAnalysis.stats.min !== null">
                    <span class="stat-label">أقل قيمة</span>
                    <span class="stat-value">{{ questionAnalysis.stats.min }}</span>
                  </div>
                  <div class="stat-item" v-if="questionAnalysis.stats.median !== undefined && questionAnalysis.stats.median !== null">
                    <span class="stat-label">الوسيط</span>
                    <span class="stat-value">{{ questionAnalysis.stats.median }}</span>
                  </div>
                </div>
              </div>

              <!-- Text-based Questions (Short/Long Text) -->
              <div v-else-if="questionAnalysis.stats && Array.isArray(questionAnalysis.stats) && (questionAnalysis.type_code === 'SHORT_TEXT' || questionAnalysis.type_code === 'LONG_TEXT')" class="text-analysis">
                <h4>أمثلة على الإجابات:</h4>
                <div class="samples-grid">
                  <div 
                    v-for="(sample, idx) in questionAnalysis.stats.slice(0, 3)" 
                    :key="idx"
                    class="sample-item"
                  >
                    <p>{{ cleanTextSample(sample) }}</p>
                  </div>
                </div>
              </div>

              <!-- Default Fallback -->
              <div v-else class="default-analysis">
                <p>لا توجد بيانات تحليلية متاحة لهذا السؤال.</p>
              </div>
            </div>
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
      <div class="responses-modal">
        <div class="modal-header">
          <h3>إجابات {{ getSchoolName(selectedSchoolForResponses) }}</h3>
          <button class="close-btn" @click="showResponsesModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="schoolResponses[selectedSchoolForResponses] && schoolResponses[selectedSchoolForResponses].length > 0" class="responses-list">
            <div 
              v-for="(response, index) in schoolResponses[selectedSchoolForResponses]" 
              :key="index"
              class="response-item"
            >
              <div class="response-question">
                <h4>{{ response.question_text || `سؤال ${index + 1}` }}</h4>
                <span class="question-type-tag">{{ response.type || 'غير محدد' }}</span>
              </div>
              <div class="response-answer">
                <p>{{ parseAnswerValue(response.answer_value, response.type) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-responses">
            <p>لا توجد إجابات متاحة لهذه المدرسة</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-close-modal" @click="showResponsesModal = false">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics.js'
import { useSurveyStore } from '@/stores/surveys.js'
import { useSchoolsStore } from '@/stores/schools.js'
import { useUsersStore } from '@/stores/users.js'

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
  if (!globalStats.value) return [];
  
  // Only use real data from API, no fallback values
  return [
    {
      key: 'surveys',
      label: 'إجمالي الاستبيانات',
      value: globalStats.value.total_surveys,
      target: 0, // Will be calculated dynamically
      trend: 0, // Will be calculated dynamically
      color: 'primary',
      icon: SurveyIcon
    },
    {
      key: 'responses',
      label: 'إجمالي الإجابات',
      value: globalStats.value.total_responses,
      target: 0,
      trend: 0,
      color: 'success',
      icon: ResponseIcon
    },
    {
      key: 'schools',
      label: 'إجمالي المدارس',
      value: globalStats.value.total_schools,
      target: 0,
      trend: 0,
      color: 'warning',
      icon: SchoolIcon
    },
    {
      key: 'users',
      label: 'إجمالي المستخدمين',
      value: globalStats.value.total_users,
      target: 0,
      trend: 0,
      color: 'info',
      icon: UserIcon
    }
  ].filter(metric => metric.value !== undefined && metric.value !== null);
});

const monthlyActivity = computed(() => {
  // Use real data from global analytics if available
  if (globalStats.value?.charts?.monthly_activity) {
    return globalStats.value.charts.monthly_activity.map(item => ({
      month: item.month?.trim() || '',
      count: item.count || 0,
      type: 'completed' // Default type since API doesn't specify
    }));
  }
  
  return [];
});

const maxMonthlyCount = computed(() => {
  // Only use real data from API, no fallback values
  if (monthlyActivity.value && monthlyActivity.value.length > 0) {
    return Math.max(...monthlyActivity.value.map(item => item.count));
  }
  return 0; // No data available
});

// Enhanced chart computed properties
const maxYAxisValue = computed(() => {
  const maxValue = maxMonthlyCount.value;
  // Round up to nearest 10 for better scaling
  return Math.ceil(maxValue / 10) * 10;
});

const yAxisTicks = computed(() => {
  const maxVal = maxYAxisValue.value;
  const ticks = [];
  for (let i = 0; i <= maxVal; i += Math.ceil(maxVal / 5)) {
    ticks.push(i);
  }
  return ticks.reverse(); // Reverse for RTL layout
});

const totalSurveys = computed(() => {
  return surveysByType.value.reduce((sum, item) => sum + item.value, 0);
});

const donutCircumference = computed(() => {
  return 2 * Math.PI * 40; // 2πr where r = 40
});

const totalResponses = computed(() => {
  return globalStats.value?.total_responses || 0;
});

const surveysByType = computed(() => {
  // Only use real data from API, no static fallback data
  if (globalStats.value?.surveys_by_type) {
    const typeData = globalStats.value.surveys_by_type;
    return [
      { name: 'دوري', value: typeData.periodic || 0, color: '#4CAF50' },
      { name: 'عادي', value: typeData.regular || 0, color: '#2196F3' }
    ].filter(item => item.value > 0); // Only show types that have actual data
  }
  
  // Return empty array when no API data is available
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

const getBarColor = (type) => {
  const colors = {
    completed: '#10b981',
    active: '#3b82f6',
    pending: '#f59e0b'
  };
  return colors[type] || '#64748b';
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
  // TODO: Implement actual export functionality
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

// Helper method to get total from object values
const getTotalFromObject = (obj) => {
  if (!obj || typeof obj !== 'object') return 0
  return Object.values(obj).reduce((sum, val) => sum + (val || 0), 0)
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

const maxDirectorateCount = computed(() => {
  // Use only API data, no fallback values
  if (!schoolAnalyticsData.value?.directorates_distribution) return 0;
  const values = Object.values(schoolAnalyticsData.value.directorates_distribution);
  return values.length > 0 ? Math.max(...values) : 0;
});

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
  if (schoolAnalyticsData.value?.complexes_distribution && schoolAnalyticsData.value.complexes_distribution.length > 0) {
    // Transform API data format {name: "cluster name", count: number} to {name: string, schools: number}
    return schoolAnalyticsData.value.complexes_distribution
      .map(item => ({
        name: item.name || 'غير محدد',
        schools: Math.round(item.count || 0)
      }))
      .filter(item => item.schools > 0); // Only show items with actual data
  }
  
  // Return empty array when no API data is available
  return [];
});

const formatNumber = (num) => {
  return num.toLocaleString('ar-SA')
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
    return date.toLocaleDateString('ar-SA', {
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
    
    return date.toLocaleDateString('ar-EG', {
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
/* Root Variables */
.analytics-dashboard {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  direction: rtl;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes scaleHover {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-scale-hover {
  transition: transform 0.3s ease;
}

.animate-scale-hover:hover {
  animation: scaleHover 0.3s ease forwards;
}

.animate-bounce {
  animation: bounce 1s ease infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Delay classes */
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }

/* Dashboard Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #002623 0%, #001a18 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 38, 35, 0.3);
  border: 2px solid #b9a779;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.icon-wrapper svg {
  color: white;
}

.header-text h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
  font-weight: 400;
}

.header-actions .btn-refresh {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.header-actions .btn-refresh:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.header-actions .btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tabs */
.dashboard-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 16px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn:hover {
  color: #b9a779;
  background: rgba(185, 167, 121, 0.1);
}

.tab-btn.active {
  background: linear-gradient(135deg, #b9a779, #d4af37);
  color: #002623;
  box-shadow: 0 4px 12px rgba(185, 167, 121, 0.3);
  font-weight: 700;
}

.tab-btn svg {
  transition: transform 0.3s ease;
}

.tab-btn:hover svg {
  transform: scale(1.1);
}

/* Overview Dashboard */
.overview-dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #0f766e, #14b8a6);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.metric-icon.primary { background: rgba(15, 118, 110, 0.1); color: #0f766e; }
.metric-icon.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.metric-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.metric-icon.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.trend-indicator.up {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.trend-indicator.down {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.card-body {
  margin-bottom: 16px;
}

.metric-value {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #1e293b;
  letter-spacing: -1px;
}

.metric-label {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease;
}

.progress-fill.primary { background: linear-gradient(90deg, #0f766e, #14b8a6); }
.progress-fill.success { background: linear-gradient(90deg, #10b981, #34d399); }
.progress-fill.warning { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.progress-fill.info { background: linear-gradient(90deg, #3b82f6, #60a5fa); }

/* Charts Section - Enhanced Professional Design */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.chart-container {
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.chart-title {
  margin: 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.chart-action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f766e;
  transform: translateY(-1px);
}

/* Enhanced Bar Chart Styles */
.enhanced-bar-chart {
  display: flex;
  padding: 24px;
  position: relative;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40px;
  margin-left: 16px;
  position: relative;
}

.y-axis-tick {
  display: flex;
  align-items: center;
  position: relative;
}

.tick-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  min-width: 30px;
  text-align: left;
}

.tick-line {
  position: absolute;
  right: -16px;
  top: 50%;
  width: 100vw;
  height: 1px;
  background: #f1f5f9;
  z-index: 1;
}

.bars-container {
  flex: 1;
  display: flex;
  align-items: end;
  gap: 20px;
  height: 240px;
  position: relative;
}

.enhanced-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
}

.bar-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  background: #1e293b;
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 100;
  min-width: 140px;
  text-align: center;
  animation: tooltipFadeIn 0.2s ease;
}

.bar-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 50%;
  transform: translateX(50%);
  border: 6px solid transparent;
  border-top-color: #1e293b;
}

.tooltip-content strong {
  display: block;
  margin-bottom: 4px;
  font-size: 15px;
}

.tooltip-value {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-type {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.tooltip-type.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.tooltip-type.active {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.tooltip-type.pending {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.enhanced-bar {
  width: 100%;
  border-radius: 8px 8px 0 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 4px;
  position: relative;
  background: linear-gradient(to top, var(--bar-color), var(--bar-color-light, var(--bar-color)));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.enhanced-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent);
  border-radius: 8px 8px 0 0;
}

.enhanced-bar.highlighted {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.enhanced-bar.completed { --bar-color: #10b981; --bar-color-light: #34d399; }
.enhanced-bar.active { --bar-color: #3b82f6; --bar-color-light: #60a5fa; }
.enhanced-bar.pending { --bar-color: #f59e0b; --bar-color-light: #fbbf24; }

.bar-value-label {
  position: absolute;
  top: -25px;
  right: 50%;
  transform: translateX(50%);
  background: #1e293b;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.enhanced-bar:hover .bar-value-label {
  opacity: 1;
}

.enhanced-bar-label {
  margin-top: 12px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  width: 100%;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f1f5f9;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.legend-color.completed { background: #10b981; }
.legend-color.active { background: #3b82f6; }
.legend-color.pending { background: #f59e0b; }

/* Enhanced Donut Chart Styles */
.enhanced-donut-chart {
  display: flex;
  padding: 24px;
  gap: 24px;
}

.donut-container {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-segment {
  transition: all 0.4s ease;
  cursor: pointer;
}

.donut-segment:hover {
  stroke-width: 18;
  filter: brightness(1.1);
}

.donut-center {
  position: absolute;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  text-align: center;
  z-index: 2;
}

.center-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 4px;
}

.center-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.donut-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.data-item:hover, .data-item.highlighted {
  background: #f8fafc;
  transform: translateX(-5px);
}

.data-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.data-content {
  flex: 1;
}

.data-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.data-value {
  font-size: 18px;
  font-weight: 700;
  color: #0f766e;
}

.data-percentage {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* Chart Empty States */
.chart-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.chart-empty-state .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.chart-empty-state h4 {
  color: #64748b;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.chart-empty-state p {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  align-items: end;
  gap: 16px;
  height: 200px;
  padding: 20px 0;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
}

.bar {
  width: 100%;
  border-radius: 8px 8px 0 0;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 4px;
}

.bar.success { background: linear-gradient(to top, #10b981, #34d399); }
.bar.warning { background: linear-gradient(to top, #f59e0b, #fbbf24); }
.bar.info { background: linear-gradient(to top, #3b82f6, #60a5fa); }

.bar-label {
  margin-top: 12px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.bar-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 4px;
}

/* Pie Chart Placeholder */
.pie-chart-placeholder {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%);
}

.segment-1 { background: #0f766e; transform: rotate(0deg); }
.segment-2 { background: #10b981; transform: rotate(120deg); }
.segment-3 { background: #3b82f6; transform: rotate(240deg); }

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.total-responses {
  font-size: 28px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 4px;
}

.total-label {
  font-size: 12px;
  color: #64748b;
  text-align: center;
}

/* Recent Activity */
.recent-activity {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.section-title {
  margin: 0 0 24px 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f1f5f9;
  transform: translateX(-4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.survey { background: rgba(15, 118, 110, 0.1); color: #0f766e; }
.activity-icon.school { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.activity-icon.user { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.activity-icon.completed { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.5;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #0f766e;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

.error-icon {
  font-size: 72px;
  margin-bottom: 24px;
}

.btn-retry {
  margin-top: 24px;
  padding: 12px 24px;
  background: #0f766e;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #0d9488;
  transform: translateY(-2px);
}

/* Coming Soon Sections */
.coming-soon {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.soon-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.coming-soon h2 {
  color: #1e293b;
  font-size: 32px;
  margin-bottom: 16px;
}

.coming-soon p {
  color: #64748b;
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.features-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  color: #0f766e;
  margin: 0 0 12px 0;
  font-size: 20px;
}

.feature-card p {
  color: #64748b;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

/* Survey Analytics Styles */
.survey-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.survey-selector label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
}

.modern-select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
}

.modern-select:focus {
  outline: none;
  border-color: #0f766e;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.1);
}

.filter-controls {
  display: flex;
  gap: 16px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.summary-section {
  margin-bottom: 32px;
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.summary-card.primary { border-top: 4px solid #0f766e; }
.summary-card.success { border-top: 4px solid #10b981; }
.summary-card.warning { border-top: 4px solid #f59e0b; }

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
}

.summary-card.success .card-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.summary-card.warning .card-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.card-content h3 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
}

.card-content p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
}

.detailed-analysis {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.questions-analysis {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.question-card {
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.question-card:hover {
  background: #f1f5f9;
  transform: translateX(-5px);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.question-title {
  margin: 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  flex: 1;
}

.question-type {
  background: #0f766e;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.choices-grid {
  display: grid;
  gap: 16px;
}

.choice-bar-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.choice-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.choice-label {
  font-weight: 600;
  color: #1e293b;
}

.choice-percentage {
  font-weight: 700;
  color: #0f766e;
}

.choice-progress {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0f766e, #14b8a6);
  border-radius: 6px;
  transition: width 1s ease;
}

.choice-count {
  text-align: left;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.numeric-analysis {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.stat-label {
  display: block;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #0f766e;
}

.text-analysis {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.text-analysis h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 18px;
}

.samples-grid {
  display: grid;
  gap: 12px;
}

.sample-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border-right: 4px solid #0f766e;
}

.sample-item p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.default-analysis {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.default-analysis pre {
  margin: 0;
  padding: 16px;
  background: #1e293b;
  color: #f8fafc;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 24px;
}

.empty-state h3 {
  color: #1e293b;
  font-size: 24px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #64748b;
  font-size: 16px;
  max-width: 500px;
  margin: 0 auto;
}

/* Survey Info Section */
.survey-info-section {
  margin-bottom: 2rem;
}

.survey-info-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.survey-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
}

.info-item span {
  color: #1e293b;
  font-size: 16px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.status-draft {
  background: #fef3c7;
  color: #92400e;
}

/* Schools Status Section */
.schools-status-section {
  margin-bottom: 2rem;
}

.schools-status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.status-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.status-card.responded {
  border-right: 4px solid #10b981;
}

.status-card.not-responded {
  border-right: 4px solid #f59e0b;
}

.status-icon {
  font-size: 48px;
}

.status-content h3 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
}

.status-content p {
  margin: 0.5rem 0 0 0;
  color: #64748b;
  font-size: 16px;
}

.schools-lists {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.schools-list-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.schools-list-card h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 18px;
}

.schools-list {
  max-height: 400px;
  overflow-y: auto;
}

.school-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.school-item:last-child {
  border-bottom: none;
}

.school-item.responded {
  background: #f0fdf4;
}

.school-item.not-responded {
  background: #fffbeb;
}

.school-name {
  font-weight: 600;
  color: #1e293b;
}

.response-date {
  font-size: 14px;
  color: #64748b;
}

.empty-list {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}

/* Target Schools Table */
.target-schools-section {
  margin-bottom: 2rem;
}

.target-schools-table-wrapper {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.target-schools-table {
  width: 100%;
  border-collapse: collapse;
}

.target-schools-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: right;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
}

.target-schools-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.target-schools-table tr:hover td {
  background: #f8fafc;
}

.response-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.response-status.responded {
  background: #d1fae5;
  color: #065f46;
}

.response-status.not-responded {
  background: #fee2e2;
  color: #991b1b;
}

.btn-view-responses {
  background: #0f766e;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-responses:hover {
  background: #0d9488;
  transform: translateY(-2px);
}

.no-responses {
  color: #94a3b8;
}

.empty-table {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

/* Responses Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.responses-modal {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #1e293b;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.responses-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.response-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border-right: 4px solid #0f766e;
}

.response-question h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 16px;
}

.response-answer {
  margin-bottom: 1rem;
}

.response-answer p {
  margin: 0;
  color: #334155;
  line-height: 1.6;
}

.answer-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.answer-tag {
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.response-meta {
  display: flex;
  justify-content: flex-end;
}

.response-date {
  font-size: 13px;
  color: #64748b;
}

.empty-responses {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  background: #0f766e;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #0d9488;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .survey-controls {
    flex-direction: column;
    gap: 20px;
  }
  
  .filter-controls {
    width: 100%;
    justify-content: center;
  }
  
  .summary-metrics {
    grid-template-columns: 1fr;
  }
  
  .question-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .features-preview {
    grid-template-columns: 1fr;
  }

  .survey-info-grid {
    grid-template-columns: 1fr;
  }

  .schools-status-grid {
    grid-template-columns: 1fr;
  }

  .schools-lists {
    grid-template-columns: 1fr;
  }

  .target-schools-table-wrapper {
    overflow-x: auto;
  }

  .target-schools-table {
    min-width: 800px;
  }

  .responses-modal {
    max-width: 95%;
    margin: 1rem;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .legend {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}

/* Enhanced Overview Cards - Professional Design */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.overview-cards.enhanced-overview {
  gap: 28px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--card-accent, #0f766e), var(--card-accent-light, #14b8a6));
}

.overview-card.primary { --card-accent: #0f766e; --card-accent-light: #14b8a6; }
.overview-card.success { --card-accent: #10b981; --card-accent-light: #34d399; }
.overview-card.warning { --card-accent: #f59e0b; --card-accent-light: #fbbf24; }
.overview-card.info { --card-accent: #3b82f6; --card-accent-light: #60a5fa; }
.overview-card.danger { --card-accent: #ef4444; --card-accent-light: #f87171; }

/* Enhanced Card Styles */
.overview-card.enhanced-card {
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 28px;
}

.card-icon.enhanced-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--icon-bg, rgba(15, 118, 110, 0.1)), var(--icon-bg-light, rgba(15, 118, 110, 0.05)));
  color: var(--icon-color, #0f766e);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.overview-card.success .card-icon.enhanced-icon {
  --icon-bg: rgba(16, 185, 129, 0.1);
  --icon-bg-light: rgba(16, 185, 129, 0.05);
  --icon-color: #10b981;
}

.overview-card.warning .card-icon.enhanced-icon {
  --icon-bg: rgba(245, 158, 11, 0.1);
  --icon-bg-light: rgba(245, 158, 11, 0.05);
  --icon-color: #f59e0b;
}

.overview-card.info .card-icon.enhanced-icon {
  --icon-bg: rgba(59, 130, 246, 0.1);
  --icon-bg-light: rgba(59, 130, 246, 0.05);
  --icon-color: #3b82f6;
}

.overview-card.danger .card-icon.enhanced-icon {
  --icon-bg: rgba(239, 68, 68, 0.1);
  --icon-bg-light: rgba(239, 68, 68, 0.05);
  --icon-color: #ef4444;
}

.card-content.enhanced-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.card-value {
  font-size: 36px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.card-label {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 4px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}

.card-trend.positive {
  color: #10b981;
}

.card-trend.negative {
  color: #f59e0b;
}

.card-trend.neutral {
  color: #64748b;
  font-weight: 500;
}

/* Enhanced Charts Section */
.charts-section.enhanced-charts {
  gap: 28px;
}

.chart-container.enhanced-container {
  padding: 0;
}

/* Enhanced Radial Chart */
.enhanced-radial-chart {
  display: flex;
  padding: 24px;
  gap: 24px;
}

.radial-container {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.radial-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.radial-segment {
  transition: all 0.4s ease;
}

.radial-segment:hover {
  stroke-width: 14;
  filter: brightness(1.1);
}

.radial-center {
  position: absolute;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  text-align: center;
  z-index: 2;
}

.center-main-value {
  font-size: 32px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 4px;
  line-height: 1;
}

.center-main-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 2px;
}

.center-sub-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.radial-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.radial-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.radial-item:hover {
  background: #f8fafc;
  transform: translateX(-5px);
}

.radial-item.active {
  border-right: 3px solid #10b981;
}

.radial-item.inactive {
  border-right: 3px solid #f59e0b;
}

.radial-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: var(--radial-color, #64748b);
}

.radial-item.active .radial-color {
  --radial-color: #10b981;
}

.radial-item.inactive .radial-color {
  --radial-color: #f59e0b;
}

.radial-content {
  flex: 1;
}

.radial-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.radial-value {
  font-size: 20px;
  font-weight: 700;
  color: #0f766e;
}

.radial-percentage {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* Balanced Directorates Visualization */
.balanced-directorates-view {
  padding: 24px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stats-summary {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #0f766e;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.scale-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scale-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.scale-indicators {
  display: flex;
  gap: 12px;
}

.scale-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.scale-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.scale-item.high .scale-box { background: #10b981; }
.scale-item.medium .scale-box { background: #3b82f6; }
.scale-item.low .scale-box { background: #f59e0b; }

.balanced-directorates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.balanced-directorate-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.balanced-directorate-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #0f766e;
}

.balanced-directorate-item.high {
  border-left: 4px solid #10b981;
}

.balanced-directorate-item.medium {
  border-left: 4px solid #3b82f6;
}

.balanced-directorate-item.low {
  border-left: 4px solid #f59e0b;
}

.directorate-rank {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #0f766e;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.directorate-name-balanced {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 8px 0 12px 0;
  line-height: 1.4;
  min-height: 42px;
  display: flex;
  align-items: center;
}

.directorate-stats-balanced {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.school-count-display {
  font-size: 20px;
  font-weight: 800;
  color: #0f766e;
}

.percentage-display {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.progress-bar-container {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill-balanced {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

.progress-fill-balanced.high { background: linear-gradient(90deg, #10b981, #34d399); }
.progress-fill-balanced.medium { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.progress-fill-balanced.low { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

/* Detailed Directorates Table View */
.detailed-directorates-view {
  padding: 24px;
}

.list-header {
  margin-bottom: 24px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.summary-card-alt {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e2e8f0;
}

.card-icon-alt {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(15, 118, 110, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f766e;
}

.card-content-alt {
  flex: 1;
}

.card-value-alt {
  font-size: 24px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 2px;
}

.card-label-alt {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.directorates-table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.directorates-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.directorates-table th {
  background: #f8fafc;
  padding: 14px 16px;
  text-align: right;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
  font-size: 14px;
}

.directorates-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 14px;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.highlighted-row {
  background: #ecfdf5;
}

.rank-cell {
  font-weight: 700;
  color: #0f766e;
  width: 80px;
}

.name-cell {
  font-weight: 500;
  min-width: 200px;
}

.count-cell {
  font-weight: 700;
  color: #0f766e;
  text-align: center;
  width: 100px;
}

.percentage-cell {
  font-weight: 600;
  color: #64748b;
  text-align: center;
  width: 120px;
}

.progress-cell {
  width: 150px;
}

.table-progress-bar {
  height: 20px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.table-progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s ease;
}

.table-progress-fill.high { background: linear-gradient(90deg, #10b981, #34d399); }
.table-progress-fill.medium { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.table-progress-fill.low { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

/* View Toggle Buttons */
.chart-action-btn.active {
  background: #0f766e;
  color: white;
  border-color: #0f766e;
}

.chart-action-btn.active:hover {
  background: #0d9488;
}

/* Enhanced Clusters View */
.enhanced-clusters-view {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.clusters-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.summary-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(15, 118, 110, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f766e;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.section-subtitle {
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f5f9;
}

.clusters-bars-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cluster-bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cluster-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cluster-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.cluster-schools {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.cluster-bar-track {
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.cluster-bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  position: relative;
}

.cluster-bar-fill.high {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.cluster-bar-fill.medium {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.cluster-bar-fill.low {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.cluster-bar-label {
  font-size: 12px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

/* Enhanced Stacked Bars */
.enhanced-stacked-bars {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stacked-bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-label {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
}

.bar-count {
  font-size: 14px;
  font-weight: 700;
  color: #0f766e;
  min-width: 30px;
  text-align: left;
}

.bar-track {
  height: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.bar-progress {
  height: 100%;
  border-radius: 6px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-left: 8px;
}

.bar-progress.high { background: linear-gradient(90deg, #10b981, #34d399); }
.bar-progress.medium { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.bar-progress.low { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

.bar-percentage {
  font-size: 10px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Enhanced Empty States */
.empty-state.enhanced-empty {
  padding: 60px 30px;
}

.empty-state.enhanced-empty .empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.7;
}

.empty-state.enhanced-empty h3 {
  font-size: 28px;
  margin-bottom: 16px;
}

.empty-state.enhanced-empty p {
  font-size: 16px;
  max-width: 500px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary.enhanced-btn, .btn-secondary.enhanced-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn-primary.enhanced-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.3);
}

.btn-secondary.enhanced-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(100, 116, 139, 0.2);
}

/* Charts */
.pie-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
}

.pie-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-slice {
  transition: transform 0.3s ease;
}

.pie-slice:hover {
  transform: scale(1.05);
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pie-center .total-value {
  font-size: 24px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 4px;
}

.pie-center .total-label {
  font-size: 12px;
  color: #64748b;
  text-align: center;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.active-color { background: #10b981; }
.inactive-color { background: #f59e0b; }
.admin-color { background: #0f766e; }
.school-user-color { background: #f59e0b; }
.analyst-color { background: #3b82f6; }

.bar-chart-horizontal {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.bar-item-horizontal {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bar-label {
  min-width: 120px;
  font-weight: 500;
  color: #1e293b;
}

.bar-container {
  flex: 1;
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0f766e, #14b8a6);
  transition: width 1s ease;
}

.bar-value {
  min-width: 40px;
  text-align: left;
  font-weight: 600;
  color: #1e293b;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Simple Pie Chart Styles */
.simple-pie-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.pie-visualization {
  display: flex;
  width: 100%;
  max-width: 400px;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pie-segment-simple {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
}

.pie-segment-simple:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
}

.segment-info {
  padding: 0 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pie-summary {
  text-align: center;
}

.total-count {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 4px;
}

.total-label {
  display: block;
  font-size: 14px;
  color: #64748b;
}

.chart-placeholder {
  text-align: center;
  padding: 40px 20px;
}

.placeholder-text {
  color: #94a3b8;
  font-size: 16px;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
}

.metric-content h4 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
}

.metric-content p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
}
</style>

