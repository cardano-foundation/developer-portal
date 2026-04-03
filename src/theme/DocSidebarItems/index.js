import React, {memo} from "react";
import {
  DocSidebarItemsExpandedStateProvider,
  useVisibleSidebarItems,
} from "@docusaurus/plugin-content-docs/client";
import DocSidebarItem from "@theme/DocSidebarItem";

/**
 * Detect the direct children of the "Get Started" sidebar category (Networks,
 * Infrastructure, Client SDKs, Developer Pathway). Docusaurus normally hides
 * sibling categories that do not contain the active doc, which made Developer
 * Pathway look like the only/first item. We keep all four visible there.
 */
function isGetStartedDirectChildren(items) {
  return (
    items.some(
      (i) =>
        i.type === "doc" &&
        i.id === "get-started/developer-pathway/overview",
    ) &&
    items.some(
      (i) => i.type === "category" && i.label === "Networks",
    )
  );
}

function DocSidebarItems({items, ...props}) {
  const filtered = useVisibleSidebarItems(items, props.activePath);
  const visibleItems = isGetStartedDirectChildren(items)
    ? items
    : filtered;

  return (
    <DocSidebarItemsExpandedStateProvider>
      {visibleItems.map((item, index) => (
        <DocSidebarItem
          key={index}
          item={item}
          index={index}
          {...props}
        />
      ))}
    </DocSidebarItemsExpandedStateProvider>
  );
}

export default memo(DocSidebarItems);
