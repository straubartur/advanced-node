/**
 * @typedef CookieDateParam
 * @property {number} max-age
 * @property { Date | * } expires
 */

/**
 * Resolves cookie age parameter based on its type.
 *
 * @param {Date|number} age - Cookie expire date.
 * @returns { CookieDateParam } Cookie date config param.
 */
function resolveCookieAge (age) {
  if (typeof age === 'number') {
    return {
      'max-age': age
    }
  } else if (age instanceof Date) {
    return {
      expires: age.toUTCString()
    }
  } else {
    return {
      expires: age
    }
  }
}

/**
 * Write a string valued cookie.
 *
 * @param {string} name - Cookie name.
 * @param {string} stringValue - Cookie content.
 * @param {Date|number} age - Cookie expire age.
 */
export function writeString (name, stringValue, age) {
  const props = {
    [name]: encodeURIComponent(stringValue),
    path: '/',
    ...resolveCookieAge(age)
  }

  document.cookie = Object.keys(props).reduce((cookie, prop) => {
    cookie += `${prop}=${props[prop]}; `
    return cookie
  }, '')
}

/**
 * Write a Object valued cookie.
 *
 * @param {string} name - Cookie name.
 * @param {object} objectValue - Cookie content.
 * @param {Date|number} age - Cookie expire date.
 */
export function writeObject (name, objectValue, age) {
  writeString(name, JSON.stringify(objectValue), age)
}

/**
 * Write a Number valued cookie.
 *
 * @param {string} name - Cookie name.
 * @param {number} numberValue - Cookie content.
 * @param {Date|number} age - Cookie expire date.
 */
export function writeNumber (name, numberValue, age) {
  writeString(name, numberValue.toString(), age)
}

/**
 * Read a cookie string content by its name.
 *
 * @param {string} name - Cookie name.
 * @returns {string} Cookie content.
 */
export function readString (name) {
  return decodeURIComponent(`; ${document.cookie}`
    .split(`; ${name}=`)
    .pop()
    .split(';')
    .shift())
}

/**
 * Read a cookie Object content by its name.
 *
 * @param {string} name - Cookie name.
 * @returns {object} Cookie content.
 */
export function readObject (name) {
  return JSON.parse(readString(name))
}

/**
 * Read a cookie Number content by its name.
 *
 * @param {string} name - Cookie name.
 * @returns {number} Cookie content.
 */
export function readNumber (name) {
  return Number.parseFloat(readString(name))
}

/**
 * Represents an error in some accessing operation.
 *
 * @typedef Nothing
 * @property { boolean } isNothing
 */
const Nothing = { isNothing: true }

/**
 * Checks if x is {@see Nothing}.
 *
 * @global
 * @name isNothing
 * @param { * } x - Anything you want to test.
 * @returns {boolean} Whether it's equal or not.
 */
function isNothing (x) {
  return Boolean(x.isNothing)
}

/**
 * Gets the obj[key] property, returns {@see Nothing} if it doesn't exists.
 *
 * @private
 * @param {object} obj - Object to be accessed.
 * @param {string} key - Key to be used.
 * @returns { * | Nothing } Accessed property or nothing.
 */
export function get (obj, key) {
  return (obj && obj[key] !== null && obj[key] !== undefined)
    ? obj[key]
    : Nothing
}

/**
 * Access deep properties on object going through the given path,
 * returns {@link Nothing} if it is not possible to fetch the value.
 *
 * @global
 * @name deepGet
 * @param { object } obj - Object to be accessed.
 * @param { string } path - Path to be accessed separated by .
 * @returns { Nothing | * } Final accessed property or nothing.
 */
export function deepGet (obj, path) {
  return path && path.split('.').reduce(get, obj)
}

/**
 * Access deep properties on object going through the given path.
 * If it would return a Nothing, it returns `fallback` instead.
 *
 * @global
 * @name deepGetOrElse
 * @param {object} obj - Object to be accessed.
 * @param {string} path - Path to be accessed separated by.
 * @param { * } coalesce - Value to be returned if obj[path] is Nothing.
 * @returns { * } The accessed prop, or the coalesce value.
 */
export function deepGetOrElse (obj, path, coalesce) {
  const value = deepGet(obj, path)
  return isNothing(value) ? coalesce : value
}

/**
 * @typedef Session
 * @property { number } [expirationTime] - Time that will session data lives inside localStorage.
 */

/**
 * Creates a session object with expirationDate if an age is set.
 *
 * @param { * } data - Any javascript object.
 * @param { number } [expirationTime] - Time that will session data lives inside localStorage.
 * @returns { Session } Created Session.
 */
function createSession (data, expirationTime) {
  if (expirationTime && Number.isInteger(expirationTime)) {
    return Object.assign({}, data, {
      expirationTime: Date.now() + expirationTime
    })
  }
  return data
}

/**
 * Retrieves a local storage session by its key.
 *
 * @param { string } [key="impulse_session"] - Local storage key.
 * @returns { Session } Local storage session.
 */
export function get (key = 'impulse_session') {
  try {
    const session = parse(window.localStorage.getItem(key) || '', {})

    if (session.expirationTime < Date.now()) {
      window.localStorage.removeItem(key)
      return {}
    }

    return session
  } catch (e) {
    throw Error('Unable to retrieve session!')
  }
}

/**
 * Persists a data inside the local storage by its key.
 *
 * @param { * } data - Any javascript object to be stored.
 * @param { string } [key="impulse_session"] - Local storage key.
 * @param { number } [expirationTime] - Time that will session data lives inside localStorage.
 */
export function set (data, key = 'impulse_session', expirationTime) {
  try {
    const sessionJsonString = JSON.stringify(createSession(data, expirationTime))

    window.localStorage.setItem(key, sessionJsonString)
  } catch (e) {
    throw Error('Unable to save session!')
  }
}

/**
 * Parses a JSON string, constructing the JavaScript value or object described by the stringbundleRenderer.renderToStreambundleRenderer.renderToStream.
 *
 * @param { string } value - The JSON string.
 * @param { * } fallback - The value returned in fail case.
 * @returns { object } - The JSON string parsed or fallback value.
 */
export function parse (value, fallback) {
  try {
    return window.JSON.parse(value)
  } catch (e) {
    return fallback
  }
}

/**
 * Validates user email.
 *
 * @param {string} email - The email to be validated.
 * @returns {boolean} If it's a valid email.
 */
export function isValidEmail (email) {
  const emailValidationRegex = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  return emailValidationRegex.test(email)
}

/**
 * Try acceptable value.
 *
 * @param {any} value - Test value to acceptable.
 * @returns {boolean} Acceptable value.
 */
export function isAcceptable (value) {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
    return false
  }

  if (typeof value === 'string' && value.length === 0) {
    return false
  }

  return true
}

/**
 * Waits for object existence using a function to retrieve its value.
 *
 * @param { Function } getValueFunction - Function to execute and wait.
 * @param { number } [maxTries=10] - Number of tries before the error catch.
 * @param { number } [timeInterval=200] - Time interval between the requests in milis.
 * @returns { Promise } Promise of the checked value.
 */
export function waitForExistence (getValueFunction, maxTries = 10, timeInterval = 200) {
  return new Promise((resolve, reject) => {
    let tries = 0
    const interval = setInterval(() => {
      tries++
      const value = getValueFunction()
      if (value) {
        clearInterval(interval)
        resolve(value)
      }

      if (tries >= maxTries) {
        clearInterval(interval)
        resolve(null)
      }
    }, timeInterval)
  })
}