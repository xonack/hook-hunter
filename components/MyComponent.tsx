import { useState, useEffect } from 'react'
import { Tweet } from 'react-tweet/api'
import {
  type TwitterComponents,
  TweetContainer,
  TweetHeader,
  TweetInReplyTo,
  TweetBody,
  TweetMedia,
  TweetInfo,
  QuotedTweet,
  enrichTweet,
  TweetSkeleton,
  TweetNotFound
} from 'react-tweet'

type MyComponentProps = {
  id: string
  components?: TwitterComponents
  fetchOptions?: RequestInit
  onError?: (error: Error) => Error
}

const MyTweetContent = ({ tweet, components }: { tweet: Tweet; components?: TwitterComponents }) => {
  const enrichedTweet = enrichTweet(tweet)
  return (
    <TweetContainer>
      <TweetHeader tweet={enrichedTweet} components={components} />
      {enrichedTweet.in_reply_to_status_id_str && <TweetInReplyTo tweet={enrichedTweet} />}
      <TweetBody tweet={enrichedTweet} />
      {enrichedTweet.mediaDetails?.length ? (
        <TweetMedia tweet={enrichedTweet} components={components} />
      ) : null}
      {enrichedTweet.quoted_tweet && <QuotedTweet tweet={enrichedTweet.quoted_tweet} />}
      <TweetInfo tweet={enrichedTweet} />
    </TweetContainer>
  )
}

export const MyComponent = ({
  id,
  components,
  fetchOptions,
  onError,
}: MyComponentProps) => {
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTweet = async () => {
      try {
        const response = await fetch('/api/fetch-react-tweet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, fetchOptions }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fetchedTweet = await response.json();
        setTweet(fetchedTweet);
      } catch (err) {
        if (onError) {
          setError(onError(err instanceof Error ? err : new Error(String(err))));
        } else {
          console.error(err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTweet();
  }, [id, fetchOptions, onError]);

  if (loading) {
    return <TweetSkeleton />;
  }

  if (!tweet) {
    const NotFound = components?.TweetNotFound || TweetNotFound;
    return <NotFound error={error} />;
  }

  return <MyTweetContent tweet={tweet} components={components} />;
}
