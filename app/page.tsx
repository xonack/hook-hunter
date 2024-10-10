'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tweet } from 'rettiwt-api'
import { TweetTable } from '@/components/TweetTable'
import { EmailCapture } from '@/components/EmailCapture'

// Helper functions
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function isValidEmail(email: string | null): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [keywords, setKeywords] = useState('')
  const [listID, setListID] = useState('')
  const [minLikes, setMinLikes] = useState('')
  const [timePeriod, setTimePeriod] = useState('1 Day')
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const userEmail = getCookie('userEmail')
    if (isValidEmail(userEmail)) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleSearch = async () => {
    setIsLoading(true)
    setError('')

    // Process the listID if it's a URL
    const processedListID = listID.includes('x.com/i/lists/') 
      ? listID.split('/').pop() 
      : listID
    const endDate = new Date()
    const startDate = new Date()

    switch (timePeriod) {
      case '1 Day':
        startDate.setDate(endDate.getDate() - 1)
        break
      case '7 Days':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '21 Days':
        startDate.setDate(endDate.getDate() - 21)
        break
    }

    // Split keywords by space and filter out empty strings
    const keywordArray = keywords.split(' ').filter(word => word.trim() !== '')
    .map(word => word.replace(/,/g, ''))

    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listID: processedListID,
          minLikes,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          words: keywordArray,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tweets')
      }

      const data = await response.json()
      setTweets(data.tweets)
    } catch (err) {
      setError('An error occurred while fetching tweets')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-6xl font-bold mb-32 text-center">Hook Hunter</h1>
      
      {!isLoggedIn ? (
        <EmailCapture onSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 justify-center items-end mb-8">
            <Input
              placeholder="Keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="md:w-1/4"
            />
            <Input
              placeholder="X List ID"
              value={listID}
              onChange={(e) => setListID(e.target.value)}
              className="md:w-1/4"
            />
            <Input
              placeholder="Min Likes"
              type="number"
              value={minLikes}
              onChange={(e) => setMinLikes(e.target.value)}
              className="md:w-36"
            />
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 Day">1 Day</SelectItem>
                <SelectItem value="7 Days">7 Days</SelectItem>
                <SelectItem value="21 Days">21 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {error && <p className="text-red-500 text-center">{error}</p>}
          {tweets.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              <TweetTable tweets={tweets} />
            </div>
          ) : (
            <h3 className="text-xl text-gray-500 font-semibold text-center mt-8">Nothing yet...</h3>
          )}
        </>
      )}
    </main>
  )
}
