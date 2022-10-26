import {generateMerkleTree, generateProof} from "./WLutils"

async function main() {
    const merkleTree = await generateMerkleTree();
    console.log(merkleTree)
    console.log(merkleTree.getHexRoot())
    console.log(await generateProof("0xE5f4497749861C9255264bA01DA8B16F6dF75b26"))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
