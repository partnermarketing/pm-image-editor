/*!
 * undefined v0.3.2
 * https://github.com/partnermarketing/pm-image-crop
 *
 * Copyright (c) 2016 Partnermarketing.com
 * License: MIT
 *
 * Generated at Friday, January 15th, 2016, 9:50:21 AM
 */
(function() {
'use strict';

(function () {
        angular.module('pmImageCrop', []);
    angular.module('pmImageEditor', []);
}());



(function () {
        angular.module('pmImageCrop').factory('cropAreaCircle', ['cropArea', function (CropArea) {
        var CropAreaCircle = function () {
            CropArea.apply(this, arguments);

            this._boxResizeBaseSize = 20;
            this._boxResizeNormalRatio = 0.9;
            this._boxResizeHoverRatio = 1.2;
            this._iconMoveNormalRatio = 0.9;
            this._iconMoveHoverRatio = 1.2;

            this._boxResizeNormalSize = this._boxResizeBaseSize * this._boxResizeNormalRatio;
            this._boxResizeHoverSize = this._boxResizeBaseSize * this._boxResizeHoverRatio;

            this._posDragStartX = 0;
            this._posDragStartY = 0;
            this._posResizeStartX = 0;
            this._posResizeStartY = 0;
            this._posResizeStartSize = 0;

            this._boxResizeIsHover = false;
            this._areaIsHover = false;
            this._boxResizeIsDragging = false;
            this._areaIsDragging = false;
        };

        CropAreaCircle.prototype = new CropArea();

        CropAreaCircle.prototype._calcCirclePerimeterCoords = function (angleDegrees) {
            var hSize = this._size / 2;
            var angleRadians = angleDegrees * (Math.PI / 180),
                circlePerimeterX = this._x + hSize * Math.cos(angleRadians),
                circlePerimeterY = this._y + hSize * Math.sin(angleRadians);
            return [circlePerimeterX, circlePerimeterY];
        };

        CropAreaCircle.prototype._calcResizeIconCenterCoords = function () {
            return this._calcCirclePerimeterCoords(-45);
        };

        CropAreaCircle.prototype._isCoordWithinArea = function (coord) {
            return Math.sqrt((coord[0] - this._x) * (coord[0] - this._x) + (coord[1] - this._y) * (coord[1] - this._y)) < this._size / 2;
        };
        CropAreaCircle.prototype._isCoordWithinBoxResize = function (coord) {
            var resizeIconCenterCoords = this._calcResizeIconCenterCoords();
            var hSize = this._boxResizeHoverSize / 2;
            return (coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
            coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
        };

        CropAreaCircle.prototype._drawArea = function (ctx, centerCoords, size) {
            ctx.arc(centerCoords[0], centerCoords[1], size / 2, 0, 2 * Math.PI);
        };

        CropAreaCircle.prototype.draw = function () {
            CropArea.prototype.draw.apply(this, arguments);

            // draw move icon
            this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);

            // draw resize cubes
            this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover ? this._boxResizeHoverRatio : this._boxResizeNormalRatio);
        };

        // jshint maxstatements:35
        CropAreaCircle.prototype.processMouseMove = function (mouseCurX, mouseCurY) {
            var cursor = 'default';
            var res = false;

            this._boxResizeIsHover = false;
            this._areaIsHover = false;

            if (this._areaIsDragging) {
                this._x = mouseCurX - this._posDragStartX;
                this._y = mouseCurY - this._posDragStartY;
                this._areaIsHover = true;
                cursor = 'move';
                res = true;
                this._events.trigger('area-move');
            } else if (this._boxResizeIsDragging) {
                cursor = 'nesw-resize';
                var iFR, iFX, iFY;
                iFX = mouseCurX - this._posResizeStartX;
                iFY = this._posResizeStartY - mouseCurY;
                if (iFX > iFY) {
                    iFR = this._posResizeStartSize + iFY * 2;
                } else {
                    iFR = this._posResizeStartSize + iFX * 2;
                }

                this._size = Math.max(this._minSize, iFR);
                this._boxResizeIsHover = true;
                res = true;
                this._events.trigger('area-resize');
            } else if (this._isCoordWithinBoxResize([mouseCurX, mouseCurY])) {
                cursor = 'nesw-resize';
                this._areaIsHover = false;
                this._boxResizeIsHover = true;
                res = true;
            } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                cursor = 'move';
                this._areaIsHover = true;
                res = true;
            }

            this._dontDragOutside();
            angular.element(this._ctx.canvas).css({'cursor': cursor});

            return res;
        };

        CropAreaCircle.prototype.processMouseDown = function (mouseDownX, mouseDownY) {
            if (this._isCoordWithinBoxResize([mouseDownX, mouseDownY])) {
                this._areaIsDragging = false;
                this._areaIsHover = false;
                this._boxResizeIsDragging = true;
                this._boxResizeIsHover = true;
                this._posResizeStartX = mouseDownX;
                this._posResizeStartY = mouseDownY;
                this._posResizeStartSize = this._size;
                this._events.trigger('area-resize-start');
            } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
                this._areaIsDragging = true;
                this._areaIsHover = true;
                this._boxResizeIsDragging = false;
                this._boxResizeIsHover = false;
                this._posDragStartX = mouseDownX - this._x;
                this._posDragStartY = mouseDownY - this._y;
                this._events.trigger('area-move-start');
            }
        };

        CropAreaCircle.prototype.processMouseUp = function (/*mouseUpX, mouseUpY*/) {
            if (this._areaIsDragging) {
                this._areaIsDragging = false;
                this._events.trigger('area-move-end');
            }
            if (this._boxResizeIsDragging) {
                this._boxResizeIsDragging = false;
                this._events.trigger('area-resize-end');
            }
            this._areaIsHover = false;
            this._boxResizeIsHover = false;

            this._posDragStartX = 0;
            this._posDragStartY = 0;
        };

        return CropAreaCircle;
    }]);
}());

(function () {
        angular.module('pmImageCrop').factory('cropAreaSquare', ['cropArea', function (CropArea) {
        var CropAreaSquare = function () {
            CropArea.apply(this, arguments);

            this._resizeCtrlBaseRadius = 10;
            this._resizeCtrlNormalRatio = 0.75;
            this._resizeCtrlHoverRatio = 1;
            this._iconMoveNormalRatio = 0.9;
            this._iconMoveHoverRatio = 1.2;

            this._resizeCtrlNormalRadius = this._resizeCtrlBaseRadius * this._resizeCtrlNormalRatio;
            this._resizeCtrlHoverRadius = this._resizeCtrlBaseRadius * this._resizeCtrlHoverRatio;

            this._posDragStartX = 0;
            this._posDragStartY = 0;
            this._posResizeStartX = 0;
            this._posResizeStartY = 0;
            this._posResizeStartSize = 0;

            this._resizeCtrlIsHover = -1;
            this._areaIsHover = false;
            this._resizeCtrlIsDragging = -1;
            this._areaIsDragging = false;
        };

        CropAreaSquare.prototype = new CropArea();

        CropAreaSquare.prototype._calcSquareCorners = function () {
            var hSize = this._size / 2;
            return [
                [this._x - hSize, this._y - hSize],
                [this._x + hSize, this._y - hSize],
                [this._x - hSize, this._y + hSize],
                [this._x + hSize, this._y + hSize]
            ];
        };

        CropAreaSquare.prototype._calcSquareDimensions = function () {
            var hSize = this._size / 2;
            return {
                left: this._x - hSize,
                top: this._y - hSize,
                right: this._x + hSize,
                bottom: this._y + hSize
            };
        };

        CropAreaSquare.prototype._isCoordWithinArea = function (coord) {
            var squareDimensions = this._calcSquareDimensions();
            return (coord[0] >= squareDimensions.left && coord[0] <= squareDimensions.right && coord[1] >= squareDimensions.top && coord[1] <= squareDimensions.bottom);
        };

        CropAreaSquare.prototype._isCoordWithinResizeCtrl = function (coord) {
            var resizeIconsCenterCoords = this._calcSquareCorners();
            var res = -1;
            for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
                var resizeIconCenterCoords = resizeIconsCenterCoords[i];
                if (coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
                    coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
                    res = i;
                    break;
                }
            }
            return res;
        };

        CropAreaSquare.prototype._drawArea = function (ctx, centerCoords, size) {
            var hSize = size / 2;
            ctx.rect(centerCoords[0] - hSize, centerCoords[1] - hSize, size, size);
        };

        CropAreaSquare.prototype.draw = function () {
            CropArea.prototype.draw.apply(this, arguments);

            // draw move icon
            this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);

            // draw resize cubes
            var resizeIconsCenterCoords = this._calcSquareCorners();
            for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
                var resizeIconCenterCoords = resizeIconsCenterCoords[i];
                this._cropCanvas.drawIconResizeCircle(resizeIconCenterCoords, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover === i ? this._resizeCtrlHoverRatio : this._resizeCtrlNormalRatio);
            }
        };

        // jshint maxstatements:40
        CropAreaSquare.prototype.processMouseMove = function (mouseCurX, mouseCurY) {
            var cursor = 'default';
            var res = false;

            this._resizeCtrlIsHover = -1;
            this._areaIsHover = false;

            if (this._areaIsDragging) {
                this._x = mouseCurX - this._posDragStartX;
                this._y = mouseCurY - this._posDragStartY;
                this._areaIsHover = true;
                cursor = 'move';
                res = true;
                this._events.trigger('area-move');
            } else if (this._resizeCtrlIsDragging > -1) {
                var xMulti, yMulti;
                switch (this._resizeCtrlIsDragging) {
                    case 0: // Top Left
                        xMulti = -1;
                        yMulti = -1;
                        cursor = 'nwse-resize';
                        break;
                    case 1: // Top Right
                        xMulti = 1;
                        yMulti = -1;
                        cursor = 'nesw-resize';
                        break;
                    case 2: // Bottom Left
                        xMulti = -1;
                        yMulti = 1;
                        cursor = 'nesw-resize';
                        break;
                    case 3: // Bottom Right
                        xMulti = 1;
                        yMulti = 1;
                        cursor = 'nwse-resize';
                        break;
                }
                var iFX = (mouseCurX - this._posResizeStartX) * xMulti;
                var iFY = (mouseCurY - this._posResizeStartY) * yMulti;
                var iFR;
                if (iFX > iFY) {
                    iFR = this._posResizeStartSize + iFY;
                } else {
                    iFR = this._posResizeStartSize + iFX;
                }
                var wasSize = this._size;
                this._size = Math.max(this._minSize, iFR);
                var posModifier = (this._size - wasSize) / 2;
                this._x += posModifier * xMulti;
                this._y += posModifier * yMulti;
                this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
                res = true;
                this._events.trigger('area-resize');
            } else {
                var hoveredResizeBox = this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
                if (hoveredResizeBox > -1) {
                    switch (hoveredResizeBox) {
                        case 0:
                            cursor = 'nwse-resize';
                            break;
                        case 1:
                            cursor = 'nesw-resize';
                            break;
                        case 2:
                            cursor = 'nesw-resize';
                            break;
                        case 3:
                            cursor = 'nwse-resize';
                            break;
                    }
                    this._areaIsHover = false;
                    this._resizeCtrlIsHover = hoveredResizeBox;
                    res = true;
                } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                    cursor = 'move';
                    this._areaIsHover = true;
                    res = true;
                }
            }

            this._dontDragOutside();
            angular.element(this._ctx.canvas).css({'cursor': cursor});

            return res;
        };

        CropAreaSquare.prototype.processMouseDown = function (mouseDownX, mouseDownY) {
            var isWithinResizeCtrl = this._isCoordWithinResizeCtrl([mouseDownX, mouseDownY]);
            if (isWithinResizeCtrl > -1) {
                this._areaIsDragging = false;
                this._areaIsHover = false;
                this._resizeCtrlIsDragging = isWithinResizeCtrl;
                this._resizeCtrlIsHover = isWithinResizeCtrl;
                this._posResizeStartX = mouseDownX;
                this._posResizeStartY = mouseDownY;
                this._posResizeStartSize = this._size;
                this._events.trigger('area-resize-start');
            } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
                this._areaIsDragging = true;
                this._areaIsHover = true;
                this._resizeCtrlIsDragging = -1;
                this._resizeCtrlIsHover = -1;
                this._posDragStartX = mouseDownX - this._x;
                this._posDragStartY = mouseDownY - this._y;
                this._events.trigger('area-move-start');
            }
        };

        CropAreaSquare.prototype.processMouseUp = function (/*mouseUpX, mouseUpY*/) {
            if (this._areaIsDragging) {
                this._areaIsDragging = false;
                this._events.trigger('area-move-end');
            }
            if (this._resizeCtrlIsDragging > -1) {
                this._resizeCtrlIsDragging = -1;
                this._events.trigger('area-resize-end');
            }
            this._areaIsHover = false;
            this._resizeCtrlIsHover = -1;

            this._posDragStartX = 0;
            this._posDragStartY = 0;
        };

        return CropAreaSquare;
    }]);
}());

