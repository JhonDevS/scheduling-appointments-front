const UPCOMING_STATUSES = new Set(['confirmed', 'pending'])

export function filterAppointmentsByTab(appointments, tab) {
  if (tab === 'upcoming') {
    return appointments.filter((item) => UPCOMING_STATUSES.has(item.status))
  }
  return appointments.filter((item) => !UPCOMING_STATUSES.has(item.status))
}

export function buildAppointmentsHistoryText(appointments) {
  const lines = ['Historial de citas — SaludYa', `Generado: ${new Date().toLocaleString('es-CO')}`, '']
  appointments.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name} — ${item.specialty}`,
      `   Fecha: ${item.date} · Hora: ${item.time} · Estado: ${item.status}`,
      '',
    )
  })
  return lines.join('\n')
}
