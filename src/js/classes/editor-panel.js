(function () {
    'use strict';

    angular.module('pmImageEditor').directive('editorPanel', function () {
        return {
            restrict: 'E',
            scope: {
                editorId: '@'
            },
            link: function (scope, element) {
                var buttonNames = 'crop,rotate-cw,rotate-acw,flip-h,flip-v,undo,redo';
                var buttons = {};
                buttonNames.split(',').forEach(function(name){
                    buttons[name] = angular
                        .element('<span class="image-editor-'+name+'" />')
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
