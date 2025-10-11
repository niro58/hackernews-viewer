<script lang="ts">
  import "./app.css";
  import { setStorageController } from "$lib/storage-controller.svelte";
  import Page from "./Page.svelte";

  const websiteRepository = setStorageController();
</script>

<Page />
