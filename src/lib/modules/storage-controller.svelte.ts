import type { StoryFilter } from "../types";


const Errors = Object.freeze({
  NO_DB: "No database",
  TRANSACTION_FAILED: "Transaction failed",
});

export type LocalStorage = {
  topStoriesUpdatedAt: Date,
  topStories: number[]
  newStoriesUpdatedAt: Date,
  newStories: number[],
  bestStoriesUpdatedAt: Date,
  bestStories: number[]
}
export type SyncStorage = {
  storyFilter: StoryFilter
  blockedKeywords: string[]
  bookmarkedStories: number[]
}
export const blankLocalStorage: LocalStorage = {
  topStoriesUpdatedAt: new Date("1970, 1, 1"),
  topStories: [],
  newStoriesUpdatedAt: new Date("1970, 1, 1"),
  newStories: [],
  bestStoriesUpdatedAt: new Date("1970, 1, 1"),
  bestStories: []
}

export const blankSyncStorage: SyncStorage = {
  storyFilter: "top",
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
  mapValueToStorage(value: LocalStorage[keyof LocalStorage] | SyncStorage[keyof SyncStorage]): string | object | undefined {
    let v: ReturnType<typeof this.mapValueToStorage>;

    if (value instanceof Date) {
      v = value.toISOString()
    } else if (value) {
      v = value;
    } else {
      v = undefined
    }
    return v
  }
  mapStorageToValue(value: any) {
    if (typeof value === "object") {
      return Object.values(value);
    }
    if (Array.isArray(value)) {
      return value;
    }
    const valDate = new Date(value)
    if (valDate instanceof Date && !isNaN(valDate.getTime())) {
      return new Date(value)
    }
    return value;
  }
  setLocal(key: keyof LocalStorage, value: LocalStorage[keyof LocalStorage]) {
    const store = this.localStorage;
    if (key === 'topStories') {
      store.topStoriesUpdatedAt = new Date()
    }
    else if (key === "newStories") {
      store.newStoriesUpdatedAt = new Date()
    }
    else if (key === 'bestStories') {
      store.bestStoriesUpdatedAt = new Date()
    }

    const storeMapped: any = {}
    Object.entries(store).forEach(([k, v]) => {
      storeMapped[k] = this.mapValueToStorage(v);
    })

    const obj: any = {
      ...storeMapped,
      [key]: this.mapValueToStorage(value)
    }

    chrome.storage.local.set(obj)

    this.localStorage = {
      ...this.localStorage,
      [key]: value
    }
  }
  setSync(key: keyof SyncStorage, value: SyncStorage[keyof SyncStorage]) {
    const store = this.syncStorage;

    const storeMapped: any = {}
    Object.entries(store).forEach(([k, v]) => {
      storeMapped[k] = this.mapValueToStorage(v);
    })

    const obj: any = {
      ...storeMapped,
      [key]: this.mapValueToStorage(value)
    }
    chrome.storage.sync.set(obj)

    this.syncStorage = {
      ...this.syncStorage,
      [key]: value
    }
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