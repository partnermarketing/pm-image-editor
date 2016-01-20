describe('pmImageEditor', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('factory', function() {
        var factory;

        beforeEach(inject(function (ImageEditorFactory) {
            factory = new ImageEditorFactory();
        }));

        it('should set initial values', function() {
            expect(factory.visibleWidth).toBe(0);
            expect(factory.ratio).toBe(1);;

            expect(factory.naturalWidth).toBe(0);
            expect(factory.naturalHeight).toBe(0);

            expect(factory.top).toBe(0);
            expect(factory.left).toBe(0);
            expect(factory.selection).toBe(null);
            expect(factory.wasCroppedForRotation).toBe(0);
            expect(factory.isCropped).toBe(false);
            expect(factory.hFlip).toBe(false);
            expect(factory.vFlip).toBe(false);
            expect(factory.rotation).toBe(0);
            expect(factory.width).toBe(0);
            expect(factory.height).toBe(0);
        });

        it('should allow to reset transformations', function() {
            factory.top = 1;
            factory.left = 1;
            factory.selection = {};
            factory.wasCroppedForRotation = 1;
            factory.isCropped = true;
            factory.hFlip = true;
            factory.vFlip = true;
            factory.rotation = 1;
            factory.width = 1;
            factory.height = 1;

            factory.resetTransformations();

            expect(factory.top).toBe(0);
            expect(factory.left).toBe(0);
            expect(factory.selection).toBe(null);
            expect(factory.wasCroppedForRotation).toBe(0);
            expect(factory.isCropped).toBe(false);
            expect(factory.hFlip).toBe(false);
            expect(factory.vFlip).toBe(false);
            expect(factory.rotation).toBe(0);
            expect(factory.width).toBe(0);
            expect(factory.height).toBe(0);             
        });

        describe('should return correct css', function() {
            beforeEach(function() {
                factory.top = 10;
                factory.left = 20;
                factory.width = 300;
                factory.height = 150;
            });

            it('with no transformations', function() {
                expect(factory.css()).toEqual({
                    position: 'absolute',
                    top: '10px',
                    left: '20px',
                    width: '300px',
                    height: '150px',
                    transform: 'none'
                });
            });

            it('with rotation', function() {
                factory.rotation = 1;

                var css = {
                    position: 'absolute',
                    top: '10px',
                    left: '20px',
                    width: '300px',
                    height: '150px',
                    transform: 'rotate(90deg)'
                }; 

                expect(factory.css()).toEqual(css);

                factory.rotation = 2;
                css.transform = 'rotate(180deg)';
                expect(factory.css()).toEqual(css);

                factory.rotation = 3;
                css.transform = 'rotate(270deg)';
                expect(factory.css()).toEqual(css);
            });

            it('with vertical flip', function() {
                factory.vFlip = true;

                var css = {
                    position: 'absolute',
                    top: '10px',
                    left: '20px',
                    width: '300px',
                    height: '150px',
                    transform: 'scaleX(-1)'
                }; 

                expect(factory.css()).toEqual(css);

                factory.rotation = 1;
                css.transform = 'scaleX(-1) rotate(90deg)'
                expect(factory.css()).toEqual(css);

                factory.rotation = 2;
                css.transform = 'scaleX(-1) rotate(180deg)';
                expect(factory.css()).toEqual(css);

                factory.rotation = 3;
                css.transform = 'scaleX(-1) rotate(270deg)';
                expect(factory.css()).toEqual(css);
            });

            it('with horizontal flip', function() {
                factory.hFlip = true;

                var css = {
                    position: 'absolute',
                    top: '10px',
                    left: '20px',
                    width: '300px',
                    height: '150px',
                    transform: 'scaleY(-1)'
                }; 

                expect(factory.css()).toEqual(css);

                factory.rotation = 1;
                css.transform = 'scaleY(-1) rotate(90deg)'
                expect(factory.css()).toEqual(css);

                factory.rotation = 2;
                css.transform = 'scaleY(-1) rotate(180deg)';
                expect(factory.css()).toEqual(css);

                factory.rotation = 3;
                css.transform = 'scaleY(-1) rotate(270deg)';
                expect(factory.css()).toEqual(css);
            });            
        });

        describe('should return correct parent size', function() {
            beforeEach(function() {
                factory.visibleWidth = 300;
                factory.selection = {ratio: 2};
                factory.ratio = 3;
            });

            it('initially', function() {
                expect(factory.parentSize()).toEqual({
                    width: 300,
                    height: 100
                });
            });

            it('with cropped image', function() {
                factory.isCropped = true;
                expect(factory.parentSize()).toEqual({
                    width: 300,
                    height: 150
                });
            });

            it('with crop on rotated image', function() {
                factory.wasCroppedForRotation = 1;
                expect(factory.parentSize()).toEqual({
                    width: 300,
                    height: 900
                });
            });

            it('with croping on rotated image', function() {
                factory.isCropped = true;
                factory.wasCroppedForRotation = 1;
                expect(factory.parentSize()).toEqual({
                    width: 300,
                    height: 600
                });
            });
        });

        it('should return correct parent css', function() {
            spyOn(factory, 'parentSize').and.returnValue({
                width: 111,
                height: 222
            });

            expect(factory.parentCss()).toEqual({
                width: '111px',
                height: '222px'
            });
            expect(factory.parentSize).toHaveBeenCalled();
        });

        it('should allow to init data for newly loaded image', function() {
            spyOn(factory, 'resetTransformations').and.callThrough();

            factory.visibleWidth = 400;

            factory.initImageData(200, 100);

            expect(factory.ratio).toBe(2);
            expect(factory.naturalWidth).toBe(200);
            expect(factory.naturalHeight).toBe(100);
            expect(factory.resetTransformations).toHaveBeenCalled();
            expect(factory.width).toBe(400);
            expect(factory.height).toBe(200);
        });

        it('should allow to set visible width', function() {
            spyOn(factory, 'initImageData');

            factory.setVisibleWidth(200);

            expect(factory.visibleWidth).toBe(200);
            expect(factory.initImageData).not.toHaveBeenCalled();
        });

        it('should allow to update visible width for loaded image', function() {
            spyOn(factory, 'initImageData');

            factory.naturalWidth = 200;
            factory.naturalHeight = 100;

            factory.setVisibleWidth(200);

            expect(factory.visibleWidth).toBe(200);
            expect(factory.initImageData).toHaveBeenCalledWith(200, 100);
        });

        it('should allow to set selection', function() {
            factory.setSelection({ width: 200, height: 100 });

            expect(factory.selection).toEqual({
                width: 200,
                height: 100,
                ratio: 2
            });
        });

        it('should allow to crop an image', function() {
            factory.visibleWidth = 200;
            factory.setSelection({ top: 10, left: 20, width: 100, height: 50 });

            factory.top = -30;
            factory.left = -40;
            factory.width = 300;
            factory.height = 400;
            factory.ratio = 0.75;

            factory.crop();

            expect(factory.top).toBe(-80);
            expect(factory.left).toBe(-120);
            expect(factory.width).toBe(600);
            expect(factory.height).toBe(800);
            expect(factory.isCropped).toBe(true);
            expect(factory.wasCroppedForRotation).toBe(0);

            factory.rotation = 1;
            factory.crop();
            expect(factory.wasCroppedForRotation).toBe(1);

            factory.rotation = 2;
            factory.crop();
            expect(factory.wasCroppedForRotation).toBe(0);
        });

        describe('should allow to horizontal flip an image', function() {
            beforeEach(function() {
                factory.top = 0;
                factory.visibleWidth = 200;
                factory.ratio = 2;
                factory.height = 100;
            });

            it('(non cropped)', function() {
                factory.horizontalFlip();

                // Top should be unchanged.
                expect(factory.top).toBe(0);
            });

            it('(cropped)', function() {
                factory.top = -20;
                factory.height = 200;

                factory.horizontalFlip();

                expect(factory.top).toBe(-80);

                // Next flip should set top to previous position.
                factory.horizontalFlip();
                expect(factory.top).toBe(-20);
            });
        });

        describe('should allow to vertical flip an image', function() {
            beforeEach(function() {
                factory.left = 0;
                factory.visibleWidth = 200;
                factory.ratio = 2;
                factory.width = 200;
            });

            it('(non cropped)', function() {
                factory.verticalFlip();

                // Left should be unchanged.
                expect(factory.left).toBe(0);
            });

            it('(cropped)', function() {
                factory.left = -70;
                factory.width = 300;

                factory.verticalFlip();

                expect(factory.left).toBe(-30);

                // Next flip should set left to previous position.
                factory.verticalFlip();
                expect(factory.left).toBe(-70);
            });
        });

        describe('should allow to rotate an image', function() {
            beforeEach(function() {
                factory.top = -100;
                factory.left = -200;
                factory.visibleWidth = 150;
                factory.ratio = 1.5;
                factory.width = 600;
                factory.height = 400;
            });

            it('and keep rotation positive int from 0 to 3 rotating clock-wise', function() {
                expect(factory.rotation).toBe(0);
                factory.rotate('cw');
                expect(factory.rotation).toBe(1);
                factory.rotate('cw');
                expect(factory.rotation).toBe(2);
                factory.rotate('cw');
                expect(factory.rotation).toBe(3);
                factory.rotate('cw');
                expect(factory.rotation).toBe(0);
            });

            it('and keep rotation positive int from 0 to 3 rotating anti-clock-wise', function() {
                expect(factory.rotation).toBe(0);
                factory.rotate('acw');
                expect(factory.rotation).toBe(3);
                factory.rotate('acw');
                expect(factory.rotation).toBe(2);
                factory.rotate('acw');
                expect(factory.rotation).toBe(1);
                factory.rotate('acw');
                expect(factory.rotation).toBe(0);
            });

            it('correctly by clock-wise', function() {
                expect(factory.parentSize()).toEqual({width: 150, height: 100});

                factory.rotate('cw');

                // Parent sizes should be changed because height became width.
                expect(factory.parentSize()).toEqual({width: 150, height: 225})

                expect(factory.width).toBe(900);
                expect(factory.height).toBe(600);
                expect(factory.top).toBe(-150);
                expect(factory.left).toBe(-450);

                factory.rotate('cw');
                factory.rotate('cw');
                factory.rotate('cw');

                // Rotating four times should return to ititial position.
                expect(factory.parentSize()).toEqual({width: 150, height: 100})

                expect(factory.width).toBe(600);
                expect(factory.height).toBe(400);
                expect(factory.top).toBe(-100);
                expect(factory.left).toBe(-200);
            });

            it('correctly by anti-clock-wise', function() {
                expect(factory.parentSize()).toEqual({width: 150, height: 100});

                factory.rotate('acw');

                // Parent sizes should be changed because height became width.
                expect(factory.parentSize()).toEqual({width: 150, height: 225})

                expect(factory.width).toBe(900);
                expect(factory.height).toBe(600);
                expect(factory.top).toBe(-225);
                expect(factory.left).toBe(-300);

                factory.rotate('acw');
                factory.rotate('acw');
                factory.rotate('acw');

                // Rotating four times should return to ititial position.
                expect(factory.parentSize()).toEqual({width: 150, height: 100})

                expect(factory.width).toBe(600);
                expect(factory.height).toBe(400);
                expect(factory.top).toBe(-100);
                expect(factory.left).toBe(-200);
            });            
        });
    });

    describe('controller', function() {
        var ctrl,
            scope,
            createCtrl;

        beforeEach(inject(function ($controller, $rootScope, ImageEditorFactory) {
            scope = $rootScope.$new();
            ctrl = $controller;

            scope.selectionWidth = 200;
            scope.selectionHeight = 100;
            scope.width = 400;

            createCtrl = function() {
                ctrl('ImageEditorController', {
                    '$scope': scope,
                    'ImageEditorFactory': ImageEditorFactory
                });
            };
        }));

        it('should set initial values', function() {
            createCtrl();

            expect(scope.editor).toBeDefined();
            expect(scope.editorId).toBeDefined();

            expect(scope.editor.selection).toEqual({
                top: 0,
                left: 0,
                width: 200,
                height: 100,
                ratio: 2
            });
            expect(scope.editor.visibleWidth).toBe(400);
        });

        describe('should catch editorButtonClick events', function() {
            beforeEach(function() {
                createCtrl();
                scope.imageElement = {
                    css: jasmine.createSpy('css'),
                    parent: jasmine.createSpy('parent').and.returnValue({
                            css: jasmine.createSpy('parentCss')
                    })
                };
            });

            it('for crop and call editor crop', function() {
                spyOn(scope.editor, 'crop');
                spyOn(scope, '$broadcast');

                scope.$emit('editorButtonClick', {name: 'crop'});

                expect(scope.editor.crop).toHaveBeenCalled();
                expect(scope.$broadcast).toHaveBeenCalledWith(
                    'imageCrop',
                    scope.editorId,
                    scope.editor.parentCss()
                );
                expect(scope.imageElement.css).toHaveBeenCalledWith(scope.editor.css());
                expect(scope.imageElement.parent().css).toHaveBeenCalledWith(scope.editor.parentCss());
            });

            it('for rotate-cw and call editor rotate', function() {
                spyOn(scope.editor, 'rotate');
                spyOn(scope, '$broadcast');

                scope.$emit('editorButtonClick', {name: 'rotate-cw'});

                expect(scope.editor.rotate).toHaveBeenCalledWith('cw');
                expect(scope.$broadcast).toHaveBeenCalledWith(
                    'imageRotate',
                    scope.editorId
                );
                expect(scope.imageElement.css).toHaveBeenCalledWith(scope.editor.css());
                expect(scope.imageElement.parent().css).toHaveBeenCalledWith(scope.editor.parentCss());
            });

            it('for rotate-acw and call editor rotate', function() {
                spyOn(scope.editor, 'rotate');
                spyOn(scope, '$broadcast');

                scope.$emit('editorButtonClick', {name: 'rotate-acw'});

                expect(scope.editor.rotate).toHaveBeenCalledWith('acw');
                expect(scope.$broadcast).toHaveBeenCalledWith(
                    'imageRotate',
                    scope.editorId
                );
                expect(scope.imageElement.css).toHaveBeenCalledWith(scope.editor.css());
                expect(scope.imageElement.parent().css).toHaveBeenCalledWith(scope.editor.parentCss());
            });

            it('for flip-v and call editor verticalFlip', function() {
                spyOn(scope.editor, 'verticalFlip');

                scope.$emit('editorButtonClick', {name: 'flip-v'});

                expect(scope.editor.verticalFlip).toHaveBeenCalled();
                expect(scope.imageElement.css).toHaveBeenCalledWith(scope.editor.css());
                expect(scope.imageElement.parent().css).toHaveBeenCalledWith(scope.editor.parentCss());
            });

            it('for flip-h and call editor horizontalFlip', function() {
                spyOn(scope.editor, 'horizontalFlip');

                scope.$emit('editorButtonClick', {name: 'flip-h'});

                expect(scope.editor.horizontalFlip).toHaveBeenCalled();
                expect(scope.imageElement.css).toHaveBeenCalledWith(scope.editor.css());
                expect(scope.imageElement.parent().css).toHaveBeenCalledWith(scope.editor.parentCss());
            });            
        });

        describe('should catch selectionChanged events', function() {
            beforeEach(function() {
                createCtrl();

                spyOn(scope.editor, 'setSelection');
            });

            it('and call update selection if editorId is match', function() {
                scope.$emit('selectionChanged', scope.editorId, {width: 100, height: 50, top: 1, left: 2});
                expect(scope.editor.setSelection).toHaveBeenCalledWith({width: 100, height: 50, top: 1, left: 2});
            });

            it('and skip update selection if editorId is not match', function() {
                scope.$emit('selectionChanged', 'other', {width: 100, height: 50, top: 1, left: 2});
                expect(scope.editor.setSelection).not.toHaveBeenCalled();
            });
        });

        it('should allow to update visible width on-fly', function() {
            createCtrl();

            scope.imageElement = {
                css: jasmine.createSpy('css'),
                parent: jasmine.createSpy('parent').and.returnValue({
                        css: jasmine.createSpy('parentCss')
                })
            };
            spyOn(scope.editor, 'setVisibleWidth');
            spyOn(scope, '$broadcast');

            scope.width = 500;
            scope.$digest();

            expect(scope.editor.setVisibleWidth).toHaveBeenCalledWith(500);
            expect(scope.$broadcast).toHaveBeenCalledWith('resetSelection', scope.editorId);
            expect(scope.imageElement.css).toHaveBeenCalledWith(scope.editor.css());
            expect(scope.imageElement.parent().css).toHaveBeenCalledWith(scope.editor.parentCss());
        });
    });

    describe('directive', function() {
        var element, scope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = angular.element('<image-editor image="" width="200" selectionWidth="10" selectionHeight="5"></image-editor>');

            $compile(element)(scope);
            scope.$digest();

            scope = scope.$$childHead;
        }));

        it('should set imageElement to scope', function() {
            expect(scope.imageElement).toBeDefined();
        });

        it('should append required elements', function() {
            expect(element.html()).toContain('image-editor-canvas');
            expect(element.html()).toContain('<img');
            expect(element.html()).toContain('<image-selection');
            expect(element.html()).toContain('<editor-panel>');
        });


        it('should init image data when image loaded', function() {
            spyOn(scope.editor, 'initImageData');
            spyOn(scope.imageElement, 'css');
            spyOn(scope.imageElement, 'parent').and.returnValue({
                css: jasmine.createSpy('parentCss')
            });

            element.find('img')[0].onload();

            expect(scope.editor.initImageData).toHaveBeenCalled();
            expect(scope.imageElement.css).toHaveBeenCalled();
            expect(scope.imageElement.parent().css).toHaveBeenCalled();
        });
    });
});