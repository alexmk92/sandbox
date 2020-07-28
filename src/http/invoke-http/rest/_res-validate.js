let { isBuffer, errors, invalid } = require('../utils/validate')

/**
* Arc 6+ REST API + Lambda & HTTP API + Lambda v1.0 response validator
 */
module.exports = function responseValidator ({ res, result }) {
  let { statusCode, body, headers, multiValueHeaders, isBase64Encoded } = result

  let params = Object.getOwnPropertyNames(result)
  let deprecated = process.env.DEPRECATED
  let validParams = [
    'statusCode',
    'body',
    'headers',
    'multiValueHeaders',
    'isBase64Encoded'
  ]

  // Basic type checking
  if (statusCode && !Number.isInteger(statusCode)) {
    let body = errors.invalidType('statusCode', 'Number')
    return invalid(res, body)
  }
  if (isBuffer(body)) {
    // Reject raw, unencoded buffers (as does APIG)
    let body = errors.isRawBuffer
    return invalid(res, body)
  }
  if (body && typeof body !== 'string' && !deprecated) {
    let body = errors.invalidType('body', 'String')
    return invalid(res, body)
  }
  if (headers && (typeof headers !== 'object' || Array.isArray(headers))) {
    let body = errors.invalidType('headers', 'Object')
    return invalid(res, body)
  }
  if (multiValueHeaders && (typeof multiValueHeaders !== 'object' || Array.isArray(multiValueHeaders))) {
    let body = errors.invalidType('multiValueHeaders', 'Object')
    return invalid(res, body)
  }
  if (typeof isBase64Encoded !== 'undefined' && typeof isBase64Encoded !== 'boolean') {
    let body = errors.invalidType('isBase64Encoded', 'Boolean')
    return invalid(res, body)
  }

  // Check for invalid params
  let invalidParams = params.some(p => !validParams.includes(p))
  if (invalidParams && !deprecated) {
    let body = errors.invalidParam(validParams) + `Recieved:<pre> ${JSON.stringify(result, null, 2)}</pre>`
    return invalid(res, body)
  }

  // Arc v5 accepts literally any response params
  return { valid: true }
}