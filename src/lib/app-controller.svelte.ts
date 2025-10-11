import { getContext, setContext } from "svelte";
import { getStorageController } from "./storage-controller.svelte";
import type { HnItem } from "./types";
import { hnGetBulkItems, hnGetTopStories } from "./api";

class AppController {
  storageController = getStorageController();
  posts: HnItem[] = $state([])
  constructor() {
    this.storageController.getLocal().then((res) => {
      if (!res) {
        this.refreshPosts();
        return
      }

      this.posts.push(...Object.values(res.posts));
    })
  }
  async refreshPosts() {
    const topStoriesIds = await hnGetTopStories()
    if (topStoriesIds.type === 'FAILURE') {
      return topStoriesIds
    }

    for await (const val of hnGetBulkItems(topStoriesIds.data)) {
      if (val.type === 'SUCCESS') {
        this.posts.push(val.data)
      }
    }

    console.log("Posts result", this.posts)
    this.storageController.setLocal("posts", this.posts)

  }
}

const APP_SYMBOL = Symbol("APP_CONTROLLER");

export function setApp() {
  return setContext(APP_SYMBOL, new AppController());
}
export function getApp() {
  return getContext<ReturnType<typeof setApp>>(APP_SYMBOL);
}
