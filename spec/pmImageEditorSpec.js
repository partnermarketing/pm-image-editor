describe('pmImageEditor', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('ImageHistoryFactory should', function() {
        var historyFactory,
            editorFactory;

        beforeEach(inject(function (ImageEditorFactory, ImageHistoryFactory) {
            editorFactory = new ImageEditorFactory({
                selectionWidth: 150,
                selectionHeight: 75,
                visibleWidth: 300
            });

            historyFactory = new ImageHistoryFactory(editorFactory);
        }));

        it('set initial values', function() {
            expect(historyFactory.editor).toEqual(editorFactory);
            expect(historyFactory.items).toEqual([]);
            expect(historyFactory.historyIndex).toBe(-1);
        });

        it('allow to reset values', function() {
            historyFactory.items = [1];
            historyFactory.historyIndex = 1

            historyFactory.reset();

            expect(historyFactory.items).toEqual([]);
            expect(historyFactory.historyIndex).toBe(-1);
        });

        it('allow to insert item', function() {
            historyFactory.addItem();

            expect(historyFactory.items.length).toBe(1);
            expect(historyFactory.historyIndex).toBe(0);
        });

        it('remove rest of history during insert item', function() {
            historyFactory.items = [0, 1, 2, 3];
            historyFactory.historyIndex = 0;

            historyFactory.addItem();

            expect(historyFactory.items.length).toBe(2);
            expect(historyFactory.historyIndex).toBe(1);
        });

        it('allow to detect can undo action be performed', function() {
            expect(historyFactory.canUndo()).toBe(false);

            // Initial item.
            historyFactory.addItem();
            historyFactory.addItem();

            expect(historyFactory.canUndo()).toBe(true);
        });

        it('allow to detect can redo action be performed', function() {
            expect(historyFactory.canRedo()).toBe(false);

            // Initial item.
            historyFactory.addItem();
            historyFactory.addItem();

            expect(historyFactory.canRedo()).toBe(false);

            historyFactory.undo();

            expect(historyFactory.canRedo()).toBe(true);
        });

        it('allow to undo action', function() {
            spyOn(historyFactory, 'applyHistory');

            historyFactory.undo();

            expect(historyFactory.applyHistory).not.toHaveBeenCalled();

            // Initial item.
            historyFactory.addItem();
            historyFactory.addItem();

            historyFactory.undo();

            expect(historyFactory.applyHistory).toHaveBeenCalledWith(-1);
        });

        it('allow to redo action', function() {
            spyOn(historyFactory, 'applyHistory');

            historyFactory.redo();

            expect(historyFactory.applyHistory).not.toHaveBeenCalled();

            // Initial item.
            historyFactory.addItem();
            historyFactory.addItem();

            historyFactory.historyIndex = 0;

            historyFactory.redo();

            expect(historyFactory.applyHistory).toHaveBeenCalledWith(1);
        });

        it('apply history item', function() {
            // Initial item.
            historyFactory.addItem();
            historyFactory.addItem();
            historyFactory.addItem();

            historyFactory.historyIndex = 1;

            historyFactory.applyHistory(1);

            expect(historyFactory.historyIndex).toBe(2);
        });

        it('return current history item', function() {
            // Initial item.
            historyFactory.historyIndex = 1;
            historyFactory.items[1] = 'test';

            expect(historyFactory.current()).toBe('test');
        });
    });


    describe('factory', function() {
        var factory;

        beforeEach(inject(function (ImageEditorFactory) {
            factory = new ImageEditorFactory({
                selectionWidth: 150,
                selectionHeight: 75,
                visibleWidth: 300
            });
        }));

        it('should set initial values', function() {
            expect(factory.visibleWidth).toBe(300);
            expect(factory.ratio).toBe(1);

            expect(factory.naturalWidth).toBe(0);
            expect(factory.naturalHeight).toBe(0);

            expect(factory.top).toBe(0);
            expect(factory.left).toBe(0);
            expect(factory.selection).toEqual({ top: 0, left: 0, width: 150, height: 75, ratio: 2 });
            expect(factory.wasCroppedForRotation).toBe(0);
            expect(factory.isCropped).toBe(false);
            expect(factory.hFlip).toBe(false);
            expect(factory.vFlip).toBe(false);
            expect(factory.rotation).toBe(0);
            expect(factory.width).toBe(300);
            expect(factory.height).toBe(300);
        });

        it('should allow to reset transformations', function() {
            factory.top = 1;
            factory.left = 1;
            factory.selection = {};
            factory.wasCroppedForRotation = 90;
            factory.isCropped = true;
            factory.hFlip = true;
            factory.vFlip = true;
            factory.rotation = 90;
            factory.width = 1;
            factory.height = 1;

            factory.resetTransformations();

            expect(factory.top).toBe(0);
            expect(factory.left).toBe(0);
            expect(factory.selection).toEqual({ top: 0, left: 0, width: 150, height: 75, ratio: 2 });
            expect(factory.wasCroppedForRotation).toBe(0);
            expect(factory.isCropped).toBe(false);
            expect(factory.hFlip).toBe(false);
            expect(factory.vFlip).toBe(false);
            expect(factory.rotation).toBe(0);
            expect(factory.width).toBe(300);
            expect(factory.height).toBe(300);
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
                factory.rotation = 90;

                var css = {
                    position: 'absolute',
                    top: '10px',
                    left: '20px',
                    width: '300px',
                    height: '150px',
                    transform: 'rotate(90deg)'
                };

                expect(factory.css()).toEqual(css);

                factory.rotation = 180;
                css.transform = 'rotate(180deg)';
                expect(factory.css()).toEqual(css);

                factory.rotation = 270;
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

                factory.rotation = 90;
                css.transform = 'scaleX(-1) rotate(90deg)'
                expect(factory.css()).toEqual(css);

                factory.rotation = 180;
                css.transform = 'scaleX(-1) rotate(180deg)';
                expect(factory.css()).toEqual(css);

                factory.rotation = 270;
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

                factory.rotation = 90;
                css.transform = 'scaleY(-1) rotate(90deg)'
                expect(factory.css()).toEqual(css);

                factory.rotation = 180;
                css.transform = 'scaleY(-1) rotate(180deg)';
                expect(factory.css()).toEqual(css);

                factory.rotation = 270;
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
                factory.wasCroppedForRotation = 90;
                expect(factory.parentSize()).toEqual({
                    width: 300,
                    height: 900
                });
            });

            it('with croping on rotated image', function() {
                factory.isCropped = true;
                factory.wasCroppedForRotation = 90;
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

        it('should return correct selection css', function() {
            factory.selection = {
                top: 1,
                left: 2,
                width: 3,
                height: 4
            };

            expect(factory.selectionCss()).toEqual({
                top: '1px',
                left: '2px',
                width: '3px',
                height: '4px'
            });
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

        it('should allow to update selection if input is correct', function() {
            expect(factory.selection.width).toBe(150);
            expect(factory.selection.height).toBe(75);

            // Initial parent area size is 300x300, so 110x120 is good.
            factory.updateSelectionDimensions(110, 120);

            expect(factory.selection.top).toBe(0);
            expect(factory.selection.left).toBe(0);
            expect(factory.selection.width).toBe(110);
            expect(factory.selection.height).toBe(120);
        });

        it('should throw exception if input is incorrect', function() {
            var test = function() {
                // Initial parent area size is 300x300, so 310x120 is too big.
                factory.updateSelectionDimensions(310, 120);
            }

            expect(test).toThrowError('Incorrect selection size');
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
            spyOn(factory.history, 'addItem');

            factory.visibleWidth = 200;
            factory.setSelection({ top: 10, left: 20, width: 100, height: 50 });

            factory.top = -30;
            factory.left = -40;
            factory.width = 300;
            factory.height = 400;
            factory.ratio = 0.75;

            factory.crop();

            expect(factory.history.addItem).toHaveBeenCalled();

            expect(factory.top).toBe(-80);
            expect(factory.left).toBe(-120);
            expect(factory.width).toBe(600);
            expect(factory.height).toBe(800);
            expect(factory.isCropped).toBe(true);
            expect(factory.wasCroppedForRotation).toBe(0);

            factory.rotation = 90;
            factory.crop();
            expect(factory.wasCroppedForRotation).toBe(90);

            factory.rotation = 180;
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
                spyOn(factory.history, 'addItem');

                factory.horizontalFlip();

                // Top should be unchanged.
                expect(factory.top).toBe(0);

                expect(factory.history.addItem).toHaveBeenCalled();
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
                spyOn(factory.history, 'addItem');

                factory.verticalFlip();

                // Left should be unchanged.
                expect(factory.left).toBe(0);

                expect(factory.history.addItem).toHaveBeenCalled();
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
                expect(factory.rotation).toBe(90);
                factory.rotate('cw');
                expect(factory.rotation).toBe(180);
                factory.rotate('cw');
                expect(factory.rotation).toBe(270);
                factory.rotate('cw');
                expect(factory.rotation).toBe(0);
            });

            it('and keep rotation positive int from 0 to 3 rotating anti-clock-wise', function() {
                expect(factory.rotation).toBe(0);
                factory.rotate('acw');
                expect(factory.rotation).toBe(270);
                factory.rotate('acw');
                expect(factory.rotation).toBe(180);
                factory.rotate('acw');
                expect(factory.rotation).toBe(90);
                factory.rotate('acw');
                expect(factory.rotation).toBe(0);
            });

            it('correctly by clock-wise', function() {
                spyOn(factory.history, 'addItem');
                expect(factory.parentSize()).toEqual({width: 150, height: 100});


                factory.rotate('cw');

                expect(factory.history.addItem).toHaveBeenCalled();

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
                spyOn(scope, 'updateEditorCss');
            });

            it('for crop and call editor crop', function() {
                spyOn(scope.editor, 'crop');

                scope.$emit('editorButtonClick', {name: 'crop'});

                expect(scope.editor.crop).toHaveBeenCalled();
                expect(scope.updateEditorCss).toHaveBeenCalled();
            });

            it('for rotate-cw and call editor rotate', function() {
                spyOn(scope.editor, 'rotate');

                scope.$emit('editorButtonClick', {name: 'rotate-cw'});

                expect(scope.editor.rotate).toHaveBeenCalledWith('cw');
                expect(scope.updateEditorCss).toHaveBeenCalled();
            });

            it('for rotate-acw and call editor rotate', function() {
                spyOn(scope.editor, 'rotate');

                scope.$emit('editorButtonClick', {name: 'rotate-acw'});

                expect(scope.editor.rotate).toHaveBeenCalledWith('acw');
                expect(scope.updateEditorCss).toHaveBeenCalled();
            });

            it('for flip-v and call editor verticalFlip', function() {
                spyOn(scope.editor, 'verticalFlip');

                scope.$emit('editorButtonClick', {name: 'flip-v'});

                expect(scope.editor.verticalFlip).toHaveBeenCalled();
                expect(scope.updateEditorCss).toHaveBeenCalled();
            });

            it('for flip-h and call editor horizontalFlip', function() {
                spyOn(scope.editor, 'horizontalFlip');

                scope.$emit('editorButtonClick', {name: 'flip-h'});

                expect(scope.editor.horizontalFlip).toHaveBeenCalled();
                expect(scope.updateEditorCss).toHaveBeenCalled();
            });

            it('for undo and call editor undo', function() {
                spyOn(scope.editor.history, 'undo');

                scope.$emit('editorButtonClick', {name: 'undo'});

                expect(scope.editor.history.undo).toHaveBeenCalled();
                expect(scope.updateEditorCss).toHaveBeenCalled();
            });

            it('for redo and call editor redo', function() {
                spyOn(scope.editor.history, 'redo');

                scope.$emit('editorButtonClick', {name: 'redo'});

                expect(scope.editor.history.redo).toHaveBeenCalled();
                expect(scope.updateEditorCss).toHaveBeenCalled();
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

            spyOn(scope.editor, 'setVisibleWidth');
            spyOn(scope, 'updateEditorCss');

            scope.width = 500;
            scope.$digest();

            expect(scope.editor.setVisibleWidth).toHaveBeenCalledWith(500);
            expect(scope.updateEditorCss).toHaveBeenCalled();
        });

        it('should update child css ant update state', function() {
            createCtrl();

            scope.imageElement = {
                css: jasmine.createSpy('css'),
                parent: jasmine.createSpy('parent').and.returnValue({
                        css: jasmine.createSpy('parentCss')
                })
            };
            spyOn(scope, '$broadcast');
            spyOn(scope, 'updateHistoryButtons');

            scope.updateEditorCss();

            expect(scope.imageElement.css).toHaveBeenCalledWith(scope.editor.css());
            expect(scope.imageElement.parent().css).toHaveBeenCalledWith(scope.editor.parentCss());
            expect(scope.$broadcast).toHaveBeenCalledWith('updateSelection', scope.editorId, scope.editor.selectionCss());
            expect(scope.updateHistoryButtons).toHaveBeenCalled();
            expect(scope.state).toEqual(scope.editor.history.current());
        });

        it('should allow to disableButton undo/redo buttons state', function() {
            createCtrl();

            spyOn(scope.editor.history, 'canUndo').and.returnValue(false);
            spyOn(scope.editor.history, 'canRedo').and.returnValue(false);
            spyOn(scope, '$broadcast');

            scope.updateHistoryButtons();

            expect(scope.$broadcast.calls.argsFor(0)).toEqual(['disableButton', scope.editorId, 'undo']);
            expect(scope.$broadcast.calls.argsFor(1)).toEqual(['disableButton', scope.editorId, 'redo']);
        });

        it('should allow to enableButton undo/redo buttons state', function() {
            createCtrl();

            spyOn(scope.editor.history, 'canUndo').and.returnValue(true);
            spyOn(scope.editor.history, 'canRedo').and.returnValue(true);
            spyOn(scope, '$broadcast');

            scope.updateHistoryButtons();

            expect(scope.$broadcast.calls.argsFor(0)).toEqual(['enableButton', scope.editorId, 'undo']);
            expect(scope.$broadcast.calls.argsFor(1)).toEqual(['enableButton', scope.editorId, 'redo']);
        });
    });

    describe('directive', function() {
        var element, scope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = angular.element('<image-editor image="" width="200" selectionWidth="10" selectionHeight="5" state="state"></image-editor>');

            $compile(element)(scope);
            scope.$digest();

            scope = scope.$$childHead;
        }));

        it('should set imageElement to scope', function() {
            expect(scope.imageElement).toBeDefined();
            expect(scope.state).toEqual(jasmine.any(Object));
        });

        it('should append required elements', function() {
            expect(element.html()).toContain('image-editor-canvas');
            expect(element.html()).toContain('<img');
            expect(element.html()).toContain('<image-selection');
            expect(element.html()).toContain('<editor-panel');
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
