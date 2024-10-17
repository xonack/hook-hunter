import { NextResponse } from 'next/server';
import { Rettiwt, Tweet, TweetFilter, ESearchResultType } from 'rettiwt-api';


export async function POST(request: Request) {
  const { listID, minLikes, startDate, endDate, words } = await request.json();

  console.log(listID, minLikes, startDate, endDate, words);

  if (!process.env.TWITTER_API_KEY) {
    return NextResponse.json({ error: 'Twitter API key is not set' }, { status: 500 });
  }

  const rettiwt = new Rettiwt({
      apiKey: process.env.TWITTER_API_KEY,
  });

  // if default serach is used (listId is empty and words is empty) use Great Creator listId
  const listIDValue = (listID === '' && words.length === 0) ? '1782987441475039605' : listID;

  const filter: TweetFilter = {
    ...(listIDValue !== '' && { list: listIDValue }),
    ...(minLikes !== '' && { minLikes: parseInt(minLikes) }),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    replies: false,
    includeWords: words,
  };

  try {
    let nextData = '';
    const tweetsList: Tweet[] = [];
    while (tweetsList.length < 50) {
      try {
        const tweets = await rettiwt.tweet.search(filter, 20, nextData, ESearchResultType.TOP);
        nextData = tweets.next.value;
        tweetsList.push(...tweets.list);
        if (tweets.next.value === null || tweets.list.length === 0) {
          break;
        }
      } catch (searchError) {
        console.error('Error in tweet search:', searchError);
        break;
      }
    }
    console.log('Fetched tweets:', tweetsList.length);
    
    // Filter tweets based on minLikes
    const minLikesValue = minLikes === '' ? 0 : parseInt(minLikes);
    const filteredTweets = tweetsList.filter(tweet => tweet.likeCount >= minLikesValue);
    console.log('Filtered tweets:', filteredTweets.length);
    
    return NextResponse.json({ tweets: filteredTweets });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Error fetching tweets', error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'Error fetching tweets', error: 'Unknown error' }, { status: 500 });
    }
  }
}