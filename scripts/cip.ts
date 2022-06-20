import * as fs from "fs";
import * as path from "path";
import {
  getStringContentAsync,
  getBufferContentAsync,
  preventH1Headline,
  injectInformation,
  injectDocusaurusDocTags,
} from "./reusable";
import {
  CIPRepoRawBaseUrl,
  CIPReadmeUrl,
  CIPPReadmeRegex,
  CIPRegex,
  CIPDocsPath,
  CIPStaticResourcePath,
} from "./constants";

// Current pathname
const pathName = path.basename(__filename);

// Download markdown resources
const processCIPContentAsync = async (cipName: string, content: string) => {
  const cipResources = content.match(CIPRegex);
  if (cipResources) {
    await Promise.all(
      cipResources.map(async (r) => {
        if (r.indexOf("http://") < 0 && r.indexOf("https://") < 0) {
          // create filenames to download into static folder
          const fileName = r
            .replace("](", "")
            .replace(".png)", ".png")
            .replace(".jpg)", ".jpg")
            .replace(".jpeg)", ".jpeg")
            .replace(".json)", ".json");

          // Create modified filenames in case we want to store files
          // with a different ending, like JSON files
          const modifiedFileName = r
            .replace("](", "")
            .replace(".png)", ".png")
            .replace(".jpg)", ".jpg")
            .replace(".jpeg)", ".jpeg")
            .replace(".json)", ".txt");

          const buffer = await getBufferContentAsync(
            `${CIPRepoRawBaseUrl}${cipName}/${fileName}`
          );

          if (fs.existsSync(`.${CIPStaticResourcePath}${cipName}`)) {
            fs.rmdirSync(`.${CIPStaticResourcePath}${cipName}`, {
              recursive: true,
            });
          }
          fs.mkdirSync(`.${CIPStaticResourcePath}${cipName}`, {
            recursive: true,
          });

          fs.writeFileSync(
            `.${CIPStaticResourcePath}${cipName}/${modifiedFileName}`,
            new Uint8Array(buffer)
          );

          // Rewrite link to static folder
          content = content.replace(
            fileName,
            `../../..${CIPStaticResourcePath}${cipName}/${modifiedFileName}`
          );
          console.log(
            `Processed CIP content downloaded to .${CIPStaticResourcePath}${cipName}/${fileName}`
          );
        }
      })
    );
  }

  // Ensure compatibility
  content = stringManipulation(content, cipName);

  return content;
};

// String manipulations to ensure compatibility
const stringManipulation = (content: string, cipName: string) => {
  // We expect markdown files, therefore strip HTML
  content = content.replace(/(<([^>]+)>)/gi, "");

  // Rewrite relative links like [Byron](./Byron.md) to absolute links.
  content = content.replace(
    /\]\(\.\//gm,
    "](" + CIPRepoRawBaseUrl + cipName + "/"
  );

  // Fix parent links to CIPs
  content = content.replace(/]\(\..\/CIP-/gm, "](./CIP-");

  // Remove invalid "CIP-YET-TO-COME" links that are empty
  content = content.replace("]()", "]");

  // Remove unterminated string constant like in CIP 30
  content = content.replace(/\\/g, "");

  // Prevent H1 headlines
  content = preventH1Headline(content, "Abstract");
  content = preventH1Headline(content, "Motivation");
  content = preventH1Headline(content, "Specification");
  content = preventH1Headline(content, "Rationale");
  content = preventH1Headline(content, "Copyright");

  // Inject Docusaurus doc tags for title and a nice sidebar
  content = injectDocusaurusDocTags(content, "", "", pathName);

  // Inject CIP Info to make clear this is auto generated
  content = injectInformation(content, cipName, pathName);

  return content;
};

// Get a specific doc tag
const getDocTag = (content: string, tagName: string) => {
  return content.match(new RegExp(`(?<=${tagName}: ).*`, ""));
};

const main = async () => {
  console.log("CIP Content Downloading...");
  // Use https://raw.githubusercontent.com/cardano-foundation/CIPs/master/README.md as entry point to get URLs
  const readmeContent = await getStringContentAsync(
    `${CIPRepoRawBaseUrl}${CIPReadmeUrl}`
  );
  const cipUrls = readmeContent.match(CIPPReadmeRegex);
  const cipUrlsUnique = [...new Set(cipUrls)];

  if (fs.existsSync(CIPDocsPath)) {
    fs.rmdirSync(CIPDocsPath, { recursive: true });
  }
  fs.mkdirSync(CIPDocsPath, { recursive: true });

  // Save CIP Readme into docs
  await Promise.all(
    cipUrlsUnique.map(async (cipUrl) => {
      const fileName: string = "README.md";
      const cipName: string = cipUrl.substring(2, cipUrl.length - 1); // ./CIP-xxx/ --> CIP-xxx

      let content = await getStringContentAsync(
        cipUrl.replace("./", CIPRepoRawBaseUrl) + fileName
      );
      content = await processCIPContentAsync(cipName, content);

      fs.writeFileSync(`${CIPDocsPath}/${cipName}.md`, content);
      console.log(`Downloaded to ${CIPDocsPath}/${cipName}.md`);
    })
  );

  console.log("CIP Content Downloaded");
};

main();
