true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

const zeroFill = n => {
    return ('0' + n).slice(-2);
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getOrdinal(n) {
    let ord = ["st", "nd", "rd"];
    let exceptions = [11, 12, 13];
    let nth = ord[(n % 10) - 1] === undefined || exceptions.includes(n % 100) ? "th" : ord[(n % 10) - 1];
    return n + nth
}

function updateDate()
{
    const now = new Date();
    const currentDayOfWeek = daysOfWeek[now.getDay()];
    const month = now.toLocaleString('default', { month: 'long' });
    document.getElementById('date').innerHTML = currentDayOfWeek + ' ' + ' ' + getOrdinal(now.getDay()) + ' ' + month + ' ' + now.getFullYear();
}

function updateTime()
{
    // Creates interval
    // Get current time
    const now = new Date();

    // Format date as in mm/dd/aaaa hh:ii:ss
    const dateTime = zeroFill(now.getHours()) + ':' + zeroFill(now.getMinutes()) + ':' + zeroFill(now.getSeconds());

    // Display the date and time on the screen using div#date-time
    document.getElementById('time').innerHTML = dateTime;
}

setInterval(updateDate, 1000);
setInterval(updateTime, 1000);

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var lib = {};

const SIZEOF_SHORT = 2;
const SIZEOF_INT = 4;
const FILE_IDENTIFIER_LENGTH = 4;
const SIZE_PREFIX_LENGTH = 4;

const int32 = new Int32Array(2);
const float32 = new Float32Array(int32.buffer);
const float64 = new Float64Array(int32.buffer);
const isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;

var Encoding;
(function (Encoding) {
    Encoding[Encoding["UTF8_BYTES"] = 1] = "UTF8_BYTES";
    Encoding[Encoding["UTF16_STRING"] = 2] = "UTF16_STRING";
})(Encoding || (Encoding = {}));

class ByteBuffer {
    /**
     * Create a new ByteBuffer with a given array of bytes (`Uint8Array`)
     */
    constructor(bytes_) {
        this.bytes_ = bytes_;
        this.position_ = 0;
        this.text_decoder_ = new TextDecoder();
    }
    /**
     * Create and allocate a new ByteBuffer with a given size.
     */
    static allocate(byte_size) {
        return new ByteBuffer(new Uint8Array(byte_size));
    }
    clear() {
        this.position_ = 0;
    }
    /**
     * Get the underlying `Uint8Array`.
     */
    bytes() {
        return this.bytes_;
    }
    /**
     * Get the buffer's position.
     */
    position() {
        return this.position_;
    }
    /**
     * Set the buffer's position.
     */
    setPosition(position) {
        this.position_ = position;
    }
    /**
     * Get the buffer's capacity.
     */
    capacity() {
        return this.bytes_.length;
    }
    readInt8(offset) {
        return this.readUint8(offset) << 24 >> 24;
    }
    readUint8(offset) {
        return this.bytes_[offset];
    }
    readInt16(offset) {
        return this.readUint16(offset) << 16 >> 16;
    }
    readUint16(offset) {
        return this.bytes_[offset] | this.bytes_[offset + 1] << 8;
    }
    readInt32(offset) {
        return this.bytes_[offset] | this.bytes_[offset + 1] << 8 | this.bytes_[offset + 2] << 16 | this.bytes_[offset + 3] << 24;
    }
    readUint32(offset) {
        return this.readInt32(offset) >>> 0;
    }
    readInt64(offset) {
        return BigInt.asIntN(64, BigInt(this.readUint32(offset)) + (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
    readUint64(offset) {
        return BigInt.asUintN(64, BigInt(this.readUint32(offset)) + (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
    }
    readFloat32(offset) {
        int32[0] = this.readInt32(offset);
        return float32[0];
    }
    readFloat64(offset) {
        int32[isLittleEndian ? 0 : 1] = this.readInt32(offset);
        int32[isLittleEndian ? 1 : 0] = this.readInt32(offset + 4);
        return float64[0];
    }
    writeInt8(offset, value) {
        this.bytes_[offset] = value;
    }
    writeUint8(offset, value) {
        this.bytes_[offset] = value;
    }
    writeInt16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
    }
    writeUint16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
    }
    writeInt32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
    }
    writeUint32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
    }
    writeInt64(offset, value) {
        this.writeInt32(offset, Number(BigInt.asIntN(32, value)));
        this.writeInt32(offset + 4, Number(BigInt.asIntN(32, value >> BigInt(32))));
    }
    writeUint64(offset, value) {
        this.writeUint32(offset, Number(BigInt.asUintN(32, value)));
        this.writeUint32(offset + 4, Number(BigInt.asUintN(32, value >> BigInt(32))));
    }
    writeFloat32(offset, value) {
        float32[0] = value;
        this.writeInt32(offset, int32[0]);
    }
    writeFloat64(offset, value) {
        float64[0] = value;
        this.writeInt32(offset, int32[isLittleEndian ? 0 : 1]);
        this.writeInt32(offset + 4, int32[isLittleEndian ? 1 : 0]);
    }
    /**
     * Return the file identifier.   Behavior is undefined for FlatBuffers whose
     * schema does not include a file_identifier (likely points at padding or the
     * start of a the root vtable).
     */
    getBufferIdentifier() {
        if (this.bytes_.length < this.position_ + SIZEOF_INT +
            FILE_IDENTIFIER_LENGTH) {
            throw new Error('FlatBuffers: ByteBuffer is too short to contain an identifier.');
        }
        let result = "";
        for (let i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
            result += String.fromCharCode(this.readInt8(this.position_ + SIZEOF_INT + i));
        }
        return result;
    }
    /**
     * Look up a field in the vtable, return an offset into the object, or 0 if the
     * field is not present.
     */
    __offset(bb_pos, vtable_offset) {
        const vtable = bb_pos - this.readInt32(bb_pos);
        return vtable_offset < this.readInt16(vtable) ? this.readInt16(vtable + vtable_offset) : 0;
    }
    /**
     * Initialize any Table-derived type to point to the union at the given offset.
     */
    __union(t, offset) {
        t.bb_pos = offset + this.readInt32(offset);
        t.bb = this;
        return t;
    }
    /**
     * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
     * This allocates a new string and converts to wide chars upon each access.
     *
     * To avoid the conversion to string, pass Encoding.UTF8_BYTES as the
     * "optionalEncoding" argument. This is useful for avoiding conversion when
     * the data will just be packaged back up in another FlatBuffer later on.
     *
     * @param offset
     * @param opt_encoding Defaults to UTF16_STRING
     */
    __string(offset, opt_encoding) {
        offset += this.readInt32(offset);
        const length = this.readInt32(offset);
        offset += SIZEOF_INT;
        const utf8bytes = this.bytes_.subarray(offset, offset + length);
        if (opt_encoding === Encoding.UTF8_BYTES)
            return utf8bytes;
        else
            return this.text_decoder_.decode(utf8bytes);
    }
    /**
     * Handle unions that can contain string as its member, if a Table-derived type then initialize it,
     * if a string then return a new one
     *
     * WARNING: strings are immutable in JS so we can't change the string that the user gave us, this
     * makes the behaviour of __union_with_string different compared to __union
     */
    __union_with_string(o, offset) {
        if (typeof o === 'string') {
            return this.__string(offset);
        }
        return this.__union(o, offset);
    }
    /**
     * Retrieve the relative offset stored at "offset"
     */
    __indirect(offset) {
        return offset + this.readInt32(offset);
    }
    /**
     * Get the start of data of a vector whose offset is stored at "offset" in this object.
     */
    __vector(offset) {
        return offset + this.readInt32(offset) + SIZEOF_INT; // data starts after the length
    }
    /**
     * Get the length of a vector whose offset is stored at "offset" in this object.
     */
    __vector_len(offset) {
        return this.readInt32(offset + this.readInt32(offset));
    }
    __has_identifier(ident) {
        if (ident.length != FILE_IDENTIFIER_LENGTH) {
            throw new Error('FlatBuffers: file identifier must be length ' +
                FILE_IDENTIFIER_LENGTH);
        }
        for (let i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
            if (ident.charCodeAt(i) != this.readInt8(this.position() + SIZEOF_INT + i)) {
                return false;
            }
        }
        return true;
    }
    /**
     * A helper function for generating list for obj api
     */
    createScalarList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
            const val = listAccessor(i);
            if (val !== null) {
                ret.push(val);
            }
        }
        return ret;
    }
    /**
     * A helper function for generating list for obj api
     * @param listAccessor function that accepts an index and return data at that index
     * @param listLength listLength
     * @param res result list
     */
    createObjList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
            const val = listAccessor(i);
            if (val !== null) {
                ret.push(val.unpack());
            }
        }
        return ret;
    }
}

