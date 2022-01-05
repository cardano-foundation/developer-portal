import fetch from 'node-fetch';
import * as fs from 'fs';

const repoRawBaseUrl: string = 'https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/getting-started/';
const repoBaseUrl: string = 'https://github.com/Emurgo/cardano-serialization-lib'
const rlStaticResourcePath: string = '/tree/master/doc/getting-started'
const rustLibraryDocsPath: string = './docs/get-started/cardano-serialization-lib';
const namesRawBaseIndexUrl: string = 'https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/index.rst';

const getStringContentAsync = async (url: string) => {
    return await fetch(url).then(res => res.text());
}

// String manipulations to ensure compatibility
const stringManipulation = (content: string, fileName: string) => {

    // Replace empty links
    content = content.replace(']()', ']');
    
    // Inject rust library additional info
    content = injectRLInformation(content, fileName);

    return content;
}

// Inject extra docusarus doc tags
const injectDocusaurusDocTags = (content: string, url: string) => {

    // Replace '-' from url in order to create a clean sidebar label
    const modifiedUrl = url.replace('-', ' ')
    
    // Capitalize the first letter of each word
    let sidebarLabel = modifiedUrl.toLowerCase().replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());

    // Remove '---' from doc to add it later
    content = content.substring(0, 3) === '---' ? content.slice(3) : content;

    // Add '---' with doc tags for Docusaurus
    content = '--- \nsidebar_label: ' + sidebarLabel +'\ntitle: '+url + '\n--- ' +'\n'+content;

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
    return content + '  \n## Serialization-Lib Information  \nThis page was generated automatically from: ['+repoBaseUrl+']('+repoBaseUrl + rlStaticResourcePath + '/' + fileName + '.md' + ').';
}

const main = async () => {
  console.log('Rust Library Content Downloading...')

  // Fetch markdown file names 
  const indexWithMarkDownNames = await getStringContentAsync(`${namesRawBaseIndexUrl}`);

  // Create array of markdown names to fetch raw files 
  const markDownNames = indexWithMarkDownNames.match(/(?<=getting-started\/)(.*?)(?=[\r\n]+)/g);
  const rustLibraryUniqueUrls = [...new Set(markDownNames)];

  // Save rust library markdowns into docs folder
  await Promise.all(rustLibraryUniqueUrls.map(async (fileName) => {

      // Download markdown files
      const result = await getStringContentAsync(`${repoRawBaseUrl}${fileName}.md`);

      // Remove invalid links that are empty
      const manipualtedContent = stringManipulation(result, fileName)
      
      // Finish manipulation with injecting docosautus doc tags
      const contentWithDocosaurusDocTags = injectDocusaurusDocTags(manipualtedContent, fileName);

      const manipulatedFileName = fileNameManipulation(fileName)

      // Create markdown files locally with downloaded content
      fs.writeFileSync(`${rustLibraryDocsPath}/${manipulatedFileName}.md`, contentWithDocosaurusDocTags);
      console.log(`Downloaded to ${rustLibraryDocsPath}/${fileName}.md`);

   }));

   console.log('Rust Library Content Downloaded') 
}

main();