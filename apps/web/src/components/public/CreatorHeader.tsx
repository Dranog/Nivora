/**
 * CreatorHeader Component (F9)
 * Public creator profile header
 */

'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, DollarSign } from 'lucide-react';

interface CreatorHeaderProps {
  name: string;
  handle: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  stats?: {
    followers?: number;
    posts?: number;
    monthlyRevenue?: number;
  };
}

export function CreatorHeader({
  name,
  handle,
  bio,
  avatar,
  coverImage,
  stats = {},
}: CreatorHeaderProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full" data-testid="creator-header">
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 w-full md:h-64">
          <Image
            src={coverImage}
            alt={`${name}'s cover`}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Profile Section */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar */}
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-3xl">{getInitials(name)}</AvatarFallback>
          </Avatar>

          {/* Name & Handle */}
          <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-lg text-muted-foreground">@{handle}</p>
          </div>

          {/* CTA Button */}
          <Button size="lg" className="mt-4 sm:mt-0" data-testid="view-offers-btn">
            View Offers
          </Button>
        </div>

        {/* Bio */}
        {bio && (
          <p className="mb-6 text-center text-muted-foreground sm:text-left" data-testid="creator-bio">
            {bio}
          </p>
        )}

        {/* Stats */}
        {(stats.followers || stats.posts || stats.monthlyRevenue) && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="creator-stats">
            {stats.followers !== undefined && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.followers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.posts !== undefined && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.posts}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.monthlyRevenue !== undefined && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
