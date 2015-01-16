var cobra = cobra || {};
cobra.quadrant_setup = function() {
    'use strict';
    return {
        'tools': {
            'startAngle': 0,
            'tx': 0,
            'ty': 1,
            'colour': '#83AD78'
        },
        'languages-and-frameworks': {
            'startAngle': 90,
            'tx': 0,
            'ty': 0,
            'colour': '#8D2145'
        },
        'platforms': {
            'startAngle': 180,
            'tx': 1,
            'ty': 0,
            'colour': '#E88744'
        },
        'techniques': {
            'startAngle': 270,
            'tx': 1,
            'ty': 1,
            'colour': '#3DB5BE'
        }
    };
};
cobra.radar_draw = function() {
    'use strict';

    function toggle_js_view() {
        $('.static-quadrant').hide();
        $('.point-link .point-name').show();
        $('.non-js-point-desc-link').hide();
    }

    function draw() {
        toggle_js_view();
        var triangle = function(svg, x, y, w) {
            return svg.append('path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406").attr("stroke", "white").attr("stroke-width", 2).attr('transform', 'scale(' + (w / 34) + ') translate(' + (-404 + x * (34 / w) - 17) + ', ' + (-282 + y * (34 / w) - 17) + ')');
        };
        var circle = function(svg, x, y, w) {
            return svg.append('path').attr('d', "M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092").attr("stroke", "white").attr("stroke-width", 2).attr('transform', 'scale(' + (w / 34) + ') translate(' + (-404 + x * (34 / w) - 17) + ', ' + (-282 + y * (34 / w) - 17) + ')');
        };
        var rect = function(svg, x, y, w, h) {
            return svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
        };
        var rad = function(deg) {
            return deg * Math.PI / 180;
        };
        var quadPath = function(svg, id, innerRadius, outerRadius, fill, radius, startAngle, tx, ty) {
            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(rad(startAngle)).endAngle(rad(startAngle + 90));
            svg.append('path').attr('d', arc).attr('fill', fill).attr('transform', 'translate(' + tx * radius + ', ' + ty * radius + ')');
        };
        var arc = function(svg, id, innerRadius, outerRadius, colour, radius, startAngle, tx, ty) {
            quadPath(svg, id, innerRadius, outerRadius, colour, radius, startAngle, tx, ty);
        };
        var addLabel = function(svg, text, startArc, endArc, quadrantRadius, tx, ty, colour) {
            var x = (startArc + endArc) / 2;
            var y = 12;
            if (tx) {
                x = quadrantRadius - x;
            }
            if (ty) {
                y = quadrantRadius - 5;
            }
            svg.append('text').attr({
                'x': x,
                'y': y,
                "text-anchor": "middle",
                "fill": colour
            }).style({
                'font-size': '10px',
                'font-weight': 900
            }).text(text.toUpperCase());
        };
        var drawBorders = function(svg, radius, tx, ty) {
            var width = 15;
            var x = 0;
            if (tx) {
                x = radius - width;
            }
            var y = 0;
            if (ty) {
                y = radius - width;
            }
            rect(svg, 0, y, radius, width).attr('fill', 'white').attr('opacity', 0.5);
            rect(svg, x, 0, width, radius).attr('fill', 'white').attr('opacity', 0.5);
        };
        var quadrant = function(svg, id, quadrantRadius, scale, segments, startAngle, tx, ty, textColour) {
            _(segments).each(function(segment) {
                arc(svg, id, segment.startRadius * scale, segment.endRadius * scale, segment.colour, quadrantRadius, startAngle, tx, ty);
            });
            drawBorders(svg, quadrantRadius, tx, ty);
            _(segments).each(function(segment) {
                addLabel(svg, segment.title, segment.startRadius * scale, segment.endRadius * scale, quadrantRadius, tx, ty, textColour);
            });
        };
        var drawKey = function(svg, quadrantRadius, tx, ty, colour) {
            var x = quadrantRadius / 10;
            var y = quadrantRadius / 10;
            var triangleKey = "New or moved";
            var circleKey = "No change";
            if (!tx) {
                x = (quadrantRadius - x) - (Math.max(triangleKey.length, circleKey.length) * 10);
            }
            if (!ty) {
                y = quadrantRadius - y;
            }
            triangle(svg, x, y - 10, 10).attr('fill', colour);
            svg.append('text').attr({
                'x': x + 10,
                'y': y - 5,
                'fill': colour,
                'font-size': '0.8em'
            }).text(triangleKey);
            circle(svg, x, y + 10, 10).attr('fill', colour);
            svg.append('text').attr({
                'x': x + 10,
                'y': y + 15,
                'fill': colour,
                'font-size': '0.8em'
            }).text(circleKey);
        };
        var createShape = function(point, parent, colour, x, y, pointWidth) {
            var shapeFunction = {
                't': triangle,
                'c': circle
            }[point.movement];
            return shapeFunction(parent, x, y, pointWidth).attr('fill', colour).attr('class', point.ring.toLowerCase() + '-point');
        };
        var colourLink = function(pointId, bgColor, color) {
            $('#point-link-' + pointId).css({
                'background-color': bgColor,
                'color': color
            });
        };
        var fadeOtherpoints = function(pointId) {
            d3.selectAll('a circle, a path').attr('opacity', 0.3);
            d3.select('#point-' + pointId).selectAll('circle, path').attr('opacity', 1.0);
        };
        var restorepoints = function() {
            d3.selectAll('a circle, a path').attr('opacity', 1.0);
        };
        var unhighlight = function(pointId) {
            colourLink(pointId, '', '');
            restorepoints();
        };
        var highlight = function(pointId, pointColour, textColour) {
            colourLink(pointId, pointColour, textColour);
            fadeOtherpoints(pointId);
        };
        var pointCoord = function(point, scaleFactor, quadrantRadius, tx, ty) {
            return {
                'x': Math.abs(Math.abs(point.radius * scaleFactor * Math.cos(rad(point.theta))) - tx * quadrantRadius),
                'y': Math.abs(Math.abs(point.radius * scaleFactor * Math.sin(rad(point.theta))) - ty * quadrantRadius)
            };
        };
        var drawpoint = function(point, svg, colour, scale, quadrantRadius, tx, ty, pointWidth, pointFontSize) {
            var coord = pointCoord(point, scale, quadrantRadius, tx, ty);
            var link = svg.append('svg:a').attr({
                'id': 'point-' + point.id,
                'xlink:href': point.nameUrl
            }).style({
                'text-decoration': 'none',
                'cursor': 'pointer'
            });
            createShape(point, link, colour, coord.x, coord.y, pointWidth);
            var textY = point.movement === 't' ? coord.y + 6 : coord.y + 4;
            link.append('text').attr({
                'x': coord.x,
                'y': textY,
                'font-size': pointFontSize,
                'font-style': 'italic',
                'font-weight': 'bold',
                'fill': 'white'
            }).text(point.radarId).style({
                'text-anchor': 'middle'
            });
            link.on('touchstart', function() {
                highlight(point.id, colour, 'white');
            });
            link.on('touchend', function() {
                unhighlight(point.id, colour, 'white');
            });
            link.on('mouseenter', function() {
                highlight(point.id, colour, 'white');
            });
            link.on('mouseleave', function() {
                unhighlight(point.id, colour, 'white');
            });
        };
        var svgSupported = function() {
            return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
        };
        var CONFIG = {
            'quadrantRadius': 500,
            'pointWidth': 25,
            'pointFontSize': '10px',
            'pointColours': {
                'adopt': '#44b500',
                'trial': '#859900',
                'assess': '#99df00',
                'hold': '#bb5500'
            },
            'textColour': '#000',
            'maxRadius': 400,
            'segmentData': [{
                'title': 'Adopt',
                'startRadius': 0,
                'endRadius': 150,
                'colour': '#BFC0BF'
            }, {
                'title': 'Trial',
                'startRadius': 150,
                'endRadius': 275,
                'colour': '#CBCCCB'
            }, {
                'title': 'Assess',
                'startRadius': 275,
                'endRadius': 350,
                'colour': '#D7D8D6'
            }, {
                'title': 'Hold',
                'startRadius': 350,
                'endRadius': 400,
                'colour': '#E4E5E4'
            }],
            'quadrantData': cobra.quadrant_setup()
        };
        var drawQuadrant = function() {
            if (svgSupported() && $('#quadrant-point-list').length) {
                var svg = d3.select('#quadrant').insert('svg', ':first-child').attr('width', CONFIG.quadrantRadius).attr('height', CONFIG.quadrantRadius);
                var rings = ring_list();
                if (rings !== undefined) {
                    var quadrantName = $('#quadrant-point-list').data('quadrant');
                    var quadrantData = CONFIG.quadrantData[quadrantName];
                    var scaleFactor = CONFIG.quadrantRadius / CONFIG.maxRadius;
                    quadrant(svg, quadrantName, CONFIG.quadrantRadius, scaleFactor, CONFIG.segmentData, quadrantData.startAngle, quadrantData.tx, quadrantData.ty, CONFIG.textColour);
                    _(rings).each(function(ring) {
                        _(ring.points).each(function(point) {
                            drawpoint(point, svg, quadrantData.colour, scaleFactor, CONFIG.quadrantRadius, quadrantData.tx, quadrantData.ty, CONFIG.pointWidth, CONFIG.pointFontSize);
                        });
                    });
                    drawKey(svg, CONFIG.quadrantRadius, quadrantData.tx, quadrantData.ty, CONFIG.textColour);
                }
            }
        };
        $(drawQuadrant);
    }

    function ring_list() {
        var rings = [];
        $('#quadrant-point-list').children('div').toArray().forEach(function(element) {
            var points = [];
            $(element).find('.point-link').toArray().forEach(function(point_element) {
                var point = {
                    radius: $(point_element).data('radius'),
                    theta: $(point_element).data('theta'),
                    movement: $(point_element).data('movement'),
                    id: $(point_element).data('point-id'),
                    ring: $(element).attr('id'),
                    radarId: $(point_element).data('radar-id'),
                    nameUrl: $(point_element).data('url')
                };
                points.push(point);
            });
            var ring = {
                points: points
            };
            rings.push(ring);
        });
        return rings;
    }
    return {
        apply_to_page: draw,
        ring_list: ring_list
    };
};
cobra.radar_draw().apply_to_page();
var cobra = cobra || {};
cobra.quadrant = function() {
    'use strict';

    function on_click() {
        var id = $(this).data('point-id');
        var descriptionId = '#point-description-' + id;
        var slideTime = 250;
        if ($.fx.off) {
            $(descriptionId).slideToggle();
        } else {
            $('.point-description').not(descriptionId).slideUp(slideTime);
            $(descriptionId).delay(slideTime).slideToggle(slideTime);
        }
    }
    var colourLink = function(pointId, bgColor, color) {
        $('#point-link-' + pointId).css({
            'background-color': bgColor,
            'color': color
        });
    };
    var fadeOtherpoints = function(pointId) {
        d3.selectAll('a circle, a path').attr('opacity', 0.3);
        d3.select('#point-' + pointId).selectAll('circle, path').attr('opacity', 1.0);
    };
    var restorepoints = function() {
        d3.selectAll('a circle, a path').attr('opacity', 1.0);
    };
    var unhighlight = function(pointId) {
        colourLink(pointId, 'white', 'black');
        restorepoints();
    };
    var highlight = function(pointId, pointColour, textColour) {
        colourLink(pointId, pointColour, textColour);
        fadeOtherpoints(pointId);
    };

    function on_leave() {
        var id = $(this).data('point-id');
        unhighlight(id);
    }

    function on_hover() {
        var id = $(this).data('point-id');
        var quadrant = $('#quadrant-point-list').data('quadrant');
        highlight(id, cobra.quadrant_setup()[quadrant]['colour'], 'white');
    }

    function stick_quadrant(element) {
        var $window = $(window),
            originalElementYPosition = element.offset().top - 20;
        var sibling = $('#quadrant-point-list');
        var previousWindowScroll = $window.scrollTop();
        var scrollHandler = function() {
            var siblingY1 = sibling.offset().top;
            var siblingY2 = siblingY1 + sibling.outerHeight(true);
            var quadY1 = element.offset().top;
            var quadY2 = quadY1 + element.outerHeight();
            var isScrollUp = $window.scrollTop() < previousWindowScroll;
            if (($window.scrollTop() > originalElementYPosition)) {
                if (!isScrollUp && quadY2 < siblingY2) {
                    element.css("margin-top", $window.scrollTop() - originalElementYPosition);
                } else if (isScrollUp && $window.scrollTop() <= quadY1) {
                    element.css("margin-top", $window.scrollTop() - originalElementYPosition);
                }
            } else {
                element.css("margin-top", 0);
            }
            previousWindowScroll = $window.scrollTop();
        };
        if (!Modernizr.csspositionsticky) {
            $window.scroll(scrollHandler);
        }
    }

    function apply_to_page() {
        $('.point-link').click(on_click);
        $('.point-link').mouseleave(on_leave);
        $('.point-link').mouseover(on_hover);
        if ($('#quadrant').length) {
            stick_quadrant($('#quadrant'));
        }
    }
    return {
        apply_to_page: apply_to_page
    };
};
$(document).ready(function() {
    'use strict';
    cobra.quadrant().apply_to_page();
});;
