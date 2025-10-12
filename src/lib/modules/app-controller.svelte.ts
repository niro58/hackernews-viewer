import { getContext, setContext } from "svelte";
import type { HnItem, ResultClient, ResultFetch, StoryFilter } from "../types";
import { hnGetBulkItems, hnGetNewStories, hnGetTopStories } from "../api";
import { blankLocalStorage, StorageController, type blankSyncStorage, type LocalStorage } from "./storage-controller.svelte";
import { StoryRepository } from "$lib/db/story-repository.svelte";
export class AppController {
  storyRepository = new StoryRepository();
  storageController = new StorageController();
  showSettings: boolean = $state(false);
  stories: ResultClient<HnItem[]> = $state({
    type: "NOT_ASKED"
  })
  totalCount: number = $derived.by(() => {
    switch (this.storageController.syncStorage.storyFilter) {
      case "best":
        return this.storageController.localStorage.bestStories.length

      case "new":
        return this.storageController.localStorage.newStories.length

      case "top":
        return this.storageController.localStorage.topStories.length

    }
  })
  page: number = $state(0)
  LIMIT = 10

  constructor() {
    this.refresh();
  }
  async filterStories(): Promise<ResultClient<HnItem[]>> {
    let storyIds: number[] = [];
    switch (this.storageController.syncStorage.storyFilter) {
      case "best":
        storyIds = this.storageController.localStorage.bestStories
        break;
      case "new":
        storyIds = this.storageController.localStorage.newStories
        break;
      case "top":
        storyIds = this.storageController.localStorage.topStories
        break;
    }
    console.log("getting many ids", storyIds)
    const storiesResult = await this.storyRepository.getMany(storyIds);

    if (storiesResult.type === 'FAILURE') {
      return storiesResult
    }

    const missingItems: number[] = []
    Object.entries(storiesResult.data).forEach(([id, value]) => {
      if (!value) {
        missingItems.push(parseInt(id))
      }
    })

    for await (const val of hnGetBulkItems(missingItems)) {
      if (val.type === 'SUCCESS') {
        await this.storyRepository.create(val.data);
        storiesResult.data[val.data.id] = val.data;
      }
    }
    console.log("storyresult data", storiesResult.data);
    const orderedStories = this.orderStories(
      storyIds,
      storiesResult.data
    )
    console.log("ordered stories data", storiesResult.data);

    return {
      type: "SUCCESS",
      data: orderedStories
    }
  }

  orderStories(orderIds: number[], stories: Record<number, HnItem | undefined>): HnItem[] {
    const storiesOrdered: HnItem[] = [];
    orderIds.forEach((id) => {
      const item = stories[id];
      if (item) {
        storiesOrdered.push(item)
      }
    });
    return storiesOrdered
  }
  async addBlockedKeyword(keyword: string) {
    this.storageController.setSync(
      "blockedKeywords",
      [...this.storageController.syncStorage.blockedKeywords, keyword]
    )
  }
  async removeBlockedKeyword(key: string) {
    const index = this.storageController.syncStorage.blockedKeywords.indexOf(key)
    if (index) {
      this.storageController.syncStorage.blockedKeywords.splice(index, 1)
    }
  }

  async refresh() {
    this.stories = {
      type: "LOADING"
    }
    const refreshRes = await this.refreshStories();
    console.log("Refresh res", refreshRes)
    if (refreshRes.type === 'FAILURE') {
      this.stories = refreshRes
    }
    const filteredStories = await this.filterStories()
    console.log("Filtered stories", refreshRes)

    this.stories = filteredStories
  }
  private async refreshStories(): Promise<ResultFetch<undefined>> {
    let storyIds: ResultFetch<number[]> | undefined;
    let storeKey: keyof LocalStorage | undefined
    switch (this.storageController.syncStorage.storyFilter) {
      case "best":
        storyIds = await hnGetTopStories();
        storeKey = "bestStories"
        break;
      case "new":
        storyIds = await hnGetNewStories();
        storeKey = "newStories"
        break;
      case "top":
        storyIds = await hnGetNewStories();
        storeKey = "topStories"
        break;
    }

    if (storyIds.type === 'FAILURE') {
      return storyIds
    }
    if (!storeKey) {
      return {
        type: "FAILURE",
        error: "No key"
      }
    }

    this.storageController.setLocal(storeKey, storyIds.data)

    return {
      type: "SUCCESS",
      data: undefined
    }
  }

  async toggleBookmarkStory(id: number) {
    const index = this.storageController.syncStorage.bookmarkedStories.indexOf(id)
    if (index) {
      this.storageController.syncStorage.bookmarkedStories.splice(index, 1)
    } else {
      this.storageController.setSync("bookmarkedStories",
        [...this.storageController.syncStorage.bookmarkedStories, id]
      )
    }
  }

}

const APP_SYMBOL = Symbol("APP_CONTROLLER");
export function setApp() {
  return setContext(APP_SYMBOL, new AppController());
}
export function getApp() {
  return getContext<ReturnType<typeof setApp>>(APP_SYMBOL);
}
