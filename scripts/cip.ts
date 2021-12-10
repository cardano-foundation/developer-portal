import fetch from 'node-fetch';
import * as fs from 'fs';

const repoRawBaseUrl: string = 'https://raw.githubusercontent.com/cardano-foundation/CIPs/master/';
const readmeUrl: string = '/README.md';
const readmeRegex = /\.\/CIP.*?\//gm;
const cipRegex = /\]\(.*?.png\)|\]\(.*?.jpg\)|\]\(.*?.jpeg\)/gm;
const cipDocsPath = "./docs/cardano-improvement-proposals";
const cipStaticResourcePath = "./static/cip/";

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

                fs.rmdirSync(`${cipStaticResourcePath}${cipName}`, { recursive: true });
                fs.mkdirSync(`${cipStaticResourcePath}${cipName}`, { recursive: true });

                fs.writeFileSync(`${cipStaticResourcePath}${cipName}/${fileName}`, new Uint8Array(buffer));

                // Rewrite link to static folder
                content = content.replace(fileName, `../../static/cip/${cipName}/${fileName}`);
                console.log(`Processed CIP content downloaded to ${cipStaticResourcePath}${cipName}/${fileName}`);
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

    // TODO: # abstract

    // TODO: # sidebar label

    // TODO: # title


    return content;
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

        fs.mkdirSync(`${cipDocsPath}/${cipName}`, { recursive: true });

        fs.writeFileSync(`${cipDocsPath}/${cipName}/${fileName}`, content);
        console.log(`Downloaded to ${cipDocsPath}/${cipName}/${fileName}`);
    }));

    console.log("CIP Content Downloaded");
}

main();