class Builder {
    /**
     * Create a FlatBufferBuilder.
     */
    constructor(opt_initial_size) {
        /** Minimum alignment encountered so far. */
        this.minalign = 1;
        /** The vtable for the current table. */
        this.vtable = null;
        /** The amount of fields we're actually using. */
        this.vtable_in_use = 0;
        /** Whether we are currently serializing a table. */
        this.isNested = false;
        /** Starting offset of the current struct/table. */
        this.object_start = 0;
        /** List of offsets of all vtables. */
        this.vtables = [];
        /** For the current vector being built. */
        this.vector_num_elems = 0;
        /** False omits default values from the serialized data */
        this.force_defaults = false;
        this.string_maps = null;
        this.text_encoder = new TextEncoder();
        let initial_size;
        if (!opt_initial_size) {
            initial_size = 1024;
        }
        else {
            initial_size = opt_initial_size;
        }
        /**
         * @type {ByteBuffer}
         * @private
         */
        this.bb = ByteBuffer.allocate(initial_size);
        this.space = initial_size;
    }
    clear() {
        this.bb.clear();
        this.space = this.bb.capacity();
        this.minalign = 1;
        this.vtable = null;
        this.vtable_in_use = 0;
        this.isNested = false;
        this.object_start = 0;
        this.vtables = [];
        this.vector_num_elems = 0;
        this.force_defaults = false;
        this.string_maps = null;
    }
    /**
     * In order to save space, fields that are set to their default value
     * don't get serialized into the buffer. Forcing defaults provides a
     * way to manually disable this optimization.
     *
     * @param forceDefaults true always serializes default values
     */
    forceDefaults(forceDefaults) {
        this.force_defaults = forceDefaults;
    }
    /**
     * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
     * called finish(). The actual data starts at the ByteBuffer's current position,
     * not necessarily at 0.
     */
    dataBuffer() {
        return this.bb;
    }
    /**
     * Get the bytes representing the FlatBuffer. Only call this after you've
     * called finish().
     */
    asUint8Array() {
        return this.bb.bytes().subarray(this.bb.position(), this.bb.position() + this.offset());
    }
    /**
     * Prepare to write an element of `size` after `additional_bytes` have been
     * written, e.g. if you write a string, you need to align such the int length
     * field is aligned to 4 bytes, and the string data follows it directly. If all
     * you need to do is alignment, `additional_bytes` will be 0.
     *
     * @param size This is the of the new element to write
     * @param additional_bytes The padding size
     */
    prep(size, additional_bytes) {
        // Track the biggest thing we've ever aligned to.
        if (size > this.minalign) {
            this.minalign = size;
        }
        // Find the amount of alignment needed such that `size` is properly
        // aligned after `additional_bytes`
        const align_size = ((~(this.bb.capacity() - this.space + additional_bytes)) + 1) & (size - 1);
        // Reallocate the buffer if needed.
        while (this.space < align_size + size + additional_bytes) {
            const old_buf_size = this.bb.capacity();
            this.bb = Builder.growByteBuffer(this.bb);
            this.space += this.bb.capacity() - old_buf_size;
        }
        this.pad(align_size);
    }
    pad(byte_size) {
        for (let i = 0; i < byte_size; i++) {
            this.bb.writeInt8(--this.space, 0);
        }
    }
    writeInt8(value) {
        this.bb.writeInt8(this.space -= 1, value);
    }
    writeInt16(value) {
        this.bb.writeInt16(this.space -= 2, value);
    }
    writeInt32(value) {
        this.bb.writeInt32(this.space -= 4, value);
    }
    writeInt64(value) {
        this.bb.writeInt64(this.space -= 8, value);
    }
    writeFloat32(value) {
        this.bb.writeFloat32(this.space -= 4, value);
    }
    writeFloat64(value) {
        this.bb.writeFloat64(this.space -= 8, value);
    }
    /**
     * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int8` to add the buffer.
     */
    addInt8(value) {
        this.prep(1, 0);
        this.writeInt8(value);
    }
    /**
     * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int16` to add the buffer.
     */
    addInt16(value) {
        this.prep(2, 0);
        this.writeInt16(value);
    }
    /**
     * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int32` to add the buffer.
     */
    addInt32(value) {
        this.prep(4, 0);
        this.writeInt32(value);
    }
    /**
     * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int64` to add the buffer.
     */
    addInt64(value) {
        this.prep(8, 0);
        this.writeInt64(value);
    }
    /**
     * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float32` to add the buffer.
     */
    addFloat32(value) {
        this.prep(4, 0);
        this.writeFloat32(value);
    }
    /**
     * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float64` to add the buffer.
     */
    addFloat64(value) {
        this.prep(8, 0);
        this.writeFloat64(value);
    }
    addFieldInt8(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt8(value);
            this.slot(voffset);
        }
    }
    addFieldInt16(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt16(value);
            this.slot(voffset);
        }
    }
    addFieldInt32(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addInt32(value);
            this.slot(voffset);
        }
    }
    addFieldInt64(voffset, value, defaultValue) {
        if (this.force_defaults || value !== defaultValue) {
            this.addInt64(value);
            this.slot(voffset);
        }
    }
    addFieldFloat32(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addFloat32(value);
            this.slot(voffset);
        }
    }
    addFieldFloat64(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addFloat64(value);
            this.slot(voffset);
        }
    }
    addFieldOffset(voffset, value, defaultValue) {
        if (this.force_defaults || value != defaultValue) {
            this.addOffset(value);
            this.slot(voffset);
        }
    }
    /**
     * Structs are stored inline, so nothing additional is being added. `d` is always 0.
     */
    addFieldStruct(voffset, value, defaultValue) {
        if (value != defaultValue) {
            this.nested(value);
            this.slot(voffset);
        }
    }
    /**
     * Structures are always stored inline, they need to be created right
     * where they're used.  You'll get this assertion failure if you
     * created it elsewhere.
     */
    nested(obj) {
        if (obj != this.offset()) {
            throw new TypeError('FlatBuffers: struct must be serialized inline.');
        }
    }
    /**
     * Should not be creating any other object, string or vector
     * while an object is being constructed
     */
    notNested() {
        if (this.isNested) {
            throw new TypeError('FlatBuffers: object serialization must not be nested.');
        }
    }
    /**
     * Set the current vtable at `voffset` to the current location in the buffer.
     */
    slot(voffset) {
        if (this.vtable !== null)
            this.vtable[voffset] = this.offset();
    }
    /**
     * @returns Offset relative to the end of the buffer.
     */
    offset() {
        return this.bb.capacity() - this.space;
    }
    /**
     * Doubles the size of the backing ByteBuffer and copies the old data towards
     * the end of the new buffer (since we build the buffer backwards).
     *
     * @param bb The current buffer with the existing data
     * @returns A new byte buffer with the old data copied
     * to it. The data is located at the end of the buffer.
     *
     * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
     * it a uint8Array we need to suppress the type check:
     * @suppress {checkTypes}
     */
    static growByteBuffer(bb) {
        const old_buf_size = bb.capacity();
        // Ensure we don't grow beyond what fits in an int.
        if (old_buf_size & 0xC0000000) {
            throw new Error('FlatBuffers: cannot grow buffer beyond 2 gigabytes.');
        }
        const new_buf_size = old_buf_size << 1;
        const nbb = ByteBuffer.allocate(new_buf_size);
        nbb.setPosition(new_buf_size - old_buf_size);
        nbb.bytes().set(bb.bytes(), new_buf_size - old_buf_size);
        return nbb;
    }
    /**
     * Adds on offset, relative to where it will be written.
     *
     * @param offset The offset to add.
     */
    addOffset(offset) {
        this.prep(SIZEOF_INT, 0); // Ensure alignment is already done.
        this.writeInt32(this.offset() - offset + SIZEOF_INT);
    }
    /**
     * Start encoding a new object in the buffer.  Users will not usually need to
     * call this directly. The FlatBuffers compiler will generate helper methods
     * that call this method internally.
     */
    startObject(numfields) {
        this.notNested();
        if (this.vtable == null) {
            this.vtable = [];
        }
        this.vtable_in_use = numfields;
        for (let i = 0; i < numfields; i++) {
            this.vtable[i] = 0; // This will push additional elements as needed
        }
        this.isNested = true;
        this.object_start = this.offset();
    }
    /**
     * Finish off writing the object that is under construction.
     *
     * @returns The offset to the object inside `dataBuffer`
     */
    endObject() {
        if (this.vtable == null || !this.isNested) {
            throw new Error('FlatBuffers: endObject called without startObject');
        }
        this.addInt32(0);
        const vtableloc = this.offset();
        // Trim trailing zeroes.
        let i = this.vtable_in_use - 1;
        // eslint-disable-next-line no-empty
        for (; i >= 0 && this.vtable[i] == 0; i--) { }
        const trimmed_size = i + 1;
        // Write out the current vtable.
        for (; i >= 0; i--) {
            // Offset relative to the start of the table.
            this.addInt16(this.vtable[i] != 0 ? vtableloc - this.vtable[i] : 0);
        }
        const standard_fields = 2; // The fields below:
        this.addInt16(vtableloc - this.object_start);
        const len = (trimmed_size + standard_fields) * SIZEOF_SHORT;
        this.addInt16(len);
        // Search for an existing vtable that matches the current one.
        let existing_vtable = 0;
        const vt1 = this.space;
        outer_loop: for (i = 0; i < this.vtables.length; i++) {
            const vt2 = this.bb.capacity() - this.vtables[i];
            if (len == this.bb.readInt16(vt2)) {
                for (let j = SIZEOF_SHORT; j < len; j += SIZEOF_SHORT) {
                    if (this.bb.readInt16(vt1 + j) != this.bb.readInt16(vt2 + j)) {
                        continue outer_loop;
                    }
                }
                existing_vtable = this.vtables[i];
                break;
            }
        }
        if (existing_vtable) {
            // Found a match:
            // Remove the current vtable.
            this.space = this.bb.capacity() - vtableloc;
            // Point table to existing vtable.
            this.bb.writeInt32(this.space, existing_vtable - vtableloc);
        }
        else {
            // No match:
            // Add the location of the current vtable to the list of vtables.
            this.vtables.push(this.offset());
            // Point table to current vtable.
            this.bb.writeInt32(this.bb.capacity() - vtableloc, this.offset() - vtableloc);
        }
        this.isNested = false;
        return vtableloc;
    }
    /**
     * Finalize a buffer, poiting to the given `root_table`.
     */
    finish(root_table, opt_file_identifier, opt_size_prefix) {
        const size_prefix = opt_size_prefix ? SIZE_PREFIX_LENGTH : 0;
        if (opt_file_identifier) {
            const file_identifier = opt_file_identifier;
            this.prep(this.minalign, SIZEOF_INT +
                FILE_IDENTIFIER_LENGTH + size_prefix);
            if (file_identifier.length != FILE_IDENTIFIER_LENGTH) {
                throw new TypeError('FlatBuffers: file identifier must be length ' +
                    FILE_IDENTIFIER_LENGTH);
            }
            for (let i = FILE_IDENTIFIER_LENGTH - 1; i >= 0; i--) {
                this.writeInt8(file_identifier.charCodeAt(i));
            }
        }
        this.prep(this.minalign, SIZEOF_INT + size_prefix);
        this.addOffset(root_table);
        if (size_prefix) {
            this.addInt32(this.bb.capacity() - this.space);
        }
        this.bb.setPosition(this.space);
    }
    /**
     * Finalize a size prefixed buffer, pointing to the given `root_table`.
     */
    finishSizePrefixed(root_table, opt_file_identifier) {
        this.finish(root_table, opt_file_identifier, true);
    }
    /**
     * This checks a required field has been set in a given table that has
     * just been constructed.
     */
    requiredField(table, field) {
        const table_start = this.bb.capacity() - table;
        const vtable_start = table_start - this.bb.readInt32(table_start);
        const ok = field < this.bb.readInt16(vtable_start) &&
            this.bb.readInt16(vtable_start + field) != 0;
        // If this fails, the caller will show what field needs to be set.
        if (!ok) {
            throw new TypeError('FlatBuffers: field ' + field + ' must be set');
        }
    }
    /**
     * Start a new array/vector of objects.  Users usually will not call
     * this directly. The FlatBuffers compiler will create a start/end
     * method for vector types in generated code.
     *
     * @param elem_size The size of each element in the array
     * @param num_elems The number of elements in the array
     * @param alignment The alignment of the array
     */
    startVector(elem_size, num_elems, alignment) {
        this.notNested();
        this.vector_num_elems = num_elems;
        this.prep(SIZEOF_INT, elem_size * num_elems);
        this.prep(alignment, elem_size * num_elems); // Just in case alignment > int.
    }
    /**
     * Finish off the creation of an array and all its elements. The array must be
     * created with `startVector`.
     *
     * @returns The offset at which the newly created array
     * starts.
     */
    endVector() {
        this.writeInt32(this.vector_num_elems);
        return this.offset();
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If the string passed has
     * already been seen, we return the offset of the already written string
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
    createSharedString(s) {
        if (!s) {
            return 0;
        }
        if (!this.string_maps) {
            this.string_maps = new Map();
        }
        if (this.string_maps.has(s)) {
            return this.string_maps.get(s);
        }
        const offset = this.createString(s);
        this.string_maps.set(s, offset);
        return offset;
    }
    /**
     * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
     * instead of a string, it is assumed to contain valid UTF-8 encoded data.
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */
    createString(s) {
        if (s === null || s === undefined) {
            return 0;
        }
        let utf8;
        if (s instanceof Uint8Array) {
            utf8 = s;
        }
        else {
            utf8 = this.text_encoder.encode(s);
        }
        this.addInt8(0);
        this.startVector(1, utf8.length, 1);
        this.bb.setPosition(this.space -= utf8.length);
        this.bb.bytes().set(utf8, this.space);
        return this.endVector();
    }
    /**
     * Create a byte vector.
     *
     * @param v The bytes to add
     * @returns The offset in the buffer where the byte vector starts
     */
    createByteVector(v) {
        if (v === null || v === undefined) {
            return 0;
        }
        this.startVector(1, v.length, 1);
        this.bb.setPosition(this.space -= v.length);
        this.bb.bytes().set(v, this.space);
        return this.endVector();
    }
    /**
     * A helper function to pack an object
     *
     * @returns offset of obj
     */
    createObjectOffset(obj) {
        if (obj === null) {
            return 0;
        }
        if (typeof obj === 'string') {
            return this.createString(obj);
        }
        else {
            return obj.pack(this);
        }
    }
    /**
     * A helper function to pack a list of object
     *
     * @returns list of offsets of each non null object
     */
    createObjectOffsetList(list) {
        const ret = [];
        for (let i = 0; i < list.length; ++i) {
            const val = list[i];
            if (val !== null) {
                ret.push(this.createObjectOffset(val));
            }
            else {
                throw new TypeError('FlatBuffers: Argument for createObjectOffsetList cannot contain null.');
            }
        }
        return ret;
    }
    createStructOffsetList(list, startFunc) {
        startFunc(this, list.length);
        this.createObjectOffsetList(list.slice().reverse());
        return this.endVector();
    }
}

