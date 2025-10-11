import { getContext, setContext } from "svelte";
import type { HnItem } from "./types";


const Errors = Object.freeze({
  NO_DB: "No database",
  TRANSACTION_FAILED: "Transaction failed",
});

export type LocalStorage = {
  postsUpdatedAt: Date,
  posts: Record<number, HnItem>
}
export type SyncStorage = {

}
const blankLocalStorage: LocalStorage = {
  postsUpdatedAt: new Date("1970, 1, 1"),
  posts: []
}

const blankSyncStorage: SyncStorage = {}

export class StorageController {
  private localStorage: LocalStorage | undefined
  private syncStorage: SyncStorage | undefined

  mapValueToStorage(value: LocalStorage[keyof LocalStorage] | SyncStorage[keyof SyncStorage]): string | object {
    let v: ReturnType<typeof this.mapValueToStorage>;

    if (value instanceof Date) {
      v = value.toISOString()
    } else {
      v = value;
    }

    return v
  }
  setLocal(key: keyof LocalStorage, value: LocalStorage[keyof LocalStorage]) {
    const valueResult = this.mapValueToStorage(value);

    const storage = this.localStorage || blankLocalStorage;
    if (key === 'posts') {
      storage.postsUpdatedAt = new Date();
    }
    const obj = {
      ...storage,
      [key]: valueResult
    }

    console.log("Setting local storage to ", key, value, obj)

    chrome.storage.local.set(obj)
  }
  setSync(key: keyof LocalStorage, value: LocalStorage[keyof LocalStorage]) {
    const valueResult = this.mapValueToStorage(value);

    const storage = this.syncStorage || blankSyncStorage;

    const obj = {
      ...storage,
      [key]: valueResult
    }
    chrome.storage.sync.set(obj)
  }
  async getSync(): Promise<SyncStorage | undefined> {
    const res = await chrome.storage.sync.get()
    if (JSON.stringify(res) === "{}") {
      return undefined;
    }
    console.log("Get sync storage result", res);
    this.syncStorage = res as LocalStorage;
    return this.syncStorage
  }
  async getLocal(): Promise<LocalStorage | undefined> {
    const res = await chrome.storage.local.get()
    if (JSON.stringify(res) === "{}") {
      return undefined;
    }
    console.log("Get local storage result", res);

    this.localStorage = res as LocalStorage;
    return this.localStorage
  }

}

const STORAGE_CONTROLLER_SYMBOL = Symbol("WEBSITE_REPOSITORY");

export function setStorageController() {
  return setContext(STORAGE_CONTROLLER_SYMBOL, new StorageController());
}
export function getStorageController() {
  return getContext<ReturnType<typeof setStorageController>>(
    STORAGE_CONTROLLER_SYMBOL
  );
}
