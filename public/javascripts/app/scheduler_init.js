var doctor_id;
var applicationFormatTime = scheduler.date.date_to_str("%H:%i");
var applicationFormatDate = scheduler.date.date_to_str("%d-%m-%Y");

$(function() {
	//config
	
	scheduler.config.default_date = "%l, %j %F %Y";
	scheduler.config.mark_now = true;
	scheduler.config.collision_limit = 1;
	scheduler.config.event_duration = 30; 
	scheduler.config.auto_end_date = true;
	scheduler.config.first_hour = 9;
	scheduler.config.last_hour = 20;
	scheduler.config.multi_day = false;
	scheduler.config.show_loadin = true;
	scheduler.config.details_on_create=true
	scheduler.config.details_on_dblclick = true;
	scheduler.config.drag_create = false;
	scheduler.config.limit_time_select = true;
	scheduler.config.select = false;
	scheduler.config.separate_short_events = true;
	scheduler.config.time_step = 30;
	scheduler.config.hour_size_px = 88;
	
	
	
	//buttons names
	scheduler.locale.labels.unit_tab = "Doctors"
  	scheduler.locale.labels.timeline_tab ="Timeline";
//	scheduler.locale.labels.section_patient_name = "Patient name:";
	
	dhtmlXTooltip.config.className = 'dhtmlXTooltip tooltip'; 
	dhtmlXTooltip.config.timeout_to_display = 50; 
	dhtmlXTooltip.config.delta_x = 15; 
	dhtmlXTooltip.config.delta_y = -20;
	
	
	
	scheduler.templates.tooltip_text = function(start, end, ev) {
		if (ev.patient) {
			var content = "<b>Пациент:</b> "+ ev.patient.fullname + "<br/><b>Прием с </b> " + applicationFormatTime(start) + "<b> по </b> " + applicationFormatTime(end);
			if (ev.first_time) {
				content += '<br><span style="color: red;">Первичный прием!</span>'
			}
	    	return content;
		}
	}
	
	scheduler.templates.hour_scale = function(date) {
		var html= '';
		for (var i = 0; i < 2; i++) {
			html += '<div style="height:44px;line-height:44px;">' + applicationFormatTime(date) + '</div>';
			date = scheduler.date.add(date, scheduler.config.time_step, "minute");
		}
		return html;
	}
	
	scheduler.addMarkedTimespan({ // blocks each Sunday, Monday, Wednesday
	    days:  [0], 
	    zones: "fullday",
	    type:  "dhx_time_block", 
	    css:   "red_section",
	 	sections: {	unit: [2, 5], timeline: [2, 5]}
	});
	
	scheduler.templates.event_class = function(start, end, event) {
		if (event.first_time) {
			return 'first_time_event';
		}
	}
	
	scheduler.templates.event_text = function(start,end,ev) {
		if (ev.patient) {
			return ev.patient.fullname;
		}
		return ev.text;
	}
	
	
	//events
	scheduler.attachEvent("onMouseMove", function(id, e) {
		doctor_id = scheduler.getActionData(e).section;
		//console.log(doctor_id);
	});
	
//		scheduler.config.lightbox.sections = [
//			{ name: "description", height: 50, map_to: "text", type: "textarea", focus: true },
//			{ name: "patient_name", map_to: "patient_name", type: "combo", filtering: true, cache: false,
//				image_path: '@routes.Assets.at("javascripts/dhtmlx/common/dhtmlxCombo/imgs/")', 
//					script_path: "/patient/find_by_name" },
//			{ name: "time", map_to: "auto", type: "time", height: 72, time_format:["%H:%i"]}
//		];
	           		
	        
//    scheduler.attachEvent("onEventSave", function(id, data) {
//    	console.log('save event');
//		if (!data.text) {
//			alert("Text must not be empty");
//			return false;
//		}
//		
//		console.log(data);
//		console.log(doctor_id);
//		return true;
//	});
	
	jsRoutes.controllers.DoctorsController.getAllDoctorsJSON().ajax()
		.done(function(doctors) {
			scheduler.createUnitsView({
	    	    name : "unit",
	    	    property : "doctor_id", 
	    	    list : doctors
	    	});
		
			scheduler.createTimelineView({
	       	     name : "timeline",
	       	     x_unit : "minute",//measuring unit of the X-Axis.
	       	     x_date : "%H:%i", //date format of the X-Axis
	       	     x_step : 30,      //X-Axis step in 'x_unit's
	       	     x_size : 24,      //X-Axis length specified as the total number of 'x_step's
	       	     x_start : 16,     //X-Axis offset in 'x_unit's
	       	     x_length : 48,    //number of 'x_step's that will be scrolled at a time
	       	     y_unit : doctors,	//sections of the view (titles of Y-Axis)
	       	     y_property : "doctor_id", //mapped data property
	       	     render : "bar"             //view mode
	       	});
			
			updateScheduler();
		})
	
})

function updateScheduler() {
	var state = scheduler.getState();
	scheduler.clearAll();
	scheduler.init('scheduler_here', state.date === undefined ? new Date() : state.date, state.mode === undefined ? "unit" : state.mode);
	scheduler.load('/receptions/get_all', 'json');
}