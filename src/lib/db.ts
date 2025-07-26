import Dexie, { Table } from 'dexie';

export interface User {
  id: string;
  gender: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string | number;
    coordinates: {
      latitude: string;
      longitude: string;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  login: {
    uuid: string;
    username: string;
    password: string;
    salt: string;
    md5: string;
    sha1: string;
    sha256: string;
  };
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

export interface UserFavorite {
  id: string;
  userId: string;
  createdAt: Date;
}

export interface CacheMetadata {
  id: string;
  page: number;
  lastFetched: Date;
  totalResults: number;
}

export class AppDatabase extends Dexie {
  users!: Table<User>;
  favorites!: Table<UserFavorite>;
  cache!: Table<CacheMetadata>;

  constructor() {
    super('SynonymTestDatabase');
    this.version(1).stores({
      users: 'id, email, gender, nat, name.first, name.last',
      favorites: 'id, userId, createdAt',
      cache: 'id, page, lastFetched'
    });
  }
}

export const db = new AppDatabase(); 