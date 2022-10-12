import fetch from "node-fetch";

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
export const sidebarPosition = (fileName: string) => {
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

  return ""; // Empty string means alphabetically within the sidebar
};

// Get a specific doc tag
export const getDocTag = (content: string, tagName: string) => {
  return content.match(new RegExp(`(?<=${tagName}: ).*`, ""));
};
