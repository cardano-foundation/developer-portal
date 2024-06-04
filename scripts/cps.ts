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
  cip_repo_raw_base_url,
  cip_regex,
} from "./constants";
import { getDocTag, identifyReferenceLinks, identifyMixedReferenceLinks } from "./reusable";

// Fetch markdown files from Github
async function fetchReadmeContent(folderUrl: string, folderName: string): Promise<string | null> {
  try {
    const response = await fetch(folderUrl);
    const data = await response.json();
    const readmeFile = data.find((file: any) => file.name === "README.md");
    const otherFiles = data.filter((file: any) => file.name !== "README.md");

    // Download and save other files
    for (const file of otherFiles) {
      const fileResponse = await fetch(file.download_url);
      const fileBuffer = await fileResponse.buffer();
      const filePath = path.join("static", "img", "cps", folderName, file.name);
      
      // Ensure the directory exists before writing the file
      const dir = path.dirname(filePath);
      await fs.promises.mkdir(dir, { recursive: true });

      await fs.promises.writeFile(filePath, fileBuffer);
    }

    if (readmeFile) {
      const readmeResponse = await fetch(readmeFile.download_url);
      const readmeText = await readmeResponse.text();
      return readmeText;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching README and other files:", error.message);
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
  content = content.replace(
    /Title: .+/,
    `Title: "${title}"\n${sidebarLabel}${custom_edit_url}`
  );

  // Add Content Info at the bottom of the page
  content = content.concat(
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

  const referenceLinks = identifyReferenceLinks(content);
  if(referenceLinks.length > 0) {
    await Promise.all(
      referenceLinks.map(async (link) => {
        if(link.url.indexOf("./") == 0 || link.url.indexOf("../") == 0) {

          console.log(`Found reference links in CPS ${folderName}:`);
          console.log(`WARNING: Reference link ${link.reference} in CPS ${folderName} is an relative link: ${link.url}.`);
                    
          // Rewrite link to static folder
          content = content.replace(
            `[${link.reference}]`,
            `[${link.reference}](${link.url})`
          );
        }
      })
    );
  }

  const mixedReferenceLinks = identifyMixedReferenceLinks(content);
  if (mixedReferenceLinks.length > 0) {
    mixedReferenceLinks.forEach(mixedLink => {
      const matchedReference = referenceLinks.find(link => link.reference === mixedLink.reference && (link.url.indexOf("./") == 0 || link.url.indexOf("../") == 0));
      if (matchedReference) {

        console.log(`Found mixed reference links in CPS ${folderName}:`);
        console.log(`WARNING: Mixed reference link [${mixedLink.text}][${mixedLink.reference}] is an relative mixed link: ${matchedReference.url}.`);

        content = content.replace(`[${mixedLink.text}][${mixedLink.reference}]`, `[${mixedLink.text}](${cip_repo_raw_base_url}${folderName}/${matchedReference.url})`);
      }
    });
  }

  const cip_resource = content.match(cip_regex);
  if (cip_resource) {
    await Promise.all(
      cip_resource.map(async (r) => {
        if (r.indexOf("http://") < 0 && r.indexOf("https://") < 0) {

          // Create modified file_names in case we want to store files
          // with a different ending, like JSON files
          const modified_file_name = r
            .replace("](", "")
            .replace(".png)", ".png")
            .replace(".jpg)", ".jpg")
            .replace(".jpeg)", ".jpeg")
            .replace(".json)", ".json");
            
          // Rewrite link to static folder
          content = content.replace(
              modified_file_name,
              `../../../static/img/cps/${folderName}/${modified_file_name}`
          );
        }
      })
    );
  }

  const filePath = path.join(cps_target_folder, `${folderName}.md`);

  try {
    await fs.promises.writeFile(filePath, content);
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
      const readmeContent = await fetchReadmeContent(folder.url, folder.name);
      if (readmeContent) {
        await updateOrCreateReadmeFile(folder.name, readmeContent);
      }
    }
  } catch (error) {
    console.error("Error fetching repository contents:", error.message);
  }
}

main();
