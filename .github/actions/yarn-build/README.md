# Yarn Build action

Composite Docker action that runs a single `yarn` command (for example `install` or `build`) in CI.

It exists to work around git's `safe.directory` ownership check on the Actions runner before
invoking yarn; see `entrypoint.sh`. Adapted from
[Borales/actions-yarn](https://github.com/Borales/actions-yarn) and trimmed to what this repo
needs (the npm auth-token handling was removed).

## Inputs

| Input | Required | Description |
| ----- | -------- | ----------- |
| `cmd` | yes      | The yarn command to run, e.g. `install` or `build`. |

## Usage

```yaml
steps:
  - uses: actions/checkout@v7
  - uses: ./.github/actions/yarn-build
    with:
      cmd: install   # runs `yarn install`
  - uses: ./.github/actions/yarn-build
    with:
      cmd: build     # runs `yarn build`
```
