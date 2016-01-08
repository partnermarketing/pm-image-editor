describe('Draggable', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('controller', function() {
        var ctrl,
            scope,
            document,
            createCtrl;

        beforeEach(inject(function ($controller, $rootScope, _$document_) {
            scope = $rootScope.$new();
            ctrl = $controller;
            document = _$document_;

            createCtrl = function() {
                ctrl('DraggableController', {
                    '$scope': scope,
                    '$document': document
                });
            };
        }));

        it('should have initial values', function() {
            createCtrl();

            expect(scope.startX).toBe(0);
            expect(scope.startY).toBe(0);
            expect(scope.x).toBe(0);
            expect(scope.y).toBe(0);
        });   

        it('should return correct uiParams', function() {
            createCtrl();

            scope.x = 1;
            scope.y = 2;
            scope.element = {};

            expect(scope.uiParams()).toEqual({
                element: {},
                position: {
                    top: 2,
                    left: 1
                }
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

            scope.element = angular.element('<div/>');

            scope.mousedown(event);

            expect(event.preventDefault).toHaveBeenCalled();

            expect(scope.startX).toBe(10);
            expect(scope.startY).toBe(20);

            expect(document.on.calls.count()).toBe(2);
            expect(document.on.calls.argsFor(0)).toEqual(['mousemove', jasmine.any(Function)]);
            expect(document.on.calls.argsFor(1)).toEqual(['mouseup', jasmine.any(Function)]);        

        });

        it('should call scope.dragStart function if mousedown called', function() {
            var event = {
                preventDefault: jasmine.createSpy('preventDefault'),
                screenX: 10,
                screenY: 20
            };

            scope.dragStart = jasmine.createSpy('start');

            scope.element = angular.element('<div/>');
            
            createCtrl();

            scope.mousedown(event);

            expect(scope.dragStart).toHaveBeenCalled();
        });

        it('should unbind document events if mouseup called', function() {
            spyOn(document, 'unbind');

            createCtrl();

            scope.mouseup();

            expect(document.unbind.calls.count()).toBe(2);
            expect(document.unbind.calls.argsFor(0)).toEqual(['mousemove', jasmine.any(Function)]);
            expect(document.unbind.calls.argsFor(1)).toEqual(['mouseup', jasmine.any(Function)]);        
        });

        it('should call scope.dragStop function if mouseup called', function() {
            scope.dragStop = jasmine.createSpy('stop');

            createCtrl();

            scope.mouseup();

            expect(scope.dragStop).toHaveBeenCalled();
        });        

        describe('should update element position if mousemove called', function() {
            beforeEach(function () {
                scope.element = {
                    0: {
                        clientWidth: 50,
                        clientHeight: 50
                    },
                    css: jasmine.createSpy('css')
                };

                scope.parentElement = [{
                    clientWidth: 150,
                    clientHeight: 100
                }];

                createCtrl();
            });

            it('correctly', function() {
                var event = {
                    screenX: 10,
                    screenY: 20
                };

                scope.mousemove(event);

                expect(scope.element.css).toHaveBeenCalledWith({
                    top: '20px',
                    left: '10px'
                });
            });

            it('and avoid negative position', function() {
                var event = {
                    screenX: -10,
                    screenY: -20
                };

                scope.mousemove(event);

                expect(scope.element.css).toHaveBeenCalledWith({
                    top: '0px',
                    left: '0px'
                });
            });

            it('and be limited with parent element', function() {
                var event = {
                    screenX: 120,
                    screenY: 120
                };

                scope.mousemove(event);

                expect(scope.element.css).toHaveBeenCalledWith({
                    top: '50px',
                    left: '100px'
                });
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
            spyOn(scope, 'mousedown');

            scope.element.triggerHandler('mousedown');

            expect(scope.mousedown).toHaveBeenCalled();
        });        
    });
});