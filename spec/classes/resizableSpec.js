describe('Resizable', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('factory', function() {
        var factory,
            element,
            event,
            parent;

        beforeEach(inject(function (ResizableFactory) {
            factory = new ResizableFactory({
                minWidth:  20,
                minHeight: 40,
                maxWidth:  240,
                maxHeight: 400
            });

            element = angular.element('<div></div>');
            parent = angular.element('<div></div>');

            parent.append(element);

            element.css({top: '100px', left: '200px', width: '60px', height: '50px'});
            parent.css({width: '500px', height: '600px'});

            event = {
                screenX: 100,
                screenY: 200,
                target: {className: ''}
            };
        }));

        it('should have initial values', function() {
            expect(factory.getOriginalSize()).toEqual({ width: 0, height: 0 });
            expect(factory.getOriginalPosition()).toEqual({ top: 0, left: 0 });
            expect(factory.getOriginalMousePosition()).toEqual({ top: 0, left: 0 });
            expect(factory.getPosition()).toEqual({ top: 0, left: 0 });
            expect(factory.getSize()).toEqual({ width: 0, height: 0 });
            expect(factory.getRatio()).toBe(1);
            expect(factory.getAxis()).toBe('se');
        });

        it('should have initial options', function() {
            expect(factory.getOption('minWidth')).toBe(20);
            expect(factory.getOption('minHeight')).toBe(40);
            expect(factory.getOption('maxWidth')).toBe(240);
            expect(factory.getOption('maxHeight')).toBe(400);
        });

        it('should allow to set initial options', function() {
            factory.setOption('minWidth', 21);
            factory.setOption('minHeight', 41);
            factory.setOption('maxWidth', 201);
            factory.setOption('maxHeight', 401);

            expect(factory.getOption('minWidth')).toBe(21);
            expect(factory.getOption('minHeight')).toBe(41);
            expect(factory.getOption('maxWidth')).toBe(201);
            expect(factory.getOption('maxHeight')).toBe(401);
        });

        it('should update initials when resize starts', function() {
            factory.resizeStart({
                screenX: 10,
                screenY: 20,
                target: {className: 'none'}
            }, element);

            expect(factory.getOriginalMousePosition()).toEqual({ top: 20, left: 10 });
            expect(factory.getOriginalPosition()).toEqual({ top: 100, left: 200 });
            expect(factory.getParentSize()).toEqual({ width: 500, height: 600 });
            expect(factory.getOriginalSize()).toEqual({ width: 60, height: 50 });
            expect(factory.getSize()).toEqual({ width: 60, height: 50 });
            expect(factory.getRatio()).toBe(1.2);
            expect(factory.getAxis()).toBe('se');
        });

        it('should detect axis when resize starts', function() {
            var axis = String('se|sw|ne|nw|n|e|s|w|blah').split('|');
            var values = String('se|sw|ne|nw|n|e|s|w|se').split('|');

            axis.forEach(function(value, key) {
                event.target.className = 'resizable-'+value;

                factory.resizeStart(event, element);
                expect(factory.getAxis()).toBe(values[key]);
            });
        });

        describe('should update boundaries', function() {
            it('when resize to east', function() {
                event.target.className = 'resizable-e';
                factory.resizeStart(event, element);

                expect(factory.updateBoundaries(10, 20)).toEqual({width: 70});
                expect(factory.updateBoundaries(-10, -20)).toEqual({width: 50});
            });

            it('when resize to west', function() {
                event.target.className = 'resizable-w';
                factory.resizeStart(event, element);

                expect(factory.updateBoundaries(10, 20)).toEqual({left: 210, width: 50});
                expect(factory.updateBoundaries(-10, -20)).toEqual({left: 190, width: 70});
            });

            it('when resize to north', function() {
                event.target.className = 'resizable-n';
                factory.resizeStart(event, element);

                expect(factory.updateBoundaries(10, 20)).toEqual({top: 120, height: 30});
                expect(factory.updateBoundaries(-10, -20)).toEqual({top: 80, height: 70});
            });

            it('when resize to south', function() {
                event.target.className = 'resizable-s';
                factory.resizeStart(event, element);

                expect(factory.updateBoundaries(10, 20)).toEqual({height: 70});
                expect(factory.updateBoundaries(-10, -20)).toEqual({height: 30});
            });

            it('when resize to south-east', function() {
                event.target.className = 'resizable-se';
                factory.resizeStart(event, element);

                // Combination of south and east.
                expect(factory.updateBoundaries(10, 20)).toEqual({height: 70, width: 70});
                expect(factory.updateBoundaries(-10, -20)).toEqual({height: 30, width: 50});
            });

            it('when resize to south-west', function() {
                event.target.className = 'resizable-sw';
                factory.resizeStart(event, element);

                // Combination of south and west.
                expect(factory.updateBoundaries(10, 20)).toEqual({height: 70, left: 210, width: 50});
                expect(factory.updateBoundaries(-10, -20)).toEqual({height: 30, left: 190, width: 70});
            });

            it('when resize to north-east', function() {
                event.target.className = 'resizable-ne';
                factory.resizeStart(event, element);

                // Combination of north and east.
                expect(factory.updateBoundaries(10, 20)).toEqual({top: 120, height: 30, width: 70});
                expect(factory.updateBoundaries(-10, -20)).toEqual({top: 80, height: 70, width: 50});
            });

            it('when resize to north-west', function() {
                event.target.className = 'resizable-nw';
                factory.resizeStart(event, element);

                // Combination of north and east.
                expect(factory.updateBoundaries(10, 20)).toEqual({top: 120, height: 30, left: 210, width: 50});
                expect(factory.updateBoundaries(-10, -20)).toEqual({top: 80, height: 70, left: 190, width: 70});
            });
        });

        describe('should update ratio', function() {
            it('when height changed', function() {
                factory.resizeStart(event, element);

                // Incoming ratio 1.2.
                expect(factory.updateRatio({height: 100})).toEqual({ height: 100, width: 120 });
            });

            it('when width changed', function() {
                factory.resizeStart(event, element);

                // Incoming ratio 1.2.
                expect(factory.updateRatio({width: 120})).toEqual({ height: 100, width: 120 });
            });

            it('when direction is south-west left value should updates', function() {
                event.target.className = 'resizable-sw';
                factory.resizeStart(event, element);

                // Incoming ratio 1.2.
                expect(factory.updateRatio({width: 120})).toEqual({ width: 120, height: 100, left: 140, top: null });
            });

            it('when direction is north-west top ans left values should updates', function() {
                event.target.className = 'resizable-nw';
                factory.resizeStart(event, element);

                // Incoming ratio 1.2.
                expect(factory.updateRatio({width: 120})).toEqual({ width: 120, height: 100, top: 50, left: 140 });
            });
        });

        it('should update current size and position based on boundaries data', function() {
            factory.updateSizeAndPosition({
                left: 10,
                top: 20,
                width: 30,
                height: 40
            });
            expect(factory.getSize()).toEqual({ height: 40, width: 30 });
            expect(factory.getPosition()).toEqual({ left: 10, top: 20 });

            factory.updateSizeAndPosition({});
            expect(factory.getSize()).toEqual({ height: 40, width: 30 });
            expect(factory.getPosition()).toEqual({ left: 10, top: 20 });
        });

        it('should calculate min/max sizes depends on ratio', function() {
            // Check with default ratio.
            factory.updateVirtualBoundaries();
            expect(factory.getVirtualBoundaries()).toEqual({ minWidth:  40, minHeight: 40, maxWidth:  240, maxHeight: 240 });

            factory.resizeStart(event, element);

            factory.updateVirtualBoundaries();
            expect(factory.getVirtualBoundaries()).toEqual({ minWidth: 48, maxWidth: 240, minHeight: 40, maxHeight: 200 });

            factory.setOption('minWidth', 120);
            factory.updateVirtualBoundaries();
            expect(factory.getVirtualBoundaries()).toEqual({ minWidth: 120, maxWidth: 240, minHeight: 100, maxHeight: 200 });

            factory.setOption('maxHeight', 120);
            factory.updateVirtualBoundaries();
            expect(factory.getVirtualBoundaries()).toEqual({ minWidth: 120, maxWidth: 144, minHeight: 100, maxHeight: 120 });
        });

        describe('should update boundary data to fit min/max values', function() {
            it('if width is bigger max', function() {
                event.target.className = 'resizable-sw';
                factory.resizeStart(event, element);

                expect(factory.respectSize({width: 300, height: 300})).toEqual({ width: 240, height: 200, left: 20 });
            });

            it('if height is bigger max', function() {
                event.target.className = 'resizable-nw';
                factory.resizeStart(event, element);

                expect(factory.respectSize({width: 300, height: 300})).toEqual({ width: 240, height: 200, left: 20, top: -50 });
            });

            it('if width is less min', function() {
                event.target.className = 'resizable-sw';
                factory.resizeStart(event, element);

                expect(factory.respectSize({width: 3, height: 3})).toEqual({ width: 48, height: 40, left: 212 });
            });

            it('if height is less min', function() {
                event.target.className = 'resizable-nw';
                factory.resizeStart(event, element);

                expect(factory.respectSize({width: 3, height: 3})).toEqual({ width: 48, height: 40, left: 212, top: 110 });
            });

            it('and ignore top if only top present', function() {
                factory.resizeStart(event, element);

                expect(factory.respectSize({top: 3})).toEqual({ top: null });
            });

            it('and ignore left if only left present', function() {
                factory.resizeStart(event, element);

                expect(factory.respectSize({left: 3})).toEqual({ left: null });
            });
        });

        describe('should update boundary data to fit parent container', function() {
            it('does nothing if data is correct', function() {
                event.target.className = 'resizable-nw';
                factory.resizeStart(event, element);

                expect(factory.fitContainer({})).toEqual({});
            });

            it('if left is negative', function() {
                event.target.className = 'resizable-nw';
                factory.resizeStart(event, element);

                factory.updateSizeAndPosition({left: -12});

                expect(factory.fitContainer({})).toEqual({ left: 0, top: 110, width: 48, height: 40 });
            });

            it('if top is negative', function() {
                event.target.className = 'resizable-nw';
                factory.resizeStart(event, element);

                factory.updateSizeAndPosition({top: -10});

                expect(factory.fitContainer({})).toEqual({ left: 212, top: 0, width: 48, height: 40 });
            });

            it('if width is too big', function() {
                event.target.className = 'resizable-ne';
                factory.resizeStart(event, element);

                factory.updateSizeAndPosition({left: 452});

                expect(factory.fitContainer({})).toEqual({ left: 452, top: 110, width: 48, height: 40 });
            });

            it('if height is too big', function() {
                event.target.className = 'resizable-sw';
                factory.resizeStart(event, element);

                factory.updateSizeAndPosition({top: 560});

                expect(factory.fitContainer({})).toEqual({ left: 212, top: 560, width: 48, height: 40 });
            });
        });

        it('calculates new boundary data when handler moves to new position', function() {
            factory.resizeStart(event, element);
            expect(factory.getBoundaryData(120, 220)).toEqual({ height: 70, width: 84 });

            expect(factory.getBoundaryData(100, 200)).toEqual({ height: 50, width: 60 });

            expect(factory.getBoundaryData(80, 180)).toEqual({ height: 40, width: 48 });
        });
    });

    describe('controller', function() {
        var ctrl,
            scope,
            document,
            rootScope,
            factory,
            createCtrl;

        beforeEach(inject(function ($controller, $rootScope, _$document_, ResizableFactory) {
            scope = $rootScope.$new();
            ctrl = $controller;
            document = _$document_;
            factory = ResizableFactory;
            rootScope = $rootScope

            createCtrl = function() {
                ctrl('ResizableController', {
                    '$scope': scope,
                    '$document': document,
                    '$rootScope': rootScope,
                    'ResizableFactory': factory
                });
            };
        }));

        it('should have initial values', function() {
            createCtrl();

            expect(scope.resizableFactory).toBeDefined();
        });

        it('should return correct uiParams', function() {
            createCtrl();

            scope.element = angular.element('<div></div>');
            scope.element.css({top: '100px', left: '200px', width: '60px', height: '50px'});

            scope.resizableFactory.setOriginalSize(scope.element);
            scope.resizableFactory.setOriginalPosition(100, 200);

            expect(scope.resizableUiParams()).toEqual({
                element: scope.element,
                position: {
                    top: 100,
                    left: 200
                },
                size: {
                    width: 60,
                    height: 50
                }
            });
        });

        it('should update start values and bind events if mousedown called', function() {
            var event = {
                preventDefault: jasmine.createSpy('preventDefault'),
                stopPropagation: jasmine.createSpy('stopPropagation'),
                screenX: 10,
                screenY: 20
            };

            spyOn(document, 'on');

            createCtrl();

            spyOn(scope.resizableFactory, 'resizeStart');

            scope.element = angular.element('<div/>');

            scope.resizableHandleMousedown(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();

            expect(scope.resizableFactory.resizeStart).toHaveBeenCalledWith(event, scope.element);

            expect(document.on.calls.count()).toBe(2);
            expect(document.on.calls.argsFor(0)).toEqual(['mousemove', scope.resizableMousemove]);
            expect(document.on.calls.argsFor(1)).toEqual(['mouseup', scope.resizableMouseup]);

        });

        it('should unbind document events if mouseup called', function() {
            spyOn(document, 'unbind');

            createCtrl();

            scope.resizableMouseup();

            expect(document.unbind.calls.count()).toBe(2);
            expect(document.unbind.calls.argsFor(0)).toEqual(['mousemove', scope.resizableMousemove]);
            expect(document.unbind.calls.argsFor(1)).toEqual(['mouseup', scope.resizableMouseup]);
        });

        it('should broadcast dragStop event if mouseup called', function() {
            spyOn(rootScope, '$broadcast');

            createCtrl();

            scope.resizableMouseup();

            expect(rootScope.$broadcast).toHaveBeenCalledWith('resizeStop', event, scope.resizableUiParams());
        });

        describe('should update element position if mousemove called', function() {
            beforeEach(function() {
                scope.element = angular.element('<div/>');
                spyOn(scope.element, 'css');

                createCtrl();

                spyOn(scope.resizableFactory, 'getBoundaryData').and.returnValue({
                    top: 1,
                    left: 2,
                    width: 3,
                    height: 4
                });
            });

            it('and update css', function() {
                scope.resizableMousemove({ screenX: 10, screenY: 20 });

                expect(scope.resizableFactory.getBoundaryData).toHaveBeenCalledWith(10, 20);
                expect(scope.element.css).toHaveBeenCalledWith({ top: '1px', left: '2px', width: '3px', height: '4px' });
            });

            it('and call scope.onResize if it is present', function() {
                scope.onResize = jasmine.createSpy('onResize');

                scope.resizableMousemove({ screenX: 10, screenY: 20 });

                expect(scope.onResize).toHaveBeenCalledWith({ top: '1px', left: '2px', width: '3px', height: '4px' });
            });
        });
    });

    describe('directive', function() {
        var element, scope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = angular.element('<div resizable></div>');

            $compile(element)(scope);
            scope.$digest();
        }));

        it('should set element and parentElement to scope', function() {
            expect(scope.element).toBeDefined();
            expect(scope.parentElement).toBeDefined();
        });

        it('should append handlers', function() {
            expect(scope.element.html()).toContain('resizable-n resizable-handle');
            expect(scope.element.html()).toContain('resizable-s resizable-handle');
            expect(scope.element.html()).toContain('resizable-w resizable-handle');
            expect(scope.element.html()).toContain('resizable-e resizable-handle');
            expect(scope.element.html()).toContain('resizable-nw resizable-handle');
            expect(scope.element.html()).toContain('resizable-ne resizable-handle');
            expect(scope.element.html()).toContain('resizable-sw resizable-handle');
            expect(scope.element.html()).toContain('resizable-se resizable-handle');
        });


        it('should call resizableHandleMousedown from scope if event happens', function() {
            spyOn(scope, 'resizableHandleMousedown');

            scope.element.find('span').eq(0).triggerHandler('mousedown');

            expect(scope.resizableHandleMousedown).toHaveBeenCalled();
        });
    });
});
