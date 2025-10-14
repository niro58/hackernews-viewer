<script lang="ts">
  import { ChevronLeft, ChevronRight, Plus, X } from "@lucide/svelte";
  import Button from "./ui/button/button.svelte";
  import Input from "./ui/input/input.svelte";
  import Badge from "./ui/badge/badge.svelte";
  import { getApp } from "$lib/modules/app-controller.svelte";
  import { formatDate } from "$lib/utils";
  import { fade, fly, slide } from "svelte/transition";
  import Label from "./ui/label/label.svelte";

  let newKeyword = $state("");
  let loadMoreKeywords = $state(false);
  const app = getApp();
  const previewKeywordsCount = 10;
  function addNewKeyword() {
    app.addBlockedKeyword(newKeyword);
    newKeyword = "";
  }
</script>

{#if app.showSettings}
  <div
    class="px-4 py-3 border-b border-border bg-muted/50"
    in:slide={{ duration: 300 }}
    out:slide={{ duration: 300 }}
  >
    <div class="space-y-3">
      <div>
        <Label
          for="block-keyword-input"
          class="text-xs font-medium text-muted-foreground mb-2 block"
        >
          Blocked Keywords
        </Label>
        <div class="flex gap-2 mb-2">
          <Input
            placeholder="Add keyword..."
            id="block-keyword-input"
            bind:value={newKeyword}
            onkeydown={(e) => e.key === "Enter" && addNewKeyword()}
            class="h-8 text-sm"
          />
          <Button size="sm" onclick={addNewKeyword} class="h-8 px-3">
            <Plus class="h-3 w-3" />
          </Button>
        </div>
        <div class="flex flex-wrap gap-1.5">
          {#each app.storageController.syncStorage.blockedKeywords.slice(0, loadMoreKeywords ? undefined : previewKeywordsCount) as keyword, index (index)}
            <div>
              <Badge
                variant="secondary"
                class="text-xs px-2 py-0.5 flex items-center gap-1"
              >
                {keyword}
                <button
                  onclick={() => app.removeBlockedKeyword(keyword)}
                  class="hover:text-primary"
                >
                  <X class="h-3 w-3" />
                </button>
              </Badge>
            </div>
          {/each}
          {#if app.storageController.syncStorage.blockedKeywords.length > previewKeywordsCount}
            <button
              onclick={() => {
                loadMoreKeywords = !loadMoreKeywords;
              }}
              class="hover:text-primary"
            >
              <Badge
                class="text-xs px-2 py-0.5 flex items-center gap-1 justify-center"
              >
                {#if loadMoreKeywords}
                  <ChevronLeft class="h-3 w-3" />
                  Load less
                {:else}
                  Load more
                  <ChevronRight class="h-3 w-3" />
                {/if}
              </Badge>
            </button>
          {/if}
        </div>
      </div>
      <div class="text-xs text-muted-foreground">
        Last refresh: {formatDate(app.latestUpdateAt)}
      </div>
    </div>
  </div>
{/if}
