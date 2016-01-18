(function () {
    'use strict';

    angular.module('pmImageEditor').directive('imageSelection', function () {
        return {
            restrict: 'E',
            scope: {
                editorId: '@',
                width: '@',
                height: '@'
            },
            link: function (scope, element) {
                var emitSelectionChanged = function() {
                    scope.$emit(
                        'selectionChanged',
                        scope.editorId,
                        {
                            top: parseInt(element.css('top'), 10),
                            left: parseInt(element.css('left'), 10),
                            width: parseInt(element.css('width'), 10),
                            height: parseInt(element.css('height'), 10)
                        }
                    );
                };

                var resetSelection = function() {
                    element.css({
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        width: scope.width+'px',
                        height: scope.height+'px'
                    });

                    emitSelectionChanged();                    
                };

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

                scope.$on('imageRotate', function(e, editorId) {
                    if (editorId === scope.editorId) {
                        element.css({
                            'top': '0px',
                            'left': '0px'
                        });

                        emitSelectionChanged();
                    }
                });

                scope.$on('imageCrop', function(e, editorId, params) {
                    if (editorId === scope.editorId) {
                        element.css({
                            'top': '0px',
                            'left': '0px',
                            'width': params.width,
                            'height': params.height
                        });

                        emitSelectionChanged();
                    }
                });

                scope.$on('resetSelection', function(e, editorId) {
                    if (editorId === scope.editorId) {
                        resetSelection();
                    }
                });

                resetSelection();                
            }
        };
    });
}());