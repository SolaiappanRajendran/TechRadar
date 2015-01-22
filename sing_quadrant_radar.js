var quadrantRadiusDef = 400;
var totalWidth = 600;
var totalHeight = 650;
var quadrantName = 'platforms'
function quadrant_setup() {    
    return {
       'languages-and-frameworks': {
            'startAngle': 270,
            'tx': 1,
            'ty': 1,
            'colour': '#587486'
        },
        'techniques': {
            'startAngle': 0,
            'tx': 0,
            'ty': 1,
            'colour': '#B70062'
        },
        'tools': {
            'startAngle': 180,
            'tx': 1,
            'ty': 0,
            'colour': '#8FA227'
        },                       
        'platforms': {
            'startAngle': 90,
            'tx': 0,
            'ty': 0,
            'colour': '#DC6F1D'
        }
               
        
    };
};

(function($) {


function appendTriangle(svg, x, y, w) {
        return svg.append('path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C").attr("stroke", "white").attr("stroke-width", 2).attr('transform', 'scale(' + (w / 34) + ') translate(' + (-404 + x * (34 / w) - 17) + ', ' + (-282 + y * (34 / w) - 17) + ')');
};
function appendCircle(svg, x, y, w) {
        return svg.append('circle').attr('cx', x).attr("cy", y).attr("stroke-width", 1).attr('r', 9).attr('stroke', '#F04923').attr('fill', 'white');
};
function appendRect(svg, x, y, w, h) {
    return svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
};
function getRadian(deg) {
    return deg * Math.PI / 180;
};

function arc(svg, id, innerRadius, outerRadius, colour, radius, startAngle, tx, ty) {
    var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(getRadian(startAngle)).endAngle(getRadian(startAngle + 90));
    svg.append('path').attr('d', arc).attr('stroke-width', 3).attr('stroke', 'white').attr('fill', colour).attr('transform', 'translate(' + tx *  totalWidth + ', ' + ty * totalHeight + ')');
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
    return shapeFunction(parent, x, y, pointWidth).attr('fill', colour).attr('stroke', '#F04923').attr('class', point.ring.toLowerCase() + '-point');
};
var colourLink = function(pointId, bgColor, color, needFocus) {
    var functionCall = 'addClass';
    if(!color) {
        functionCall = 'removeClass';
    }

   var legendElement = $('#legend-' + pointId)[functionCall]('highlight');
    /*legendElement.css({
        'background-color': bgColor        
    });
    $(legendElement).children().css('color', color);*/
if(needFocus) {
    var ringLegend = $(legendElement).parents('.ring-legend-container').position();
    
    var radarLegend = $(legendElement).parents('.radar-legend');
    $(radarLegend).scrollTop(ringLegend.top);
}
};
var blurOtherPoints = function(pointId) {
    d3.selectAll('a circle, a path');
    d3.select('#point-' + pointId).selectAll('circle, path').attr('fill', '#F04923').attr('stroke', 'white').attr('stroke-width', 2);
    d3.select('#point-' + pointId).selectAll('text').attr('fill', 'white');
};
var restorepoints = function() {
    d3.selectAll('a path, a circle').attr('fill', 'white').attr('stroke','#F04923').attr('stroke-width', 1);
     d3.selectAll('a').selectAll('text').attr('fill', 'black');
};
var unhighlight = function(pointId, needFocus) {
    colourLink(pointId, undefined, undefined, false);

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
        'x': Math.abs(Math.abs(point.radial * scaleFactor * Math.cos(getRadian(startAngle + point.theta))) + (xI) * tx * quadrantRadius),
        'y': Math.abs(Math.abs(point.radial * scaleFactor * Math.sin(getRadian(startAngle + point.theta))) + (yI) * ty * quadrantRadius)
    };
};

function addLabel(svg, text, startArc, endArc, quadrantRadius, tx, ty, colour) {

            var totalWidth = quadrantRadius, totalHeight = quadrantRadius;            
           var x = totalWidth * tx;
           var y = (totalHeight * ty) - (startArc);

            svg.append('text').attr({

                "text-anchor": "start",
                "fill": colour,
                'transform': 'translate(' + (x - 2) + ', ' + (y - 2) + ') rotate(-90)'
            }).style({
                'font-size': '14pt',
                'font-family': 'SapientSansLight, Arial'
            }).text(text);
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
        var highlightPointColor = '#F04923', highlightTextColor = 'white';
    var unHighlightPointColor = 'white', unHighlightTextColor = 'black';
    createShape(point, link, unHighlightPointColor, coord.x, coord.y, pointWidth);

    var textY = point.movement === 't' ? coord.y + 6 : coord.y + 4;
    link.append('text').attr({
        'x': coord.x,
        'y': textY,        
        'fill': '#000'
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
    'quadrantRadius': quadrantRadiusDef,
    'pointWidth': 25,
    'pointFontSize': '10px',
    'textColour': '#000',
    'maxRadius': quadrantRadiusDef,
    'segmentData': [{
        'title': 'Maintain',
        'startRadius': 0,
        'endRadius': quadrantRadiusDef/4,
        'languages-and-frameworks': {
            color: '#36839C'
        },
        'platforms': {
            color: '#2E94CB'
        },
        'tools': {
            color: '#60D0EB'
        },
        'techniques': {
            color: '#507173'
        }
    }, {
        'title': 'Invest',
        'startRadius': quadrantRadiusDef/4 + 1,
        'endRadius': quadrantRadiusDef/2,
        'languages-and-frameworks': {
            color: '#69A2B5'
        },
        'platforms': {
            color: '#64AED9'
        },
        'tools': {
            color: '#89DCEE'
        },
        'techniques': {
            color: '#7B9496'
        }
    }, {
        'title': 'Watch',
        'startRadius': quadrantRadiusDef/2 + 1,
        'endRadius': 3 * quadrantRadiusDef / 4,
        'languages-and-frameworks': {
            color: '#9FC1CE'
        },
        'platforms': {
            color: '#98CAE5'
        },
        'tools': {
            color: '#B0E7F3'
        },
        'techniques': {
            color: '#A7B8B9'
        }
        
    }, {
        'title': 'Exit',
        'startRadius': 3 * quadrantRadiusDef / 4 + 1,
        'endRadius': quadrantRadiusDef,
        'languages-and-frameworks': {
            color: '#C0D8E1'
        },
        'platforms': {
            color: '#BFDEEF'
        },
        'tools': {
            color: '#CEF0F9'
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
    highlight(id, '#F04923', 'white', false);
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
        

        /*var quadrant2LegendHeight = $('.quadrant-2 .radar-legend').height();
        
        var height2Difference = $('#quadrant-2-legend').height() - quadrant2LegendHeight;

        if(height2Difference < 0) {
            $('.quadrant-2 .quadrant-top-padding').height(0);
        } else {
            $('.quadrant-2 .quadrant-top-padding').height(height2Difference - 10);
        }

        var quadrant1LegendHeight = $('.quadrant-1 .radar-legend').height();

        var height1Difference = $('#quadrant-1-legend').height() - quadrant1LegendHeight;

        if(height1Difference < 0) {
            $('.quadrant-1 .quadrant-top-padding').height(0);
        } else {
            $('.quadrant-1 .quadrant-top-padding').height(height1Difference - 10);
        }*/

};



function drawRadar() {
    $('.radar-legend').remove();
     var svg = d3.select('#tech-radar').insert('svg', ':first-child').attr('width', totalWidth).attr('height', totalHeight);
    var quadSetup = quadrant_setup();
     var scaleFactor = CONFIG.quadrantRadius / CONFIG.maxRadius;
    
    var quadrantData = CONFIG.quadrantData[quadrantName];
   
    
    quadrant(svg, quadrantName, CONFIG.quadrantRadius, scaleFactor, CONFIG.segmentData, quadrantData.startAngle, quadrantData.tx, quadrantData.ty, CONFIG.textColour);
    


    _(CONFIG.segmentData).each(function(segment) {
        
        addLabel(svg, segment.title, segment.startRadius * scaleFactor, segment.endRadius * scaleFactor, CONFIG.quadrantRadius, quadrantData.tx, quadrantData.ty, 'white');        
    });
    

var pointIndex = 0;
var legendIndex = 0;

var quadrantIndex = 1;
     
     var filteredData = _.filter(radar_data, function(d) {return d.quadrant.toLowerCase().replace(/ /g, '-') == quadrantName; })
 
        var legendObject= {};

        legendObject.parent = { color: CONFIG.segmentData[0][quadrantName].color, name: quadrantName, pointIndex: pointIndex };

        legendObject.items = [];

        if(filteredData.length > 0) {
        _(CONFIG.segmentData).each(function(segment) {
            var ringLegendObject = {
                color: segment[quadrantName].color,
                title: segment.title,
                items:  _.filter(filteredData[0].items, function(d) {return d.ring == segment.title; })
            };

            legendObject.items.push(ringLegendObject);          
        });
    }
        var templating = _.template($('#legend-template').html());
       $('#quadrant-' + (quadrantIndex) +'-legend').append(templating(legendObject));

       $('.quadrant-' + (quadrantIndex) +' .legend-header').css('color', legendObject.parent.color).html(legendObject.parent.name.replace(/-/g, ' ').replace('and', '&'));
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
            var quadrantData = CONFIG.quadrantData[quadrantName];
    
                _(points).each(function(point) {
                    drawpoint(point, svg, quadrantData.colour, scaleFactor, CONFIG.quadrantRadius, quadrantData.tx, quadrantData.ty, CONFIG.pointWidth, CONFIG.pointFontSize, quadrantData.startAngle);
                });
           
        }
     }
     

    bindEvents();

};

})(jQuery);