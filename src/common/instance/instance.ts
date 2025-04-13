import axios from 'axios'

const token = 'XXX'
const apiKey = 'XXX'

export const instance = axios.create({
  baseURL: 'https://social-network.samuraijs.com/api/1.1',
  headers: {
    Authorization: `Bearer ${token}`,
    'API-KEY': apiKey,
  },
})
