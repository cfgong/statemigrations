const FIRST_YEAR = 2005;
const LAST_YEAR = 2017;
const DIAGLOGUE_DEFAULT = "Hover over or select a state.";
// const LEGEND_DEFAULT = '<div> <span style= "color: blue"> STATE A &#8594; SELECTED STATE </span>: Largest proportion of those who left state A in the given year moved to selected state </div><div><span style = "color: red"> SELECTED STATE &#8594; STATE B</span>: Largest proportion of those who left selected state in the given year moved to state B</div>';
var currentState = "";
var currentStateDataObject;
// year to year data dict
var incoming_states_all = {};
var outgoing_states_all = {};
// function to populate dicts by reading csvs
function load_in_csv(dateYear){
    var incoming_states = {};
    var outgoing_states = {};
    var dataPath = "/data/cleaned/state"+dateYear+".csv";
    d3.csv(dataPath, function(data){
        data.forEach(function(d){
        var starting_state = d["starting"].replace(/\s+/g, '').toString();
        var ending_state = d["ending"].replace(/\s+/g, '').toString();

        incoming_states[starting_state] = ending_state;

        var outgoing_states_list = outgoing_states[ending_state];
        if (outgoing_states_list == undefined){
            outgoing_states[ending_state] = new Array();
            outgoing_states[ending_state].push([starting_state]);
        } else {
            outgoing_states[ending_state].push([starting_state]);
        }

        });
    });
    incoming_states_all[dateYear] = incoming_states;
    outgoing_states_all[dateYear] = outgoing_states;
}
// load in data for all the years
for (var i = FIRST_YEAR; i <= LAST_YEAR; i++){
    load_in_csv(i.toString());
    var checkedBool = false;
    if (i == FIRST_YEAR){
        checkedBool = true;
    }
}
function setTitle(yearDate){
    document.getElementById("title").innerHTML = "Popular State Migrations in " + yearDate; // change title
}

// create slider range thing
document.getElementById("yearslider").innerHTML += '<input id = "slider" type = "range" min = "' 
+ FIRST_YEAR + '" max = "' + LAST_YEAR + '" oninput = "setYear()" list = "steplist">';
// add labels
document.getElementById("yearslider").innerHTML += '<datalist id = "steplist"></datalist>';
for (var i = FIRST_YEAR; i <= LAST_YEAR; i++){
    document.getElementById("steplist").innerHTML += '<option>' + i +'</option>';
}
// set default year
var currYear = FIRST_YEAR.toString();
document.getElementById("slider").defaultValue = currYear;
setTitle(currYear);

// function for slider
function setYear(){
    var yearDate = document.getElementById("slider").value;
    console.log(yearDate);
    currYear = yearDate; // set new current year
    setTitle(yearDate);
    if (currentState != ""){
        return drawArcs(currentState);
    }
}
// set dialogue message box default
document.getElementById("dialoguebox").innerHTML = DIAGLOGUE_DEFAULT;
// set legend message default
document.getElementById("legend").innerHTML = generateLegendMessage("STATE", "N/A", "N/A", currYear);

// for the map drawing and arc graphing
var width = 960,
height = 500;

var svg = d3.select('#map').append('svg')
.attr('width', width)
.attr('height', height);

var projection = d3.geo.albersUsa()
.scale(1000)
.translate([width / 2, height / 2]);

var path = d3.geo.path()
.projection(projection);

var state_centers = {};

d3.csv("/data/cleaned/state_centers.csv", function(data){
    data.forEach(function(d){
        var stateName = d["state"].replace(/\s+/g, '');
        state_centers[stateName] = [+d["longtitude"], +d["latitude"]];
    });
});

