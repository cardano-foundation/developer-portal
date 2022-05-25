//CIP constants 
export const CIPRepoBaseUrl: string = 'https://github.com/cardano-foundation/CIPs/tree/master/';
export const CIPRepoRawBaseUrl: string = 'https://raw.githubusercontent.com/cardano-foundation/CIPs/master/';
export const CIPReadmeUrl: string = '/README.md';
export const CIPPReadmeRegex = /\.\/CIP.*?\//gm;
export const CIPRegex = /\]\(.*?.png\)|\]\(.*?.jpg\)|\]\(.*?.jpeg\)|\]\(.*?.json\)/gm;
export const CIPDocsPath = "./docs/governance/cardano-improvement-proposals";
export const CIPStaticResourcePath = "/static/img/cip/";
export const CIPSourceRepo = "cardano-foundation/CIPs";

// Rust Library constants 
export const RLRepoRawBaseUrl: string = 'https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/getting-started/';
export const RLRepoBaseUrl: string = 'https://github.com/Emurgo/cardano-serialization-lib'
export const RLStaticResourcePath: string = '/tree/master/doc/getting-started'
export const RLDocsPath: string = './docs/get-started/cardano-serialization-lib';
export const RLnamesRawBaseIndexUrl: string = 'https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/index.rst';

//Token Registry contants
export const TRDocsPath: string = './docs/native-tokens/token-registry';
export const TRUrl: string = 'https://github.com/cardano-foundation/cardano-token-registry/blob/master/';
export const TROverviewUrl: string = 'https://raw.githubusercontent.com/cardano-foundation/cardano-token-registry/master/README.md';
export const TRWiki: string = 'https://github.com/cardano-foundation/cardano-token-registry/wiki';
export const TRrepoRawWikiHomeUrl: string = 'https://raw.githubusercontent.com/wiki/cardano-foundation/cardano-token-registry/';