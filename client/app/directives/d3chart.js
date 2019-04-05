(function() {
  'use strict';

  /**
   * @ngdoc directive
   * @name demouiApp.directive:d3Chart
   * @description
   * # d3Chart
   */
  angular.module('demouiApp.directives')
    .directive('d3Chart', function () {
      return {
        template: '<div></div>',
        restrict: 'EA',
        scope: {
          data: '=', // bi-directional data-binding
          properties: '=', // bi-directional data-binding
          refreshInterval: '=', // bi-directional data-binding
          interactionController: '='
        },
        replace: false,
        link: function postLink(scope, element, attrs) {

          /**
           * The createLineGenerators function creates a line generator for each
           * of the number properties defined by the selected logical interface
           * schema.
           */
          scope.createLineGenerators = function() {
            scope.properties.forEach( function(property, index) {
                var lineGenerator = d3.line()
                  .curve(d3.curveMonotoneX) // Smooth the line
                  .x(function(d) { return xRange(d.timestamp); })
                  .y(function(d) { return yRange(d.state[property.name]);});
                lineGenerators[property.name] = lineGenerator;
                scope.createLine(property, index);
              }
            );
          }; // createLineGenerators

          /**
           * The createLine function creates a line on the chart for the
           * specified property.  The index specified determines the color that
           * will be used for the line.
           * 
           * @param property
           *          The property to create the line for.
           * @param index
           *          The index into the color scale that the determines the
           *          color of the line. 
           */
          scope.createLine = function(property, index) {
            chart.append('path')
              .attr('id', property.name + '_line')
              .attr('class', 'line')
              .attr('clip-path', 'url(#' + attrs.id + '_clip)')
              .attr('d', lineGenerators[property.name](scope.data))
              .attr('transform', null)
              .attr('fill', colorScale[index])
              .attr('stroke', colorScale[index]);
          }; // createLine

          /**
           * The setLineHighlight function modifies the style of the line for
           * the specified resource based on the value of the highlight flag
           * passed in. A value of true will highlight the line.  A value of
           * false will remove the highlight.
           *
           * @param propertyName
           *          The name of the property represented by the line.
           * @param highlight
           *          A flag to indicate whether the line should be highlighted.
           *          True to add a highlight, false to remove the highlight.
           */
          scope.interactionController.highlightLine = function(propertyName, highlight) {
            // Attempt to retrieve the line
            var line = chart.select('#' + propertyName + '_line');
            if (!line.empty()) {
              line.classed('hover', highlight);
            }
          }; // highlightLine

          /**
           * The toggleLine function toggles the display of the line on the
           * chart that represents the specified property. 
           *
           * @param $event
           *          The checkbox event that triggered the toggle.
           * @param propertyName
           *          The name of the property represented by the line.
           */
          scope.interactionController.toggleLine = function($event, propertyName) {
            // Attempt to retrieve the line
            var line = chart.select('#' + propertyName + '_line');

            // Now check to see if we need to add or remove the line
            if ($event.target.checked) {
              if (line.empty()) {
                for (var index = 0; index < scope.properties.length; index++) {
                  var property = scope.properties[index];
                  if (property.name === propertyName) {
                    scope.createLine(property, index);
                    break;
                  }
                } // FOR
              }
            } else {
              if (!line.empty()) {
                line.remove();
              }
            }
          }; // toggleLine

          /**
           * The toggleAllLines toggles the display of all of the lines on the
           * chart.
           *
           * @param $event
           *          The checkbox event that triggered the toggle.
           * @param propertyName
           *          The name of the property represented by the line.
           */
          scope.interactionController.toggleAllLines = function($event) {
            if (scope.data) {
              for (var index = 0; index < scope.properties.length; index++) {
                scope.interactionController.toggleLine($event, scope.properties[index].name);
              } // FOR
              document.querySelectorAll('input').forEach(function(checkbox) {
                checkbox.checked = $event.target.checked;
              });
            }
          }; // toggleAllLines

          /**
           * The reset function resets the state of the chart.
           */
          scope.interactionController.reset = function() {
            // First, remove all of the data points and lines from the chart
            scope.removeDataPoints();
            scope.removeLines();
            
            // Reset the session start time
            sessionStartTime = Date.now();
            
            // Empty the data stored in the local scope 
            scope.data = [];

            // Now recreate the lines
            scope.properties.forEach( function(property, index) {
                scope.createLine(property, index);
              }
            );
          }; // reset

          /**
           * The getDomainEndTime function calculates the end time that should
           * be used when defining the domain of the x axis.  Typically, the
           * value returned is the time of the last update but one in the data
           * set.  This allows new control points to be drawn off to the left
           * of the graph and then scrolled into view. It defaults to the
           * session start time if the data set is empty.
           *
           * @return endTime
           *           The end time to be used when rendering the x axis...
           *           format is the number of millis since epoch.
           */
          scope.getDomainEndTime = function() {
            var endTime = sessionStartTime;
            if (scope.data && scope.data.length > 1) {
              endTime = scope.data[scope.data.length - 1].timestamp - 2000;
            }
            return endTime;
          }; // getDomainEndTime

          /**
           * The renderDataPoints function renders circles for each of the data
           * points on lines displayed within the chart whenever the mouse
           * enters the chart.
           */
          scope.renderDataPoints = function() {
            /*
             * The name of each property is used as part of the id for the
             * corresponding lines in the chart.  Iterate over the properties
             * and check to make sure that a line with the specified id is
             * currently being displayed.
             */
            scope.properties.forEach( function(property, index) {
              // Attempt to retrieve the lines with specified id
              var line = chart.select('#' + property.name + '_line');

              // Only render the datapoints if the lines exist
              if (!line.empty()) {
                // Create the data points
                chart.selectAll('circle[id^=\'' + property.name + '_circle\']')
                  .data(scope.data)
                  .enter()
                  .append('circle')
                    .attr('r', 3)
                    .attr('id', function(d) {
                      return property.name + '_circle_' + d.timestamp;
                    })
                    .attr('clip-path', 'url(#' + attrs.id + '_clip)')
                    .attr('cx', function(d) {
                      return xRange(d.timestamp);
                    })
                    .attr('cy', function(d) {
                      return yRange(d.state[property.name]);
                    })
                    .attr('transform', null)
                    .attr('fill', function() {
                      return colorScale[index];
                    })
                    .attr('stroke', function() {
                      return colorScale[index];
                    })
                    .on('mouseover', function(d) {
                      tooltip.html(d.state[property.name].toFixed(2))
                        .style('left', (d3.event.pageX) + 'px')
                        .style('top', (d3.event.pageY - 28) + 'px')
                        .style('opacity', .9);
                    })
                    .on('mouseout', function(d) {
                      tooltip.style('opacity', 0);
                    });
              }
            }); // FOR
          }; // renderDataPoints

          /**
           * The removeDataPoints function removes any data points (circles)
           * that are being displayed on the chart whenever the mouse leaves the
           * chart, or when the reset method is invoked.
           */
          scope.removeDataPoints = function() {
            chart.selectAll('circle').remove();
          }; // removeDataPoints

          /**
           * The removeLines function removes all of the lines (paths) from the
           * chart.
           */
          scope.removeLines = function() {
            chart.selectAll('.line').remove();
          }; // removeLines

          /**
           * The refresh function refreshes the chart on the glass using the
           * most recent data available for the session.
           */
          scope.refresh = function() {
            // // First, calculate the new domain for the x axis
            var endTime = scope.getDomainEndTime();
            var startTime = endTime - sessionWindow;
            xRange.domain([startTime, endTime]);

            // Now work out how far to slide the elements to the left
            var leftShift = 0;
            if (scope.data && scope.data.length > 1) {
              leftShift = xRange(scope.data[scope.data.length - 1].timestamp - scope.data[scope.data.length - 2].timestamp);
            }

            /*
             * Check to see if we are currently showing any data points on the
             * chart and, if we are, add in any new data points that are
             * required for the resource data.
             */
            var circle = chart.select('circle');
            if (!circle.empty()) {
              scope.renderDataPoints();
            }

            // Create the transition
            var t = chart.transition()
              .duration(750)
              .ease(d3.easeLinear);

            // Now update each of the lines on the chart.
            for (var index = 0; index < scope.properties.length; index++) {
              var property = scope.properties[index];

              // Select the line for the current property and update it
              var line = t.select('#' + property.name + '_line');
              line.attr('d', lineGenerators[property.name](scope.data))
                  .attr('transform', null);

              /*
               * Check to see if there are any circles drawn for the data
               * points on the current line and, if there are, update each
               * of them.
               */
              t.selectAll('circle[id^=\'' + property.name + '_circle\']')
                .attr('cx', function(d) {
                  return xRange(d.timestamp);
                })
                .attr('cy', function(d) {
                  return yRange(d.state[property.name]);
                })
                .attr('transform', null);
            } // FOR

            /*
             * Now slide all of the relevant elements to the left.  We
             * transition on the transform rather than on the path to avoid
             * causing the line to wiggle when we start stripping data
             * points from the state data array.  This is described here:
             * 
             *   https://bost.ocks.org/mike/path/
             */
            t.select('.x.DeviceStateChartAxis')
              .call(xAxis)
              .selectAll('text')
              .attr('y', '10');

              if (scope.data && scope.data.length > 65) {
                scope.data.shift();
              }
              console.log('DATA LENGTH: ' + scope.data.length);
  
          }; // refresh

          // Watch for changes to the properties
          scope.$watch('properties', function(newVals, oldVals) {
            scope.createLineGenerators();
          }, true);

          // Watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {
            scope.refresh();
          }, true);

          // Set the width of the chart to the width of the state table
          var chartDiv = document.getElementById('numericPropertiesTable')
          var height = 500;
          var width = chartDiv.clientWidth;
          var chartMargins = {top: 10, right: 15, bottom: 20, left: 25};
          var chartWidth  = width - chartMargins.left - chartMargins.right;
          var chartHeight = height - chartMargins.top  - chartMargins.bottom;
          var sessionStartTime = Date.now();
          var sessionWindow = 60000; // 1 minute

          /*
          * Now define the the scales and axes.  We want to scale the axes so
          * that they fit the width and height of the chart.
          */
          var colorScale = d3.schemeCategory20;
          var xRange = d3
            .scaleTime()
            .range([0, chartWidth]);
          var yRange = d3.scaleLinear()
            .range([chartHeight, 0]);
          var xAxis = d3.axisBottom(xRange)
            .ticks(5)
            .tickFormat(d3.timeFormat('%X'))
            .tickSize(-chartHeight);
          var yAxis = d3.axisLeft(yRange)
            .ticks(5)
            .tickSize(-chartWidth);
          var lineGenerators = {};

        /*
         * Now create the actual chart.  This is actually an SVG element that
         * fills the space available for the chart.  A g element is then appended
         * as a child of the SVG element and is used to group all of the remaining
         * SVG elements for the chart.  This g element is, in effect, the chart.
         */
        var tooltip = d3.select('body')
          .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
        var chart = d3.select(element[0])
          .append('svg')
            .attr('id', attrs.id + '_svg')
            .attr('width', width)
            .attr('height', height)
          .append('g')
            .attr('transform', 'translate(' + chartMargins.left + ',' + chartMargins.top + ')')
            .attr('width', width)
            .attr('height', height)
            .attr('pointer-events', 'all')
            .on('mouseenter', function() {
              scope.renderDataPoints();
            })
            .on('mouseleave', function() {
              scope.removeDataPoints();
            });

          // Add the clip path
          chart.append('clipPath')
              .attr('id', attrs.id + '_clip')
            .append('rect')
              .attr('id', attrs.id + '_clip-rect')
              .attr('width', chartWidth)
              .attr('height', chartHeight);

          /*
           * Now create the actual x and y axes for the chart.  If there is no data
           * then simply define some dummy domains to ensure that something sensible
           * is rendered.
           */
          var endTime = scope.getDomainEndTime();
          var startTime = endTime - sessionWindow;
          xRange.domain([startTime, endTime]);
          yRange.domain([0, 100]).nice();
          var chartLayer = chart.append('g');
          chartLayer.append('g')
            .attr('class', 'x DeviceStateChartAxis')
            .attr('transform', 'translate(0,' + chartHeight + ')')
            .call(xAxis)
              .selectAll('text')
              .attr('y', '10');
          chartLayer.append('g')
              .attr('class', 'y DeviceStateChartAxis')
              .call(yAxis);
      }
    };
  });
})();
