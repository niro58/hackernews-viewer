<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { RefreshCw, Bookmark, X, Plus } from "@lucide/svelte";
  import { setApp } from "$lib/modules/app-controller.svelte";
  import Header from "$lib/components/header.svelte";
  import { storyFilter } from "$lib/types";
  import { getTimeAgo } from "$lib/utils";
  import Settings from "$lib/components/settings.svelte";
  import { setDatabase } from "$lib/db/database.svelte";
  import Page from "./Page.svelte";
  const db = setDatabase();
  const app = setApp();
  $effect(() => {
    if (db.db) {
      app.storyRepository.db = db.db;
    }
  });
</script>

<div
  class="w-[450px] h-[500px] p-3 bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
>
  {#if !app.storageController.isLoading && app.storyRepository.db}
    <Page {app} />
  {:else}
    <div
      class="p-5 font-mono flex text-2xl font-semibold text-center items-center justify-center"
    >
      Initializing ...
    </div>
  {/if}
</div>
