export const endpoints = {
  calendar: {
    getEvents: (start, end) => `/calendar/events?start=${start}&end=${end}`,
    
    getEventById: (id) => `/calendar/events/${id}`,
    
    createEvent: '/calendar/events',
    
    updateEvent: (id) => `/calendar/events/${id}`,
    
    deleteEvent: (id) => `/calendar/events/${id}`,
  },
  
  appointments: {
    getAll: '/appointments',
    
    getById: (id) => `/appointments/${id}`,
    
    create: '/appointments',
    
    update: (id) => `/appointments/${id}`,
    
    delete: (id) => `/appointments/${id}`,
    
    getByDateRange: (start, end) => `/appointments?start=${start}&end=${end}`,
  },
  
  users: {
    getProfile: '/users/profile',
    
    updateProfile: '/users/profile',
  },
  
  availability: {
    getDoctorBase: (doctorId) => `/doctors/${doctorId}/availability/base`,
  },
  
  auth: {
    login: '/auth/login',
    
    register: '/auth/register',
    
    logout: '/auth/logout',
    
    refresh: '/auth/refresh',
  },
  
  admin: {
    listUsers: '/admin/users',
    createUser: '/admin/users',
    updateUser: (id) => `/admin/users/${id}`,
    deleteUser: (id) => `/admin/users/${id}`,
  },
}

export default endpoints
