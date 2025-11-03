'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import type { UsersQuery, UserStatus, UserSortBy, SortOrder, Role } from '@/types/users';

interface UserFiltersProps {
  filters: UsersQuery;
  onFiltersChange: (filters: UsersQuery) => void;
  onReset: () => void;
}

export function UserFilters({ filters, onFiltersChange, onReset }: UserFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // Debounced search would be better in production
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      role: value === 'all' ? undefined : (value as Role),
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as UserStatus),
      page: 1,
    });
  };

  const handleVerifiedChange = (value: string) => {
    onFiltersChange({
      ...filters,
      verified: value === 'all' ? undefined : value === 'verified',
      page: 1,
    });
  };

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as UserSortBy,
      page: 1,
    });
  };

  const handleSortOrderChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortOrder: value as SortOrder,
      page: 1,
    });
  };

  const activeFiltersCount =
    (filters.role ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.verified !== undefined ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by username, email, or name..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchValue && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Role Filter */}
        <Select value={filters.role || 'all'} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="CREATOR">Creators</SelectItem>
            <SelectItem value="FAN">Fans</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
            <SelectItem value="SUPPORT">Support</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>

        {/* Verified Filter */}
        <Select
          value={
            filters.verified === undefined
              ? 'all'
              : filters.verified
                ? 'verified'
                : 'unverified'
          }
          onValueChange={handleVerifiedChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={handleSortByChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Joined</SelectItem>
            <SelectItem value="username">Username</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={handleSortOrderChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filters Count & Reset */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary">
              <Filter className="mr-1 h-3 w-3" />
              {activeFiltersCount} active
            </Badge>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
