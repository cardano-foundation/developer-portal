import fetch from 'node-fetch';
import * as fs from 'fs';

const tokenRegistryDocsPath: string = './docs/native-tokens/token-registry';
const repoRawWikiHomeUrl: string = 'https://raw.githubusercontent.com/wiki/cardano-foundation/cardano-token-registry/';

const getStringContentAsync = async (url: string) => {
    return await fetch(url).then(res => res.text());
}

// Manipulate URL string 
const tokenRegistryStringManipulation = (content: string) => {

    // Replace empty space with '-' for url purpose
    content = content.replace(/\s/g, '-');

    // Replace '?' with '%3F' for url purpose
    content = content.replace(/\?/g, '%3F');

    // Replace '(' with '%28' for url purpose
    content = content.replace(/\(/g, '%28');

    // Replace ')' with '%29' for url purpose
    content = content.replace(/\)/g, '%29');

    return content;
}

// Manipulate markdown file name
const markdownStringManipulation = (content: string) => {

    // Replace empty space with '-'
    content = content.replace(/\s/g, '-');

    // Replace '?' with '%3F'
    content = content.replace(/\?/g, '%3F');

    // Replace '(' with ''
    content = content.replace(/\(/g, '');

    // Replace ')' with ''
    content = content.replace(/\)/g, '');

    return content;
}

// Inject extra docusarus doc tags
const injectDocusaurusDocTags = (content: string, url: string) => {

    // Remove '---' from doc to add it later
    content = content.substring(0, 3) === '---' ? content.slice(3) : content;

    // Add '---' with doc tags for Docusaurus
    content = '--- \nsidebar_label: ' + url +'\ntitle: '+url + '\n--- ' +'\n'+content;

    return content;
}

const main = async () => {
    
  // Fetch raw wiki content for token registry
  const wikiHomeContent = await getStringContentAsync(`${repoRawWikiHomeUrl}Home.md`);

  // Find wiki file names in order to fetch them individually
  const contentUrls = wikiHomeContent.match(/(?<=\[\[)(.*?)(?=\]\])/g);
  const tokeRegistryUniqueUrls = [...new Set(contentUrls)];

  // Create token registry folder to store markdown files locally
  fs.rmdirSync(tokenRegistryDocsPath, { recursive: true });
  fs.mkdirSync(tokenRegistryDocsPath, { recursive: true });

  // Save Token Registry markdowns into docs folder
  await Promise.all(tokeRegistryUniqueUrls.map(async (content) => {
      
      // Get toke registry url
      const tokenRegistryUrl  = await  tokenRegistryStringManipulation(content);

      // Get markdown file names
      const markdownFileName = await  markdownStringManipulation(content);

      // Download markdown files
      const result = await getStringContentAsync(`${repoRawWikiHomeUrl}${tokenRegistryUrl}.md`);

      // Finish manipulation with injecting docosautus doc tags
      const manipulatedContent = injectDocusaurusDocTags(result, content);

      // Create markdown files locally with downloaded content
      fs.writeFileSync(`${tokenRegistryDocsPath}/${markdownFileName}.md`, manipulatedContent);

   }));

}

main();