(function () {
        angular.module('pmImageCrop').factory('cropArea', ['cropCanvas', function (CropCanvas) {
        var CropArea = function (ctx, events) {
            this._ctx = ctx;
            this._events = events;

            this._minSize = 80;

            this._cropCanvas = new CropCanvas(ctx);

            this._image = new Image();
            this._x = 0;
            this._y = 0;
            this._size = 200;
        };

        /* GETTERS/SETTERS */

        CropArea.prototype.getImage = function () {
            return this._image;
        };
        CropArea.prototype.setImage = function (image) {
            this._image = image;
        };

        CropArea.prototype.getX = function () {
            return this._x;
        };
        CropArea.prototype.setX = function (x) {
            this._x = x;
            this._dontDragOutside();
        };

        CropArea.prototype.getY = function () {
            return this._y;
        };
        CropArea.prototype.setY = function (y) {
            this._y = y;
            this._dontDragOutside();
        };

        CropArea.prototype.getSize = function () {
            return this._size;
        };
        CropArea.prototype.setSize = function (size) {
            this._size = Math.max(this._minSize, size);
            this._dontDragOutside();
        };

        CropArea.prototype.getMinSize = function () {
            return this._minSize;
        };
        CropArea.prototype.setMinSize = function (size) {
            this._minSize = size;
            this._size = Math.max(this._minSize, this._size);
            this._dontDragOutside();
        };

        /* FUNCTIONS */
        CropArea.prototype._dontDragOutside = function () {
            var h = this._ctx.canvas.height,
                w = this._ctx.canvas.width;
            if (this._size > w) {
                this._size = w;
            }
            if (this._size > h) {
                this._size = h;
            }
            if (this._x < this._size / 2) {
                this._x = this._size / 2;
            }
            if (this._x > w - this._size / 2) {
                this._x = w - this._size / 2;
            }
            if (this._y < this._size / 2) {
                this._y = this._size / 2;
            }
            if (this._y > h - this._size / 2) {
                this._y = h - this._size / 2;
            }
        };

        CropArea.prototype._drawArea = function () {
        };

        CropArea.prototype.draw = function () {
            // draw crop area
            this._cropCanvas.drawCropArea(this._image, [this._x, this._y], this._size, this._drawArea);
        };

        CropArea.prototype.processMouseMove = function () {
        };

        CropArea.prototype.processMouseDown = function () {
        };

        CropArea.prototype.processMouseUp = function () {
        };

        return CropArea;
    }]);
}());


