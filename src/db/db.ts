import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DayRecord, Dish, House, Settings } from '../domain/types';

export const DB_NAME = 'que-sopem';
export const DB_VERSION = 1;

export interface AppSchema extends DBSchema {
  dishes: { key: string; value: Dish; indexes: { byCategory: string } };
  days: { key: string; value: DayRecord };
  meta: { key: 'house' | 'settings'; value: House | Settings };
}

export type AppDb = IDBPDatabase<AppSchema>;

export function openAppDb(name: string = DB_NAME): Promise<AppDb> {
  return openDB<AppSchema>(name, DB_VERSION, {
    upgrade(db) {
      const dishes = db.createObjectStore('dishes', { keyPath: 'id' });
      dishes.createIndex('byCategory', 'category');
      db.createObjectStore('days', { keyPath: 'date' });
      db.createObjectStore('meta');
    },
  });
}
