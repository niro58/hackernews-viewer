import { getContext, setContext } from "svelte";
import type { HnItem, StoryFilter } from "../types";


const Errors = Object.freeze({
  NO_DB: "No database",
  TRANSACTION_FAILED: "Transaction failed",
});

export type LocalStorage = {
  topStoriesUpdatedAt: Date,
  topStories: number[]
}
export type SyncStorage = {
  storyFilter: StoryFilter
  blockedKeywords: string[]
  bookmarkedStories: number[]
}
export const blankLocalStorage: LocalStorage = {
  topStoriesUpdatedAt: new Date("1970, 1, 1"),
  topStories: []
}

export const blankSyncStorage: SyncStorage = {
  storyFilter: "popular",
  blockedKeywords: [],
  bookmarkedStories: []
}

export class StorageController {
  localStorage: LocalStorage = $state(blankLocalStorage)
  syncStorage: SyncStorage = $state(blankSyncStorage)

  isLoading: boolean = $state(true)

  constructor() {
    Promise.all([this.loadLocal()
      , this.loadSync()]).then((res) => {
        this.localStorage = res[0]
        this.syncStorage = res[1]
        this.isLoading = false;
      })


  }
  mapValueToStorage(value: LocalStorage[keyof LocalStorage] | SyncStorage[keyof SyncStorage]): string | object {
    let v: ReturnType<typeof this.mapValueToStorage>;

    if (value instanceof Date) {
      v = value.toISOString()
    } else {
      v = value;
    }

    return v
  }
  mapStorageToValue(value: any) {
    if (typeof value === "object") {
      return Object.values(value);
    }
    return value;
  }
  setLocal(key: keyof LocalStorage, value: LocalStorage[keyof LocalStorage]) {
    const valueResult = this.mapValueToStorage(value);

    const storage = this.localStorage || blankLocalStorage;
    if (key === 'topStories') {
      storage.topStoriesUpdatedAt = new Date();
    }
    const obj = {
      ...storage,
      [key]: valueResult
    }


    chrome.storage.local.set(obj)
  }
  setSync(key: keyof SyncStorage, value: SyncStorage[keyof SyncStorage]) {
    const valueResult = this.mapValueToStorage(value);

    const storage = this.syncStorage || blankSyncStorage;

    const obj = {
      ...storage,
      [key]: valueResult
    }
    chrome.storage.sync.set(obj)
  }

  private async loadSync(): Promise<SyncStorage> {
    const res = await chrome.storage.sync.get()
    if (JSON.stringify(res) === "{}") {
      return blankSyncStorage;
    }

    let cleanedRes: any = {}
    for (const [key, value] of Object.entries(res)) {
      cleanedRes[key] = this.mapStorageToValue(value);
    }
    return cleanedRes as SyncStorage
  }
  private async loadLocal(): Promise<LocalStorage> {
    const res = await chrome.storage.local.get()
    if (JSON.stringify(res) === "{}") {
      return blankLocalStorage;
    }

    let cleanedRes: any = {}
    for (const [key, value] of Object.entries(res)) {
      cleanedRes[key] = this.mapStorageToValue(value);
    }
    return cleanedRes as LocalStorage
  }

}