(function () {
        angular.module('pmImageCrop').factory('cropCanvas', [function () {
        // Shape = Array of [x,y]; [0, 0] - center
        var shapeArrowNW = [[-0.5, -2], [-3, -4.5], [-0.5, -7], [-7, -7], [-7, -0.5], [-4.5, -3], [-2, -0.5]];
        var shapeArrowNE = [[0.5, -2], [3, -4.5], [0.5, -7], [7, -7], [7, -0.5], [4.5, -3], [2, -0.5]];
        var shapeArrowSW = [[-0.5, 2], [-3, 4.5], [-0.5, 7], [-7, 7], [-7, 0.5], [-4.5, 3], [-2, 0.5]];
        var shapeArrowSE = [[0.5, 2], [3, 4.5], [0.5, 7], [7, 7], [7, 0.5], [4.5, 3], [2, 0.5]];
        var shapeArrowN = [[-1.5, -2.5], [-1.5, -6], [-5, -6], [0, -11], [5, -6], [1.5, -6], [1.5, -2.5]];
        var shapeArrowW = [[-2.5, -1.5], [-6, -1.5], [-6, -5], [-11, 0], [-6, 5], [-6, 1.5], [-2.5, 1.5]];
        var shapeArrowS = [[-1.5, 2.5], [-1.5, 6], [-5, 6], [0, 11], [5, 6], [1.5, 6], [1.5, 2.5]];
        var shapeArrowE = [[2.5, -1.5], [6, -1.5], [6, -5], [11, 0], [6, 5], [6, 1.5], [2.5, 1.5]];

        // Colors
        var colors = {
            areaOutline: '#fff',
            resizeBoxStroke: '#fff',
            resizeBoxFill: '#444',
            resizeBoxArrowFill: '#fff',
            resizeCircleStroke: '#fff',
            resizeCircleFill: '#444',
            moveIconFill: '#fff'
        };

        return function (ctx) {

            /* Base functions */

            // Calculate Point
            var calcPoint = function (point, offset, scale) {
                return [scale * point[0] + offset[0], scale * point[1] + offset[1]];
            };

            // Draw Filled Polygon
            var drawFilledPolygon = function (shape, fillStyle, centerCoords, scale) {
                ctx.save();
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                var pc, pc0 = calcPoint(shape[0], centerCoords, scale);
                ctx.moveTo(pc0[0], pc0[1]);

                for (var p in shape) {
                    if (p > 0) {
                        pc = calcPoint(shape[p], centerCoords, scale);
                        ctx.lineTo(pc[0], pc[1]);
                    }
                }

                ctx.lineTo(pc0[0], pc0[1]);
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            };

            /* Icons */

            this.drawIconMove = function (centerCoords, scale) {
                drawFilledPolygon(shapeArrowN, colors.moveIconFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowW, colors.moveIconFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowS, colors.moveIconFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowE, colors.moveIconFill, centerCoords, scale);
            };

            this.drawIconResizeCircle = function (centerCoords, circleRadius, scale) {
                var scaledCircleRadius = circleRadius * scale;
                ctx.save();
                ctx.strokeStyle = colors.resizeCircleStroke;
                ctx.lineWidth = 2;
                ctx.fillStyle = colors.resizeCircleFill;
                ctx.beginPath();
                ctx.arc(centerCoords[0], centerCoords[1], scaledCircleRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            };

            this.drawIconResizeBoxBase = function (centerCoords, boxSize, scale) {
                var scaledBoxSize = boxSize * scale;
                ctx.save();
                ctx.strokeStyle = colors.resizeBoxStroke;
                ctx.lineWidth = 2;
                ctx.fillStyle = colors.resizeBoxFill;
                ctx.fillRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
                ctx.strokeRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
                ctx.restore();
            };
            this.drawIconResizeBoxNESW = function (centerCoords, boxSize, scale) {
                this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
                drawFilledPolygon(shapeArrowNE, colors.resizeBoxArrowFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowSW, colors.resizeBoxArrowFill, centerCoords, scale);
            };
            this.drawIconResizeBoxNWSE = function (centerCoords, boxSize, scale) {
                this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
                drawFilledPolygon(shapeArrowNW, colors.resizeBoxArrowFill, centerCoords, scale);
                drawFilledPolygon(shapeArrowSE, colors.resizeBoxArrowFill, centerCoords, scale);
            };

            /* Crop Area */

            this.drawCropArea = function (image, centerCoords, size, fnDrawClipPath) {
                var xRatio = image.width / ctx.canvas.width,
                    yRatio = image.height / ctx.canvas.height,
                    xLeft = centerCoords[0] - size / 2,
                    yTop = centerCoords[1] - size / 2;

                ctx.save();
                ctx.strokeStyle = colors.areaOutline;
                ctx.lineWidth = 2;
                ctx.beginPath();
                fnDrawClipPath(ctx, centerCoords, size);
                ctx.stroke();
                ctx.clip();

                // draw part of original image
                if (size > 0) {
                    ctx.drawImage(image, xLeft * xRatio, yTop * yRatio, size * xRatio, size * yRatio, xLeft, yTop, size, size);
                }

                ctx.beginPath();
                fnDrawClipPath(ctx, centerCoords, size);
                ctx.stroke();
                ctx.clip();

                ctx.restore();
            };

        };
    }]);
}());

/**
 * EXIF service is based on the exif-js library (https://github.com/jseidelin/exif-js)
 */
(function () {
        angular.module('pmImageCrop').service('cropEXIF', [function () {
        var debug = false;

        var ExifTags = this.Tags = {

            // version tags
            0x9000: 'ExifVersion',             // EXIF version
            0xA000: 'FlashpixVersion',         // Flashpix format version

            // colorspace tags
            0xA001: 'ColorSpace',              // Color space information tag

            // image configuration
            0xA002: 'PixelXDimension',         // Valid width of meaningful image
            0xA003: 'PixelYDimension',         // Valid height of meaningful image
            0x9101: 'ComponentsConfiguration', // Information about channels
            0x9102: 'CompressedBitsPerPixel',  // Compressed bits per pixel

            // user information
            0x927C: 'MakerNote',               // Any desired information written by the manufacturer
            0x9286: 'UserComment',             // Comments by user

            // related file
            0xA004: 'RelatedSoundFile',        // Name of related sound file

            // date and time
            0x9003: 'DateTimeOriginal',        // Date and time when the original image was generated
            0x9004: 'DateTimeDigitized',       // Date and time when the image was stored digitally
            0x9290: 'SubsecTime',              // Fractions of seconds for DateTime
            0x9291: 'SubsecTimeOriginal',      // Fractions of seconds for DateTimeOriginal
            0x9292: 'SubsecTimeDigitized',     // Fractions of seconds for DateTimeDigitized

            // picture-taking conditions
            0x829A: 'ExposureTime',            // Exposure time (in seconds)
            0x829D: 'FNumber',                 // F number
            0x8822: 'ExposureProgram',         // Exposure program
            0x8824: 'SpectralSensitivity',     // Spectral sensitivity
            0x8827: 'ISOSpeedRatings',         // ISO speed rating
            0x8828: 'OECF',                    // Optoelectric conversion factor
            0x9201: 'ShutterSpeedValue',       // Shutter speed
            0x9202: 'ApertureValue',           // Lens aperture
            0x9203: 'BrightnessValue',         // Value of brightness
            0x9204: 'ExposureBias',            // Exposure bias
            0x9205: 'MaxApertureValue',        // Smallest F number of lens
            0x9206: 'SubjectDistance',         // Distance to subject in meters
            0x9207: 'MeteringMode',            // Metering mode
            0x9208: 'LightSource',             // Kind of light source
            0x9209: 'Flash',                   // Flash status
            0x9214: 'SubjectArea',             // Location and area of main subject
            0x920A: 'FocalLength',             // Focal length of the lens in mm
            0xA20B: 'FlashEnergy',             // Strobe energy in BCPS
            0xA20C: 'SpatialFrequencyResponse',    //
            0xA20E: 'FocalPlaneXResolution',   // Number of pixels in width direction per FocalPlaneResolutionUnit
            0xA20F: 'FocalPlaneYResolution',   // Number of pixels in height direction per FocalPlaneResolutionUnit
            0xA210: 'FocalPlaneResolutionUnit',    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
            0xA214: 'SubjectLocation',         // Location of subject in image
            0xA215: 'ExposureIndex',           // Exposure index selected on camera
            0xA217: 'SensingMethod',           // Image sensor type
            0xA300: 'FileSource',              // Image source (3 == DSC)
            0xA301: 'SceneType',               // Scene type (1 == directly photographed)
            0xA302: 'CFAPattern',              // Color filter array geometric pattern
            0xA401: 'CustomRendered',          // Special processing
            0xA402: 'ExposureMode',            // Exposure mode
            0xA403: 'WhiteBalance',            // 1 = auto white balance, 2 = manual
            0xA404: 'DigitalZoomRation',       // Digital zoom ratio
            0xA405: 'FocalLengthIn35mmFilm',   // Equivalent foacl length assuming 35mm film camera (in mm)
            0xA406: 'SceneCaptureType',        // Type of scene
            0xA407: 'GainControl',             // Degree of overall image gain adjustment
            0xA408: 'Contrast',                // Direction of contrast processing applied by camera
            0xA409: 'Saturation',              // Direction of saturation processing applied by camera
            0xA40A: 'Sharpness',               // Direction of sharpness processing applied by camera
            0xA40B: 'DeviceSettingDescription',    //
            0xA40C: 'SubjectDistanceRange',    // Distance to subject

            // other tags
            0xA005: 'InteroperabilityIFDPointer',
            0xA420: 'ImageUniqueID'            // Identifier assigned uniquely to each image
        };

        var TiffTags = this.TiffTags = {
            0x0100: 'ImageWidth',
            0x0101: 'ImageHeight',
            0x8769: 'ExifIFDPointer',
            0x8825: 'GPSInfoIFDPointer',
            0xA005: 'InteroperabilityIFDPointer',
            0x0102: 'BitsPerSample',
            0x0103: 'Compression',
            0x0106: 'PhotometricInterpretation',
            0x0112: 'Orientation',
            0x0115: 'SamplesPerPixel',
            0x011C: 'PlanarConfiguration',
            0x0212: 'YCbCrSubSampling',
            0x0213: 'YCbCrPositioning',
            0x011A: 'XResolution',
            0x011B: 'YResolution',
            0x0128: 'ResolutionUnit',
            0x0111: 'StripOffsets',
            0x0116: 'RowsPerStrip',
            0x0117: 'StripByteCounts',
            0x0201: 'JPEGInterchangeFormat',
            0x0202: 'JPEGInterchangeFormatLength',
            0x012D: 'TransferFunction',
            0x013E: 'WhitePoint',
            0x013F: 'PrimaryChromaticities',
            0x0211: 'YCbCrCoefficients',
            0x0214: 'ReferenceBlackWhite',
            0x0132: 'DateTime',
            0x010E: 'ImageDescription',
            0x010F: 'Make',
            0x0110: 'Model',
            0x0131: 'Software',
            0x013B: 'Artist',
            0x8298: 'Copyright'
        };

        var GPSTags = this.GPSTags = {
            0x0000: 'GPSVersionID',
            0x0001: 'GPSLatitudeRef',
            0x0002: 'GPSLatitude',
            0x0003: 'GPSLongitudeRef',
            0x0004: 'GPSLongitude',
            0x0005: 'GPSAltitudeRef',
            0x0006: 'GPSAltitude',
            0x0007: 'GPSTimeStamp',
            0x0008: 'GPSSatellites',
            0x0009: 'GPSStatus',
            0x000A: 'GPSMeasureMode',
            0x000B: 'GPSDOP',
            0x000C: 'GPSSpeedRef',
            0x000D: 'GPSSpeed',
            0x000E: 'GPSTrackRef',
            0x000F: 'GPSTrack',
            0x0010: 'GPSImgDirectionRef',
            0x0011: 'GPSImgDirection',
            0x0012: 'GPSMapDatum',
            0x0013: 'GPSDestLatitudeRef',
            0x0014: 'GPSDestLatitude',
            0x0015: 'GPSDestLongitudeRef',
            0x0016: 'GPSDestLongitude',
            0x0017: 'GPSDestBearingRef',
            0x0018: 'GPSDestBearing',
            0x0019: 'GPSDestDistanceRef',
            0x001A: 'GPSDestDistance',
            0x001B: 'GPSProcessingMethod',
            0x001C: 'GPSAreaInformation',
            0x001D: 'GPSDateStamp',
            0x001E: 'GPSDifferential'
        };

        var StringValues = this.StringValues = {
            ExposureProgram: {
                0: 'Not defined',
                1: 'Manual',
                2: 'Normal program',
                3: 'Aperture priority',
                4: 'Shutter priority',
                5: 'Creative program',
                6: 'Action program',
                7: 'Portrait mode',
                8: 'Landscape mode'
            },
            MeteringMode: {
                0: 'Unknown',
                1: 'Average',
                2: 'CenterWeightedAverage',
                3: 'Spot',
                4: 'MultiSpot',
                5: 'Pattern',
                6: 'Partial',
                255: 'Other'
            },
            LightSource: {
                0: 'Unknown',
                1: 'Daylight',
                2: 'Fluorescent',
                3: 'Tungsten (incandescent light)',
                4: 'Flash',
                9: 'Fine weather',
                10: 'Cloudy weather',
                11: 'Shade',
                12: 'Daylight fluorescent (D 5700 - 7100K)',
                13: 'Day white fluorescent (N 4600 - 5400K)',
                14: 'Cool white fluorescent (W 3900 - 4500K)',
                15: 'White fluorescent (WW 3200 - 3700K)',
                17: 'Standard light A',
                18: 'Standard light B',
                19: 'Standard light C',
                20: 'D55',
                21: 'D65',
                22: 'D75',
                23: 'D50',
                24: 'ISO studio tungsten',
                255: 'Other'
            },
            Flash: {
                0x0000: 'Flash did not fire',
                0x0001: 'Flash fired',
                0x0005: 'Strobe return light not detected',
                0x0007: 'Strobe return light detected',
                0x0009: 'Flash fired, compulsory flash mode',
                0x000D: 'Flash fired, compulsory flash mode, return light not detected',
                0x000F: 'Flash fired, compulsory flash mode, return light detected',
                0x0010: 'Flash did not fire, compulsory flash mode',
                0x0018: 'Flash did not fire, auto mode',
                0x0019: 'Flash fired, auto mode',
                0x001D: 'Flash fired, auto mode, return light not detected',
                0x001F: 'Flash fired, auto mode, return light detected',
                0x0020: 'No flash function',
                0x0041: 'Flash fired, red-eye reduction mode',
                0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
                0x0047: 'Flash fired, red-eye reduction mode, return light detected',
                0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
                0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
                0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
                0x0059: 'Flash fired, auto mode, red-eye reduction mode',
                0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
                0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
            },
            SensingMethod: {
                1: 'Not defined',
                2: 'One-chip color area sensor',
                3: 'Two-chip color area sensor',
                4: 'Three-chip color area sensor',
                5: 'Color sequential area sensor',
                7: 'Trilinear sensor',
                8: 'Color sequential linear sensor'
            },
            SceneCaptureType: {
                0: 'Standard',
                1: 'Landscape',
                2: 'Portrait',
                3: 'Night scene'
            },
            SceneType: {
                1: 'Directly photographed'
            },
            CustomRendered: {
                0: 'Normal process',
                1: 'Custom process'
            },
            WhiteBalance: {
                0: 'Auto white balance',
                1: 'Manual white balance'
            },
            GainControl: {
                0: 'None',
                1: 'Low gain up',
                2: 'High gain up',
                3: 'Low gain down',
                4: 'High gain down'
            },
            Contrast: {
                0: 'Normal',
                1: 'Soft',
                2: 'Hard'
            },
            Saturation: {
                0: 'Normal',
                1: 'Low saturation',
                2: 'High saturation'
            },
            Sharpness: {
                0: 'Normal',
                1: 'Soft',
                2: 'Hard'
            },
            SubjectDistanceRange: {
                0: 'Unknown',
                1: 'Macro',
                2: 'Close view',
                3: 'Distant view'
            },
            FileSource: {
                3: 'DSC'
            },

            Components: {
                0: '',
                1: 'Y',
                2: 'Cb',
                3: 'Cr',
                4: 'R',
                5: 'G',
                6: 'B'
            }
        };

        function imageHasData(img) {
            return !!(img.exifdata);
        }

        function base64ToArrayBuffer(base64, contentType) {
            contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
            base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
            var binary = atob(base64);
            var len = binary.length;
            var buffer = new ArrayBuffer(len);
            var view = new Uint8Array(buffer);
            for (var i = 0; i < len; i++) {
                view[i] = binary.charCodeAt(i);
            }
            return buffer;
        }

        function objectURLToBlob(url, callback) {
            var http = new XMLHttpRequest();
            http.open('GET', url, true);
            http.responseType = 'blob';
            http.onload = function () {
                if (this.status === 200 || this.status === 0) {
                    callback(this.response);
                }
            };
            http.send();
        }

        function getStringFromDB(buffer, start, length) {
            var outstr = '';
            for (var n = start; n < start + length; n++) {
                outstr += String.fromCharCode(buffer.getUint8(n));
            }
            return outstr;
        }

        function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
            var type = file.getUint16(entryOffset + 2, !bigEnd),
                numValues = file.getUint32(entryOffset + 4, !bigEnd),
                valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart,
                offset,
                vals, val, n,
                numerator, denominator;

            switch (type) {
                case 1: // byte, 8-bit unsigned int
                case 7: // undefined, 8-bit byte, value depending on field
                    if (numValues === 1) {
                        return file.getUint8(entryOffset + 8, !bigEnd);
                    } else {
                        offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                        vals = [];
                        for (n = 0; n < numValues; n++) {
                            vals[n] = file.getUint8(offset + n);
                        }
                        return vals;
                    }
                    break;
                case 2: // ascii, 8-bit byte
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    return getStringFromDB(file, offset, numValues - 1);

                case 3: // short, 16 bit int
                    if (numValues === 1) {
                        return file.getUint16(entryOffset + 8, !bigEnd);
                    } else {
                        offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                        vals = [];
                        for (n = 0; n < numValues; n++) {
                            vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
                        }
                        return vals;
                    }
                    break;
                case 4: // long, 32 bit int
                    if (numValues === 1) {
                        return file.getUint32(entryOffset + 8, !bigEnd);
                    } else {
                        vals = [];
                        for (n = 0; n < numValues; n++) {
                            vals[n] = file.getUint32(valueOffset + 4 * n, !bigEnd);
                        }
                        return vals;
                    }
                    break;
                case 5:    // rational = two long values, first is numerator, second is denominator
                    if (numValues === 1) {
                        numerator = file.getUint32(valueOffset, !bigEnd);
                        denominator = file.getUint32(valueOffset + 4, !bigEnd);
                        val = new Number(numerator / denominator); // jshint ignore:line
                        val.numerator = numerator;
                        val.denominator = denominator;
                        return val;
                    } else {
                        vals = [];
                        for (n = 0; n < numValues; n++) {
                            numerator = file.getUint32(valueOffset + 8 * n, !bigEnd);
                            denominator = file.getUint32(valueOffset + 4 + 8 * n, !bigEnd);
                            vals[n] = new Number(numerator / denominator); // jshint ignore:line
                            vals[n].numerator = numerator;
                            vals[n].denominator = denominator;
                        }
                        return vals;
                    }
                    break;
                case 9: // slong, 32 bit signed int
                    if (numValues === 1) {
                        return file.getInt32(entryOffset + 8, !bigEnd);
                    } else {
                        vals = [];
                        for (n = 0; n < numValues; n++) {
                            vals[n] = file.getInt32(valueOffset + 4 * n, !bigEnd);
                        }
                        return vals;
                    }
                    break;
                case 10: // signed rational, two slongs, first is numerator, second is denominator
                    if (numValues === 1) {
                        return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset + 4, !bigEnd);
                    } else {
                        vals = [];
                        for (n = 0; n < numValues; n++) {
                            vals[n] = file.getInt32(valueOffset + 8 * n, !bigEnd) / file.getInt32(valueOffset + 4 + 8 * n, !bigEnd);
                        }
                        return vals;
                    }
                    break;
            }
        }

        function readTags(file, tiffStart, dirStart, strings, bigEnd) {
            var entries = file.getUint16(dirStart, !bigEnd),
                tags = {},
                entryOffset, tag,
                i;

            for (i = 0; i < entries; i++) {
                entryOffset = dirStart + i * 12 + 2;
                tag = strings[file.getUint16(entryOffset, !bigEnd)];
                if (!tag && debug) {
                    console.log('Unknown tag: ' + file.getUint16(entryOffset, !bigEnd));
                }
                tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
            }
            return tags;
        }

        // jshint maxstatements:35
        function readEXIFData(file, start) {
            if (getStringFromDB(file, start, 4) !== 'Exif') {
                if (debug) {
                    console.log('Not valid EXIF data! ' + getStringFromDB(file, start, 4));
                }
                return false;
            }

            var bigEnd,
                tags, tag,
                exifData, gpsData,
                tiffOffset = start + 6;

            // test for TIFF validity and endianness
            if (file.getUint16(tiffOffset) === 0x4949) {
                bigEnd = false;
            } else if (file.getUint16(tiffOffset) === 0x4D4D) {
                bigEnd = true;
            } else {
                if (debug) {
                    console.log('Not valid TIFF data! (no 0x4949 or 0x4D4D)');
                }
                return false;
            }

            if (file.getUint16(tiffOffset + 2, !bigEnd) !== 0x002A) {
                if (debug) {
                    console.log('Not valid TIFF data! (no 0x002A)');
                }
                return false;
            }

            var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);

            if (firstIFDOffset < 0x00000008) {
                if (debug) {
                    console.log('Not valid TIFF data! (First offset less than 8)', file.getUint32(tiffOffset + 4, !bigEnd));
                }
                return false;
            }

            tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

            if (tags.ExifIFDPointer) {
                exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
                for (tag in exifData) {
                    if (exifData.hasOwnProperty(tag)) {
                        switch (tag) {
                            case 'LightSource' :
                            case 'Flash' :
                            case 'MeteringMode' :
                            case 'ExposureProgram' :
                            case 'SensingMethod' :
                            case 'SceneCaptureType' :
                            case 'SceneType' :
                            case 'CustomRendered' :
                            case 'WhiteBalance' :
                            case 'GainControl' :
                            case 'Contrast' :
                            case 'Saturation' :
                            case 'Sharpness' :
                            case 'SubjectDistanceRange' :
                            case 'FileSource' :
                                exifData[tag] = StringValues[tag][exifData[tag]];
                                break;

                            case 'ExifVersion' :
                            case 'FlashpixVersion' :
                                exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                                break;

                            case 'ComponentsConfiguration' :
                                exifData[tag] =
                                    StringValues.Components[exifData[tag][0]] +
                                    StringValues.Components[exifData[tag][1]] +
                                    StringValues.Components[exifData[tag][2]] +
                                    StringValues.Components[exifData[tag][3]];
                                break;
                        }
                        tags[tag] = exifData[tag];
                    }
                }
            }

            if (tags.GPSInfoIFDPointer) {
                gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
                for (tag in gpsData) {
                    if (gpsData.hasOwnProperty(tag)) {
                        switch (tag) {
                            case 'GPSVersionID' :
                                gpsData[tag] = gpsData[tag][0] +
                                    '.' + gpsData[tag][1] +
                                    '.' + gpsData[tag][2] +
                                    '.' + gpsData[tag][3];
                                break;
                        }
                        tags[tag] = gpsData[tag];
                    }
                }
            }

            return tags;
        }

        function findEXIFinJPEG(file) {
            var dataView = new DataView(file);

            if (debug) {
                console.log('Got file of length ' + file.byteLength);
            }
            if ((dataView.getUint8(0) !== 0xFF) || (dataView.getUint8(1) !== 0xD8)) {
                if (debug) {
                    console.log('Not a valid JPEG');
                }
                return false; // not a valid jpeg
            }

            var offset = 2,
                length = file.byteLength,
                marker;

            while (offset < length) {
                if (dataView.getUint8(offset) !== 0xFF) {
                    if (debug) {
                        console.log('Not a valid marker at offset ' + offset + ', found: ' + dataView.getUint8(offset));
                    }
                    return false; // not a valid marker, something is wrong
                }

                marker = dataView.getUint8(offset + 1);
                if (debug) {
                    console.log(marker);
                }

                // we could implement handling for other markers here,
                // but we're only looking for 0xFFE1 for EXIF data

                if (marker === 225) {
                    if (debug) {
                        console.log('Found 0xFFE1 marker');
                    }

                    return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                    // offset += 2 + file.getShortAt(offset+2, true);

                } else {
                    offset += 2 + dataView.getUint16(offset + 2);
                }

            }

        }

        var IptcFieldMap = {
            0x78: 'caption',
            0x6E: 'credit',
            0x19: 'keywords',
            0x37: 'dateCreated',
            0x50: 'byline',
            0x55: 'bylineTitle',
            0x7A: 'captionWriter',
            0x69: 'headline',
            0x74: 'copyright',
            0x0F: 'category'
        };

        function readIPTCData(file, startOffset, sectionLength) {
            var dataView = new DataView(file);
            var data = {};
            var fieldValue, fieldName, dataSize, segmentType, segmentSize;
            var segmentStartPos = startOffset;
            while (segmentStartPos < startOffset + sectionLength) {
                if (dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos + 1) === 0x02) {
                    segmentType = dataView.getUint8(segmentStartPos + 2);
                    if (segmentType in IptcFieldMap) {
                        dataSize = dataView.getInt16(segmentStartPos + 3);
                        segmentSize = dataSize + 5;
                        fieldName = IptcFieldMap[segmentType];
                        fieldValue = getStringFromDB(dataView, segmentStartPos + 5, dataSize);
                        // Check if we already stored a value with this name
                        if (data.hasOwnProperty(fieldName)) {
                            // Value already stored with this name, create multivalue field
                            if (data[fieldName] instanceof Array) {
                                data[fieldName].push(fieldValue);
                            }
                            else {
                                data[fieldName] = [data[fieldName], fieldValue];
                            }
                        }
                        else {
                            data[fieldName] = fieldValue;
                        }
                    }

                }
                segmentStartPos++;
            }
            return data;
        }

        function findIPTCinJPEG(file) {
            var dataView = new DataView(file);

            if (debug) {
                console.log('Got file of length ' + file.byteLength);
            }
            if ((dataView.getUint8(0) !== 0xFF) || (dataView.getUint8(1) !== 0xD8)) {
                if (debug) {
                    console.log('Not a valid JPEG');
                }
                return false; // not a valid jpeg
            }

            var offset = 2,
                length = file.byteLength;

            var isFieldSegmentStart = function (dataView, offset) {
                return (
                    dataView.getUint8(offset) === 0x38 &&
                    dataView.getUint8(offset + 1) === 0x42 &&
                    dataView.getUint8(offset + 2) === 0x49 &&
                    dataView.getUint8(offset + 3) === 0x4D &&
                    dataView.getUint8(offset + 4) === 0x04 &&
                    dataView.getUint8(offset + 5) === 0x04
                );
            };

            while (offset < length) {

                if (isFieldSegmentStart(dataView, offset)) {

                    // Get the length of the name header (which is padded to an even number of bytes)
                    var nameHeaderLength = dataView.getUint8(offset + 7);
                    if (nameHeaderLength % 2 !== 0) {
                        nameHeaderLength += 1;
                    }
                    // Check for pre photoshop 6 format
                    if (nameHeaderLength === 0) {
                        // Always 4
                        nameHeaderLength = 4;
                    }

                    var startOffset = offset + 8 + nameHeaderLength;
                    var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                    return readIPTCData(file, startOffset, sectionLength);
                }

                // Not the marker, continue searching
                offset++;

            }

        }

        function getImageData(img, callback) {
            function handleBinaryFile(binFile) {
                var data = findEXIFinJPEG(binFile);
                var iptcdata = findIPTCinJPEG(binFile);
                img.exifdata = data || {};
                img.iptcdata = iptcdata || {};
                if (callback) {
                    callback.call(img);
                }
            }

            var fileReader;
            if (img.src) {
                if (/^data\:/i.test(img.src)) { // Data URI
                    var arrayBuffer = base64ToArrayBuffer(img.src);
                    handleBinaryFile(arrayBuffer);

                } else if (/^blob\:/i.test(img.src)) { // Object URL
                    fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        handleBinaryFile(e.target.result);
                    };
                    objectURLToBlob(img.src, function (blob) {
                        fileReader.readAsArrayBuffer(blob);
                    });
                } else {
                    var http = new XMLHttpRequest();
                    http.onload = function () {
                        if (this.status === 200 || this.status === 0) {
                            handleBinaryFile(http.response);
                        } else {
                            throw 'Could not load image';
                        }
                        http = null;
                    };
                    http.open('GET', img.src, true);
                    http.responseType = 'arraybuffer';
                    http.send(null);
                }
            } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
                fileReader = new FileReader();
                fileReader.onload = function (e) {
                    if (debug) {
                        console.log('Got file of length ' + e.target.result.byteLength);
                    }
                    handleBinaryFile(e.target.result);
                };

                fileReader.readAsArrayBuffer(img);
            }
        }

        this.getData = function (img, callback) {
            if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) {
                return false;
            }

            if (!imageHasData(img)) {
                getImageData(img, callback);
            } else {
                if (callback) {
                    callback.call(img);
                }
            }
            return true;
        };

        this.getTag = function (img, tag) {
            if (!imageHasData(img)) {
                return;
            }
            return img.exifdata[tag];
        };

        this.getAllTags = function (img) {
            if (!imageHasData(img)) {
                return {};
            }
            var a,
                data = img.exifdata,
                tags = {};
            for (a in data) {
                if (data.hasOwnProperty(a)) {
                    tags[a] = data[a];
                }
            }
            return tags;
        };

        this.pretty = function (img) {
            if (!imageHasData(img)) {
                return '';
            }
            var a,
                data = img.exifdata,
                strPretty = '';
            for (a in data) {
                if (data.hasOwnProperty(a)) {
                    if (typeof data[a] === 'object') {
                        if (data[a] instanceof Number) {
                            strPretty += a + ' : ' + data[a] + ' [' + data[a].numerator + '/' + data[a].denominator + ']\r\n';
                        } else {
                            strPretty += a + ' : [' + data[a].length + ' values]\r\n';
                        }
                    } else {
                        strPretty += a + ' : ' + data[a] + '\r\n';
                    }
                }
            }
            return strPretty;
        };

        this.readFromBinaryFile = function (file) {
            return findEXIFinJPEG(file);
        };
    }]);
}());