const flatbuffers = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Builder,
  ByteBuffer,
  get Encoding () { return Encoding; },
  FILE_IDENTIFIER_LENGTH,
  SIZEOF_INT,
  SIZEOF_SHORT,
  SIZE_PREFIX_LENGTH,
  float32,
  float64,
  int32,
  isLittleEndian
}, Symbol.toStringTag, { value: 'Module' }));

const require$$0 = /*@__PURE__*/getAugmentedNamespace(flatbuffers);

var weatherApiResponse = {};

var model = {};

var hasRequiredModel;

function requireModel () {
	if (hasRequiredModel) return model;
	hasRequiredModel = 1;
	// automatically generated by the FlatBuffers compiler, do not modify
	Object.defineProperty(model, "__esModule", { value: true });
	model.Model = undefined;
	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
	var Model;
	(function (Model) {
	    Model[Model["undefined"] = 0] = "undefined";
	    Model[Model["best_match"] = 1] = "best_match";
	    Model[Model["gfs_seamless"] = 2] = "gfs_seamless";
	    Model[Model["gfs_global"] = 3] = "gfs_global";
	    Model[Model["gfs_hrrr"] = 4] = "gfs_hrrr";
	    Model[Model["meteofrance_seamless"] = 5] = "meteofrance_seamless";
	    Model[Model["meteofrance_arpege_seamless"] = 6] = "meteofrance_arpege_seamless";
	    Model[Model["meteofrance_arpege_world"] = 7] = "meteofrance_arpege_world";
	    Model[Model["meteofrance_arpege_europe"] = 8] = "meteofrance_arpege_europe";
	    Model[Model["meteofrance_arome_seamless"] = 9] = "meteofrance_arome_seamless";
	    Model[Model["meteofrance_arome_france"] = 10] = "meteofrance_arome_france";
	    Model[Model["meteofrance_arome_france_hd"] = 11] = "meteofrance_arome_france_hd";
	    Model[Model["jma_seamless"] = 12] = "jma_seamless";
	    Model[Model["jma_msm"] = 13] = "jma_msm";
	    Model[Model["jms_gsm"] = 14] = "jms_gsm";
	    Model[Model["jma_gsm"] = 15] = "jma_gsm";
	    Model[Model["gem_seamless"] = 16] = "gem_seamless";
	    Model[Model["gem_global"] = 17] = "gem_global";
	    Model[Model["gem_regional"] = 18] = "gem_regional";
	    Model[Model["gem_hrdps_continental"] = 19] = "gem_hrdps_continental";
	    Model[Model["icon_seamless"] = 20] = "icon_seamless";
	    Model[Model["icon_global"] = 21] = "icon_global";
	    Model[Model["icon_eu"] = 22] = "icon_eu";
	    Model[Model["icon_d2"] = 23] = "icon_d2";
	    Model[Model["ecmwf_ifs04"] = 24] = "ecmwf_ifs04";
	    Model[Model["metno_nordic"] = 25] = "metno_nordic";
	    Model[Model["era5_seamless"] = 26] = "era5_seamless";
	    Model[Model["era5"] = 27] = "era5";
	    Model[Model["cerra"] = 28] = "cerra";
	    Model[Model["era5_land"] = 29] = "era5_land";
	    Model[Model["ecmwf_ifs"] = 30] = "ecmwf_ifs";
	    Model[Model["gwam"] = 31] = "gwam";
	    Model[Model["ewam"] = 32] = "ewam";
	    Model[Model["glofas_seamless_v3"] = 33] = "glofas_seamless_v3";
	    Model[Model["glofas_forecast_v3"] = 34] = "glofas_forecast_v3";
	    Model[Model["glofas_consolidated_v3"] = 35] = "glofas_consolidated_v3";
	    Model[Model["glofas_seamless_v4"] = 36] = "glofas_seamless_v4";
	    Model[Model["glofas_forecast_v4"] = 37] = "glofas_forecast_v4";
	    Model[Model["glofas_consolidated_v4"] = 38] = "glofas_consolidated_v4";
	    Model[Model["gfs025"] = 39] = "gfs025";
	    Model[Model["gfs05"] = 40] = "gfs05";
	    Model[Model["CMCC_CM2_VHR4"] = 41] = "CMCC_CM2_VHR4";
	    Model[Model["FGOALS_f3_H_highresSST"] = 42] = "FGOALS_f3_H_highresSST";
	    Model[Model["FGOALS_f3_H"] = 43] = "FGOALS_f3_H";
	    Model[Model["HiRAM_SIT_HR"] = 44] = "HiRAM_SIT_HR";
	    Model[Model["MRI_AGCM3_2_S"] = 45] = "MRI_AGCM3_2_S";
	    Model[Model["EC_Earth3P_HR"] = 46] = "EC_Earth3P_HR";
	    Model[Model["MPI_ESM1_2_XR"] = 47] = "MPI_ESM1_2_XR";
	    Model[Model["NICAM16_8S"] = 48] = "NICAM16_8S";
	    Model[Model["cams_europe"] = 49] = "cams_europe";
	    Model[Model["cams_global"] = 50] = "cams_global";
	    Model[Model["cfsv2"] = 51] = "cfsv2";
	    Model[Model["era5_ocean"] = 52] = "era5_ocean";
	    Model[Model["cma_grapes_global"] = 53] = "cma_grapes_global";
	    Model[Model["bom_access_global"] = 54] = "bom_access_global";
	    Model[Model["bom_access_global_ensemble"] = 55] = "bom_access_global_ensemble";
	    Model[Model["arpae_cosmo_seamless"] = 56] = "arpae_cosmo_seamless";
	    Model[Model["arpae_cosmo_2i"] = 57] = "arpae_cosmo_2i";
	    Model[Model["arpae_cosmo_2i_ruc"] = 58] = "arpae_cosmo_2i_ruc";
	    Model[Model["arpae_cosmo_5m"] = 59] = "arpae_cosmo_5m";
	    Model[Model["ecmwf_ifs025"] = 60] = "ecmwf_ifs025";
	    Model[Model["ecmwf_aifs025"] = 61] = "ecmwf_aifs025";
	    Model[Model["gfs013"] = 62] = "gfs013";
	    Model[Model["gfs_graphcast025"] = 63] = "gfs_graphcast025";
	    Model[Model["ecmwf_wam025"] = 64] = "ecmwf_wam025";
	    Model[Model["meteofrance_wave"] = 65] = "meteofrance_wave";
	    Model[Model["meteofrance_currents"] = 66] = "meteofrance_currents";
	    Model[Model["ecmwf_wam025_ensemble"] = 67] = "ecmwf_wam025_ensemble";
	    Model[Model["ncep_gfswave025"] = 68] = "ncep_gfswave025";
	    Model[Model["ncep_gefswave025"] = 69] = "ncep_gefswave025";
	    Model[Model["knmi_seamless"] = 70] = "knmi_seamless";
	    Model[Model["knmi_harmonie_arome_europe"] = 71] = "knmi_harmonie_arome_europe";
	    Model[Model["knmi_harmonie_arome_netherlands"] = 72] = "knmi_harmonie_arome_netherlands";
	    Model[Model["dmi_seamless"] = 73] = "dmi_seamless";
	    Model[Model["dmi_harmonie_arome_europe"] = 74] = "dmi_harmonie_arome_europe";
	    Model[Model["metno_seamless"] = 75] = "metno_seamless";
	    Model[Model["era5_ensemble"] = 76] = "era5_ensemble";
	    Model[Model["ecmwf_ifs_analysis"] = 77] = "ecmwf_ifs_analysis";
	    Model[Model["ecmwf_ifs_long_window"] = 78] = "ecmwf_ifs_long_window";
	    Model[Model["ecmwf_ifs_analysis_long_window"] = 79] = "ecmwf_ifs_analysis_long_window";
	    Model[Model["ukmo_global_deterministic_10km"] = 80] = "ukmo_global_deterministic_10km";
	    Model[Model["ukmo_uk_deterministic_2km"] = 81] = "ukmo_uk_deterministic_2km";
	    Model[Model["ukmo_seamless"] = 82] = "ukmo_seamless";
	    Model[Model["ncep_gfswave016"] = 83] = "ncep_gfswave016";
	    Model[Model["ncep_nbm_conus"] = 84] = "ncep_nbm_conus";
	})(Model || (model.Model = Model = {}));
	return model;
}

