import { checkDeployment } from "../src/lib/health.ts";
import { network, provider, readRecord } from "./operator.ts";

/// Check the live deployment once, print each answer, and exit with 1 if any
/// check failed, so a scheduler or a CI job can alert on it.
// #region monitor
const checks = await checkDeployment(provider, network.id, readRecord());
for (const check of checks) {
  console.log(`${check.ok ? "ok  " : "FAIL"}  ${check.what}`);
}
process.exitCode = checks.every((check) => check.ok) ? 0 : 1;
// #endregion monitor
