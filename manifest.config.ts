import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";

const { version } = packageJson;

const [major, minor, patch] = version
  .replace(/[^\d.-]+/g, "")
  .split(/[.-]/);

export default defineManifest(async () => ({
  manifest_version: 3,
  name: "HACKER NEWS",
  description:
    "ReadVault is an extension that acts as your digital reading vault. Save and organize pages in one place for easy access anytime.",
  version: `${major}.${minor}.${patch}`,
  version_name: version,
  icons: {
    // "16": "src/assets/icons/icon-16.png",
    // "32": "src/assets/icons/icon-32.png",
    "48": "src/assets/icons/icon-48.png",
    "128": "src/assets/icons/icon-128.png",
  },
  action: {
    default_popup: "index.html",
    default_icon: {
      "48": "src/assets/icons/icon-48.png",
      "128": "src/assets/icons/icon-128.png",
    },
  },
  permissions: ["storage"] as chrome.runtime.ManifestPermissions[],
  //used for hot reload to work, disable on prod
  host_permissions: ["<all_urls>"],
}));
