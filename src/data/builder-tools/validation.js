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
      "docs",
      "repository",
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
      !tool.docs.startsWith("/docs/operate-a-stake-pool/")
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
    checkDocs();
    checkRepository();
    checkOperations();
  } catch (e) {
    throw new Error(
      `Builder tool with title=${tool.title} contains errors:\n${e.message}`
    );
  }
}
