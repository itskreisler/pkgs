export interface PersistentStorage {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string, ttl?: number) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
  getRawStore: () => any | Promise<any>;
}
