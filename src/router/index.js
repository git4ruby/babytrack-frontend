import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyView.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordView.vue'),
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordView.vue'),
  },
  {
    path: '/setup',
    name: 'BabySetup',
    component: () => import('@/views/BabySetupView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'feedings',
        name: 'Feedings',
        component: () => import('@/views/FeedingsView.vue'),
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/AnalyticsView.vue'),
      },
      {
        path: 'milk-storage',
        name: 'MilkStorage',
        component: () => import('@/views/MilkStorageView.vue'),
      },
      {
        path: 'sleep',
        name: 'Sleep',
        component: () => import('@/views/SleepView.vue'),
      },
      {
        path: 'diapers',
        name: 'Diapers',
        component: () => import('@/views/DiapersView.vue'),
      },
      {
        path: 'milestones',
        name: 'Milestones',
        component: () => import('@/views/MilestonesView.vue'),
      },
      {
        path: 'weight',
        name: 'Weight',
        component: () => import('@/views/WeightView.vue'),
      },
      {
        path: 'vaccinations',
        name: 'Vaccinations',
        component: () => import('@/views/VaccinationsView.vue'),
      },
      {
        path: 'appointments',
        name: 'Appointments',
        component: () => import('@/views/AppointmentsView.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('bt_token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'Login' }
  }
  if (to.meta.guest && token) {
    return { name: 'Dashboard' }
  }
})

export default router
