# vite-plugin-git-version

This plugin will generate a `version.json` file and add build information that contains build time、project name, version、branch、commit id into `index.html` head meta when vite the current repository on a local git repository.
It is a fork of https://github.com/east0422/vite-plugin-git-version
 
## Usage

install it as a local development dependency:

  ```bash
  npm install @mirolago/vite-plugin-git-version -D
  ```

Then, simply configure it as a plugin in the vite config `vite.config.ts`:

  ```ts
  import { VitePluginGitVersion } from '@mirolago/vite-plugin-git-version'

  export default defineConfig({
    ...
    plugins: [
      ...
      VitePluginGitVersion()
    ]
  })
  ```

This will generate a file `version.json`:

  ```
  {
    "projectName": "xxx",
    "projectVersion": "xxx",
    "branchName": "xxx",
    "commitId": "xxx",
    "commitTime": "xxx",
    "buildTime": "xxx",
  }
  ```

and add meta into head `index.html`

  ```
  <head>
  ...
  <meta name="pkgInfo" content="project:xxx branch:xxx commit:xxx">
  <meta name="buildInfo" content="version:xxx buildTime:xxx">
  ...
  </head>
  ```

## Configuration

The plugin requires no configuration by default, but it is possible to configure it to support custom build info.

### `isBuildFile: true`
whether or not generate a `version.json` file in output directory, default true.

### `outputFileName: version.json`
path and file name of the build file, default `dist/version.json`

### `addMetaToIndexFile: true`
whether or not add meta to index.html file, default true.

### `replaceMeta: <meta name="buildversion" />`
the placeholder for replace real build info in indexFileName, default `<meta name="buildversion" />`
