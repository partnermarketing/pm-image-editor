(function () {
  'use strict';

  angular.module('pmImageEditor').
    factory('ResizableFactory', function() {
      var ResizableFactory = function(options) {
        this._options = options;

        // Original start and position values which was before resize.
        this._originalSize = { width: 0, height: 0 };
        this._originalPosition = { top: 0, left: 0 };

        this._originalMousePosition = {top: 0, left: 0};

        // Start and position values during resize.
        this._position = this._originalPosition;
        this._size = this._originalSize;

        this._axis = 'se';
        this._ratio = 1;
      };

      /**
       * Updates necessary data when resize is starting.
       *
       * @param event - native event which happens on mouse down for handler.
       * @param element - resizable element.
       */
      ResizableFactory.prototype.resizeStart = function(event, element) {
        this.setOriginalMousePosition(event.screenY, event.screenX);

        this.setOriginalPosition(parseInt(element.css('top'), 10) || 0, parseInt(element.css('left'), 10) || 0);

        this.setParentSize(element.parent());

        this.setOriginalSize(element);

        this._ratio = this._size.width / this._size.height;

        var axis = event.target.className.match(/resizable-(se|sw|ne|nw|n|e|s|w)/i);
        this._axis = axis && axis[1] ? axis[1] : 'se';

        this.updateVirtualBoundaries();
      };

      /**
       * Calculates new boundary data when handler moves to screenX and screenY.
       *
       * @param screenX
       * @param screenY
       */
      ResizableFactory.prototype.getBoundaryData = function(screenX, screenY) {
        var boundaryData = this.updateBoundaries(
          screenX - this._originalMousePosition.left,
          screenY - this._originalMousePosition.top
        );

        boundaryData = this.updateRatio(boundaryData);

        boundaryData = this.respectSize(boundaryData);

        this.updateSizeAndPosition(boundaryData);

        return this.fitContainer(boundaryData);
      };

      /**
       * Calculates boundary object to apply when mouse pointer position changes by dx, dy
       * through given axis. This object can contain some (at least one) of properties
       * { width: int, height: int, left: int, top: int }.
       *
       * @param int dx
       * @param int dy
       */
      ResizableFactory.prototype.updateBoundaries = function(dx, dy) {
        var originalSize = this._originalSize;
        var originalPosition = this._originalPosition;

        // This object calculates boundaries changes depends on axis.
        var _change = {
          e: function(dx) {
            return { width: originalSize.width + dx };
          },
          w: function(dx) {
            var cs = originalSize, sp = originalPosition;
            return { left: sp.left + dx, width: cs.width - dx };
          },
          n: function(dx, dy) {
            var cs = originalSize, sp = originalPosition;
            return { top: sp.top + dy, height: cs.height - dy };
          },
          s: function(dx, dy) {
            return { height: originalSize.height + dy };
          },
          se: function(dx, dy) {
            return angular.extend(this.s.apply(this, arguments),
              this.e.apply(this, [ dx, dy ]));
          },
          sw: function(dx, dy) {
            return angular.extend(this.s.apply(this, arguments),
              this.w.apply(this, [ dx, dy ]));
          },
          ne: function(dx, dy) {
            return angular.extend(this.n.apply(this, arguments),
              this.e.apply(this, [ dx, dy ]));
          },
          nw: function(dx, dy) {
            return angular.extend(this.n.apply(this, arguments),
              this.w.apply(this, [ dx, dy ]));
          }
        };

        return _change[this._axis](dx, dy);
      };

      /**
       * Updates incoming data to fit ratio.
       *
       * @param data - boundaries data.
       */
      ResizableFactory.prototype.updateRatio = function(data) {
        if (angular.isNumber(data.height)) {
          data.width = (data.height * this._ratio);
        } else if (angular.isNumber(data.width)) {
          data.height = (data.width / this._ratio);
        }

        if (this._axis === 'sw') {
          data.left = this._position.left + (this._size.width - data.width);
          data.top = null;
        }
        if (this._axis === 'nw') {
          data.top = this._position.top + (this._size.height - data.height);
          data.left = this._position.left + (this._size.width - data.width);
        }

        return data;
      };


      /**
       * Updates current position and size from boundaries data.
       *
       * @param data - boundaries data.
       */
      ResizableFactory.prototype.updateSizeAndPosition = function(data) {
        if (angular.isNumber(data.left)) {
          this._position.left = data.left;
        }
        if (angular.isNumber(data.top)) {
          this._position.top = data.top;
        }
        if (angular.isNumber(data.height)) {
          this._size.height = data.height;
        }
        if (angular.isNumber(data.width)) {
          this._size.width = data.width;
        }
      };

      /**
       * Calculates new virtual boundaries values depends on options and ratio.
       */
      ResizableFactory.prototype.updateVirtualBoundaries = function() {
        var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b,
            o = this._options;

        b = {
          minWidth: angular.isNumber(o.minWidth) ? o.minWidth : 0,
          maxWidth: angular.isNumber(o.maxWidth) ? o.maxWidth : Infinity,
          minHeight: angular.isNumber(o.minHeight) ? o.minHeight : 0,
          maxHeight: angular.isNumber(o.maxHeight) ? o.maxHeight : Infinity
        };

        if (this._ratio) {
          pMinWidth = b.minHeight * this._ratio;
          pMinHeight = b.minWidth / this._ratio;
          pMaxWidth = b.maxHeight * this._ratio;
          pMaxHeight = b.maxWidth / this._ratio;

          if (pMinWidth > b.minWidth) {
            b.minWidth = pMinWidth;
          }
          if (pMinHeight > b.minHeight) {
            b.minHeight = pMinHeight;
          }
          if (pMaxWidth < b.maxWidth) {
            b.maxWidth = pMaxWidth;
          }
          if (pMaxHeight < b.maxHeight) {
            b.maxHeight = pMaxHeight;
          }
        }

        this._vBoundaries = b;
      };

      /**
       * Updates boundaries data to fit min/max sizes.
       *
       * @param data - boundaries data.
       */
      ResizableFactory.prototype.respectSize = function(data) {
        var o = this._vBoundaries,
            a = this._axis,
            ismaxw = angular.isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width),
            ismaxh = angular.isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
            isminw = angular.isNumber(data.width) && o.minWidth && (o.minWidth > data.width),
            isminh = angular.isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
            dw = this._originalPosition.left + this._originalSize.width,
            dh = this._position.top + this._size.height,
            cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);

        if (isminw) {
          data.width = o.minWidth;
        }
        if (isminh) {
          data.height = o.minHeight;
        }
        if (ismaxw) {
          data.width = o.maxWidth;
        }
        if (ismaxh) {
          data.height = o.maxHeight;
        }

        if (isminw && cw) {
          data.left = dw - o.minWidth;
        }
        if (ismaxw && cw) {
          data.left = dw - o.maxWidth;
        }
        if (isminh && ch) {
          data.top = dh - o.minHeight;
        }
        if (ismaxh && ch) {
          data.top = dh - o.maxHeight;
        }

        if (!data.width && !data.height && !data.left && data.top) {
          data.top = null;
        } else if (!data.width && !data.height && !data.top && data.left) {
          data.left = null;
        }

        return data;
      };

      /**
       * Updates boundary data to avoid moving outside parent.
       *
       * @param data - boundaries data.
       */
      ResizableFactory.prototype.fitContainer = function(data) {
        var continueResize = true;
        var h, w;

        if (this._position.left < 0) {
          // If left value is negative, we need to decrease width
          // on this value and set left to zero.
          this._size.width += this._position.left;

          // Remember the height.
          h = this._size.height;
          if ( this._ratio ) {
            this._size.height = this._size.width / this._ratio;
            continueResize = false;
          }
          this._position.left = 0;

          if (this._axis === 'nw') {
            // In case if both top and left was changed at the same time
            // change top position also  by heights difference.
            this._position.top += h - this._size.height;
          }
        }

        if ( this._position.top < 0 ) {
          // If top value is negative, we need to decrease height
          // on this value and set top to zero.
          this._size.height += this._position.top;

          // Remember the width.
          w = this._size.width;
          if ( this._ratio ) {
            this._size.width = this._size.height * this._ratio;
            continueResize = false;
          }
          this._position.top = 0;

          if (this._axis === 'nw') {
            // In case if both top and left was changed at the same time
            // change left position also by widths difference.
            this._position.left += w - this._size.width;
          }
        }

        // Too big width case.
        if ( this._position.left + this._size.width >= this._parentData.width ) {
          this._size.width = this._parentData.width - this._position.left;

          h = this._size.height;
          if ( this._ratio ) {
            this._size.height = this._size.width / this._ratio;
            continueResize = false;
          }

          if (this._axis === 'ne' || this._axis === 'n') {
            this._position.top += h - this._size.height;
          }
        }

        // Too big height case.
        if ( this._position.top + this._size.height >= this._parentData.height ) {
          this._size.height = this._parentData.height - this._position.top;

          w = this._size.width;
          if ( this._ratio ) {
            this._size.width = this._size.height * this._ratio;
            continueResize = false;
          }

          if (this._axis === 'sw') {
            this._position.left += w - this._size.width;
          }
        }

        if ( !continueResize ) {
          data.left = this._position.left;
          data.top = this._position.top;
          data.width = this._size.width;
          data.height = this._size.height;
        }

        return data;
      };


      /**
       * Getters / setters.
       */
      ResizableFactory.prototype.setOriginalSize = function(element) {
        this._originalSize = {
          width: parseInt(element.css('width'), 10) || element[0].clientWidth,
          height: parseInt(element.css('height'), 10) || element[0].clientHeight
        };

        // Updating original size should update _size value.
        this._size = angular.copy(this._originalSize);

        return this;
      };

      ResizableFactory.prototype.getOriginalSize = function() {
        return this._originalSize;
      };

      ResizableFactory.prototype.setParentSize = function(parentElement) {
        this._parentData = {
          width: parseInt(parentElement.css('width'), 10) || parentElement[0].clientWidth,
          height: parseInt(parentElement.css('height'), 10) || parentElement[0].clientHeight
        };

        return this;
      };

      ResizableFactory.prototype.getParentSize = function() {
        return this._parentData;
      };

      ResizableFactory.prototype.setOriginalPosition = function(top, left) {
        this._originalPosition = { top: top, left: left };

        // Updating original position should update _position value.
        this._position = angular.copy(this._originalPosition);

        return this;
      };

      ResizableFactory.prototype.getOriginalPosition = function() {
        return this._originalPosition;
      };

      ResizableFactory.prototype.setOriginalMousePosition = function(top, left) {
        this._originalMousePosition = { top: top, left: left };

        return this;
      };

      ResizableFactory.prototype.getOriginalMousePosition = function() {
        return this._originalMousePosition;
      };

      ResizableFactory.prototype.setOption = function(name, value) {
        this._options[name] = value;

        return this;
      };

      ResizableFactory.prototype.getOption = function(name) {
        return this._options[name];
      };

      ResizableFactory.prototype.getSize = function() {
        return this._size;
      };

      ResizableFactory.prototype.getPosition = function() {
        return this._position;
      };

      ResizableFactory.prototype.getRatio = function() {
        return this._ratio;
      };

      ResizableFactory.prototype.getAxis = function() {
        return this._axis;
      };

      ResizableFactory.prototype.getVirtualBoundaries = function() {
        return this._vBoundaries;
      };

      return ResizableFactory;
    }).
    controller('ResizableController', function($scope, $document, $rootScope, ResizableFactory) {
      $scope.resizableFactory = new ResizableFactory({
        minHeight: 20,
        minWidth: 20
      });

      $scope.resizableUiParams = function() {
        return {
          element: $scope.element,
          position: $scope.resizableFactory.getPosition(),
          size: $scope.resizableFactory.getSize()
        };
      };

      $scope.resizableHandleMousedown = function(event) {
        // Prevent default dragging of selected content.
        event.preventDefault();
        // Stop propagation to parent from handlers.
        event.stopPropagation();

        $scope.resizableFactory.resizeStart(event, $scope.element);

        // Bind events to track resize.
        $document.on('mousemove', $scope.resizableMousemove);
        $document.on('mouseup', $scope.resizableMouseup);
      };

      $scope.resizableMousemove = function(event) {
        // Get new boundaries.
        var boundaryData = $scope.resizableFactory.getBoundaryData(event.screenX, event.screenY);

        // And apply css.
        var css = {};
        angular.forEach(boundaryData, function(value, key) {
          if (value !== null) {
            css[key] = value + 'px';
          }
        });

        $scope.element.css(css);

        if (angular.isFunction($scope.onResize)) {
            $scope.onResize(css);
        }
      };

      $scope.resizableMouseup = function(event) {
        // Unbind events that track resize.
        $document.unbind('mousemove', $scope.resizableMousemove);
        $document.unbind('mouseup', $scope.resizableMouseup);

        $rootScope.$broadcast('resizeStop', event, $scope.resizableUiParams());
      };
    }).
    directive('resizable', function() {
      return {
        restrict: 'A',
        controller: 'ResizableController',
        link: function(scope, element) {
          scope.element = element;
          scope.parentElement = element.parent();

          // Element should have absolute position.
          element.css({ position: 'absolute' });

          // Add dragging handlers.
          var handlers = 'n,e,w,s,nw,ne,sw,se';
          handlers.split(',').forEach(function(direction) {
            var handler = angular.element('<span class="resizable-'+direction+' resizable-handle"></span>');
            element.append(handler);
            handler.on('mousedown', function(event) {
              scope.resizableHandleMousedown(event);
            });
          });
        }
      };
    });
}());

