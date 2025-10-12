<script lang="ts">
  import { Plus, X } from "@lucide/svelte";
  import Button from "./ui/button/button.svelte";
  import Input from "./ui/input/input.svelte";
  import Badge from "./ui/badge/badge.svelte";
  import { getApp } from "$lib/modules/app-controller.svelte";
  import { formatDate } from "$lib/utils";

  let newKeyword = $state("");

  const app = getApp();

  function addNewKeyword() {
    app.addBlockedKeyword(newKeyword);
    newKeyword = "";
  }
</script>

{#if app.showSettings}
  <div class="px-4 py-3 border-b border-border bg-muted/50">
    <div class="space-y-3">
      <div>
        <label class="text-xs font-medium text-muted-foreground mb-2 block"
          >Blocked Keywords</label
        >
        <div class="flex gap-2 mb-2">
          <Input
            placeholder="Add keyword..."
            bind:value={newKeyword}
            onkeydown={(e) => e.key === "Enter" && addNewKeyword()}
            class="h-8 text-sm"
          />
          <Button size="sm" onclick={addNewKeyword} class="h-8 px-3">
            <Plus class="h-3 w-3" />
          </Button>
        </div>
        <div class="flex flex-wrap gap-1.5">
          {#each app.storageController.syncStorage.blockedKeywords as keyword (keyword)}
            <Badge
              variant="secondary"
              class="text-xs px-2 py-0.5 flex items-center gap-1"
            >
              {keyword}
              <button
                onclick={() => app.removeBlockedKeyword(keyword)}
                class="hover:text-destructive"
              >
                <X class="h-3 w-3" />
              </button>
            </Badge>
          {/each}
        </div>
      </div>
      <div class="text-xs text-muted-foreground">
        Last refresh: {formatDate(
          app.storageController.localStorage.topStoriesUpdatedAt
        )}
      </div>
    </div>
  </div>
{/if}
