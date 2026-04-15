---
name: keep-tidy
description: Ensures AI artifacts are kept in a folder that is part of .gitignore to avoid accidental commits.
---

## Rules for keeping the source tree tidy

* When running CLI tools, when you pass small test files to them or when you
  redirect the tools' output to a file, all of these files should go somewhere
  under `.vscode/scratch` to avoid adding them to the git source tree.