(function () {
        angular.module('pmImageCrop').factory('cropHost', ['$document', 'cropAreaCircle', 'cropAreaSquare', 'cropEXIF', function ($document, CropAreaCircle, CropAreaSquare, cropEXIF) {
        /* STATIC FUNCTIONS */

        // Get Element's Offset
        var getElementOffset = function (elem) {
            var box = elem.getBoundingClientRect();

            var body = document.body;
            var docElem = document.documentElement;

            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

            var top = box.top + scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            return {top: Math.round(top), left: Math.round(left)};
        };

        return function (elCanvas, opts, events) {
            /* PRIVATE VARIABLES */

            // Object Pointers
            var ctx = null,
                image = null,
                theArea = null;

            // Dimensions
            var minCanvasDims = [100, 100],
                maxCanvasDims = [300, 300];

            // Result Image size
            var resImgSize = 200;

            // Result Image type
            var resImgFormat = 'image/png';

            // Result Image quality
            var resImgQuality = null;

            /* PRIVATE FUNCTIONS */

            // Draw Scene
            function drawScene() {
                // clear canvas
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                if (image !== null) {
                    // draw source image
                    ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

                    ctx.save();

                    // and make it darker
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
                    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                    ctx.restore();

                    // draw Area
                    theArea.draw();
                }
            }

            // Resets CropHost
            var resetCropHost = function () {
                if (image !== null) {
                    theArea.setImage(image);
                    var imageDims = [image.width, image.height],
                        imageRatio = image.width / image.height,
                        canvasDims = imageDims;

                    if (canvasDims[0] > maxCanvasDims[0]) {
                        canvasDims[0] = maxCanvasDims[0];
                        canvasDims[1] = canvasDims[0] / imageRatio;
                    } else if (canvasDims[0] < minCanvasDims[0]) {
                        canvasDims[0] = minCanvasDims[0];
                        canvasDims[1] = canvasDims[0] / imageRatio;
                    }
                    if (canvasDims[1] > maxCanvasDims[1]) {
                        canvasDims[1] = maxCanvasDims[1];
                        canvasDims[0] = canvasDims[1] * imageRatio;
                    } else if (canvasDims[1] < minCanvasDims[1]) {
                        canvasDims[1] = minCanvasDims[1];
                        canvasDims[0] = canvasDims[1] * imageRatio;
                    }
                    elCanvas.prop('width', canvasDims[0]).prop('height', canvasDims[1]).css({
                        'margin-left': -canvasDims[0] / 2 + 'px',
                        'margin-top': -canvasDims[1] / 2 + 'px'
                    });

                    theArea.setX(ctx.canvas.width / 2);
                    theArea.setY(ctx.canvas.height / 2);
                    theArea.setSize(Math.min(200, ctx.canvas.width / 2, ctx.canvas.height / 2));
                } else {
                    elCanvas.prop('width', 0).prop('height', 0).css({'margin-top': 0});
                }

                drawScene();
            };

            /**
             * Returns event.changedTouches directly if event is a TouchEvent.
             * If event is a jQuery event, return changedTouches of event.originalEvent
             */
            var getChangedTouches = function (event) {
                if (angular.isDefined(event.changedTouches)) {
                    return event.changedTouches;
                } else {
                    return event.originalEvent.changedTouches;
                }
            };

            var onMouseMove = function (e) {
                if (image !== null) {
                    var offset = getElementOffset(ctx.canvas),
                        pageX, pageY;
                    if (e.type === 'touchmove') {
                        pageX = getChangedTouches(e)[0].pageX;
                        pageY = getChangedTouches(e)[0].pageY;
                    } else {
                        pageX = e.pageX;
                        pageY = e.pageY;
                    }
                    theArea.processMouseMove(pageX - offset.left, pageY - offset.top);
                    drawScene();
                }
            };

            var onMouseDown = function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (image !== null) {
                    var offset = getElementOffset(ctx.canvas),
                        pageX, pageY;
                    if (e.type === 'touchstart') {
                        pageX = getChangedTouches(e)[0].pageX;
                        pageY = getChangedTouches(e)[0].pageY;
                    } else {
                        pageX = e.pageX;
                        pageY = e.pageY;
                    }
                    theArea.processMouseDown(pageX - offset.left, pageY - offset.top);
                    drawScene();
                }
            };

            var onMouseUp = function (e) {
                if (image !== null) {
                    var offset = getElementOffset(ctx.canvas),
                        pageX, pageY;
                    if (e.type === 'touchend') {
                        pageX = getChangedTouches(e)[0].pageX;
                        pageY = getChangedTouches(e)[0].pageY;
                    } else {
                        pageX = e.pageX;
                        pageY = e.pageY;
                    }
                    theArea.processMouseUp(pageX - offset.left, pageY - offset.top);
                    drawScene();
                }
            };

            this.getResultImageDataURI = function () {
                var tempCtx, tempCanvas;
                tempCanvas = angular.element('<canvas></canvas>')[0];
                tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = resImgSize;
                tempCanvas.height = resImgSize;
                if (image !== null) {
                    tempCtx.drawImage(image, (theArea.getX() - theArea.getSize() / 2) * (image.width / ctx.canvas.width), (theArea.getY() - theArea.getSize() / 2) * (image.height / ctx.canvas.height), theArea.getSize() * (image.width / ctx.canvas.width), theArea.getSize() * (image.height / ctx.canvas.height), 0, 0, resImgSize, resImgSize);
                }
                if (resImgQuality !== null) {
                    return tempCanvas.toDataURL(resImgFormat, resImgQuality);
                }
                return tempCanvas.toDataURL(resImgFormat);
            };

            this.setNewImageSource = function (imageSource) {
                image = null;
                resetCropHost();
                events.trigger('image-updated');
                if (!!imageSource) {
                    var newImage = new Image();
                    if (imageSource.substring(0, 4).toLowerCase() === 'http') {
                        newImage.crossOrigin = 'anonymous';
                    }
                    newImage.onload = function () {
                        events.trigger('load-done');

                        cropEXIF.getData(newImage, function () {
                            var orientation = cropEXIF.getTag(newImage, 'Orientation');

                            if ([3, 6, 8].indexOf(orientation) > -1) {
                                var canvas = document.createElement('canvas'),
                                    ctx = canvas.getContext('2d'),
                                    cw = newImage.width, ch = newImage.height, cx = 0, cy = 0, deg = 0;
                                switch (orientation) {
                                    case 3:
                                        cx = -newImage.width;
                                        cy = -newImage.height;
                                        deg = 180;
                                        break;
                                    case 6:
                                        cw = newImage.height;
                                        ch = newImage.width;
                                        cy = -newImage.height;
                                        deg = 90;
                                        break;
                                    case 8:
                                        cw = newImage.height;
                                        ch = newImage.width;
                                        cx = -newImage.width;
                                        deg = 270;
                                        break;
                                }

                                canvas.width = cw;
                                canvas.height = ch;
                                ctx.rotate(deg * Math.PI / 180);
                                ctx.drawImage(newImage, cx, cy);

                                image = new Image();
                                image.src = canvas.toDataURL('image/png');
                            } else {
                                image = newImage;
                            }
                            resetCropHost();
                            events.trigger('image-updated');
                        });
                    };
                    newImage.onerror = function () {
                        events.trigger('load-error');
                    };
                    events.trigger('load-start');
                    newImage.src = imageSource;
                }
            };

            this.setMaxDimensions = function (width, height) {
                maxCanvasDims = [width, height];

                if (image !== null) {
                    var curWidth = ctx.canvas.width,
                        curHeight = ctx.canvas.height;

                    var imageDims = [image.width, image.height],
                        imageRatio = image.width / image.height,
                        canvasDims = imageDims;

                    if (canvasDims[0] > maxCanvasDims[0]) {
                        canvasDims[0] = maxCanvasDims[0];
                        canvasDims[1] = canvasDims[0] / imageRatio;
                    } else if (canvasDims[0] < minCanvasDims[0]) {
                        canvasDims[0] = minCanvasDims[0];
                        canvasDims[1] = canvasDims[0] / imageRatio;
                    }
                    if (canvasDims[1] > maxCanvasDims[1]) {
                        canvasDims[1] = maxCanvasDims[1];
                        canvasDims[0] = canvasDims[1] * imageRatio;
                    } else if (canvasDims[1] < minCanvasDims[1]) {
                        canvasDims[1] = minCanvasDims[1];
                        canvasDims[0] = canvasDims[1] * imageRatio;
                    }
                    elCanvas.prop('width', canvasDims[0]).prop('height', canvasDims[1]).css({
                        'margin-left': -canvasDims[0] / 2 + 'px',
                        'margin-top': -canvasDims[1] / 2 + 'px'
                    });

                    var ratioNewCurWidth = ctx.canvas.width / curWidth,
                        ratioNewCurHeight = ctx.canvas.height / curHeight,
                        ratioMin = Math.min(ratioNewCurWidth, ratioNewCurHeight);

                    theArea.setX(theArea.getX() * ratioNewCurWidth);
                    theArea.setY(theArea.getY() * ratioNewCurHeight);
                    theArea.setSize(theArea.getSize() * ratioMin);
                } else {
                    elCanvas.prop('width', 0).prop('height', 0).css({'margin-top': 0});
                }

                drawScene();

            };

            this.setAreaMinSize = function (size) {
                size = parseInt(size, 10);
                if (!isNaN(size)) {
                    theArea.setMinSize(size);
                    drawScene();
                }
            };

            this.setResultImageSize = function (size) {
                size = parseInt(size, 10);
                if (!isNaN(size)) {
                    resImgSize = size;
                }
            };

            this.setResultImageFormat = function (format) {
                resImgFormat = format;
            };

            this.setResultImageQuality = function (quality) {
                quality = parseFloat(quality);
                if (!isNaN(quality) && quality >= 0 && quality <= 1) {
                    resImgQuality = quality;
                }
            };

            this.setAreaType = function (type) {
                var curSize = theArea.getSize(),
                    curMinSize = theArea.getMinSize(),
                    curX = theArea.getX(),
                    curY = theArea.getY();

                var AreaClass = CropAreaCircle;
                if (type === 'square') {
                    AreaClass = CropAreaSquare;
                }
                theArea = new AreaClass(ctx, events);
                theArea.setMinSize(curMinSize);
                theArea.setSize(curSize);
                theArea.setX(curX);
                theArea.setY(curY);

                // resetCropHost();
                if (image !== null) {
                    theArea.setImage(image);
                }

                drawScene();
            };

            /* Life Cycle begins */

            // Init Context var
            ctx = elCanvas[0].getContext('2d');

            // Init CropArea
            theArea = new CropAreaCircle(ctx, events);

            // Init Mouse Event Listeners
            $document.on('mousemove', onMouseMove);
            elCanvas.on('mousedown', onMouseDown);
            $document.on('mouseup', onMouseUp);

            // Init Touch Event Listeners
            $document.on('touchmove', onMouseMove);
            elCanvas.on('touchstart', onMouseDown);
            $document.on('touchend', onMouseUp);

            // CropHost Destructor
            this.destroy = function () {
                $document.off('mousemove', onMouseMove);
                elCanvas.off('mousedown', onMouseDown);
                $document.off('mouseup', onMouseMove);

                $document.off('touchmove', onMouseMove);
                elCanvas.off('touchstart', onMouseDown);
                $document.off('touchend', onMouseMove);

                elCanvas.remove();
            };
        };

    }]);
}());


