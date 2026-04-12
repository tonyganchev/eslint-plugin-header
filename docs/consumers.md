# Consumers

The _\@tony.ganchev/eslint-plugin-header_ plugin is a trusted part of the
development workflow for several major organizations, ensuring license
compliance and consistent header structures across thousands of files.

The list is maintained manually and some information may be outdated. The links
to specific usages are bound to the version of files discovered at the time of
writing.

1. [Amazon](#amazon)
   1. [Cloudscape Design System](#cloudscape-design-system)
2. [Cratis](#cratis)
3. [Dash0](#dash0)
4. [Eclipse Foundation](#eclipse-foundation)
   1. [Eclipse GLSP](#eclipse-glsp)
5. [FlowCrypt](#flowcrypt)
6. [Google](#google)
   1. [Angular](#angular)
7. [IBM](#ibm)
8. [Microsoft](#microsoft)
   1. [Azure](#azure)
9. [Mysten Labs](#mysten-labs)
10. [Salesforce](#salesforce)
    1. [Visual Studio Code Extensions](#visual-studio-code-extensions)
    2. [Others](#others)
11. [Salto](#salto)
12. [Suwayomi](#suwayomi)
13. [Wire Swiss GmbH](#wire-swiss-gmbh)
14. [WPPConnect](#wppconnect)

## ![Logo](https://github.com/aws.png?size=24)Amazon

### ![Logo](https://github.com/cloudscape-design.png?size=24)Cloudscape Design System

Multiple projects within the
[Cloudscape Design System](https://cloudscape.design/) organization have
migrated to _\@tony.ganchev/eslint-plugin-header_ to maintain consistent
copyright headers.

The need of their [components](https://github.com/cloudscape-design/components)
repository to allow for [leading `@jest-environement`](https://github.com/tonyganchev/components/blob/471d9b28d2f9a7bce36bc1ddffe801131c1ad23d/src/__tests__/functional-tests/ssr.test.ts#L1-L3)
pragma comments led to the introduction of support for leading comments in the
plugin as of v3.3.0.

- _board-components_ - [.eslintrc](https://github.com/cloudscape-design/board-components/blob/c63312783f6bc14df9b27f91de190a5d83460bb1/.eslintrc#L55-L71)
- _browser-test-tools_ - [.eslintrc](https://github.com/cloudscape-design/browser-test-tools/blob/04b77d2dd84fdba42db38baa84258d920b71356f/.eslintrc#L15-L19)
- _build-tools_ - [.eslintrc](https://github.com/tonyganchev/build-tools/blob/b39854f59b33042af603a66daf0bde638c31ee07/.eslintrc#L14-L18)
- _chart-components_ - [.eslintrc](https://github.com/cloudscape-design/chart-components/blob/9b7fc8d42ddf112bc8900c5c3a6a3d484121e903/.eslintrc#L57-L76)
- _chat-components_ - [.eslintrc](https://github.com/cloudscape-design/chat-components/blob/7695be4f26f3ccd3397f7eb8fb7f330a77d1760f/.eslintrc#L57-L73)
- _code-view_ - [eslint.config.mjs](https://github.com/cloudscape-design/code-view/blob/db57dbe9060a01e6d4c082329266d763b18b5890/eslint.config.mjs#L72-L76)
- _collection-hooks_ - [.eslintrc](https://github.com/tonyganchev/collection-hooks/blob/acbcc8b49482c892ee04d0a28d51ff11c1cca2ac/.eslintrc#L29-L33)
- _components_ - [eslint.config.mjs](https://github.com/tonyganchev/components/blob/c8acad4a9425c8606818bd6101f87bb50a21cefc/eslint.config.mjs#L110-L129)
- _component-toolkit_ - [.eslintrc](https://github.com/tonyganchev/component-toolkit/blob/139e48a11dca243f06d0e590c465a62ce2bf87f7/.eslintrc#L56-L79)
- _demos_ - [.eslintrc](https://github.com/cloudscape-design/demos/blob/9cec249e39ab69c363ec643b5a8b52b30a531416/.eslintrc#L29-L33)
- _documenter_ - [eslint.config.mjs](https://github.com/cloudscape-design/documenter/blob/ccf55e902c5d093d6ae0e2de776f028c65f4702b/eslint.config.mjs#L45-L49)
- _global-styles_ - [eslint.config.mjs](https://github.com/tonyganchev/global-styles/blob/247b268aaddb325c7e08bddd4c5ce00dd0ec79d5/eslint.config.mjs)
- _jest-presets_ - [.eslintrc](https://github.com/cloudscape-design/jest-preset/blob/70e5e08fcaf63667ce6b1b52d3fb974a99468569/.eslintrc#L16-L20)
- _test-utils_ - [eslint.config.js](https://github.com/tonyganchev/test-utils/blob/da3951773c1147020ea30ea5b8b38844272ccd71/eslint.config.js#L57-L61)
- _theming-core_ - [eslint.config.mjs](https://github.com/tonyganchev/theming-core/blob/f3f244317953045a07f7dbdd68f08d62957aa65d/eslint.config.mjs#L27-L31)

## ![Logo](https://github.com/Cratis.png?size=24)Cratis

- _Arc_ - [eslint.config.mjs](https://github.com/Cratis/Arc/blob/dd049cba298de9f3d82bf197425ade40ad1a7f8f/eslint.config.mjs#L69-L77)
- _Chronicle_ - [eslint.config.mjs](https://github.com/Cratis/Chronicle/blob/42bd3cc5b2e2c3b2edcfd0a06b993d4bc7495427/Source/Workbench/eslint.config.mjs#L73-L81)
- _Components_ - [eslint.config.mjs](https://github.com/Cratis/Components/blob/2104854735175414e0286d8e03e08ac51eac023c/eslint.config.mjs#L69-L83)
- _Fundamentals_ - [eslint.config.mjs](https://github.com/Cratis/Fundamentals/blob/aae80f92186a834ee2ec64bd11d3281211911902/eslint.config.mjs#L69-L80)

## ![Logo](https://github.com/dash0hq.png?size=24)Dash0

- _opentelemetry-js-distribution_ - [eslint.config.mjs](https://github.com/dash0hq/opentelemetry-js-distribution/blob/52fa43055de5d8273f32651b423e3152939d2724/eslint.config.mjs#L30-L40)

## ![Logo](https://github.com/eclipse.png?size=24)Eclipse Foundation

### ![Logo](https://github.com/eclipse-glsp.png?size=24)Eclipse GLSP

- _eslint-config_ - [errors.js](https://github.com/eclipse-glsp/glsp/blob/b3f9de793d801e1d9002e0a500d1ea37b14a5e96/dev-packages/eslint-config/configs/errors.js#L47-L71)
- _glsp-client_ - [yarn.lock](https://github.com/eclipse-glsp/glsp-client/blob/d60eef80376ff83a706d3cd536a9fe049afb70cd/yarn.lock#L293)
- _glsp-playwright_ - [yarn.lock](https://github.com/eclipse-glsp/glsp-playwright/blob/eec48b0b7207e5c3a0eade8894aa370c7596f18f/yarn.lock#L277)
- _glsp-theia-integration_ - [yarn.lock](https://github.com/eclipse-glsp/glsp-theia-integration/blob/79bfc7263fe3e4c22b58ed9a586cadf89a556d7f/yarn.lock#L898)
- _glsp-server-node_ - [yarn.lock](https://github.com/eclipse-glsp/glsp-server-node/blob/978a9cd079d5ea3aaac1fe7dade9c126f4a7ae03/yarn.lock#L260)
- _glsp-vscode-integration_ - [yarn.lock](https://github.com/eclipse-glsp/glsp-vscode-integration/blob/ab46e724bec16a7de1598b16f4216057e0e61aa0/yarn.lock#L407)

## ![Logo](https://github.com/FlowCrypt.png?size=24)FlowCrypt

- _flowcrypt-browser_ - [eslint.config.mjs](https://github.com/FlowCrypt/flowcrypt-browser/blob/9c959de7c1308ac205b65d8ff32477172083b4f2/eslint.config.mjs#L27)

## ![Logo](https://github.com/google.png?size=24)Google

### ![Logo](https://github.com/angular.png?size=24)Angular

- _angular-cli_ - [eslint.config.mjs](https://github.com/angular/angular-cli/blob/81e4faae7699e2ed1eb8f4656dc115ca9c20f416/eslint.config.mjs#L113-L126)

## ![Logo](https://github.com/ibm.png?size=24)IBM

- _InspectorRAGet_ - [eslint.config.mjs](https://github.com/IBM/InspectorRAGet/blob/2d713d751724d4ee9154b1a69fafd232d7e46db9/eslint.config.mjs#L18-L44)

## ![Logo](https://github.com/microsoft.png?size=24)Microsoft

A lot of Microsoft plugins and tools for developing plugins for the Visual
Studio Code ecosystem have bet on this plugin.

- _Agent-M365Copilot_ - [package.json](https://github.com/microsoft/Agents-M365Copilot/blob/c4de084d5fba624cb882b48432d545e1b53bba09/typescript/package.json#L6)
- _compose-language-service_ - [package-lock.json](https://github.com/microsoft/compose-language-service/blob/5711114c179c9b0b227ee9628def608a7ba60fbf/package-lock.json#L693)
- _kiota-typescript_ - [eslint.config.mjs](https://github.com/microsoft/kiota-typescript/blob/cfe3f3e90260cc154843b1ddd08ce2659c022d2c/eslint.config.mjs#L77-L84)
- _msgraph-training-typescript_ - [eslint.config.js](https://github.com/microsoftgraph/msgraph-training-typescript/blob/fb48284c3f30374e83da494e72800580a0e0e58c/user-auth/graphtutorial/eslint.config.js#L45-L53)
- _vscode-azureappservice - [package-lock.json](https://github.com/microsoft/vscode-azureappservice/blob/620e9986d8c3fc70a718faba4d35803ab18beb55/package-lock.json#L1717)
- _vscode-azurecontainerapps_ - [package-lock.json](https://github.com/microsoft/vscode-azurecontainerapps/blob/5744f8a3d1abd9de72a53096dfb65e5bb4adbb5a/package-lock.json#L3565)
- _vscode-azurefunctions_ - [package-lock.json](https://github.com/microsoft/vscode-azurefunctions/blob/4df45bea4af316c3b57bfa1a5ba584c8b02f8ada/package-lock.json#L2091)
- _vscode-azureresource_groups_ - [package-lock.json](https://github.com/microsoft/vscode-azureresourcegroups/blob/bc7d5abbae0d2d2452e002261b6e8b684e1269f2/package-lock.json#L1527)
- _vscode-azurestaticwebapps_ - [package-lock.json](https://github.com/microsoft/vscode-azurestaticwebapps/blob/2c3afada13d5c83c87b06b90457ebf106a6088df/package-lock.json#L1427)
- _vscode-azurestorage_ - [package-lock.json](https://github.com/microsoft/vscode-azurestorage/blob/7a37347e12e65bb0cb90b5c6626d23a93cd57e0c/package-lock.json#L1716)
- _vscode-azuretools_ - [eslintConfigs.ts](https://github.com/microsoft/vscode-azuretools/blob/6784f2e199764bcb1c2214b7d4866b14fcdab5ba/eng/src/eslint/eslintConfigs.ts#L50-L78)
- _vscode-azurevirtualmachines_ - [package-lock.json](https://github.com/microsoft/vscode-azurevirtualmachines/blob/bb51857363e22887957bca88c1c9392c6368e57d/package-lock.json#L1709)
- _vscode-containers_ - [package-lock.json](https://github.com/microsoft/vscode-containers/blob/3a2566e22b35f658f8ff4b9a6435dfc9288d0e82/package-lock.json#L1609)
- _vscode-test-web_ - [eslint.config.mjs](https://github.com/microsoft/vscode-test-web/blob/e04a5e5a4c06479cc1cc98c47b32e1dd01c870bf/eslint.config.mjs#L43-L51)

### ![Logo](https://github.com/azure.png?size=24)Azure

- _azure-dev_ - [eslint.config.mjs](https://github.com/Azure/azure-dev/blob/b70678d427e2e0d2863f744595dbdf0648dfdc76/ext/vscode/eslint.config.mjs#L13-L33)

## ![Logo](https://github.com/MystenLabs.png?size=24)Mysten Labs

- _sagat_ - [eslint.config.js](https://github.com/MystenLabs/sagat/blob/4fc2268c359830e0a8530307c060848a3a4b03f3/eslint.config.js#L72-L80)

## ![Logo](https://github.com/forcedotcom.png?size=24)Salesforce

### Visual Studio Code Extensions

The [Salesforce Extensions for VS Code](https://github.com/forcedotcom/salesforcedx-vscode)
project, maintained by Salesforce, leverages the plugin to enforce header
patterns across its suite of development tools. This ensures that the high
volume of contributions to the project remains compliant with Salesforce's
licensing requirements.

- _salesforcedx-vscode_ - [eslint.config.mjs](https://github.com/forcedotcom/salesforcedx-vscode/blob/c930f7ddf05ff1da5c363ebc4a2fd3931d13f02d/eslint.config.mjs#L190-L204)

### Others

- _apex-language-support_ - [eslint.config.mjs](https://github.com/forcedotcom/apex-language-support/blob/0f8c037464411af103df651bfabf866cd2341c54/eslint.config.mjs#L75-L90)

## ![Logo](https://github.com/salto-io.png?size=24)Salto

- [eslint.config.mjs](https://github.com/salto-io/salto/blob/8696742b05b7349720f73ce100a5d984e1f2a659/eslint.config.mjs#L94-L106)

## ![Logo](https://github.com/Suwayomi.png?size=24)Suwayomi

The team uses the plugin with _oxlint_. With the old plugin versions they had to
create wrapper since oxlint failed validation of the defaults of the plugin but
this is no longer necessary as of v3.3.2.

- _Suwayomi-WebUI_ - [.oxlintrc.jsonc](https://github.com/Suwayomi/Suwayomi-WebUI/blob/d738de2c61105a0fbeec57d1ce940492337b608c/.oxlintrc.jsonc#L364-L372)

## ![Logo](https://github.com/wireapp.png?size=24)Wire Swiss GmbH

The _wire-webapp_ team are the first one to use TypeScript-based configuration
which became available in v3.2.1.

- _wire-webapp_ - [eslint.config.ts](https://github.com/wireapp/wire-webapp/blob/05737e3845f41a6c7f86685b0263ee5aff805812/eslint.config.ts#L129-L162)

## ![Logo](https://github.com/wppconnect-team.png?size=24)WPPConnect

- _wa-js_ - [eslint.config.mjs](https://github.com/wppconnect-team/wa-js/blob/b56e7e0b0dee2b53bae08c3b4a0025bc1491f786/eslint.config.mjs#L66-L89)
- _wa-version_ - [eslint.config.js](https://github.com/wppconnect-team/wa-version/blob/4257ecc794d0ee04e141f3d36a6fc8b3c6414f6f/eslint.config.js#L34-L58)
- _wppconnect_ - [eslint.config.mjs](https://github.com/wppconnect-team/wppconnect/blob/59e8c4cd043cb9ea4ecf31940753a63b8408a5a2/eslint.config.mjs#L51)
