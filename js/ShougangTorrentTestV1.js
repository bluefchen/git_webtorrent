(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":4,"ieee754":5}],4:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],5:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(require,module,exports){
var http = require('http');

var https = module.exports;

for (var key in http) {
    if (http.hasOwnProperty(key)) https[key] = http[key];
};

https.request = function (params, cb) {
    if (!params) params = {};
    params.scheme = 'https';
    params.protocol = 'https:';
    return http.request.call(this, params, cb);
}

},{"http":28}],8:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],9:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],10:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":11}],11:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],15:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":13,"./encode":14}],16:[function(require,module,exports){
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":18,"./_stream_writable":20,"core-util-is":23,"inherits":8,"process-nextick-args":25}],17:[function(require,module,exports){
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":19,"core-util-is":23,"inherits":8}],18:[function(require,module,exports){
(function (process){
'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var StringDecoder;

util.inherits(Readable, Stream);

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = bufferShim.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'))
},{"./_stream_duplex":16,"./internal/streams/BufferList":21,"_process":11,"buffer":3,"buffer-shims":22,"core-util-is":23,"events":6,"inherits":8,"isarray":24,"process-nextick-args":25,"string_decoder/":34,"util":2}],19:[function(require,module,exports){
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":16,"core-util-is":23,"inherits":8}],20:[function(require,module,exports){
(function (process){
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
}).call(this,require('_process'))
},{"./_stream_duplex":16,"_process":11,"buffer":3,"buffer-shims":22,"core-util-is":23,"events":6,"inherits":8,"process-nextick-args":25,"util-deprecate":26}],21:[function(require,module,exports){
'use strict';

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

module.exports = BufferList;

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return bufferShim.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = bufferShim.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};
},{"buffer":3,"buffer-shims":22}],22:[function(require,module,exports){
(function (global){
'use strict';

var buffer = require('buffer');
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"buffer":3}],23:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../../../insert-module-globals/node_modules/is-buffer/index.js")})
},{"../../../../insert-module-globals/node_modules/is-buffer/index.js":9}],24:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],25:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))
},{"_process":11}],26:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
(function (process){
var Stream = (function (){
  try {
    return require('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

if (!process.browser && process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
}

}).call(this,require('_process'))
},{"./lib/_stream_duplex.js":16,"./lib/_stream_passthrough.js":17,"./lib/_stream_readable.js":18,"./lib/_stream_transform.js":19,"./lib/_stream_writable.js":20,"_process":11}],28:[function(require,module,exports){
(function (global){
var ClientRequest = require('./lib/request')
var extend = require('xtend')
var statusCodes = require('builtin-status-codes')
var url = require('url')

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/request":30,"builtin-status-codes":32,"url":35,"xtend":37}],29:[function(require,module,exports){
(function (global){
exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream)

exports.blobConstructor = false
try {
	new Blob([new ArrayBuffer(1)])
	exports.blobConstructor = true
} catch (e) {}

// The xhr request to example.com may violate some restrictive CSP configurations,
// so if we're running in a browser that supports `fetch`, avoid calling getXHR()
// and assume support for certain features below.
var xhr
function getXHR () {
	// Cache the xhr value
	if (xhr !== undefined) return xhr

	if (global.XMLHttpRequest) {
		xhr = new global.XMLHttpRequest()
		// If XDomainRequest is available (ie only, where xhr might not work
		// cross domain), use the page location. Otherwise use example.com
		// Note: this doesn't actually make an http request.
		try {
			xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com')
		} catch(e) {
			xhr = null
		}
	} else {
		// Service workers don't have XHR
		xhr = null
	}
	return xhr
}

function checkTypeSupport (type) {
	var xhr = getXHR()
	if (!xhr) return false
	try {
		xhr.responseType = type
		return xhr.responseType === type
	} catch (e) {}
	return false
}

// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
// Safari 7.1 appears to have fixed this bug.
var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined'
var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice)

// If fetch is supported, then arraybuffer will be supported too. Skip calling
// checkTypeSupport(), since that calls getXHR().
exports.arraybuffer = exports.fetch || (haveArrayBuffer && checkTypeSupport('arraybuffer'))

// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream')
exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer &&
	checkTypeSupport('moz-chunked-arraybuffer')

// If fetch is supported, then overrideMimeType will be supported too. Skip calling
// getXHR().
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false)

exports.vbArray = isFunction(global.VBArray)

function isFunction (value) {
	return typeof value === 'function'
}

xhr = null // Help gc

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],30:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var response = require('./response')
var stream = require('readable-stream')
var toArrayBuffer = require('to-arraybuffer')

var IncomingMessage = response.IncomingMessage
var rStates = response.readyStates

function decideMode (preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch'
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer'
	} else if (capability.msstream) {
		return 'ms-stream'
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer'
	} else if (capability.vbArray && preferBinary) {
		return 'text:vbarray'
	} else {
		return 'text'
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this
	stream.Writable.call(self)

	self._opts = opts
	self._body = []
	self._headers = {}
	if (opts.auth)
		self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'))
	Object.keys(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name])
	})

	var preferBinary
	var useFetch = true
	if (opts.mode === 'disable-fetch' || 'timeout' in opts) {
		// If the use of XHR should be preferred and includes preserving the 'content-type' header.
		// Force XHR to be used since the Fetch API does not yet support timeouts.
		useFetch = false
		preferBinary = true
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true
	} else {
		throw new Error('Invalid value for opts.mode')
	}
	self._mode = decideMode(preferBinary, useFetch)

	self.on('finish', function () {
		self._onFinish()
	})
}

inherits(ClientRequest, stream.Writable)

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this
	var lowerName = name.toLowerCase()
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1)
		return

	self._headers[lowerName] = {
		name: name,
		value: value
	}
}

ClientRequest.prototype.getHeader = function (name) {
	var self = this
	return self._headers[name.toLowerCase()].value
}

ClientRequest.prototype.removeHeader = function (name) {
	var self = this
	delete self._headers[name.toLowerCase()]
}

ClientRequest.prototype._onFinish = function () {
	var self = this

	if (self._destroyed)
		return
	var opts = self._opts

	var headersObj = self._headers
	var body = null
	if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH' || opts.method === 'MERGE') {
		if (capability.blobConstructor) {
			body = new global.Blob(self._body.map(function (buffer) {
				return toArrayBuffer(buffer)
			}), {
				type: (headersObj['content-type'] || {}).value || ''
			})
		} else {
			// get utf8 string
			body = Buffer.concat(self._body).toString()
		}
	}

	if (self._mode === 'fetch') {
		var headers = Object.keys(headersObj).map(function (name) {
			return [headersObj[name].name, headersObj[name].value]
		})

		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headers,
			body: body || undefined,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin'
		}).then(function (response) {
			self._fetchResponse = response
			self._connect()
		}, function (reason) {
			self.emit('error', reason)
		})
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest()
		try {
			xhr.open(self._opts.method, self._opts.url, true)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr)
			xhr.responseType = self._mode.split(':')[0]

		if ('withCredentials' in xhr)
			xhr.withCredentials = !!opts.withCredentials

		if (self._mode === 'text' && 'overrideMimeType' in xhr)
			xhr.overrideMimeType('text/plain; charset=x-user-defined')

		if ('timeout' in opts) {
			xhr.timeout = opts.timeout
			xhr.ontimeout = function () {
				self.emit('timeout')
			}
		}

		Object.keys(headersObj).forEach(function (name) {
			xhr.setRequestHeader(headersObj[name].name, headersObj[name].value)
		})

		self._response = null
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress()
					break
			}
		}
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress()
			}
		}

		xhr.onerror = function () {
			if (self._destroyed)
				return
			self.emit('error', new Error('XHR error'))
		}

		try {
			xhr.send(body)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}
	}
}

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid (xhr) {
	try {
		var status = xhr.status
		return (status !== null && status !== 0)
	} catch (e) {
		return false
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this

	if (!statusValid(self._xhr) || self._destroyed)
		return

	if (!self._response)
		self._connect()

	self._response._onXHRProgress()
}

ClientRequest.prototype._connect = function () {
	var self = this

	if (self._destroyed)
		return

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode)
	self._response.on('error', function(err) {
		self.emit('error', err)
	})

	self.emit('response', self._response)
}

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this

	self._body.push(chunk)
	cb()
}

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
	var self = this
	self._destroyed = true
	if (self._response)
		self._response._destroyed = true
	if (self._xhr)
		self._xhr.abort()
	// Currently, there isn't a way to truly abort a fetch.
	// If you like bikeshedding, see https://github.com/whatwg/fetch/issues/27
}

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this
	if (typeof data === 'function') {
		cb = data
		data = undefined
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb)
}

ClientRequest.prototype.flushHeaders = function () {}
ClientRequest.prototype.setTimeout = function () {}
ClientRequest.prototype.setNoDelay = function () {}
ClientRequest.prototype.setSocketKeepAlive = function () {}

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'user-agent',
	'via'
]

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":29,"./response":31,"_process":11,"buffer":3,"inherits":8,"readable-stream":27,"to-arraybuffer":33}],31:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var stream = require('readable-stream')

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
}

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode) {
	var self = this
	stream.Readable.call(self)

	self._mode = mode
	self.headers = {}
	self.rawHeaders = []
	self.trailers = {}
	self.rawTrailers = []

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close')
		})
	})

	if (mode === 'fetch') {
		self._fetchResponse = response

		self.url = response.url
		self.statusCode = response.status
		self.statusMessage = response.statusText
		
		response.headers.forEach(function(header, key){
			self.headers[key.toLowerCase()] = header
			self.rawHeaders.push(key, header)
		})


		// TODO: this doesn't respect backpressure. Once WritableStream is available, this can be fixed
		var reader = response.body.getReader()
		function read () {
			reader.read().then(function (result) {
				if (self._destroyed)
					return
				if (result.done) {
					self.push(null)
					return
				}
				self.push(new Buffer(result.value))
				read()
			}).catch(function(err) {
				self.emit('error', err)
			})
		}
		read()

	} else {
		self._xhr = xhr
		self._pos = 0

		self.url = xhr.responseURL
		self.statusCode = xhr.status
		self.statusMessage = xhr.statusText
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/)
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/)
			if (matches) {
				var key = matches[1].toLowerCase()
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = []
					}
					self.headers[key].push(matches[2])
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2]
				} else {
					self.headers[key] = matches[2]
				}
				self.rawHeaders.push(matches[1], matches[2])
			}
		})

		self._charset = 'x-user-defined'
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type']
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/)
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase()
				}
			}
			if (!self._charset)
				self._charset = 'utf-8' // best guess
		}
	}
}

inherits(IncomingMessage, stream.Readable)

IncomingMessage.prototype._read = function () {}