var variablesWithTime = {};

var variableWithValues = {};

var aggregation = {};

var hasRequiredAggregation;

function requireAggregation () {
	if (hasRequiredAggregation) return aggregation;
	hasRequiredAggregation = 1;
	// automatically generated by the FlatBuffers compiler, do not modify
	Object.defineProperty(aggregation, "__esModule", { value: true });
	aggregation.Aggregation = undefined;
	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
	var Aggregation;
	(function (Aggregation) {
	    Aggregation[Aggregation["none"] = 0] = "none";
	    Aggregation[Aggregation["minimum"] = 1] = "minimum";
	    Aggregation[Aggregation["maximum"] = 2] = "maximum";
	    Aggregation[Aggregation["mean"] = 3] = "mean";
	    Aggregation[Aggregation["p10"] = 4] = "p10";
	    Aggregation[Aggregation["p25"] = 5] = "p25";
	    Aggregation[Aggregation["median"] = 6] = "median";
	    Aggregation[Aggregation["p75"] = 7] = "p75";
	    Aggregation[Aggregation["p90"] = 8] = "p90";
	    Aggregation[Aggregation["dominant"] = 9] = "dominant";
	    Aggregation[Aggregation["sum"] = 10] = "sum";
	    Aggregation[Aggregation["spread"] = 11] = "spread";
	})(Aggregation || (aggregation.Aggregation = Aggregation = {}));
	return aggregation;
}

