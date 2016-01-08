describe('Image selection', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('directive', function() {
        var element, scope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = angular.element('<image-selection width="100" height="150"></image-selection>');

            element = $compile(element)(scope);
            scope.$digest();
        }));

        it('should set css width and height from attributes', function() {
            expect(element.css('width')).toBe('100px');
            expect(element.css('height')).toBe('150px');
        });
     
    });
});