/*jshint multistr: true */
(function () {
    'use strict';

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