var unit = {};

var hasRequiredUnit;

function requireUnit () {
	if (hasRequiredUnit) return unit;
	hasRequiredUnit = 1;
	// automatically generated by the FlatBuffers compiler, do not modify
	Object.defineProperty(unit, "__esModule", { value: true });
	unit.Unit = undefined;
	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
	var Unit;
	(function (Unit) {
	    Unit[Unit["undefined"] = 0] = "undefined";
	    Unit[Unit["celsius"] = 1] = "celsius";
	    Unit[Unit["centimetre"] = 2] = "centimetre";
	    Unit[Unit["cubic_metre_per_cubic_metre"] = 3] = "cubic_metre_per_cubic_metre";
	    Unit[Unit["cubic_metre_per_second"] = 4] = "cubic_metre_per_second";
	    Unit[Unit["degree_direction"] = 5] = "degree_direction";
	    Unit[Unit["dimensionless_integer"] = 6] = "dimensionless_integer";
	    Unit[Unit["dimensionless"] = 7] = "dimensionless";
	    Unit[Unit["european_air_quality_index"] = 8] = "european_air_quality_index";
	    Unit[Unit["fahrenheit"] = 9] = "fahrenheit";
	    Unit[Unit["feet"] = 10] = "feet";
	    Unit[Unit["fraction"] = 11] = "fraction";
	    Unit[Unit["gdd_celsius"] = 12] = "gdd_celsius";
	    Unit[Unit["geopotential_metre"] = 13] = "geopotential_metre";
	    Unit[Unit["grains_per_cubic_metre"] = 14] = "grains_per_cubic_metre";
	    Unit[Unit["gram_per_kilogram"] = 15] = "gram_per_kilogram";
	    Unit[Unit["hectopascal"] = 16] = "hectopascal";
	    Unit[Unit["hours"] = 17] = "hours";
	    Unit[Unit["inch"] = 18] = "inch";
	    Unit[Unit["iso8601"] = 19] = "iso8601";
	    Unit[Unit["joule_per_kilogram"] = 20] = "joule_per_kilogram";
	    Unit[Unit["kelvin"] = 21] = "kelvin";
	    Unit[Unit["kilopascal"] = 22] = "kilopascal";
	    Unit[Unit["kilogram_per_square_metre"] = 23] = "kilogram_per_square_metre";
	    Unit[Unit["kilometres_per_hour"] = 24] = "kilometres_per_hour";
	    Unit[Unit["knots"] = 25] = "knots";
	    Unit[Unit["megajoule_per_square_metre"] = 26] = "megajoule_per_square_metre";
	    Unit[Unit["metre_per_second_not_unit_converted"] = 27] = "metre_per_second_not_unit_converted";
	    Unit[Unit["metre_per_second"] = 28] = "metre_per_second";
	    Unit[Unit["metre"] = 29] = "metre";
	    Unit[Unit["micrograms_per_cubic_metre"] = 30] = "micrograms_per_cubic_metre";
	    Unit[Unit["miles_per_hour"] = 31] = "miles_per_hour";
	    Unit[Unit["millimetre"] = 32] = "millimetre";
	    Unit[Unit["pascal"] = 33] = "pascal";
	    Unit[Unit["per_second"] = 34] = "per_second";
	    Unit[Unit["percentage"] = 35] = "percentage";
	    Unit[Unit["seconds"] = 36] = "seconds";
	    Unit[Unit["unix_time"] = 37] = "unix_time";
	    Unit[Unit["us_air_quality_index"] = 38] = "us_air_quality_index";
	    Unit[Unit["watt_per_square_metre"] = 39] = "watt_per_square_metre";
	    Unit[Unit["wmo_code"] = 40] = "wmo_code";
	    Unit[Unit["parts_per_million"] = 41] = "parts_per_million";
	})(Unit || (unit.Unit = Unit = {}));
	return unit;
}

var variable = {};

var hasRequiredVariable;