(function () {
        angular.module('pmImageCrop').factory('cropPubSub', [function () {
        return function () {
            var events = {};
            // Subscribe
            this.on = function (names, handler) {
                names.split(' ').forEach(function (name) {
                    if (!events[name]) {
                        events[name] = [];
                    }
                    events[name].push(handler);
                });
                return this;
            };
            // Publish
            this.trigger = function (name, args) {
                angular.forEach(events[name], function (handler) {
                    handler.call(null, args);
                });
                return this;
            };
        };
    }]);
}());

(function () {
    angular.module('pmImageEditor').
    factory('DraggableFactory', function() {
      var DraggableFactory = function() {
        this._originalMousePosition = { top: 0, left: 0 };
        this._position = { top: 0, left: 0 };

        this._size = { width: 0, height: 0 };
        this._parentSize = { width: 0, height: 0 };
      };

      /**
       * Return css that is a result of dragging.
       */
      DraggableFactory.prototype.css = function() {
        return {
          top: this._position.top+'px',
          left: this._position.left+'px'
        };
      };

      /**
       * Set start data of the draggable element.
       *
       * @param event - native event which happens on mouse down for element.
       * @param element - draggable element.
       * @param parentElement - draggable element parent.
       */
      DraggableFactory.prototype.dragStart = function(event, element, parentElement) {
        this
          .setPosition(
            parseInt(element.css('top'), 10) || 0,
            parseInt(element.css('left'), 10) || 0
          )
          .setOriginalMousePosition(event.screenY, event.screenX)
          .setSize(element)
          .setParentSize(parentElement);

        return this;
      };

      /**
       * Update position of draggable element.
       * Doublecheck that element is not go out of parent element borders.
       */
      DraggableFactory.prototype.updatePosition = function(top, left) {
        // Calculate new top-left position and check that it stays positive.
        this._position.top = Math.max(top - this._originalMousePosition.top, 0);
        this._position.left = Math.max(left - this._originalMousePosition.left, 0);

        // Doublecheck that new x and y is not go out from parent borders.
        if (this._position.left + this._size.width > this._parentSize.width) {
          this._position.left = this._parentSize.width - this._size.width;
        }

        if (this._position.top + this._size.height > this._parentSize.height) {
          this._position.top = this._parentSize.height - this._size.height;
        }

        return this;
      };

      /** Getters/setters */
      DraggableFactory.prototype.setPosition = function(top, left) {
        this._position = { top: top, left: left };

        return this;
      };

      DraggableFactory.prototype.getPosition = function() {
        return this._position;
      };

      DraggableFactory.prototype.setOriginalMousePosition = function(top, left) {
        this._originalMousePosition = {
          top: top - this._position.top,
          left: left - this._position.left
        };

        return this;
      };

      DraggableFactory.prototype.getOriginalMousePosition = function() {
        return this._originalMousePosition;
      };

      DraggableFactory.prototype.setSize = function(element) {
        this._size = {
          width: parseInt(element.css('width'), 10) || element[0].clientWidth,
          height: parseInt(element.css('height'), 10) || element[0].clientHeight
        };

        return this;
      };

      DraggableFactory.prototype.getSize = function() {
        return this._size;
      };

      DraggableFactory.prototype.setParentSize = function(parentElement) {
        this._parentSize = { 
          width: parseInt(parentElement.css('width'), 10) || parentElement[0].clientWidth,
          height: parseInt(parentElement.css('height'), 10) || parentElement[0].clientHeight
        };

        return this;
      };

      DraggableFactory.prototype.getParentSize = function() {
        return this._parentSize;
      };

      return DraggableFactory;
    }).
    controller('DraggableController', function($scope, $document, $rootScope, DraggableFactory) {
      $scope.draggableFactory = new DraggableFactory();

      $scope.draggableUiParams = function() {
        return {
          element: $scope.element,
          position: $scope.draggableFactory.getPosition()
        };
      };

      $scope.draggableMousedown = function(event) {
        // Prevent default dragging of selected content.
        event.preventDefault();

        $scope.draggableFactory.dragStart(event, $scope.element, $scope.parentElement);

        // Bind events to track drag.
        $document.on('mousemove', $scope.draggableMousemove);
        $document.on('mouseup', $scope.draggableMouseup);
      };

      $scope.draggableMousemove = function(event) {
        $scope.draggableFactory.updatePosition(event.screenY, event.screenX);

          // Set new element position.
        $scope.element.css($scope.draggableFactory.css());
      };

      $scope.draggableMouseup = function(event) {
        // Unbind events that track drag.
        $document.unbind('mousemove', $scope.draggableMousemove);
        $document.unbind('mouseup', $scope.draggableMouseup);

        $rootScope.$broadcast('dragStop', event, $scope.draggableUiParams());
      };
    }).
    directive('draggable', function() {
      return {
        restrict: 'A',
        controller: 'DraggableController',
        link: function(scope, element) {
          scope.element = element;
          scope.parentElement = element.parent();

          element.css({ position: 'absolute' });

          element.on('mousedown', function(event) {
            scope.draggableMousedown(event);
          });
        }
      };
    });
}());



