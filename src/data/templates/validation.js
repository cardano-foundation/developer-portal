import { difference } from "@site/src/utils/jsUtils";
import { UseCaseList, FrameworkList, SdkList, WalletList } from "./tags";

// Fail-fast on common errors (runs at build via src/data/templates.js).
export function ensureTemplateValid(template) {
  function checkFields() {
    const validKeys = [
      "title",
      "description",
      "screenshot",
      "repoPath",
      "framework",
      "sdk",
      "wallet",
      "useCases",
      "maintainerPick",
    ];
    const unknownKeys = difference(Object.keys(template), validKeys);
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown attribute names=[${unknownKeys.join(",")}]`);
    }
  }

  function checkRequired(field) {
    if (!template[field]) throw new Error(`${field} is missing`);
  }

  function checkEnum(field, list) {
    if (!list.includes(template[field])) {
      throw new Error(`bad ${field}=[${template[field]}]. Available: ${list.join(", ")}`);
    }
  }

  function checkUseCases() {
    if (!Array.isArray(template.useCases) || template.useCases.length === 0) {
      throw new Error("useCases must be a non-empty array");
    }
    const unknown = difference(template.useCases, UseCaseList);
    if (unknown.length > 0) {
      throw new Error(`unknown useCases=[${unknown.join(", ")}]. Available: ${UseCaseList.join(", ")}`);
    }
  }

  function checkRepoPath() {
    if (!template.repoPath.startsWith("examples/templates/")) {
      throw new Error(`repoPath should point at examples/templates/<name>: ${template.repoPath}`);
    }
  }

  try {
    checkFields();
    ["title", "description", "repoPath"].forEach(checkRequired);
    checkRepoPath();
    checkEnum("framework", FrameworkList);
    checkEnum("sdk", SdkList);
    checkEnum("wallet", WalletList);
    checkUseCases();
  } catch (e) {
    throw new Error(`Template with title=${template.title} contains errors:\n${e.message}`);
  }
}
