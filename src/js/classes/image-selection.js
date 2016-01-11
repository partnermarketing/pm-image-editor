(function () {
    'use strict';

    angular.module('pmImageEditor').directive('imageSelection', function () {
        return {
            restrict: 'E',
            scope: {
                width: '@',
                height: '@'
            },
            link: function (scope, element) {
                element.css({
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: scope.width+'px',
                    height: scope.height+'px'
                });

                var emitSelectionChanged = function() {
                    scope.$emit('selectionChanged', {
                        top: parseInt(element.css('top'), 10),
                        left: parseInt(element.css('left'), 10),
                        width: parseInt(element.css('width'), 10),
                        height: parseInt(element.css('height'), 10)
                    });
                };

                scope.$on('dragStop', function(e, event, ui) {
                    if (ui.element === element) {
                        emitSelectionChanged();
                    }
                });

                scope.$on('resizeStop', function(e, event, ui) {
                    if (ui.element === element) {
                        emitSelectionChanged();
                    }
                });                

                emitSelectionChanged();
            }
        };
    });
}());