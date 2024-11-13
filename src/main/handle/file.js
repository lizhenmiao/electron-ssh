import { dialog } from 'electron'
const fs = require('fs')

// 打开文件
export const handleFileOpen = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

// 读取文件
export const handleFileRead = async (event, path, options) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// 写入文件
export const handleFileWrite = async (event, filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = {
  handleFileOpen,
  handleFileRead,
  handleFileWrite
}
