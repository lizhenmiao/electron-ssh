const crypto = require('crypto')

// 生成一个 256 位的密钥
export const createSecretKey = () => {
  return crypto.randomBytes(32).toString('hex')
}

// 加密密钥
const currentSecretKey = '59e4dc03c722efda5693ee7b45b61363dd4618b567a0a4b614ac25d476d7c6df'

// 加密函数
export const encrypt = (text, secretKey = currentSecretKey) => {
  const algorithm = 'aes-256-cbc' // 使用 AES 加密算法
  const iv = crypto.randomBytes(16) // 初始化向量
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

// 解密函数
export const decrypt = (encryptedText, secretKey = currentSecretKey) => {
  const algorithm = 'aes-256-cbc'
  const textParts = encryptedText.split(':')
  const iv = Buffer.from(textParts.shift(), 'hex')
  const encryptedTextBuffer = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv)
  let decrypted = decipher.update(encryptedTextBuffer, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

module.exports = {
  createSecretKey,
  encrypt,
  decrypt
}
