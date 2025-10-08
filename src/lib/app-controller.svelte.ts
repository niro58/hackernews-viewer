import { getContext, setContext } from "svelte";
import { getWebsiteRepository } from "./website-repository.svelte";
import { addMessage } from "./messages";
import { SvelteMap,  } from "svelte/reactivity";

class AppController {
  websiteRepository = getWebsiteRepository();

  constructor() {
    this.websiteRepository.getAll().then((res) => {
      if (!res.success) {
        addMessage("warning", res.error);
        return;
      }

      res.data.forEach((website) => {
        const folderName = website.folderName || "default";
        if (!this.folders.has(folderName)) {
          this.folders.set(folderName, {
            websites: [],
            expanded: false,
            showAll: false,
          });
        }
        this.folders.get(folderName)!.websites.push(website);
      });
    });
  }
  getFolders() {
    return this.folders;
  }
  toggleFolder(folderName: string) {
    const folder = this.folders.get(folderName);
    if (folder) {
      folder.expanded = !folder.expanded;
      this.folders.set(folderName, { ...folder });
    }
  }

  // Toggle show all websites in a folder
  toggleShowAll(folderName: string) {
    const folder = this.folders.get(folderName);
    if (folder) {
      folder.showAll = !folder.showAll;
      this.folders.set(folderName, { ...folder }); // re-set to trigger reactivity
    }
  }

  // Add new website
  async addWebsite(website: Omit<Website, "id" | "createdAt">) {
    website.url = trimUrl(website.url);

    if (isValidUrl(website.url) === false) {
      addMessage("warning", "Invalid URL", website.url);
      return;
    }

    const model: Omit<Website, "id"> = {
      folderName: website.folderName,
      title: website.title,
      url: trimUrl(website.url),
      favicon: website.favicon,
      status: website.status,
      createdAt: Date.now(),
    };

    const res = await this.websiteRepository.add(model);
    if (!res.success) {
      addMessage("warning", res.error);
      return;
    }
    const folder = this.folders.get(model.folderName);
    if (!folder) {
      this.folders.set(model.folderName, {
        websites: [res.data],
        expanded: false,
        showAll: false,
      });
    } else {
      folder.websites.push(res.data);
      this.folders.set(model.folderName, { ...folder });
    }
  }

  async updateWebsiteStatus(
    folderName: string,
    websiteId: number,
    status: ReadingStatus
  ) {
    const folder = this.folders.get(folderName);
    if (!folder) return;

    // const website = folder.websites.find((w) => w.id === websiteId);    <----- OLD WAY
    const websiteIndex = folder.websites.findIndex((w) => w.id === websiteId);

    if (websiteIndex === -1) {
      return;
    }

    const originalWebsite = folder.websites[websiteIndex];
    const temp = originalWebsite.status;

    // Create a NEW website object with the updated status
    const updatedWebsite = { ...originalWebsite, status }; //Create a copy and set it to the new status, instead of assigning it!

    const res = await this.websiteRepository.update(updatedWebsite);
    if (!res.success) {
      originalWebsite.status = temp;
      addMessage("warning", res.error);
    }

    // Ensure this returns a *new* array with the updated website
    const newWebsites = [
      ...folder.websites.slice(0, websiteIndex),
      updatedWebsite,
      ...folder.websites.slice(websiteIndex + 1),
    ];

    this.folders.set(folderName, { ...folder, websites: newWebsites }); // Force Reactivity
  }

  
  async deleteWebsite(websiteId: number, folderName: string) {
    const folder = this.folders.get(folderName);
    if (!folder) return;

    const res = await this.websiteRepository.delete(websiteId);
    if (!res.success) {
      addMessage("warning", res.error);
      return;
    }

    folder.websites = folder.websites.filter(
      (website) => website.id !== websiteId
    );

    this.folders.set(folderName, { ...folder });
  }

  async deleteFolder(folderName: string) {
    const res = await this.websiteRepository.deleteFolder(folderName);
    if (!res.success) {
      addMessage("warning", res.error);
      return;
    }
    this.folders.delete(folderName);
  }
  async updateFolderName(folderName: string, newName: string) {
    const folder = this.folders.get(folderName);
    if (!folder) return;

    const res = await this.websiteRepository.updateFolderName(
      folderName,
      newName
    );
    if (!res.success) {
      addMessage("warning", res.error);
      return;
    }
    this.folders.set(newName, folder);
    this.folders.delete(folderName);
  }
}

const APP_SYMBOL = Symbol("APP_CONTROLLER");

export function setApp() {
  return setContext(APP_SYMBOL, new AppController());
}
export function getApp() {
  return getContext<ReturnType<typeof setApp>>(APP_SYMBOL);
}
