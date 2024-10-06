# Project Requirements Document (PRD)

  

## Project Overview

  

We are developing a **Lead Magnet Platform** that enables users to search for tweets based on specific criteria and display them in a sortable table. The table will include various data points such as tweet text, username, date, likes, retweets, views, and comments. Users will also have the ability to export this data as a CSV file.

  

### Technologies to be Used

  

- **Next.js 14**: A React framework for building web applications.

- **Shadcn UI Components**: A component library for building user interfaces.

- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.

- **Lucide Icons**: An icon library for adding visual elements.

- **Rettiwt API**: A library for fetching tweets from Twitter. Should be called server side.

  

---

  

## Core Functionalities

  

### 1. Search for Tweets

  

- **Search Bar Placement**: The search bar will be prominently placed, centered horizontally, and positioned in the top third of the page.

- **User Inputs**:

- **List ID** (`listID`): Users can enter a Twitter List ID.

- **Minimum Likes** (`minLikes`): Users can specify the minimum number of likes a tweet must have.

- **Time Period** (`startDate`, `endDate`): Users can select a time period from a dropdown menu with options: 1 Day, 7 Days, 21 Days. This selection will be converted into `startDate` and `endDate` variables.

- **Search Action**: A "Search" button next to the input fields triggers the search action.

- **Search Query Construction**: The input data is used to build a search filter compatible with the Rettiwt API for fetching tweets.

EXAMPLE FILTER: ```

import { TweetFilter } from 'rettiwt-api';

const filter: TweetFilter = {

list: listID,

minLikes: minLikes,

startDate: startDate,

endDate: endDate,

replies: false,

}

```

#### User Interface Specifications

  

- **Input Fields**:

- **List ID Input**: Text input for the Twitter List ID.

- **Minimum Likes Input**: Numeric input for the minimum likes.

- **Time Period Dropdown**: Dropdown menu with options for 1 Day, 7 Days, and 21 Days.

- **Search Button**: Clicking this button initiates the tweet fetching process.

  

#### Example Code for Search Interface (For Reference Only)

  

*Note: This code is provided for illustrative purposes to guide the implementation and should not be included in the final document.*

  

```tsx

// This is a representation of how the search interface components may be structured.

  

<div className="flex space-x-4">

<Input

placeholder="List ID"

value={listID}

onChange={(e) => setListID(e.target.value)}

/>

<Input

placeholder="Min Likes"

type="number"

value={minLikes}

onChange={(e) => setMinLikes(e.target.value)}

/>

<Select

value={timePeriod}

onChange={(e) => setTimePeriod(e.target.value)}

>

<option value="1 Day">1 Day</option>

<option value="7 Days">7 Days</option>

<option value="21 Days">21 Days</option>

</Select>

<Button onClick={handleSearch}>Search</Button>

</div>

```

  

---

  

### 2. Fetch Tweets from Twitter

  

- **API Integration**:

- Utilize the **Rettiwt API** library to fetch tweets based on the user input (`listID`, `minLikes`, `startDate`, `endDate`).

- The **Twitter API key** provided in the `.env` file will be used to authenticate API requests.

- **Data Handling**:

- Fetched tweets will be stored in a variable called `tweets`, which is an array of `Tweet` objects.

  

#### Functional Specifications

  

- **Search Filter Construction**: Build a search filter using the input variables to fetch relevant tweets.

- **Date Conversion**:

- Convert the selected time period into `startDate` and `endDate`.

- Example logic for date conversion:

  

```jsx

// Pseudocode for converting timePeriod to startDate and endDate.

  

const today = new Date();

let startDate = new Date();

  

switch (timePeriod) {

case '1 Day':

startDate.setDate(today.getDate() - 1);

break;

case '7 Days':

startDate.setDate(today.getDate() - 7);

break;

case '21 Days':

startDate.setDate(today.getDate() - 21);

break;

default:

startDate = today;

}

  

startDate = startDate.toISOString();

endDate = today.toISOString();

```

  

