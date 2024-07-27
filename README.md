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
generate a `version.json` file in output directory, default true.

### `outputFileName: version.json`
path and file name of the build file, default `dist/version.json`

### `addMetaToIndexFile: true`
add meta to index.html file, default true.

### `replaceMeta: <meta name="buildversion" />`
the placeholder for replace real build info in indexFileName, default `<meta name="buildversion" />`

## License

Distributed under the ISC license

Copyright © 2004-2013 by Internet Systems Consortium, Inc. (“ISC”)
Copyright © 1995-2003 by Internet Software Consortium

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED “AS IS” AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