(function () {
        angular.module('pmImageEditor').directive('editorPanel', function () {
        return {
            restrict: 'E',
            scope: {
            },
            link: function (scope, element) {
                var buttons = 'crop,rotate-cw,rotate-acw,flip-h,flip-v,undo,redo';
                buttons.split(',').forEach(function(name){
                    var button = angular.element('<span class="image-editor-'+name+'" />');
                    button.on('click', function() {
                        scope.$emit('editorButtonClick', {name: name});
                    });

                    element.append(button);
                });
            }
        };
    });
}());

(function () {
        angular.module('pmImageEditor').directive('imageSelection', function () {
        return {
            restrict: 'E',
            scope: {
                editorId: '@',
                width: '@',
                height: '@'
            },
            link: function (scope, element) {
                var emitSelectionChanged = function() {
                    scope.$emit(
                        'selectionChanged',
                        scope.editorId,
                        {
                            top: parseInt(element.css('top'), 10),
                            left: parseInt(element.css('left'), 10),
                            width: parseInt(element.css('width'), 10),
                            height: parseInt(element.css('height'), 10)
                        }
                    );
                };

                var resetSelection = function() {
                    element.css({
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        width: scope.width+'px',
                        height: scope.height+'px'
                    });

                    emitSelectionChanged();                    
                };

                scope.$on('dragStop', function(e, event, ui) {
                    if (ui.element.attr('editor-id') === scope.editorId) {
                        emitSelectionChanged();
                    }
                });

                scope.$on('resizeStop', function(e, event, ui) {
                    if (ui.element.attr('editor-id') === scope.editorId) {
                        emitSelectionChanged();
                    }
                });

                scope.$on('imageRotate', function(e, editorId) {
                    if (editorId === scope.editorId) {
                        element.css({
                            'top': '0px',
                            'left': '0px'
                        });

                        emitSelectionChanged();
                    }
                });

                scope.$on('imageCrop', function(e, editorId, params) {
                    if (editorId === scope.editorId) {
                        element.css({
                            'top': '0px',
                            'left': '0px',
                            'width': params.width,
                            'height': params.height
                        });

                        emitSelectionChanged();
                    }
                });

                scope.$on('resetSelection', function(e, editorId) {
                    if (editorId === scope.editorId) {
                        resetSelection();
                    }
                });

                resetSelection();                
            }
        };
    });
}());

