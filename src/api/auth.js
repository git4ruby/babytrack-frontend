import client from './client'

export async function signIn(email, password) {
  const response = await client.post('/auth/sign_in', {
    user: { email, password },
  })
  const token = response.headers.authorization?.replace('Bearer ', '')
  return { user: response.data.data, token }
}

export async function signOut() {
  await client.delete('/auth/sign_out')
}
