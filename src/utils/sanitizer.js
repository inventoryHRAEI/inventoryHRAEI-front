// Utility to remove unwanted characters from form data before sending to server
// Goal: strip out punctuation characters except comma and period; passwords may also
// allow only these "basic" punctuation marks. Email fields are left untouched so
// that @ and other necessary symbols remain. The sanitizer operates recursively on
// objects/arrays and only mutates string values.

// Allow letters, digits, whitespace, comma, period, underscore, hyphen, colon, slash, @, #
// These are needed for inventory numbers (SIB-MSV-VISTA-70), ENUM values (non_functional),
// dates, emails, and other valid data.
const GENERAL_REGEX = /[^a-zA-Z0-9\s,\.\-_:/@#áéíóúÁÉÍÓÚñÑüÜ()]/g
// password rule is identical for now but we keep separate in case rules diverge
const PASSWORD_REGEX = GENERAL_REGEX

/**
 * Sanitize a single string with the generic character set.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str
  return str.replace(GENERAL_REGEX, '')
}

/**
 * Sanitize a password string. Allows letters, digits, spaces, comma, period.
 * @param {string} pwd
 */
export function sanitizePassword(pwd) {
  if (typeof pwd !== 'string') return pwd
  return pwd.replace(PASSWORD_REGEX, '')
}

/**
 * Recursively sanitize an object or array. Strings are filtered based on the
 * property name: fields that look like passwords use sanitizePassword, email
 * fields are left alone, everything else uses sanitizeString. Non-objects are
 * returned unchanged.
 *
 * @param {any} value
 * @returns {any}
 */
export function sanitizeObject(value) {
  if (Array.isArray(value)) {
    return value.map(v => sanitizeObject(v))
  }

  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value)) {
      const v = value[key]
      if (typeof v === 'string') {
        if (/pass(word)?|pwd/i.test(key)) {
          out[key] = sanitizePassword(v)
        } else if (/email|correo/i.test(key)) {
          // leave emails intact
          out[key] = v
        } else {
          out[key] = sanitizeString(v)
        }
      } else {
        out[key] = sanitizeObject(v)
      }
    }
    return out
  }

  // primitives (number, boolean, null, undefined, etc.) returned as-is
  return value
}
