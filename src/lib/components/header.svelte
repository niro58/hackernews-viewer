<script lang="ts">
  import { Bookmark, RefreshCw, Settings } from "@lucide/svelte";
  import Button from "./ui/button/button.svelte";
  import { getApp } from "$lib/modules/app-controller.svelte";

  const app = getApp();
</script>

<div
  class="flex items-center justify-between px-4 py-3 border-b border-border bg-card"
>
  <h1 class="text-lg font-semibold text-foreground font-mono">HN Reader</h1>
  <div class="flex items-center gap-2">
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8"
      onclick={() => {
        app.refresh();
        app.page = 0;
      }}
      disabled={app.storiesState.type === "LOADING"}
    >
      <RefreshCw
        class="h-4 w-4 {app.storiesState.type === 'LOADING' ? 'animate-spin' : ''}"
      />
    </Button>
    <Button
      variant={app.storageController.syncStorage.storyFilter === "bookmark"
        ? "default"
        : "ghost"}
      size="icon"
      class="h-8 w-8"
      onclick={() => {
        app.showSettings = false;
        app.storageController.setSync("storyFilter", "bookmark");
        app.page = 0;
        app.refresh();
      }}
    >
      <Bookmark class="h-4 w-4" />
    </Button>
    <Button
      variant={app.showSettings ? "default" : "ghost"}
      size="icon"
      class="h-8 w-8"
      onclick={() => (app.showSettings = !app.showSettings)}
    >
      <Settings class="h-4 w-4" />
    </Button>
  </div>
</div>
