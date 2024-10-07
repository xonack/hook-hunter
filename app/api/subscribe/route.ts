import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const KIT_API_KEY = process.env.KIT_API_KEY

  console.log('KIT_API_KEY', KIT_API_KEY)

  try {
    const response = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Kit-Api-Key': `${KIT_API_KEY}`
      },
      body: JSON.stringify({
        email_address: email,
        state: 'active'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to subscribe: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, subscriber: data.subscriber })
  } catch (error) {
    console.error('Error subscribing to ConvertKit:', error)
    return NextResponse.json({ error: 'An error occurred while subscribing' }, { status: 500 })
  }
}