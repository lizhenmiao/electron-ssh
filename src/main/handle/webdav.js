// webdav
import { createClient } from 'webdav'
let webdavClient = null

// 连接 webdav
export const handleCreateWebdav = async (event, { url, username, password }) => {
  webdavClient = createClient(url, {
    username,
    password
  })
  console.log(`WebDAV client created: `, webdavClient)
}

// 获取 webdav 目录内容
export const handleGetDirectoryContents = async (event, directory) => {
  if (!webdavClient) {
    return null
  }

  try {
    const directoryItems = await webdavClient.getDirectoryContents(directory)
    return directoryItems
  } catch (error) {
    throw new Error(error)
  }
}

// 判断文件夹是否存在, 不存在进行创建
const handleCreateDirectoryIfNotExist = async (path = '/') => {
  if (!webdavClient) {
    return false
  }

  try {
    const directory = getDirectoryPath(path)
    // 先判断文件夹是否存在
    if (await webdavClient.exists(directory)) {
      return true
    }
    await webdavClient.createDirectory(directory)
    return true
  } catch (error) {
    throw new Error(error)
  }
}

// 获取文件夹路径, 不包含文件名
const getDirectoryPath = (filePath) => {
  return filePath.substring(0, filePath.lastIndexOf('/'))
}

// 上传配置
export const handleUploadConfig = async (event, path, fileBuffer) => {
  if (!webdavClient) {
    return false
  }

  try {
    if (!(await handleCreateDirectoryIfNotExist(path))) {
      return false
    }

    await webdavClient.putFileContents(path, fileBuffer, {
      contentLength: fileBuffer.length,
      overwrite: true
    })
    return true
  } catch (error) {
    throw new Error(error)
  }
}

// 下载配置
export const handleDownloadConfig = async (event, path) => {
  if (!webdavClient) {
    return null
  }

  try {
    const content = await webdavClient.getFileContents(path)
    return content
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  handleCreateWebdav,
  handleGetDirectoryContents,
  handleUploadConfig,
  handleDownloadConfig
}
