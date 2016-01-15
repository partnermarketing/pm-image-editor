/*jshint multistr: true */
(function () {
    'use strict';

    angular.module('pmImageEditor')
        .factory('ImageEditorFactory', function () {
            var ImageEditorFactory = function() {
                // Visible area width. Image should always fit
                // width or height (depends on rotation) to this area.
                this.visibleWidth = 0;

                // Set default ratio to make resetTransformations works correct.
                this.ratio = 1;

                // Real image width and height.
                this.naturalWidth = 0;
                this.naturalHeight = 0;

                this.resetTransformations();
            };

            ImageEditorFactory.prototype.resetTransformations = function() {
                // Coordinates of top-left corner.
                this.top = 0;
                this.left = 0;

                // All the editor options.
                this.selection = null;

                // This variable contains rotation value by mod 2,
                // for which latest crop was applyed.
                this.wasCroppedForRotation = 0;

                this.isCropped = false;
                this.hFlip = false;
                this.vFlip = false;

                // Rotation value. Can be one of the following values:
                //   0 - 0deg rotation,
                //   1 - 90deg rotation,
                //   2 - 180deg rotation,
                //   3 - 270deg rotation.
                this.rotation = 0;

                // Initially image should fit visible area.
                this.width = this.visibleWidth;
                this.height = this.width/this.ratio;
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
                    transform.push('rotate('+90*this.rotation+'deg)');
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
                    height: (this.rotation % 2 === this.wasCroppedForRotation) ? w/r : w*r
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
             * Set selection data.
             *
             * @param Object{width: int, height: int} selection - selection parameters.
             */
            ImageEditorFactory.prototype.setSelection = function(selection) {
                this.selection = selection;
                this.selection.ratio = selection.width/selection.height;

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
                this.wasCroppedForRotation = this.rotation % 2;
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
                this.rotation += direction === 'cw' ? 1 : -1;
                // Make sure that rotation stays positive in range 0-3.
                this.rotation = (this.rotation + 4)%4;

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
            };

            return ImageEditorFactory;
        })
        .controller('ImageEditorController', function($scope, ImageEditorFactory) {
            // Create new editor instance and generate uniq id to use in
            // image-selection directive (in case if few editors are present on the same page).
            $scope.editor = new ImageEditorFactory();
            $scope.editorId = String(Math.random()).replace('0.', 'editor-');

            // Set initial selection.
            $scope.editor.setSelection({
                top: 0,
                left: 0,
                width: $scope.selectionWidth,
                height: $scope.selectionHeight
            });

            $scope.editor.setVisibleWidth($scope.width);

            // Based on emits from editor panel buttons take an actions.
            $scope.$on('editorButtonClick', function(event, args) {
                event.stopPropagation();

                switch (args.name) {
                    case 'crop':
                        $scope.editor.crop();
                        $scope.$broadcast('imageCrop', $scope.editorId, $scope.editor.parentCss());
                        break;

                    case 'rotate-cw':
                        $scope.editor.rotate('cw');
                        $scope.$broadcast('imageRotate', $scope.editorId);
                        break;

                    case 'rotate-acw':
                        $scope.editor.rotate('acw');
                        $scope.$broadcast('imageRotate', $scope.editorId);
                        break;

                    case 'flip-v':
                        $scope.editor.verticalFlip();
                        break;

                    case 'flip-h':
                        $scope.editor.horizontalFlip();
                        break;
                }

                $scope.imageElement.css($scope.editor.css());
                $scope.imageElement.parent().css($scope.editor.parentCss());
            });
            
            // Image selection can be changed because of dragging/resize.
            // Inform factory if those channes are happens.
            $scope.$on('selectionChanged', function(event, editorId, args) {
                if (editorId === $scope.editorId) {
                    event.stopPropagation();

                    $scope.editor.setSelection(args);
                }
            });

            $scope.$watch('width', function(value) {
                // If width was changed on-fly, update value.
                $scope.editor.setVisibleWidth(value);

                // Reset selection to avoid wrong selection position.
                // For example outside of visible area.
                $scope.$broadcast('resetSelection', $scope.editorId);

                // And update image and parent css.
                $scope.imageElement.css($scope.editor.css());
                $scope.imageElement.parent().css($scope.editor.parentCss());
            });
        })
        .directive('imageEditor', function () {
            return {
                restrict: 'E',
                scope: {
                    image: '@',
                    width: '@',
                    selectionWidth: '@',
                    selectionHeight: '@'
                },
                controller: 'ImageEditorController',
                template: '\
                    <div class="image-editor-canvas">\
                        <img ng-src="{{image}}" />\
                        <image-selection \
                            width="{{selectionWidth}}"\
                            height="{{selectionHeight}}"\
                            editor-id="{{editorId}}"\
                            draggable\
                            resizable\
                        ></image-selection>\
                    </div>\
                    <editor-panel></editor-panel>',
                link: function (scope, element) {
                    // Remember image to use in controller.
                    scope.imageElement = element.find('img');

                    scope.imageElement[0].onload = function() {
                        scope.editor.initImageData(this.naturalWidth, this.naturalHeight);
                        scope.imageElement.css(scope.editor.css());
                        scope.imageElement.parent().css(scope.editor.parentCss());
                    };
                }
            };
        });
}());