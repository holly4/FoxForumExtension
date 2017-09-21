/* exported drawActivityGraph */

/*
	.axis {
	  font: 10px sans-serif;
	}

	.axis path,
	.axis line {
	  fill: none;
	  stroke: #000;
	  shape-rendering: crispEdges;
	}
*/

// draw graph over T-2 hours to now
// object {
//  ticks: value    
//}

/* exported Module_ActivityGraph */

function Module_ActivityGraph(parm) {
    settings = parm;
    let loggingEnabled = true;
    let showActivityGraph = true;
    var observerId = undefined;
    let settings = {};
    let posts = [];

    return {
        perform: perform,
        draw: draw
    };

    function log(line) {
        if (loggingEnabled) {
            console.log("ActivityGraph: " + line);
        }
    }

    function perform(parm) {
        settings = parm;
        loggingEnabled = settings.get('loggingEnabled');

        console.log('DrawActivityGraph',
            settings.get('showActivityGraph'));

        showActivityGraph = settings.getOrSet('showActivityGraph', true);

        addHeader($('#ffh-div'), "Show Activity Graph", showActivityGraph, function (state) {
            showActivityGraph = state;
            state ? $('#activityGraph').show() : $('#activityGraph').hide();
            settings.set('hideTopActivityBar', showActivityGraph);
        });

        var css = '.axis { font: 10px sans-serif; } .axis path, .axis line { fill: none; stroke: #000; shape-rendering: crispEdges; }';
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);

        // connect to observer
        observerId = modules.commentObserver.attach(this, processMutations);
        log("attached to observer: " + observerId);

        draw(posts, $("#ffh-div"));

        setInterval(function () {
            draw(posts, $("#ffh-div"));
        }, 60 * 1000);
    }

    function addHeader($container, text, _state, set_state) {
        let state = _state;
        let $div = $('<div>')
            .appendTo($container)
            .css('margin-top', '.5em;')
            .css('margin-left', '1em');

        $('<img>')
            .appendTo($div)
            .attr('src', state ? checkedBox : checkBox)
            .css('height', iconSize)
            .css('width', iconSize)
            .click(function () {
                state = !state;
                set_state(state);
                $(this).attr('src', state ? checkedBox : checkBox);
            });

        $('<span>')
            .appendTo($div)
            .css('margin-left', '.5em')
            .text(text);
    }

    function draw(posts, location) {

        // add a point for now if nonw
        let now = +roundDate(new Date());
        if (!posts[now]) {
            posts[now] = 1;
        }

        let margin = {
            top: 5,
            right: 0,
            bottom: 5,
            left: 25
        };

        if (!isExtension()) {
            posts = makeData(posts);
        }

        var data = [];

        // add in graph div
        if ($('#activityGraph').length === 0) {
            console.log("Adding activity graph div");
            location.after(
                "<div id='activityGraph'><div id='loc'></div></div>");
            $('#activityGraph').css('border', '1px solid black');
            $('#activityGraph').css('margin-bottom', 20);
        }

        // remove any present graph
        $('#loc').empty();

        console.log("prepare");

        const minute = 60 * 1000;
        var start = _.min(_.keys(posts).map((i) => parseInt(i)));
        var end = _.max(_.keys(posts).map((i) => parseInt(i)));
        let deltaMinutes = (end - start) / minute;

        //console.log(deltaMinutes);
        //console.log(new Date(start));
        //console.log(new Date(end));

        if (deltaMinutes < 120) {
            end = start + 120 * minute;
        } else {
            start = end - 120 * minute;
        }
        //console.log(new Date(start));
        //console.log(new Date(end));

        let iterations = 0;

        // copy while filling in blanks in data
        for (let n = start; n <= end; n += 60 * 1000) {
            if (++iterations > 250) {
                console.log("too many iterations");
                break;
            }
            var val = {
                date: start + n,
                value: posts[n] ? posts[n] : 0
            }
            //console.log(val);
            data.push(val);
        }

        //console.log("draw ", data.length, " points");

        let width = location.width() - margin.left - margin.right;
        let height = 100 - margin.top - margin.bottom;

        var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickValues([])
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(2);

        var svg = d3.select("#loc").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        x.domain(data.map(function (d) {
            return d.date;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.value;
        })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

        svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .style("fill", "steelblue")
            .attr("x", function (d) {
                return x(d.date);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("height", function (d) {
                return height - y(d.value);
            });

        console.log("done");

    }

    function processMutations(mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.hasOwnProperty("userName")) {
                let minute = roundDate(new Date());
                console.log("post at ", minute);
                minute = +minute;
                if (!posts[minute]) {
                    posts[minute] = 1;
                } else {
                    posts[minute]++;
                }
            }
        });
    }

    function roundDate(date, coeff) {
        coeff = 1000 * 60;
        return new Date(Math.trunc(date.getTime() / coeff) * coeff)
    }

    function makeData() {
        let posts = {
            1505754240000: 2,
            1505754300000: 7,
            1505754360000: 6,
            1505754420000: 7,
            1505754480000: 6,
            1505754540000: 1,
            1505754780000: 10,
            1505754840000: 5,
        }
        return posts;
    }
}