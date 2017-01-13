// BEGIN ------------------------------- SPARQL endpoint and query variables ------------------------------------- //

var sparqlServer = "http://cfdev.intersect.org.au:8080/rdf4j-server/repositories/uquol?query=";

var sparqlPrefixes = "PREFIX%20owl%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23%3E%0D%0APREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0APREFIX%20uquol%3A%20%3Chttp%3A%2F%2Fcfdev.intersect.org.au%2Fdef%2Fvoc%2F%3E%0D%0APREFIX%20skos%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23%3E%0D%0A";

var sparqlSelectNodes = "SELECT%20%3Fid%20%3Flabel%0D%0AWHERE%20%7B%0D%0A%20%20%20%20%3Fid%20a%20skos%3Aconcept%3B%0D%0A%20%20%20%20%20%20%20%20%20%20skos%3AprefLabel%20%3Flabel%20.%0D%0A%7D";

var sparqlSelectLinks = "SELECT%20%3Fsource%20%3Ftarget%0D%0AWHERE%20%7B%0D%0A%20%20%20%20%3Ftarget%20skos%3Abroader%20%3Fsource.%0D%0A%7D%0D%0A";

var nodeRequest = sparqlServer + sparqlPrefixes + sparqlSelectNodes;

var linkRequest = sparqlServer + sparqlPrefixes + sparqlSelectLinks;

// END -------------------------------- SPARQL endpoint and query variables ------------------------------------- //

//var graph;

var BogBasicMapLink = "http://cftest.intersect.org.au/geoserver/wms?layers=geonode%3Asa2_2016_aust_epsg4326&width=1131&bbox=96.8169413940001%2C-43.740509603%2C167.998034996%2C-9.14217597699997&service=WMS&format=image%2Fjpeg&srs=EPSG%3A4326&request=GetMap&height=550";
//var BogBasicMapLink = "geonode-sa2_2016_aust_epsg4326.jpg";

var width = window.innerWidth,
    height = window.innerHeight;

var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    //    width = +svg.attr("width"),
    //    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var dragFrom = {};

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

//d3.json("miserables.json", function (error, graph) {
loadGraph(function (graph) {

    console.log("After loadGraph, graph:");
    console.log(graph);

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function (d) {
            return Math.sqrt(d.value);
        });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("g");

    var circle = node.append("circle")
        .attr("r", 40)
//        .attr("fill", "#88dd88")
//        .attr("fill", function (d) {
//            return color(d.group);
//        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var text = node.append("text")
        .text(function (d) {
            return d.label.value;
        })
        .attr("class", "nodetext");

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        circle
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });

        text
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;
            });
    }
});

function loadGraph(callback) {
    d3.json(nodeRequest)
//        .header("Accept", "application/sparql-results+json")
        .get(function (nodeError, nodeGraph) {
        if (nodeError) throw nodeError;
        if (!nodeGraph.head.vars.equals(["id", "label"])) throw "Unexpected vars in response to nodeRequest: " + nodeGraph.head.vars;
        var nodes = nodeGraph.results.bindings;
        
        d3.json(linkRequest)
//            .header("Accept", "application/sparql-results+json")
            .get(function (linkError, linkGraph) {
            if (linkError) throw linkError;
            if (!linkGraph.head.vars.equals(["source", "target"])) throw "Unexpected vars in response to linkRequest: " + linkGraph.head.vars;
            var links = linkGraph.results.bindings;
            
            var graph = {nodes, links};
            callback(graph);
        });
    });
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    dragFrom = {
        x: d.x,
        y: d.y
    };
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    if (d.x === dragFrom.x && d.y === dragFrom.y) {
        alert("Clicked!");
        window.open(BogBasicMapLink, '_self'
                  );
//                  ,'resizable,location,menubar,toolbar,scrollbars,status');
    }
}

// BEGIN --------------------------------------- Compare arrays --------------------------------------- //
// as per http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript

// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time 
        if (this.length != array.length)
            return false;

        for (var i = 0, l = this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;
            } else if (this[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }
    // Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {
    enumerable: false
});

// END --------------------------------------- Compare arrays --------------------------------------- //