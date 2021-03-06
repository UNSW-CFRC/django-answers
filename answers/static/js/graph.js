var eldaServer = "http://cfdev.intersect.org.au:8080/dna/";
var eldaSelectNodes = "nodes";
var eldaSelectLinks = "links";
var eldaSelectMap = "map?concept=";
//var eldaSelectImages = "images?&concept=";

//var sparqlSelectAncestors = "SELECT%20%3Fid%0D%0AWHERE%20%7B%20%3Fid%20a%20skos%3Aconcept%20.%0D%0A%20%20FILTER%20%28%21%20EXISTS%20%7B%0D%0A%20%20%20%20%20%20%3Fid%20skos%3Abroader%20%3Fo%7D%0D%0A%20%20%29%0D%0A%7D";

var nodeRequest = eldaServer + eldaSelectNodes;
var linkRequest = eldaServer + eldaSelectLinks;
var mapRequest = eldaServer + eldaSelectMap;
//var imageRequest = eldaServer + eldaSelectImages;

//var ancestorRequest = sparqlServer + sparqlPrefixes + sparqlSelectAncestors;

var width = window.innerWidth,
  height = window.innerHeight,
  nodeRadius = 18;

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var dragFrom = {};

//var attractForce = d3.forceManyBody().strength(20).distanceMax(400).distanceMin(200);
//var repelForce = d3.forceManyBody().strength(-100).distanceMax(200).distanceMin(0);
var attractForce = d3.forceManyBody().strength(2);
//var repelForce = d3.forceManyBody().strength(-100);
var repelForce = d3.forceManyBody().strength(-300).distanceMax(300);

//var simulation = d3.forceSimulation(nodeData).alphaDecay(0.03).force("attractForce", attractForce).force("repelForce", repelForce);

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) {
    return d.id;
  }))
  .alphaDecay(0.03)
  .force("attractForce", attractForce)
  .force("repelForce", repelForce)
  //    .force("charge", d3.forceManyBody())
  .force("charge", function () {
    return -100
  })
  .force("center", d3.forceCenter(width / 2, height / 2));

loadGraph(function (graph) {
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line");
  //        .attr("stroke-width", function (d) {
  //            return Math.sqrt(d.value);
  //        });

  var circle = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("r", nodeRadius)
    .attr("id", function (d) {
      return "node_" + d.id.replace(/\W/g, '_')
    })
    //        .attr("fill", "#88dd88")
    //        .attr("fill", function (d) {
    //            return color(d.group);
    //        })
    .on("mouseover", mapMouseOver)
    .on("mouseout", mapMouseOut)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // Append images
  //  var images = nodeEnter.append("svg:image")
  //    .attr("xlink:href", function (d) {
  //      return d.img;
  //    })
  //    .attr("x", function (d) {
  //      return -nodeRadius/2;
  //    })
  //    .attr("y", function (d) {
  //      return -nodeRadius/2;
  //    })
  //    .attr("height", nodeRadius)
  //    .attr("width", nodeRadius);

  var text = svg.append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(graph.nodes)
    .enter().append("text")
    .text(function (d) {
      return d.prefLabel;
    })
    .attr("class", "nodetext")
    .attr("id", function (d) {
      return "lbl_" + d.id.replace(/\W/g, '_');
    });

  //    for (var i = 0; i < graph.ancestors.length; i++) {
  //        highlight(graph.ancestors[i], true);
  //        d3.select("#" + "node_" + graph.ancestors[i]).attr("gen", 0);
  //    }

  for (var i = 0; i < graph.nodes.length; i++) {
    if (graph.nodes[i].topConceptOf) {
      d3.select("#" + "node_" + graph.nodes[i].id.replace(/\W/g, '_')).gen = 0;
      highlight("node_" + graph.nodes[i].id.replace(/\W/g, '_'), true);
    }
  }

  //    for (i = 0; i < graph.links.length; i++) {
  //        if (graph.ancestors.indexOf("node_" + graph.links[i].source.replace(/\W/g, '_')) >= 0) {
  //            d3.select("#" + "node_" + graph.links[i].target.replace(/\W/g, '_')).attr("gen", 1);
  //        }

  for (i = 0; i < graph.links.length; i++) {
    if (graph.nodes.indexOf("node_" + graph.links[i].source.replace(/\W/g, '_')) >= 0) {
      d3.select("#" + "node_" + graph.links[i].target.replace(/\W/g, '_')).gen = 1;
    }
  }

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);

  function mapMouseOver() {
    highlight(this.id, true);
  }

  function mapMouseOut() {
    highlight(this.id, false);
  }

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
        return d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x));
      })
      .attr("cy", function (d) {
        return d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y));
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
    .get(function (nodeError, nodeGraph) {
      if (nodeError) throw nodeError;
      var nodes = nodeGraph.result.items;

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].id = nodes[i]._about;
      }

      d3.json(linkRequest)
        .get(function (linkError, linkGraph) {
          if (linkError) throw linkError;
          var links = linkGraph.result.items;

          for (var i = 0; i < links.length; i++) {
            links[i].source = links[i]._about;
            links[i].target = links[i].broader;
          }
          var graph = {
            nodes, links
          };
          callback(graph);

          //                    d3.json(ancestorRequest)
          //                        .get(function (ancestorError, ancestorGraph) {
          //                            if (ancestorError) throw ancestorError;
          //                            var ancestors = ancestorGraph.results.bindings;
          //
          //                            for (var i = 0; i < ancestors.length; i++) {
          //                                ancestors[i] = "node_" + ancestors[i].id.value.replace(/\W/g, '_');
          //                            }
          //                            var graph = {
          //                                nodes, links, ancestors
          //                            };
          //                        });
        });
    });
}

