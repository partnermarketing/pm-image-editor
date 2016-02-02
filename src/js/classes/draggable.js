(function () {
  'use strict';

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
