<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Bookmark, ChevronLeft, ChevronRight } from "@lucide/svelte";
  import {
    setApp,
    type AppController,
  } from "$lib/modules/app-controller.svelte";
  import Header from "$lib/components/header.svelte";
  import { storyFilter } from "$lib/types";
  import { getTimeAgo } from "$lib/utils";
  import Settings from "$lib/components/settings.svelte";
  import { fly } from "svelte/transition";
  import type { StoryRepository } from "$lib/db/story-repository.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  const { storyRepository }: { storyRepository: StoryRepository } = $props();

  const app = setApp(storyRepository);
</script>

<Header />

<Settings />
<div class="flex items-center gap-1 px-4 py-2 border-b border-border bg-card">
  {#each storyFilter as filterType (filterType)}
    <Button
      variant={app.storageController.syncStorage.storyFilter === filterType
        ? "default"
        : "ghost"}
      size="sm"
      onclick={() => {
        app.storageController.setSync("storyFilter", filterType);
        app.refresh();
      }}
      class="h-7 text-xs capitalize flex-1"
    >
      {filterType}
    </Button>
  {/each}
</div>

<div class="flex-1 overflow-y-auto">
  {#if app.stories.type === "SUCCESS" && app.stories.data.length === 0}
    <div
      class="flex items-center justify-center h-full text-muted-foreground text-sm"
    >
      No stories to display
    </div>
  {:else if app.stories.type === "SUCCESS"}
    <ScrollArea class="h-full w-full rounded-md border p-4" type="always">
      {#each app.stories.data.slice(app.page * app.LIMIT, (app.page + 1) * app.LIMIT) as story, index (story.id)}
        <a
          href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
          target="_blank"
        >
          <div
            class="px-4 py-3 hover:bg-accent/50 transition-colors"
            in:fly={{
              duration: 300,
              x: 20,
              delay: index * 40,
            }}
            out:fly={{
              duration: 300,
              x: 20,
            }}
          >
            <div class="flex gap-3">
              <div class="flex-1 min-w-0">
                <h3
                  class="text-sm font-medium text-foreground leading-snug mb-1 text-pretty"
                >
                  {story.title}
                </h3>
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground font-mono"
                >
                  <div>
                    <span class="font-mono">{story.by}</span>
                    <span>•</span>
                  </div>
                  <div>
                    <span>{getTimeAgo(story.time)}</span>
                    <span>•</span>
                  </div>

                  <div>
                    <span>{story.type} </span>
                    <span>•</span>
                  </div>
                  <div>
                    <span>{story.score} pts</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 shrink-0"
                onclick={(e) => {
                  e.preventDefault();
                  app.toggleBookmarkStory(story.id);
                }}
              >
                <Bookmark
                  class="h-4 w-4 {app.storageController.syncStorage.bookmarkedStories.includes(
                    story.id
                  )
                    ? 'fill-primary text-primary'
                    : ''}"
                />
              </Button>
            </div>
          </div>
        </a>
      {/each}
    </ScrollArea>
  {/if}
</div>

<div class="px-4 py-2 border-t border-border bg-card">
  <div class="flex items-center justify-between text-xs text-muted-foreground">
    <div class="flex flex-row items-center gap-2 justify-center font-mono">
      <span
        >{app.stories.type === "SUCCESS" ? app.stories.data.length : "-"} stories</span
      >
      <span>•</span>
      <span
        >{app.storageController.syncStorage.bookmarkedStories.length} saved</span
      >
      <span>•</span>
      <span>page {app.page + 1}</span>
    </div>
    <div class="flex flex-row gap-2">
      <Button
        size="icon"
        variant="outline"
        disabled={app.page === 0}
        onclick={() => {
          app.page -= 1;
        }}
      >
        <ChevronLeft />
      </Button>
      <Button
        size="icon"
        variant="outline"
        disabled={app.stories.type === "SUCCESS"
          ? (app.page + 1) * app.LIMIT > app.stories.data.length
          : true}
        onclick={() => {
          app.page += 1;
        }}
      >
        <ChevronRight />
      </Button>
    </div>
  </div>
</div>
