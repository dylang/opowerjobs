/*
Copyright (c) 2010 Tim Caswell <tim@creationix.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var proto = Object.prototype;

// Implements a forEach much like the one for Array.prototype.forEach, but for
// any object.
if (typeof proto.forEach !== 'function') {
  Object.defineProperty(proto, "forEach", {value: function forEach(callback, thisObject) {
    var keys = Object.keys(this);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      callback.call(thisObject, this[key], key, this);
    }
  }});
}

// Implements a map much like the one for Array.prototype.map, but for any
// object. Returns an array, not a generic object.
if (typeof proto.map !== 'function') {
  Object.defineProperty(proto, "map", {value: function map(callback, thisObject) {
    var accum = [];
    var keys = Object.keys(this);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      accum[i] = callback.call(thisObject, this[key], key, this);
    }
    return accum;
  }});
}

// Implement extend for easy prototypal inheritance
if (typeof proto.extend !== 'function') {
  Object.defineProperty(proto, "extend", {value: function extend(obj) {
    obj.__proto__ = this;
    return obj;
  }});
}

// Implement new for easy self-initializing objects
if (typeof proto.new !== 'function') {
  Object.defineProperty(proto, "new", {value: function () {
    var obj = Object.create(this);
    if (obj.initialize) obj.initialize.apply(obj, arguments);
    return obj;
  }});
}

