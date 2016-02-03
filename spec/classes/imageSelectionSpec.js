describe('Image selection', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('directive', function() {
        var element, scope, isolatedScope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = angular.element('<image-selection editor-id="editor-1" width="100" height="150"></image-selection>');

            element = $compile(element)(scope);
            scope.$digest();

            isolatedScope = scope.$$childHead;
        }));

        it('should append required elements', function() {
            expect(element.html()).toContain('class="image-editor-selection"');
            expect(element.html()).toContain('class="image-editor-selection-border-top"');
            expect(element.html()).toContain('class="image-editor-selection-border-bottom"');
            expect(element.html()).toContain('class="image-editor-selection-border-left"');
            expect(element.html()).toContain('class="image-editor-overlay-top"');
            expect(element.html()).toContain('class="image-editor-overlay-left"');
            expect(element.html()).toContain('class="image-editor-overlay-bottom"');
            expect(element.html()).toContain('class="image-editor-overlay-right"');
        });

        it('should set selection and overlay to scope', function() {
            expect(isolatedScope.selection).toEqual(jasmine.any(Object));
            expect(isolatedScope.overlay).toEqual({
                'top': jasmine.any(Object),
                'left': jasmine.any(Object),
                'bottom': jasmine.any(Object),
                'right': jasmine.any(Object)
            });
        });

        it('when called onResize should update selection', function() {
            spyOn(isolatedScope, 'setSelectionCss');
            isolatedScope.onDrag({top: '1px'});

            expect(isolatedScope.setSelectionCss).toHaveBeenCalledWith({top: '1px'});
        });

        it('when called onResize should update selection', function() {
            spyOn(isolatedScope, 'setSelectionCss');
            isolatedScope.onResize({top: '1px'});

            expect(isolatedScope.setSelectionCss).toHaveBeenCalledWith({top: '1px'});
        });

        it('when called setSelectionCss selection and overlay should updates', function() {
            spyOn(isolatedScope, 'getSelectionData').and.returnValue({
                top: 1,
                left: 2,
                width: 3,
                height: 4
            });

            isolatedScope.selection = { 'css': jasmine.createSpy('selectionCss') };

            isolatedScope.overlay = {
                'top': { 'css': jasmine.createSpy('topCss') },
                'left': { 'css': jasmine.createSpy('leftCss') },
                'bottom': { 'css': jasmine.createSpy('bottomCss') },
                'right': { 'css': jasmine.createSpy('rightCss') }
            };

            isolatedScope.setSelectionCss({top: '1px'});

            expect(isolatedScope.selection.css).toHaveBeenCalledWith({top: '1px'});
            expect(isolatedScope.getSelectionData).toHaveBeenCalled();

            expect(isolatedScope.overlay.top.css).toHaveBeenCalledWith({
                top: '0px',
                left: '0px',
                right: '0px',
                height: '1px'
            });

            expect(isolatedScope.overlay.bottom.css).toHaveBeenCalledWith({
                top: '5px',
                left: '0px',
                right: '0px',
                bottom: '0px'
            });

            expect(isolatedScope.overlay.left.css).toHaveBeenCalledWith({
                top: '1px',
                left: '0px',
                width: '2px',
                height: '4px'
            });

            expect(isolatedScope.overlay.right.css).toHaveBeenCalledWith({
                top: '1px',
                left: '5px',
                right: '0px',
                height: '4px'
            });
        });

        it('should allow to get selection data', function() {
            isolatedScope.selection = angular.element('<div/>');
            isolatedScope.selection.css({
                top: '1px',
                left: '2px',
                width: '3px',
                height: '4px'
            });

            expect(isolatedScope.getSelectionData()).toEqual({
                top: 1,
                left: 2,
                width: 3,
                height: 4
            });
        });

        it('should set css width and height from attributes', function() {
            expect(isolatedScope.selection.css('width')).toBe('100px');
            expect(isolatedScope.selection.css('height')).toBe('150px');
        });

        describe('should emit selectionChanged', function() {
            beforeEach(function() {
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
                isolatedScope.selection.css({ top: '10px', left: '20px' });
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

            it('on updateSelection', function() {
                spyOn(isolatedScope.selection, 'css');

                var css = { top: '10px', left: '20px', width: '200px', height: '300px' };
                scope.$broadcast('updateSelection', 'editor-1', css);

                expect(isolatedScope.selection.css).toHaveBeenCalledWith(css);
            });
        });

        describe('should avoid emit selectionChanged for other elements', function() {
            beforeEach(function() {
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

            it('on updateSelection', function() {
                spyOn(isolatedScope.element, 'css');

                scope.$broadcast('updateSelection', 'editor-1', {});

                expect(isolatedScope.element.css).not.toHaveBeenCalled();
            });
        });

    });
});
