import { difference } from "@site/src/utils/jsUtils";
import { CategoryList, PropertyList } from "./tags";

// Fail-fast on common errors (runs at build via builder-tools.js).
export function ensureBuilderToolValid(tool) {
  function checkFields() {
    const validKeys = [
      "title",
      "description",
      "preview",
      "website",
      "getstarted",
      "category",
      "properties",
      "maintainerPick",
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

  function checkPreview() {
    if (
      !tool.preview ||
      (tool.preview instanceof String &&
        (tool.preview.startsWith("http") || tool.preview.startsWith("//")))
    ) {
      throw new Error(
        `bad image preview=[${tool.preview}]. The image must be hosted in the repo, not a remote URL.`
      );
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

  function checkGetStarted() {
    if (typeof tool.getstarted === "undefined") {
      throw new Error(
        "getstarted is required. If there is no get-started page, set 'getstarted: null'."
      );
    }
  }

  function checkOperations() {
    const hasGs = tool.getstarted != null;
    if (
      hasGs &&
      tool.category === "operations" &&
      typeof tool.getstarted === "string" &&
      tool.getstarted.startsWith("/docs/") &&
      !tool.getstarted.startsWith("/docs/operate-a-stake-pool/")
    ) {
      throw new Error(
        "Get-started pages for operations tools should live under /docs/operate-a-stake-pool/."
      );
    }
  }

  try {
    checkFields();
    checkTitle();
    checkDescription();
    checkWebsite();
    checkPreview();
    checkCategory();
    checkProperties();
    checkGetStarted();
    checkOperations();
  } catch (e) {
    throw new Error(
      `Builder tool with title=${tool.title} contains errors:\n${e.message}`
    );
  }
}
