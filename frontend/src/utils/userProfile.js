import api from '../api/axios'

export const saveUserData = async (userId, key, data) => {
  try {
    await api.post('/api/user/save', { userId, key, data })
  } catch (err) {
    console.error('Failed to save user data:', err)
  }
}

export const loadUserData = async (userId, key) => {
  try {
    const res = await api.get(`/api/user/load/${userId}/${key}`)
    return res.data?.data || null
  } catch (err) {
    return null
  }
}