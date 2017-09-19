/*
Copyright 2017 Vijay s

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
*/
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();

$.getScript( "js/smoothscroll.js");

var SimplyAnimate = Class.extend({
  options:{
    selector : ".simply-animate",
    animateClass : "animated",
    wrapper : window,
    scrollIn : document,
    twoWay : true
  },
  init: function(option){
    $.extend( this.options, option );
    this.consrtruct();
  },

  consrtruct : function () {
    $(this.options.selector).css("visibility","hidden");
    this.animate(this);
    this.create();
  },

  isOnScreen : function(element,x, y){

    if(x == null || typeof x == 'undefined') x = 1;
    if(y == null || typeof y == 'undefined') y = 1;

    var win = $(this.options.wrapper);

    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var height = element.outerHeight();
    var width = element.outerWidth();

    if(!width || !height){
        return false;
    }

    var bounds = element.offset();
    bounds.right = bounds.left + width;
    bounds.bottom = bounds.top + height;

    var visible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

    if(!visible){
        return false;
    }

    var deltas = {
        top : Math.min( 1, ( bounds.bottom - viewport.top ) / height),
        bottom : Math.min(1, ( viewport.bottom - bounds.top ) / height),
        left : Math.min(1, ( bounds.right - viewport.left ) / width),
        right : Math.min(1, ( viewport.right - bounds.left ) / width)
    };

    return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;

  },

  isOnScreen : function(element){

        var height = element.outerHeight();
        var width = element.outerWidth();

        if(!width || !height){
            return false;
        }

        var win = $(this.options.wrapper);

        var viewport = {
            top : win.scrollTop(),
            left : win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = element.offset();
        bounds.right = bounds.left + width;
        bounds.bottom = bounds.top + height;

        var showing = {
          top : viewport.bottom - bounds.top,
          left: viewport.right - bounds.left,
          bottom: bounds.bottom - viewport.top,
          right: bounds.right - viewport.left
        };

        return showing.top > 0
          && showing.left > 0
          && showing.right > 0
          && showing.bottom > 0;
    },

    animate : function (object) {
      var height = $(object.options.wrapper).height();
      $(object.options.selector).each(function() {
        var off = $(this).offset().top;
        var animateStyle = $(this).attr('animate-style');
        var animationDelay = $(this).attr('animation-delay');
        if(animationDelay == null || typeof animationDelay == 'undefined'){
          animationDelay = "0.3s";
        }
        if(object.isOnScreen($(this))){
          animating = true;
          $(this).css({"visibility":"visible","animationDelay":animationDelay});
          $(this).addClass(object.options.animateClass);
          $(this).addClass(animateStyle);
        }else if(object.options.twoWay){
          $(this).removeClass(object.options.animateClass);
          $(this).removeClass(animateStyle);
          $(this).css("visibility","hidden");
        }
      });
    },

    create : function () {
      var object=this;
      var animating = false;
        $(this.options.scrollIn).scroll(function (e) {
            var self = this;
            if (!animating) {
              object.animate(object);
              setTimeout(function () {
                animating=false;
              },500);
            }
        });
    },
});
