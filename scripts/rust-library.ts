import * as fs from 'fs';
import * as path from 'path';
import { getStringContentAsync, injectDocusaurusDocTags } from './reusable'
import { RLRepoRawBaseUrl, RLRepoBaseUrl, RLStaticResourcePath, RLDocsPath, RLnamesRawBaseIndexUrl } from './constants'

// Current pathname 
const pathName = path.basename(__filename)

// String manipulations to ensure compatibility
const stringManipulation = (content: string, fileName: string) => {

    // Replace empty links
    content = content.replace( /\]\(\)/gm, ']');
    
    // Inject rust library additional info
    content = injectRLInformation(content, fileName);

    return content;
}

// Filename manipulations to ensure compatibility
const fileNameManipulation = (fileName: string) => {

    // Modify filename for 'metadata' with 'transaction-metadata'
    fileName = fileName === 'metadata' ? 'transaction-metadata' : fileName

    return fileName;
}

// Add rust library Info
const injectRLInformation = (content: string, fileName: string) => {

    // Add to the end
    return content + '  \n## Serialization-Lib Information  \nThis page was generated automatically from: ['+RLRepoBaseUrl+']('+RLRepoBaseUrl + RLStaticResourcePath + '/' + fileName + '.md' + ').';
}

const main = async () => {
  console.log('Rust Library Content Downloading...')

  // Fetch markdown file names 
  const indexWithMarkDownNames = await getStringContentAsync(`${RLnamesRawBaseIndexUrl}`);

  // Create array of markdown names to fetch raw files 
  const markDownNames = indexWithMarkDownNames.match(/(?<=getting-started\/)(.*?)(?=[\r\n]+)/g);
  const rustLibraryUniqueUrls = [...new Set(markDownNames)];

  // Save rust library markdowns into docs folder
  await Promise.all(rustLibraryUniqueUrls.map(async (fileName) => {

      // Download markdown files
      const result = await getStringContentAsync(`${RLRepoRawBaseUrl}${fileName}.md`);

      // Remove invalid links that are empty
      const manipualtedContent = stringManipulation(result, fileName)
      
      // Finish manipulation with injecting docosautus doc tags
      const contentWithDocosaurusDocTags = injectDocusaurusDocTags(manipualtedContent, '', fileName, pathName);

      const manipulatedFileName = fileNameManipulation(fileName)

      // Create markdown files locally with downloaded content
      fs.writeFileSync(`${RLDocsPath}/${manipulatedFileName}.md`, contentWithDocosaurusDocTags);
      console.log(`Downloaded to ${RLDocsPath}/${fileName}.md`);

   }));

   console.log('Rust Library Content Downloaded') 
}

main();