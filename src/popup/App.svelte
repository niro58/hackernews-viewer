<script lang="ts">
  import "./app.css";
  import { setDatabase } from "$lib/database.svelte";
  import { setWebsiteRepository } from "$lib/website-repository.svelte";
  import Page from "./Page.svelte";

  const db = setDatabase();
  const websiteRepository = setWebsiteRepository();
  $effect(() => {
    if (db.db) {
      websiteRepository.db = db.db;
    }
  });
</script>

{#if websiteRepository.db}
  <Page />
{:else}
  <div
    class="w-[350px] h-[500px] flex items-center justify-center bg-background text-foreground"
  >
    <p>Loading...</p>
  </div>
{/if}
