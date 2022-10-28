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
export const getDocTag = (content: string, tagName: string) => {
  return content.match(new RegExp(`(?<=${tagName}: ).*`, ""));
};
