import React, { useState } from 'react';
import Link from 'next/link';
import { Tweet } from 'rettiwt-api';
import { Tweet as ReactTweet } from 'react-tweet';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, MessageCircle, Repeat, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyComponent } from './MyComponent';

interface TweetTableProps {
  tweets: Tweet[];
}

type SortKey = 'fullText' | 'tweetBy.userName' | 'createdAt' | 'likeCount' | 'retweetCount' | 'viewCount' | 'replyCount';
type SortOrder = 'asc' | 'desc';

type SortableValue = string | number | Date;

export function TweetTable({ tweets }: TweetTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedTweets = [...tweets].sort((a, b) => {
    let aValue: SortableValue;
    let bValue: SortableValue;

    if (sortKey === 'tweetBy.userName') {
      aValue = a.tweetBy.userName;
      bValue = b.tweetBy.userName;
    } else if (sortKey === 'createdAt') {
      aValue = new Date(a.createdAt);
      bValue = new Date(b.createdAt);
    } else {
      aValue = a[sortKey];
      bValue = b[sortKey];
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Set to descending on first click of a new column
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (columnKey !== sortKey) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">
            <div className="text-center">Tweet</div>
          </TableHead>
          <TableHead className="w-10">
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => handleSort('likeCount')}>
                Likes <SortIcon columnKey="likeCount" />
              </Button>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => handleSort('retweetCount')}>
                Retweets <SortIcon columnKey="retweetCount" />
              </Button>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => handleSort('viewCount')}>
                Views <SortIcon columnKey="viewCount" />
              </Button>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => handleSort('replyCount')}>
                Comments <SortIcon columnKey="replyCount" />
              </Button>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTweets.map((tweet) => (
          <TableRow key={tweet.id}>
            <TableCell className="font-medium w-[300px]">
              <div className="flex justify-center">
                <div className="w-full max-w-[300px]">
                  <MyComponent id={tweet.id} />
                </div>
              </div>
            </TableCell>
            <TableCell className="text-center w-10">
              <div className="flex flex-col items-center">
                <Heart className="h-4 w-4 text-red-500" />
                <span>{tweet.likeCount}</span>
              </div>
            </TableCell>
            <TableCell className="text-center w-20">
              <div className="flex flex-col items-center">
                <Repeat className="h-4 w-4 text-green-500" />
                <span>{tweet.retweetCount}</span>
              </div>
            </TableCell>
            <TableCell className="text-center w-20">
              <div className="flex flex-col items-center">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>{tweet.viewCount}</span>
              </div>
            </TableCell>
            <TableCell className="text-center w-20">
              <div className="flex flex-col items-center">
                <MessageCircle className="h-4 w-4 text-purple-500" />
                <span>{tweet.replyCount}</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
