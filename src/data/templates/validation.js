import { difference } from "@site/src/utils/arrays";
import { FrameworkList, SdkList, WalletList } from "./tags";

// Fail-fast on common errors (runs at build via src/data/templates.js).
export function ensureTemplateValid(template) {
  function checkFields() {
    const validKeys = [
      "title",
      "description",
      "repoPath",
      "framework",
      "sdk",
      "wallet",
      "maintainerPick",
      "detail",
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

  function checkRepoPath() {
    if (!template.repoPath.startsWith("examples/templates/")) {
      throw new Error(`repoPath should point at examples/templates/<name>: ${template.repoPath}`);
    }
  }

  function checkDetail() {
    if (template.detail === undefined) return;
    const validDetailKeys = ["guide", "prereqs", "steps", "after"];
    const unknownKeys = difference(Object.keys(template.detail), validDetailKeys);
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown detail attribute names=[${unknownKeys.join(",")}]`);
    }
    (template.detail.steps || []).forEach((step, i) => {
      if (!step.lead) throw new Error(`detail.steps[${i}] is missing lead`);
    });
  }

  try {
    checkFields();
    ["title", "description", "repoPath"].forEach(checkRequired);
    checkRepoPath();
    checkEnum("framework", FrameworkList);
    checkEnum("sdk", SdkList);
    checkEnum("wallet", WalletList);
    checkDetail();
  } catch (e) {
    throw new Error(`Template with title=${template.title} contains errors:\n${e.message}`);
  }
}
