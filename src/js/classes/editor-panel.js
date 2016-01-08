(function () {
    'use strict';

    angular.module('pmImageEditor').directive('editorPanel', function () {
        return {
            restrict: 'E',
            scope: {
            },
            link: function (scope, element) {
                var buttons = 'crop,rotate-cw,rotate-acw';
                buttons.split(',').forEach(function(name){
                    var button = angular.element('<span class="image-editor-'+name+'" />');
                    button.on('click', function() {
                        scope.$emit('editorButtonClick', {name: name});
                    });

                    element.append(button);
                });
            }
        };
    });
}());