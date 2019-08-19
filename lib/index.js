import {
  assign,
  map
} from 'min-dash';

import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

var DEFAULT_ATTRS = {
  fill: 'none',
  stroke: 'black',
  strokeWidth: 2
};

/**
 * @typedef {Object} Point
 *
 * @param {number} point.x
 * @param {number} point.y
 */

/**
 * Create SVG curve.
 *
 * @param {Array<Point>} points
 * @param {Object} [attrs]
 */
export function createCurve(points, attrs = {}) {
  var path = svgCreate('path');

  var data = getData(points);

  svgAttr(path, assign({}, DEFAULT_ATTRS, attrs, {
    d: data
  }));

  return path;
}

function getData(points) {
  var segments = getSegments(points);

  if (segments.length === 1) {
    return getSingleSegmentData(segments[0]);
  }

  var startSegment = segments.shift();

  return [
    moveTo(startSegment.start),
    quadraticCurve(startSegment.controlPoint, startSegment.end)
  ].concat(map(segments, function(segment) {
    return sameCurve(segment.controlPoint, segment.end);
  })).join(' ');
}

function getSingleSegmentData(segment) {
  var { start, controlPoint, end } = segment;

  return [
    moveTo(start),
    quadraticCurve(controlPoint, end)
  ].join(' ');
}

function getSegments(points) {
  if (points.length === 2) {
    return [
      {
        start: points[0],
        controlPoint: getMid(points[0], points[1]),
        end: points[1]
      }
    ];
  }

  if (points.length === 3) {
    return [
      {
        start: points[0],
        controlPoint: points[1],
        end: points[2]
      }
    ];
  }

  return [ getStartSegment(points) ]
    .concat(getMiddleSegments(points))
    .concat([ getEndSegment(points) ]);
}

function getStartSegment(points) {
  return {
    start: points[0],
    controlPoint: points[1],
    end: getMid(points[1], points[2])
  };
}

function getMiddleSegments(points) {
  var segments = [];

  for (var i = 1; i < points.length - 3; i++) {
    segments.push({
      start: getMid(points[ i ], points[ i + 1 ]),
      controlPoint: points[ i + 1 ],
      end: getMid(points[ i + 1 ], points[ i + 2 ])
    });
  }

  return segments;
}

function getEndSegment(points) {
  return {
    start: getMid(points[points.length - 3], points[points.length - 2]),
    controlPoint: points[points.length - 2],
    end: points[points.length - 1]
  };
}

function moveTo(a) {
  return [ 'M', a.x, a.y ].join(' ');
}

function quadraticCurve(a, b) {
  return [ 'Q', a.x, a.y, b.x, b.y ].join(' ');
}

function sameCurve(a, b) {
  return [ 'S', a.x, a.y, b.x, b.y ].join(' ');
}

function getMid(a, b) {
  return {
    x: Math.round((a.x + b.x) / 2),
    y: Math.round((a.y + b.y) / 2)
  };
}