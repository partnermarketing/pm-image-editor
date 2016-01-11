(function () {
    'use strict';

    angular.module('pmImageEditor')
        .factory('ImageEditorFactory', function () {
            var ImageEditorFactory = function() {
                this.image = null;

                // Visible area width. Image should always fit width to this area.
                this.visibleWidth = 0;

                this.ratio = 1;
                this.rotation = 0;

                // Current width and height.
                this.width = 0;
                this.height = 0;

                // Coordinates of top-left corner.
                this.top = 0;
                this.left = 0;

                this.selection = null;
                this.isCropped = false;

                this.hFlip = false;
                this.vFlip = false;
            }

            /**
             * Return css based on curent image data.
             */
            ImageEditorFactory.prototype.css = function() {
                var transform = [];
                if (this.rotation) {
                    transform.push('rotate('+90*this.rotation+'deg)');
                }

                if (this.vFlip) {
                    transform.push('scaleX(-1)');
                }

                if (this.hFlip) {
                    transform.push('scaleY(-1)');
                }

                return {
                    position: 'absolute',
                    top: this.top+'px',
                    left: this.left+'px',
                    width: this.width+'px',
                    height: this.height+'px',
                    transform: transform.length ? transform.join(' ') : 'none'
                }
            }

            ImageEditorFactory.prototype.parentSize = function() {
                var r = this.isCropped ? this.selection.ratio : this.ratio;
                var w = this.visibleWidth;

                return {
                    width: w,
                    height: (this.rotation % 2 === 0 ? w/r : w*r)
                };
            }


            /**
             * Return parent css based on curent image data.
             */
            ImageEditorFactory.prototype.parentCss = function() {
                var s = this.parentSize();

                return {
                    width: s.width+'px',
                    height: s.height+'px'
                }
            }


            ImageEditorFactory.prototype.initImageData = function(naturalWidth, naturalHeight) {
                this.ratio = naturalWidth/naturalHeight;

                // Initially image should fit visible area.
                this.width = this.visibleWidth;
                this.height = this.width/this.ratio;

                // Top-left corner should be at top-left corner.
                this.top = 0;
                this.left = 0;

                this.isCropped = false;
            }

            ImageEditorFactory.prototype.setVisibleWidth = function(visibleWidth) {
                this.visibleWidth = parseInt(visibleWidth, 10);

                return this;
            }

            ImageEditorFactory.prototype.setSelection = function(selection) {
                this.selection = selection;
                this.selection.ratio = selection.width/selection.height;

                console.log(this.selection);

                return this;
            }

            ImageEditorFactory.prototype.crop = function() {
                var s = this.selection;
                var r = this.visibleWidth/s.width;

                this.top = (this.top - s.top)*r;
                this.left = (this.left - s.left)*r;
                this.width = this.width*r;
                this.height = this.width/this.ratio;

                this.isCropped = true;
            }

            ImageEditorFactory.prototype.horizontalFlip = function() {
                this.hFlip = !this.hFlip;

                var s = this.parentSize();

                this.top = s.height - this.height - this.top; 
            }

            ImageEditorFactory.prototype.verticalFlip = function() {
                this.vFlip = !this.vFlip;

                var s = this.parentSize();

                this.left = s.width - this.width - this.left; 
            }


            ImageEditorFactory.prototype.rotate = function(dir) {
                var ps = this.parentSize();

                this.rotation += dir === 'cw' ? 1 : -1;

                var d0 = (this.width - this.height)/2;

                var r = this.visibleWidth/ps.height;
                this.height = this.height*r;
                this.width = this.height*this.ratio;


                //if (this.rotation%2) {
                    var d = (this.width - this.height)/2;
                    this.left -= this.rotation%2 ? d : -d0; 
                    this.top += this.rotation%2 ? d : -d0; 
                //}

console.log(this.rotation%2, r);



                // this._image.css({
                //     //'transform-origin': '0 0',
                //     'margin-left': (-d)+'px',
                //     'margin-top': (d)+'px',
                //     'width': (pw*r)+'px',
                //     'height': (ph*r)+'px'
                // });
            }



            return ImageEditorFactory;
        })
        .controller('ImageEditorController', function($scope, ImageEditorFactory) {
            $scope.editor = new ImageEditorFactory();
        })
        .directive('imageEditor', ['$timeout', function ($timeout) {
            return {
                restrict: 'E',
                scope: {
                    image: '=',
                    width: '@',
                    selectionWidth: '@',
                    selectionHeight: '@'
                },
                controller: 'ImageEditorController',
                template: '\
                    <div class="image-editor-canvas">\
                        <img src="{{image}}" />\
                        <image-selection width="{{selectionWidth}}" height="{{selectionHeight}}" draggable resizable></image-selection>\
                    </div>\
                    <editor-panel></editor-panel>',
                link: function (scope, element) {
                    var image = element.find('img');

                    // Set initial selection.
                    scope.editor.setSelection({
                        top: 0,
                        left: 0,
                        width: scope.selectionWidth,
                        height: scope.selectionHeight
                    });

                    scope.editor.setVisibleWidth(scope.width);

                    image[0].onload = function() {
                        scope.editor.initImageData(this.naturalWidth, this.naturalHeight);
                        image.css(scope.editor.css());
                        image.parent().css(scope.editor.parentCss());
                    }

                    scope.$on('editorButtonClick', function(event, args) {
                        event.stopPropagation();

                        console.log(args.name);

                        switch (args.name) {
                            case 'crop':
                                scope.editor.crop();
                                break;

                            case 'rotate-cw':
                                scope.editor.rotate('cw');
                                break;

                            case 'rotate-acw':
                                scope.editor.rotate('acw');
                                break;

                            case 'flip-v':
                                scope.editor.verticalFlip();
                                break;

                            case 'flip-h':
                                scope.editor.horizontalFlip();
                                break;
                        }

                        console.log(scope.editor.css());

                        image.css(scope.editor.css());
                        image.parent().css(scope.editor.parentCss());
                    });

                    scope.$on('selectionChanged', function(event, args) {
                        event.stopPropagation();

                        scope.editor.setSelection(args);
                    });

                    scope.$watch('image', function(value) {
                        //scope.editor.setImage(element.find('img'));
                    });
                }
            };
        }]);
}());