(function () {
    angular.module('pmImageEditor').
    factory('ResizableFactory', function() {
      var ResizableFactory = function(options) {
        this._options = options;

        // Original start and position values which was before resize.
        this._originalSize = { width: 0, height: 0 };
        this._originalPosition = { top: 0, left: 0 };

        this._originalMousePosition = {top: 0, left: 0};

        // Start and position values during resize.
        this._position = this._originalPosition;
        this._size = this._originalSize;

        this._axis = 'se';
        this._ratio = 1;
      };

      /**
       * Updates necessary data when resize is starting.
       *
       * @param event - native event which happens on mouse down for handler.
       * @param element - resizable element.
       */
      ResizableFactory.prototype.resizeStart = function(event, element) {
        this.setOriginalMousePosition(event.screenY, event.screenX);

        this.setOriginalPosition(parseInt(element.css('top'), 10) || 0, parseInt(element.css('left'), 10) || 0);

        this.setParentSize(element.parent());

        this.setOriginalSize(element);

        this._ratio = this._size.width / this._size.height;

        var axis = event.target.className.match(/resizable-(se|sw|ne|nw|n|e|s|w)/i);
        this._axis = axis && axis[1] ? axis[1] : 'se';

        this.updateVirtualBoundaries();
      };

      /**
       * Calculates new boundary data when handler moves to screenX and screenY.
       *
       * @param screenX
       * @param screenY
       */
      ResizableFactory.prototype.getBoundaryData = function(screenX, screenY) {
        var boundaryData = this.updateBoundaries(
          screenX - this._originalMousePosition.left,
          screenY - this._originalMousePosition.top
        );

        boundaryData = this.updateRatio(boundaryData);

        boundaryData = this.respectSize(boundaryData);

        this.updateSizeAndPosition(boundaryData);

        return this.fitContainer(boundaryData);
      };

      /**
       * Calculates boundary object to apply when mouse pointer position changes by dx, dy
       * through given axis. This object can contain some (at least one) of properties 
       * { width: int, height: int, left: int, top: int }.
       *
       * @param int dx
       * @param int dy
       */
      ResizableFactory.prototype.updateBoundaries = function(dx, dy) {
        var originalSize = this._originalSize;
        var originalPosition = this._originalPosition;

        // This object calculates boundaries changes depends on axis.
        var _change = {
          e: function(dx) {
            return { width: originalSize.width + dx };
          },
          w: function(dx) {
            var cs = originalSize, sp = originalPosition;
            return { left: sp.left + dx, width: cs.width - dx };
          },
          n: function(dx, dy) {
            var cs = originalSize, sp = originalPosition;
            return { top: sp.top + dy, height: cs.height - dy };
          },
          s: function(dx, dy) {
            return { height: originalSize.height + dy };
          },
          se: function(dx, dy) {
            return angular.extend(this.s.apply(this, arguments),
              this.e.apply(this, [ dx, dy ]));
          },
          sw: function(dx, dy) {
            return angular.extend(this.s.apply(this, arguments),
              this.w.apply(this, [ dx, dy ]));
          },
          ne: function(dx, dy) {
            return angular.extend(this.n.apply(this, arguments),
              this.e.apply(this, [ dx, dy ]));
          },
          nw: function(dx, dy) {
            return angular.extend(this.n.apply(this, arguments),
              this.w.apply(this, [ dx, dy ]));
          }
        };

        return _change[this._axis](dx, dy);
      };

      /**
       * Updates incoming data to fit ratio.
       *
       * @param data - boundaries data. 
       */
      ResizableFactory.prototype.updateRatio = function(data) {
        if (angular.isNumber(data.height)) {
          data.width = (data.height * this._ratio);
        } else if (angular.isNumber(data.width)) {
          data.height = (data.width / this._ratio);
        }

        if (this._axis === 'sw') {
          data.left = this._position.left + (this._size.width - data.width);
          data.top = null;
        }
        if (this._axis === 'nw') {
          data.top = this._position.top + (this._size.height - data.height);
          data.left = this._position.left + (this._size.width - data.width);
        }

        return data;
      };

      /**
       * Updates current position and size from boundaries data.
       *
       * @param data - boundaries data. 
       */
      ResizableFactory.prototype.updateSizeAndPosition = function(data) {
        if (angular.isNumber(data.left)) {
          this._position.left = data.left;
        }
        if (angular.isNumber(data.top)) {
          this._position.top = data.top;
        }
        if (angular.isNumber(data.height)) {
          this._size.height = data.height;
        }
        if (angular.isNumber(data.width)) {
          this._size.width = data.width;
        }
      };

      /**
       * Calculates new virtual boundaries values depends on options and ratio.
       */
      ResizableFactory.prototype.updateVirtualBoundaries = function() {
        var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b,
            o = this._options;

        b = {
          minWidth: angular.isNumber(o.minWidth) ? o.minWidth : 0,
          maxWidth: angular.isNumber(o.maxWidth) ? o.maxWidth : Infinity,
          minHeight: angular.isNumber(o.minHeight) ? o.minHeight : 0,
          maxHeight: angular.isNumber(o.maxHeight) ? o.maxHeight : Infinity
        };

        if (this._ratio) {
          pMinWidth = b.minHeight * this._ratio;
          pMinHeight = b.minWidth / this._ratio;
          pMaxWidth = b.maxHeight * this._ratio;
          pMaxHeight = b.maxWidth / this._ratio;

          if (pMinWidth > b.minWidth) {
            b.minWidth = pMinWidth;
          }
          if (pMinHeight > b.minHeight) {
            b.minHeight = pMinHeight;
          }
          if (pMaxWidth < b.maxWidth) {
            b.maxWidth = pMaxWidth;
          }
          if (pMaxHeight < b.maxHeight) {
            b.maxHeight = pMaxHeight;
          }
        }

        this._vBoundaries = b;
      };

      /**
       * Updates boundaries data to fit min/max sizes.
       *
       * @param data - boundaries data. 
       */
      ResizableFactory.prototype.respectSize = function(data) {
        var o = this._vBoundaries,
            a = this._axis,
            ismaxw = angular.isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width),
            ismaxh = angular.isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
            isminw = angular.isNumber(data.width) && o.minWidth && (o.minWidth > data.width),
            isminh = angular.isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
            dw = this._originalPosition.left + this._originalSize.width,
            dh = this._position.top + this._size.height,
            cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);

        if (isminw) {
          data.width = o.minWidth;
        }
        if (isminh) {
          data.height = o.minHeight;
        }
        if (ismaxw) {
          data.width = o.maxWidth;
        }
        if (ismaxh) {
          data.height = o.maxHeight;
        }

        if (isminw && cw) {
          data.left = dw - o.minWidth;
        }
        if (ismaxw && cw) {
          data.left = dw - o.maxWidth;
        }
        if (isminh && ch) {
          data.top = dh - o.minHeight;
        }
        if (ismaxh && ch) {
          data.top = dh - o.maxHeight;
        }

        if (!data.width && !data.height && !data.left && data.top) {
          data.top = null;
        } else if (!data.width && !data.height && !data.top && data.left) {
          data.left = null;
        }

        return data;
      };

      /**
       * Updates boundary data to avoid moving outside parent.
       *
       * @param data - boundaries data. 
       */
      ResizableFactory.prototype.fitContainer = function(data) {
        var continueResize = true;
        var h, w;

        if (this._position.left < 0) {
          // If left value is negative, we need to decrease width
          // on this value and set left to zero.
          this._size.width += this._position.left;

          // Remember the height.
          h = this._size.height;
          if ( this._ratio ) {
            this._size.height = this._size.width / this._ratio;
            continueResize = false;
          }
          this._position.left = 0;

          if (this._axis === 'nw') {
            // In case if both top and left was changed at the same time
            // change top position also  by heights difference.
            this._position.top += h - this._size.height;
          }
        } 

        if ( this._position.top < 0 ) {
          // If top value is negative, we need to decrease height
          // on this value and set top to zero.
          this._size.height += this._position.top;

          // Remember the width.
          w = this._size.width;
          if ( this._ratio ) {
            this._size.width = this._size.height * this._ratio;
            continueResize = false;
          }
          this._position.top = 0;

          if (this._axis === 'nw') {
            // In case if both top and left was changed at the same time
            // change left position also by widths difference.
            this._position.left += w - this._size.width;
          }
        }

        // Too big width case.
        if ( this._position.left + this._size.width >= this._parentData.width ) {
          this._size.width = this._parentData.width - this._position.left;

          h = this._size.height;
          if ( this._ratio ) {
            this._size.height = this._size.width / this._ratio;
            continueResize = false;
          }

          if (this._axis === 'ne' || this._axis === 'n') {
            this._position.top += h - this._size.height; 
          }
        }

        // Too big height case.
        if ( this._position.top + this._size.height >= this._parentData.height ) {
          this._size.height = this._parentData.height - this._position.top;

          w = this._size.width;
          if ( this._ratio ) {
            this._size.width = this._size.height * this._ratio;
            continueResize = false;
          }

          if (this._axis === 'sw') {
            this._position.left += w - this._size.width;
          }
        }

        if ( !continueResize ) {
          data.left = this._position.left;
          data.top = this._position.top;
          data.width = this._size.width;
          data.height = this._size.height;
        }

        return data;
      };

      /**
       * Getters / setters.
       */
      ResizableFactory.prototype.setOriginalSize = function(element) {
        this._originalSize = {
          width: parseInt(element.css('width'), 10) || element[0].clientWidth,
          height: parseInt(element.css('height'), 10) || element[0].clientHeight
        };

        // Updating original size should update _size value.
        this._size = angular.copy(this._originalSize);

        return this;
      };

      ResizableFactory.prototype.getOriginalSize = function() {
        return this._originalSize;
      };

      ResizableFactory.prototype.setParentSize = function(parentElement) {
        this._parentData = { 
          width: parseInt(parentElement.css('width'), 10) || parentElement[0].clientWidth,
          height: parseInt(parentElement.css('height'), 10) || parentElement[0].clientHeight
        };

        return this;
      };

      ResizableFactory.prototype.getParentSize = function() {
        return this._parentData;
      };

      ResizableFactory.prototype.setOriginalPosition = function(top, left) {
        this._originalPosition = { top: top, left: left };

        // Updating original position should update _position value.
        this._position = angular.copy(this._originalPosition);

        return this;
      };

      ResizableFactory.prototype.getOriginalPosition = function() {
        return this._originalPosition;
      };

      ResizableFactory.prototype.setOriginalMousePosition = function(top, left) {
        this._originalMousePosition = { top: top, left: left };

        return this;
      };

      ResizableFactory.prototype.getOriginalMousePosition = function() {
        return this._originalMousePosition;
      };

      ResizableFactory.prototype.setOption = function(name, value) {
        this._options[name] = value;

        return this;
      };

      ResizableFactory.prototype.getOption = function(name) {
        return this._options[name];
      };

      ResizableFactory.prototype.getSize = function() {
        return this._size;
      };

      ResizableFactory.prototype.getPosition = function() {
        return this._position;
      };

      ResizableFactory.prototype.getRatio = function() {
        return this._ratio;
      };

      ResizableFactory.prototype.getAxis = function() {
        return this._axis;
      };

      ResizableFactory.prototype.getVirtualBoundaries = function() {
        return this._vBoundaries;
      };

      return ResizableFactory;
    }).
    controller('ResizableController', function($scope, $document, $rootScope, ResizableFactory) {
      $scope.resizableFactory = new ResizableFactory({
        minHeight: 20,
        minWidth: 20
      });

      $scope.resizableUiParams = function() {
        return {
          element: $scope.element,
          position: $scope.resizableFactory.getPosition(),
          size: $scope.resizableFactory.getSize()
        };
      };

      $scope.resizableHandleMousedown = function(event) {
        // Prevent default dragging of selected content.
        event.preventDefault();
        // Stop propagation to parent from handlers.
        event.stopPropagation();

        $scope.resizableFactory.resizeStart(event, $scope.element);

        // Bind events to track resize.
        $document.on('mousemove', $scope.resizableMousemove);
        $document.on('mouseup', $scope.resizableMouseup);
      };

      $scope.resizableMousemove = function(event) {
        // Get new boundaries. 
        var boundaryData = $scope.resizableFactory.getBoundaryData(event.screenX, event.screenY);

        // And apply css.
        var css = {};
        angular.forEach(boundaryData, function(value, key) {
          if (value !== null) {
            css[key] = value + 'px';
          }
        });
        $scope.element.css(css);
      };

      $scope.resizableMouseup = function(event) {
        // Unbind events that track resize.
        $document.unbind('mousemove', $scope.resizableMousemove);
        $document.unbind('mouseup', $scope.resizableMouseup);

        $rootScope.$broadcast('resizeStop', event, $scope.resizableUiParams());
      };
    }).
    directive('resizable', function() {
      return {
        restrict: 'A',
        // scope: {
        //   resizeStart: '&',
        //   resizeStop: '&'
        // },
        controller: 'ResizableController',
        link: function(scope, element) {
          scope.element = element;
          scope.parentElement = element.parent();

          // Element should have absolute position.
          element.css({ position: 'absolute' });

          // Add dragging handlers.
          var handlers = 'n,e,w,s,nw,ne,sw,se';
          handlers.split(',').forEach(function(direction) {
            var handler = angular.element('<span class="resizable-'+direction+' resizable-handle"></span>');
            element.append(handler);
            handler.on('mousedown', function(event) {
              scope.resizableHandleMousedown(event);
            });
          });
        }
      };
    });
}());



