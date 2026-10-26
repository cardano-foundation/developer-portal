import { difference } from "@site/src/utils/arrays";
import { CategoryList, PropertyList } from "./tags";

const MAX_SCREENSHOTS = 3;
const SCREENSHOT_DIR = "/img/tools/screenshots/";
const SCREENSHOT_EXT = /\.(png|jpe?g|webp)$/i;

// Fail-fast on common errors (runs at build via builder-tools.js).
export function ensureBuilderToolValid(tool) {
  function checkFields() {
    const validKeys = [
      "title",
      "description",
      "icon",
      "website",
      "docs",
      "repository",
      "category",
      "properties",
      "maintainerPick",
      "screenshots",
    ];
    const unknownKeys = difference(Object.keys(tool), validKeys);
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown attribute names=[${unknownKeys.join(",")}]`);
    }
  }

  function checkTitle() {
    if (!tool.title) throw new Error("title is missing");
  }

  function checkDescription() {
    if (!tool.description) throw new Error("description is missing");
  }

  function checkWebsite() {
    if (!tool.website) throw new Error("website is missing");
    if (
      !(tool.website.startsWith("http://") || tool.website.startsWith("https://"))
    ) {
      throw new Error(`website does not look like a valid url: ${tool.website}`);
    }
  }

  function checkCategory() {
    if (!tool.category || !CategoryList.includes(tool.category)) {
      throw new Error(
        `bad category=[${tool.category}]. Available: ${CategoryList.join(", ")}`
      );
    }
  }

  function checkProperties() {
    if (!Array.isArray(tool.properties) || tool.properties.includes("")) {
      throw new Error(`bad properties=[${JSON.stringify(tool.properties)}]`);
    }
    const unknown = difference(tool.properties, PropertyList);
    if (unknown.length > 0) {
      throw new Error(
        `unknown properties=[${unknown.join(", ")}]. Available: ${PropertyList.join(", ")}`
      );
    }
  }

  function checkDocs() {
    if (typeof tool.docs === "undefined") {
      throw new Error(
        "docs is required. If there is no docs/get-started page, set 'docs: null'."
      );
    }
  }

  function checkRepository() {
    if (typeof tool.repository === "undefined") {
      throw new Error(
        "repository is required. If the tool has no public source repo, set 'repository: null'."
      );
    }
    if (
      tool.repository != null &&
      !(
        tool.repository.startsWith("http://") ||
        tool.repository.startsWith("https://")
      )
    ) {
      throw new Error(`repository is not a valid url: ${tool.repository}`);
    }
  }

  function checkOperations() {
    const hasDocs = tool.docs != null;
    if (
      hasDocs &&
      tool.category === "operations" &&
      typeof tool.docs === "string" &&
      tool.docs.startsWith("/docs/") &&
      !tool.docs.startsWith("/docs/operators/")
    ) {
      throw new Error(
        "Get-started pages for operations tools should live under /docs/operators/."
      );
    }
  }

  // Optional. The files themselves (existence, size) are checked by the
  // tools-routes plugin, which runs in Node and can read static/.
  function checkScreenshots() {
    if (typeof tool.screenshots === "undefined") return;
    if (
      !Array.isArray(tool.screenshots) ||
      tool.screenshots.length === 0 ||
      tool.screenshots.length > MAX_SCREENSHOTS
    ) {
      throw new Error(
        `screenshots must be an array of 1 to ${MAX_SCREENSHOTS} entries, or left out`
      );
    }
    tool.screenshots.forEach((shot, i) => {
      const unknownKeys = difference(Object.keys(shot || {}), ["src", "alt"]);
      if (unknownKeys.length > 0) {
        throw new Error(
          `screenshots[${i}] has unknown attribute names=[${unknownKeys.join(",")}]`
        );
      }
      if (
        typeof shot.src !== "string" ||
        !shot.src.startsWith(SCREENSHOT_DIR) ||
        !SCREENSHOT_EXT.test(shot.src)
      ) {
        throw new Error(
          `screenshots[${i}].src must be a .png, .jpg or .webp path under ${SCREENSHOT_DIR}, got ${shot.src}`
        );
      }
      if (typeof shot.alt !== "string" || !shot.alt.trim()) {
        throw new Error(`screenshots[${i}].alt is missing (describe what the image shows)`);
      }
    });
  }

  try {
    checkFields();
    checkTitle();
    checkDescription();
    checkWebsite();
    checkCategory();
    checkProperties();
    checkDocs();
    checkRepository();
    checkOperations();
    checkScreenshots();
  } catch (e) {
    throw new Error(
      `Builder tool with title=${tool.title} contains errors:\n${e.message}`
    );
  }
}
