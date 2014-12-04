var applicationFormatTime = scheduler.date.date_to_str("%H:%i");
var applicationFormatDate = scheduler.date.date_to_str("%d-%m-%Y");
var hasCollision = false;
var doctors;
var default_duration_visit = 30;

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
	
	scheduler.addMarkedTimespan({ // blocks each Sunday
	    days:  [0], 
	    zones: "fullday",
	    type:  "dhx_time_block", 
	    css:   "red",
	    html: "<b>Выходной</b>",
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
//	scheduler.attachEvent("onMouseMove", function(id, e) {
//		doctor_id = scheduler.getActionData(e).section;
//		//console.log(doctor_id);
//	});
	
	scheduler.attachEvent("onEventCollision", function (ev, evs) {
		hasCollision = true;
	    alert('На это время уже есть запись!')
	    return hasCollision;
	});
	
	scheduler.attachEvent("onBeforeEventChanged", function(ev, e, isNewEvent, ev_old) {
		if (!hasCollision && !isNewEvent && wereChanges(ev, ev_old)) {
			if (confirm('Сохранить изменения?')) {
				if (ev.doctor_id != ev_old.doctor_id) {
					ev.doctor = getDoctorById(ev.doctor_id);
				}
				saveReception(ev, false);
			} else {
				updateScheduler();
			}
		}
		hasCollision = false;
	    return !hasCollision;
	});
	
	function wereChanges(ev, ev_old) {
		if (ev.doctor_id != ev_old.doctor_id) {
			return true;
		}
		
		if (ev.start_date.getTime() != ev_old.start_date.getTime()) {
			return true;
		}
		
		if (ev.end_date.getTime() != ev_old.end_date.getTime()) {
			return true;
		}
		return false;
	}
	
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
			setDoctors(doctors);
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
			updateScheduleTimespans();
		})
	scheduler.attachEvent("onClick", function(id, e){
		scheduler.showLightbox(id);
	});
	
	scheduler.attachEvent("onTemplatesReady", function() {
		
		
		
		var marked = null;
		var marked_date = null;
		var marked_section = null;
//		scheduler.attachEvent("onEmptyClick", function(date, native_event){
//			scheduler.unmarkTimespan(marked);
//			marked = null;
//
//			var fixed_date = fix_date(date);
//			scheduler.addEventNow(fixed_date, scheduler.date.add(fixed_date, event_step, "minute"));
//		});
		
		scheduler.attachEvent("onMouseMove", function(event_id, native_event) {
			var obj = scheduler.getActionData(native_event);
			var fixed_date = fix_date(obj.date);


			if (+fixed_date != +marked_date || marked_section != obj.section) {
				console.log(obj.section + ": " +fixed_date)
				scheduler.unmarkTimespan(marked);
				var doctor = getDoctorById(obj.section);
				var workDay = getWorkDayForDoctor(doctor);
				marked_date = fixed_date;
				marked_section = obj.section;
				marked = scheduler.markTimespan({
					start_date: fixed_date,
					end_date: scheduler.date.add(fixed_date, workDay ? workDay.duration_visit : default_duration_visit, "minute"),
					css: "highlighted_timespan",
					sections: {	unit: [obj.section] }
				});
			}
		});
	})
	
})

function fix_date(date) {  // 17:48:56 -> 17:30:00
	date = new Date(date);
	if (date.getMinutes() > 15 && date.getMinutes() < 30) {
		date.setMinutes(30);
	} else if (date.getMinutes() > 30 && date.getMinutes() < 45) {
		date.setMinutes(45);
	} else {
		date.setMinutes(0);
	}
		
	date.setSeconds(0);
	return date;
};

function setDoctors(doctors) {
	this.doctors = doctors;
}

