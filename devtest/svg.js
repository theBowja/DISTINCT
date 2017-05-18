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
		d3.select(circleNode).style("stroke", "lightblue").style("stroke-width", "3");

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
		exportObj.nodes = node.data();
		exportObj.links = [];	
		// link.data(function(d) {
		// 	console.log(d);
		// 	return d;
		// });
		// link.data().call(function(d){
		// 	console.log(d);	
		// });
		//exportObj.
		//return node.data();
		return exportObj;
	}

	// stuff we are exposing
	return {
		svg_import: svg_import,
		svg_export: svg_export
	};

})();