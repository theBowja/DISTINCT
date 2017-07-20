function updateEvents() {
	$.get("/u/api/events", function(result) {
		$("#calendar").fullCalendar('renderEvents', result, true);
	});
}

function test() {
	console.log("form submitted");
}

function postEvent(newEvent) {
	$.ajax({
		type: 'POST',
		url: '/u/api/events',
		data: newEvent,
		success: function() {
		  console.log('success');
		  // $('#flashmessage').text("success").show(0).delay(3500).hide(0);
		},
		error: function() {
		  console.log('error');
		  // $('#flashmessage').text("not JSON format").show(0).delay(3500).hide(0);
		}
	});
}

$(document).ready(function() {
	$("#eventform").on("submit", function(e) {
		e.preventDefault();
		console.log("you see the form submit")
	});

	$("#calendar").fullCalendar({
		height: "parent",
		navLinks: true,
		selectable: true,
		selectHelper: true,
		selectOverlap: false,
		//selectOverlap: false,
		selectMinDistance: 15,
		allDayDefault: false,
		allDaySlot: false,
		selectAllow: function(selectInfo) {
			var duration = moment.duration(selectInfo.end.diff(selectInfo.start));
			return selectInfo.start > Date.now() && duration.asHours() <= 24;
		},
		select: function(start, end) {
			$("#addeventmodal").modal("toggle");
			$("#dtpstart").data("DateTimePicker").date(start);
			$("#dtpend").data("DateTimePicker").date(end);
			$("#calendar").fullCalendar("unselect");
		},
		eventLimit: true,
		customButtons: {
			toDashboard: {
				text: "Dashboard",
				click: function() {
					window.location = "/u/dashboard";
				}
			},
			newEvent: {
				text: "add event",
				click: function() {
					$("#addeventmodal").modal("toggle");
					console.log("wow! you scheduled something!");
				}
			},
			viewMyEvents: {
				text: "my events",
				click: function() {
					console.log("viewing!");
				}
			}
		},
		header: {
			left: "toDashboard agendaDay,agendaWeek,month,list",
			center: "title",
			right: "newEvent,viewMyEvents today prev,next"
		}
	});
	//- $("#calendar").fullCalendar('renderEvent', {
	//-     title: "event title",
	//-     allDay: true,
	//-     start: Date.now(),
	//-     end: Date.now()+600000000
	//- }, true); // stick=true
	updateEvents();

		//- DATETIMEPICKER
	$("#dtpstart").datetimepicker({
		minDate: moment(),
		stepping: 30
	});
	$("#dtpend").datetimepicker({
		maxDate: moment().add(1, "years"),
		stepping: 30,
		useCurrent: false
	});

	$("#dtpstart").on("dp.change", function(e) {
		$("#dtpend").data("DateTimePicker").minDate(e.date);
	});
	$("#dtpend").on("dp.change", function(e) {
		$("#dtpstart").data("DateTimePicker").maxDate(e.date);
	});

});