d3.json('/data/state/states.json', function(error, us) {
var isClicked = false;
svg.selectAll('.states')
    .data(topojson.feature(us, us.objects.usStates).features)
    .enter()
    .append('path')
    .attr('class', 'states')
    .attr('d', path)
    .on('mouseover', function(d){
        if (!isClicked) {
            d3.select(this).style("fill", "#cccccc");
            var name = d.properties.STATE_ABBR;
            var toDisplay = "You are hovering over " + name + ".";
            name = name.replace(/\s+/g, '');
            document.getElementById("dialoguebox").innerHTML = toDisplay;
            return drawArcs(name);
        }
    })
    .on('mouseleave', function(d){
        if (!isClicked) {
            d3.select(this).style("fill", "#e5e5e5");
            var name = d.properties.STATE_ABBR.replace(/\s+/g, '');
            var svg_id = "#" + name;
            var outgoing_id = "." + name + "outgoing";
            d3.select(svg_id).remove();
            d3.select(outgoing_id).remove();
            document.getElementById("dialoguebox").innerHTML = DIAGLOGUE_DEFAULT;
            document.getElementById("legend").innerHTML = generateLegendMessage("STATE", "N/A", "N/A", currYear);
        }
    })
    .on('click', function(d){
        function getClickDisplayMessage(currentState){
            return "Click on " +  currentState +
            " again or click on another state to toggle hold feature. Also, try changing the year with the slider.";
        }
        var name = d.properties.STATE_ABBR;
        if (currentState == "") {
            isClicked = true;
            currentStateDataObject = this;
            currentState = name;
            d3.select(this).style("fill", "steelblue");
            var toDisplay = getClickDisplayMessage(currentState);
            name = name.replace(/\s+/g, '');
            document.getElementById("dialoguebox").innerHTML = toDisplay;
            return drawArcs(name);
        }
        else if (currentState != name) {
            isClicked = true;
            var potential_ad = "#" + currentState;
            if (d3.select(potential_ad)[0][0] != null) {
                d3.select(potential_ad).remove();
            }
            var potential_id2 = "." + currentState + "outgoing";
            if (d3.select(potential_id2)[0][0] != null) {
                d3.select(potential_id2).remove();
            }
            d3.select(currentStateDataObject).style("fill", "#e5e5e5");
            d3.select(currentStateDataObject).style("hover", "#cccccc");
            d3.select(this).style("fill", "steelblue");
            currentState = name;
            console.log("test:" + currentState);
            currentStateDataObject = this;
            var toDisplay = getClickDisplayMessage(currentState);
            document.getElementById("dialoguebox").innerHTML = toDisplay;
            return drawArcs(name);
        }
        else {
            isClicked = false;
            var potential_ad = "#" + currentState;
            if (d3.select(potential_ad)[0][0] != null) {
                d3.select(potential_ad).remove();
            }
            var potential_id2 = "." + currentState + "outgoing";
            if (d3.select(potential_id2)[0][0] != null) {
                d3.select(potential_id2).remove();
            }
            d3.select(currentStateDataObject).style("fill", "#e5e5e5");
            d3.select(currentStateDataObject).style("hover", "#cccccc");
            currentStateDataObject = null;
            currentState = "";
            document.getElementById("dialoguebox").innerHTML = DIAGLOGUE_DEFAULT;
        }
    })
});