function requireVariable () {
	if (hasRequiredVariable) return variable;
	hasRequiredVariable = 1;
	// automatically generated by the FlatBuffers compiler, do not modify
	Object.defineProperty(variable, "__esModule", { value: true });
	variable.Variable = undefined;
	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
	var Variable;
	(function (Variable) {
	    Variable[Variable["undefined"] = 0] = "undefined";
	    Variable[Variable["apparent_temperature"] = 1] = "apparent_temperature";
	    Variable[Variable["cape"] = 2] = "cape";
	    Variable[Variable["cloud_cover"] = 3] = "cloud_cover";
	    Variable[Variable["cloud_cover_high"] = 4] = "cloud_cover_high";
	    Variable[Variable["cloud_cover_low"] = 5] = "cloud_cover_low";
	    Variable[Variable["cloud_cover_mid"] = 6] = "cloud_cover_mid";
	    Variable[Variable["daylight_duration"] = 7] = "daylight_duration";
	    Variable[Variable["dew_point"] = 8] = "dew_point";
	    Variable[Variable["diffuse_radiation"] = 9] = "diffuse_radiation";
	    Variable[Variable["diffuse_radiation_instant"] = 10] = "diffuse_radiation_instant";
	    Variable[Variable["direct_normal_irradiance"] = 11] = "direct_normal_irradiance";
	    Variable[Variable["direct_normal_irradiance_instant"] = 12] = "direct_normal_irradiance_instant";
	    Variable[Variable["direct_radiation"] = 13] = "direct_radiation";
	    Variable[Variable["direct_radiation_instant"] = 14] = "direct_radiation_instant";
	    Variable[Variable["et0_fao_evapotranspiration"] = 15] = "et0_fao_evapotranspiration";
	    Variable[Variable["evapotranspiration"] = 16] = "evapotranspiration";
	    Variable[Variable["freezing_level_height"] = 17] = "freezing_level_height";
	    Variable[Variable["growing_degree_days"] = 18] = "growing_degree_days";
	    Variable[Variable["is_day"] = 19] = "is_day";
	    Variable[Variable["latent_heat_flux"] = 20] = "latent_heat_flux";
	    Variable[Variable["leaf_wetness_probability"] = 21] = "leaf_wetness_probability";
	    Variable[Variable["lifted_index"] = 22] = "lifted_index";
	    Variable[Variable["lightning_potential"] = 23] = "lightning_potential";
	    Variable[Variable["precipitation"] = 24] = "precipitation";
	    Variable[Variable["precipitation_hours"] = 25] = "precipitation_hours";
	    Variable[Variable["precipitation_probability"] = 26] = "precipitation_probability";
	    Variable[Variable["pressure_msl"] = 27] = "pressure_msl";
	    Variable[Variable["rain"] = 28] = "rain";
	    Variable[Variable["relative_humidity"] = 29] = "relative_humidity";
	    Variable[Variable["runoff"] = 30] = "runoff";
	    Variable[Variable["sensible_heat_flux"] = 31] = "sensible_heat_flux";
	    Variable[Variable["shortwave_radiation"] = 32] = "shortwave_radiation";
	    Variable[Variable["shortwave_radiation_instant"] = 33] = "shortwave_radiation_instant";
	    Variable[Variable["showers"] = 34] = "showers";
	    Variable[Variable["snow_depth"] = 35] = "snow_depth";
	    Variable[Variable["snow_height"] = 36] = "snow_height";
	    Variable[Variable["snowfall"] = 37] = "snowfall";
	    Variable[Variable["snowfall_height"] = 38] = "snowfall_height";
	    Variable[Variable["snowfall_water_equivalent"] = 39] = "snowfall_water_equivalent";
	    Variable[Variable["sunrise"] = 40] = "sunrise";
	    Variable[Variable["sunset"] = 41] = "sunset";
	    Variable[Variable["soil_moisture"] = 42] = "soil_moisture";
	    Variable[Variable["soil_moisture_index"] = 43] = "soil_moisture_index";
	    Variable[Variable["soil_temperature"] = 44] = "soil_temperature";
	    Variable[Variable["surface_pressure"] = 45] = "surface_pressure";
	    Variable[Variable["surface_temperature"] = 46] = "surface_temperature";
	    Variable[Variable["temperature"] = 47] = "temperature";
	    Variable[Variable["terrestrial_radiation"] = 48] = "terrestrial_radiation";
	    Variable[Variable["terrestrial_radiation_instant"] = 49] = "terrestrial_radiation_instant";
	    Variable[Variable["total_column_integrated_water_vapour"] = 50] = "total_column_integrated_water_vapour";
	    Variable[Variable["updraft"] = 51] = "updraft";
	    Variable[Variable["uv_index"] = 52] = "uv_index";
	    Variable[Variable["uv_index_clear_sky"] = 53] = "uv_index_clear_sky";
	    Variable[Variable["vapour_pressure_deficit"] = 54] = "vapour_pressure_deficit";
	    Variable[Variable["visibility"] = 55] = "visibility";
	    Variable[Variable["weather_code"] = 56] = "weather_code";
	    Variable[Variable["wind_direction"] = 57] = "wind_direction";
	    Variable[Variable["wind_gusts"] = 58] = "wind_gusts";
	    Variable[Variable["wind_speed"] = 59] = "wind_speed";
	    Variable[Variable["vertical_velocity"] = 60] = "vertical_velocity";
	    Variable[Variable["geopotential_height"] = 61] = "geopotential_height";
	    Variable[Variable["wet_bulb_temperature"] = 62] = "wet_bulb_temperature";
	    Variable[Variable["river_discharge"] = 63] = "river_discharge";
	    Variable[Variable["wave_height"] = 64] = "wave_height";
	    Variable[Variable["wave_period"] = 65] = "wave_period";
	    Variable[Variable["wave_direction"] = 66] = "wave_direction";
	    Variable[Variable["wind_wave_height"] = 67] = "wind_wave_height";
	    Variable[Variable["wind_wave_period"] = 68] = "wind_wave_period";
	    Variable[Variable["wind_wave_peak_period"] = 69] = "wind_wave_peak_period";
	    Variable[Variable["wind_wave_direction"] = 70] = "wind_wave_direction";
	    Variable[Variable["swell_wave_height"] = 71] = "swell_wave_height";
	    Variable[Variable["swell_wave_period"] = 72] = "swell_wave_period";
	    Variable[Variable["swell_wave_peak_period"] = 73] = "swell_wave_peak_period";
	    Variable[Variable["swell_wave_direction"] = 74] = "swell_wave_direction";
	    Variable[Variable["pm10"] = 75] = "pm10";
	    Variable[Variable["pm2p5"] = 76] = "pm2p5";
	    Variable[Variable["dust"] = 77] = "dust";
	    Variable[Variable["aerosol_optical_depth"] = 78] = "aerosol_optical_depth";
	    Variable[Variable["carbon_monoxide"] = 79] = "carbon_monoxide";
	    Variable[Variable["nitrogen_dioxide"] = 80] = "nitrogen_dioxide";
	    Variable[Variable["ammonia"] = 81] = "ammonia";
	    Variable[Variable["ozone"] = 82] = "ozone";
	    Variable[Variable["sulphur_dioxide"] = 83] = "sulphur_dioxide";
	    Variable[Variable["alder_pollen"] = 84] = "alder_pollen";
	    Variable[Variable["birch_pollen"] = 85] = "birch_pollen";
	    Variable[Variable["grass_pollen"] = 86] = "grass_pollen";
	    Variable[Variable["mugwort_pollen"] = 87] = "mugwort_pollen";
	    Variable[Variable["olive_pollen"] = 88] = "olive_pollen";
	    Variable[Variable["ragweed_pollen"] = 89] = "ragweed_pollen";
	    Variable[Variable["european_aqi"] = 90] = "european_aqi";
	    Variable[Variable["european_aqi_pm2p5"] = 91] = "european_aqi_pm2p5";
	    Variable[Variable["european_aqi_pm10"] = 92] = "european_aqi_pm10";
	    Variable[Variable["european_aqi_nitrogen_dioxide"] = 93] = "european_aqi_nitrogen_dioxide";
	    Variable[Variable["european_aqi_ozone"] = 94] = "european_aqi_ozone";
	    Variable[Variable["european_aqi_sulphur_dioxide"] = 95] = "european_aqi_sulphur_dioxide";
	    Variable[Variable["us_aqi"] = 96] = "us_aqi";
	    Variable[Variable["us_aqi_pm2p5"] = 97] = "us_aqi_pm2p5";
	    Variable[Variable["us_aqi_pm10"] = 98] = "us_aqi_pm10";
	    Variable[Variable["us_aqi_nitrogen_dioxide"] = 99] = "us_aqi_nitrogen_dioxide";
	    Variable[Variable["us_aqi_ozone"] = 100] = "us_aqi_ozone";
	    Variable[Variable["us_aqi_sulphur_dioxide"] = 101] = "us_aqi_sulphur_dioxide";
	    Variable[Variable["us_aqi_carbon_monoxide"] = 102] = "us_aqi_carbon_monoxide";
	    Variable[Variable["sunshine_duration"] = 103] = "sunshine_duration";
	    Variable[Variable["convective_inhibition"] = 104] = "convective_inhibition";
	    Variable[Variable["shortwave_radiation_clear_sky"] = 105] = "shortwave_radiation_clear_sky";
	    Variable[Variable["global_tilted_irradiance"] = 106] = "global_tilted_irradiance";
	    Variable[Variable["global_tilted_irradiance_instant"] = 107] = "global_tilted_irradiance_instant";
	    Variable[Variable["ocean_current_velocity"] = 108] = "ocean_current_velocity";
	    Variable[Variable["ocean_current_direction"] = 109] = "ocean_current_direction";
	    Variable[Variable["cloud_base"] = 110] = "cloud_base";
	    Variable[Variable["cloud_top"] = 111] = "cloud_top";
	    Variable[Variable["mass_density"] = 112] = "mass_density";
	    Variable[Variable["boundary_layer_height"] = 113] = "boundary_layer_height";
	    Variable[Variable["formaldehyde"] = 114] = "formaldehyde";
	    Variable[Variable["glyoxal"] = 115] = "glyoxal";
	    Variable[Variable["non_methane_volatile_organic_compounds"] = 116] = "non_methane_volatile_organic_compounds";
	    Variable[Variable["pm10_wildfires"] = 117] = "pm10_wildfires";
	    Variable[Variable["peroxyacyl_nitrates"] = 118] = "peroxyacyl_nitrates";
	    Variable[Variable["secondary_inorganic_aerosol"] = 119] = "secondary_inorganic_aerosol";
	    Variable[Variable["residential_elementary_carbon"] = 120] = "residential_elementary_carbon";
	    Variable[Variable["total_elementary_carbon"] = 121] = "total_elementary_carbon";
	    Variable[Variable["pm2_5_total_organic_matter"] = 122] = "pm2_5_total_organic_matter";
	    Variable[Variable["sea_salt_aerosol"] = 123] = "sea_salt_aerosol";
	    Variable[Variable["nitrogen_monoxide"] = 124] = "nitrogen_monoxide";
	    Variable[Variable["thunderstorm_probability"] = 125] = "thunderstorm_probability";
	    Variable[Variable["rain_probability"] = 126] = "rain_probability";
	    Variable[Variable["freezing_rain_probability"] = 127] = "freezing_rain_probability";
	    Variable[Variable["ice_pellets_probability"] = 128] = "ice_pellets_probability";
	    Variable[Variable["snowfall_probability"] = 129] = "snowfall_probability";
	    Variable[Variable["carbon_dioxide"] = 130] = "carbon_dioxide";
	    Variable[Variable["methane"] = 131] = "methane";
	})(Variable || (variable.Variable = Variable = {}));
	return variable;
}

