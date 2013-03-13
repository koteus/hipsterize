hipsterize (a jQuery plugin)
============================

Color masks for images with blend modes like in photoshop

Usage
-----

```javascript

$(function(){
    $('img').hipsterize({
        width: '100%',     // Overlay width (number, string with pixels or percentages)
        height: '193px',   // Overlay height (number, string with pixels or percentages)
        color: 'orange',   // Overlay color ('green', '#ff3334')
        alpha: 0.9,         // Overlay opacity (float from 0 to 1)
        mode: 'darken',    // Blend mode (normal|lighten|darken|multiply|average|add|substract|difference|negation|
        											screen|exclusion|overlay|softLight|hardLight|colorDodge|colorBurn|linearDodge|linearBurn|
        											linearLight|vividLight|pinLight|hardMix|reflect|glow|phoenix)
    });
});

````