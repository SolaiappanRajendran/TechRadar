function quadrant_setup() {    
    return {
       'languages-and-frameworks': {
            'startAngle': 270,
            'tx': 0.5,
            'ty': 0.5,
            'colour': '#587486'
        },
        'techniques': {
            'startAngle': 0,
            'tx': 0.5,
            'ty': 0.5,
            'colour': '#B70062'
        },
        'tools': {
            'startAngle': 180,
            'tx': 0.5,
            'ty': 0.5,
            'colour': '#8FA227'
        },                       
        'platforms': {
            'startAngle': 90,
            'tx': 0.5,
            'ty': 0.5,
            'colour': '#DC6F1D'
        }
               
        
    };
};

(function($) {
var quadrantName;

function appendTriangle(svg, x, y, w) {
        return svg.append('path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406").attr("stroke", "white").attr("stroke-width", 2).attr('transform', 'scale(' + (w / 34) + ') translate(' + (-404 + x * (34 / w) - 17) + ', ' + (-282 + y * (34 / w) - 17) + ')');
};
function appendCircle(svg, x, y, w) {
        return svg.append('path').attr('d', "M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092").attr("stroke", "white").attr("stroke-width", 2).attr('transform', 'scale(' + (w / 34) + ') translate(' + (-404 + x * (34 / w) - 17) + ', ' + (-282 + y * (34 / w) - 17) + ')');
};
function appendRect(svg, x, y, w, h) {
    return svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
};
function getRadian(deg) {
    return deg * Math.PI / 180;
};

function arc(svg, id, innerRadius, outerRadius, colour, radius, startAngle, tx, ty) {
    var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(getRadian(startAngle)).endAngle(getRadian(startAngle + 90));
    svg.append('path').attr('d', arc).attr('stroke-width', 2).attr('stroke', 'white').attr('fill', colour).attr('transform', 'translate(' + tx * radius * 2 + ', ' + ty * radius * 2 + ')');
};

function quadrant(svg, id, quadrantRadius, scale, segments, startAngle, tx, ty, textColour) {
    _(segments).each(function(segment) {
        
        arc(svg, id, segment.startRadius * scale, segment.endRadius * scale, segment[quadrantName].color, quadrantRadius, startAngle, tx, ty);        
    });
    
  
};

function drawLabel (svg, id, quadrantRadius, scale, segments, startAngle, tx, ty, textColour) {
    _(segments).each(function(segment) {
        addLabel(svg, segment.title, segment.startRadius * scale, segment.endRadius * scale, quadrantRadius, tx, ty, textColour);
    });
}


var createShape = function(point, parent, colour, x, y, pointWidth) {
    var shapeFunction = {
        't': appendTriangle,
        'c': appendCircle
    }[point.movement];
    return shapeFunction(parent, x, y, pointWidth).attr('fill', colour).attr('stroke', 'red').attr('class', point.ring.toLowerCase() + '-point');
};
var colourLink = function(pointId, bgColor, color, needFocus) {
   var legendElement = $('#legend-' + pointId);
    legendElement.css({
        'background-color': bgColor,
        'color': color
    });
if(needFocus) {
    var ringLegend = $(legendElement).parents('.ring-legend-container').position();
    
    var radarLegend = $(legendElement).parents('.radar-legend');
    $(radarLegend).scrollTop(ringLegend.top);
}
};
var blurOtherPoints = function(pointId) {
    d3.selectAll('a circle, a path').attr('opacity', 0.3);
    d3.select('#point-' + pointId).selectAll('circle, path').attr('fill', 'orange').attr('stroke', 'white').attr('opacity', 1.0);
    d3.select('#point-' + pointId).selectAll('text').attr('fill', 'white');
};
var restorepoints = function() {
    d3.selectAll('a path').attr('fill', 'white').attr('stroke','red').attr('opacity', 1.0);
     d3.selectAll('a').selectAll('text').attr('fill', 'black');
};
var unhighlight = function(pointId, needFocus) {
    colourLink(pointId, '', '', false);

    restorepoints();
};
var highlight = function(pointId, pointColour, textColour, needFocus) {
    colourLink(pointId, pointColour, textColour, needFocus);
    blurOtherPoints(pointId);
};
var pointCoord = function(point, scaleFactor, quadrantRadius, tx, ty, startAngle) {
    var xI = 1;
    var yI = 1;

    if(startAngle == 0) {        
        yI = -1;
    } else if (startAngle == 90) {
        // no change
    } else if (startAngle == 180) {
        xI = -1;
    } else {
        xI = -1;
        yI = -1;
    }
   
    return {
        'x': Math.abs(Math.abs(point.radial * scaleFactor * Math.cos(getRadian(startAngle + point.theta))) + (xI) * tx * quadrantRadius * 2),
        'y': Math.abs(Math.abs(point.radial * scaleFactor * Math.sin(getRadian(startAngle + point.theta))) + (yI) * ty * quadrantRadius * 2)
    };
};

function addLabel(svg, text, startArc, endArc, quadrantRadius, tx, ty, colour) {

            var totalWidth = quadrantRadius * 2, totalHeight = quadrantRadius * 2;            
           var x = totalWidth * tx;
           var y = (totalHeight * ty) - (startArc);

            svg.append('text').attr({

                "text-anchor": "start",
                "fill": colour,
                'transform': 'translate(' + (x - 5) + ', ' + (y - 5) + ') rotate(-90)'
            }).style({
                'font-size': '16px'
            }).text(text.toUpperCase());
        };


var drawpoint = function(point, svg, colour, scale, quadrantRadius, tx, ty, pointWidth, pointFontSize, startAngle) {
    var coord = pointCoord(point, scale, quadrantRadius, tx, ty, startAngle);
    var link = svg.append('svg:a').attr({
        'id': 'point-' + point.id,
        'target': '_blank',
        'xlink:href': point.nameUrl
    }).style({
        'text-decoration': 'none',
        'cursor': 'pointer'
    });
        var highlightPointColor = 'orange', highlightTextColor = 'white';
    var unHighlightPointColor = 'white', unHighlightTextColor = 'black';
    createShape(point, link, unHighlightPointColor, coord.x, coord.y, pointWidth);

    var textY = point.movement === 't' ? coord.y + 6 : coord.y + 4;
    link.append('text').attr({
        'x': coord.x,
        'y': textY,
        'font-size': pointFontSize,
        'font-style': 'italic',
        'font-weight': 'bold',
        'fill': unHighlightTextColor
    }).text(point.radarId).style({
        'text-anchor': 'middle'
    });
    link.on('touchstart', function() {
        highlight(point.id, highlightPointColor, highlightTextColor, true);
    });
    link.on('touchend', function() {
        unhighlight(point.id, true);
    });
    link.on('mouseenter', function() {
        highlight(point.id, highlightPointColor, highlightTextColor, true);
    });
    link.on('mouseleave', function() {
        unhighlight(point.id, true);
    });
};

var CONFIG = {
    'quadrantRadius': 400,
    'pointWidth': 25,
    'pointFontSize': '10px',
    'textColour': '#000',
    'maxRadius': 400,
    'segmentData': [{
        'title': 'Maintain',
        'startRadius': 0,
        'endRadius': 100,
        'languages-and-frameworks': {
            color: '#3A849B'
        },
        'platforms': {
            color: '#3595C8'
        },
        'tools': {
            color: '#66D0EA'
        },
        'techniques': {
            color: '#527173'
        }
    }, {
        'title': 'Invest',
        'startRadius': 101,
        'endRadius': 200,
        'languages-and-frameworks': {
            color: '#6BA3B4'
        },
        'platforms': {
            color: '#67AFD7'
        },
        'tools': {
            color: '#8DDBEF'
        },
        'techniques': {
            color: '#7C9496'
        }
    }, {
        'title': 'Watch',
        'startRadius': 201,
        'endRadius': 300,
        'languages-and-frameworks': {
            color: '#9DC1CD'
        },
        'platforms': {
            color: '#9BCAE4'
        },
        'tools': {
            color: '#B3E7E5'
        },
        'techniques': {
            color: '#A8B8B8'
        }
        
    }, {
        'title': 'Exit',
        'startRadius': 301,
        'endRadius': 400,
        'languages-and-frameworks': {
            color: '#C1D8E0'
        },
        'platforms': {
            color: '#C1DEEE'
        },
        'tools': {
            color: '#CFF0F9'
        },
        'techniques': {
            color: '#C8D2D3'
        }
    }],
    'quadrantData': quadrant_setup()
};

function on_leave() {
    var id = parseInt(this.id.replace('legend-', ''));
    unhighlight(id, false);
}

function on_hover() {
   var id = parseInt(this.id.replace('legend-', ''));
    highlight(id, 'orange', 'white', false);
}

function on_click() {
    var id = parseInt(this.id.replace('legend-', ''));
    window.open($('#point-' + id).attr('href'));
}
$(document).ready(function(){
    $('#tech-radar').on('draw', drawRadar);    
})
function bindEvents() {
        
        $('div[id*=legend-]').click(on_click);
        $('div[id*=legend-]').on('mouseout', on_leave);
        $('div[id*=legend-]').on('mouseover',on_hover);
        
};



function drawRadar() {
    
     var svg = d3.select('#tech-radar').insert('svg', ':first-child').attr('width', CONFIG.quadrantRadius * 2).attr('height', CONFIG.quadrantRadius * 2);
    var quadSetup = quadrant_setup();
     var scaleFactor = CONFIG.quadrantRadius / CONFIG.maxRadius;



    $.each(quadSetup, function (department, quadrantObject) {
            

            quadrantName = department;
            var quadrantData = CONFIG.quadrantData[quadrantName];
           
            
            quadrant(svg, quadrantName, CONFIG.quadrantRadius, scaleFactor, CONFIG.segmentData, quadrantData.startAngle, quadrantData.tx, quadrantData.ty, CONFIG.textColour);
            

    });




_(CONFIG.segmentData).each(function(segment) {
        
        addLabel(svg, segment.title, segment.startRadius * scaleFactor, segment.endRadius * scaleFactor, CONFIG.quadrantRadius, 0.5, 0.5, 'white');        
    });
    


   
   // Borders
        appendRect(svg, 400, 0, 3, 400 * 2).attr('fill', 'white');
        appendRect(svg, 0, 400, 400 * 2, 3).attr('fill', 'white');
var pointIndex = 0;
var legendIndex = 0;

var quadrantIndex = 1;
     $.each(quadSetup, function (department, quadrantObject) {


     var filteredData = _.filter(radar_data, function(d) {return d.quadrant.toLowerCase().replace(/ /g, '-') == department; })
 
        var legendObject= {};

        legendObject.parent = { color: CONFIG.segmentData[0][department].color, name: department, pointIndex: pointIndex };

        legendObject.items = [];

        if(filteredData.length > 0) {
        _(CONFIG.segmentData).each(function(segment) {
            var ringLegendObject = {
                color: segment[department].color,
                title: segment.title,
                items:  _.filter(filteredData[0].items, function(d) {return d.ring == segment.title; })
            };

            legendObject.items.push(ringLegendObject);          
        });
    }
        var templating = _.template($('#legend-template').html());
       $('#quadrant-' + (quadrantIndex) +'-legend').html(templating(legendObject));

       $('.quadrant-' + (quadrantIndex) +' .legend-header').css('color', legendObject.parent.color).html(legendObject.parent.name.toUpperCase().replace(/-/g, ' ').replace('AND', '&'));
       quadrantIndex++;
        if(filteredData.length > 0) {        


            var points = [];
            
            $.each(filteredData[0].items, function(elementIndex, point_element) {
                pointIndex++;
                var point = {
                    radial:point_element.pc.r,
                    theta: point_element.pc.t,
                    movement: point_element.movement,
                    id: pointIndex,
                    ring: 'Exit',
                   radarId: pointIndex,
                    nameUrl: point_element.url
                };
                points.push(point);
            });

       

        if (points !== undefined) {
            quadrantName = department;
            var quadrantData = CONFIG.quadrantData[quadrantName];
            var scaleFactor = CONFIG.quadrantRadius / CONFIG.maxRadius;
            

                _(points).each(function(point) {
                    drawpoint(point, svg, quadrantData.colour, scaleFactor, CONFIG.quadrantRadius, quadrantData.tx, quadrantData.ty, CONFIG.pointWidth, CONFIG.pointFontSize, quadrantData.startAngle);
                });
           
        }
     }
     
       
    
     });

    bindEvents();

};

})(jQuery);