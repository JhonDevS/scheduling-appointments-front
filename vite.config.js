import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

const nodeMajor = Number(process.versions.node.split('.')[0])

const coverage90 = { lines: 90, functions: 90, branches: 85, statements: 90 }

const coverage85 = { lines: 85, functions: 85, branches: 80, statements: 85 }



// https://vite.dev/config/

export default defineConfig({

  plugins: [react(), tailwindcss()],

  test: {

    globals: true,

    environment: 'jsdom',

    ...(nodeMajor >= 25 ? { execArgv: ['--no-webstorage'] } : {}),

    setupFiles: ['./tests/setup.js'],

    include: ['tests/**/*.{test,spec}.{js,jsx}'],

    testTimeout: 10000,

    coverage: {

      provider: 'v8',

      reporter: ['text', 'html', 'lcov'],

      include: ['src/**/*.{js,jsx}'],

      exclude: [

        'src/main.jsx',

        'src/mocks/**',

        'src/**/*.css',

        'src/design-system/index.js',

        'src/components/home/**',

        'src/components/login/**',

        'src/components/register/**',

        'src/components/calendar/**',

      ],

      thresholds: {

        'src/utils/legalContent.js': coverage90,

        'src/utils/appointmentsFilter.js': coverage90,

        'src/utils/adminUsers.js': coverage90,

        'src/utils/downloadFile.js': coverage90,

        'src/utils/doctorSchedule.js': { lines: 90, functions: 90, branches: 75, statements: 90 },

        'src/utils/newsletter.js': coverage90,

        'src/store/usersAdminStore.js': coverage90,

        'src/store/doctorAvailabilityStore.js': coverage90,

        'src/store/newsletterStore.js': coverage90,

        'src/store/prescriptionRenewalsStore.js': coverage90,

        'src/pages/LegalPage.jsx': coverage90,

        'src/pages/ForgotPasswordPage.jsx': { lines: 85, functions: 85, branches: 75, statements: 85 },

        'src/pages/DoctorPortal.jsx': coverage90,

        'src/pages/DoctorCalendar.jsx': coverage85,

        'src/pages/DoctorAnalytics.jsx': coverage90,

        'src/pages/DoctorSettings.jsx': { lines: 85, functions: 66, branches: 75, statements: 84 },

        'src/components/layout/HelpModal.jsx': coverage90,

        'src/components/layout/LegalLink.jsx': coverage90,

        'src/components/layout/NotificationsPanel.jsx': coverage90,

        'src/pages/AdminUsers.jsx': { lines: 85, functions: 70, branches: 72, statements: 85 },

        'src/pages/DoctorDashboard.jsx': { lines: 85, functions: 73, branches: 72, statements: 85 },

        'src/pages/PatientDashboard.jsx': { lines: 85, functions: 78, branches: 68, statements: 85 },

        'src/pages/MyAppointments.jsx': { lines: 82, functions: 70, branches: 75, statements: 84 },

        'src/pages/Landing.jsx': { lines: 85, functions: 72, branches: 75, statements: 85 },

        'src/components/layout/DoctorLayout.jsx': { lines: 66, functions: 58, branches: 83, statements: 68 },

        'src/pages/ProfilePage.jsx': { lines: 85, functions: 60, branches: 70, statements: 85 },

      },

    },

  },

})


