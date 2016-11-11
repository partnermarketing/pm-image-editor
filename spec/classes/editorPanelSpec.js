describe('Editor panel', function () {
    'use strict';

    beforeEach(function () {
        module('pmImageEditor');
    });

    describe('directive', function() {
        var element, scope;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();

            element = angular.element('<editor-panel editor-id="editor-1"></editor-panel>');

            element = $compile(element)(scope);
            scope.$digest();
        }));

        it('should have required buttons', function() {
            var buttonNames = 'crop,rotate-cw,rotate-acw,flip-h,flip-v';
            buttonNames.split(',').forEach(function(name) {
                expect(element.html()).toContain('<span class="image-editor-'+name+'"');
            });
        });

        it('should disable undo and redo by default', function() {
            expect(element.html()).toContain('<span class="image-editor-undo disabled"');
            expect(element.html()).toContain('<span class="image-editor-redo disabled"');
        });

        it('should allow to disable button', function() {
            scope.$broadcast('disableButton', 'editor-1', 'crop');

            expect(element.html()).toContain('<span class="image-editor-crop disabled"');
        });

        it('should allow to enable button', function() {
            scope.$broadcast('disableButton', 'editor-1', 'crop');
            scope.$broadcast('enableButton', 'editor-1', 'crop');

            expect(element.html()).toContain('<span class="image-editor-crop"');
        });

        it('should skip enable/disable button if editor id is not match', function() {
            scope.$broadcast('disableButton', 'editor-2', 'crop');

            expect(element.html()).toContain('<span class="image-editor-crop"');

            scope.$broadcast('enableButton', 'editor-2', 'redo');

            expect(element.html()).toContain('<span class="image-editor-redo disabled"');
        });

        it('should emit editorButtonClick when button clicked', function() {
            scope = scope.$$childHead;

            spyOn(scope, '$emit');

            element.find('span').eq(0).triggerHandler('click');

            expect(scope.$emit).toHaveBeenCalledWith('editorButtonClick', { name: 'crop' });
        });
    });
});
