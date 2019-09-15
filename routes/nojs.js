const routes = require('express').Router()
const uploadController = require('./../controllers/uploadController')
const utils = require('./../controllers/utilsController')
const config = require('./../config')

const renderOptions = {
  uploadDisabled: false,
  maxFileSize: config.cloudflare.noJsMaxSize || config.uploads.maxSize
}

if (config.private)
  if (config.enableUserAccounts) {
    renderOptions.uploadDisabled = 'Anonymous upload is disabled.'
  } else {
    renderOptions.uploadDisabled = 'Running in private mode.'
  }

routes.get('/nojs', async (req, res, next) => {
  const options = { renderOptions }
  options.gitHash = utils.gitHash

  return res.render('nojs', options)
})

routes.post('/nojs', (req, res, next) => {
  res._json = res.json
  res.json = (...args) => {
    const result = args[0]

    const options = { renderOptions }
    options.gitHash = utils.utils

    options.errorMessage = result.success ? '' : (result.description || 'An unexpected error occurred.')
    options.files = result.files || [{}]

    return res.render('nojs', options)
  }

  return uploadController.upload(req, res, next)
})

module.exports = routes
