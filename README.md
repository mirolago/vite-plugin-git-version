# vite-plugin-git-version

This plugin will generate a `version.json` file and add build information that contains build time、project name, version、branch、commit id into `index.html` head meta when vite the current repository on a local git repository.
 
## Usage

install it as a local development dependency:

  ```bash
  npm install @east0422/vite-plugin-git-version -D
  ```

Then, simply configure it as a plugin in the vite config `vite.config.ts`:

  ```ts
  import { VitePluginGitVersion } from '@east0422/vite-plugin-git-version'

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
    "commitAuthor": "xxx",
    "commitEmail": "xxx",
    "commitTime": "xxx",
    "commitMsg": "xxx",
    "buildTime": "xxx",
    "buildUserName": "xxx",
    "buildUserEmail": "xxx"
  }
  ```

and add meta into head `index.html`

  ```
  <head>
  ...
  <meta name="pkgInfo" content="project:xxx branch:xxx commit:xxx">
  <meta name="revised" content="version:xxx buildTime:xxx">
  ...
  </head>
  ```

## Configuration

The plugin requires no configuration by default, but it is possible to configure it to support custom build info.

### `isBuildFile: true`
whether or not generate a `version.json` file in output directory, default true.

### `outputFileName: version.json`
generate file name, default `version.json`

### `indexFileName: index.html`
add meta info into file name, default `index.html`

### `replaceMeta: <meta name="buildversion" />`
the placeholder for replace real build info in indexFileName, default `<meta name="buildversion" />`

### `hiddenHead: false`
whether or not hidden build info in head, default false.