function generateLegendMessage(currentState, incoming, outgoing, year){
    function splitDoubleWords(word){
        console.log(word);
        return word.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    currentState = splitDoubleWords(currentState);
    incoming = splitDoubleWords(incoming);
    var message = "";
    message += "<div>"
    + "<span style = 'color: red'> "+ currentState +" (selected) &#8594; outgoing state</span>: "
    + "In " + year + ", the most popular state to move to from " + currentState + " (selected) was " + incoming + "." 
    + "</div>";
    if (outgoing != undefined){
        message += "<div>" 
        + "<span style= 'color: blue'> Incoming state(s) &#8594; "+ currentState +" (selected)</span>: "
        + "In " + year + ", " + currentState + " (selected) was the most popular state to move to from the state(s): ";

        if (typeof(outgoing) == "object"){
            var outgoingStateCount = outgoing.length;
            for (var i = 0; i < outgoingStateCount; i++){
                message += splitDoubleWords(outgoing[i].toString()); 
                if (i != outgoingStateCount - 1){
                    message += ", ";
                }
            }
        } else {
            message += outgoing;
        }
        
        message += "." 
        + "</div>";
    } else {
        message += "<div>In "+ year + ", " + currentState + " (selected) was the most popular state to move to from no other states. </div>"
    }
    return message;
}

function drawArcs(state) {
    var potential_ad = "#" + state;
    if (d3.select(potential_ad)[0][0] != null) {
        d3.select(potential_ad).remove();
    }
    var potential_id2 = "." + state + "outgoing";
    if (d3.select(potential_id2)[0][0] != null) {
        d3.select(potential_id2).remove();
    }
    var outgoing_states = outgoing_states_all[currYear];
    var incoming_states = incoming_states_all[currYear];
    var incoming = incoming_states[state];
    var curr_state_center = state_centers[state];
    var incoming_state_center = state_centers[incoming];
    var outgoing = outgoing_states[state];
    var outgoingcoords = [];
    document.getElementById("legend").innerHTML = generateLegendMessage(state, incoming, outgoing, currYear);
    if (outgoing != undefined) {
        for (var i = 0; i < outgoing.length; i++) {
            var coord = state_centers[outgoing[i]];
            outgoingcoords.push({
                type: "LineString",
                coordinates: [
                    coord,
                    curr_state_center
                ]
            });
        }
    }

    var links = [];
    links.push({
        type: "LineString",
        coordinates: [
            curr_state_center,
            incoming_state_center
        ]
    });
    //console.log(state + " has incoming state " + incoming + " from " + incoming_state_center + " to " + curr_state_center);
    svg = svg.append("g")
        .attr("class", "arcs");

    svg.selectAll('.arcs')
        .data(links)
        .enter()
        .append('path')
        .attr('id', state)
        .attr('d', function(d) {
            return drawArrowArcs(d, 0, 1);
        })
        .style('fill', '#ff3333')
        .style({
            'stroke': '#ff3333',
            'stroke-width': '1px'
        })

    if (outgoing != undefined ) {
        var classname = "" + state + "outgoing";
        var outgoingArcs = svg.append("g").attr("class", classname);
        outgoingArcs.selectAll('.' + classname)
        .data(outgoingcoords)
        .enter()
        .append('path')
        .attr('d', function(d) {
            return drawArrowArcs(d, 0, 1);
        })
        .style('fill', '#1a53ff')
        .style({
            'stroke': '#1a53ff',
            'stroke-width': '1px'
        })
    }
}

function drawArrowArcs(d, sourceName, targetName) {
    var sourceLngLat = d['coordinates'][sourceName],
        targetLngLat = d['coordinates'][targetName];
    var origin = projection(sourceLngLat);
    var dest = projection(targetLngLat);
    var mid = [ (origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];

    //define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.

    var curveoffset = 20,
    midcurve = [mid[0]+curveoffset, mid[1]-curveoffset]
    // the scalar variable is used to scale the curve's derivative into a unit vector
    scalar = Math.sqrt(Math.pow(dest[0],2) - 2*dest[0]*midcurve[0]+Math.pow(midcurve[0],2)+Math.pow(dest[1],2)-2*dest[1]*midcurve[1]+Math.pow(midcurve[1],2));

    // define the arrowpoint: the destination, minus a scaled tangent vector, minus an orthogonal vector scaled to the datum.trade variable

    arrowpoint = [
        dest[0] - ( 0.5*15*(dest[0]-midcurve[0]) -15*(dest[1]-midcurve[1]) ) / scalar ,
        dest[1] - ( 0.5*15*(dest[1]-midcurve[1]) - 15*(-dest[0]+midcurve[0]) ) / scalar
    ];

    // move cursor to origin
    return "M" + origin[0] + ',' + origin[1]
    // smooth curve to offset midpoint
    + "S" + midcurve[0] + "," + midcurve[1]
    //smooth curve to destination
    + "," + dest[0] + "," + dest[1]
    //straight line to arrowhead point
    + "L" + arrowpoint[0] + "," + arrowpoint[1]
    // straight line towards original curve along scaled orthogonal vector (creates notched arrow head)
    + "l" + (0.3*40*(-dest[1]+midcurve[1])/scalar) + "," + (0.3*40*(dest[0]-midcurve[0])/scalar)
    // smooth curve to midpoint
    + "S" + (midcurve[0]) + "," + (midcurve[1])
    //smooth curve to origin
    + "," + origin[0] + "," + origin[1]
}

function lngLatToArc(d, sourceName, targetName, bend){
    // If no bend is supplied, then do the plain square root
    bend = bend || 1;
    // `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
    // Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`

    var sourceLngLat = d['coordinates'][sourceName],
        targetLngLat = d['coordinates'][targetName];
    console.log(sourceLngLat);
    console.log(targetLngLat);

    if (targetLngLat && sourceLngLat) {
        var sourceXY = projection( sourceLngLat ),
        targetXY = projection( targetLngLat );

        // Uncomment this for testing, useful to see if you have any null lng/lat values
        // if (!targetXY) console.log(d, targetLngLat, targetXY)
        var sourceX = sourceXY[0],
        sourceY = sourceXY[1];

        var targetX = targetXY[0],
        targetY = targetXY[1];

        var dx = targetX - sourceX,
        dy = targetY - sourceY,
        dr = Math.sqrt(dx * dx + dy * dy)*bend;

        // To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
        var west_of_source = (targetX - sourceX) < 0;
        if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
        return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;

    } else {
        return "M0,0,l0,0z";
    }
}