function highlight(nodeId, state) {
  d3.select("#" + nodeId)
    .classed("highlight", state);
  d3.select("#" + nodeId.replace(/^node_/, 'lbl_'))
    .classed("highlight", state);
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
    map(d);
  }
}

function map(node) {
  d3.json(mapRequest + node.prefLabel)
    .get(function (mapError, mapGraph) {
      if (mapError) throw mapError;
      var map = mapGraph.result.items[0];

      var mapUrl = map.wxsServer +
        "/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=" + map.layer +
        "&STYLES=" + map.structure.component[0].prefStyle +
        "&BBOX=" + bbox(map.extent) +
        "&SRS=EPSG%3A4326&FORMAT=image%2Fpng&WIDTH=" + width +
        "&HEIGHT=" + height + "&TRANSPARENT=True";

      window.open(mapUrl, '_self');
    })
}

function bbox(extent) {
  var polygon = extent.replace(/POLYGON\(\(([^\)]*)\)\)/, '$1')
    .replace(/\s/, "")
    .split(",");
  if (polygon.length % 2 != 0) {
    throw "Error in dataset extent string: odd number of values";
  }

  var bbox = [180, 90, -180, -90];
  var mapWidth, mapHeight, mapCenX, mapCenY, mapAspect, WinAspect;

  for (var i = 0; i < polygon.length; i += 2) {
    bbox[0] = Math.min(bbox[0], polygon[i]);
    bbox[1] = Math.min(bbox[1], polygon[i + 1]);
    bbox[2] = Math.max(bbox[2], polygon[i]);
    bbox[3] = Math.max(bbox[3], polygon[i + 1]);
  }

  //  Calculate aspect ratios as width/height 
  mapWidth = bbox[2] - bbox[0];
  mapHeight = bbox[3] - bbox[1];
  mapCenX = bbox[0] + mapWidth / 2;
  mapCenY = bbox[1] + mapHeight / 2;
  mapAspect = mapWidth / mapHeight;
  winAspect = width / height;

  // Pad bbox to fit client window
  if (winAspect > mapAspect) { // Window is wider than map
    bbox[0] = mapCenX - (mapWidth / 2) * (winAspect / mapAspect);
    bbox[2] = mapCenX + (mapWidth / 2) * (winAspect / mapAspect);
  } else {
    bbox[1] = mapCenY - (mapHeight / 2) * (mapAspect / winAspect);
    bbox[3] = mapCenY + (mapHeight / 2) * (mapAspect / winAspect);
  }

  return bbox.toString();
}

// BEGIN ------------------ Compare arrays ------------------ //
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

// END ------------------ Compare arrays ------------------ //