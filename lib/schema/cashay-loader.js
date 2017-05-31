"use strict";

module.exports = function (content) {
  // Allow webpack to be smart about required dependencies:
  this.cacheable && this.cacheable();
  var callback = this.async();
  // Execute the supplied javascript, receive promise:
  var doc = this.exec(content, this.resource);
  doc(this.resourceQuery).then(function (schema) {
    // Await the yield of a cashay schema:
    callback(null, "module.exports = " + JSON.stringify(schema));
  });
};