# Build Yarn Action

This github actions provides arbirary actions for the yarn cli command.
The main reason for writing this was that i needed to add a fix for gits
safe directory thing, see entrypoint.sh.

The code mostly is taken from https://github.com/Borales/actions-yarn
but simplified. Mostly removed the npm auth token stuff, which we wont need
in the near future. And then the original action might have a fix for
the git safedir issue built in so we might want to remove this action
alltogether.


To use this action
    name: CI
    on: [push]
    jobs:
        build:
            name: Test
            runs-on: ubuntu-latest
            steps:
                - uses: actions/checkout@v2
                - uses: ./.github/actions/yarn-build
                  with:
                    cmd: install   # will run `yarn install` command
                - uses: ./.github/actions/yarn-build
                  with:
                    cmd: build # will run `yarn build` command
