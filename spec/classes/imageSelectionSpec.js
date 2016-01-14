describe('Image selection', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('directive', function() {
        var element, scope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = angular.element('<image-selection editor-id="editor-1" width="100" height="150"></image-selection>');

            element = $compile(element)(scope);
            scope.$digest();
        }));

        it('should set css width and height from attributes', function() {
            expect(element.css('width')).toBe('100px');
            expect(element.css('height')).toBe('150px');
        });

        describe('should emit selectionChanged', function() {
            var isolatedScope;

            beforeEach(function() {
                isolatedScope = scope.$$childHead;
                spyOn(isolatedScope, '$emit');
            });

            it('on dragStop', function() {
                scope.$broadcast('dragStop', {}, {element: element});

                expect(isolatedScope.$emit).toHaveBeenCalledWith(
                    'selectionChanged',
                    'editor-1',
                    {
                        top: 0,
                        left: 0,
                        width: 100,
                        height: 150
                    }
                );
            });

            it('on resizeStop', function() {
                element.css({ top: '10px', left: '20px' });
                scope.$broadcast('resizeStop', {}, {element: element});

                expect(isolatedScope.$emit).toHaveBeenCalledWith(
                    'selectionChanged',
                    'editor-1',
                    {
                        top: 10,
                        left: 20,
                        width: 100,
                        height: 150
                    }
                );
            });

            it('on imageRotate', function() {
                element.css({ top: '10px', left: '20px' });
                scope.$broadcast('imageRotate', 'editor-1');

                expect(isolatedScope.$emit).toHaveBeenCalledWith(
                    'selectionChanged',
                    'editor-1',
                    {
                        top: 0,
                        left: 0,
                        width: 100,
                        height: 150
                    }
                );
            });

            it('on imageCrop', function() {
                element.css({ top: '10px', left: '20px' });
                scope.$broadcast('imageCrop', 'editor-1', { width: '200px', height: '300px' });

                expect(isolatedScope.$emit).toHaveBeenCalledWith(
                    'selectionChanged',
                    'editor-1',
                    {
                        top: 0,
                        left: 0,
                        width: 200,
                        height: 300
                    }
                );
            });

            it('on resetSelection', function() {
                element.css({ top: '10px', left: '20px', width: '200px', height: '300px' });
                scope.$broadcast('resetSelection', 'editor-1');

                expect(isolatedScope.$emit).toHaveBeenCalledWith(
                    'selectionChanged',
                    'editor-1',
                    {
                        top: 0,
                        left: 0,
                        width: 100,
                        height: 150
                    }
                );
            });
        });

        describe('should avoid emit selectionChanged for other elements', function() {
            var isolatedScope;

            beforeEach(function() {
                isolatedScope = scope.$$childHead;
                isolatedScope.editorId = 'other';
                spyOn(isolatedScope, '$emit');
            });

            it('on dragStop', function() {
                scope.$broadcast('dragStop', {}, {element: element});

                expect(isolatedScope.$emit).not.toHaveBeenCalled();
            });

            it('on resizeStop', function() {
                scope.$broadcast('resizeStop', {}, {element: element});

                expect(isolatedScope.$emit).not.toHaveBeenCalled();
            });

            it('on imageRotate', function() {
                scope.$broadcast('imageRotate', 'editor-1');

                expect(isolatedScope.$emit).not.toHaveBeenCalled();
            });

            it('on imageCrop', function() {
                scope.$broadcast('imageCrop', 'editor-1', { width: '200px', height: '300px' });

                expect(isolatedScope.$emit).not.toHaveBeenCalled();
            });

            it('on resetSelection', function() {
                scope.$broadcast('resetSelection', 'editor-1');

                expect(isolatedScope.$emit).not.toHaveBeenCalled();
            });
        });

    });
});