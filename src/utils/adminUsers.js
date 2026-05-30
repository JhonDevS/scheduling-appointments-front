export const ADMIN_PAGE_SIZE = 10

export function filterUsers(users, { roleFilter = 'all', statusFilter = '' }) {
  return users.filter((user) => {
    const roleOk = roleFilter === 'all' || user.role === roleFilter
    const statusOk = !statusFilter || user.status === statusFilter
    return roleOk && statusOk
  })
}

export function paginateUsers(users, page, pageSize = ADMIN_PAGE_SIZE) {
  const total = users.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    items: users.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, total),
  }
}

export function generateUserId() {
  return `SY-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
}
