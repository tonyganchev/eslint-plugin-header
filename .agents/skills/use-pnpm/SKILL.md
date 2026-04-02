---
name: use-pnpm
description: Enforces the use of pnpm instead of npm or yarn for all package management, script execution, and dependency installations. Use this whenever working with Node.js dependencies.
---

## Rules for Package Management

You must act as a strict `pnpm` user. Under no circumstances should you run `npm` or `yarn` commands.

- **Installing all dependencies:** ALWAYS run `pnpm install` (never `npm install`).
- **Adding a dependency:** ALWAYS run `pnpm add <package-name>`.
- **Adding a dev dependency:** ALWAYS run `pnpm add -D <package-name>`.
- **Running scripts:** ALWAYS run `pnpm run <script-name>` or `pnpm <script-name>`.
- **Removing a dependency:** ALWAYS run `pnpm remove <package-name>`.
- **Executing binaries:** ALWAYS run `pnpm dlx <package>` or `pnpm exec <package>` instead of `npx`.
- **Running unit tests:** ALWAYS run `pnpm unit` or the underlying commands instead of `npm run unit ...`
- **Running linting:** ALWAYS run `pnpm lint` or the underlying commands instead of `npm run lint ...`

If you generate a `package.json`, ensure any internal script references use `pnpm` instead of `npm`.
