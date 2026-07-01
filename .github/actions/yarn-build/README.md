# Build Yarn Action

This GitHub Action provides arbitrary actions for the yarn CLI command.
The main reason for writing this was to add a fix for git's safe.directory
check; see entrypoint.sh.

The code is mostly taken from https://github.com/Borales/actions-yarn but
simplified. It removes the npm auth-token handling, which we don't need. The
original action may now have that safe.directory fix built in, so we might
want to remove this action altogether.

To use this action:

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
