import api from './api'
import { endpoints } from './endpoints'

export const adminUsersService = {
  async list() {
    const res = await api.get(endpoints.admin.listUsers)
    return res.data ?? res
  },

  async create(payload) {
    const res = await api.post(endpoints.admin.createUser, payload)
    return res.data ?? res
  },

  async update(id, payload) {
    const res = await api.put(endpoints.admin.updateUser(id), payload)
    return res.data ?? res
  },

  async remove(id) {
    const res = await api.delete(endpoints.admin.deleteUser(id))
    return res.data ?? res
  },
}

export default adminUsersService
