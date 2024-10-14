'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tweet } from 'rettiwt-api'
import { TweetTable } from '@/components/TweetTable'
import { EmailCapture } from '@/components/EmailCapture'
import { Calendar } from "@/components/ui/calendar"
import { addDays, subDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7))
  const [endDate, setEndDate] = useState<Date>(new Date())
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

    const processedListID = listID.includes('x.com/i/lists/') 
      ? listID.split('/').pop() 
      : listID

    // Split keywords by space and filter out empty strings
    const keywordArray = keywords.split(' ').filter(word => word.trim() !== '')
    .map(word => word.replace(/,/g, ''))

    try {
      console.log('Start Date:', startDate.toISOString());
      console.log('End Date:', endDate.toISOString());
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
          <div className="flex flex-col space-y-4 justify-center items-center mb-8 max-w-3xl mx-auto">
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 w-full">
              <Input
                placeholder="Keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="md:w-1/3"
              />
              <Input
                placeholder="X List ID"
                value={listID}
                onChange={(e) => setListID(e.target.value)}
                className="md:w-1/3"
              />
              <Input
                placeholder="Min Likes"
                type="number"
                value={minLikes}
                onChange={(e) => setMinLikes(e.target.value)}
                className="md:w-1/3"
              />
            </div>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 w-full">
              <div className="flex flex-col space-y-2 md:w-1/3">
                <span className="text-sm font-medium">Start Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => setStartDate(date || subDays(new Date(), 7))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col space-y-2 md:w-1/3">
                <span className="text-sm font-medium">End Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => setEndDate(date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col justify-end md:w-1/3">
                <Button onClick={handleSearch} disabled={isLoading} className="w-full h-10">
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
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
