import fetch from 'node-fetch';
import * as fs from 'fs';

const repoRawBaseUrl: string = 'https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/getting-started/';
const rustLibraryDocsPath: string = './docs/get-started/cardano-serialization-lib/rust-library';
const namesRawBaseIndexUrl: string = 'https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/index.rst';

const getStringContentAsync = async (url: string) => {
    return await fetch(url).then(res => res.text());
}

// String manipulations to ensure compatibility
const stringManipulation = (content: string) => {

    // Remove invalid 'BIP-39' links that are empty
    content = content.replace(']()', ']');

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

const main = async () => {
  console.log('Rust Library Content Downloading...')

  // Fetch markdown file names 
  const indexWithMarkDownNames = await getStringContentAsync(`${namesRawBaseIndexUrl}`);

  // Create array of markdown names to fetch raw files 
  const markDownNames = indexWithMarkDownNames.match(/(?<=getting-started\/)(.*?)(?=[\r\n]+)/g);
  const rustLibraryUniqueUrls = [...new Set(markDownNames)];

  // Create rust library folder to store markdown files locally
  fs.rmdirSync(rustLibraryDocsPath, { recursive: true });
  fs.mkdirSync(rustLibraryDocsPath, { recursive: true });

  // Save rust library markdowns into docs folder
  await Promise.all(rustLibraryUniqueUrls.map(async (content) => {

      // Download markdown files
      const result = await getStringContentAsync(`${repoRawBaseUrl}${content}.md`);

      // Remove invalid 'BIP-39' links that are empty
      const manipualtedContent = stringManipulation(result)
      
      // Finish manipulation with injecting docosautus doc tags
      const contentWithDocosaurusDocTags = injectDocusaurusDocTags(manipualtedContent, content);

      // Create markdown files locally with downloaded content
      fs.writeFileSync(`${rustLibraryDocsPath}/${content}.md`, contentWithDocosaurusDocTags);
      console.log(`Downloaded to ${rustLibraryDocsPath}/${content}.md`);

   }));

   console.log('Rust Library Content Downloaded') 
}

main();