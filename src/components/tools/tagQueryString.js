// Read and write the ?tags= filter selection on the /tools URL. Plain
// URLSearchParams helpers, shared by the filter panel, the intent chips, and
// the tools page itself.

export const TagQueryStringKey = "tags";

export function readSearchTags(search) {
  return new URLSearchParams(search).getAll(TagQueryStringKey);
}

export function replaceSearchTags(search, newTags) {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
}