var hasRequiredVariableWithValues;

function requireVariableWithValues () {
	if (hasRequiredVariableWithValues) return variableWithValues;
	hasRequiredVariableWithValues = 1;
	// automatically generated by the FlatBuffers compiler, do not modify
	var __createBinding = (variableWithValues.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (variableWithValues.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (variableWithValues.__importStar) || (function () {
	    var ownKeys = function(o) {
	        ownKeys = Object.getOwnPropertyNames || function (o) {
	            var ar = [];
	            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	            return ar;
	        };
	        return ownKeys(o);
	    };
	    return function (mod) {
	        if (mod && mod.__esModule) return mod;
	        var result = {};
	        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	        __setModuleDefault(result, mod);
	        return result;
	    };
	})();
	Object.defineProperty(variableWithValues, "__esModule", { value: true });
	variableWithValues.VariableWithValues = undefined;
	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
	const flatbuffers = __importStar(require$$0);
	const aggregation_js_1 = requireAggregation();
	const unit_js_1 = requireUnit();
	const variable_js_1 = requireVariable();
	class VariableWithValues {
	    constructor() {
	        this.bb = null;
	        this.bb_pos = 0;
	    }
	    __init(i, bb) {
	        this.bb_pos = i;
	        this.bb = bb;
	        return this;
	    }
	    static getRootAsVariableWithValues(bb, obj) {
	        return (obj || new VariableWithValues()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	    }
	    static getSizePrefixedRootAsVariableWithValues(bb, obj) {
	        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
	        return (obj || new VariableWithValues()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	    }
	    variable() {
	        const offset = this.bb.__offset(this.bb_pos, 4);
	        return offset ? this.bb.readUint8(this.bb_pos + offset) : variable_js_1.Variable.undefined;
	    }
	    unit() {
	        const offset = this.bb.__offset(this.bb_pos, 6);
	        return offset ? this.bb.readUint8(this.bb_pos + offset) : unit_js_1.Unit.undefined;
	    }
	    value() {
	        const offset = this.bb.__offset(this.bb_pos, 8);
	        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
	    }
	    values(index) {
	        const offset = this.bb.__offset(this.bb_pos, 10);
	        return offset ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
	    }
	    valuesLength() {
	        const offset = this.bb.__offset(this.bb_pos, 10);
	        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	    }
	    valuesArray() {
	        const offset = this.bb.__offset(this.bb_pos, 10);
	        return offset ? new Float32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
	    }
	    valuesInt64(index) {
	        const offset = this.bb.__offset(this.bb_pos, 12);
	        return offset ? this.bb.readInt64(this.bb.__vector(this.bb_pos + offset) + index * 8) : BigInt(0);
	    }
	    valuesInt64Length() {
	        const offset = this.bb.__offset(this.bb_pos, 12);
	        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	    }
	    altitude() {
	        const offset = this.bb.__offset(this.bb_pos, 14);
	        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
	    }
	    aggregation() {
	        const offset = this.bb.__offset(this.bb_pos, 16);
	        return offset ? this.bb.readUint8(this.bb_pos + offset) : aggregation_js_1.Aggregation.none;
	    }
	    pressureLevel() {
	        const offset = this.bb.__offset(this.bb_pos, 18);
	        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
	    }
	    depth() {
	        const offset = this.bb.__offset(this.bb_pos, 20);
	        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
	    }
	    depthTo() {
	        const offset = this.bb.__offset(this.bb_pos, 22);
	        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
	    }
	    ensembleMember() {
	        const offset = this.bb.__offset(this.bb_pos, 24);
	        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
	    }
	    previousDay() {
	        const offset = this.bb.__offset(this.bb_pos, 26);
	        return offset ? this.bb.readInt16(this.bb_pos + offset) : 0;
	    }
	}
	variableWithValues.VariableWithValues = VariableWithValues;
	return variableWithValues;
}

var hasRequiredVariablesWithTime;

function requireVariablesWithTime () {
	if (hasRequiredVariablesWithTime) return variablesWithTime;
	hasRequiredVariablesWithTime = 1;
	// automatically generated by the FlatBuffers compiler, do not modify
	var __createBinding = (variablesWithTime.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (variablesWithTime.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (variablesWithTime.__importStar) || (function () {
	    var ownKeys = function(o) {
	        ownKeys = Object.getOwnPropertyNames || function (o) {
	            var ar = [];
	            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	            return ar;
	        };
	        return ownKeys(o);
	    };
	    return function (mod) {
	        if (mod && mod.__esModule) return mod;
	        var result = {};
	        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	        __setModuleDefault(result, mod);
	        return result;
	    };
	})();
	Object.defineProperty(variablesWithTime, "__esModule", { value: true });
	variablesWithTime.VariablesWithTime = undefined;
	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
	const flatbuffers = __importStar(require$$0);
	const variable_with_values_js_1 = requireVariableWithValues();
	class VariablesWithTime {
	    constructor() {
	        this.bb = null;
	        this.bb_pos = 0;
	    }
	    __init(i, bb) {
	        this.bb_pos = i;
	        this.bb = bb;
	        return this;
	    }
	    static getRootAsVariablesWithTime(bb, obj) {
	        return (obj || new VariablesWithTime()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	    }
	    static getSizePrefixedRootAsVariablesWithTime(bb, obj) {
	        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
	        return (obj || new VariablesWithTime()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	    }
	    time() {
	        const offset = this.bb.__offset(this.bb_pos, 4);
	        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
	    }
	    timeEnd() {
	        const offset = this.bb.__offset(this.bb_pos, 6);
	        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
	    }
	    interval() {
	        const offset = this.bb.__offset(this.bb_pos, 8);
	        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	    }
	    variables(index, obj) {
	        const offset = this.bb.__offset(this.bb_pos, 10);
	        return offset ? (obj || new variable_with_values_js_1.VariableWithValues()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
	    }
	    variablesLength() {
	        const offset = this.bb.__offset(this.bb_pos, 10);
	        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
	    }
	}
	variablesWithTime.VariablesWithTime = VariablesWithTime;
	return variablesWithTime;
}

var hasRequiredWeatherApiResponse;

function requireWeatherApiResponse () {
	if (hasRequiredWeatherApiResponse) return weatherApiResponse;
	hasRequiredWeatherApiResponse = 1;
	// automatically generated by the FlatBuffers compiler, do not modify
	var __createBinding = (weatherApiResponse.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (weatherApiResponse.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (weatherApiResponse.__importStar) || (function () {
	    var ownKeys = function(o) {
	        ownKeys = Object.getOwnPropertyNames || function (o) {
	            var ar = [];
	            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	            return ar;
	        };
	        return ownKeys(o);
	    };
	    return function (mod) {
	        if (mod && mod.__esModule) return mod;
	        var result = {};
	        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	        __setModuleDefault(result, mod);
	        return result;
	    };
	})();
	Object.defineProperty(weatherApiResponse, "__esModule", { value: true });
	weatherApiResponse.WeatherApiResponse = undefined;
	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
	const flatbuffers = __importStar(require$$0);
	const model_js_1 = requireModel();
	const variables_with_time_js_1 = requireVariablesWithTime();
	class WeatherApiResponse {
	    constructor() {
	        this.bb = null;
	        this.bb_pos = 0;
	    }
	    __init(i, bb) {
	        this.bb_pos = i;
	        this.bb = bb;
	        return this;
	    }
	    static getRootAsWeatherApiResponse(bb, obj) {
	        return (obj || new WeatherApiResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	    }
	    static getSizePrefixedRootAsWeatherApiResponse(bb, obj) {
	        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
	        return (obj || new WeatherApiResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
	    }
	    latitude() {
	        const offset = this.bb.__offset(this.bb_pos, 4);
	        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
	    }
	    longitude() {
	        const offset = this.bb.__offset(this.bb_pos, 6);
	        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
	    }
	    elevation() {
	        const offset = this.bb.__offset(this.bb_pos, 8);
	        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
	    }
	    generationTimeMilliseconds() {
	        const offset = this.bb.__offset(this.bb_pos, 10);
	        return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
	    }
	    locationId() {
	        const offset = this.bb.__offset(this.bb_pos, 12);
	        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
	    }
	    model() {
	        const offset = this.bb.__offset(this.bb_pos, 14);
	        return offset ? this.bb.readUint8(this.bb_pos + offset) : model_js_1.Model.undefined;
	    }
	    utcOffsetSeconds() {
	        const offset = this.bb.__offset(this.bb_pos, 16);
	        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
	    }
	    timezone(optionalEncoding) {
	        const offset = this.bb.__offset(this.bb_pos, 18);
	        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	    }
	    timezoneAbbreviation(optionalEncoding) {
	        const offset = this.bb.__offset(this.bb_pos, 20);
	        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
	    }
	    current(obj) {
	        const offset = this.bb.__offset(this.bb_pos, 22);
	        return offset ? (obj || new variables_with_time_js_1.VariablesWithTime()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	    }
	    daily(obj) {
	        const offset = this.bb.__offset(this.bb_pos, 24);
	        return offset ? (obj || new variables_with_time_js_1.VariablesWithTime()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	    }
	    hourly(obj) {
	        const offset = this.bb.__offset(this.bb_pos, 26);
	        return offset ? (obj || new variables_with_time_js_1.VariablesWithTime()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	    }
	    minutely15(obj) {
	        const offset = this.bb.__offset(this.bb_pos, 28);
	        return offset ? (obj || new variables_with_time_js_1.VariablesWithTime()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	    }
	    sixHourly(obj) {
	        const offset = this.bb.__offset(this.bb_pos, 30);
	        return offset ? (obj || new variables_with_time_js_1.VariablesWithTime()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
	    }
	}
	weatherApiResponse.WeatherApiResponse = WeatherApiResponse;
	return weatherApiResponse;
}

var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;
	var __awaiter = (lib.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	Object.defineProperty(lib, "__esModule", { value: true });
	lib.fetchWeatherApi = undefined;
	const flatbuffers_1 = require$$0;
	const weather_api_response_1 = requireWeatherApiResponse();
	const sleep = (ms) => new Promise(r => setTimeout(r, ms));
	function fetchRetried(url_1) {
	    return __awaiter(this, arguments, undefined, function* (url, retries = 3, backoffFactor = 0.5, backoffMax = 2) {
	        const statusToRetry = [500, 502, 504];
	        const statusWithJsonError = [400, 429];
	        let currentTry = 0;
	        let response = yield fetch(url);
	        while (statusToRetry.includes(response.status)) {
	            currentTry++;
	            if (currentTry >= retries) {
	                throw new Error(response.statusText);
	            }
	            const sleepMs = Math.min(backoffFactor * Math.pow(2, currentTry), backoffMax) * 1000;
	            yield sleep(sleepMs);
	            response = yield fetch(url);
	        }
	        if (statusWithJsonError.includes(response.status)) {
	            const json = yield response.json();
	            if ('reason' in json) {
	                throw new Error(json.reason);
	            }
	            throw new Error(response.statusText);
	        }
	        return response;
	    });
	}
	/**
	 * Retrieve data from the Open-Meteo weather API
	 *
	 * @param {string} url Server and endpoint. E.g. "https://api.open-meteo.com/v1/forecast"
	 * @param {any} params URL parameter as an object
	 * @param {number} [retries=3] Number of retries in case of an server error
	 * @param {number} [backoffFactor=0.2] Exponential backoff factor to increase wait time after each retry
	 * @param {number} [backoffMax=2] Maximum wait time between retries
	 * @returns {Promise<WeatherApiResponse[]>}
	 */
	function fetchWeatherApi(url_1, params_1) {
	    return __awaiter(this, arguments, undefined, function* (url, params, retries = 3, backoffFactor = 0.2, backoffMax = 2) {
	        const urlParams = new URLSearchParams(params);
	        urlParams.set('format', 'flatbuffers');
	        const response = yield fetchRetried(`${url}?${urlParams.toString()}`, retries, backoffFactor, backoffMax);
	        const fb = new flatbuffers_1.ByteBuffer(new Uint8Array(yield response.arrayBuffer()));
	        const results = [];
	        let pos = 0;
	        while (pos < fb.capacity()) {
	            fb.setPosition(pos);
	            const len = fb.readInt32(fb.position());
	            results.push(weather_api_response_1.WeatherApiResponse.getSizePrefixedRootAsWeatherApiResponse(fb));
	            pos += len + 4;
	        }
	        return results;
	    });
	}
	lib.fetchWeatherApi = fetchWeatherApi;
	return lib;
}

var libExports = requireLib();

const cloudImage = "data:image/png;base64,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";

const params = {
    "latitude": 35.6895,
    "longitude": 139.6917,
    "current": ["is_day", "weather_code"],
    "hourly": ["temperature_2m", "apparent_temperature", "precipitation_probability", "precipitation", "rain", "showers", "snowfall", "weather_code"],
    "timezone": "Asia/Tokyo",
    "forecast_days": 1
};
const url = "https://api.open-meteo.com/v1/forecast";
const responses = await libExports.fetchWeatherApi(url, params);
// Helper function to form time ranges
const range = (start, stop, step) => Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
// Process first location. Add a for-loop for multiple locations or weather models
const response = responses[0];
// Attributes for timezone and location
const utcOffsetSeconds = response.utcOffsetSeconds();
response.timezone();
response.timezoneAbbreviation();
response.latitude();
response.longitude();
const current = response.current();
const hourly = response.hourly();
// Note: The order of weather variables in the URL query and the indices below need to match!
const weatherData = {
    current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        isDay: current.variables(0).value(),
        weatherCode: current.variables(1).value(),
    },
    hourly: {
        time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        temperature2m: hourly.variables(0).valuesArray(),
        apparentTemperature: hourly.variables(1).valuesArray(),
        precipitationProbability: hourly.variables(2).valuesArray(),
        precipitation: hourly.variables(3).valuesArray(),
        rain: hourly.variables(4).valuesArray(),
        showers: hourly.variables(5).valuesArray(),
        snowfall: hourly.variables(6).valuesArray(),
        weatherCode: hourly.variables(7).valuesArray(),
    },
};
// `weatherData` now contains a simple structure with arrays for datetime and weather data
for (let i = 0; i < weatherData.hourly.time.length; i++) {
    console.log("Time: ", weatherData.hourly.time[i].toISOString(), ", Temp: ", weatherData.hourly.temperature2m[i], // air temp at 2m in Celcius
    ", Apparent Temp: ", weatherData.hourly.apparentTemperature[i], // feels like
    ", Precept prob: ", weatherData.hourly.precipitationProbability[i], // Probability of precipitation with more than 0.1 mm of the preceding hour- so hour before!.
    ", Precept: ", weatherData.hourly.precipitation[i], // mm, Total precipitation (rain, showers, snow) sum of the preceding hour
    ", Rain: ", weatherData.hourly.rain[i], // mm, Rain from large scale weather systems of the preceding hour in millimeter
    ", Showers: ", weatherData.hourly.showers[i], // short lived, Showers from convective precipitation in millimeters from the preceding hour
    ", Snowfall: ", weatherData.hourly.snowfall[i], // cm, Snowfall amount of the preceding hour in centimeters. For the water equivalent in millimeter, divide by 7. E.g. 7 cm snow = 10 mm precipitation water equivalent
    ", Weather code: ", weatherData.hourly.weatherCode[i] // right now, see weather codes
    );
    const weatherElement = document.getElementById('weather');
    if (weatherElement != null) {
        //weatherElement.innerHTML = weatherData.hourly.precipitationProbability[i].toString();
        document.getElementById('amWeatherIcon').src = cloudImage;
        //		const imgElement = document.createElement('img');
        //		imgElement.src = cloudImage;
        //		weatherElement.innerHTML.body.appendChild(imgElement);
        //		amWeatherIcon = document.getElementById()
    }
}
//if (weatherData != null) {
//	const weatherElement = document.getElementById('weather')
//	if(weatherElement != null) {
//		weatherElement.innerHTML = weatherData.current.isDay.toString();
//	}
//}
// `weatherData` now contains a simple structure with arrays for datetime and weather data
