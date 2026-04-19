import './App.css'

import Calendar from './components/Calendar'

function App() {

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Scheduling Appointments</h1>
        <p className="text-gray-600">Manage your appointments and calendar events</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Calendar />
        </div>
      </div>
    </div>
  )
}

export default App