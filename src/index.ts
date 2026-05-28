import fs from 'fs'
import path from 'path'
import { format } from 'date-fns'


import simpleGit, {SimpleGit, SimpleGitOptions} from 'simple-git'

// Initialize simple-git
const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
}
const git: SimpleGit = simpleGit(options);

interface CommitInfo {
  hash: string;
  date: string;
  branch: string;
}

const getCommitInfo = async (): Promise<CommitInfo> => {
  try {
    // Get the current branch name
    const branchSummary = await git.branch();
    // In Azure DevOps the checkout is detached HEAD, so branchSummary.current is empty.
    // Fall back to the env vars that Azure DevOps always provides.
    const currentBranch =
      branchSummary.current ||
      process.env.BUILD_SOURCEBRANCHNAME ||
      (process.env.BUILD_SOURCEBRANCH ?? '').replace(/^refs\/heads\//, '') ||
      'unknown';

    // Get the latest commit information
    const log = await git.log(['-1']); // Get the most recent commit
    const latestCommit = log.latest;

    if (!latestCommit) {
      throw new Error('No commits found.');
    }

    return {
      hash: latestCommit.hash,
      date: latestCommit.date,
      branch: currentBranch,
    };

  } catch (error) {
    throw new Error(`Error retrieving Git info: ${error}`);
  }
};

function formatBuildTimeInCommitTz(commitDate: string): string {
  // commitDate from simple-git is ISO 8601 with offset, e.g. "2026-05-28T10:30:00+02:00" or "2026-05-28 10:30:00 +0200"
  const tzMatch = commitDate.match(/([+-]\d{2}:?\d{2})$/)
  if (!tzMatch) {
    return format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX")
  }
  const raw = tzMatch[1]
  // Normalize to "+HH:MM"
  const tzOffset = raw.includes(':') ? raw : `${raw.slice(0, 3)}:${raw.slice(3)}`
  const sign = tzOffset[0] === '+' ? 1 : -1
  const offsetMs = sign * (parseInt(tzOffset.slice(1, 3)) * 60 + parseInt(tzOffset.slice(4))) * 60000
  const now = new Date()
  // date-fns format() uses local time, shift the Date to trick it into formatting in target tz
  const shifted = new Date(now.getTime() + offsetMs + now.getTimezoneOffset() * 60000)
  return format(shifted, "yyyy-MM-dd'T'HH:mm:ss") + tzOffset
}

async function getGitVersionInfo() {
  const commitInfo = await getCommitInfo();

  const buildTime = formatBuildTimeInCommitTz(commitInfo.date)

  const packageJsonPath = path.resolve(process.cwd(), 'package.json')
  let packageInfo: any = {}
  if (fs.existsSync(path.dirname(packageJsonPath))) {
    packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  }
  return {
    projectName: packageInfo.name || '',
    projectVersion: packageInfo.version || '',
    branchName: commitInfo.branch,
    commitId: commitInfo.hash,
    commitTime: commitInfo.date,
    buildTime: buildTime,
  }
}

interface VitePluginGitVersionOptions {
  isBuildFile?: boolean
  outputFileName?: string
  addMetaToIndexFile?: boolean
  replaceMeta?: string
}

interface VitePluginGitVersionInfo {
  projectName: string
  projectVersion: string
  branchName: string,
  commitId: string,
  commitTime: string,
  buildTime: string,
}

export async function VitePluginGitVersion(params?: VitePluginGitVersionOptions) {
  const options = {
    isBuildFile: true,
    outputFileName: 'dist/version.json',
    addMetaToIndexFile: true,
    replaceMeta: '<meta name="buildversion" />',
    ...params
  }

  const branchVersionObj: VitePluginGitVersionInfo = await getGitVersionInfo()

  let pkgInfoArr = []
  if (branchVersionObj.projectName) {
    pkgInfoArr.push('project:' + branchVersionObj.projectName)
  }
  if (branchVersionObj.branchName) {
    pkgInfoArr.push('branch:' + branchVersionObj.branchName)
  }
  if (branchVersionObj.commitId) {
    pkgInfoArr.push('commit:' + branchVersionObj.commitId)
  }
  let buildInfo = []
  if (branchVersionObj.projectVersion) {
    buildInfo.push('version:' + branchVersionObj.projectVersion)
  }
  if (branchVersionObj.buildTime) {
    buildInfo.push('buildTime:' + branchVersionObj.buildTime)
  }
  const metaInfo = '<meta name="pkgInfo" content="' + pkgInfoArr.join(' ') + '" />\n\t' +
      '<meta name="buildInfo" content="' + buildInfo.join(' ') + '" />'
  return {
    name: '@mirolago/vite-plugin-git-version',
    transformIndexHtml(html: string) {
      if (options.addMetaToIndexFile) {
        if (html.includes(options.replaceMeta)) {
          return html.replace(options.replaceMeta, metaInfo)
        } else {
          return html.replace('<title', metaInfo + '\n\t<title')
        }
      } else {
        return html
      }
    },
    generateBundle() {
      if (options.isBuildFile) {
        const versionInfoStr = JSON.stringify(branchVersionObj, null, 2)
        const outputFilePath = path.resolve(process.cwd(), options.outputFileName)
        if (!fs.existsSync(path.dirname(outputFilePath))) {
          fs.mkdirSync(path.dirname(outputFilePath), {recursive: true})
        }
        fs.writeFileSync(outputFilePath, versionInfoStr, 'utf8')
      }
    }
  }
}
