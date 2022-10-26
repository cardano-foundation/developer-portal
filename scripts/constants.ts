//CIP constants 
const CIPReadmeUrl: string = "/README.md";
const CIPPReadmeRegex: RegExp = /\.\/CIP.*?\/|\.\/CIP-.*?\)/gm
const CIPSourceRepo: string = "cardano-foundation/CIPs";
const CIPStaticResourcePath: string = "/static/img/cip/";
const CIPDocsPath: string = "./docs/governance/cardano-improvement-proposals";
const CIPRegex: RegExp = /\]\(.*?.png\)|\]\(.*?.jpg\)|\]\(.*?.jpeg\)|\]\(.*?.json\)/gm;
const CIPRepoBaseUrl: string = "https://github.com/cardano-foundation/CIPs/tree/master/";
const CIPRepoRawBaseUrl: string = "https://raw.githubusercontent.com/cardano-foundation/CIPs/master/";

// Rust Library constants 
const RLStaticResourcePath: string = "/tree/master/doc/getting-started";
const RLDocsPath: string = "./docs/get-started/cardano-serialization-lib";
const RLRepoBaseUrl: string = "https://github.com/Emurgo/cardano-serialization-lib";
const RLnamesRawBaseIndexUrl: string = "https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/index.rst";
const RLRepoRawBaseUrl: string = "https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/getting-started/";

//Token Registry contants
const TRDocsPath: string = "./docs/native-tokens/token-registry";
const TRWiki: string = "https://github.com/cardano-foundation/cardano-token-registry/wiki";
const TRUrl: string = "https://github.com/cardano-foundation/cardano-token-registry/blob/master/";
const TRrepoRawWikiHomeUrl: string = "https://raw.githubusercontent.com/wiki/cardano-foundation/cardano-token-registry/";
const TROverviewUrl: string = "https://raw.githubusercontent.com/cardano-foundation/cardano-token-registry/master/README.md";

export  {CIPReadmeUrl, CIPPReadmeRegex, CIPSourceRepo, CIPStaticResourcePath, CIPDocsPath, CIPRegex, CIPRepoBaseUrl, CIPRepoRawBaseUrl, RLStaticResourcePath, RLDocsPath, RLRepoBaseUrl, RLnamesRawBaseIndexUrl, RLRepoRawBaseUrl, TRDocsPath, TRWiki, TRUrl, TRrepoRawWikiHomeUrl, TROverviewUrl};