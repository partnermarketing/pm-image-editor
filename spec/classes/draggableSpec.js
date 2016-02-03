describe('Draggable', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('factory', function() {
        var factory,
            element,
            event,
            parent;

        beforeEach(inject(function (DraggableFactory) {
            factory = new DraggableFactory();

            element = angular.element('<div></div>');
            parent = angular.element('<div></div>');

            parent.append(element);

            element.css({width: '60px', height: '50px'});
            parent.css({width: '500px', height: '600px'});

            event = {
                screenX: 10,
                screenY: 20
            };
        }));

        it('should return correct css', function() {
            expect(factory.css()).toEqual({top: '0px', left: '0px'});

            factory.setPosition(1, 2);

            expect(factory.css()).toEqual({top: '1px', left: '2px'});
        });

        it('should update all required data when drag starts with zero top-left', function() {
            factory.dragStart(event, element, parent);

            expect(factory.getPosition()).toEqual({top: 0, left: 0});
            expect(factory.getOriginalMousePosition()).toEqual({top: 20, left: 10});
            expect(factory.getSize()).toEqual({width: 60, height: 50});
            expect(factory.getParentSize()).toEqual({width: 500, height: 600});
        });

        it('should update all required data when drag starts', function() {
            element.css({top: '100px', left: '200px'});
            factory.dragStart(event, element, parent);

            expect(factory.getPosition()).toEqual({top: 100, left: 200});
            expect(factory.getOriginalMousePosition()).toEqual({top: 20-100, left: 10-200});
            expect(factory.getSize()).toEqual({width: 60, height: 50});
            expect(factory.getParentSize()).toEqual({width: 500, height: 600});
        });

        describe('should update position', function() {
            beforeEach(function() {
                event = {
                    screenX: 0,
                    screenY: 0
                };

                factory.dragStart(event, element, parent);
            });

            it('correctly', function() {
                factory.updatePosition(10, 20);

                expect(factory.getPosition()).toEqual({top: 10, left: 20});
            });

            it('and avoid negative position', function() {
                factory.updatePosition(-10, -5);

                expect(factory.getPosition()).toEqual({top: 0, left: 0});
            });

            it('and be limited with parent element', function() {
                factory.updatePosition(560, 460);

                expect(factory.getPosition()).toEqual({top: 550, left: 440});
            });
        });

        it('should extract size from real size if css missed', function() {
            factory.setSize({0: {clientWidth: 100, clientHeight: 200}, css: function() {}});

            expect(factory.getSize()).toEqual({width: 100, height: 200});
        });

        it('should extract parent size from real size if css missed', function() {
            factory.setParentSize({0: {clientWidth: 100, clientHeight: 200}, css: function() {}});

            expect(factory.getParentSize()).toEqual({width: 100, height: 200});
        });
    });

    describe('controller', function() {
        var ctrl,
            rootScope,
            scope,
            document,
            createCtrl;

        beforeEach(inject(function ($controller, $rootScope, _$document_) {
            scope = $rootScope.$new();
            ctrl = $controller;
            document = _$document_;
            rootScope = $rootScope;

            createCtrl = function() {
                ctrl('DraggableController', {
                    '$scope': scope,
                    '$document': document,
                    '$rootScope': rootScope
                });
            };
        }));

        it('should create draggable factory instance', function() {
            createCtrl();

            expect(scope.draggableFactory).toBeDefined();
        });

        it('should return correct draggableUiParams', function() {
            createCtrl();

            scope.draggableFactory.setPosition(10, 20);

            scope.element = {};

            expect(scope.draggableUiParams()).toEqual({
                element: {},
                position: { top: 10, left: 20 }
            });
        });

        it('should update start values and bind events if mousedown called', function() {
            var event = {
                preventDefault: jasmine.createSpy('preventDefault'),
                screenX: 10,
                screenY: 20
            };

            spyOn(document, 'on');

            createCtrl();

            spyOn(scope.draggableFactory, 'dragStart');

            scope.element = 1;
            scope.parentElement = 2;

            scope.draggableMousedown(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(scope.draggableFactory.dragStart).toHaveBeenCalledWith(event, 1, 2);

            expect(document.on.calls.count()).toBe(2);
            expect(document.on.calls.argsFor(0)).toEqual(['mousemove', scope.draggableMousemove]);
            expect(document.on.calls.argsFor(1)).toEqual(['mouseup', scope.draggableMouseup]);
        });

        it('should unbind document events if mouseup called', function() {
            spyOn(document, 'unbind');

            createCtrl();

            scope.draggableMouseup();

            expect(document.unbind.calls.count()).toBe(2);
            expect(document.unbind.calls.argsFor(0)).toEqual(['mousemove', scope.draggableMousemove]);
            expect(document.unbind.calls.argsFor(1)).toEqual(['mouseup', scope.draggableMouseup]);
        });

        it('should broadcast dragStop event if mouseup called', function() {
            spyOn(rootScope, '$broadcast');

            createCtrl();

            scope.draggableMouseup();

            expect(rootScope.$broadcast).toHaveBeenCalledWith('dragStop', event, scope.draggableUiParams());
        });

        describe('should update element position if mousemove called', function() {
            var event;

            beforeEach(function() {
                event = {
                    screenX: 10,
                    screenY: 20
                };

                createCtrl();

                scope.element = {css: jasmine.createSpy('css')};

                spyOn(scope.draggableFactory, 'updatePosition');
                spyOn(scope.draggableFactory, 'css').and.returnValue({top: '1px', left: '2px'});
            });

            it('and update css', function() {
                scope.draggableMousemove(event);

                expect(scope.draggableFactory.updatePosition).toHaveBeenCalledWith(20, 10);
                expect(scope.element.css).toHaveBeenCalledWith({top: '1px', left: '2px'});
            });

            it('and call scope.onDrag if it is present', function() {
                scope.onDrag = jasmine.createSpy('onDrag');

                scope.draggableMousemove(event);

                expect(scope.onDrag).toHaveBeenCalledWith({top: '1px', left: '2px'});
            });
        });
    });

    describe('directive', function() {
        var element, scope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = angular.element('<div draggable></div>');
            element = $compile(element)(scope);

            scope.$digest();
        }));

        it('should set element and parentElement to scope', function() {
            expect(scope.element).toBeDefined();
            expect(scope.parentElement).toBeDefined();
        });

        it('should call mousedown from scope if event happens', function() {
            spyOn(scope, 'draggableMousedown');

            scope.element.triggerHandler('mousedown');

            expect(scope.draggableMousedown).toHaveBeenCalled();
        });
    });
});
