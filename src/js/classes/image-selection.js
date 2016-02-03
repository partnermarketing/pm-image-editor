/*jshint multistr: true */
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