IncomingMessage.prototype._onXHRProgress = function () {
	var self = this

	var xhr = self._xhr

	var response = null
	switch (self._mode) {
		case 'text:vbarray': // For IE9
			if (xhr.readyState !== rStates.DONE)
				break
			try {
				// This fails in IE8
				response = new global.VBArray(xhr.responseBody).toArray()
			} catch (e) {}
			if (response !== null) {
				self.push(new Buffer(response))
				break
			}
			// Falls through in IE8	
		case 'text':
			try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
				response = xhr.responseText
			} catch (e) {
				self._mode = 'text:vbarray'
				break
			}
			if (response.length > self._pos) {
				var newData = response.substr(self._pos)
				if (self._charset === 'x-user-defined') {
					var buffer = new Buffer(newData.length)
					for (var i = 0; i < newData.length; i++)
						buffer[i] = newData.charCodeAt(i) & 0xff

					self.push(buffer)
				} else {
					self.push(newData, self._charset)
				}
				self._pos = response.length
			}
			break
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response)
				break
			response = xhr.response
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'moz-chunked-arraybuffer': // take whole
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING || !response)
				break
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'ms-stream':
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING)
				break
			var reader = new global.MSStreamReader()
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))))
					self._pos = reader.result.byteLength
				}
			}
			reader.onload = function () {
				self.push(null)
			}
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response)
			break
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		self.push(null)
	}
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":29,"_process":11,"buffer":3,"inherits":8,"readable-stream":27}],32:[function(require,module,exports){
module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

},{}],33:[function(require,module,exports){
var Buffer = require('buffer').Buffer

module.exports = function (buf) {
	// If the buffer is backed by a Uint8Array, a faster version will work
	if (buf instanceof Uint8Array) {
		// If the buffer isn't a subarray, return the underlying ArrayBuffer
		if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
			return buf.buffer
		} else if (typeof buf.buffer.slice === 'function') {
			// Otherwise we need to get a proper copy
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
		}
	}

	if (Buffer.isBuffer(buf)) {
		// This is the slow version that will work with any Buffer
		// implementation (even in old browsers)
		var arrayCopy = new Uint8Array(buf.length)
		var len = buf.length
		for (var i = 0; i < len; i++) {
			arrayCopy[i] = buf[i]
		}
		return arrayCopy.buffer
	} else {
		throw new Error('Argument must be a Buffer')
	}
}

},{"buffer":3}],34:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":3}],35:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":36,"punycode":12,"querystring":15}],36:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],37:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],38:[function(require,module,exports){
(function (Buffer){
/**
 * Created by sse316 on 4/9/2017.
 * 精确点击功能
 */
/**
 * Created by sse316 on 4/7/2017.
 * 更新触控功能
 */
/**
 * Created by sse316 on 4/1/2017.
 * 更新摄像机的缩放功能与场景的材质贴图
 */
var parseTorrent = require('parse-torrent');
var path = require('path');

var torrent_current = parseTorrent(Buffer("ZDg6YW5ub3VuY2UzNTp1ZHA6Ly90cmFja2VyLm9wZW5iaXR0b3JyZW50LmNvbTo4MDEzOmFubm91bmNlLWxpc3RsbDM1OnVkcDovL3RyYWNrZXIub3BlbmJpdHRvcnJlbnQuY29tOjgwZWw0MDp1ZHA6Ly90cmFja2VyLmxlZWNoZXJzLXBhcmFkaXNlLm9yZzo2OTY5ZWwzNDp1ZHA6Ly90cmFja2VyLmNvcHBlcnN1cmZlci50azo2OTY5ZWwzMzp1ZHA6Ly90cmFja2VyLm9wZW50cmFja3Iub3JnOjEzMzdlbDIzOnVkcDovL2V4cGxvZGllLm9yZzo2OTY5ZWwyMTp1ZHA6Ly96ZXIwZGF5LmNoOjEzMzdlbDI2OndzczovL3RyYWNrZXIuYnRvcnJlbnQueHl6ZWwzMjp3c3M6Ly90cmFja2VyLm9wZW53ZWJ0b3JyZW50LmNvbWVsMjU6d3NzOi8vdHJhY2tlci5mYXN0Y2FzdC5uemVlMTM6Y3JlYXRpb24gZGF0ZWkxNTExNjI1ODM2ZTg6ZW5jb2Rpbmc1OlVURi04NDppbmZvZDU6ZmlsZXNsZDY6bGVuZ3RoaTQxZTQ6cGF0aGw3OldfMC5kYXRlZWQ2Omxlbmd0aGk3NjA5NjllNDpwYXRobDc6V18xLmRhdGVlZDY6bGVuZ3RoaTI1MDRlNDpwYXRobDg6V18xMC5kYXRlZWQ2Omxlbmd0aGk1NTkwODY3ZTQ6cGF0aGw4OldfMTEuZGF0ZWVkNjpsZW5ndGhpNjU5MGU0OnBhdGhsODpXXzEyLmRhdGVlZDY6bGVuZ3RoaTQzZTQ6cGF0aGw4OldfMTMuZGF0ZWVkNjpsZW5ndGhpNzQ1MDllNDpwYXRobDg6V18xNC5kYXRlZWQ2Omxlbmd0aGk0NDk4NWU0OnBhdGhsODpXXzE1LmRhdGVlZDY6bGVuZ3RoaTMzODAzMjllNDpwYXRobDg6V18xNi5kYXRlZWQ2Omxlbmd0aGk0M2U0OnBhdGhsODpXXzE3LmRhdGVlZDY6bGVuZ3RoaTQzZTQ6cGF0aGw4OldfMTguZGF0ZWVkNjpsZW5ndGhpNDNlNDpwYXRobDg6V18xOS5kYXRlZWQ2Omxlbmd0aGk0MWU0OnBhdGhsNzpXXzIuZGF0ZWVkNjpsZW5ndGhpNDNlNDpwYXRobDg6V18yMC5kYXRlZWQ2Omxlbmd0aGkyMTQwNDNlNDpwYXRobDg6V18yMS5kYXRlZWQ2Omxlbmd0aGk0M2U0OnBhdGhsODpXXzIyLmRhdGVlZDY6bGVuZ3RoaTQzZTQ6cGF0aGw4OldfMjMuZGF0ZWVkNjpsZW5ndGhpMjQ1NDkyZTQ6cGF0aGw4OldfMjQuZGF0ZWVkNjpsZW5ndGhpNDNlNDpwYXRobDg6V18yNS5kYXRlZWQ2Omxlbmd0aGk0M2U0OnBhdGhsODpXXzI2LmRhdGVlZDY6bGVuZ3RoaTQzZTQ6cGF0aGw4OldfMjcuZGF0ZWVkNjpsZW5ndGhpNDNlNDpwYXRobDg6V18yOC5kYXRlZWQ2Omxlbmd0aGk4ODMyMzkzZTQ6cGF0aGw4OldfMjkuZGF0ZWVkNjpsZW5ndGhpMjM3NGU0OnBhdGhsNzpXXzMuZGF0ZWVkNjpsZW5ndGhpMjM4MTQ0MWU0OnBhdGhsODpXXzMwLmRhdGVlZDY6bGVuZ3RoaTQzZTQ6cGF0aGw4OldfMzEuZGF0ZWVkNjpsZW5ndGhpOTIzZTQ6cGF0aGw4OldfMzIuZGF0ZWVkNjpsZW5ndGhpMTI5NWU0OnBhdGhsODpXXzMzLmRhdGVlZDY6bGVuZ3RoaTE5NTU3MDAxZTQ6cGF0aGw4OldfMzQuZGF0ZWVkNjpsZW5ndGhpNjc4MWU0OnBhdGhsODpXXzM1LmRhdGVlZDY6bGVuZ3RoaTQzZTQ6cGF0aGw4OldfMzYuZGF0ZWVkNjpsZW5ndGhpMTQ1OTNlNDpwYXRobDg6V18zNy5kYXRlZWQ2Omxlbmd0aGkxODQ3MGU0OnBhdGhsODpXXzM4LmRhdGVlZDY6bGVuZ3RoaTIwNzkzMzdlNDpwYXRobDg6V18zOS5kYXRlZWQ2Omxlbmd0aGk0MWU0OnBhdGhsNzpXXzQuZGF0ZWVkNjpsZW5ndGhpNDNlNDpwYXRobDg6V180MC5kYXRlZWQ2Omxlbmd0aGk0M2U0OnBhdGhsODpXXzQxLmRhdGVlZDY6bGVuZ3RoaTQzZTQ6cGF0aGw4OldfNDIuZGF0ZWVkNjpsZW5ndGhpNDNlNDpwYXRobDg6V180My5kYXRlZWQ2Omxlbmd0aGk1MjcyMmU0OnBhdGhsODpXXzQ0LmRhdGVlZDY6bGVuZ3RoaTQzZTQ6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","base64"));
console.log('torrent_current');
console.log(torrent_current);
console.log('torrent_current');
console.timeEnd("Parse Time");
console.time("add torrent");

$(function(){
    //webtorrent
    var torrentId = torrent_current;
    var client = new WebTorrent({tracker:true,dht:false });
    var blobUrl=[],webTorrentData=[];
    var webTorrentDataTemp;
    client.add(torrentId, function (torrent) {
        console.time("start connecting");
        console.time("start connecting"+ (new Date()).toLocaleTimeString());
        console.log('Client is downloading:', torrent.infoHash);
        console.timeEnd("add torrent");



        torrent.on('wire', function() {
            console.time("download complete");
            console.time("download start"+ (new Date()).toLocaleTimeString());

            console.timeEnd("start connecting");
        });
        console.time("download complete"+ (new Date()).toLocaleTimeString());
        console.timeEnd("download complete");

        torrent.files.forEach(function (file) {
            /*使用buffer.toString的方式*/
            file.getBuffer(function (err, buffer) {
                if (err) throw err;

                webTorrentDataTemp = buffer.toString();
                SendMessagetoWorkDforOutsideModel(webTorrentDataTemp);

            })

        });






    var scene;
    var camera,camControls;
    var clock = new THREE.Clock();
    var lables;

    var renderer;
    var stats = initStats();
    clock.start();
    var workerLoadMergedFile=new Worker("js/torrent/loadMergedFile_New.js");
    var workerLoadVsg = new Worker("js/loadBlockVsg.js");

    var windowWidth = window.innerWidth*0.85;
    var windowHeight = window.innerHeight;
    var windowStartX = window.innerWidth*0.15;
    var windowStartY = window.innerHeight*0.0;

    var currentControlType = 1;//右侧编辑栏的编辑tag

    var polyhedrons = [];//进行交互的构件

    //存放体素化数据
    var vsgData = {},vsgArr={},packageTag=0;


    var currentBlockName = "W";

    var preBlockName = "W";


    var cameraType = -1;

    var isTranslateGroup = true;

    var backPosition, jumpPosition;
    /***
     * 场景配置参数
     */
    var VoxelSize = 2.24103;
    var SceneBBoxMinX = -320.718;
    var SceneBBoxMinY = -202.163;
    var SceneBBoxMinZ = -21.6323;

    var isOutside; //判断是不是在外体，如果在外体，就让墙体的贴图为黄色，否则，为白色





    /**
     * 读取vsg文件同时批量下载模型dat
     * @param currentBlockName
     */
    function startDownloadNewBlock(currentBlockName) {
        isOnload = true;
        initValue();

        isOutside = false;
        workerLoadVsg.postMessage(currentBlockName);

    }

    initScene();
    $("#WebGL-output").append(renderer.domElement);

    var zoomInt = 1;
    renderer.domElement.addEventListener( 'wheel', mousewheel, false );
    function mousewheel( event ) {
        event.preventDefault();
        event.stopPropagation();

        console.log(event.wheelDelta);

        if(event.wheelDelta<0) {
            if(zoomInt<1)
            {
                zoomInt = zoomInt * 1.1;
            }
        }else {
            zoomInt = zoomInt / 1.1;
        }
        camera.setViewOffset( windowWidth, windowHeight, windowWidth*0.5-windowWidth*0.5*zoomInt, windowHeight*0.5-windowHeight*0.5*zoomInt, windowWidth * zoomInt, windowHeight * zoomInt );
    }


    function initScene() {
        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({antialias:true});
        // renderer.setClearColorHex(0xEEEEEE);
        // renderer.setPixelRatio( 1 );
        renderer.setSize(windowWidth, windowHeight);

        camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 0.1, 2000);
        // var intvalue = 20;
        // camera = new THREE.OrthographicCamera(windowWidth / (-1*intvalue), windowWidth / intvalue, windowHeight / intvalue, windowHeight /  (-1*intvalue), 0, 10000);
        camera.position.x = -60;
        camera.position.y = 24;
        camera.position.z = -55;
        camera.lookAt(new THREE.Vector3(-53,   0,   5));

        camControls = new THREE.TouchFPC(camera,renderer.domElement);
        camControls.lookSpeed = 0.8;
        camControls.movementSpeed = 10 * 1.5;
        camControls.noFly = true;
        camControls.lookVertical = true;
        camControls.constrainVertical = true;
        camControls.verticalMin = 1.0;
        camControls.verticalMax = 2.0;

        var ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);

        var directionalLight_1 = new THREE.DirectionalLight(0xffffff,0.2);

        directionalLight_1.position.set(0.3,0.4,0.5)
        scene.add(directionalLight_1);

        var directionalLight_2 = new THREE.DirectionalLight(0xffffff,0.2);

        directionalLight_2 .position.set(-0.3,-0.4,0.5)
        scene.add(directionalLight_2);

        // initSkyBox();

        startDownloadNewBlock(currentBlockName);
    }

    function initSkyBox() {
        //skybox
        var imagePrefix = "assets/skybox/dawnmountain-";
        var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        var imageSuffix = ".png";
        var skyGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );

        var materialArray = [];
        for (var i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
            }));
        var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        scene.add( skyBox );
    }


    render();

    var modelDataV = [];
    var modelDataT = [];
    var modelDataF = [];
    var modelDataM = [];
    var modelDataNewN = [];
    var triggerAreaMap = {};
    var outsideSourcesFileCount = 0;
    var triggerBoxs = [];
    var wallBoxs = [];
    var wallArr = [];
    var drawDataMap = {};
    var downArr = [],forArr = [];
    var fileLength = 0;
    var unDisplayModelArr = []; //用于存放移动之后的模型构件名称，当进行绘制时，会根据名称进行判断，在数组中的模型不会进行下载



    var isOnload = true; //判断是否在加载，如果在加载，render停掉

    var cashVoxelSize;
    var cashSceneBBoxMinX;
    var cashSceneBBoxMinY;
    var cashSceneBBoxMinZ;
    var cashtriggerAreaMap;
    var cashWallArr;
    var isJumpArea = true;
    var isShowTriggerArea = true;

    function initValue()
    {
        modelDataV = [];
        modelDataT = [];
        modelDataF = [];
        modelDataM = [];
        modelDataNewN = [];
        vsgData = [];
        vsgArr=[];
        outsideSourcesFileCount = 0;
        downArr = [];
        forArr = [];
        polyhedrons = [];
        drawDataMap = {};
        unDisplayModelArr = [];
        packageTag=0;
    }

    function SendMessagetoWorkDforOutsideModel(buffer)
    {
        var vsgMap = {};
        vsgArr=[];
        for(var key in vsgData)
        {
            for(var i=0;i<vsgData[key].length;i++)
            {
                if(!vsgMap[vsgData[key][i]])
                {
                    vsgMap[vsgData[key][i]] = 1;
                }
            }
        }
        for(var key in vsgMap)
        {
            vsgArr.push(key);
        }
        console.log("vsgArr length is:"+vsgArr.length);

        workerLoadMergedFile.postMessage(buffer);

    }

    workerLoadVsg.onmessage=function(event) {

        fileLength = event.data.blockFileNum;
        vsgData = event.data.vsgMap;
        cashVoxelSize = event.data.voxelSize;
        cashSceneBBoxMinX = event.data.sceneBBoxMinX;
        cashSceneBBoxMinY = event.data.sceneBBoxMinY;
        cashSceneBBoxMinZ = event.data.sceneBBoxMinZ;
        //需要获取到触发区域的值
        cashtriggerAreaMap = event.data.structureInfo;
        cashWallArr = event.data.wallInfoArr;

        if(isJumpArea)
        {
            isJumpArea = false;
            camera.position.x = event.data.originPos[0];
            camera.position.y = event.data.originPos[1];
            camera.position.z = event.data.originPos[2];
            if(cameraType==-1)
            {
                // camControls.targetObject.position.x = event.data.originPos[0];
                // camControls.targetObject.position.y = event.data.originPos[1];
                // camControls.targetObject.position.z = event.data.originPos[2];
                camControls.targetObject.position.set(event.data.originPos[0],event.data.originPos[1],event.data.originPos[2]);
                camControls.lon = event.data.originPos[3];
                camControls.lat = event.data.originPos[4];
            }

        }


        /**
         * 因为loadblockvsg和
         */
        // if(isTranslateGroup) {
        //     isTranslateGroup = false;
        // }
        // else {
        //     isTranslateGroup = true;
        //     TranslateGroup();
        //     console.log("调用 TranslateGroup() 在loadvsg中的isFirstLoad");
        // }
        //

        TranslateGroup();


        //var vsgMap = {};
        //for(var key in vsgData)
        //{
        //    for(var i=0;i<vsgData[key].length;i++)
        //    {
        //        if(!vsgMap[vsgData[key][i]])
        //        {
        //            vsgMap[vsgData[key][i]] = 1;
        //        }
        //    }
        //}
        //for(var key in vsgMap)
        //{
        //    vsgArr.push(key);
        //}
        //console.log("vsgArr length is:"+vsgArr.length);
        //
        //webtorrent时取消
        //for(var i=0;i<=45;i++)
        //{
        //    workerLoadMergedFile.postMessage(currentBlockName+"_"+i);
        //}


    };


    workerLoadMergedFile.onmessage = function (event) {
        var Data=event.data;
        if(Data.data_tag!=null)
        {
            if(Data.data_tag==1) {
                //发送下一个数据下载请求，map设置对应的key-value
                // console.log("1. Data.data_type is:" + Data.data_type);
                drawDataMap[Data.data_type] = [];

            }else{
                //收到块加载完成的消息，开始绘制
                // isOnload = false;
                //开始绘制当前数据
                DrawModel(Data.data_type);

                packageTag++;
                if(currentBlockName=="Tongyan")
                {
                    if(packageTag==23)
                    {
                        isOnload = false;
                        console.log("Finish Tongyan");
                        $.get("http://www.shxt3d.com:8082/loadover", {
                        },function(data){
                            console.log(data);
                        });
                    }
                }
                if(currentBlockName=="W")
                {
                    if(packageTag==45)
                    {
                        isOnload = false;
                        console.log("Finish Shougang");
                        $.get("http://www.shxt3d.com:8082/loadover", {
                        },function(data){
                            console.log(data);
                        });
                    }
                }
            }
        }
        else
        {
            if(!drawDataMap[Data.type]) drawDataMap[Data.type] = [];
            // console.log("2. Data.data_type is:" + Data.data_type + "Data.name is" + Data.nam);
            drawDataMap[Data.type].push(Data.nam);


            if(Data.newFileName)
            {
                var tempKeyValue = Data.nam;
                if(!modelDataNewN[tempKeyValue])
                {
                    modelDataNewN[tempKeyValue] = [];
                }
                if(!modelDataM[tempKeyValue])
                {
                    modelDataM[tempKeyValue] = [];
                }
                modelDataNewN[tempKeyValue] = Data.newFileName;
                modelDataM[tempKeyValue] = Data.m;
            }
            else{
                var tempKeyValue = Data.nam;
                if(!modelDataV[tempKeyValue])
                {
                    modelDataV[tempKeyValue] = [];
                }
                if(!modelDataT[tempKeyValue])
                {
                    modelDataT[tempKeyValue] = [];
                }
                if(!modelDataF[tempKeyValue])
                {
                    modelDataF[tempKeyValue] = [];
                }
                for(var dataCount = 0; dataCount<Data.v.length;dataCount++)
                {
                    modelDataV[tempKeyValue].push(Data.v[dataCount]);
                    modelDataT[tempKeyValue].push(Data.t[dataCount]);
                    modelDataF[tempKeyValue].push(Data.f[dataCount]);
                }
            }
            Data = null;
            outsideSourcesFileCount++;

            //修改HTML标签内容
            var progress = Math.floor(100*outsideSourcesFileCount/vsgArr.length);
            document.getElementById('progressLable').innerHTML = progress + "%";
        }
    }



    function TranslateGroup()
    {
        console.log("调用 TranslateGroup()");
        VoxelSize = cashVoxelSize;
        SceneBBoxMinX = cashSceneBBoxMinX;
        SceneBBoxMinY = cashSceneBBoxMinY;
        SceneBBoxMinZ = cashSceneBBoxMinZ;
        triggerAreaMap = cashtriggerAreaMap;
        wallArr = cashWallArr;
        // console.log(triggerAreaMap)

        if(isShowTriggerArea)
        {
            while(triggerBoxs.length){
                scene.remove(triggerBoxs.pop());
            }
            //console.log("wallBoxs length is:" + wallBoxs.length);
            while(wallBoxs.length){
                scene.remove(wallBoxs.pop());
            }
            wallBoxs = [];

            for(var i in triggerAreaMap){

                if(triggerAreaMap.hasOwnProperty(i)){

                    for(var j = 0;j < triggerAreaMap[i].length;j ++){

                        //console.log(triggerAreaMap[i])

                        var triggerX = Number(triggerAreaMap[i][j][3]);
                        var triggerY = triggerAreaMap[i][j][7];
                        var triggerZ = triggerAreaMap[i][j][8];

                        var sphereGeo = new THREE.CubeGeometry(2*triggerX,2*triggerY,2*triggerZ);


                        var sphereMesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({
                            opacity:0.5,
                            color: 0x000000,
                            transparent:true,
                            wireframe: false,
                            side: THREE.DoubleSide
                        }));
                        sphereMesh.position.x =   Number(triggerAreaMap[i][j][0]);
                        sphereMesh.position.z =  Number(triggerAreaMap[i][j][1]);
                        sphereMesh.position.y =  Number(triggerAreaMap[i][j][2]);
                        scene.add(sphereMesh);

                        triggerBoxs.push(sphereMesh);
                    }
                }
            }

            if(wallArr)
            {
                for(var m=0;m<wallArr.length;m++)
                {
                    var posX = Number(wallArr[m][0]);
                    var posY = Number(wallArr[m][1]);
                    var posZ = Number(wallArr[m][2]);
                    var boxX = Number(wallArr[m][3]);
                    var boxY = Number(wallArr[m][4]);
                    var boxZ = Number(wallArr[m][5]);

                    var sphereGeo = new THREE.CubeGeometry(2*boxX,2*boxY,2*boxZ);


                    var sphereMesh = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({
                        opacity:0.5,
                        transparent:false,
                        //color: 0x0099ff,
                        color:0x000000,
                        alphaTest:1,
                        wireframe: false,
                    }));
                    sphereMesh.position.x =  posX;
                    sphereMesh.position.y =  posY;
                    sphereMesh.position.z =  posZ;
                    scene.add(sphereMesh);
                    // sphereMesh.visible = false;

                    wallBoxs.push(sphereMesh);
                    forArr.push(sphereMesh);
                    downArr.push(sphereMesh);
                }
            }

        }
    }

    function DrawModel(tag)
    {
        var IfcFootingGeo = new THREE.Geometry(),
            IfcWallStandardCaseGeo = new THREE.Geometry(),
            IfcSlabGeo = new THREE.Geometry(),
            IfcStairGeo = new THREE.Geometry(),
            IfcStairFlightGeo = new THREE.Geometry(),
            IfcDoorGeo = new THREE.Geometry(),
            IfcWindowGeo = new THREE.Geometry(),
            IfcBeamGeo = new THREE.Geometry(),
            IfcCoveringGeo = new THREE.Geometry(),
            IfcFlowSegmentGeo = new THREE.Geometry(),
            IfcWallGeo = new THREE.Geometry(),
            IfcRampFlightGeo = new THREE.Geometry(),
            IfcRailingGeo = new THREE.Geometry(),
            IfcFlowTerminalGeo = new THREE.Geometry(),
            IfcBuildingElementProxyGeo  = new THREE.Geometry(),
            IfcColumnGeo = new THREE.Geometry(),
            IfcFlowControllerGeo = new THREE.Geometry(),
            IfcFlowFittingGeo = new THREE.Geometry(),
            IfcMemberGeo = new THREE.Geometry(),
            IfcPlateGeo = new THREE.Geometry(),
            IfcFurnishingElementGeo = new THREE.Geometry(),
            IfcRoofGeo = new THREE.Geometry(),
            IfcSiteGeo = new THREE.Geometry();

        var tempName = drawDataMap[tag][0];
        if(tempName)
        {
            var typeIndex = tempName.indexOf("=");
            var packageType = tempName.slice(typeIndex+1);

            for(var i=0; i<drawDataMap[tag].length; i++)
            {
                var tempFileName = drawDataMap[tag][i];

                if(tempFileName!=null && unDisplayModelArr.indexOf(tempFileName)==-1)
                {
                    if (modelDataNewN[tempFileName]) {
                        //if (false) {

                        var newName = modelDataNewN[tempFileName];
                        var matrix = modelDataM[tempFileName];
//                            处理V矩阵，变形
                        if(modelDataV[newName])
                        {
                            modelDataV[tempFileName] = [];
                            for(var dataCount=0;dataCount<modelDataV[newName].length;dataCount++)
                            {
                                var vMetrix = [];
                                var tMetrix = [];
                                //var vArrary = [];
                                for (var j = 0; j < modelDataV[newName][dataCount].length; j += 3) {
                                    var newN1 = modelDataV[newName][dataCount][j] * matrix[0] + modelDataV[newName][dataCount][j + 1] * matrix[4] + modelDataV[newName][dataCount][j + 2] * matrix[8] + 1.0 * matrix[12];
                                    var newN2 = modelDataV[newName][dataCount][j] * matrix[1] + modelDataV[newName][dataCount][j + 1] * matrix[5] + modelDataV[newName][dataCount][j + 2] * matrix[9] + 1.0 * matrix[13];
                                    var newN3 = modelDataV[newName][dataCount][j] * matrix[2] + modelDataV[newName][dataCount][j + 1] * matrix[6] + modelDataV[newName][dataCount][j + 2] * matrix[10]+ 1.0 * matrix[14];
                                    //var groupV = new THREE.Vector3(-1*newN1, newN3, newN2);
                                    var groupV = new THREE.Vector3(newN1, newN3, newN2);
                                    vMetrix.push(groupV);
                                    //vArrary.push(newN1);
                                    //vArrary.push(newN2);
                                    //vArrary.push(newN3);
                                }
                                //modelDataV[tempFileName].push(vArrary);
                                //处理T矩阵
                                for (var m = 0; m < modelDataT[newName][dataCount].length; m += 3) {
                                    var newT1 = 1.0 * modelDataT[newName][dataCount][m];
                                    var newT2 = 1.0 * modelDataT[newName][dataCount][m + 1];
                                    var newT3 = 1.0 * modelDataT[newName][dataCount][m + 2];
                                    //var newF1 = 1.0 * modelDataF[newName][dataCount][m] * matrix[0] + modelDataF[newName][dataCount][m + 1] * matrix[4] + modelDataF[newName][dataCount][m + 2] * matrix[8] + 1.0 * matrix[12];
                                    //var newF2 = 1.0 * modelDataF[newName][dataCount][m] * matrix[1] + modelDataF[newName][dataCount][m + 1] * matrix[5] + modelDataF[newName][dataCount][m + 2] * matrix[9] + 1.0 * matrix[13];
                                    //var newF3 = 1.0 * modelDataF[newName][dataCount][m] * matrix[2] + modelDataF[newName][dataCount][m + 1] * matrix[6] + modelDataF[newName][dataCount][m + 2] * matrix[10]+ 1.0 * matrix[14];
                                    var newF1 = 1.0 * modelDataF[newName][dataCount][m];
                                    var newF2 = 1.0 * modelDataF[newName][dataCount][m + 1];
                                    var newF3 = 1.0 * modelDataF[newName][dataCount][m + 2];
                                    var norRow = new THREE.Vector3(newF1, newF2, newF3);
                                    var grouT = new THREE.Face3(newT1, newT2, newT3);
                                    grouT.normal = norRow;
                                    tMetrix.push(grouT);
                                }
                                //绘制
                                var geometry = new THREE.Geometry();
                                geometry.vertices = vMetrix;
                                geometry.faces = tMetrix;
                                var pos=tempFileName.indexOf("=");
                                var ind=tempFileName.substring(pos+1);
                                if(ind) {
                                    switch (ind) {
                                        case"IfcFooting":
                                            IfcFootingGeo.merge(geometry);
                                            break;
                                        case "IfcWallStandardCase"://ok
                                            IfcWallStandardCaseGeo.merge(geometry);
                                            break;
                                        case "IfcSlab"://ok
                                            IfcSlabGeo.merge(geometry);
                                            break;
                                        case "IfcStair"://ok
                                            IfcStairGeo.merge(geometry);
                                            break;
                                        case "IfcDoor"://ok
                                            IfcDoorGeo.merge(geometry);
                                            break;
                                        case "IfcWindow":
                                            IfcWindowGeo.merge(geometry);
                                            break;
                                        case "IfcBeam"://ok
                                            IfcBeamGeo.merge(geometry);
                                            break;
                                        case "IfcCovering":
                                            IfcCoveringGeo.merge(geometry);
                                            break;
                                        case "IfcFlowSegment"://ok
                                            IfcFlowSegmentGeo.merge(geometry);
                                            break;
                                        case "IfcWall"://ok
                                            IfcWallGeo.merge(geometry);
                                            break;
                                        case "IfcRampFlight":
                                            IfcRampFlightGeo.merge(geometry);
                                            break;
                                        case "IfcRailing"://ok
                                            IfcRailingGeo.merge(geometry);
                                            break;
                                        case "IfcFlowTerminal"://ok
                                            IfcFlowTerminalGeo.merge(geometry);
                                            break;
                                        case "IfcBuildingElementProxy"://ok
                                            IfcBuildingElementProxyGeo.merge(geometry);
                                            break;
                                        case "IfcColumn"://ok
                                            IfcColumnGeo.merge(geometry);
                                            break;
                                        case "IfcFlowController"://ok
                                            IfcFlowControllerGeo.merge(geometry);
                                            break;
                                        case "IfcFlowFitting"://ok
                                            IfcFlowFittingGeo.merge(geometry);
                                            break;
                                        case"IfcStairFlight":
                                            IfcStairFlightGeo.merge(geometry);
                                            break;
                                        case"IfcMember":
                                            IfcMemberGeo.merge(geometry);
                                            break;
                                        case"IfcPlate":
                                            IfcPlateGeo.merge(geometry);
                                            break;
                                        case"IfcSite":
                                            IfcSiteGeo.merge(geometry);
                                            break;
                                        case"IfcRoof":
                                            IfcRoofGeo.merge(geometry);
                                            break;
                                        case"IfcFurnishingElement":
                                            IfcFurnishingElementGeo.merge(geometry);
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                        }
                        else
                        {
                            console.log("找不到modelDataV中对应的newName: "+newName);
                        }
                    }
                    else if (modelDataV[tempFileName] && !modelDataNewN[tempFileName]) {
                        for(var dataCount=0;dataCount<modelDataV[tempFileName].length;dataCount++)
                        {
                            var vMetrix = [];
                            var tMetrix = [];
                            //处理V矩阵，变形
                            for (var j = 0; j < modelDataV[tempFileName][dataCount].length; j += 3) {
                                var newn1 = 1.0 * modelDataV[tempFileName][dataCount][j];
                                var newn2 = 1.0 * modelDataV[tempFileName][dataCount][j + 1];
                                var newn3 = 1.0 * modelDataV[tempFileName][dataCount][j + 2];
                                var groupV = new THREE.Vector3(newn1, newn3, newn2);
                                vMetrix.push(groupV);
                            }
                            //处理T矩阵
                            for (var m = 0; m < modelDataT[tempFileName][dataCount].length; m += 3) {
                                var newT1 = 1.0 * modelDataT[tempFileName][dataCount][m];
                                var newT2 = 1.0 * modelDataT[tempFileName][dataCount][m + 1];
                                var newT3 = 1.0 * modelDataT[tempFileName][dataCount][m + 2];
                                var newF1 = 1.0 * modelDataF[tempFileName][dataCount][m];
                                var newF2 = 1.0 * modelDataF[tempFileName][dataCount][m + 1];
                                var newF3 = 1.0 * modelDataF[tempFileName][dataCount][m + 2];
                                var norRow = new THREE.Vector3(newF1, newF2, newF3);
                                var groupF = new THREE.Face3(newT1, newT2, newT3);
                                groupF.normal = norRow;
                                tMetrix.push(groupF);
                            }

                            //绘制
                            var geometry = new THREE.Geometry();
                            geometry.vertices = vMetrix;
                            geometry.faces = tMetrix;
                            var pos=tempFileName.indexOf("=");
                            var ind=tempFileName.substring(pos+1);
                            if(ind) {
                                switch (ind) {
                                    case"IfcFooting":
                                        IfcFootingGeo.merge(geometry);
                                        break;
                                    case "IfcWallStandardCase"://ok
                                        IfcWallStandardCaseGeo.merge(geometry);
                                        break;
                                    case "IfcSlab"://ok
                                        IfcSlabGeo.merge(geometry);
                                        break;
                                    case "IfcStair"://ok
                                        IfcStairGeo.merge(geometry);
                                        break;
                                    case "IfcDoor"://ok
                                        IfcDoorGeo.merge(geometry);
                                        break;
                                    case "IfcWindow":
                                        IfcWindowGeo.merge(geometry);
                                        break;
                                    case "IfcBeam"://ok
                                        IfcBeamGeo.merge(geometry);
                                        break;
                                    case "IfcCovering":
                                        IfcCoveringGeo.merge(geometry);
                                        break;
                                    case "IfcFlowSegment"://ok
                                        IfcFlowSegmentGeo.merge(geometry);
                                        break;
                                    case "IfcWall"://ok
                                        IfcWallGeo.merge(geometry);
                                        break;
                                    case "IfcRampFlight":
                                        IfcRampFlightGeo.merge(geometry);
                                        break;
                                    case "IfcRailing"://ok
                                        IfcRailingGeo.merge(geometry);
                                        break;
                                    case "IfcFlowTerminal"://ok
                                        IfcFlowTerminalGeo.merge(geometry);
                                        break;
                                    case "IfcBuildingElementProxy"://ok
                                        IfcBuildingElementProxyGeo.merge(geometry);
                                        break;
                                    case "IfcColumn"://ok
                                        IfcColumnGeo.merge(geometry);
                                        break;
                                    case "IfcFlowController"://ok
                                        IfcFlowControllerGeo.merge(geometry);
                                        break;
                                    case "IfcFlowFitting"://ok
                                        IfcFlowFittingGeo.merge(geometry);
                                        break;
                                    case"IfcStairFlight":
                                        IfcStairFlightGeo.merge(geometry);
                                        break;
                                    case"IfcMember":
                                        IfcMemberGeo.merge(geometry);
                                        break;
                                    case"IfcPlate":
                                        IfcPlateGeo.merge(geometry);
                                        break;
                                    case"IfcSite":
                                        IfcSiteGeo.merge(geometry);
                                        break;
                                    case"IfcRoof":
                                        IfcRoofGeo.merge(geometry);
                                        break;
                                    case"IfcFurnishingElement":
                                        IfcFurnishingElementGeo.merge(geometry);
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    }
                    else {
                        console.log(tag+"找不到模型啦！");
                    }
                }
            }

            /**
             * polyhedrons 是用来进行交互的构件
             */
            var scale = 1;
            switch (packageType) {
                case"IfcFooting":
                    var polyhedron = createMesh(IfcFootingGeo,currentBlockName,"IfcFooting",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWallStandardCase"://ok
                    var polyhedron = createMesh(IfcWallStandardCaseGeo,currentBlockName,"IfcWallStandardCase",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcSlab"://ok
                    var polyhedron = createMesh(IfcSlabGeo,currentBlockName,"IfcSlab",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcStair"://ok
                    var polyhedron = createMesh(IfcStairGeo,currentBlockName,"IfcStair",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcStairFlight"://ok
                    var polyhedron = createMesh(IfcStairFlightGeo,currentBlockName,"IfcStairFlight",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcDoor"://ok
                    var polyhedron = createMesh(IfcDoorGeo,currentBlockName,"IfcDoor",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWindow":
                    var polyhedron = createMesh(IfcWindowGeo,currentBlockName,"IfcWindow",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcBeam"://ok
                    var polyhedron = createMesh(IfcBeamGeo,currentBlockName,"IfcBeam",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcCovering":
                    var polyhedron = createMesh(IfcCoveringGeo,currentBlockName,"IfcCovering",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowSegment"://ok
                    var polyhedron = createMesh(IfcFlowSegmentGeo,currentBlockName,"IfcFlowSegment",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWall"://ok
                    var polyhedron = createMesh(IfcWallGeo,currentBlockName,"IfcWall",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRampFlight":
                    var polyhedron = createMesh(IfcRampFlightGeo,currentBlockName,"IfcRampFlight",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRailing"://ok
                    var polyhedron = createMesh(IfcRailingGeo,currentBlockName,"IfcRailing",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowTerminal"://ok
                    var polyhedron = createMesh(IfcFlowTerminalGeo,currentBlockName,"IfcFlowTerminal",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcBuildingElementProxy"://ok
                    var polyhedron = createMesh(IfcBuildingElementProxyGeo,currentBlockName,"IfcBuildingElementProxy",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcColumn"://ok
                    var polyhedron = createMesh(IfcColumnGeo,currentBlockName,"IfcColumn",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowController"://ok
                    var polyhedron = createMesh(IfcFlowControllerGeo,currentBlockName,"IfcFlowController",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowFitting"://ok
                    var polyhedron = createMesh(IfcFlowFittingGeo,currentBlockName,"IfcFlowFitting",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcMember"://ok
                    var polyhedron = createMesh(IfcMemberGeo,currentBlockName,"IfcMember",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcPlate"://ok
                    var polyhedron = createMesh(IfcPlateGeo,currentBlockName,"IfcPlate",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcSite"://ok
                    var polyhedron = createMesh(IfcSiteGeo,currentBlockName,"IfcSite",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRoof"://ok
                    var polyhedron = createMesh(IfcRoofGeo,currentBlockName,"IfcRoof",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFurnishingElement"://ok
                    var polyhedron = createMesh(IfcFurnishingElementGeo,currentBlockName,"IfcFurnishingElement",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                default:
                    break;

            }
        }


    }

    function destroyGroup()
    {
        downArr = [];
        forArr = [];
        var deleteNameArr = [];
        for(var i=0; i<scene.children.length;i++)
        {
            if(scene.children[i].name)
            {
                // console.log(scene.children[i].name);
                var pos = scene.children[i].name.indexOf("_");
                if(scene.children[i].name.substring(0,pos) == preBlockName)
                {
                    scene.children[i].geometry.dispose();
                    scene.children[i].geometry.vertices = null;
                    scene.children[i].geometry.faces = null;
                    scene.children[i].geometry.faceVertexUvs = null;
                    scene.children[i].geometry = null;
                    scene.children[i].material.dispose();
                    scene.children[i].material = null;
                    scene.children[i].children = [];
                    deleteNameArr.push(scene.children[i].name);
                }
            }
        }
        for(var i=0; i<deleteNameArr.length;i++)
        {
            var deleteObject = scene.getObjectByName(deleteNameArr[i]);
            scene.remove(deleteObject);
            deleteObject = null;
        }
    }

    /*
     点击左边按钮的触发事件
     */
    $('.left button').on('click',function(e){
        isCamRotate = false;
        xx=1;isRend=1;
        var btnClickedId = e.target.id;
        console.log(btnClickedId);

        if(currentBlockName!=btnClickedId && !isOnload)
        {
            isOnload = true;
            isJumpArea = true;
            preBlockName = currentBlockName;
            currentBlockName = btnClickedId;
            startDownloadNewBlock(currentBlockName);
            destroyGroup();
        }
    })


    function initStats() {

        var stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        $("#Stats-output").append( stats.domElement );

        return stats;
    }

    window.addEventListener('resize',onWindowResize,true);

    function onWindowResize(){
        camera.aspect=window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth,window.innerHeight);
        //renderer.render(scene,camera);
    }




    var isRend=1;
    function render() {

        stats.update();
        var delta = clock.getDelta();
        camControls.update(delta);
        requestAnimationFrame(render);
        renderer.render(scene, camera);

    }



    var texture3_1 = THREE.ImageUtils.loadTexture( './assets/textures/ifc_wall.png' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture3_1.anisotropy = maxAnisotropy;
    texture3_1.wrapS = texture3_1.wrapT = THREE.RepeatWrapping;
    texture3_1.repeat.set( 3, 0.75 );
    var material3_1 = new THREE.MeshPhongMaterial( { color: 0xaeb1b3, map: texture3_1,side: THREE.DoubleSide,shininess:100,opacity:1,transparent:true});

    var texture3_2 = THREE.ImageUtils.loadTexture( './assets/textures/floor2.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture3_2.anisotropy = maxAnisotropy;
    texture3_2.wrapS = texture3_2.wrapT = THREE.RepeatWrapping;
    texture3_2.repeat.set( 1, 1 );
    var material3_2 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture3_2,side: THREE.DoubleSide,shininess:100,opacity:1,transparent:true});



    var texture4 = THREE.ImageUtils.loadTexture( './assets/textures/ifc_column.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture4.anisotropy = maxAnisotropy;
    texture4.wrapS = texture4.wrapT = THREE.RepeatWrapping;
    texture4.repeat.set( 1, 1 );
    var material4 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture4,side: THREE.DoubleSide,shininess:100,opacity:1,transparent:true});




    function createMesh(geom,block,nam,tag) {

        if(!tag) tag = 0;

        //console.log(nam)
        var start = nam.indexOf('=')+1;
        var end = nam.indexOf('-');

        var trueName = nam.slice(start,end);
        //console.log(trueName)




        var mesh;
        var color = new THREE.Color( 0xff0000 );
        var myOpacity = 1;
        switch (nam) {
            case"IfcFooting":
                color =new THREE.Color( 0xFFBFFF );
                break;
            case "IfcWallStandardCase"://ok
                color =new THREE.Color( 0xaeb1b3 );
                break;
            case "IfcSlab"://ok
                color = new THREE.Color( 0x505050 );
                // myOpacity = 0.9;
                break;
            case "IfcStair"://ok
                color =new THREE.Color( 0xa4a592 );
                break;
            case "IfcDoor"://ok
                color =new THREE.Color( 0x6f6f6f );
                break;
            case "IfcWindow":
                color =new THREE.Color( 0x9ea3ef );
                break;
            case "IfcBeam"://ok
                color =new THREE.Color( 0x949584 );
                break;
            case "IfcCovering":
                color = new THREE.Color( 0x777a6f );
                break;
            case "IfcFlowSegment"://ok
                color = new THREE.Color( 0x999999 );
                break;
            case "IfcWall"://ok
                color = new THREE.Color( 0xbb9f7c );
                break;
            case "IfcRamp":
                color = new THREE.Color( 0x4d5053 );
                break;
            case "IfcRailing"://ok
                color = new THREE.Color( 0x4f4f4f );
                break;
            case "IfcFlowTerminal"://ok
                // color = new THREE.Color( 0xe9f5f8 );
                color = new THREE.Color( 0xd5d5d5 );
                break;
            case "IfcBuildingElementProxy"://ok
                color = new THREE.Color( 0x6f6f6f );
                // myOpacity = 0.7;
                break;
            case "IfcColumn"://ok
                color = new THREE.Color( 0x8a8f80 );
                break;
            case "IfcFlowController"://ok
                color = new THREE.Color( 0x2c2d2b );
                break;
            case "IfcFlowFitting"://ok
                color = new THREE.Color( 0x93a5aa );
                break;
            case "IfcPlate"://ok外体窗户
                color = new THREE.Color( 0x2a4260 );
                break;
            case "IfcMember"://ok外体窗户
                color = new THREE.Color( 0x2f2f2f );
                break;
            default:
                color = new THREE.Color( 0x194354 );
                break;

        }

        var material0 = new THREE.MeshPhongMaterial({ color: color, specular: 0xffae00,side: THREE.DoubleSide});


        geom.computeFaceNormals();  //有前面还先有个computeFaceNormal的操作，因为没有计算的话直接就使用normal的话可能得到不确定的normal


        /**
         * 根据UV坐标来贴上贴图
         */
        switch (nam) {
            //case"IfcFooting":
            //
            //    mesh = new THREE.Mesh(geom, material2);
            //    break;
            // case "IfcWallStandardCase"://ok
            //     if(geom.faces[0])
            //     {
            //         for(var i=0; i<geom.faces.length; ++i)
            //         {
            //             var normal = geom.faces[i].normal;
            //             normal.normalize();
            //             var directU,directV;
            //             if(String(normal.x) === '1' || String(normal.x) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(1,0,0);
            //             }
            //             else
            //             {
            //                 directU = new THREE.Vector3(1,0,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     if(isOutside)
            //     {
            //         mesh = new THREE.Mesh(geom, material3_1);
            //     }
            //     else
            //     {
            //         mesh = new THREE.Mesh(geom, material3_2);
            //     }
            //     break;
            // case "IfcSlab"://ok
            //     if(geom.faces[0]){
            //
            //         for(var i=0; i<geom.faces.length; ++i)
            //         {
            //             var normal = geom.faces[i].normal;
            //             normal.normalize();
            //             var directU,directV;
            //             if(String(normal.x) === '1' || String(normal.x) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(1,0,0);
            //             }
            //             else
            //             {
            //                 directU = new THREE.Vector3(1,0,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     // mesh = new THREE.Mesh(geom, material7);
            //     mesh = new THREE.Mesh(geom, material0);
            //     break;
            //case "IfcStair"://ok
            //
            //    mesh = new THREE.Mesh(geom, material1);
            //    break;
            //case "IfcDoor"://ok
            //
            //    mesh = new THREE.Mesh(geom, material2);
            //    break;
            // case "IfcWindow":
            //     if(geom.faces[0]){
            //         var normal = geom.faces[0].normal;
            //         var directU,directV;
            //         if(String(normal.x) === '1'){
            //             directU = new THREE.Vector3(0,1,0);
            //             directV = new THREE.Vector3(0,0,1);
            //         }else if(String(normal.y) === '1'){
            //             directU = new THREE.Vector3(1,0,0);
            //             directV = new THREE.Vector3(0,0,1);
            //         }else{
            //             directU = new THREE.Vector3(0,1,0);
            //             directV = new THREE.Vector3(1,0,0);
            //         }
            //
            //         for(var i=0; i<geom.faces.length; ++i){
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     mesh = new THREE.Mesh(geom, material11);
            //     break;
            //case "IfcBeam"://ok
            //
            //    mesh = new THREE.Mesh(geom, material9);
            //    break;
            //case "IfcCovering":
            //
            //    mesh = new THREE.Mesh(geom, material1);
            //    break;
            //case "IfcFlowSegment"://ok
            //
            //    mesh = new THREE.Mesh(geom, material5);
            //    break;
            // case "IfcWall"://ok
            //     if(geom.faces[0]){
            //         for(var i=0; i<geom.faces.length; ++i)
            //         {
            //             var normal = geom.faces[i].normal;
            //             normal.normalize();
            //             var directU,directV;
            //             if(String(normal.x) === '1' || String(normal.x) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(1,0,0);
            //             }
            //             else
            //             {
            //                 directU = new THREE.Vector3(1,0,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     if(isOutside)
            //     {
            //         mesh = new THREE.Mesh(geom, material3_1);
            //     }
            //     else
            //     {
            //         mesh = new THREE.Mesh(geom, material3_2);
            //     }
            //     break;
            //case "IfcRamp":
            //
            //    mesh = new THREE.Mesh(geom, material1);
            //    break;
            //case "IfcRailing"://ok
            //
            //    mesh = new THREE.Mesh(geom, material8);
            //    break;
            //case "IfcFlowTerminal"://ok
            //
            //    mesh = new THREE.Mesh(geom, material9);
            //    break;
            //case "IfcBuildingElementProxy"://ok
            //
            //    mesh = new THREE.Mesh(geom, material5);
            //    break;
            // case "IfcColumn"://ok
            //     if(geom.faces[0]){
            //
            //
            //         for(var i=0; i<geom.faces.length; ++i){
            //             var normal = geom.faces[i].normal;
            //             normal.normalize();
            //             var directU,directV;
            //             if(String(normal.x) === '1' || String(normal.x) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(1,0,0);
            //             }
            //             else
            //             {
            //                 directU = new THREE.Vector3(1,0,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     mesh = new THREE.Mesh(geom, material4);
            //     break;
            //case "IfcFlowController"://ok
            //
            //    mesh = new THREE.Mesh(geom, material1);
            //    break;
            //case "IfcFlowFitting"://ok
            //
            //    mesh = new THREE.Mesh(geom, material8);
            //    break;
            default:
                mesh = new THREE.Mesh(geom, material0);
                break;
        }

        mesh.name = block+"_"+nam+"-"+tag;

        return mesh;

    }



    $('.property button').on('click',function(e){

        var btnClickedId = e.target.id;
        //改现操作模式currentControlType
        // console.log(btnClickedId[btnClickedId.length-1]);
        if(currentControlType==1){
            // unDisplayModelArr = [];
            if(editInfoSelectedObj)
            {
                scene.remove(editInfoSelectedObj);
                polyhedrons.splice(polyhedrons.length-2,1);
            }
            renderer.render(scene,camera);
        }
        if(currentControlType==2){
            console.log("add");
            //清除构件高亮状态以及删除坐标轴
            scene.remove(transformControls);
            if (SELECTED) {
                SELECTED.material = selectedOriginMat;
                // scene.remove(SELECTED);
                // SELECTED = null;
            }

            renderer.render(scene,camera);
            //此处判断逻辑有待完善(待更改的材质赋值时，groupMat为空)--TransformControls.js:1257 Uncaught TypeError: Cannot read property 'length' of undefined
            // if (muti_group.length > 0) {
            //     for (i = 0; i < muti_group.length; i++) {
            //         for (j = 0; j < muti_group[i].children.length; j++) {
            //             muti_group[i].children[j].material = groupMat[i][j];
            //         }
            //     }
            // }
        }
        currentControlType = btnClickedId[btnClickedId.length-1];
        console.log("currentControlType: " + currentControlType);


    });
    })
});
}).call(this,require("buffer").Buffer)
},{"buffer":3,"parse-torrent":46,"path":10}],39:[function(require,module,exports){
(function (Buffer){
const INTEGER_START = 0x69 // 'i'
const STRING_DELIM = 0x3A // ':'
const DICTIONARY_START = 0x64 // 'd'
const LIST_START = 0x6C // 'l'
const END_OF_TYPE = 0x65 // 'e'

/**
 * replaces parseInt(buffer.toString('ascii', start, end)).
 * For strings with less then ~30 charachters, this is actually a lot faster.
 *
 * @param {Buffer} data
 * @param {Number} start
 * @param {Number} end
 * @return {Number} calculated number
 */
function getIntFromBuffer (buffer, start, end) {
  var sum = 0
  var sign = 1

  for (var i = start; i < end; i++) {
    var num = buffer[i]

    if (num < 58 && num >= 48) {
      sum = sum * 10 + (num - 48)
      continue
    }

    if (i === start && num === 43) { // +
      continue
    }

    if (i === start && num === 45) { // -
      sign = -1
      continue
    }

    if (num === 46) { // .
      // its a float. break here.
      break
    }

    throw new Error('not a number: buffer[' + i + '] = ' + num)
  }

  return sum * sign
}

/**
 * Decodes bencoded data.
 *
 * @param  {Buffer} data
 * @param  {Number} start (optional)
 * @param  {Number} end (optional)
 * @param  {String} encoding (optional)
 * @return {Object|Array|Buffer|String|Number}
 */
function decode (data, start, end, encoding) {
  if (data == null || data.length === 0) {
    return null
  }

  if (typeof start !== 'number' && encoding == null) {
    encoding = start
    start = undefined
  }

  if (typeof end !== 'number' && encoding == null) {
    encoding = end
    end = undefined
  }

  decode.position = 0
  decode.encoding = encoding || null

  decode.data = !(Buffer.isBuffer(data))
    ? new Buffer(data)
    : data.slice(start, end)

  decode.bytes = decode.data.length

  return decode.next()
}

decode.bytes = 0
decode.position = 0
decode.data = null
decode.encoding = null

decode.next = function () {
  switch (decode.data[decode.position]) {
    case DICTIONARY_START:
      return decode.dictionary()
    case LIST_START:
      return decode.list()
    case INTEGER_START:
      return decode.integer()
    default:
      return decode.buffer()
  }
}

decode.find = function (chr) {
  var i = decode.position
  var c = decode.data.length
  var d = decode.data

  while (i < c) {
    if (d[i] === chr) return i
    i++
  }

  throw new Error(
    'Invalid data: Missing delimiter "' +
    String.fromCharCode(chr) + '" [0x' +
    chr.toString(16) + ']'
  )
}

decode.dictionary = function () {
  decode.position++

  var dict = {}

  while (decode.data[decode.position] !== END_OF_TYPE) {
    dict[decode.buffer()] = decode.next()
  }

  decode.position++

  return dict
}

decode.list = function () {
  decode.position++

  var lst = []

  while (decode.data[decode.position] !== END_OF_TYPE) {
    lst.push(decode.next())
  }

  decode.position++

  return lst
}

decode.integer = function () {
  var end = decode.find(END_OF_TYPE)
  var number = getIntFromBuffer(decode.data, decode.position + 1, end)

  decode.position += end + 1 - decode.position

  return number
}

decode.buffer = function () {
  var sep = decode.find(STRING_DELIM)
  var length = getIntFromBuffer(decode.data, decode.position, sep)
  var end = ++sep + length

  decode.position = end

  return decode.encoding
    ? decode.data.toString(decode.encoding, sep, end)
    : decode.data.slice(sep, end)
}

module.exports = decode

}).call(this,require("buffer").Buffer)
},{"buffer":3}],40:[function(require,module,exports){
var Buffer = require('safe-buffer').Buffer

/**
 * Encodes data in bencode.
 *
 * @param  {Buffer|Array|String|Object|Number|Boolean} data
 * @return {Buffer}
 */
function encode (data, buffer, offset) {
  var buffers = []
  var result = null

  encode._encode(buffers, data)
  result = Buffer.concat(buffers)
  encode.bytes = result.length

  if (Buffer.isBuffer(buffer)) {
    result.copy(buffer, offset)
    return buffer
  }

  return result
}

encode.bytes = -1
encode._floatConversionDetected = false

encode._encode = function (buffers, data) {
  if (Buffer.isBuffer(data)) {
    buffers.push(Buffer.from(data.length + ':'))
    buffers.push(data)
    return
  }

  if (data == null) { return }

  switch (typeof data) {
    case 'string':
      encode.buffer(buffers, data)
      break
    case 'number':
      encode.number(buffers, data)
      break
    case 'object':
      data.constructor === Array
        ? encode.list(buffers, data)
        : encode.dict(buffers, data)
      break
    case 'boolean':
      encode.number(buffers, data ? 1 : 0)
      break
  }
}

var buffE = Buffer.from('e')
var buffD = Buffer.from('d')
var buffL = Buffer.from('l')

encode.buffer = function (buffers, data) {
  buffers.push(Buffer.from(Buffer.byteLength(data) + ':' + data))
}

encode.number = function (buffers, data) {
  var maxLo = 0x80000000
  var hi = (data / maxLo) << 0
  var lo = (data % maxLo) << 0
  var val = hi * maxLo + lo

  buffers.push(Buffer.from('i' + val + 'e'))

  if (val !== data && !encode._floatConversionDetected) {
    encode._floatConversionDetected = true
    console.warn(
      'WARNING: Possible data corruption detected with value "' + data + '":',
      'Bencoding only defines support for integers, value was converted to "' + val + '"'
    )
    console.trace()
  }
}

encode.dict = function (buffers, data) {
  buffers.push(buffD)

  var j = 0
  var k
  // fix for issue #13 - sorted dicts
  var keys = Object.keys(data).sort()
  var kl = keys.length

  for (; j < kl; j++) {
    k = keys[j]
    if (data[k] == null) continue
    encode.buffer(buffers, k)
    encode._encode(buffers, data[k])
  }

  buffers.push(buffE)
}

encode.list = function (buffers, data) {
  var i = 0
  var c = data.length
  buffers.push(buffL)

  for (; i < c; i++) {
    if (data[i] == null) continue
    encode._encode(buffers, data[i])
  }

  buffers.push(buffE)
}

module.exports = encode

},{"safe-buffer":48}],41:[function(require,module,exports){
var bencode = module.exports

bencode.encode = require('./encode')
bencode.decode = require('./decode')

/**
 * Determines the amount of bytes
 * needed to encode the given value
 * @param  {Object|Array|Buffer|String|Number|Boolean} value
 * @return {Number} byteCount
 */
bencode.byteLength = bencode.encodingLength = function (value) {
  return bencode.encode(value).length
}

},{"./decode":39,"./encode":40}],42:[function(require,module,exports){
(function (Buffer){
/* global Blob, FileReader */

module.exports = function blobToBuffer (blob, cb) {
  if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
    throw new Error('first argument must be a Blob')
  }
  if (typeof cb !== 'function') {
    throw new Error('second argument must be a function')
  }

  var reader = new FileReader()

  function onLoadEnd (e) {
    reader.removeEventListener('loadend', onLoadEnd, false)
    if (e.error) cb(e.error)
    else cb(null, new Buffer(reader.result))
  }

  reader.addEventListener('loadend', onLoadEnd, false)
  reader.readAsArrayBuffer(blob)
}

}).call(this,require("buffer").Buffer)
},{"buffer":3}],43:[function(require,module,exports){
module.exports = magnetURIDecode
module.exports.decode = magnetURIDecode
module.exports.encode = magnetURIEncode

var base32 = require('thirty-two')
var Buffer = require('safe-buffer').Buffer
var extend = require('xtend')
var uniq = require('uniq')

/**
 * Parse a magnet URI and return an object of keys/values
 *
 * @param  {string} uri
 * @return {Object} parsed uri
 */
function magnetURIDecode (uri) {
  var result = {}

  // Support 'magnet:' and 'stream-magnet:' uris
  var data = uri.split('magnet:?')[1]

  var params = (data && data.length >= 0)
    ? data.split('&')
    : []

  params.forEach(function (param) {
    var keyval = param.split('=')

    // This keyval is invalid, skip it
    if (keyval.length !== 2) return

    var key = keyval[0]
    var val = keyval[1]

    // Clean up torrent name
    if (key === 'dn') val = decodeURIComponent(val).replace(/\+/g, ' ')

    // Address tracker (tr), exact source (xs), and acceptable source (as) are encoded
    // URIs, so decode them
    if (key === 'tr' || key === 'xs' || key === 'as' || key === 'ws') {
      val = decodeURIComponent(val)
    }

    // Return keywords as an array
    if (key === 'kt') val = decodeURIComponent(val).split('+')

    // Cast file index (ix) to a number
    if (key === 'ix') val = Number(val)

    // If there are repeated parameters, return an array of values
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(val)
      } else {
        var old = result[key]
        result[key] = [old, val]
      }
    } else {
      result[key] = val
    }
  })

  // Convenience properties for parity with `parse-torrent-file` module
  var m
  if (result.xt) {
    var xts = Array.isArray(result.xt) ? result.xt : [ result.xt ]
    xts.forEach(function (xt) {
      if ((m = xt.match(/^urn:btih:(.{40})/))) {
        result.infoHash = m[1].toLowerCase()
      } else if ((m = xt.match(/^urn:btih:(.{32})/))) {
        var decodedStr = base32.decode(m[1])
        result.infoHash = Buffer.from(decodedStr, 'binary').toString('hex')
      }
    })
  }
  if (result.infoHash) result.infoHashBuffer = Buffer.from(result.infoHash, 'hex')

  if (result.dn) result.name = result.dn
  if (result.kt) result.keywords = result.kt

  if (typeof result.tr === 'string') result.announce = [ result.tr ]
  else if (Array.isArray(result.tr)) result.announce = result.tr
  else result.announce = []

  result.urlList = []
  if (typeof result.as === 'string' || Array.isArray(result.as)) {
    result.urlList = result.urlList.concat(result.as)
  }
  if (typeof result.ws === 'string' || Array.isArray(result.ws)) {
    result.urlList = result.urlList.concat(result.ws)
  }

  uniq(result.announce)
  uniq(result.urlList)

  return result
}

function magnetURIEncode (obj) {
  obj = extend(obj) // clone obj, so we can mutate it

  // support using convenience names, in addition to spec names
  // (example: `infoHash` for `xt`, `name` for `dn`)
  if (obj.infoHashBuffer) obj.xt = 'urn:btih:' + obj.infoHashBuffer.toString('hex')
  if (obj.infoHash) obj.xt = 'urn:btih:' + obj.infoHash
  if (obj.name) obj.dn = obj.name
  if (obj.keywords) obj.kt = obj.keywords
  if (obj.announce) obj.tr = obj.announce
  if (obj.urlList) {
    obj.ws = obj.urlList
    delete obj.as
  }

  var result = 'magnet:?'
  Object.keys(obj)
    .filter(function (key) {
      return key.length === 2
    })
    .forEach(function (key, i) {
      var values = Array.isArray(obj[key]) ? obj[key] : [ obj[key] ]
      values.forEach(function (val, j) {
        if ((i > 0 || j > 0) && (key !== 'kt' || j === 0)) result += '&'

        if (key === 'dn') val = encodeURIComponent(val).replace(/%20/g, '+')
        if (key === 'tr' || key === 'xs' || key === 'as' || key === 'ws') {
          val = encodeURIComponent(val)
        }
        if (key === 'kt') val = encodeURIComponent(val)

        if (key === 'kt' && j > 0) result += '+' + val
        else result += key + '=' + val
      })
    })

  return result
}

},{"safe-buffer":48,"thirty-two":52,"uniq":54,"xtend":56}],44:[function(require,module,exports){
var wrappy = require('wrappy')
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}

},{"wrappy":55}],45:[function(require,module,exports){
(function (Buffer){
module.exports = decodeTorrentFile
module.exports.decode = decodeTorrentFile
module.exports.encode = encodeTorrentFile

var bencode = require('bencode')
var path = require('path')
var sha1 = require('simple-sha1')
var uniq = require('uniq')

/**
 * Parse a torrent. Throws an exception if the torrent is missing required fields.
 * @param  {Buffer|Object} torrent
 * @return {Object}        parsed torrent
 */
function decodeTorrentFile (torrent) {
  if (Buffer.isBuffer(torrent)) {
    torrent = bencode.decode(torrent)
  }

  // sanity check
  ensure(torrent.info, 'info')
  ensure(torrent.info['name.utf-8'] || torrent.info.name, 'info.name')
  ensure(torrent.info['piece length'], 'info[\'piece length\']')
  ensure(torrent.info.pieces, 'info.pieces')

  if (torrent.info.files) {
    torrent.info.files.forEach(function (file) {
      ensure(typeof file.length === 'number', 'info.files[0].length')
      ensure(file['path.utf-8'] || file.path, 'info.files[0].path')
    })
  } else {
    ensure(typeof torrent.info.length === 'number', 'info.length')
  }

  var result = {}
  result.info = torrent.info
  result.infoBuffer = bencode.encode(torrent.info)
  result.infoHash = sha1.sync(result.infoBuffer)
  result.infoHashBuffer = Buffer.from(result.infoHash, 'hex')

  result.name = (torrent.info['name.utf-8'] || torrent.info.name).toString()

  if (torrent.info.private !== undefined) result.private = !!torrent.info.private

  if (torrent['creation date']) result.created = new Date(torrent['creation date'] * 1000)
  if (torrent['created by']) result.createdBy = torrent['created by'].toString()

  if (Buffer.isBuffer(torrent.comment)) result.comment = torrent.comment.toString()

  // announce and announce-list will be missing if metadata fetched via ut_metadata
  result.announce = []
  if (torrent['announce-list'] && torrent['announce-list'].length) {
    torrent['announce-list'].forEach(function (urls) {
      urls.forEach(function (url) {
        result.announce.push(url.toString())
      })
    })
  } else if (torrent.announce) {
    result.announce.push(torrent.announce.toString())
  }

  // handle url-list (BEP19 / web seeding)
  if (Buffer.isBuffer(torrent['url-list'])) {
    // some clients set url-list to empty string
    torrent['url-list'] = torrent['url-list'].length > 0
      ? [ torrent['url-list'] ]
      : []
  }
  result.urlList = (torrent['url-list'] || []).map(function (url) {
    return url.toString()
  })

  uniq(result.announce)
  uniq(result.urlList)

  var files = torrent.info.files || [ torrent.info ]
  result.files = files.map(function (file, i) {
    var parts = [].concat(result.name, file['path.utf-8'] || file.path || []).map(function (p) {
      return p.toString()
    })
    return {
      path: path.join.apply(null, [path.sep].concat(parts)).slice(1),
      name: parts[parts.length - 1],
      length: file.length,
      offset: files.slice(0, i).reduce(sumLength, 0)
    }
  })

  result.length = files.reduce(sumLength, 0)

  var lastFile = result.files[result.files.length - 1]

  result.pieceLength = torrent.info['piece length']
  result.lastPieceLength = ((lastFile.offset + lastFile.length) % result.pieceLength) || result.pieceLength
  result.pieces = splitPieces(torrent.info.pieces)

  return result
}

/**
 * Convert a parsed torrent object back into a .torrent file buffer.
 * @param  {Object} parsed parsed torrent
 * @return {Buffer}
 */
function encodeTorrentFile (parsed) {
  var torrent = {
    info: parsed.info
  }

  torrent['announce-list'] = (parsed.announce || []).map(function (url) {
    if (!torrent.announce) torrent.announce = url
    url = Buffer.from(url, 'utf8')
    return [ url ]
  })

  torrent['url-list'] = parsed.urlList || []

  if (parsed.created) {
    torrent['creation date'] = (parsed.created.getTime() / 1000) | 0
  }

  if (parsed.createdBy) {
    torrent['created by'] = parsed.createdBy
  }

  if (parsed.comment) {
    torrent.comment = parsed.comment
  }

  return bencode.encode(torrent)
}

function sumLength (sum, file) {
  return sum + file.length
}

function splitPieces (buf) {
  var pieces = []
  for (var i = 0; i < buf.length; i += 20) {
    pieces.push(buf.slice(i, i + 20).toString('hex'))
  }
  return pieces
}

function ensure (bool, fieldName) {
  if (!bool) throw new Error('Torrent is missing required field: ' + fieldName)
}

}).call(this,require("buffer").Buffer)
},{"bencode":41,"buffer":3,"path":10,"simple-sha1":51,"uniq":54}],46:[function(require,module,exports){
(function (process,Buffer){
/* global Blob */

module.exports = parseTorrent
module.exports.remote = parseTorrentRemote

var blobToBuffer = require('blob-to-buffer')
var fs = require('fs') // browser exclude
var get = require('simple-get')
var magnet = require('magnet-uri')
var parseTorrentFile = require('parse-torrent-file')

module.exports.toMagnetURI = magnet.encode
module.exports.toTorrentFile = parseTorrentFile.encode

/**
 * Parse a torrent identifier (magnet uri, .torrent file, info hash)
 * @param  {string|Buffer|Object} torrentId
 * @return {Object}
 */
function parseTorrent (torrentId) {
  if (typeof torrentId === 'string' && /^(stream-)?magnet:/.test(torrentId)) {
    // magnet uri (string)
    return magnet(torrentId)
  } else if (typeof torrentId === 'string' && (/^[a-f0-9]{40}$/i.test(torrentId) || /^[a-z2-7]{32}$/i.test(torrentId))) {
    // info hash (hex/base-32 string)
    return magnet('magnet:?xt=urn:btih:' + torrentId)
  } else if (Buffer.isBuffer(torrentId) && torrentId.length === 20) {
    // info hash (buffer)
    return magnet('magnet:?xt=urn:btih:' + torrentId.toString('hex'))
  } else if (Buffer.isBuffer(torrentId)) {
    // .torrent file (buffer)
    return parseTorrentFile(torrentId) // might throw
  } else if (torrentId && torrentId.infoHash) {
    // parsed torrent (from `parse-torrent`, `parse-torrent-file`, or `magnet-uri`)
    if (!torrentId.announce) torrentId.announce = []
    if (typeof torrentId.announce === 'string') {
      torrentId.announce = [ torrentId.announce ]
    }
    if (!torrentId.urlList) torrentId.urlList = []
    return torrentId
  } else {
    throw new Error('Invalid torrent identifier')
  }
}

function parseTorrentRemote (torrentId, cb) {
  var parsedTorrent
  if (typeof cb !== 'function') throw new Error('second argument must be a Function')

  try {
    parsedTorrent = parseTorrent(torrentId)
  } catch (err) {
    // If torrent fails to parse, it could be a Blob, http/https URL or
    // filesystem path, so don't consider it an error yet.
  }

  if (parsedTorrent && parsedTorrent.infoHash) {
    process.nextTick(function () {
      cb(null, parsedTorrent)
    })
  } else if (isBlob(torrentId)) {
    blobToBuffer(torrentId, function (err, torrentBuf) {
      if (err) return cb(new Error('Error converting Blob: ' + err.message))
      parseOrThrow(torrentBuf)
    })
  } else if (typeof get === 'function' && /^https?:/.test(torrentId)) {
    // http, or https url to torrent file
    get.concat({
      url: torrentId,
      timeout: 30 * 1000,
      headers: { 'user-agent': 'WebTorrent (http://webtorrent.io)' }
    }, function (err, res, torrentBuf) {
      if (err) return cb(new Error('Error downloading torrent: ' + err.message))
      parseOrThrow(torrentBuf)
    })
  } else if (typeof fs.readFile === 'function' && typeof torrentId === 'string') {
    // assume it's a filesystem path
    fs.readFile(torrentId, function (err, torrentBuf) {
      if (err) return cb(new Error('Invalid torrent identifier'))
      parseOrThrow(torrentBuf)
    })
  } else {
    process.nextTick(function () {
      cb(new Error('Invalid torrent identifier'))
    })
  }

  function parseOrThrow (torrentBuf) {
    try {
      parsedTorrent = parseTorrent(torrentBuf)
    } catch (err) {
      return cb(err)
    }
    if (parsedTorrent && parsedTorrent.infoHash) cb(null, parsedTorrent)
    else cb(new Error('Invalid torrent identifier'))
  }
}

/**
 * Check if `obj` is a W3C `Blob` or `File` object
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}

// Workaround Browserify v13 bug
// https://github.com/substack/node-browserify/issues/1483
;(function () { Buffer.alloc(0) })()

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":11,"blob-to-buffer":42,"buffer":3,"fs":1,"magnet-uri":43,"parse-torrent-file":45,"simple-get":50}],47:[function(require,module,exports){
(function (global){
(function () {
    function Rusha(chunkSize) {
        'use strict';
        var util = {
            getDataType: function (data) {
                if (typeof data === 'string') {
                    return 'string';
                }
                if (data instanceof Array) {
                    return 'array';
                }
                if (typeof global !== 'undefined' && global.Buffer && global.Buffer.isBuffer(data)) {
                    return 'buffer';
                }
                if (data instanceof ArrayBuffer) {
                    return 'arraybuffer';
                }
                if (data.buffer instanceof ArrayBuffer) {
                    return 'view';
                }
                if (data instanceof Blob) {
                    return 'blob';
                }
                throw new Error('Unsupported data type.');
            }
        };
        var // Private object structure.
        self$2 = { fill: 0 };
        var // Calculate the length of buffer that the sha1 routine uses
        // including the padding.
        padlen = function (len) {
            for (len += 9; len % 64 > 0; len += 1);
            return len;
        };
        var padZeroes = function (bin, len) {
            var h8 = new Uint8Array(bin.buffer);
            var om = len % 4, align = len - om;
            switch (om) {
            case 0:
                h8[align + 3] = 0;
            case 1:
                h8[align + 2] = 0;
            case 2:
                h8[align + 1] = 0;
            case 3:
                h8[align + 0] = 0;
            }
            for (var i$2 = (len >> 2) + 1; i$2 < bin.length; i$2++)
                bin[i$2] = 0;
        };
        var padData = function (bin, chunkLen, msgLen) {
            bin[chunkLen >> 2] |= 128 << 24 - (chunkLen % 4 << 3);
            // To support msgLen >= 2 GiB, use a float division when computing the
            // high 32-bits of the big-endian message length in bits.
            bin[((chunkLen >> 2) + 2 & ~15) + 14] = msgLen / (1 << 29) | 0;
            bin[((chunkLen >> 2) + 2 & ~15) + 15] = msgLen << 3;
        };
        var // Convert a binary string and write it to the heap.
        // A binary string is expected to only contain char codes < 256.
        convStr = function (H8, H32, start, len, off) {
            var str = this, i$2, om = off % 4, lm = (len + om) % 4, j = len - lm;
            switch (om) {
            case 0:
                H8[off] = str.charCodeAt(start + 3);
            case 1:
                H8[off + 1 - (om << 1) | 0] = str.charCodeAt(start + 2);
            case 2:
                H8[off + 2 - (om << 1) | 0] = str.charCodeAt(start + 1);
            case 3:
                H8[off + 3 - (om << 1) | 0] = str.charCodeAt(start);
            }
            if (len < lm + om) {
                return;
            }
            for (i$2 = 4 - om; i$2 < j; i$2 = i$2 + 4 | 0) {
                H32[off + i$2 >> 2] = str.charCodeAt(start + i$2) << 24 | str.charCodeAt(start + i$2 + 1) << 16 | str.charCodeAt(start + i$2 + 2) << 8 | str.charCodeAt(start + i$2 + 3);
            }
            switch (lm) {
            case 3:
                H8[off + j + 1 | 0] = str.charCodeAt(start + j + 2);
            case 2:
                H8[off + j + 2 | 0] = str.charCodeAt(start + j + 1);
            case 1:
                H8[off + j + 3 | 0] = str.charCodeAt(start + j);
            }
        };
        var // Convert a buffer or array and write it to the heap.
        // The buffer or array is expected to only contain elements < 256.
        convBuf = function (H8, H32, start, len, off) {
            var buf = this, i$2, om = off % 4, lm = (len + om) % 4, j = len - lm;
            switch (om) {
            case 0:
                H8[off] = buf[start + 3];
            case 1:
                H8[off + 1 - (om << 1) | 0] = buf[start + 2];
            case 2:
                H8[off + 2 - (om << 1) | 0] = buf[start + 1];
            case 3:
                H8[off + 3 - (om << 1) | 0] = buf[start];
            }
            if (len < lm + om) {
                return;
            }
            for (i$2 = 4 - om; i$2 < j; i$2 = i$2 + 4 | 0) {
                H32[off + i$2 >> 2 | 0] = buf[start + i$2] << 24 | buf[start + i$2 + 1] << 16 | buf[start + i$2 + 2] << 8 | buf[start + i$2 + 3];
            }
            switch (lm) {
            case 3:
                H8[off + j + 1 | 0] = buf[start + j + 2];
            case 2:
                H8[off + j + 2 | 0] = buf[start + j + 1];
            case 1:
                H8[off + j + 3 | 0] = buf[start + j];
            }
        };
        var convBlob = function (H8, H32, start, len, off) {
            var blob = this, i$2, om = off % 4, lm = (len + om) % 4, j = len - lm;
            var buf = new Uint8Array(reader.readAsArrayBuffer(blob.slice(start, start + len)));
            switch (om) {
            case 0:
                H8[off] = buf[3];
            case 1:
                H8[off + 1 - (om << 1) | 0] = buf[2];
            case 2:
                H8[off + 2 - (om << 1) | 0] = buf[1];
            case 3:
                H8[off + 3 - (om << 1) | 0] = buf[0];
            }
            if (len < lm + om) {
                return;
            }
            for (i$2 = 4 - om; i$2 < j; i$2 = i$2 + 4 | 0) {
                H32[off + i$2 >> 2 | 0] = buf[i$2] << 24 | buf[i$2 + 1] << 16 | buf[i$2 + 2] << 8 | buf[i$2 + 3];
            }
            switch (lm) {
            case 3:
                H8[off + j + 1 | 0] = buf[j + 2];
            case 2:
                H8[off + j + 2 | 0] = buf[j + 1];
            case 1:
                H8[off + j + 3 | 0] = buf[j];
            }
        };
        var convFn = function (data) {
            switch (util.getDataType(data)) {
            case 'string':
                return convStr.bind(data);
            case 'array':
                return convBuf.bind(data);
            case 'buffer':
                return convBuf.bind(data);
            case 'arraybuffer':
                return convBuf.bind(new Uint8Array(data));
            case 'view':
                return convBuf.bind(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
            case 'blob':
                return convBlob.bind(data);
            }
        };
        var slice = function (data, offset) {
            switch (util.getDataType(data)) {
            case 'string':
                return data.slice(offset);
            case 'array':
                return data.slice(offset);
            case 'buffer':
                return data.slice(offset);
            case 'arraybuffer':
                return data.slice(offset);
            case 'view':
                return data.buffer.slice(offset);
            }
        };
        var // Precompute 00 - ff strings
        precomputedHex = new Array(256);
        for (var i = 0; i < 256; i++) {
            precomputedHex[i] = (i < 16 ? '0' : '') + i.toString(16);
        }
        var // Convert an ArrayBuffer into its hexadecimal string representation.
        hex = function (arrayBuffer) {
            var binarray = new Uint8Array(arrayBuffer);
            var res = new Array(arrayBuffer.byteLength);
            for (var i$2 = 0; i$2 < res.length; i$2++) {
                res[i$2] = precomputedHex[binarray[i$2]];
            }
            return res.join('');
        };
        var ceilHeapSize = function (v) {
            // The asm.js spec says:
            // The heap object's byteLength must be either
            // 2^n for n in [12, 24) or 2^24 * n for n ≥ 1.
            // Also, byteLengths smaller than 2^16 are deprecated.
            var p;
            if (// If v is smaller than 2^16, the smallest possible solution
                // is 2^16.
                v <= 65536)
                return 65536;
            if (// If v < 2^24, we round up to 2^n,
                // otherwise we round up to 2^24 * n.
                v < 16777216) {
                for (p = 1; p < v; p = p << 1);
            } else {
                for (p = 16777216; p < v; p += 16777216);
            }
            return p;
        };
        var // Initialize the internal data structures to a new capacity.
        init = function (size) {
            if (size % 64 > 0) {
                throw new Error('Chunk size must be a multiple of 128 bit');
            }
            self$2.offset = 0;
            self$2.maxChunkLen = size;
            self$2.padMaxChunkLen = padlen(size);
            // The size of the heap is the sum of:
            // 1. The padded input message size
            // 2. The extended space the algorithm needs (320 byte)
            // 3. The 160 bit state the algoritm uses
            self$2.heap = new ArrayBuffer(ceilHeapSize(self$2.padMaxChunkLen + 320 + 20));
            self$2.h32 = new Int32Array(self$2.heap);
            self$2.h8 = new Int8Array(self$2.heap);
            self$2.core = new Rusha._core({
                Int32Array: Int32Array,
                DataView: DataView
            }, {}, self$2.heap);
            self$2.buffer = null;
        };
        // Iinitializethe datastructures according
        // to a chunk siyze.
        init(chunkSize || 64 * 1024);
        var initState = function (heap, padMsgLen) {
            self$2.offset = 0;
            var io = new Int32Array(heap, padMsgLen + 320, 5);
            io[0] = 1732584193;
            io[1] = -271733879;
            io[2] = -1732584194;
            io[3] = 271733878;
            io[4] = -1009589776;
        };
        var padChunk = function (chunkLen, msgLen) {
            var padChunkLen = padlen(chunkLen);
            var view = new Int32Array(self$2.heap, 0, padChunkLen >> 2);
            padZeroes(view, chunkLen);
            padData(view, chunkLen, msgLen);
            return padChunkLen;
        };
        var // Write data to the heap.
        write = function (data, chunkOffset, chunkLen, off) {
            convFn(data)(self$2.h8, self$2.h32, chunkOffset, chunkLen, off || 0);
        };
        var // Initialize and call the RushaCore,
        // assuming an input buffer of length len * 4.
        coreCall = function (data, chunkOffset, chunkLen, msgLen, finalize) {
            var padChunkLen = chunkLen;
            write(data, chunkOffset, chunkLen);
            if (finalize) {
                padChunkLen = padChunk(chunkLen, msgLen);
            }
            self$2.core.hash(padChunkLen, self$2.padMaxChunkLen);
        };
        var getRawDigest = function (heap, padMaxChunkLen) {
            var io = new Int32Array(heap, padMaxChunkLen + 320, 5);
            var out = new Int32Array(5);
            var arr = new DataView(out.buffer);
            arr.setInt32(0, io[0], false);
            arr.setInt32(4, io[1], false);
            arr.setInt32(8, io[2], false);
            arr.setInt32(12, io[3], false);
            arr.setInt32(16, io[4], false);
            return out;
        };
        var // Calculate the hash digest as an array of 5 32bit integers.
        rawDigest = this.rawDigest = function (str) {
            var msgLen = str.byteLength || str.length || str.size || 0;
            initState(self$2.heap, self$2.padMaxChunkLen);
            var chunkOffset = 0, chunkLen = self$2.maxChunkLen;
            for (chunkOffset = 0; msgLen > chunkOffset + chunkLen; chunkOffset += chunkLen) {
                coreCall(str, chunkOffset, chunkLen, msgLen, false);
            }
            coreCall(str, chunkOffset, msgLen - chunkOffset, msgLen, true);
            return getRawDigest(self$2.heap, self$2.padMaxChunkLen);
        };
        // The digest and digestFrom* interface returns the hash digest
        // as a hex string.
        this.digest = this.digestFromString = this.digestFromBuffer = this.digestFromArrayBuffer = function (str) {
            return hex(rawDigest(str).buffer);
        };
        this.resetState = function () {
            initState(self$2.heap, self$2.padMaxChunkLen);
            return this;
        };
        this.append = function (chunk) {
            var chunkOffset = 0;
            var chunkLen = chunk.byteLength || chunk.length || chunk.size || 0;
            var turnOffset = self$2.offset % self$2.maxChunkLen;
            var inputLen;
            self$2.offset += chunkLen;
            while (chunkOffset < chunkLen) {
                inputLen = Math.min(chunkLen - chunkOffset, self$2.maxChunkLen - turnOffset);
                write(chunk, chunkOffset, inputLen, turnOffset);
                turnOffset += inputLen;
                chunkOffset += inputLen;
                if (turnOffset === self$2.maxChunkLen) {
                    self$2.core.hash(self$2.maxChunkLen, self$2.padMaxChunkLen);
                    turnOffset = 0;
                }
            }
            return this;
        };
        this.getState = function () {
            var turnOffset = self$2.offset % self$2.maxChunkLen;
            var heap;
            if (!turnOffset) {
                var io = new Int32Array(self$2.heap, self$2.padMaxChunkLen + 320, 5);
                heap = io.buffer.slice(io.byteOffset, io.byteOffset + io.byteLength);
            } else {
                heap = self$2.heap.slice(0);
            }
            return {
                offset: self$2.offset,
                heap: heap
            };
        };
        this.setState = function (state) {
            self$2.offset = state.offset;
            if (state.heap.byteLength === 20) {
                var io = new Int32Array(self$2.heap, self$2.padMaxChunkLen + 320, 5);
                io.set(new Int32Array(state.heap));
            } else {
                self$2.h32.set(new Int32Array(state.heap));
            }
            return this;
        };
        var rawEnd = this.rawEnd = function () {
            var msgLen = self$2.offset;
            var chunkLen = msgLen % self$2.maxChunkLen;
            var padChunkLen = padChunk(chunkLen, msgLen);
            self$2.core.hash(padChunkLen, self$2.padMaxChunkLen);
            var result = getRawDigest(self$2.heap, self$2.padMaxChunkLen);
            initState(self$2.heap, self$2.padMaxChunkLen);
            return result;
        };
        this.end = function () {
            return hex(rawEnd().buffer);
        };
    }
    ;
    // The low-level RushCore module provides the heart of Rusha,
    // a high-speed sha1 implementation working on an Int32Array heap.
    // At first glance, the implementation seems complicated, however
    // with the SHA1 spec at hand, it is obvious this almost a textbook
    // implementation that has a few functions hand-inlined and a few loops
    // hand-unrolled.
    Rusha._core = function RushaCore(stdlib, foreign, heap) {
        'use asm';
        var H = new stdlib.Int32Array(heap);
        function hash(k, x) {
            // k in bytes
            k = k | 0;
            x = x | 0;
            var i = 0, j = 0, y0 = 0, z0 = 0, y1 = 0, z1 = 0, y2 = 0, z2 = 0, y3 = 0, z3 = 0, y4 = 0, z4 = 0, t0 = 0, t1 = 0;
            y0 = H[x + 320 >> 2] | 0;
            y1 = H[x + 324 >> 2] | 0;
            y2 = H[x + 328 >> 2] | 0;
            y3 = H[x + 332 >> 2] | 0;
            y4 = H[x + 336 >> 2] | 0;
            for (i = 0; (i | 0) < (k | 0); i = i + 64 | 0) {
                z0 = y0;
                z1 = y1;
                z2 = y2;
                z3 = y3;
                z4 = y4;
                for (j = 0; (j | 0) < 64; j = j + 4 | 0) {
                    t1 = H[i + j >> 2] | 0;
                    t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | ~y1 & y3) | 0) + ((t1 + y4 | 0) + 1518500249 | 0) | 0;
                    y4 = y3;
                    y3 = y2;
                    y2 = y1 << 30 | y1 >>> 2;
                    y1 = y0;
                    y0 = t0;
                    H[k + j >> 2] = t1;
                }
                for (j = k + 64 | 0; (j | 0) < (k + 80 | 0); j = j + 4 | 0) {
                    t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
                    t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | ~y1 & y3) | 0) + ((t1 + y4 | 0) + 1518500249 | 0) | 0;
                    y4 = y3;
                    y3 = y2;
                    y2 = y1 << 30 | y1 >>> 2;
                    y1 = y0;
                    y0 = t0;
                    H[j >> 2] = t1;
                }
                for (j = k + 80 | 0; (j | 0) < (k + 160 | 0); j = j + 4 | 0) {
                    t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
                    t0 = ((y0 << 5 | y0 >>> 27) + (y1 ^ y2 ^ y3) | 0) + ((t1 + y4 | 0) + 1859775393 | 0) | 0;
                    y4 = y3;
                    y3 = y2;
                    y2 = y1 << 30 | y1 >>> 2;
                    y1 = y0;
                    y0 = t0;
                    H[j >> 2] = t1;
                }
                for (j = k + 160 | 0; (j | 0) < (k + 240 | 0); j = j + 4 | 0) {
                    t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
                    t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | y1 & y3 | y2 & y3) | 0) + ((t1 + y4 | 0) - 1894007588 | 0) | 0;
                    y4 = y3;
                    y3 = y2;
                    y2 = y1 << 30 | y1 >>> 2;
                    y1 = y0;
                    y0 = t0;
                    H[j >> 2] = t1;
                }
                for (j = k + 240 | 0; (j | 0) < (k + 320 | 0); j = j + 4 | 0) {
                    t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
                    t0 = ((y0 << 5 | y0 >>> 27) + (y1 ^ y2 ^ y3) | 0) + ((t1 + y4 | 0) - 899497514 | 0) | 0;
                    y4 = y3;
                    y3 = y2;
                    y2 = y1 << 30 | y1 >>> 2;
                    y1 = y0;
                    y0 = t0;
                    H[j >> 2] = t1;
                }
                y0 = y0 + z0 | 0;
                y1 = y1 + z1 | 0;
                y2 = y2 + z2 | 0;
                y3 = y3 + z3 | 0;
                y4 = y4 + z4 | 0;
            }
            H[x + 320 >> 2] = y0;
            H[x + 324 >> 2] = y1;
            H[x + 328 >> 2] = y2;
            H[x + 332 >> 2] = y3;
            H[x + 336 >> 2] = y4;
        }
        return { hash: hash };
    };
    if (// If we'e running in Node.JS, export a module.
        typeof module !== 'undefined') {
        module.exports = Rusha;
    } else if (// If we're running in a DOM context, export
        // the Rusha object to toplevel.
        typeof window !== 'undefined') {
        window.Rusha = Rusha;
    }
    if (// If we're running in a webworker, accept
        // messages containing a jobid and a buffer
        // or blob object, and return the hash result.
        typeof FileReaderSync !== 'undefined') {
        var reader = new FileReaderSync();
        var hashData = function hash(hasher, data, cb) {
            try {
                return cb(null, hasher.digest(data));
            } catch (e) {
                return cb(e);
            }
        };
        var hashFile = function hashArrayBuffer(hasher, readTotal, blockSize, file, cb) {
            var reader$2 = new self.FileReader();
            reader$2.onloadend = function onloadend() {
                var buffer = reader$2.result;
                readTotal += reader$2.result.byteLength;
                try {
                    hasher.append(buffer);
                } catch (e) {
                    cb(e);
                    return;
                }
                if (readTotal < file.size) {
                    hashFile(hasher, readTotal, blockSize, file, cb);
                } else {
                    cb(null, hasher.end());
                }
            };
            reader$2.readAsArrayBuffer(file.slice(readTotal, readTotal + blockSize));
        };
        self.onmessage = function onMessage(event) {
            var data = event.data.data, file = event.data.file, id = event.data.id;
            if (typeof id === 'undefined')
                return;
            if (!file && !data)
                return;
            var blockSize = event.data.blockSize || 4 * 1024 * 1024;
            var hasher = new Rusha(blockSize);
            hasher.resetState();
            var done = function done$2(err, hash) {
                if (!err) {
                    self.postMessage({
                        id: id,
                        hash: hash
                    });
                } else {
                    self.postMessage({
                        id: id,
                        error: err.name
                    });
                }
            };
            if (data)
                hashData(hasher, data, done);
            if (file)
                hashFile(hasher, 0, blockSize, file, done);
        };
    }
}());
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],48:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":3}],49:[function(require,module,exports){
(function (Buffer){
module.exports = function (stream, cb) {
  var chunks = []
  stream.on('data', function (chunk) {
    chunks.push(chunk)
  })
  stream.once('end', function () {
    if (cb) cb(null, Buffer.concat(chunks))
    cb = null
  })
  stream.once('error', function (err) {
    if (cb) cb(err)
    cb = null
  })
}

}).call(this,require("buffer").Buffer)
},{"buffer":3}],50:[function(require,module,exports){
(function (Buffer){
module.exports = simpleGet

var concat = require('simple-concat')
var http = require('http')
var https = require('https')
var once = require('once')
var querystring = require('querystring')
var decompressResponse = require('decompress-response') // excluded from browser build
var url = require('url')

function simpleGet (opts, cb) {
  opts = typeof opts === 'string' ? {url: opts} : Object.assign({}, opts)
  opts.headers = Object.assign({}, opts.headers)
  cb = once(cb)

  if (opts.url) parseOptsUrl(opts)
  if (opts.maxRedirects == null) opts.maxRedirects = 10

  var body
  if (opts.form) body = typeof opts.form === 'string' ? opts.form : querystring.stringify(opts.form)
  if (opts.body) body = opts.json && !isStream(opts.body) ? JSON.stringify(opts.body) : opts.body

  if (opts.json) opts.headers.accept = 'application/json'
  if (opts.json && body) opts.headers['content-type'] = 'application/json'
  if (opts.form) opts.headers['content-type'] = 'application/x-www-form-urlencoded'
  if (body && !isStream(body)) opts.headers['content-length'] = Buffer.byteLength(body)
  delete opts.body
  delete opts.form

  if (body && !opts.method) opts.method = 'POST'
  if (opts.method) opts.method = opts.method.toUpperCase()

  // Request gzip/deflate
  var customAcceptEncoding = Object.keys(opts.headers).some(function (h) {
    return h.toLowerCase() === 'accept-encoding'
  })
  if (!customAcceptEncoding) opts.headers['accept-encoding'] = 'gzip, deflate'

  // Support http/https urls
  var protocol = opts.protocol === 'https:' ? https : http
  var req = protocol.request(opts, function (res) {
    // Follow 3xx redirects
    if (res.statusCode >= 300 && res.statusCode < 400 && 'location' in res.headers) {
      opts.url = res.headers.location
      res.resume() // Discard response

      if (opts.maxRedirects > 0) {
        opts.maxRedirects -= 1
        simpleGet(opts, cb)
      } else {
        cb(new Error('too many redirects'))
      }
      return
    }

    var tryUnzip = typeof decompressResponse === 'function' && opts.method !== 'HEAD'
    cb(null, tryUnzip ? decompressResponse(res) : res)
  })
  req.on('timeout', function () {
    req.abort()
    cb(new Error('Request timed out'))
  })
  req.on('error', cb)

  if (body && isStream(body)) body.on('error', cb).pipe(req)
  else req.end(body)

  return req
}

simpleGet.concat = function (opts, cb) {
  return simpleGet(opts, function (err, res) {
    if (err) return cb(err)
    concat(res, function (err, data) {
      if (err) return cb(err)
      if (opts.json) {
        try {
          data = JSON.parse(data.toString())
        } catch (err) {
          return cb(err, res, data)
        }
      }
      cb(null, res, data)
    })
  })
}

;['get', 'post', 'put', 'patch', 'head', 'delete'].forEach(function (method) {
  simpleGet[method] = function (opts, cb) {
    if (typeof opts === 'string') opts = {url: opts}
    opts.method = method.toUpperCase()
    return simpleGet(opts, cb)
  }
})

function parseOptsUrl (opts) {
  var loc = url.parse(opts.url)
  if (loc.hostname) opts.hostname = loc.hostname
  if (loc.port) opts.port = loc.port
  if (loc.protocol) opts.protocol = loc.protocol
  if (loc.auth) opts.auth = loc.auth
  opts.path = loc.path
  delete opts.url
}

function isStream (obj) { return typeof obj.pipe === 'function' }

}).call(this,require("buffer").Buffer)
},{"buffer":3,"decompress-response":2,"http":28,"https":7,"once":44,"querystring":15,"simple-concat":49,"url":35}],51:[function(require,module,exports){
var Rusha = require('rusha')

var rusha = new Rusha
var scope = typeof window !== 'undefined' ? window : self
var crypto = scope.crypto || scope.msCrypto || {}
var subtle = crypto.subtle || crypto.webkitSubtle

function sha1sync (buf) {
  return rusha.digest(buf)
}

// Browsers throw if they lack support for an algorithm.
// Promise will be rejected on non-secure origins. (http://goo.gl/lq4gCo)
try {
  subtle.digest({ name: 'sha-1' }, new Uint8Array).catch(function () {
    subtle = false
  })
} catch (err) { subtle = false }

function sha1 (buf, cb) {
  if (!subtle) {
    // Use Rusha
    setTimeout(cb, 0, sha1sync(buf))
    return
  }

  if (typeof buf === 'string') {
    buf = uint8array(buf)
  }

  subtle.digest({ name: 'sha-1' }, buf)
    .then(function succeed (result) {
      cb(hex(new Uint8Array(result)))
    },
    function fail (error) {
      cb(sha1sync(buf))
    })
}

function uint8array (s) {
  var l = s.length
  var array = new Uint8Array(l)
  for (var i = 0; i < l; i++) {
    array[i] = s.charCodeAt(i)
  }
  return array
}

function hex (buf) {
  var l = buf.length
  var chars = []
  for (var i = 0; i < l; i++) {
    var bite = buf[i]
    chars.push((bite >>> 4).toString(16))
    chars.push((bite & 0x0f).toString(16))
  }
  return chars.join('')
}

module.exports = sha1
module.exports.sync = sha1sync

},{"rusha":47}],52:[function(require,module,exports){
/*                                                                              
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in      
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
*/

var base32 = require('./thirty-two');

exports.encode = base32.encode;
exports.decode = base32.decode;

},{"./thirty-two":53}],53:[function(require,module,exports){
(function (Buffer){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
'use strict';

var charTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
var byteTable = [
    0xff, 0xff, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
    0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
    0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff
];

function quintetCount(buff) {
    var quintets = Math.floor(buff.length / 5);
    return buff.length % 5 === 0 ? quintets: quintets + 1;
}

exports.encode = function(plain) {
    if(!Buffer.isBuffer(plain)){
    	plain = new Buffer(plain);
    }
    var i = 0;
    var j = 0;
    var shiftIndex = 0;
    var digit = 0;
    var encoded = new Buffer(quintetCount(plain) * 8);

    /* byte by byte isn't as pretty as quintet by quintet but tests a bit
        faster. will have to revisit. */
    while(i < plain.length) {
        var current = plain[i];

        if(shiftIndex > 3) {
            digit = current & (0xff >> shiftIndex);
            shiftIndex = (shiftIndex + 5) % 8;
            digit = (digit << shiftIndex) | ((i + 1 < plain.length) ?
                plain[i + 1] : 0) >> (8 - shiftIndex);
            i++;
        } else {
            digit = (current >> (8 - (shiftIndex + 5))) & 0x1f;
            shiftIndex = (shiftIndex + 5) % 8;
            if(shiftIndex === 0) i++;
        }

        encoded[j] = charTable.charCodeAt(digit);
        j++;
    }

    for(i = j; i < encoded.length; i++) {
        encoded[i] = 0x3d; //'='.charCodeAt(0)
    }

    return encoded;
};

exports.decode = function(encoded) {
    var shiftIndex = 0;
    var plainDigit = 0;
    var plainChar;
    var plainPos = 0;
    if(!Buffer.isBuffer(encoded)){
    	encoded = new Buffer(encoded);
    }
    var decoded = new Buffer(Math.ceil(encoded.length * 5 / 8));

    /* byte by byte isn't as pretty as octet by octet but tests a bit
        faster. will have to revisit. */
    for(var i = 0; i < encoded.length; i++) {
    	if(encoded[i] === 0x3d){ //'='
    		break;
    	}

        var encodedByte = encoded[i] - 0x30;

        if(encodedByte < byteTable.length) {
            plainDigit = byteTable[encodedByte];

            if(shiftIndex <= 3) {
                shiftIndex = (shiftIndex + 5) % 8;

                if(shiftIndex === 0) {
                    plainChar |= plainDigit;
                    decoded[plainPos] = plainChar;
                    plainPos++;
                    plainChar = 0;
                } else {
                    plainChar |= 0xff & (plainDigit << (8 - shiftIndex));
                }
            } else {
                shiftIndex = (shiftIndex + 5) % 8;
                plainChar |= 0xff & (plainDigit >>> shiftIndex);
                decoded[plainPos] = plainChar;
                plainPos++;

                plainChar = 0xff & (plainDigit << (8 - shiftIndex));
            }
        } else {
        	throw new Error('Invalid input - it is not base32 encoded string');
        }
    }

    return decoded.slice(0, plainPos);
};

}).call(this,require("buffer").Buffer)
},{"buffer":3}],54:[function(require,module,exports){
"use strict"

function unique_pred(list, compare) {
  var ptr = 1
    , len = list.length
    , a=list[0], b=list[0]
  for(var i=1; i<len; ++i) {
    b = a
    a = list[i]
    if(compare(a, b)) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique_eq(list) {
  var ptr = 1
    , len = list.length
    , a=list[0], b = list[0]
  for(var i=1; i<len; ++i, b=a) {
    b = a
    a = list[i]
    if(a !== b) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique(list, compare, sorted) {
  if(list.length === 0) {
    return list
  }
  if(compare) {
    if(!sorted) {
      list.sort(compare)
    }
    return unique_pred(list, compare)
  }
  if(!sorted) {
    list.sort()
  }
  return unique_eq(list)
}

module.exports = unique

},{}],55:[function(require,module,exports){
// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}

},{}],56:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"dup":37}]},{},[38]);
