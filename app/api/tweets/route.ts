import { NextResponse } from 'next/server';
import { Rettiwt, Tweet, TweetFilter } from 'rettiwt-api';


export async function POST(request: Request) {
  const { listID, minLikes, startDate, endDate } = await request.json();

  if (!process.env.TWITTER_API_KEY) {
    return NextResponse.json({ error: 'Twitter API key is not set' }, { status: 500 });
  }

  const rettiwt = new Rettiwt({ apiKey: process.env.TWITTER_API_KEY });

  const filter: TweetFilter = {
    list: listID,
    minLikes: parseInt(minLikes),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    replies: false,
  };

  try {
    let nextData = '';
    const tweetsList: Tweet[] = [];
    while (tweetsList.length < 20) {
      const tweets = await rettiwt.tweet.search(filter, 20, nextData);
      nextData = tweets.next.value;
      tweetsList.push(...tweets.list);
      if (tweets.next.value === null || tweets.list.length === 0) {
        break;
      }
    }
    console.log(tweetsList);
    return NextResponse.json({ tweets: tweetsList });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 });
  }
}