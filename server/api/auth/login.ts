export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { email, password } = await req.json()
    console.log('Login attempt:', { email, hasPassword: !!password })

    // TODO: ปรับ getUserByEmail ให้ตรงกับ db client / schema ของโปรเจคคุณ
    async function getUserByEmail(email: string) {
      try {
        // ตัวอย่างสำหรับโปรเจคที่ใช้ drizzle (ปรับ import/path ให้ตรง)
        const { db } = await import('../../_core/db')
        const { users } = await import('../../_core/schema')
        const { eq } = await import('drizzle-orm')
        const rows = await db.select().from(users).where(eq(users.email, email))
        return rows[0] ?? null
      } catch (err) {
        // fallback: ถ้าไม่มี db client ให้ return null
        console.warn('getUserByEmail: failed, adjust implementation to your project', err)
        return null
      }
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const bcrypt = (await import('bcryptjs')).default
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // สร้าง JWT (ต้องมี JWT_SECRET ใน .env.local)
    const jwt = (await import('jsonwebtoken')).default
    const secret = process.env.JWT_SECRET || ''
    const token = jwt.sign({ sub: String(user.id), email: user.email }, secret, { expiresIn: '7d' })

    // ส่ง cookie และตอบ body (ปรับ SameSite/Secure ตามการตั้งค่า CORS/HTTPS ของคุณ)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Set-Cookie': `session=${token}; HttpOnly; Path=/; SameSite=Lax`
    }

    console.log('Login success:', { userId: user.id, email: user.email })
    return new Response(JSON.stringify({ ok: true, token }), { status: 200, headers })
  } catch (error: any) {
    console.error('Login error:', error)
    return new Response(JSON.stringify({ error: error?.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}