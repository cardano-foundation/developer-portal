import { difference } from "@site/src/utils/jsUtils";
import { TagList } from "./tags";

// Fail-fast on common errors
export function ensureBuilderToolValid(tool) {
  function checkFields() {
    const keys = Object.keys(tool);
    const validKeys = [
      "title",
      "description",
      "preview",
      "website",
      "getstarted",
      "tags",
    ];
    const unknownKeys = difference(keys, validKeys);
    if (unknownKeys.length > 0) {
      throw new Error(
        `Site contains unknown attribute names=[${unknownKeys.join(",")}]`
      );
    }
  }

  function checkTitle() {
    if (!tool.title) {
      throw new Error("Site title is missing");
    }
  }

  function checkDescription() {
    if (!tool.description) {
      throw new Error("Site description is missing");
    }
  }

  function checkWebsite() {
    if (!tool.website) {
      throw new Error("Site website is missing");
    }
    const isHttpUrl =
      tool.website.startsWith("http://") ||
      tool.website.startsWith("https://");
    if (!isHttpUrl) {
      throw new Error(
        `Site website does not look like a valid url: ${tool.website}`
      );
    }
  }

  function checkPreview() {
    if (
      !tool.preview ||
      (tool.preview instanceof String &&
        (tool.preview.startsWith("http") ||
          tool.preview.startsWith("//")))
    ) {
      throw new Error(
        `Site has bad image preview=[${tool.preview}].\nThe image should be hosted on the Developer Portal GitHub, and not use remote HTTP or HTTPS URLs`
      );
    }
  }

  function checkTags() {
    if (
      !tool.tags ||
      !(tool.tags instanceof Array) ||
      tool.tags.includes("")
    ) {
      throw new Error(`Bad builder tool tags=[${JSON.stringify(tool.tags)}]`);
    }
    const unknownTags = difference(tool.tags, TagList);
    if (unknownTags.length > 0) {
      throw new Error(
        `Unknown tags=[${unknownTags.join(
          ","
        )}\nThe available tags are ${TagList.join(",")}`
      );
    }
  }

  function checkGetStarted() {
    if (typeof tool.getstarted === "undefined") {
      throw new Error(
        "The getstarted attribute is required.\nIf your builder tool has no get started page, please make it explicit with 'getstarted: null'"
      );
    }
  }

  function checkOperatorTool() {
    const hasGetStarted = tool.getstarted != null;
    const isOperatorTool = tool.tags.includes("operatortool");

    if ((hasGetStarted && isOperatorTool) && !(typeof tool.getstarted === "string" &&
      (tool.getstarted.startsWith("/docs/operate-a-stake-pool/")))
    ) {
      throw new Error(
        // Be more specific as soon as we have an operator tool with a get started page
        "Get started pages for stake pool operator tools, should go into the operate-a-stake-pool-section."
      );
    }
  }

  try {
    checkFields();
    checkTitle();
    checkDescription();
    checkWebsite();
    checkPreview();
    checkTags();
    checkGetStarted();
    checkOperatorTool();
  } catch (e) {
    throw new Error(
      `Builder tool with title=${tool.title} contains errors:\n${e.message}`
    );
  }
}
