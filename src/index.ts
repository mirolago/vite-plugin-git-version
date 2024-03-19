// 同步子进程
import { execSync } from 'child_process'

import fs from 'fs'
import path from 'path'

// 获取当前git分支信息
function getGitVersionInfo() {
  // 当前分支名 git name-rev --name-only HEAD 这个命令会在终端输出你当前的版本或标签信息。
  const branchName = execSync('git name-rev --name-only HEAD').toString().trim()
  // 最后一次提交的commit full hash
  const commitId = execSync('git show -s --format=%H').toString().trim()
  // 提交人姓名
  const commitAuthor = execSync('git show -s --format=%cn').toString().trim()
  // 提交人邮箱
  const commitEmail = execSync('git show -s --format=%ce').toString().trim()
  // 提交时间
  const commitTime = new Date(new Date(execSync('git show -s --format=%cd').toString())).toLocaleString()
  // 提交描述
  const commitMsg = execSync('git show -s --format=%s').toString().trim()
  // 构建时间
  const buildTime = (new Date()).toLocaleString()
  // 构建人姓名
  const buildUserName = execSync('git config user.name').toString().trim()
  // 构建人邮箱
  const buildUserEmail = execSync('git config user.email').toString().trim()

  // 获取package.json配置文件
  const packageJsonPath = path.resolve(process.cwd(), 'package.json')
  let packageInfo: any = {} 
  if (fs.existsSync(path.dirname(packageJsonPath))) {
    packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  }
  return {
    projectName: packageInfo.name || '',
    projectVersion: packageInfo.version || '',
    branchName: branchName,
    commitId: commitId,
    commitAuthor: commitAuthor,
    commitEmail: commitEmail,
    commitTime: commitTime,
    commitMsg: commitMsg,
    buildTime: buildTime,
    buildUserName: buildUserName,
    buildUserEmail: buildUserEmail
  }
}

interface VitePluginGitVersionOptions {
  isBuildFile?: boolean // 是否生产文件
  outputFileName?: string // 生成文件名称
  replaceMeta?: string // 替换字符串
  hiddenHead?: boolean // 是否隐藏头部中版本信息
}

interface VitePluginGitVersionInfo {
  projectName: string
  projectVersion: string
  branchName: string,
  commitId: string,
  commitAuthor: string,
  commitEmail: string,
  commitTime: string,
  commitMsg: string,
  buildTime: string,
  buildUserName: string,
  buildUserEmail: string
}

export function VitePluginGitVersion(params?: VitePluginGitVersionOptions) {
  const options = {
    isBuildFile: true,
    outputFileName: 'dist/json/version.json',
    replaceMeta: '<meta name="buildversion" />',
    hiddenHead: false,
    ...params
  }
    
  const branchVersionObj: VitePluginGitVersionInfo = getGitVersionInfo()
  
  let pkgInfoArr = []
  if (branchVersionObj.projectName) {
    pkgInfoArr.push(branchVersionObj.projectName)
  }
  if (branchVersionObj.branchName) {
    pkgInfoArr.push(branchVersionObj.branchName)
  }
  if (branchVersionObj.commitId) {
    pkgInfoArr.push(branchVersionObj.commitId)
  }
  let revisedArr = []
  if (branchVersionObj.projectVersion) {
    revisedArr.push('版本号:' + branchVersionObj.projectVersion)
  }
  if (branchVersionObj.buildTime) {
    revisedArr.push(branchVersionObj.buildTime)
  }
  const metaInfo = '<meta name="pkgInfo" content="' + pkgInfoArr.join(' ') + '" />\n\t\t' +
    '<meta name="revised" content="' + revisedArr.join(' ') + '" />'
  return {
    name: '@east0422/vite-plugin-git-version',
    transformIndexHtml(html: string) {
      if (options.hiddenHead) {
        return html
      } else {
        if (html.includes(options.replaceMeta)) {
          return html.replace(options.replaceMeta, metaInfo)
        } else {
          return html.replace('<title', metaInfo + '\n\t\t<title')
        }
      }
    },
    generateBundle() {
      if (options.isBuildFile) {
        // 生成文件
        const versionInfoStr = JSON.stringify(branchVersionObj, null, 2)
        const outputFilePath = path.resolve(process.cwd(), options.outputFileName)
        if (!fs.existsSync(path.dirname(outputFilePath))) {
          fs.mkdirSync(path.dirname(outputFilePath), { recursive: true })
        }
        fs.writeFileSync(outputFilePath, versionInfoStr, 'utf8')
      }
    }
  }
}
