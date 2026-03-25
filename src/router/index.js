import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true },
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