- **API Call**: Use the constructed filter to fetch tweets and update the `tweets` array. Repeat this process until at least 20 tweets are fetched or Tweets.list is an empty array.

  

EXAMPLE CODE:

```

async function fetchTweets() {

const rettiwt = new Rettiwt({ apiKey: process.env.WARRIOR_API_KEY });

  

const listID = '1782987441475039605';

const minLikes = 3000;

const endDate = new Date();

// const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  

const filter: TweetFilter = {

list: listID,

minLikes: minLikes,

startDate: startDate,

endDate: endDate,

replies: false,

}

  

let nextData = '';

let tweetsList = [];

while (tweetsList.length < 20) {

console.log(`Fetching tweets...`);

console.log(`Next data: ${nextData}`);

const tweets = await rettiwt.tweet.search(filter, 20, nextData);

// console.log(tweets);

nextData = tweets.next.value;

tweetsList.push(...tweets.list);

if (tweets.next.value === null) {

break;

}

console.log(`Tweets fetched: ${tweetsList.length}`);

}

  

}

```

  

---

  

### 3. Display Tweets in a Table

  

- **Table Placement**: The table will be displayed below the search bar.

- **Columns**:

- **Tweet Text**

- **Tweet Username**: Clickable link to the user's Twitter profile.

- **Tweet URL**: Clickable link to the tweet.

- **Tweet Date**

- **Tweet Likes**

- **Tweet Retweets**

- **Tweet Views**

- **Tweet Comments**

  

#### User Interface Specifications

  

- **Table Component**: A reusable component that accepts the `tweets` array as a prop and displays the data accordingly.

- **Interactivity**:

- Each username and tweet URL should be clickable and open in a new tab.

- The table should be responsive and handle varying lengths of tweet text.


