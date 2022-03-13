--- 
sidebar_label: How do I update my entry in the registry?
title: How do I update my entry in the registry?

--- 
In this case, the procedure is the same as for registering new metadata:
1. Start from scratch with a new JSON file using token-metadata-creator OR
2. Update your raw JSON file (the one that hasn't been signed and finalized ending with .json.draft) and edit the values that need to change manually or use token-metadata-creator
3. Prior to signing the entry (with the -a | --attest-keyfile option), manually edit the .json.draft file and increment the 'sequenceNumber' for the relevant fields 
4. Sign the new entry (will produce new signatures that will replace the existing ones for updated fields)
5. Finalize the submission using token-metadata-creator
6. Submit a pull request  
## Token Registry Information  
This page was generated automatically from: [https://github.com/cardano-foundation/cardano-token-registry/wiki](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-do-I-update-my-entry-in-the-registry%3F).