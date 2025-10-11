<script lang="ts">
  import "./app.css";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { setApp } from "$lib/app-controller.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import Posts from "$lib/components/posts/posts.svelte";
  import Rules from "$lib/components/rules/rules.svelte";
  import Faq from "$lib/components/faq/faq.svelte";

  const app: ReturnType<typeof setApp> = setApp();
  // app.refreshPosts();
</script>

<div
  class="w-[350px] h-[500px] flex flex-col bg-background text-foreground overflow-hidden p-3"
>
  <Tabs.Root value="posts" class="flex-1 overflow-hidden py-2">
    <Tabs.List class="w-full justify-start border-b px-4 h-12 space-x-2">
      <Tabs.Trigger value="posts">Posts</Tabs.Trigger>
      <Tabs.Trigger value="rules">Rules</Tabs.Trigger>
      <Tabs.Trigger value="faq">FAQ</Tabs.Trigger>
    </Tabs.List>

    <ScrollArea class="h-[300px]">
      <Tabs.Content value="posts" class="flex-1 overflow-hidden space-y-2">
        <Posts />
      </Tabs.Content>
      <Tabs.Content value="rules" class="flex-1 overflow-hidden space-y-2">
        <Rules />
      </Tabs.Content>
      <Tabs.Content value="faq" class="flex-1 overflow-hidden space-y-2">
        <Faq />
      </Tabs.Content>
      <div class="py-4"></div>
    </ScrollArea>
  </Tabs.Root>
</div>
<div
  class="mt-2 px-2 h-32 flex pointer-events-none flex-col-reverse items-stretch justify-start absolute bottom-0 w-full"
  id="messages"
></div>
