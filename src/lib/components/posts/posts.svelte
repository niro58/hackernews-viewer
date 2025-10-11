<script lang="ts">
  import { getApp } from "$lib/app-controller.svelte";

  const app = getApp();
</script>

{#each app.posts as post}
  {post.title}:{post.url}
{/each}
