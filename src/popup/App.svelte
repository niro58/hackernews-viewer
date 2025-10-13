<script lang="ts">
  import { setDatabase } from "$lib/db/database.svelte";
  import Page from "./Page.svelte";
  import { StoryRepository } from "$lib/db/story-repository.svelte";
  const db = setDatabase();
  const storyRepository = new StoryRepository();
  $effect(() => {
    if (db.db) {
      storyRepository.db = db.db;
    }
  });
</script>

<div
  class="w-[450px] h-[500px] p-3 bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
>
  {#if storyRepository.db}
    <Page {storyRepository} />
  {:else}
    <div
      class="p-5 font-mono flex text-2xl font-semibold text-center items-center justify-center"
    >
      Initializing ...
    </div>
  {/if}
</div>
