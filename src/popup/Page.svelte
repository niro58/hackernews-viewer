<script lang="ts">
  import "./app.css";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { setApp } from "$lib/app-controller.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  const app: ReturnType<typeof setApp> = setApp();
</script>

<div
  class="w-[350px] h-[500px] flex flex-col bg-background text-foreground overflow-hidden p-3"
>
  <Tabs.Root value="all" class="flex-1 overflow-hidden py-2">
    <Tabs.List class="w-full justify-start border-b px-4 h-12 space-x-2">
      <Tabs.Trigger value="all">All</Tabs.Trigger>
      <Tabs.Trigger value="urgent">Urgent</Tabs.Trigger>
      <Tabs.Trigger value="read">Archive</Tabs.Trigger>
    </Tabs.List>

    <ScrollArea class="h-[300px]">
      <Tabs.Content value="all" class="flex-1 overflow-hidden space-y-2"
      ></Tabs.Content>
      <Tabs.Content value="urgent" class="flex-1 overflow-hidden space-y-2"
      ></Tabs.Content>
      <Tabs.Content value="read" class="flex-1 overflow-hidden space-y-2"
      ></Tabs.Content>
      <div class="py-4"></div>
    </ScrollArea>
  </Tabs.Root>
</div>
<div
  class="mt-2 px-2 h-32 flex pointer-events-none flex-col-reverse items-stretch justify-start absolute bottom-0 w-full"
  id="messages"
></div>
