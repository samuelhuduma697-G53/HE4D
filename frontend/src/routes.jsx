export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  registerHelper: '/register/helper',
  seekerDashboard: '/dashboard/seeker',
  helperDashboard: '/dashboard/helper',
  adminDashboard: '/dashboard/admin',
  profile: '/profile',
  successStories: '/success-stories',
  resources: '/resources',
  about: '/about',
  contact: '/contact'
}

export const protectedRoutes = [
  routes.seekerDashboard,
  routes.helperDashboard,
  routes.adminDashboard,
  routes.profile
]

export const publicRoutes = [
  routes.home,
  routes.login,
  routes.register,
  routes.registerHelper,
  routes.successStories,
  routes.about,
  routes.contact
]

export const roleBasedRedirect = {
  seeker: routes.seekerDashboard,
  helper: routes.helperDashboard,
  admin: routes.adminDashboard,
  guest: routes.home
}
