function polar_to_cartesian(r, t) {
    //radians to degrees, requires the t*pi/180
    var x = r * Math.cos((t * Math.PI / 180));
    var y = r * Math.sin((t * Math.PI / 180));
    return [x, y];
}

function cartesian_to_raster(x, y) {
    var rx = x;
    var ry = y;
    return [rx, ry];
}

function raster_to_cartesian(rx, ry) {
    var x = rx;
    var y = ry;
    return [x, y];
}

function polar_to_raster(r, t) {
    var xy = polar_to_cartesian(r, t);
    return cartesian_to_raster(xy[0], xy[1]);
}

function createSVGtext(caption, x, y, characters, lineHeight, maxHeight) {
    //  This function attempts to create a new svg "text" element, chopping 
    //  it up into "tspan" pieces, if the caption is too long
    //
    var svgText = document.createElementNS('http://w3ww.w3.org/2000/svg', 'text');
    svgText.setAttributeNS(null, 'x', x);
    svgText.setAttributeNS(null, 'y', y);
    svgText.setAttributeNS(null, 'font-size', 12);
    svgText.setAttributeNS(null, 'fill', '#FFFFFF');         //  White text
    svgText.setAttributeNS(null, 'text-anchor', 'middle');   //  Center the text

    //  The following two variables should really be passed as parameters
    var MAXIMUM_CHARS_PER_LINE = characters ? characters : 20;
    var LINE_HEIGHT = lineHeight? lineHeight : 16;
    maxHeight = maxHeight ? maxHeight : 200;
    var words = caption.split(" ");
    var line = "";

    for (var n = 0; n < words.length && y < maxHeight; n++) {
        var testLine = line + words[n] + " ";
        if (testLine.length > MAXIMUM_CHARS_PER_LINE)
        {
            //  Add a new <tspan> element
            var svgTSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            svgTSpan.setAttributeNS(null, 'x', x);
            svgTSpan.setAttributeNS(null, 'y', y);

            var tSpanTextNode = document.createTextNode(line);
            svgTSpan.appendChild(tSpanTextNode);
            svgText.appendChild(svgTSpan);

            line = words[n] + " ";
            y += LINE_HEIGHT;
        }
        else {
            line = testLine;
        }
    }

    var svgTSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    svgTSpan.setAttributeNS(null, 'x', x);
    svgTSpan.setAttributeNS(null, 'y', y);

    var tSpanTextNode = document.createTextNode(line);
    svgTSpan.appendChild(tSpanTextNode);

    svgText.appendChild(svgTSpan);

    return jQuery(svgText);
}