import fetch from 'node-fetch';
import * as fs from 'fs';

const repoRawBaseUrl: string = 'https://raw.githubusercontent.com/cardano-foundation/CIPs/master/';
const readmeUrl: string = '/README.md';
const readmeRegex = /\.\/CIP.*?\//gm;
const cipRegex = /\]\(.*?.png\)|\]\(.*?.jpg\)|\]\(.*?.jpeg\)/gm;
const cipDocsPath = "./docs/governance/cardano-improvement-proposals";
const cipStaticResourcePath = "/static/img/cip/";

const getStringContentAsync = async (url: string) => {
    return await fetch(url).then(res => res.text());
}

const getBufferContentAsync = async(url: string) => { 
    return await fetch(url).then(res => res.arrayBuffer());
}

// Download markdown resources
const processCIPContentAsync = async (cipName: string, content: string) => {

    const cipResources = content.match(cipRegex);
    if(cipResources) {
        await Promise.all(cipResources.map(async r => { 
            if(r.indexOf("http://") < 0 && r.indexOf("https://") < 0)
            {
                // create filenames to download into static folder
                const fileName = r
                    .replace("](", "")
                    .replace(".png)",".png")
                    .replace(".jpg)",".jpg")
                    .replace(".jpeg)",".jpeg");
                
                const buffer = await getBufferContentAsync(`${repoRawBaseUrl}${cipName}/${fileName}`);

                fs.rmdirSync(`.${cipStaticResourcePath}${cipName}`, { recursive: true });
                fs.mkdirSync(`.${cipStaticResourcePath}${cipName}`, { recursive: true });

                fs.writeFileSync(`.${cipStaticResourcePath}${cipName}/${fileName}`, new Uint8Array(buffer));

                // Rewrite link to static folder
                content = content.replace(fileName, `../../..${cipStaticResourcePath}${cipName}/${fileName}`);
                console.log(`Processed CIP content downloaded to .${cipStaticResourcePath}${cipName}/${fileName}`);
            }
        }));
    }

    // Ensure compatibility
    content = stringManipulation(content, cipName);

    return content;
}

// String manipulations to ensure compatibility
const stringManipulation = (content: string, cipName: string) => {

    // We expect markdown files, therefore strip HTML
    content = content.replace( /(<([^>]+)>)/ig, "");

    // Rewrite relative links like [Byron](./Byron.md) to absolute links. 
    content = content.replace( /\]\(\.\//gm, "](" + repoRawBaseUrl + cipName + "/");

    // Remove invalid "CIP-YET-TO-COME" links that are empty
    content = content.replace("]()", "]");

    // Remove unterminated string constant like in CIP 30
    content = content.replace(/\\/g, '');

    // Prevent H1 headlines as otherwise Docusaurus takes this as title
    content =  content.includes('# Abstract') && !content.includes('## Abstract') ? content.replace('# Abstract', '## Abstract') : content;

    // Inject Docusaurus doc tags for title and a nice sidebar
    content = injectDocusaurusDocTags(content);

    return content;
}

// Add Docusaurus doc tags
const injectDocusaurusDocTags = (content: string) => {

    // Parse information from markdown file
    const title = getDocTag(content, "Title");
    const cipNumber = getDocTag(content, "CIP");

    // Remove "---" from doc to add it later
    content = content.substring(0, 3) === "---" ? content.slice(3) : content;

    // Add "---" with doc tags for Docusaurus
    content = "--- \nsidebar_label: " + "("+cipNumber+") " + title+"\ntitle: "+title+"\n"+content;

    return content;
}

// Get a specific doc tag
const getDocTag = (content: string, tagName: string) => {
    return content.match(new RegExp(`(?<=${tagName}: ).*`, ''));
}

const main = async () => {
    console.log("CIP Content Downloading...");
    // Use https://raw.githubusercontent.com/cardano-foundation/CIPs/master/README.md as entry point to get URLs
    const readmeContent = await getStringContentAsync(`${repoRawBaseUrl}${readmeUrl}`);
    const cipUrls = readmeContent.match(readmeRegex);
    const cipUrlsUnique = [...new Set(cipUrls)];

    fs.rmdirSync(cipDocsPath, { recursive: true });
    fs.mkdirSync(cipDocsPath, { recursive: true });

    // Save CIP Readme into docs
    await Promise.all(cipUrlsUnique.map(async (cipUrl) => {

        const fileName: string = "README.md"; 
        const cipName: string = cipUrl.substring(2, cipUrl.length-1); // ./CIP-xxx/ --> CIP-xxx

        let content = await getStringContentAsync(cipUrl.replace("./", repoRawBaseUrl)+ fileName);
        content = await processCIPContentAsync(cipName, content);

        fs.writeFileSync(`${cipDocsPath}/${cipName}-${fileName}`, content);
        console.log(`Downloaded to ${cipDocsPath}/${cipName}-${fileName}`);
    }));

    console.log("CIP Content Downloaded");
}

main();