EXAMPLE CODE:
```
"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Repeat, Eye, ArrowUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import { Tweet } from "rettiwt-api"

interface Tweet {
  text: string
  username: string
  url: string
  date: string
  likes: number
  retweets: number
  views: number
  comments: number
}

const sampleTweets: Tweets[] = [
  {
    id: '1842545912125518130',
    createdAt: 'Sat Oct 05 12:42:32 +0000 2024',
    tweetBy: User {
      id: '308800426',
      userName: 'matt_gray_',
      fullName: 'MATT GRAY',
      createdAt: 'Wed Jun 01 01:09:23 +0000 2011',
      description: '“The Systems Guy” | Proven systems to grow a profitable audience with organic content. Founder & CEO @founderos',
      isVerified: true,
      likeCount: 63414,
      followersCount: 349572,
      followingsCount: 160,
      statusesCount: 49001,
      location: 'Join 137K+ subscribers ➜',
      pinnedTweet: '1755586214189486140',
      profileBanner: 'https://pbs.twimg.com/profile_banners/308800426/1705012944',
      profileImage: 'https://pbs.twimg.com/profile_images/1669158896227737601/2y1eIG_L_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: [ [TweetMedia] ],
    quoted: undefined,
    fullText: 'The greatest thinker of the 21st century:\n' +
      '\n' +
      'Naval Ravikant.\n' +
      '\n' +
      'He was an early investor in Uber, Twitter, and Notion.\n' +
      '\n' +
      'And he famously said, “You’re not going to get rich renting out your time.”\n' +
      '\n' +
      'Here are 10 of his teachings on wealth that changed my life: https://t.co/F560emFIxt',
    replyTo: undefined,
    lang: 'en',
    quoteCount: 74,
    replyCount: 147,
    retweetCount: 2562,
    likeCount: 18005,
    viewCount: 2738072,
    bookmarkCount: 17260,
    retweetedTweet: undefined
  },
  Tweet {
    id: '1842545523624149331',
    createdAt: 'Sat Oct 05 12:41:00 +0000 2024',
    tweetBy: User {
      id: '312681953',
      userName: 'SahilBloom',
      fullName: 'Sahil Bloom',
      createdAt: 'Tue Jun 07 14:14:17 +0000 2011',
      description: 'Exploring my curiosity and sharing what I learn along the way. Gave up a grand slam on ESPN in 2012 and still waiting for it to land. Preorder my first book!👇',
      isVerified: true,
      likeCount: 140877,
      followersCount: 1060064,
      followingsCount: 161,
      statusesCount: 63244,
      location: 'New York, USA',
      pinnedTweet: '1813551147325473095',
      profileBanner: 'https://pbs.twimg.com/profile_banners/312681953/1721217790',
      profileImage: 'https://pbs.twimg.com/profile_images/1586859332104343552/V1HRpbP1_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: [ [TweetMedia] ],
    quoted: undefined,
    fullText: 'Your entire life will change when you accept this truth: https://t.co/xRCr4Symxy',
    replyTo: undefined,
    lang: 'en',
    quoteCount: 23,
    replyCount: 86,
    retweetCount: 408,
    likeCount: 3410,
    viewCount: 350470,
    bookmarkCount: 2016,
    retweetedTweet: undefined
  },
  Tweet {
    id: '1842541487357116522',
    createdAt: 'Sat Oct 05 12:24:58 +0000 2024',
    tweetBy: User {
      id: '925090976464556033',
      userName: 'readswithravi',
      fullName: 'Reads with Ravi',
      createdAt: 'Mon Oct 30 20:04:10 +0000 2017',
      description: '“A little bit of DAILY READING goes long way.”📚 📖 ☕️ || Book Review, Lessons, Recomm, & Wisdom || Engineer 👨‍💻 Solutions Architect - Data Storage',
      isVerified: true,
      likeCount: 27655,
      followersCount: 198813,
      followingsCount: 999,
      statusesCount: 16732,
      location: undefined,
      pinnedTweet: undefined,
      profileBanner: 'https://pbs.twimg.com/profile_banners/925090976464556033/1655860734',
      profileImage: 'https://pbs.twimg.com/profile_images/1560994238434889730/jhqZEwKm_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: [ [TweetMedia] ],
    quoted: undefined,
    fullText: 'The smartest people I know: https://t.co/ZD9ZS3Enhe',
    replyTo: undefined,
    lang: 'en',
    quoteCount: 9,
    replyCount: 13,
    retweetCount: 617,
    likeCount: 4171,
    viewCount: 194915,
    bookmarkCount: 1573,
    retweetedTweet: undefined
  }
]
 POST /api/tweets 200 in 920ms
 ⚠ Fast Refresh had to perform a full reload due to a runtime error.
 ⚠ Fast Refresh had to perform a full reload due to a runtime error.
 ✓ Compiled in 857ms (660 modules)
 GET / 200 in 605ms
 ✓ Compiled /favicon.ico in 158ms (365 modules)
 GET /favicon.ico 200 in 286ms
 ✓ Compiled /api/tweets in 205ms (846 modules)
[
  Tweet {
    id: '1842635031497306556',
    createdAt: 'Sat Oct 05 18:36:40 +0000 2024',
    tweetBy: User {
      id: '713733336112500737',
      userName: 'JeremyTate41',
      fullName: 'Jeremy Wayne Tate',
      createdAt: 'Sat Mar 26 14:24:22 +0000 2016',
      description: 'Catholic, husband and father of 6, Founder of @CLT_Exam and The Classical Teaching Corps, Faculty Fellow @BelmontAbbey, Trustee @CathInstTech',
      isVerified: true,
      likeCount: 103778,
      followersCount: 104773,
      followingsCount: 3871,
      statusesCount: 28390,
      location: undefined,
      pinnedTweet: '1841594649367965822',
      profileBanner: 'https://pbs.twimg.com/profile_banners/713733336112500737/1717519247',
      profileImage: 'https://pbs.twimg.com/profile_images/1805121125913141249/UmOCWFDO_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: [ [TweetMedia] ],
    quoted: undefined,
    fullText: 'The modern world uses math to create addictive social media algorithms. \n' +
      '\n' +
      'The old world used math to create works of timeless beauty. https://t.co/c8PXf1iBnp',
    replyTo: undefined,
    lang: 'en',
    quoteCount: 41,
    replyCount: 82,
    retweetCount: 1346,
    likeCount: 8578,
    viewCount: 200455,
    bookmarkCount: 415,
    retweetedTweet: undefined
  },
  Tweet {
    id: '1842585040263528458',
    createdAt: 'Sat Oct 05 15:18:01 +0000 2024',
    tweetBy: User {
      id: '1417686048579018753',
      userName: 'AlexHormozi',
      fullName: 'Alex Hormozi',
      createdAt: 'Wed Jul 21 03:21:30 +0000 2021',
      description: 'Day Job: I invest and scale companies at https://t.co/gQN7Oehqnu | Co-Owner, Skool. Side Hustle: I show how we do it. Business owners click below ⬇️',
      isVerified: true,
      likeCount: 2678,
      followersCount: 707156,
      followingsCount: 136,
      statusesCount: 5452,
      location: undefined,
      pinnedTweet: '1744489077137879530',
      profileBanner: 'https://pbs.twimg.com/profile_banners/1417686048579018753/1707430382',
      profileImage: 'https://pbs.twimg.com/profile_images/1617408747080667136/C88UDPNZ_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: undefined,
    quoted: undefined,
    fullText: 'It’s always harder, takes longer, and costs more than you think it will.',
    replyTo: undefined,
    lang: 'en',
    quoteCount: 37,
    replyCount: 263,
    retweetCount: 754,
    likeCount: 5592,
    viewCount: 148458,
    bookmarkCount: 785,
    retweetedTweet: undefined
  },
  Tweet {
    id: '1842553514892865859',
    createdAt: 'Sat Oct 05 13:12:45 +0000 2024',
    tweetBy: User {
      id: '925090976464556033',
      userName: 'readswithravi',
      fullName: 'Reads with Ravi',
      createdAt: 'Mon Oct 30 20:04:10 +0000 2017',
      description: '“A little bit of DAILY READING goes long way.”📚 📖 ☕️ || Book Review, Lessons, Recomm, & Wisdom || Engineer 👨‍💻 Solutions Architect - Data Storage',
      isVerified: true,
      likeCount: 27655,
      followersCount: 198816,
      followingsCount: 999,
      statusesCount: 16732,
      location: undefined,
      pinnedTweet: undefined,
      profileBanner: 'https://pbs.twimg.com/profile_banners/925090976464556033/1655860734',
      profileImage: 'https://pbs.twimg.com/profile_images/1560994238434889730/jhqZEwKm_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: [ [TweetMedia] ],
    quoted: undefined,
    fullText: 'https://t.co/cO3rTKio5c',
    replyTo: undefined,
    lang: 'zxx',
    quoteCount: 19,
    replyCount: 13,
    retweetCount: 587,
    likeCount: 5709,
    viewCount: 190226,
    bookmarkCount: 599,
    retweetedTweet: undefined
  },
  Tweet {
    id: '1842545912125518130',
    createdAt: 'Sat Oct 05 12:42:32 +0000 2024',
    tweetBy: User {
      id: '308800426',
      userName: 'matt_gray_',
      fullName: 'MATT GRAY',
      createdAt: 'Wed Jun 01 01:09:23 +0000 2011',
      description: '“The Systems Guy” | Proven systems to grow a profitable audience with organic content. Founder & CEO @founderos',
      isVerified: true,
      likeCount: 63414,
      followersCount: 349572,
      followingsCount: 160,
      statusesCount: 49001,
      location: 'Join 137K+ subscribers ➜',
      pinnedTweet: '1755586214189486140',
      profileBanner: 'https://pbs.twimg.com/profile_banners/308800426/1705012944',
      profileImage: 'https://pbs.twimg.com/profile_images/1669158896227737601/2y1eIG_L_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: [ [TweetMedia] ],
    quoted: undefined,
    fullText: 'The greatest thinker of the 21st century:\n' +
      '\n' +
      'Naval Ravikant.\n' +
      '\n' +
      'He was an early investor in Uber, Twitter, and Notion.\n' +
      '\n' +
      'And he famously said, “You’re not going to get rich renting out your time.”\n' +
      '\n' +
      'Here are 10 of his teachings on wealth that changed my life: https://t.co/F560emFIxt',
    replyTo: undefined,
    lang: 'en',
    quoteCount: 74,
    replyCount: 147,
    retweetCount: 2565,
    likeCount: 18015,
    viewCount: 2740350,
    bookmarkCount: 17277,
    retweetedTweet: undefined
  },
  Tweet {
    id: '1842545523624149331',
    createdAt: 'Sat Oct 05 12:41:00 +0000 2024',
    tweetBy: User {
      id: '312681953',
      userName: 'SahilBloom',
      fullName: 'Sahil Bloom',
      createdAt: 'Tue Jun 07 14:14:17 +0000 2011',
      description: 'Exploring my curiosity and sharing what I learn along the way. Gave up a grand slam on ESPN in 2012 and still waiting for it to land. Preorder my first book!👇',
      isVerified: true,
      likeCount: 140877,
      followersCount: 1060064,
      followingsCount: 161,
      statusesCount: 63244,
      location: 'New York, USA',
      pinnedTweet: '1813551147325473095',
      profileBanner: 'https://pbs.twimg.com/profile_banners/312681953/1721217790',
      profileImage: 'https://pbs.twimg.com/profile_images/1586859332104343552/V1HRpbP1_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: [ [TweetMedia] ],
    quoted: undefined,
    fullText: 'Your entire life will change when you accept this truth: https://t.co/xRCr4Symxy',
    replyTo: undefined,
    lang: 'en',
    quoteCount: 23,
    replyCount: 86,
    retweetCount: 408,
    likeCount: 3410,
    viewCount: 350696,
    bookmarkCount: 2016,
    retweetedTweet: undefined
  },
  Tweet {
    id: '1842541487357116522',
    createdAt: 'Sat Oct 05 12:24:58 +0000 2024',
    tweetBy: User {
      id: '925090976464556033',
      userName: 'readswithravi',
      fullName: 'Reads with Ravi',
      createdAt: 'Mon Oct 30 20:04:10 +0000 2017',
      description: '“A little bit of DAILY READING goes long way.”📚 📖 ☕️ || Book Review, Lessons, Recomm, & Wisdom || Engineer 👨‍💻 Solutions Architect - Data Storage',
      isVerified: true,
      likeCount: 27655,
      followersCount: 198816,
      followingsCount: 999,
      statusesCount: 16732,
      location: undefined,
      pinnedTweet: undefined,
      profileBanner: 'https://pbs.twimg.com/profile_banners/925090976464556033/1655860734',
      profileImage: 'https://pbs.twimg.com/profile_images/1560994238434889730/jhqZEwKm_normal.jpg'
    },
    entities: TweetEntities { hashtags: [], mentionedUsers: [], urls: [] },
    media: [ [TweetMedia] ],
    quoted: undefined,
    fullText: 'The smartest people I know: https://t.co/ZD9ZS3Enhe',
    replyTo: undefined,
    lang: 'en',
    quoteCount: 9,
    replyCount: 13,
    retweetCount: 617,
    likeCount: 4175,
    viewCount: 195243,
    bookmarkCount: 1575,
    retweetedTweet: undefined
  }
]

type SortKey = keyof Tweet
type SortOrder = "asc" | "desc"

export default function TweetTable() {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const sortedTweets = [...sampleTweets].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Tweet Text</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("username")}>
                Username <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Tweet URL</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("date")}>
                Date <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("likes")}>
                Likes <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("retweets")}>
                Retweets <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("views")}>
                Views <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("comments")}>
                Comments <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTweets.map((tweet, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{tweet.text}</TableCell>
              <TableCell>
                <Link href={`https://twitter.com/${tweet.userName}`} className="text-blue-500 hover:underline">
                  @{tweet.userName}
                </Link>
              </TableCell>
              <TableCell>
                <Link href="https://x.com/{tweet.userName}/status/{tweet.id}" className="text-blue-500 hover:underline">
                  View Tweet
                </Link>
              </TableCell>
              <TableCell>{tweet.createdAt}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {tweet.likeCount}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Repeat className="h-4 w-4 text-green-500" />
                  {tweet.retweetCount}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-blue-500" />
                  {tweet.viewCount}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                  {tweet.replyCount}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

  

