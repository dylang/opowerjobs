# Proto

This simple js library adds four functions to Object.prototype.  Since this only modifies global objects and doesn't export any structures, you don't need the return value when calling `require('proto')`.

## Object.prototype

All functions added to `Object.prototype` are usable from any object in JavaScript.

### Object.prototype.forEach(callback[, thisObject])

This is the most useful of the additions.  It allows you to forEach over an `Object` instance's local properties and values just like you can already do with `Array` instances.

    require('proto');
    ({name: "Tim", age: 28}).forEach(function (value, key) {
      console.log(key + " = " + JSON.stringify(value));
    });

### Object.prototype.map(callback[, thisObject])

This works like forEach, except returns an `Array` instance with the returned values of the function calls.

    require('proto');
    var pairs = ({name: "Tim", age: 28}).map(function (value, key) {
      return key + " = " + value;
    });
    // pairs is ["name = Tim", "age = 28"]

### Object.prototype.new(args...)

Creates a new version of the current object and calls it's `initialize` function if one exists with the same arguments passed to new.

    require('proto');
    var Rectangle = {
      initialize: function initialize(width, height) {
        this.width = width;
        this.height = height;
      },
      get area() {
        return this.width * this.height;
      }
    };

    var rect = Rectangle.new(2, 4);
    console.log(rect.area);

### Object.prototype.extend(newObject)

Sets the current object as the prototype to the passed in object and returns the new passed in object.

    // Assuming the code from above
    var Square = Rectangle.extend({
      initialize: function initialize(side) {
        this.width = side;
        this.height = side;
      }
    });
    var square = Square.new(15);
    console.log(square.area);


