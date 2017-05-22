var SVGGRAPH = (function() {

	var svg = d3.select("svg"),
	width = +svg.attr("width"),
	height = +svg.attr("height");

	// put all this into a json
	var nodes = [
		{ "name": "My phone", "color": "black" },
		{ "name": "My laptop", "color": "black" },
		{ "name": "My tablet", "color": "black" },
		{ "name": "My computer", "color": "black" },
		{ "name": "My tv", "color": "black" },
		{ "name": "My router", "color": "black" },
		{ "name": "The internet", "color": "black" },
		{ "name": "Someone else's router", "color": "green" }
	];
	var links = [
		{ "source": "My laptop", "target": "My router" },
		{ "source": "My tablet", "target": "My router" },
		{ "source": "My phone", "target": "My router" },
		{ "source": "My computer", "target": "My router" },
		{ "source": "My tv", "target": "My router" },
		{ "source": "My router", "target": "The internet" },
		{ "source": "The internet", "target": "Someone else's router" },
	];
	var clonedlinks = JSON.parse(JSON.stringify(links)); // clones the array

	var link = svg.append("g")
		.attr("class", "links");
	addLinks(clonedlinks);

	var node = svg.append("g")
		.attr("class", "nodes");
	addNodes(nodes); // TODO: incorporate this as part of d3 method chaining

	var form = svg.append("g")
	 	.attr("class", "forms")
		;

	var toolbar = svg.append("g")
		.attr("id", "toolbox")
		.attr("transform", "translate(10,10)");
	initToolbar(toolbar); // idk conventions for init

	var simulation = d3.forceSimulation()
	   	.force("link", d3.forceLink().id(function(d) { return d.name; })) // force link with id specified
	    .force("charge", d3.forceManyBody())
	    .force("center", d3.forceCenter(width/2,height/2)); // force center
	    
	simulation
		.nodes(nodes)
		.on('tick', tick);
	simulation.force("link")
		.links(clonedlinks);

	function addNodes(nodes) {
		node = svg.select("g.nodes").selectAll("circles") // TODO: figure out why I need to assign this (https://github.com/d3/d3/issues/1041)
	    	.data(nodes)
	    	.enter().append("circle")
	    	.attr("r", 9)
	    	.attr("fill", function(d) { return d.color; })
			.on("dblclick", createNodeOptionsPanel) // "contextmenu" would be for right click
	    	.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));
		node.append("title") // allows us to see name when a node is moused over
			.text(function(d) { return d.name; });
	}

	function addLinks(links) {
		link = svg.select("g.links").selectAll("line")
			.data(links)
			.enter().append("line"); 
	}

	function initToolbar(toolbar) {
		// makes a clipping of the outline which we'll use to cut off extraneous background
		var clip = toolbar.append("defs").append("clipPath")
			.attr("id", "toolclipBox")
		clip.append("rect")
			.attr("id", "toolBox")
			.attr("width", 24)
			.attr("height", 72)
			.attr("rx", 10)
			.attr("ry", 10)
			.style("fill", "none")
			.style("stroke", "black")
			.style("stroke-width", 1);

		// PLAY ICON
		var playbutton = toolbar.append("g")
			.attr("class", "toolbox-button")
			.attr("transform", "translate(0,0)")
			.attr("clip-path", "url(#toolclipBox")
			.on("click", function() {console.log("clicked");})
			//.on("hover focus", function() {})
		playbutton.append("rect")
			.attr("class", "toolbox-box")
			.attr("width", 24)
			.attr("height", 24);
		playbutton.append("path")
			.attr("id", "toolbox-path")
			.attr("d", "M8 5v14l11-7z");

			
		// PAUSE
		// var pausebutton = toolbar.append("g")
		// 	.attr("class", "pausebutton")
		// 	.attr("transform", "translate(10,34)");
		// pausebutton.append("path")
		// 	.attr("d", "M0 0h24v24H0z")
		// 	.attr("fill", "none");
		// pausebutton.append("path")
		// 	.attr("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z");

		// CURSOR
		var cursorbutton = toolbar.append("g")
			.attr("class", "toolbox-button")
			.attr("transform", "translate(0,24)");
		cursorbutton.append("rect")
			.attr("class", "toolbox-box")
			.attr("width", 24)
			.attr("height", 24)
		cursorbutton.append("path")
			//.attr("d", "M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z")
			//.attr("d", "M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z")
			.attr("d", "M10,2A2,2 0 0,1 12,4V8.5C12,8.5 14,8.25 14,9.25C14,9.25 16,9 16,10C16,10 18,9.75 18,10.75C18,10.75 20,10.5 20,11.5V15C20,16 17,21 17,22H9C9,22 7,15 4,13C4,13 3,7 8,12V4A2,2 0 0,1 10,2Z")

			
		// shows the actual outline we used
		toolbar.append("use")
			.attr("href", "#toolBox")
			.attr("transform", "translate(0,0)"); // unneeded
		}

	function tick() {
		link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart(); // heats the simulation
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}

	// TODO: batch up DOM modifications and do them all at once
	function createNodeOptionsPanel(d) {
		console.log(d, d3.select(this).datum());
		var circleNode = this;
		d3.select(circleNode).style("stroke", "lightblue").style("stroke-width", "2.5");

		var foreignObject = d3.select(".forms")
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
		//foreignObject.attr("transform", "translate(10,10)") // alternative
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
		d3.select(circleNode).style("stroke-width", "0");
		foreignObject.remove();
	}

	function svg_import(importObject) {

		// The || operator can be used to fill in default values:

		node.remove(); // removes all associated elements
		addNodes(importObject.nodes);

		link.remove();
		addLinks(importObject.links);

		simulation
			.nodes(importObject.nodes);

		//	.on('tick', tick);
		simulation.force("link")
			.links(importObject.links);
		simulation.alpha(1).restart(); // not sure if this is needed
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

		return exportObj;
	}

	// stuff we are exposing
	return {
		svg_import: svg_import,
		svg_export: svg_export
	};

})();