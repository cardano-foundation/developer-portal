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

// Get a specific doc tag
export const getDocTag = (content: string, tag_name: string) => {
  return content.match(new RegExp(`(?<=${tag_name}: ).*`, ""));
};

export const identifyReferenceLinks = (content: string) => {
  // Regular expression to match reference-style links
  const referenceLinkRegex = /\[([^\]]+)\]:\s*(\S+)/g;
  const matches = [];
  let match;

  // Loop through all matches and push them into the matches array
  while ((match = referenceLinkRegex.exec(content)) !== null) {
    matches.push({
      reference: match[1], // The reference name
      url: match[2]        // The URL
    });
  }

  return matches;
};

// Identify mixed reference links in Markdown content
export const identifyMixedReferenceLinks = (content: string) => {
  const mixedReferenceLinkRegex = /\[([^\]]+)\]\[([^\]]+)\]/g;
  const matches = [];
  let match;

  while ((match = mixedReferenceLinkRegex.exec(content)) !== null) {
    matches.push({
      text: match[1],
      reference: match[2],
    });
  }

  return matches;
};

// Identify nested extended CIP links in Markdown content
export const identifyNestedExtendedCIPLinks = (content: string) => {
  const nestedExtendedCIPRegex = /\(\.\/CIPs\/\d{4}\)/gm;
  const matches = [];
  let match;

  while ((match = nestedExtendedCIPRegex.exec(content)) !== null) {
    matches.push(match[0]);
  }

  return matches;
};