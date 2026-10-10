/**
 * Read one figure out of an example project's `costs.json`, so a docs page
 * never contains a measured number typed by hand.
 *
 * The path names the figure the way the JSON nests it, dot-separated:
 *
 *     costFigure(Costs, "pools.naive.sweeps.10.mem")      // "4,745,240"
 *     costFigure(Costs, "pools.naive.sweeps.10.fee", "ada") // "0.645583"
 *     costFigure(Costs, "pools.naive.largestSweep")        // "18"
 *
 * A path that matches nothing throws, so renaming a scenario in the benchmark
 * breaks `yarn build` instead of silently leaving a stale page.
 *
 * @module costFigure
 */

const lookup = (costs, path) => {
  const value = path.split('.').reduce((node, key) => node?.[key], costs);
  if (typeof value !== 'number') {
    throw new Error(`costFigure: no figure at "${path}" in costs.json`);
  }
  return value;
};

const formats = {
  /** A count or an execution unit, with thousands separators. */
  number: (value) => value.toLocaleString('en-US'),
  /** Lovelace shown as ADA, to the lovelace. */
  ada: (value) => (value / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 6 }),
};

/**
 * @param {object} costs  The parsed `costs.json`.
 * @param {string} path  Dot-separated path to a number inside it.
 * @param {'number'|'ada'} [as]  How to print it.
 * @returns {string}
 * @throws If the path does not lead to a number, or the format is unknown.
 */
export default function costFigure(costs, path, as = 'number') {
  const format = formats[as];
  if (!format) {
    throw new Error(`costFigure: unknown format "${as}". Use one of: ${Object.keys(formats).join(', ')}`);
  }
  return format(lookup(costs, path));
}

/**
 * How much smaller the figure at `path` is than the one at `baseline`, as a
 * whole percentage.
 *
 *     costSaving(Costs, "pools.naive.sweeps.10.mem", "pools.withdrawByHand.sweeps.10.mem") // "80%"
 *
 * @param {object} costs  The parsed `costs.json`.
 * @param {string} baseline  Path to the figure being improved on.
 * @param {string} path  Path to the improved figure.
 * @returns {string}
 * @throws If either path does not lead to a number.
 */
export function costSaving(costs, baseline, path) {
  const before = lookup(costs, baseline);
  const after = lookup(costs, path);
  return `${Math.round((1 - after / before) * 100)}%`;
}
