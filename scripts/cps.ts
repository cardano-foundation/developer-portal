import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";
import {
  custom_edit_url,
  cps_repository_url,
  cps_target_folder,
  cip_source_repo,
  cip_repo_base_url,
  cip_readme_url,
} from "./constants";
import { getDocTag } from "./reusable";

// Fetch markdown files from Github
async function fetchReadmeContent(folderUrl: string): Promise<string | null> {
  try {
    const response = await fetch(folderUrl);
    const data = await response.json();
    const readmeFile = data.find((file: any) => file.name === "README.md");

    if (readmeFile) {
      const readmeResponse = await fetch(readmeFile.download_url);
      const readmeText = await readmeResponse.text();
      return readmeText;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching README:", error.message);
    return null;
  }
}

// Update/Create CPS locally
async function updateOrCreateReadmeFile(
  folderName: string,
  content: string
): Promise<void> {
  const title = getDocTag(content, "Title");
  const cps = getDocTag(content, "CPS");
  const sidebarLabel = `sidebar_label: "(${cps}) ${title}"`;
  const status = getDocTag(content, "Status");
  const creationDate = getDocTag(content, "Created");

  // Sanitize title
  const newContent = content.replace(
    /Title: .+/,
    `Title: "${title}"\n${sidebarLabel}${custom_edit_url}`
  );

  // Add Content Info at the bottom of the page
  const newContentWithInfo = newContent.concat(
    "\n" +
      "## CPS Information  \nThis CPS was created on **" +
      creationDate +
      "** and has the status: [" +
      status +
      "](../cardano-improvement-proposals/CIP-0001#cip-workflow).  \nThis page was generated automatically from: [" +
      cip_source_repo +
      "](" +
      cip_repo_base_url +
      folderName +
      cip_readme_url +
      ")."
  );

  const filePath = path.join(cps_target_folder, `${folderName}.md`);
  try {
    await fs.promises.writeFile(filePath, newContentWithInfo);
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

async function main() {
  try {
    const response = await fetch(cps_repository_url);
    const data = await response.json();
    const cpsFolders = data.filter(
      (item: any) => item.type === "dir" && item.name.includes("CPS")
    );

    for (const folder of cpsFolders) {
      const readmeContent = await fetchReadmeContent(folder.url);
      if (readmeContent) {
        const folderName = folder.name;
        await updateOrCreateReadmeFile(folderName, readmeContent);
      }
    }
  } catch (error) {
    console.error("Error fetching repository contents:", error.message);
  }
}

main();
