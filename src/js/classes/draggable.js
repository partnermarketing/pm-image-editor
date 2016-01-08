(function () {
  angular.module('pmImageEditor').
    controller('DraggableController', function($scope, $document, $rootScope) {
      // Start X and Y position of the draggable element.
      $scope.startX = 0;
      $scope.startY = 0;

      // Coordinates of the top-left corner of draggable element.
      $scope.x = 0;
      $scope.y = 0;

      $scope.draggableUiParams = function() {
        return {
          element: $scope.element,
          position: {
            top: $scope.y,
            left:  $scope.x
          }
        };
      }

      $scope.mousedown = function(event) {
        // Prevent default dragging of selected content.
        event.preventDefault();

        $scope.x = parseInt($scope.element.css('left'), 10) || 0; 
        $scope.y = parseInt($scope.element.css('top'), 10) || 0; 


        // Remember start position for top-left corner of the element.
        $scope.startX = event.screenX - $scope.x;
        $scope.startY = event.screenY - $scope.y;



        // Bind events to track drag.
        $document.on('mousemove', $scope.mousemove);
        $document.on('mouseup', $scope.mouseup);

        if (angular.isFunction($scope.dragStart)) {
          $scope.dragStart(event, $scope.draggableUiParams());
        }
      };

      $scope.mousemove = function(event) {
        var elementWidth = parseInt($scope.element.css('width'), 10) || $scope.element[0].clientWidth,
            elementHeight = parseInt($scope.element.css('height'), 10) || $scope.element[0].clientHeight,
            parentWidth = $scope.parentElement[0].clientWidth,
            parentHeight = $scope.parentElement[0].clientHeight;

          // Calculate new top-left position and check that it stays positive.
          $scope.y = Math.max(event.screenY - $scope.startY, 0);
          $scope.x = Math.max(event.screenX - $scope.startX, 0);

          // Doublecheck that new x and y is not go out from parent borders.
          if ($scope.x + elementWidth > parentWidth) {
            $scope.x = parentWidth - elementWidth;
          }

          if ($scope.y + elementHeight > parentHeight) {
            $scope.y = parentHeight - elementHeight;
          }          

          // Set new element position.
          $scope.element.css({
            top: $scope.y + 'px',
            left:  $scope.x + 'px'
          });
        };

        $scope.mouseup = function(event) {
          // Unbind events that track drag.
          $document.unbind('mousemove', $scope.mousemove);
          $document.unbind('mouseup', $scope.mouseup);

          if (angular.isFunction($scope.dragStop)) {
            $scope.dragStop(event, $scope.draggableUiParams());
          }          
          $rootScope.$broadcast('dragStop', event, $scope.draggableUiParams());
        };
    }).
    directive('draggable', function($document) {
      return {
        restrict: 'A',
        controller: 'DraggableController',
        link: function(scope, element, attr) {
          scope.element = element;
          scope.parentElement = element.parent();

          element.css({ position: 'absolute' });

          element.on('mousedown', function(event) {
            scope.mousedown(event);
          });
        }
      };
    });
}());

