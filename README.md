## aat-releaser

CLI tool to automate release documentation.

#### Usage
Clone the repo, and make accessible from the command line using `npm link`. Then to use the CLI:

```
aat-releaser <RELEASE-NO>
```
The CLI will then do the following:
- Update the `package.json` with the new release number, and any new authors
- Update `CHANGELOG.md` with all data related to the matching milestone (description, issues)
