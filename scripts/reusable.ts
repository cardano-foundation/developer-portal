import fetch from "node-fetch";
import {
  RLRepoBaseUrl,
  RLStaticResourcePath,
  CIPSourceRepo,
  CIPRepoBaseUrl,
  CIPReadmeUrl,
  TRWiki,
} from "./constants";

export const getStringContentAsync = async (url: string) => {
  return await fetch(url).then((res) => res.text());
};

export const getBufferContentAsync = async (url: string) => {
  return await fetch(url).then((res) => res.arrayBuffer());
};

// Prevent H1 headlines
export const preventH1Headline = (content: string, headline: string) => {
  return content.includes("# " + headline) &&
    !content.includes("## " + headline)
    ? content.replace("# " + headline, "## " + headline)
    : content;
};

// In case we want a specific sidebar_position for a certain filename (otherwise alphabetically)
// In the future it will be better to get this information from the index.rst file
export const sidebar_positionForFilename = (fileName: string) => {
  // Token Registry sidebar positioning
  if (
    fileName === "How to prepare an entry for the registry (NA policy script)"
  )
    return "sidebar_position: 2\n";
  if (fileName === "How to prepare an entry for the registry (Plutus script)")
    return "sidebar_position: 3\n";
  if (fileName === "How to submit an entry to the registry")
    return "sidebar_position: 4\n";

  //Rust Library sidebar positioning
  if (fileName === "prerequisite-knowledge") return "sidebar_position: 2\n";
  if (fileName === "generating-keys") return "sidebar_position: 3\n";
  if (fileName === "generating-transactions") return "sidebar_position: 4\n";
  if (fileName === "transaction-metadata") return "sidebar_position: 5\n";

  return ""; // empty string means alphabetically within the sidebar
};

// Add addition Info
export const injectInformation = (
  content: string,
  fileName: string,
  path: string
) => {
  // Add to the end
  if (path === "token-registry.ts") {
    return (
      content +
      "\n" +
      "## Token Registry Information  \nThis page was generated automatically from: [" +
      TRWiki +
      "](" +
      TRWiki +
      "/" +
      fileName +
      ")."
    );
  } else if (path === "rust-library.ts") {
    return (
      content +
      "\n" +
      "## Serialization-Lib Information  \nThis page was generated automatically from: [" +
      RLRepoBaseUrl +
      "](" +
      RLRepoBaseUrl +
      RLStaticResourcePath +
      "/" +
      fileName +
      ".md" +
      ")."
    );
  } else if (path === "cip.ts") {
    // Parse information from markdown file
    const status = getDocTag(content, "Status");
    const type = getDocTag(content, "Type");
    const creationDate = getDocTag(content, "Created");

    return (
      content +
      "\n" +
      "## CIP Information  \nThis [" +
      type +
      "](CIP-0001#cip-format-and-structure) " +
      fileName +
      " created on **" +
      creationDate +
      "** has the status: [" +
      status +
      "](CIP-0001#cip-workflow).  \nThis page was generated automatically from: [" +
      CIPSourceRepo +
      "](" +
      CIPRepoBaseUrl +
      fileName +
      CIPReadmeUrl +
      ")."
    );
  }
};

// Get a specific doc tag
export const getDocTag = (content: string, tagName: string) => {
  return content.match(new RegExp(`(?<=${tagName}: ).*`, ""));
};

// Inject extra docusarus doc tags
export const injectDocusaurusDocTags = (
  content: string,
  url: string,
  fileName: string,
  path: string
) => {
  // Remove '---' from doc to add it later
  content = content.substring(0, 3) === "---" ? content.slice(3) : content;

  if (path === "token-registry.ts") {
    // Remove '\'' from url to avoid issues during project build
    url = url.match(/\'/g) ? url.replace(/\'/g, "") : url;

    // Add '---' with doc tags for Docusaurus
    content =
      "--- \nsidebar_label: " +
      url +
      "\ntitle: " +
      url +
      "\n" +
      sidebar_positionForFilename(url) +
      "\n--- " +
      "\n" +
      content;
  } else if (path === "rust-library.ts") {
    // Replace '-' from url in order to create a clean sidebar label
    const modifiedFileName = fileName.replace(/[-]/gm, " ");

    // Capitalize the first letter of each word
    let sidebarLabel = modifiedFileName
      .toLowerCase()
      .replace(/(^\w{1})|(\s{1}\w{1})/g, (match) => match.toUpperCase());

    // Add '---' with doc tags for Docusaurus
    content =
      "--- \nsidebar_label: " +
      sidebarLabel +
      "\ntitle: " +
      fileName +
      "\n" +
      sidebar_positionForFilename(fileName) +
      "--- " +
      "\n" +
      content;
  } else if (path === "cip.ts") {
    // Parse information from markdown file
    const title = getDocTag(content, "Title");
    const cipNumber = getDocTag(content, "CIP");

    // Add "---" with doc tags for Docusaurus
    content =
      "--- \nsidebar_label: " + "(" + cipNumber + ") " + title + content;
  }

  return content;
};
