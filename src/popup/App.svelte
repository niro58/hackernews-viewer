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

{#if !app.storageController.isLoading && app.storyRepository.db}
  <Page {app} />
{:else}
  LOADING
{/if}
