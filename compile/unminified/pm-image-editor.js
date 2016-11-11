/*!
 * undefined v0.5.0
 * https://github.com/partnermarketing/pm-image-editor
 *
 * Copyright (c) 2016 Partnermarketing.com
 * License: MIT
 *
 * Generated at Friday, November 11th, 2016, 9:15:39 AM
 */
(function() {
'use strict';

(function () {
        angular.module('pmImageEditor', []);
}());



(function () {
    angular.module('pmImageEditor').
    factory('DraggableFactory', function() {
      var DraggableFactory = function() {
        this._originalMousePosition = { top: 0, left: 0 };
        this._position = { top: 0, left: 0 };

        this._size = { width: 0, height: 0 };
        this._parentSize = { width: 0, height: 0 };
      };

      /**
       * Return css that is a result of dragging.
       */
      DraggableFactory.prototype.css = function() {
        return {
          top: this._position.top+'px',
          left: this._position.left+'px'
        };
      };

      /**
       * Set start data of the draggable element.
       *
       * @param event - native event which happens on mouse down for element.
       * @param element - draggable element.
       * @param parentElement - draggable element parent.
       */
      DraggableFactory.prototype.dragStart = function(event, element, parentElement) {
        this
          .setPosition(
            parseInt(element.css('top'), 10) || 0,
            parseInt(element.css('left'), 10) || 0
          )
          .setOriginalMousePosition(event.screenY, event.screenX)
          .setSize(element)
          .setParentSize(parentElement);

        return this;
      };

      /**
       * Update position of draggable element.
       * Doublecheck that element is not go out of parent element borders.
       */
      DraggableFactory.prototype.updatePosition = function(top, left) {
        // Calculate new top-left position and check that it stays positive.
        this._position.top = Math.max(top - this._originalMousePosition.top, 0);
        this._position.left = Math.max(left - this._originalMousePosition.left, 0);

        // Doublecheck that new x and y is not go out from parent borders.
        if (this._position.left + this._size.width > this._parentSize.width) {
          this._position.left = this._parentSize.width - this._size.width;
        }

        if (this._position.top + this._size.height > this._parentSize.height) {
          this._position.top = this._parentSize.height - this._size.height;
        }

        return this;
      };

      /** Getters/setters */
      DraggableFactory.prototype.setPosition = function(top, left) {
        this._position = { top: top, left: left };

        return this;
      };

      DraggableFactory.prototype.getPosition = function() {
        return this._position;
      };

      DraggableFactory.prototype.setOriginalMousePosition = function(top, left) {
        this._originalMousePosition = {
          top: top - this._position.top,
          left: left - this._position.left
        };

        return this;
      };

      DraggableFactory.prototype.getOriginalMousePosition = function() {
        return this._originalMousePosition;
      };

      DraggableFactory.prototype.setSize = function(element) {
        this._size = {
          width: parseInt(element.css('width'), 10) || element[0].clientWidth,
          height: parseInt(element.css('height'), 10) || element[0].clientHeight
        };

        return this;
      };

      DraggableFactory.prototype.getSize = function() {
        return this._size;
      };

      DraggableFactory.prototype.setParentSize = function(parentElement) {
        this._parentSize = {
          width: parseInt(parentElement.css('width'), 10) || parentElement[0].clientWidth,
          height: parseInt(parentElement.css('height'), 10) || parentElement[0].clientHeight
        };

        return this;
      };

      DraggableFactory.prototype.getParentSize = function() {
        return this._parentSize;
      };

      return DraggableFactory;
    }).
    controller('DraggableController', function($scope, $document, $rootScope, DraggableFactory) {
      $scope.draggableFactory = new DraggableFactory();

      $scope.draggableUiParams = function() {
        return {
          element: $scope.element,
          position: $scope.draggableFactory.getPosition()
        };
      };

      $scope.draggableMousedown = function(event) {
        // Prevent default dragging of selected content.
        event.preventDefault();

        $scope.draggableFactory.dragStart(event, $scope.element, $scope.parentElement);

        // Bind events to track drag.
        $document.on('mousemove', $scope.draggableMousemove);
        $document.on('mouseup', $scope.draggableMouseup);
      };

      $scope.draggableMousemove = function(event) {
        $scope.draggableFactory.updatePosition(event.screenY, event.screenX);

        // Set new element position.
        $scope.element.css($scope.draggableFactory.css());

        if (angular.isFunction($scope.onDrag)) {
            $scope.onDrag($scope.draggableFactory.css());
        }
      };

      $scope.draggableMouseup = function(event) {
        // Unbind events that track drag.
        $document.unbind('mousemove', $scope.draggableMousemove);
        $document.unbind('mouseup', $scope.draggableMouseup);

        $rootScope.$broadcast('dragStop', event, $scope.draggableUiParams());
      };
    }).
    directive('draggable', function() {
      return {
        restrict: 'A',
        controller: 'DraggableController',
        link: function(scope, element) {
          scope.element = element;
          scope.parentElement = element.parent();

          element.css({ position: 'absolute' });

          element.on('mousedown', function(event) {
            scope.draggableMousedown(event);
          });
        }
      };
    });
}());


(function () {
        angular.module('pmImageEditor').directive('editorPanel', function () {
        return {
            restrict: 'E',
            scope: {
                editorId: '@'
            },
            link: function (scope, element) {
                var buttonNames = 'crop,rotate-cw,rotate-acw,flip-h,flip-v,undo,redo';
                var buttonLabels = ['Crop', 'Rotate Clockwise', 'Rotate Counterclockwise', 'Flip Horizontal', 'Flip Vertical', 'Undo', 'Redo'];
                var buttons = {};
                buttonNames.split(',').forEach(function(name, index){
                    buttons[name] = angular
                        .element('<span class="image-editor-'+name+'" title="'+buttonLabels[index]+'" />')
                        .on('click', function() {
                            scope.$emit('editorButtonClick', {
                                name: name
                            });
                        });

                    element.append(buttons[name]);
                });

                // Undo and redo are disabled by default.
                buttons.undo.addClass('disabled');
                buttons.redo.addClass('disabled');

                scope.$on('disableButton', function(event, editorId, button) {
                    if (editorId === scope.editorId) {
                        buttons[button].addClass('disabled');
                    }
                });

                scope.$on('enableButton', function(event, editorId, button) {
                    if (editorId === scope.editorId) {
                        buttons[button].removeClass('disabled');
                    }
                });
            }
        };
    });
}());


/*jshint multistr: true */
(function () {
        angular.module('pmImageEditor').directive('imageSelection', function () {
        return {
            restrict: 'E',
            scope: {
                editorId: '@',
                width: '@',
                height: '@'
            },
            template: '\
                <div class="image-editor-selection" editor-id="{{editorId}}" draggable resizable>\
                    <div class="image-editor-selection-border-top"></div>\
                    <div class="image-editor-selection-border-bottom"></div>\
                    <div class="image-editor-selection-border-left"></div>\
                    <div class="image-editor-selection-border-right"></div>\
                </div>\
                <div class="image-editor-overlay-top"></div>\
                <div class="image-editor-overlay-left"></div>\
                <div class="image-editor-overlay-bottom"></div>\
                <div class="image-editor-overlay-right"></div>',
            link: function (scope, element) {
                scope.selection = angular.element(element[0].querySelector('.image-editor-selection'));
                scope.overlay = {
                    'top': angular.element(element[0].querySelector('.image-editor-overlay-top')),
                    'left': angular.element(element[0].querySelector('.image-editor-overlay-left')),
                    'bottom': angular.element(element[0].querySelector('.image-editor-overlay-bottom')),
                    'right': angular.element(element[0].querySelector('.image-editor-overlay-right'))
                };

                scope.onDrag = function(css) {
                    scope.setSelectionCss(css);
                };

                scope.onResize = function(css) {
                    scope.setSelectionCss(css);
                };

                scope.setSelectionCss = function(params) {
                    scope.selection.css(params);

                    var data = scope.getSelectionData();
                    // Top overlay should sit above selection and have all visible area width.
                    scope.overlay.top.css({
                        top: '0px',
                        left: '0px',
                        right: '0px',
                        height: data.top + 'px'
                    });
                    // Bottom overlay should be below selection and have all visible area width.
                    scope.overlay.bottom.css({
                        top: (data.top + data.height) + 'px',
                        left: '0px',
                        right: '0px',
                        bottom: '0px'
                    });
                    // Left overlay placed at the left of selection.
                    // Should have same height as selection to avoid overlap.
                    scope.overlay.left.css({
                        top: data.top + 'px',
                        left: '0px',
                        width: data.left + 'px',
                        height: data.height + 'px'
                    });
                    // Right overlay placed at the right of selection.
                    // Should have same height as selection to avoid overlap.
                    scope.overlay.right.css({
                        top: data.top + 'px',
                        left: (data.left + data.width)+'px',
                        right: '0px',
                        height: data.height + 'px'
                    });
                };

                scope.getSelectionData = function() {
                    return {
                        top: parseInt(scope.selection.css('top'), 10),
                        left: parseInt(scope.selection.css('left'), 10),
                        width: parseInt(scope.selection.css('width'), 10),
                        height: parseInt(scope.selection.css('height'), 10)
                    };
                };

                var emitSelectionChanged = function() {
                    scope.$emit(
                        'selectionChanged',
                        scope.editorId,
                        scope.getSelectionData()
                    );
                };

                var resetSelection = function() {
                    scope.setSelectionCss({
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        width: scope.width+'px',
                        height: scope.height+'px'
                    });

                    emitSelectionChanged();
                };

                scope.$on('updateSelection', function(e, editorId, params) {
                    if (editorId === scope.editorId) {
                        scope.setSelectionCss(params);
                    }
                });

                scope.$on('dragStop', function(e, event, ui) {
                    if (ui.element.attr('editor-id') === scope.editorId) {
                        emitSelectionChanged();
                    }
                });

                scope.$on('resizeStop', function(e, event, ui) {
                    if (ui.element.attr('editor-id') === scope.editorId) {
                        emitSelectionChanged();
                    }
                });

                resetSelection();
            }
        };
    });
}());


(function () {
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



/*jshint multistr: true */
(function () {
        angular.module('pmImageEditor')
        .factory('ImageHistoryFactory', function () {
            var ImageHistoryFactory = function(editor) {
                this.editor = editor;
                this.reset();
            };

            ImageHistoryFactory.prototype.reset = function() {
                this.items = [];
                this.historyIndex = -1;
            };

            ImageHistoryFactory.prototype.addItem = function() {
                this.items = this.items.slice(0, this.historyIndex+1);

                this.items.push({
                    top: this.editor.top,
                    left: this.editor.left,
                    selection: angular.copy(this.editor.selection),
                    wasCroppedForRotation: this.editor.wasCroppedForRotation,
                    isCropped: this.editor.isCropped,
                    hFlip: this.editor.hFlip,
                    vFlip: this.editor.vFlip,
                    rotation: this.editor.rotation,
                    width: this.editor.width,
                    height: this.editor.height
                });

                this.historyIndex = this.items.length - 1;
            };

            ImageHistoryFactory.prototype.canUndo = function() {
                return this.historyIndex > 0;
            };
            ImageHistoryFactory.prototype.canRedo = function() {
                return this.historyIndex < this.items.length - 1;
            };

            ImageHistoryFactory.prototype.redo = function() {
                if (this.canRedo()) {
                    this.applyHistory(1);
                }
            };

            ImageHistoryFactory.prototype.undo = function() {
                if (this.canUndo()) {
                    this.applyHistory(-1);
                }
            };

            ImageHistoryFactory.prototype.applyHistory = function(offset) {
                this.historyIndex += offset;

                angular.forEach(
                    this.current(),
                    function(val, key) {
                        this.editor[key] = angular.isObject(val) ? angular.copy(val) : val;
                    },
                    this
                );
            };

            ImageHistoryFactory.prototype.current = function() {
                return this.items[this.historyIndex];
            };

            return ImageHistoryFactory;
        })
        .factory('ImageEditorFactory', function (ImageHistoryFactory) {
            var ImageEditorFactory = function(options) {
                this.options = options;
                // Visible area width. Image should always fit
                // width or height (depends on rotation) to this area.
                this.visibleWidth = +(options.visibleWidth || 0);

                // Set default ratio to make resetTransformations works correct.
                this.ratio = 1;

                // Real image width and height.
                this.naturalWidth = 0;
                this.naturalHeight = 0;

                this.history = new ImageHistoryFactory(this);

                this.resetTransformations();
            };

            ImageEditorFactory.prototype.resetTransformations = function() {
                // Coordinates of top-left corner.
                this.top = 0;
                this.left = 0;

                // All the editor options.
                this.selection = {
                    top: 0,
                    left: 0,
                    width: this.options.selectionWidth || 0,
                    height: this.options.selectionHeight || 0
                };

                if (this.selection.width && this.selection.height) {
                    this.selection.ratio = this.selection.width/this.selection.height;
                }

                // This variable contains rotation value by mod 2,
                // for which latest crop was applyed.
                this.wasCroppedForRotation = 0;

                this.isCropped = false;
                this.hFlip = false;
                this.vFlip = false;

                // Rotation value in degrees from 0-360.
                this.rotation = 0;

                // Initially image should fit visible area.
                this.width = this.visibleWidth;
                this.height = this.width/this.ratio;

                this.history.reset();
                this.history.addItem();
            };

            /**
             * Return css based on curent image data.
             */
            ImageEditorFactory.prototype.css = function() {
                var transform = [];
                if (this.vFlip) {
                    transform.push('scaleX(-1)');
                }
                if (this.hFlip) {
                    transform.push('scaleY(-1)');
                }
                if (this.rotation) {
                    transform.push('rotate('+this.rotation+'deg)');
                }

                return {
                    position: 'absolute',
                    top: this.top+'px',
                    left: this.left+'px',
                    width: this.width+'px',
                    height: this.height+'px',
                    transform: transform.length ? transform.join(' ') : 'none'
                };
            };

            /**
             * Parent size depends on rotation and crop.
             * If area was cropped -- parent area should fit selection proportions.
             * Crop can be done for different rotation value, so use wasCroppedForRotation to solve this problem.
             *
             * Return width and height for parent area based on curent image data.
             */
            ImageEditorFactory.prototype.parentSize = function() {
                var r = this.isCropped ? this.selection.ratio : this.ratio;
                var w = this.visibleWidth;

                return {
                    width: w,
                    height: (this.rotation % 180 === this.wasCroppedForRotation) ? w/r : w*r
                };
            };

            /**
             * Return parent css based on curent image data.
             */
            ImageEditorFactory.prototype.parentCss = function() {
                var s = this.parentSize();

                return {
                    width: s.width+'px',
                    height: s.height+'px'
                };
            };

            /**
             * Return selection css based on curent image data.
             */
            ImageEditorFactory.prototype.selectionCss = function() {
                return {
                    top: this.selection.top+'px',
                    left: this.selection.left+'px',
                    width: this.selection.width+'px',
                    height: this.selection.height+'px'
                };
            };

            /**
             * Set all the required data for image with (naturalWidthxnaturalHeight) dimentions.
             *
             * @param int naturalWidth - image width.
             * @param int naturalHeight - image height.
             */
            ImageEditorFactory.prototype.initImageData = function(naturalWidth, naturalHeight) {
                // Update ratio.
                this.ratio = naturalWidth/naturalHeight;
                // And remember real image sizes.
                this.naturalWidth = naturalWidth;
                this.naturalHeight = naturalHeight;

                this.resetTransformations();
            };

            /**
             * Set all visible area width.
             * If image was initialized, reset all the transformations.
             *
             * @param int visibleWidth - visible area width.
             */
            ImageEditorFactory.prototype.setVisibleWidth = function(visibleWidth) {
                this.visibleWidth = parseInt(visibleWidth, 10);

                // If we updating visibleWidth for existing image we need to reset all the data
                // to avoid collisions.
                if (this.naturalWidth && this.naturalHeight) {
                    this.initImageData(this.naturalWidth, this.naturalHeight);
                }

                return this;
            };

            /**
             * Update selection dimensions to new width and height.
             * If width and height are correct -- reset all transformations to avoid positions issues.
             *
             * @param int width
             * @param int height
             */
            ImageEditorFactory.prototype.updateSelectionDimensions = function(width, height) {
                var parentSize = this.parentSize();
                if (width <= parentSize.width && height <= parentSize.height) {
                    this.options.selectionWidth = width;
                    this.options.selectionHeight = height;

                    this.selection.top = 0;
                    this.selection.left = 0;
                    this.selection.width = width;
                    this.selection.height = height;
                } else {
                    throw new RangeError('Incorrect selection size');
                }

                return this;
            };

            /**
             * Set selection data.
             *
             * @param Object{width: int, height: int} selection - selection parameters.
             */
            ImageEditorFactory.prototype.setSelection = function(selection) {
                this.selection = selection;
                this.selection.ratio = selection.width/selection.height;

                this.history.addItem();

                return this;
            };

            /**
             * Made crop based on selection position and current image data.
             */
            ImageEditorFactory.prototype.crop = function() {
                var s = this.selection;
                var r = this.visibleWidth/s.width;

                // Crop is actually making selection to visible area.
                // This can be made by scaling by r and shifting top-left corner.
                this.top = (this.top - s.top)*r;
                this.left = (this.left - s.left)*r;
                this.width = this.width*r;
                this.height = this.width/this.ratio;

                this.isCropped = true;
                this.wasCroppedForRotation = this.rotation % 180;

                var parentSize = this.parentSize();
                this.selection.top = 0;
                this.selection.left = 0;
                this.selection.width = parentSize.width;
                this.selection.height = parentSize.height;

                this.history.addItem();
            };

            /**
             * Made horizontal flip based on current image data.
             */
            ImageEditorFactory.prototype.horizontalFlip = function() {
                this.hFlip = !this.hFlip;

                var s = this.parentSize();
                // Formula became from:
                // 1. Moving center to point (0, y0 + h/2).
                // 2. Miror move of Y axe coordinates.
                // 3. Shift visible area back by Y axe.
                // 4. Moving center to point (0, -(y0 + h/2)).
                this.top = s.height - this.height - this.top;

                this.history.addItem();
            };

            /**
             * Made vertical flip based on current image data.
             */
            ImageEditorFactory.prototype.verticalFlip = function() {
                this.vFlip = !this.vFlip;

                var s = this.parentSize();
                // Formula became from:
                // 1. Moving center to point (x0 + w/2, 0).
                // 2. Miror move of X axe coordinates.
                // 3. Shift visible area back by X axe.
                // 4. Moving center to point (-(x0 + w/2), 0).
                this.left = s.width - this.width - this.left;

                this.history.addItem();
            };

            /**
             * Made image rotation flip based on current image data.
             * Direction can be 'cw' - rotate by clock-wise direction
             * and 'acw' - rotate by anti-clock-wise direction.
             *
             * @param 'cw'|'acw' direction - rotation direction.
             */
            ImageEditorFactory.prototype.rotate = function(direction) {
                //this.isCropped = false;
                // Update rotation value depends on direction.
                this.rotation += direction === 'cw' ? 90 : -90;
                // Make sure that rotation stays positive in range 0-360.
                this.rotation = (this.rotation + 360)%360;

                var s = this.parentSize();

                // Update width and height:
                var r = s.height/this.visibleWidth;
                // Height depends on difference between visible width and parent height.
                // Because this values are changing during rotation.
                this.height = this.height*r;
                // Keep proportions using image ratio.
                this.width = this.height*this.ratio;

                // Set of help variables.
                // Top and left coordinates should be multiplyed on the same value as height,
                // because it is scale transformation.
                var y0 = this.top*r,
                    x0 = this.left*r,
                    w1 = s.width,
                    h1 = s.height,
                    w = this.width,
                    h = this.height,
                    a = x0 + w/2,
                    b = y0 + h/2;

                // Depends on rotations direction different formulas are used.
                // We are care of top, left coordinates only.
                if (direction === 'cw') {
                    // If it is rotation by 90deg then:
                    // 1. Move center of coordinates to point (a, b).
                    // 2. Rotate by 90deg: (x', y') = (y, -x);
                    // 3. Move center of coordinates to point (-a, -b).
                    // 4. Rotate by -90deg: (x', y') = (-y, x).
                    this.left = x0 - a - b + w1;
                    this.top = y0 + a - b;
                } else {
                    // If it is rotation by -90deg then:
                    // 1. Move center of coordinates to point (a, b).
                    // 2. Rotate by -90deg: (x', y') = (-y, x);
                    // 3. Move center of coordinates to point (-a, -b).
                    // 4. Rotate by 90deg: (x', y') = (y, -x).
                    this.left = x0 - a + b;
                    this.top = y0 - a - b + h1;
                }

                this.selection.top = 0;
                this.selection.left = 0;

                this.history.addItem();
            };

            return ImageEditorFactory;
        })
        .controller('ImageEditorController', function($scope, ImageEditorFactory) {
            // Create new editor instance and generate uniq id to use in
            // image-selection directive (in case if few editors are present on the same page).
            $scope.editor = new ImageEditorFactory({
                selectionWidth: +$scope.selectionWidth,
                selectionHeight: +$scope.selectionHeight,
                visibleWidth: $scope.width
            });
            $scope.editorId = String(Math.random()).replace('0.', 'editor-');

            $scope.editor.setVisibleWidth($scope.width);

            // Based on emits from editor panel buttons take an actions.
            $scope.$on('editorButtonClick', function(event, args) {
                event.stopPropagation();

                switch (args.name) {
                    case 'crop':
                        $scope.editor.crop();
                        break;

                    case 'rotate-cw':
                        $scope.editor.rotate('cw');
                        break;

                    case 'rotate-acw':
                        $scope.editor.rotate('acw');
                        break;

                    case 'flip-v':
                        $scope.editor.verticalFlip();
                        break;

                    case 'flip-h':
                        $scope.editor.horizontalFlip();
                        break;

                    case 'undo':
                        $scope.editor.history.undo();
                        break;

                    case 'redo':
                        $scope.editor.history.redo();
                        break;
                }

                $scope.updateEditorCss();
            });

            $scope.updateEditorCss = function() {
                if ($scope.imageElement) {
                    $scope.imageElement.css($scope.editor.css());
                    $scope.imageElement.parent().css($scope.editor.parentCss());
                    $scope.$broadcast('updateSelection', $scope.editorId, $scope.editor.selectionCss());

                    $scope.updateHistoryButtons();

                    $scope.state = angular.copy($scope.editor.history.current());
                    // For some reason without this $apply() parent variable, that linked to "state"
                    // is not updated.
                    // But $apply is triggering an issue during init stage. So moved this to setTimeout.
                    setTimeout(function() {
                        $scope.$apply();
                    }, 0);
                }
            };

            $scope.updateHistoryButtons = function() {
                $scope.$broadcast(
                    $scope.editor.history.canUndo() ? 'enableButton': 'disableButton',
                    $scope.editorId,
                    'undo'
                );

                $scope.$broadcast(
                    $scope.editor.history.canRedo() ? 'enableButton': 'disableButton',
                    $scope.editorId,
                    'redo'
                );
            };

            // Image selection can be changed because of dragging/resize.
            // Inform factory if those channes are happens.
            $scope.$on('selectionChanged', function(event, editorId, args) {
                if (editorId === $scope.editorId) {
                    event.stopPropagation();

                    $scope.editor.setSelection(args);

                    $scope.updateEditorCss();
                }
            });

            $scope.$watch('width', function(value) {
                // If width was changed on-fly, update value.
                $scope.editor.setVisibleWidth(value);

                $scope.updateEditorCss();
            });

            var handleSelectionDimensions = function(value) {
                if (+value) {
                    $scope.editor.updateSelectionDimensions(+$scope.selectionWidth, +$scope.selectionHeight);
                    $scope.updateEditorCss();
                }
            };

            $scope.$watch('selectionWidth', handleSelectionDimensions);
            $scope.$watch('selectionHeight', handleSelectionDimensions);
        })
        .directive('imageEditor', function () {
            return {
                restrict: 'E',
                scope: {
                    image: '@',
                    width: '@',
                    selectionWidth: '@',
                    selectionHeight: '@',
                    state: '='
                },
                controller: 'ImageEditorController',
                template: '\
                    <div class="image-editor-canvas">\
                        <img ng-src="{{image}}" />\
                        <image-selection \
                            width="{{selectionWidth}}"\
                            height="{{selectionHeight}}"\
                            editor-id="{{editorId}}"\
                        ></image-selection>\
                    </div>\
                    <editor-panel editor-id="{{editorId}}"></editor-panel>',
                link: function (scope, element) {
                    // Remember image to use in controller.
                    scope.imageElement = element.find('img');

                    scope.imageElement[0].onload = function() {
                        scope.editor.initImageData(this.naturalWidth, this.naturalHeight);

                        scope.updateEditorCss();
                    };
                }
            };
        });
}());

}());