---

  

### 4. Sort Tweets

  

- **Sorting Mechanism**:

- Users can sort the tweets by clicking on an arrow icon on each column header.

- Sorting can be toggled between ascending and descending order upon each click.

- **Implementation**:

- Update the `tweets` array based on the selected sort criteria.

- Maintain state variables for the current sort column and sort direction.

EXAMPLE CODE:

``` TweetTable.tsx
type SortKey = keyof Tweet
type SortOrder = "asc" | "desc"

export default function TweetTable() {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const sortedTweets = [...sampleTweets].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Tweet Text</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("username")}>
                Username <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Tweet URL</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("date")}>
                Date <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("likes")}>
                Likes <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("retweets")}>
                Retweets <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("views")}>
                Views <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("comments")}>
                Comments <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTweets.map((tweet, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{tweet.text}</TableCell>
              <TableCell>
                <Link href={`https://twitter.com/${tweet.userName}`} className="text-blue-500 hover:underline">
                  @{tweet.userName}
                </Link>
              </TableCell>
              <TableCell>
                <Link href="https://x.com/{tweet.userName}/status/{tweet.id}" className="text-blue-500 hover:underline">
                  View Tweet
                </Link>
              </TableCell>
              <TableCell>{tweet.createdAt}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {tweet.likeCount}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Repeat className="h-4 w-4 text-green-500" />
                  {tweet.retweetCount}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-blue-500" />
                  {tweet.viewCount}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                  {tweet.replyCount}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```



#### Functional Specifications

  

- **State Management**:

- Use state variables like `sortColumn` and `sortDirection` to track sorting preferences.

- **Sorting Logic**:

- Implement a function to sort the `tweets` array based on the selected column and direction.

- **User Feedback**:

- Visually indicate the active sort column and direction using icons from **Lucide Icons**.

  

---

  

### 5. Export Tweets to CSV

  

- **Export Button**:

- An "Export to CSV" button will be displayed in the top-left corner above the table.

- When clicked, the current `tweets` data will be exported to a CSV file named `theMeta.csv`.

- **File Download**:

- The CSV file will be automatically downloaded to the user's device.

  

#### Functional Specifications

  

- **CSV Conversion**:

- Implement a utility function to convert the `tweets` array into CSV format.

- **Download Mechanism**:

- Create a temporary link to initiate the file download.

- Clean up the temporary link after the download is initiated.

  

#### Example Utility Function for CSV Export (For Reference Only)

  

```tsx

