import { getContext, setContext, untrack } from "svelte";
import type { HnItem, ResultClient, ResultFetch, StoryFilter } from "../types";
import { hnGetBulkItems, hnGetNewStories, hnGetTopStories } from "../api";
import { StorageController, type blankSyncStorage, type LocalStorage } from "./storage-controller.svelte";
import { StoryRepository } from "$lib/db/story-repository.svelte";
export class AppController {
  storyRepository;
  storageController = new StorageController();
  showSettings: boolean = $state(false);
  stories: ResultClient<HnItem[]> = $state({
    type: "NOT_ASKED"
  })
  selectedStoryIds: number[] = $derived.by(() => {
    switch (this.storageController.syncStorage.storyFilter) {
      case "best":
        return this.storageController.localStorage.bestStories
      case "new":
        return this.storageController.localStorage.newStories
      case "top":
        return this.storageController.localStorage.topStories
      case "bookmark":
        return this.storageController.syncStorage.bookmarkedStories
    }
  })
  totalCount: number = $derived(this.selectedStoryIds.length)
  latestUpdateAt: Date = $derived.by(() => {
    switch (this.storageController.syncStorage.storyFilter) {
      case "best":
        return this.storageController.localStorage.bestStoriesUpdatedAt
      case "new":
        return this.storageController.localStorage.newStoriesUpdatedAt
      case "top":
        return this.storageController.localStorage.topStoriesUpdatedAt
      case "bookmark":
        return new Date();
    }
  })
  blockedKeywordsLowercase: string[] = $derived(this.storageController.syncStorage.blockedKeywords.map((v) => (v.toLowerCase())))
  page: number = $state(0)
  LIMIT = 10
  REFRESH_INTERVAL = 360

  constructor(storyRepository: StoryRepository) {
    this.storyRepository = storyRepository
    $effect(() => {
      if (!this.storageController.isLoading) {
        untrack(() => {
          this.refresh();
        })
      }
    })
  }
  async filterStories(): Promise<ResultClient<HnItem[]>> {
    const storiesResult = await this.storyRepository.getMany(this.selectedStoryIds);

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
    const orderedStories = this.orderStories(
      this.selectedStoryIds,
      storiesResult.data
    )

    if (this.storageController.syncStorage.storyFilter !== 'bookmark') {
      const allowedStories: HnItem[] = [];
      orderedStories.forEach((story) => {
        const wholeText = story.title + " " + (story.text || "")
        const wordRegex = /[,.:;?!|"'(){}[\]\\<>\/&\-—–~*@#^%=+]/g;
        const words = wholeText
          .replace(wordRegex, " ")
          .split(/\s+/)
          .filter((w) => w !== "");

        let isValid = true;
        words.forEach((word) => {
          if (this.blockedKeywordsLowercase.includes(word.toLowerCase())) {
            isValid = false;
            return
          }
        })

        if (isValid) {
          allowedStories.push(story)
        }
      })
      console.log(allowedStories.length, orderedStories.length)
      return {
        type: "SUCCESS",
        data: allowedStories
      }
    }

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
    this.refresh()
  }
  async removeBlockedKeyword(key: string) {
    const keywords = [...this.storageController.syncStorage.blockedKeywords]
    const index = keywords.indexOf(key)

    if (index !== -1) {
      keywords.splice(index, 1)
      this.storageController.setSync(
        "blockedKeywords",
        keywords
      )
    }
    this.refresh()

  }

  async refresh(force?: true) {
    this.stories = {
      type: "LOADING"
    }

    const isDiffValid = (new Date().getTime() - this.latestUpdateAt.getTime()) > this.REFRESH_INTERVAL;


    if (force || isDiffValid) {
      const refreshRes = await this.refreshStories();
      if (refreshRes.type === 'FAILURE') {
        this.stories = refreshRes
      }
    }

    this.stories = await this.filterStories()
  }
  private async refreshStories(): Promise<ResultFetch<undefined>> {
    let storyIds: ResultFetch<number[]>;
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
      case "bookmark":
        storyIds = {
          type: "SUCCESS",
          data: this.storageController.syncStorage.bookmarkedStories
        }
    }

    if (storyIds.type === 'FAILURE') {
      return storyIds
    }

    if (storeKey) {
      this.storageController.setLocal(storeKey, storyIds.data)
    }

    return {
      type: "SUCCESS",
      data: undefined
    }
  }

  async toggleBookmarkStory(id: number) {
    const index = this.storageController.syncStorage.bookmarkedStories.indexOf(id)
    const stories = [...this.storageController.syncStorage.bookmarkedStories]
    if (index !== -1) {
      stories.splice(index, 1);
      this.storageController.setSync("bookmarkedStories", stories)
    } else {
      this.storageController.setSync("bookmarkedStories",
        [...this.storageController.syncStorage.bookmarkedStories, id]
      )
    }
  }

}

const APP_SYMBOL = Symbol("APP_CONTROLLER");
export function setApp(storyRepository: StoryRepository) {
  return setContext(APP_SYMBOL, new AppController(storyRepository));
}
export function getApp() {
  return getContext<ReturnType<typeof setApp>>(APP_SYMBOL);
}
