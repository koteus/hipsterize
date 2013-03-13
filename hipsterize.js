
(function($){

    var blendModes = {
        normal: function(a, b) {
            return a;
        },

        lighten: function(a, b) {
            return (b > a) ? b : a;
        },

        darken: function(a, b) {
            return (b > a) ? a : b;
        },

        multiply: function(a, b) {
            return (a * b) / 255;
        },

        average: function(a, b) {
            return (a + b) / 2;
        },

        add: function(a, b) {
            return Math.min(255, a + b);
        },

        substract: function(a, b) {
            return (a + b < 255) ? 0 : a + b - 255;
        },

        difference: function(a, b) {
            return Math.abs(a - b);
        },

        negation: function(a, b) {
            return 255 - Math.abs(255 - a - b);
        },

        screen: function(a, b) {
            return 255 - (((255 - a) * (255 - b)) >> 8);
        },

        exclusion: function(a, b) {
            return a + b - 2 * a * b / 255;
        },

        overlay: function(a, b) {
            return b < 128
                    ? (2 * a * b / 255)
                    : (255 - 2 * (255 - a) * (255 - b) / 255);
        },

        softLight: function(a, b) {
            return b < 128
                    ? (2 * ((a >> 1) + 64)) * (b / 255)
                    : 255 - (2 * (255 - (( a >> 1) + 64)) * (255 - b) / 255);
        },

        hardLight: function(a, b) {
            return blendingModes.overlay(b, a);
        },

        colorDodge: function(a, b) {
            return b == 255 ? b : Math.min(255, ((a << 8 ) / (255 - b)));
        },

        colorBurn: function(a, b) {
            return b == 0 ? b : Math.max(0, (255 - ((255 - a) << 8 ) / b));
        },

        linearDodge: function(a, b) {
            return blendingModes.add(a, b);
        },

        linearBurn: function(a, b) {
            return blendingModes.substract(a, b);
        },

        linearLight: function(a, b) {
            return b < 128
                    ? blendingModes.linearBurn(a, 2 * b)
                    : blendingModes.linearDodge(a, (2 * (b - 128)));
        },

        vividLight: function(a, b) {
            return b < 128
                    ? blendingModes.colorBurn(a, 2 * b)
                    : blendingModes.colorDodge(a, (2 * (b - 128)));
        },

        pinLight: function(a, b) {
            return b < 128
                    ? blendingModes.darken(a, 2 * b)
                    : blendingModes.lighten(a, (2 * (b - 128)));
        },

        hardMix: function(a, b) {
            return blendingModes.vividLight(a, b) < 128 ? 0 : 255;
        },

        reflect: function(a, b) {
            return b == 255 ? b : Math.min(255, (a * a / (255 - b)));
        },

        glow: function(a, b) {
            return blendingModes.reflect(b, a);
        },

        phoenix: function(a, b) {
            return Math.min(a, b) - Math.max(a, b) + 255;
        }
    };

    $.fn.hipsterize = function(options){

        var defaults = {
            width: '100%',
            height: '100%',
            color: 'green',
            mode: 'normal',
            alpha: 1
        };

        options = $.extend({}, defaults, options);

        this.each(function(){
            if ( $(this).prop('complete') )
                applyBlendMode(this);
            else
                $(this).bind('load', function(){ applyBlendMode(this); });
        });

        function applyBlendMode(img) {

            var
                $imageCanvas = $( '<canvas />', { width: img.width, height: img.height }),
                $overlayCanvas = $( '<canvas />', { width: img.width, height: img.height }),
                imageContext = $imageCanvas[0].getContext('2d'),
                overlayContext = $overlayCanvas[0].getContext('2d');

            var overlayWidth = options.width;
            var overlayHeight = options.height;

            if(typeof overlayWidth == 'string') {
                overlayWidth = parseInt(options.width);
                if ( options.width.charAt(options.width.length - 1) === '%' ) {
                    if (overlayWidth < 0) overlayWidth = 0;
                    if (overlayWidth > 100) overlayWidth = 100;
                    overlayWidth = img.width * overlayWidth / 100;
                }
            }

            if(typeof overlayHeight == 'string') {
                overlayHeight = parseInt(options.height);
                if ( options.height.charAt(options.height.length - 1) === '%' ) {
                    if (overlayHeight < 0) overlayHeight = 0;
                    if (overlayHeight > 100) overlayHeight = 100;
                    overlayHeight = img.height * overlayHeight / 100;
                }
            }

            overlayContext.canvas.width = overlayWidth;
            overlayContext.canvas.height = overlayHeight;
            overlayContext.beginPath();
            overlayContext.rect(0, 0, overlayWidth, overlayHeight);
            overlayContext.fillStyle = options.color;
            overlayContext.fill();

            imageContext.canvas.width = img.width;
            imageContext.canvas.height = img.height;
            imageContext.drawImage(img, 0, 0);

            // create rect for smallest image
            var width =  Math.min(img.width, overlayWidth);
            var height = Math.min(img.height, overlayHeight);

            var imageData = imageContext.getImageData(0, 0, width, height);
            var overlayData = overlayContext.getImageData(0, 0, width, height);

            var pixels1 = imageData.data;
            var pixels2 = overlayData.data;

            var r, g, b, oR, oG, oB, alpha1 = 1 - options.alpha;

            var blendMode = blendModes[options.mode];

            // blend images
            for (var i = 0, il = pixels1.length; i < il; i += 4) {
                oR = pixels1[i];
                oG = pixels1[i + 1];
                oB = pixels1[i + 2];

                // calculate blended color
                r = blendMode(pixels2[i], oR);
                g = blendMode(pixels2[i + 1], oG);
                b = blendMode(pixels2[i + 2], oB);

                // alpha composition
                pixels1[i] =     r * options.alpha + oR * alpha1;
                pixels1[i + 1] = g * options.alpha + oG * alpha1;
                pixels1[i + 2] = b * options.alpha + oB * alpha1;
            }

            imageContext.putImageData(imageData, 0, 0);

            $(img).replaceWith($imageCanvas);
        }
    };
})(jQuery);
