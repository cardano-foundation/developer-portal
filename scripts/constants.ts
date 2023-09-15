// CIP constants 
const cip_readme_url: string = "/README.md";
const cip_readme_regex: RegExp = /\.\/CIP.?\/|\.\/CIP-.*\)/gm;
const cip_source_repo: string = "cardano-foundation/CIPs";
const cip_static_resource_path: string = "/static/img/cip/";
const cip_docs_path: string = "./docs/governance/cardano-improvement-proposals";
const cip_regex: RegExp =
  /\]\(.*?.png\)|\]\(.*?.jpg\)|\]\(.*?.jpeg\)|\]\(.*?.json\)/gm;
const cip_repo_base_url: string =
  "https://github.com/cardano-foundation/CIPs/tree/master/";
const cip_repo_raw_base_url: string =
  "https://raw.githubusercontent.com/cardano-foundation/CIPs/master/";

// CPS constants
const cps_repository_url: string =
  "https://api.github.com/repos/cardano-foundation/CIPs/contents";
const cps_target_folder: string =
  "./docs/governance/cardano-problem-statements";

// Rust Library constants
const rl_static_resource_path: string = "/tree/master/doc/getting-started";
const rl_docs_path: string = "./docs/get-started/cardano-serialization-lib";
const rl_repo_base_url: string =
  "https://github.com/Emurgo/cardano-serialization-lib";
const rl_raw_base_index_url: string =
  "https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/index.rst";
const rl_repo_raw_base_url: string =
  "https://raw.githubusercontent.com/Emurgo/cardano-serialization-lib/master/doc/getting-started/";

// Token Registry constants
const tr_docs_path: string = "./docs/native-tokens/token-registry";
const tr_github_wiki: string =
  "https://github.com/cardano-foundation/cardano-token-registry/wiki";
const tr_url: string =
  "https://github.com/cardano-foundation/cardano-token-registry/blob/master/";
const tr_raw_wiki_url: string =
  "https://raw.githubusercontent.com/wiki/cardano-foundation/cardano-token-registry/";
const tr_overview_url: string =
  "https://raw.githubusercontent.com/cardano-foundation/cardano-token-registry/master/README.md";

// General constants
const custom_edit_url = "\ncustom_edit_url: null"

export {
  cip_readme_url,
  cip_readme_regex,
  cip_source_repo,
  cip_static_resource_path,
  cip_docs_path,
  cip_regex,
  cip_repo_base_url,
  cip_repo_raw_base_url,
  cps_repository_url,
  cps_target_folder,
  rl_static_resource_path,
  rl_docs_path,
  rl_repo_base_url,
  rl_raw_base_index_url,
  rl_repo_raw_base_url,
  tr_docs_path,
  tr_github_wiki,
  tr_url,
  tr_raw_wiki_url,
  tr_overview_url,
  custom_edit_url,
};
