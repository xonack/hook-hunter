import { NextResponse } from 'next/server';
import { getTweet } from 'react-tweet/api';

export async function POST(request: Request) {
    const { id } = await request.json();

    const tweet = await getTweet(id);

    return NextResponse.json(tweet);
}