// Pseudocode for exporting data to CSV.

  

function exportToCSV(data, filename) {

const csvContent =

'data:text/csv;charset=utf-8,' +

data.map((row) => Object.values(row).join(',')).join('\n');

  

const encodedUri = encodeURI(csvContent);

const link = document.createElement('a');

link.setAttribute('href', encodedUri);

link.setAttribute('download', filename);

document.body.appendChild(link); // Required for Firefox

link.click();

document.body.removeChild(link);

}

```

  

---

  

## File Structure

  

To maintain simplicity and ease of development, the project will be structured as follows:

  

```

**.**

├── README.md

├── **app**

│   ├── favicon.ico

│   ├── **fonts**

│   ├── globals.css

│   ├── layout.tsx

│   └── page.tsx

├── **components**

│   └── **ui**

├── components.json

├── **lib**

│   └── utils.ts

├── next-env.d.ts

├── next.config.mjs

├── package-lock.json

├── package.json

├── postcss.config.mjs

├── tailwind.config.ts

└── tsconfig.json

```

  

### File Descriptions

  

- **`.env`**: Contains environment variables like the Twitter API key.

- **`README.md`**: Documentation and setup instructions for the project.

- **`app/`**:

- **`globals.css`**: Global CSS styles.

- **`layout.tsx`**: Layout component for consistent styling across pages.

- **`page.tsx`**: Main page containing the search bar, tweet fetching logic, tweet display table, sorting functionality, and CSV export logic.

- **`components/ui/`**: Contains reusable UI components.

- **`button.tsx`**: Button component.

- **`input.tsx`**: Input field component.

- **`select.tsx`**: Select (dropdown) component.

- **`table.tsx`**: Table component for displaying tweets.

- **`lib/utils.ts`**: Utility functions, such as CSV export functionality.

- **`public/images/`**: Contains static assets like images.

- **`next-env.d.ts`**: Next.js TypeScript environment definitions.

- **`next.config.mjs`**: Next.js configuration file.

- **`package.json`**: Lists project dependencies and scripts.

- **`postcss.config.mjs`**: Configuration for PostCSS.

- **`tailwind.config.ts`**: Configuration for Tailwind CSS.

- **`tsconfig.json`**: TypeScript configuration file.

  

---

  

## Detailed Functional Specifications

  

### 1. User Interface Components

  

#### 1.1 Input Component (`components/ui/input.tsx`)

  

- **Purpose**: A reusable input field component.

- **Props**:

- `type`: Specifies the type of input (e.g., `text`, `number`).

- `placeholder`: Placeholder text for the input field.

- `value`: Controlled input value.

- `onChange`: Event handler for input changes.

- **Styling**: Use Tailwind CSS classes for consistent styling.

  

#### 1.2 Button Component (`components/ui/button.tsx`)

  

- **Purpose**: A reusable button component.

- **Props**:

- `onClick`: Event handler for button clicks.

- `children`: The content inside the button (e.g., text, icons).

- **Styling**: Use Tailwind CSS classes and include hover and focus states.

  

#### 1.3 Select Component (`components/ui/select.tsx`)

  

- **Purpose**: A reusable select (dropdown) component.

- **Props**:

- `value`: Controlled select value.

- `onChange`: Event handler for value changes.

- `children`: Option elements representing selectable items.

- **Styling**: Use Tailwind CSS classes for consistent styling.

  

#### 1.4 Table Component (`components/ui/table.tsx`)

  

- **Purpose**: A reusable table component for displaying tweets.

- **Props**:

- `data`: An array of tweet objects to display.

- `onSort`: Function to handle sorting when a column header is clicked.

- **Functionality**:

- Render table headers with sortable columns.

- Render table rows with tweet data.

- Include clickable links for usernames and tweet URLs.

- **Styling**: Use Tailwind CSS classes for table layout and responsiveness.

  

---

  

### 2. State Management and Data Flow

  

- **State Variables**:

- `listID`: Stores the user's input for the Twitter List ID.

- `minLikes`: Stores the user's input for the minimum number of likes.

- `timePeriod`: Stores the selected time period from the dropdown.

- `startDate`, `endDate`: Computed from `timePeriod`.

- `tweets`: An array to store fetched tweets.

- `sortColumn`: The column currently used for sorting.

- `sortDirection`: The direction of sorting (`asc` or `desc`).

  

- **Data Flow**:

1. User inputs are captured and stored in state variables.

2. Upon clicking the "Search" button, the application:

- Converts `timePeriod` to `startDate` and `endDate`.

- Constructs a search filter.

- Fetches tweets using the Rettiwt API.

- Updates the `tweets` array.

3. The `tweets` array is passed to the `Table` component for rendering.

4. Sorting preferences are managed via `sortColumn` and `sortDirection`, affecting how the `tweets` array is displayed.

5. The "Export to CSV" button uses the `tweets` array to generate and download a CSV file.

  

---

  

### 3. API Integration with Rettiwt

  

- **Authentication**:

- The Twitter API key from the `.env` file is used to authenticate requests.

- **Search Filter Construction**:

- The filter includes `listID`, `minLikes`, `startDate`, and `endDate`.

- Ensure proper encoding and parameter formatting as per Rettiwt API documentation.

- **Error Handling**:

- Implement try-catch blocks to handle API errors.

- Display user-friendly error messages in case of failures.

  

---

  

### 4. Styling and Responsiveness

  

- **Tailwind CSS**:

- Use Tailwind CSS for rapid and consistent styling across components.

- Define custom configurations in `tailwind.config.ts` if necessary.

- **Responsive Design**:

- Ensure the application is responsive and works well on various screen sizes.

- Use Tailwind's responsive utilities to adjust layouts.

  

---

  

### 5. Icons and Visual Enhancements

  

- **Lucide Icons**:

- Use Lucide Icons for visual indicators, such as:

- Arrow icons for sorting directions.

- Icons in buttons if applicable.

- **Implementation**:

- Import necessary icons and include them in the relevant components.

  

---

  

### 6. Utility Functions (`lib/utils.ts`)

  

- **exportToCSV Function**:

- Converts an array of tweet objects into CSV format.

- Initiates the download of the CSV file.

- **Date Utilities**:

- Functions to format dates as needed for display or processing.

- **Data Sorting**:

- Implement generic sorting functions that can be applied to the `tweets` array.

  

---

  

## Environment Variables (`.env`)

  

- **Variables**:

- `TWITTER_API_KEY`: Your Twitter API key for authenticating requests via Rettiwt.

- **Usage**:

- Load environment variables securely without exposing them in the client-side code.

- Use Next.js environment variable conventions (e.g., prefix with `NEXT_PUBLIC_` if needed on the client side).

  

---

  

## Development and Build Scripts (`package.json`)

  

- **Scripts**:

- `"dev"`: Runs the application in development mode.

- `"build"`: Builds the application for production.

- `"start"`: Starts the production build.

- **Dependencies**:

- List all necessary dependencies, such as React, Next.js, Tailwind CSS, Shadcn UI components, Lucide Icons, and Rettiwt API library.

- **DevDependencies**:

- Include development tools like TypeScript, PostCSS, and any linters or formatters.

  

---

  

## Configuration Files

  

### `next.config.mjs`

  

- **Purpose**: Configure Next.js-specific settings.

- **Configurations**:

- Enable TypeScript support.

- Configure environment variables.

- Set up any necessary build-time plugins.

  

### `tailwind.config.ts`

  

- **Purpose**: Customize Tailwind CSS settings.

- **Configurations**:

- Define custom color palettes, spacing, and typography if needed.

- Configure PurgeCSS to remove unused styles in production builds.

  

### `postcss.config.mjs`

  

- **Purpose**: Configure PostCSS for processing CSS.

- **Configurations**:

- Include `tailwindcss` and `autoprefixer` plugins.

  

### `tsconfig.json`

  

- **Purpose**: TypeScript compiler configuration.

- **Configurations**:

- Specify compiler options like `strict`, `