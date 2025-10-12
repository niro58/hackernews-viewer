<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    RefreshCw,
    Bookmark,
    X,
    Plus,
    ChevronLeft,
    ChevronRight,
  } from "@lucide/svelte";
  import {
    setApp,
    type AppController,
  } from "$lib/modules/app-controller.svelte";
  import Header from "$lib/components/header.svelte";
  import { storyFilter } from "$lib/types";
  import { getTimeAgo } from "$lib/utils";
  import Settings from "$lib/components/settings.svelte";
  import { fly } from "svelte/transition";
  const { app }: { app: AppController } = $props();
  app.filterStories();
</script>

<div
  class="w-[450px] h-[500px] p-3 bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
>
  <Header />

  <Settings />

  <div class="flex items-center gap-1 px-4 py-2 border-b border-border bg-card">
    {#each storyFilter as filterType (filterType)}
      <Button
        variant={app.storageController.syncStorage.storyFilter === filterType
          ? "default"
          : "ghost"}
        size="sm"
        onclick={() => app.storageController.setSync("storyFilter", filterType)}
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
      <div class="divide-y divide-border">
        {#each app.stories.data.slice(app.page * app.LIMIT, (app.page + 1) * app.LIMIT) as story, index (story.id)}
          <div
            class="px-4 py-3 hover:bg-accent/50 transition-colors"
            in:fly={{
              duration: 300,
              x: 20,
              delay: index * 40,
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

                  <!-- <div>
                      <span>{story.comments} comments</span>
                      <span>•</span>
                    </div> -->
                  <div>
                    <span>{story.score} pts</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 shrink-0"
                onclick={() => app.toggleBookmarkStory(story.id)}
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
        {/each}
      </div>
    {/if}
  </div>

  <div class="px-4 py-2 border-t border-border bg-card">
    <div
      class="flex items-center justify-between text-xs text-muted-foreground"
    >
      <div class="flex flex-row items-center gap-2 justify-center font-mono">
        <span
          >{app.storageController.localStorage.topStories.length} stories</span
        >
        <span>•</span>
        <span
          >{app.storageController.syncStorage.bookmarkedStories.length} saved</span
        >
      </div>
      <div class="flex flex-row gap-2">
        <Button
          size="icon"
          variant="outline"
          onclick={() => {
            app.page += 1;
          }}
        >
          <ChevronLeft />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onclick={() => {
            app.page += 1;
          }}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  </div>
</div>
