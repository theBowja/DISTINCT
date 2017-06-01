var SVGGRAPH = (function() {

	// init for delete selected nodes/links functionality
	d3.select("#svgfocus")
		.on("keydown", function() {
			switch (d3.event.keyCode) {
				case 27: // ESCAPE - for deselecting everything
					d3.selectAll("#nodes circle.selected").classed("selected", false);
					d3.selectAll("#links line.selected").classed("selected", false);
					control.selections.deselectsource();
					break;
				case 46: // DELETE
					if (!control.canCreate) break;
					control.selections.deletenodes();
					control.selections.deletelinks();
					control.selections.deletesource();
			}
		});

	var svg = d3.select("svg")
	var width = +svg.attr("width");
	var height = +svg.attr("height");

	// for zooming
	var zoom = d3.zoom()
		.scaleExtent([1 / 2, 4])
		.on("zoom", zoomed);
	svg.append("rect")
		.attr("id", "background")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all")
		.call(zoom)
		.on("dblclick.zoom", null)
		.on("dblclick", function() {
			// console.log(d3.zoomTransform(this));
			var point = d3.mouse(this);
			var transform = d3.zoomTransform(this);
			var newnodes = simulation.nodes();
			newnodes.push({
				"name": "unnamed",
				"color": "black",
				"x": (point[0] - transform.x)/transform.k,
				"y": (point[1] - transform.y)/transform.k
			});

			updateNodes(newnodes);
			tick();
		})
		.on("contextmenu", function() {
			
		}) // "contextmenu" would be for right click
		;
	var g = svg.append("g");
	function zoomed() {
		g.attr("transform", d3.event.transform);
	}

	var control = { // controls for the simulation: play/pause, cursor type, etc.
		canPlay: false, // default: false; it is paused
		updateMediaButton: function(state) {
			if (state === undefined || typeof state !== 'boolean') state = this.canPlay;
			if (state === true) {
				d3.select("#media-path").attr("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z"); // pause icon
				d3.select("#media-title").text("Currently running (click here to pause force simulation)");
				simulation.alpha(0.3).restart();
			} else if (state === false) {
				d3.select("#media-path").attr("d", "M8 5v14l11-7z"); // play icon
				d3.select("#media-title").text("Currently paused (click here to resume force simulation)");
				simulation.stop();
			}
			tick(); // puts nodes/links into their expected places
		},
		canCreate: false, // default: false; cannot create/delete nodes/links
		updateInteractionButton: function(state) {
			if (state === undefined || typeof state !== 'boolean') state = this.canCreate;
			if (state === true) {
				d3.select("#interaction-path").attr("d", "M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"); // circle plus icon
				d3.select("#interaction-title").text("Create node (DOUBLE CLICK)/link (SHIFT+CLICK two nodes) or remove a selected node/link (DELETE)");
			} else if (state === false) {
				d3.select("#interaction-path").attr("d", "M10,2A2,2 0 0,1 12,4V8.5C12,8.5 14,8.25 14,9.25C14,9.25 16,9 16,10C16,10 18,9.75 18,10.75C18,10.75 20,10.5 20,11.5V15C20,16 17,21 17,22H9C9,22 7,15 4,13C4,13 3,7 8,12V4A2,2 0 0,1 10,2Z"); // drag cursor icon
				d3.select("#interaction-title").text("Drag node/link or edit its properties (DOUBLE CLICK)");
				control.selections.deselectsource();
			}
			// regular mouse pointer icon; maybe to implement a selection tool
			//.attr("d", "M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z")
			// move icon; probably useless
			//.attr("d", "M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z")
		},
		selections: { // TODO: should really make these their own functions
			deletenodes: function() {
				var seldats = d3.selectAll("#nodes circle.selected, circle.selectedforlink").data();
				var newnodes = simulation.nodes();
				var newlinks = simulation.force("link").links();
				newnodes = newnodes.filter(function(dn) { // filters out any selected node
					for (var i = 0; i < seldats.length; i++) { // TODO: see if this triple-nested loop may have performance issues on large graphs
						if (dn.name === seldats[i].name) {
							newlinks = newlinks.filter(function(sn) { // filters out any links connected to the selected node
								return (dn.name !== sn.source.name && dn.name !== sn.target.name);
							});
							return false;
						}
					}
					return true;
				});
				updateNodes(newnodes);
				updateLinks(newlinks);
			},
			deletelinks: function() {
				var seldats = d3.selectAll("#links line.selected").data();
				var newlinks = simulation.force("link").links();
				newlinks = newlinks.filter(function(d) { // filters out any selected link
					return seldats.every(function(s) {
						return d.source.name !== s.source.name || d.target.name !== s.target.name;
					});			
				});
				updateLinks(newlinks);
			},
			source: undefined, // stores selection except when undefined
			deselectsource: function() {
				if (typeof this.source !== "undefined")
					this.source.classed("selectedforlink", false);
				this.source = undefined;
			},
			deletesource: function() {
				if (typeof this.source !== "undefined") {
					var srcname = this.source.datum().name;
					var newnodes = simulation.nodes();
					newnodes = newnodes.filter(function(dn) {
						return srcname !== dn.name; // TODO: delete associated links
					});
					updateNodes(newnodes);

					this.source = undefined;
				}
			}
		},
	};

	var txtdmp = {"version":"0.0.1","nodes":[{"name":"My phone","color":"black","index":0,"x":461.2960405859041,"y":277.92884126106566,"vy":0.00012863524492965942,"vx":-0.00005998378344618709},{"name":"My laptop","color":"black","index":1,"x":498.3585749771392,"y":331.1443928567981,"vy":0.0003382745034393672,"vx":-0.00004791681585219554},{"name":"My tablet","color":"black","index":2,"x":511.9092850879242,"y":275.92844260557075,"vy":0.0005477273101865026,"vx":-0.00012739247996039184},{"name":"My computer","color":"black","index":3,"x":520.9278666139944,"y":304.5713866318403,"vy":0.000235276103997298,"vx":-0.0002378772954907092},{"name":"My tv","color":"black","index":4,"x":486.61810502198665,"y":265.43091965925606,"vy":0.0004097001932323695,"vx":0.0000323610571067794},{"name":"My router","color":"black","index":5,"x":487.0923152995146,"y":299.56160184746017,"vy":0.00041233983140895265,"vx":-0.00027013610325591714},{"name":"The internet","color":"black","index":6,"x":453.0860224586336,"y":317.5118684304733,"vy":0.0004637310243122259,"vx":-0.0002255792134990494},{"name":"Someone else's router","color":"green","index":7,"x":420.710626140119,"y":327.9257029767107,"vy":0.0006205849636372653,"vx":-0.00022729014994553914}],
	"links":[{"source":"My laptop","target":"My router"},{"source":"My laptop","target":"My router"},{"source":"My phone","target":"My router"},{"source":"My computer","target":"My router"},{"source":"My tv","target":"My router"},{"source":"My router","target":"The internet"},{"source":"The internet","target":"Someone else's router"}]};
	txtdmp = {"version":"0.0.1","nodes":[{"name":"ie 1","color":"black","index":0,"x":353.3908286970455,"y":301.0285597393892,"vy":-0.005671381775834789,"vx":-0.0023377073078231143,"fx":null,"fy":null},{"name":"ie 2","color":"black","index":1,"x":384.5963070891589,"y":289.8471094867676,"vy":-0.003501401612390198,"vx":-0.0015264385371461747},{"name":"ie 3","color":"black","index":2,"x":421.8858092171163,"y":283.848242953348,"vy":-0.0018996811528948028,"vx":-0.0009008103906307653},{"name":"ie 4","color":"black","index":3,"x":461.78207224624344,"y":283.41648262812555,"vy":-0.0009935134241543608,"vx":-0.00040407499857979327},{"name":"ie 5","color":"black","index":4,"x":501.89934031125756,"y":288.5866020592608,"vy":0.0014461846433615909,"vx":-0.00030026848997704615},{"name":"ie 6","color":"black","index":5,"x":539.4252678523063,"y":301.864090639488,"vy":-0.001580951370427995,"vx":0.000860606700657684,"fx":null,"fy":null},{"name":"ie 7","color":"black","index":6,"x":573.4299041145249,"y":318.8095253544606,"vy":-0.003881574633878184,"vx":0.0019016269267218468},{"name":"ie 8","color":"green","index":7,"x":603.5891661635018,"y":332.5812771268206,"vy":-0.002027693013540183,"vx":0.0014027572514599311,"fx":null,"fy":null}],
	"links":[{"source":"ie 1","target":"ie 2"},{"source":"ie 2","target":"ie 3"},{"source":"ie 3","target":"ie 4"},{"source":"ie 4","target":"ie 5"},{"source":"ie 5","target":"ie 6"},{"source":"ie 6","target":"ie 7"},{"source":"ie 7","target":"ie 8"}]};

	// put all this into a json
	var nodes = [
		{ "name": "ie 1", "color": "black" },
		{ "name": "ie 2", "color": "black" },
		{ "name": "ie 3", "color": "black" },
		{ "name": "ie 4", "color": "black" },
		{ "name": "ie 5", "color": "black" },
		{ "name": "ie 6", "color": "black" },
		{ "name": "ie 7", "color": "black" },
		{ "name": "ie 8", "color": "green" }
	];
	var links = [
		{ "source": "ie 1", "target": "ie 2" },
		{ "source": "ie 2", "target": "ie 3" },
		{ "source": "ie 3", "target": "ie 4" },
		{ "source": "ie 4", "target": "ie 5" },
		{ "source": "ie 5", "target": "ie 6" },
		{ "source": "ie 6", "target": "ie 7" },
		{ "source": "ie 7", "target": "ie 8" },
	];
	nodes = txtdmp.nodes;
	links = txtdmp.links;

	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function(d) { return d.name; })) // force link with id specified
		.force("charge", d3.forceManyBody())
		.force("center", d3.forceCenter(width/2,height/2)) // force center
		.on('tick', tick);

	// link before node because of how svg is rendered
	var link = g.append("g")
		.attr("id", "links")
		.selectAll("line");
	var node = g.append("g")
		.attr("id", "nodes")
		.selectAll("circle");

	updateNodes(nodes);
	updateLinks(links);

	var form = g.append("g")
	 	.attr("id", "forms");

	var toolBox = svg.append("g")
		.attr("id", "toolbox")
		.attr("transform", "translate(10,10)");
	initToolbar(toolBox); // idk conventions for init

	//////////// HERE BEGINS ALL THE FUNCTIONS //////////////

	// TODO: combine updateNodes() and updateLinks() into a single update() function
	/**
	 * Replaces the nodes of the simulation so that it is reflected on the svg
	 * @param nodes
	*/
	function updateNodes(nodes) {
		node = node.data(nodes, function(d){return d.name;}); // join new data with old elements
		node.exit().remove(); // remove unused elements
		nodenew = node.enter().append("circle") // acts on new elements
			.attr("r", 9)
			.attr("fill", function(d) { return d.color; })
			.on("click", selectNode)
			.on("dblclick", createNodeOptionsPanel)
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));
		nodenew.append("title") // allows us to see name when a node is moused over
			.text(function(d) { return d.name; });
		node = nodenew.merge(node); // merge with existing elements

		simulation.nodes(nodes);
		if (control.canPlay) simulation.alphaTarget(0.3).restart();
	}

	function updateLinks(links) {
		link = link.data(links, function(d){return d.source.name + "_" + d.target.name;}); // join
		link.exit().remove(); // remove
		link = link.enter().append("line") // append new
			.on("click", selectLink)
			.merge(link); // merge with old

		simulation.force("link").links(links);
		if (control.canPlay) simulation.alphaTarget(0.3).restart();
	}

	function selectNode() {
		var sel = d3.select(this);

		// special selection for creating link
		if (d3.event.shiftKey && control.canCreate) {
			if (!sel.classed("selectedforlink")) { // selecting
				if (typeof control.selections.source === "undefined") { // selecting
					sel.classed("selectedforlink", true);
					control.selections.source = sel;
				} else { // creating a link
					var newlinks = simulation.force("link").links();

					var srcname = control.selections.source.datum().name;
					// if link doesn't already exist
					//if (newlinks.findIndex(function(d) {return d.source.name===srcname&&d.target.name===sel.datum().name;})===-1) {
						newlinks.push({
							source: control.selections.source.datum(),
							target: sel.datum()
						});
						updateLinks(newlinks);
						tick();
					//}
					control.selections.deselectsource();
				}
			} else { // deselecting
				control.selections.deselectsource();
			}				
		} else { // general selection
			sel.classed("selected", !sel.classed("selected"));
		}
	}

	function selectLink() {
		var sel = d3.select(this);
		sel.classed("selected", !sel.classed("selected"));
	}

	function initToolbar(toolBox) {
		// makes a clipping of the outline which we'll use to cut off extraneous background
		var clip = toolBox.append("defs").append("clipPath")
			.attr("id", "toolclipBox");
		clip.append("rect")
			.attr("id", "toolBox")
			.attr("width", 24)
			.attr("height", 48)
			.attr("rx", 2)
			.attr("ry", 2)
			.style("fill", "none")
			.style("stroke", "black")
			.style("stroke-width", 2);

		toolBox.attr("clip-path", "url(#toolclipBox)");

		// MEDIA ICON
		var mediabutton = toolBox.append("g")
			.attr("class", "toolbox-button")
			.attr("transform", "translate(0,0)")
			.on("click", function() { // when user clicks this, this function alternates media symbols
				control.canPlay = !control.canPlay;
				control.updateMediaButton();
			});
		mediabutton.append("title")
			.attr("id", "media-title");
		mediabutton.append("rect")
			.attr("class", "toolbox-box")
			.attr("width", 24)
			.attr("height", 24)
			.attr("shape-rendering", "crispEdges");
		mediabutton.append("path")
			.attr("id", "media-path");
		control.updateMediaButton();

		// INTERACTION ICON - drag/edit properties vs. create/delete
		var interactionbutton = toolBox.append("g")
			.attr("class", "toolbox-button")
			.attr("transform", "translate(0,24)")
			.on("click", function() { // when user clicks this, it alternates levels of interactivity
				control.canCreate = !control.canCreate;
				control.updateInteractionButton();
			});
		interactionbutton.append("title")
			.attr("id", "interaction-title");
		interactionbutton.append("rect")
			.attr("class", "toolbox-box")
			.attr("width", 24)
			.attr("height", 24)
			.attr("shape-rendering", "crispEdges");
		interactionbutton.append("path")
			.attr("id", "interaction-path");
		control.updateInteractionButton();

		// make visible the actual outline we used
		toolBox.append("use")
			.attr("href", "#toolBox")
			.attr("transform", "translate(0,0)") // unneeded but OCD
			.style("stroke-width", 1); // actual stroke-width := min(this.stroke-width, clip.stroke-width)
		}

	function tick() {
		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });

		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

	}

	function dragstarted(d) {
		if (control.canPlay && !d3.event.active) simulation.alphaTarget(0.3).restart(); // heats the simulation if it is running
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;

		if (!control.canPlay) { // if paused
			d.x = d3.event.x;
			d.y = d3.event.y;
			// d.x = d.fx, d.vx = 0;
			// d.y = d.fy, d.vy = 0;
			tick(); // TODO: update only affected nodes and links rather than everything
		}	

	}

	function dragended(d) {
		if (control.canPlay && !d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;

	}

	// TODO: organize all functions pertaining to options panel into another file
	function createNodeOptionsPanel(d) {
		//console.log(d, d3.select(this).datum());
		var circleNode = this;

		// Conditions to not open the options panel
		if (d3.event.shiftKey && control.canCreate) return;
		if (d3.select(circleNode).classed("optionsopen")) {
			// TODO: fire the close node options panel event
			return;
		}

		d3.select(circleNode).classed("optionsopen", true);

		var foreignObject = d3.select("#forms")
			.append("foreignObject")
			.attr("class", "panel")
			.attr("x", d.x)
			.attr("y", d.y);
			// .attr("width", "100px")
			// .attr("height", "300px"); // required for firefox because it does not map from css
		var panel = foreignObject.append("xhtml:div")
			.attr("class", "panel-default");
		// HEADER
		var panel_header = panel.append("div")
			.attr("class", "panel-heading")
			.call(d3.drag()
				.container(circleNode.parentNode.parentNode) // sets the container of drag to the svg
				.filter( dragFilterNodeOptionsPanel)
				.on("drag", function() { dragNodeOptionsPanel(foreignObject); }) ); // drag panel
		var panel_header_close = panel_header.append("span")
			.attr("class", "close-custom")
			.datum("undraggable")
			.html("&times;")
			.on("click", function() { closeNodeOptionsPanel(circleNode,foreignObject); });
		var panel_header_title = panel_header.append("span")
			.attr("class", "panel-title")
			.datum("undraggable")
			.text(d.name);

		// CONTENT
		var panel_content = panel.append("div")
			.attr("class", "panel-body");
			// .append("div").attr("class", "container");

		var panel_content_form = panel_content.append("form")
			//.attr("class", "form-horizontal")
			.on("submit", function() { updateNodeOptionsPanel(this,circleNode); });

		var panel_content_form_name = panel_content_form.append("div")
			.attr("class", "form-group");
		var panel_content_form_name_label = panel_content_form_name.append("label")
			.attr("class", "control-label")
			//.attr("for", "namename")
			.text("Name:");
		var panel_content_form_name_input = panel_content_form_name.append("input")
			.attr("class", "form-control")
			.attr("id", "namename")
			.attr("type", "text")
			.attr("value", d.name);

		var panel_content_form_color = panel_content_form.append("div")
			.attr("class", "form-group");
		var panel_content_form_color_label = panel_content_form_color.append("label")
			.attr("class", "control-label")
			.text("Color:");
		var panel_content_form_color_input = panel_content_form_color.append("select")
			.attr("class", "form-control")
			.attr("id", "colorcolor");
		panel_content_form_color_input.append("option").text("black"); // can use d3's .data() with this
		panel_content_form_color_input.append("option").text("blue");
		panel_content_form_color_input.append("option").text("green");
		panel_content_form_color_input.append("option").text("grey");

		var panel_content_form_submit = panel_content_form.append("button")
			.attr("class", "btn btn-default")
			.attr("type", "submit")
			.text("Save changes");	        	
	}

	function dragFilterNodeOptionsPanel(d,i) {
		return d3.select(d3.event.target).datum()!="undraggable" && !d3.event.button; // !d3.event.button was default
	}

	function dragNodeOptionsPanel(foreignObject) {
		foreignObject.attr("x", +foreignObject.attr("x") + d3.event.dx);
		foreignObject.attr("y", +foreignObject.attr("y") + d3.event.dy);
	}

	function updateNodeOptionsPanel(form,circleNode) {
		d3.event.preventDefault(); // prevents page from refreshing
		var form_sel = d3.select(form);
		console.log(form_sel.select("#namename").property("value"));
		console.log(d3.select(circleNode).datum());
		d3.select(circleNode).attr("fill", form_sel.select("#colorcolor").property("value"));
	}

	function closeNodeOptionsPanel(circleNode,foreignObject) {
		d3.select(circleNode).classed("optionsopen", false);
		foreignObject.remove();
	}

	function svg_import() {
		var data;
		try {
			data = JSON.parse(d3.select("textarea").property("value"));
		} catch (e) { // ERR: not a valid json
			console.error("IMPORT: not a valid json");
			return;
		}

		var ajv = Ajv({ $data: true, allErrors: true});
		// var ajv = Ajv({ $data: true, allErrors: true, removeAdditional: true});
		ajv.addKeyword('containsNodeName', { $data:true, "validate": function (schema, data, parentSchema, currentDataPath, parentDataObject, parentProperty, rootData) {
			for (let node of rootData.nodes) { // not supported in all browsers
				if( node.name === data)
					return true;
			}
			return false;
		}, "errors": false });
		var schema = topologySchema;
		var validate = ajv.compile(schema);
		var valid = validate(data);

		if (!valid) {
			console.error("IMPORT: invalid format: " + ajv.errorsText(validate.errors));
			return;
		}

		// The || operator can be used to fill in default values:
		var importObject = data;

		updateNodes(importObject.nodes);
		updateLinks(importObject.links);

		g.call(zoom.transform, d3.zoomIdentity);

		simulation.tick();
		tick();

	}

	function svg_export() {
		var exportObj = {};
		exportObj.version = "0.0.1";
		exportObj.nodes = node.data();
		exportObj.links = [];	
		var i, len = link.data().length;
		for( i = 0; i < len; i++) {
			exportObj.links.push({"source":link.data()[i].source.name, "target":link.data()[i].target.name});
		}

		d3.select("textarea").property("value", JSON.stringify(exportObj));
	}

	// stuff we are exposing
	return {
		svg_import: svg_import,
		svg_export: svg_export
	};

})();