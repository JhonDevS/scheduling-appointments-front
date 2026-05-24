import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import DoctorLayout from '../components/layout/DoctorLayout'

export default function DoctorPortal() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <DoctorLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <Outlet context={{ searchQuery }} />
    </DoctorLayout>
  )
}
