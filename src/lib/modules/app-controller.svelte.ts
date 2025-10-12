import { getContext, setContext } from "svelte";
import type { HnItem, ResultClient, ResultFetch } from "../types";
import { hnGetBulkItems, hnGetTopStories } from "../api";
import { blankLocalStorage, StorageController } from "./storage-controller.svelte";
import { StoryRepository } from "$lib/db/story-repository.svelte";
export class AppController {
  storyRepository = new StoryRepository();
  storageController = new StorageController();
  showSettings: boolean = $state(false);
  stories: ResultClient<HnItem[]> = $state({
    type: "NOT_ASKED"
  })

  page: number = $state(0)
  LIMIT = 10

  async filterStories() {
    await this.filterTopStories();
  }
  private async filterTopStories() {
    const topStories = this.storageController.localStorage.topStories;
    const topStoriesResult = await this.storyRepository.getMany(topStories);
    console.log(topStoriesResult)
    if (topStoriesResult.type === 'FAILURE') {
      this.stories = topStoriesResult
      return;
    }

    const stories = Object.values(topStoriesResult.data).filter((v) => v !== undefined);
    if (stories.length !== Object.keys(topStoriesResult.data).length) {
      const newTopStories = await this.refreshTopStories();
      this.stories = newTopStories
      return
    }

    this.stories = {
      type: "SUCCESS",
      data: stories
    }
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
  async refreshStories() {
    await this.refreshTopStories();
    await this.filterStories()
  }
  private async refreshTopStories(): Promise<ResultFetch<HnItem[]>> {
    this.stories = { type: "LOADING" };
    console.log("REFRESHING")
    const topStoriesIds = await hnGetTopStories()
    if (topStoriesIds.type === 'FAILURE') {
      return topStoriesIds
    }
    console.log("TOP STORIES", topStoriesIds)

    let stories: HnItem[] = [];

    const dbItems = await this.storyRepository.getMany(topStoriesIds.data);
    console.log(dbItems);
    if (dbItems.type === 'FAILURE') {
      return dbItems
    }
    stories.push(...Object.values(dbItems.data).filter((v) => v !== undefined));

    const missingItems: number[] = []
    Object.entries(dbItems.data).forEach(([id, value]) => {
      if (!value) {
        missingItems.push(parseInt(id))
      }
    })
    console.log("Gotta create", missingItems);
    for await (const val of hnGetBulkItems(missingItems)) {
      if (val.type === 'SUCCESS') {
        stories.push(val.data)
        await this.storyRepository.create(val.data);
      }
    }

    this.storageController.setLocal("topStories", topStoriesIds.data)

    return {
      type: "SUCCESS",
      data: stories,
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
