const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const config = require('./../config')
const logger = require('./../logger')

const self = {}

// Promisify these fs functions
const fsFuncs = [
  'access',
  'lstat',
  'mkdir',
  'readdir',
  'readFile',
  'rename',
  'rmdir',
  'symlink',
  'unlink',
  'writeFile'
]

for (const fsFunc of fsFuncs)
  self[fsFunc] = promisify(fs[fsFunc])

self.uploads = path.resolve(config.uploads.folder)
self.chunks = path.join(self.uploads, 'chunks')
self.thumbs = path.join(self.uploads, 'thumbs')
self.zips = path.join(self.uploads, 'zips')

self.thumbPlaceholder = path.resolve(config.uploads.generateThumbs.placeholder || 'public/images/unavailable.png')

self.logs = path.resolve(config.logsFolder)

self.customPages = path.resolve('pages/custom')
self.dist = path.resolve('dist')
self.public = path.resolve('public')

self.errorRoot = path.resolve(config.errorPages.rootDir)

const verify = [
  self.uploads,
  self.chunks,
  self.thumbs,
  self.zips,
  self.logs,
  self.customPages
]

self.init = async () => {
  // Check & create directories
  for (const p of verify)
    try {
      await self.access(p)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      } else {
        const mkdir = await self.mkdir(p)
        if (mkdir)
          logger.log(`Created directory: ${p}`)
      }
    }

  // Purge any leftover in chunks directory
  const uuidDirs = await self.readdir(self.chunks)
  for (const uuid of uuidDirs) {
    const root = path.join(self.chunks, uuid)
    const chunks = await self.readdir(root)
    for (const chunk of chunks)
      await self.unlink(path.join(root, chunk))
    await self.rmdir(root)
  }
}

module.exports = self
