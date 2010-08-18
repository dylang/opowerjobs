var assert = require('assert');

// A mini expectations module to ensure expected callback fire at all.
var expectations = {};
function expect(message) {
  expectations[message] = new Error("Missing expectation: " + message);
}
function fulfill(message) {
  delete expectations[message];
}
process.addListener('exit', function () {
  Object.keys(expectations).forEach(function (message) {
    throw expectations[message];
  });
});

require('./lib/proto');


var Rectangle = {
  initialize: function initialize(width, height) {
    this.width = width;
    this.height = height;
  },
  get area() {
    return this.width * this.height;
  }
};

var Square = Rectangle.extend({
  initialize: function initialize(side) {
    this.width = side;
    this.height = side;
  }
});

var rect = Rectangle.new(2, 5);
var square = Square.new(3);
var data = {name: "Tim Caswell", age: 28};
var self = {};

assert.equal(rect.area, 10, "Rectangle should have area of 10");
assert.equal(square.area, 9, "Square should have area of 9");
assert.ok(Rectangle.isPrototypeOf(Square), "Square inherits from Rectangle");
assert.ok(Rectangle.isPrototypeOf(rect), "instances of Rectangle inherit from it");
assert.ok(Square.isPrototypeOf(square), "instances of Square inherit from it");
assert.ok(Rectangle.isPrototypeOf(square), "instances of Square inherit from Rectangle");
expect('forEach');
data.forEach(function (value, key, obj) {
  fulfill('forEach');
  assert.equal(value, data[key], "Value should match");
  assert.equal(obj, data, "Third arguments should be original object")
  assert.equal(this, self, "this should be same as set in forEach")
}, self);
expect('map');
var result = data.map(function (value, key, obj) {
  fulfill('map');
  assert.equal(value, data[key], "Value should match");
  assert.equal(obj, data, "Third arguments should be original object")
  assert.equal(this, self, "this should be same as set in forEach");
  return [key, value];
}, self);
assert.deepEqual(result, [ [ 'name', 'Tim Caswell' ], [ 'age', 28 ] ], "Map should work as expected");
