import React from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import { HeartIcon, HeartFilledIcon } from '@radix-ui/react-icons';
import { User } from '@/lib/db';
import { useUserStore } from '@/store/userStore';

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { favorites, toggleFavorite } = useUserStore();
  const isFavorite = favorites.has(user.id);

  const handleFavoriteClick = async () => {
    await toggleFavorite(user.id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
      {/* Header with Avatar and Favorite */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Avatar.Root className="inline-flex h-12 w-12 select-none items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <Avatar.Image
              className="h-full w-full rounded-full object-cover"
              src={user.picture.medium}
              alt={`${user.name.first} ${user.name.last}`}
            />
            <Avatar.Fallback className="text-violet11 leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium">
              {user.name.first[0]}{user.name.last[0]}
            </Avatar.Fallback>
          </Avatar.Root>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user.name.title} {user.name.first} {user.name.last}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{user.login.username}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? (
            <HeartFilledIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
          )}
        </button>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400 w-12">Email:</span>
          <span className="text-gray-900 dark:text-white truncate">{user.email}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400 w-12">Phone:</span>
          <span className="text-gray-900 dark:text-white">{user.phone}</span>
        </div>
      </div>

      {/* Location */}
      <div className="text-sm text-gray-600 dark:text-gray-300">
        <p className="truncate">
          {user.location.street.number} {user.location.street.name}
        </p>
        <p className="truncate">
          {user.location.city}, {user.location.state} {user.location.postcode}
        </p>
        <p className="truncate">{user.location.country}</p>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Age: {user.dob.age}</span>
          <span className="uppercase">{user.nat}</span>
        </div>
      </div>
    </div>
  );
}; 