/*jshint multistr: true */
(function () {
        angular.module('pmImageEditor')
        .factory('ImageEditorFactory', function () {
            var ImageEditorFactory = function() {
                // Visible area width. Image should always fit
                // width or height (depends on rotation) to this area.
                this.visibleWidth = 0;

                // Set default ratio to make resetTransformations works correct.
                this.ratio = 1;

                // Real image width and height.
                this.naturalWidth = 0;
                this.naturalHeight = 0;

                this.resetTransformations();
            };

            ImageEditorFactory.prototype.resetTransformations = function() {
                // Coordinates of top-left corner.
                this.top = 0;
                this.left = 0;

                // All the editor options.
                this.selection = null;

                // This variable contains rotation value by mod 2,
                // for which latest crop was applyed.
                this.wasCroppedForRotation = 0;

                this.isCropped = false;
                this.hFlip = false;
                this.vFlip = false;

                // Rotation value. Can be one of the following values:
                //   0 - 0deg rotation,
                //   1 - 90deg rotation,
                //   2 - 180deg rotation,
                //   3 - 270deg rotation.
                this.rotation = 0;

                // Initially image should fit visible area.
                this.width = this.visibleWidth;
                this.height = this.width/this.ratio;
            }

            /**
             * Return css based on curent image data.
             */
            ImageEditorFactory.prototype.css = function() {
                var transform = [];
                if (this.rotation) {
                    transform.push('rotate('+90*this.rotation+'deg)');
                }

                // Depends on rotation different axis shouls be reverted.
                var axis;
                if (this.vFlip) {
                    axis = (this.rotation%2) ? 'Y' : 'X';
                    transform.push('scale'+axis+'(-1)');
                }
                if (this.hFlip) {
                    axis = (this.rotation%2) ? 'X' : 'Y';
                    transform.push('scale'+axis+'(-1)');
                }

                return {
                    position: 'absolute',
                    top: this.top+'px',
                    left: this.left+'px',
                    width: this.width+'px',
                    height: this.height+'px',
                    transform: transform.length ? transform.join(' ') : 'none'
                };
            };

            /**
             * Parent size depends on rotation and crop.
             * If area was cropped -- parent area should fit selection proportions.
             * Crop can be done for different rotation value, so use wasCroppedForRotation to solve this problem.
             *
             * Return width and height for parent area based on curent image data.
             */
            ImageEditorFactory.prototype.parentSize = function() {
                var r = this.isCropped ? this.selection.ratio : this.ratio;
                var w = this.visibleWidth;

                return {
                    width: w,
                    height: (this.rotation % 2 === this.wasCroppedForRotation) ? w/r : w*r
                };
            };

            /**
             * Return parent css based on curent image data.
             */
            ImageEditorFactory.prototype.parentCss = function() {
                var s = this.parentSize();

                return {
                    width: s.width+'px',
                    height: s.height+'px'
                };
            };

            /**
             * Set all the required data for image with (naturalWidthxnaturalHeight) dimentions.
             *
             * @param int naturalWidth - image width.
             * @param int naturalHeight - image height.
             */
            ImageEditorFactory.prototype.initImageData = function(naturalWidth, naturalHeight) {
                // Update ratio.
                this.ratio = naturalWidth/naturalHeight;
                // And remember real image sizes.
                this.naturalWidth = naturalWidth;
                this.naturalHeight = naturalHeight;

                this.resetTransformations();
            };

            /**
             * Set all visible area width.
             * If image was initialized, reset all the transformations.
             *
             * @param int visibleWidth - visible area width.
             */
            ImageEditorFactory.prototype.setVisibleWidth = function(visibleWidth) {
                this.visibleWidth = parseInt(visibleWidth, 10);

                // If we updating visibleWidth for existing image we need to reset all the data
                // to avoid collisions. 
                if (this.naturalWidth && this.naturalHeight) {
                    this.initImageData(this.naturalWidth, this.naturalHeight);
                }

                return this;
            };

            /**
             * Set selection data.
             *
             * @param Object{width: int, height: int} selection - selection parameters.
             */
            ImageEditorFactory.prototype.setSelection = function(selection) {
                this.selection = selection;
                this.selection.ratio = selection.width/selection.height;

                return this;
            };

            /**
             * Made crop based on selection position and current image data.
             */
            ImageEditorFactory.prototype.crop = function() {
                var s = this.selection;
                var r = this.visibleWidth/s.width;

                // Crop is actually making selection to visible area.
                // This can be made by scaling by r and shifting top-left corner.
                this.top = (this.top - s.top)*r;
                this.left = (this.left - s.left)*r;
                this.width = this.width*r;
                this.height = this.width/this.ratio;

                this.isCropped = true;
                this.wasCroppedForRotation = this.rotation % 2;
            };

            /**
             * Made horizontal flip based on current image data.
             */
            ImageEditorFactory.prototype.horizontalFlip = function() {
                this.hFlip = !this.hFlip;

                var s = this.parentSize();
                // Formula became from:
                // 1. Moving center to point (0, y0 + h/2).
                // 2. Miror move of Y axe coordinates.
                // 3. Shift visible area back by Y axe.
                // 4. Moving center to point (0, -(y0 + h/2)).
                this.top = s.height - this.height - this.top; 
            };

            /**
             * Made vertical flip based on current image data.
             */
            ImageEditorFactory.prototype.verticalFlip = function() {
                this.vFlip = !this.vFlip;

                var s = this.parentSize();
                // Formula became from:
                // 1. Moving center to point (x0 + w/2, 0).
                // 2. Miror move of X axe coordinates.
                // 3. Shift visible area back by X axe.
                // 4. Moving center to point (-(x0 + w/2), 0).
                this.left = s.width - this.width - this.left; 
            };

            /**
             * Made image rotation flip based on current image data.
             * Direction can be 'cw' - rotate by clock-wise direction
             * and 'acw' - rotate by anti-clock-wise direction.
             *
             * @param 'cw'|'acw' direction - rotation direction.
             */
            ImageEditorFactory.prototype.rotate = function(direction) {
                //this.isCropped = false;
                // Update rotation value depends on direction.
                this.rotation += direction === 'cw' ? 1 : -1;
                // Make sure that rotation stays positive in range 0-3.
                this.rotation = (this.rotation + 4)%4;

                var s = this.parentSize();

                // Update width and height:
                var r = s.height/this.visibleWidth;
                // Height depends on difference between visible width and parent height.
                // Because this values are changing during rotation.
                this.height = this.height*r;
                // Keep proportions using image ratio.
                this.width = this.height*this.ratio;

                // Set of help variables.
                // Top and left coordinates should be multiplyed on the same value as height,
                // because it is scale transformation.
                var y0 = this.top*r,
                    x0 = this.left*r,
                    w1 = s.width,
                    h1 = s.height,
                    w = this.width,
                    h = this.height,
                    a = x0 + w/2,
                    b = y0 + h/2;

                // Depends on rotations direction different formulas are used.
                // We are care of top, left coordinates only.
                if (direction === 'cw') {
                    // If it is rotation by 90deg then:
                    // 1. Move center of coordinates to point (a, b).
                    // 2. Rotate by 90deg: (x', y') = (y, -x);
                    // 3. Move center of coordinates to point (-a, -b).
                    // 4. Rotate by -90deg: (x', y') = (-y, x).
                    this.left = x0 - a - b + w1;
                    this.top = y0 + a - b;
                } else {
                    // If it is rotation by -90deg then:
                    // 1. Move center of coordinates to point (a, b).
                    // 2. Rotate by -90deg: (x', y') = (-y, x);
                    // 3. Move center of coordinates to point (-a, -b).
                    // 4. Rotate by 90deg: (x', y') = (y, -x).
                    this.left = x0 - a + b;
                    this.top = y0 - a - b + h1;
                }
            };

            return ImageEditorFactory;
        })
        .controller('ImageEditorController', function($scope, ImageEditorFactory) {
            // Create new editor instance and generate uniq id to use in
            // image-selection directive (in case if few editors are present on the same page).
            $scope.editor = new ImageEditorFactory();
            $scope.editorId = String(Math.random()).replace('0.', 'editor-');

            // Set initial selection.
            $scope.editor.setSelection({
                top: 0,
                left: 0,
                width: $scope.selectionWidth,
                height: $scope.selectionHeight
            });

            $scope.editor.setVisibleWidth($scope.width);

            // Based on emits from editor panel buttons take an actions.
            $scope.$on('editorButtonClick', function(event, args) {
                event.stopPropagation();

                switch (args.name) {
                    case 'crop':
                        $scope.editor.crop();
                        $scope.$broadcast('imageCrop', $scope.editorId, $scope.editor.parentCss());
                        break;

                    case 'rotate-cw':
                        $scope.editor.rotate('cw');
                        $scope.$broadcast('imageRotate', $scope.editorId);
                        break;

                    case 'rotate-acw':
                        $scope.editor.rotate('acw');
                        $scope.$broadcast('imageRotate', $scope.editorId);
                        break;

                    case 'flip-v':
                        $scope.editor.verticalFlip();
                        break;

                    case 'flip-h':
                        $scope.editor.horizontalFlip();
                        break;
                }

                $scope.imageElement.css($scope.editor.css());
                $scope.imageElement.parent().css($scope.editor.parentCss());
            });
            
            // Image selection can be changed because of dragging/resize.
            // Inform factory if those channes are happens.
            $scope.$on('selectionChanged', function(event, editorId, args) {
                if (editorId === $scope.editorId) {
                    event.stopPropagation();

                    $scope.editor.setSelection(args);
                }
            });

            $scope.$watch('width', function(value) {
                // If width was changed on-fly, update value.
                $scope.editor.setVisibleWidth(value);

                // Reset selection to avoid wrong selection position.
                // For example outside of visible area.
                $scope.$broadcast('resetSelection', $scope.editorId);

                // And update image and parent css.
                $scope.imageElement.css($scope.editor.css());
                $scope.imageElement.parent().css($scope.editor.parentCss());
            });
        })
        .directive('imageEditor', function () {
            return {
                restrict: 'E',
                scope: {
                    image: '@',
                    width: '@',
                    selectionWidth: '@',
                    selectionHeight: '@'
                },
                controller: 'ImageEditorController',
                template: '\
                    <div class="image-editor-canvas">\
                        <img ng-src="{{image}}" />\
                        <image-selection \
                            width="{{selectionWidth}}"\
                            height="{{selectionHeight}}"\
                            editor-id="{{editorId}}"\
                            draggable\
                            resizable\
                        ></image-selection>\
                    </div>\
                    <editor-panel></editor-panel>',
                link: function (scope, element) {
                    // Remember image to use in controller.
                    scope.imageElement = element.find('img');

                    scope.imageElement[0].onload = function() {
                        scope.editor.initImageData(this.naturalWidth, this.naturalHeight);
                        scope.imageElement.css(scope.editor.css());
                        scope.imageElement.parent().css(scope.editor.parentCss());
                    };
                }
            };
        });
}());
}());