//function createHoliday(doctor, workDay) {
//	var unitId = getUnitIdByDoctorId(doctor.key);
//	scheduler.addMarkedTimespan({ // blocks each Sunday
//	    days:  [workDay.dayIndex], 
//	    zones: "fullday",
//	    type:  "dhx_time_block", 
//	    css:   "red",
//	    html: "<b>Выходной</b>",
//	 	sections: {	unit: [unitId], timeline: [unitId]}
//	});
//}

//function setupCurrentDay() {
//	$.each(doctors, function(i, doctor) { 
//		setupDoctorTimespans(doctor) 
//	})
//	scheduler.updateView();
//}

function updateScheduleTimespans() {
	$.each(doctors, function(i, doctor) { 
		setupDoctorTimespans(doctor) 
	})
	scheduler.updateView();
}

function setupDoctorTimespans(doctor) {
	var unitId = getUnitIdByDoctorId(doctor.key);
	if (doctor && doctor.workPeriods.length > 0) {
		$.each(doctor.workPeriods, function(periodIndex, period) {
			
			if (period && period.workDays.length > 0) {
				var start_period = new Date(period.startPeriod);
				var end_period = new Date(period.endPeriod);
				while (start_period <= end_period) {
					start_period = new Date(start_period.setDate(start_period.getDate() + 1));
					
					var workDay = getWorkDayByIndex(period.workDays, start_period.getDay());
					if (workDay) {
						scheduler.addMarkedTimespan({
						    days:  new Date(start_period), 
						    zones: workDay.isWeekend ? "fullday" : [parseWorkHours(workDay.startWork), parseWorkHours(workDay.endWork)],
						    invert_zones: !workDay.isWeekend,
						    type:  "dhx_time_block", 
						    css:   workDay.isWeekend ? "holiday" : "break",
						    html: workDay.isWeekend ? "<div>Выходной</div>" : "<div>Нет приема</div>",
						 	sections: {	unit: [unitId], timeline: [unitId] }
						});
					}
				}
			}
		})
	}
}

function parseWorkHours(sourceString) {
	var splitted = sourceString.split(':');
	if (splitted && splitted.length > 1) {
		var hour = parseInt(splitted[0]);
		var min = parseInt(splitted[1]);
		return hour * 60 + min
	}
}

function getWorkDayForDoctor(doctor, date) {
	if (doctor && doctor.workPeriods.length > 0) {
		var period = $.grep(doctor.workPeriods, function(period) {
			var start_period = new Date(period.startPeriod);
			var end_period = new Date(period.endPeriod);
			return start_period <= date && date <= end_period;
		})
		
		if (period && period[0]) {
			var workDay = $.grep(period[0].workDays, function(day) {
				return day.getDay() === date.getDay();
			})
			
			if (workDay && workDay[0]) {
				return workDay[0];
			}
		}
	}
	return null;
}

function getWorkDayByIndex(workDays, dayIndex) {
	var workDay = $.grep(workDays, function(day) {
		return day.index === dayIndex;
	})	
	return workDay.length == 1, workDay[0];
}

function updateScheduler() {
	var state = scheduler.getState();
	scheduler.clearAll();
	scheduler.init('scheduler_here', state.date === undefined ? new Date() : state.date, state.mode === undefined ? "unit" : state.mode);
	scheduler.load('/receptions/get_all', 'json');
}

function getDoctorById(doctorId) {
//	var mode = scheduler.getState().mode;
//	var doctor = {};
//	if (mode == 'unit') {
//		doctor = scheduler._props[mode].options[scheduler._props[mode].order[doctorId]];
//	} else {
//		doctor = scheduler.matrix[mode].y_unit[scheduler.matrix[mode].order[doctorId]];	
//	}
	return $.grep(doctors, function(doctor) { return doctor.key === doctorId})[0];
}

function getUnitIdByDoctorId(doctorId) {
	var mode = scheduler.getState().mode;
	var units = (mode == 'unit' ? scheduler._props[mode].options : scheduler.matrix[mode].y_unit);
	var unit = $.grep(units, function(unit) { return unit.key === doctorId });
	if (unit) {
		return unit[0].key;
	}
	return null;
}