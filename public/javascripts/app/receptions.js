$(function() {
	
	scheduler.showLightbox = function(id) {
		var ev = scheduler.getEvent(id);
		scheduler.startLightbox(id, document.getElementById("reception_form"));
		$("#patient_name").focus().val(ev.patient ? ev.patient.fullname : '').data('patient-id', ev.patient ? ev.patient.key : '');
		$("#description").val(ev.text);
		$("#doctor_name").text(getDoctorById(ev.doctor_id).label);
		$("#reception_time").text(applicationFormatTime(ev.start_date) + '-' + applicationFormatTime(ev.end_date));
		$('#first_time').prop('checked', ev.first_time);
		var duration = $('#duration').empty();
		for (var i = 0; i < 5; i++) {
			var value = scheduler.config.event_duration * i;
			duration.append($('<option>').val(value).text(value));
		}
	}
	
	$('#patient_name').autocomplete({
		source : function(req, resp) {
			jsRoutes.controllers.PatientsController.findPatientByName(req.term)
				.ajax().done(function(data) {
					resp($.map(data, function(item) {
						return {id : item.key, label : item.fullname + ', ' + applicationFormatDate(new Date(item.birthday)), value : item.fullname }
					}));
				})
		},
		select: function( event, ui ) {
			$.data(this, 'patient-id', ui.item.id);
	      }
	})
	
	$('#patient_form').dialog({
		title: 'Новый пациент',
		width: '400px',
		resizable: true,
		autoOpen: false,
		modal: true,
		buttons: [{
			text : 'Сохранить',
			click: function() {
				var dialog = $(this);
				jsRoutes.controllers.PatientsController.savePatient()
					.ajax({
						data : $(this).serialize()
					})
					.done(function(resp) {
						console.log(resp);
						$("#patient_name").data('patient-id', resp.key).val(resp.fullname);
						dialog.dialog('close');
					})
					.fail(function(resp) {
						alert(resp.responseText)
					})
				}
			}, {
				text: 'Закрыть',
				click: function() {
					$(this).dialog('close');
				}
			}],
		close: function() {
			$(this).find('input').removeData().val('');
		}
	})
})

function save_form() {
	var ev = scheduler.getEvent(scheduler.getState().lightbox_id);
	ev.text = $("#description").val();
	if (!ev.patient) {
		ev.patient = {};
	}
	
	if (!ev.doctor) {
		ev.doctor = {};
	}
	var patientField = $("#patient_name");
	ev.patient.fullname = patientField.val();
	ev.patient.key = patientField.data('patient-id');
	if (ev.patient.key == '') {
		alert('Пациент не выбран!');
		return;
	}
	
	ev.doctor.key = ev.doctor_id;
	ev.first_time = $("#first_time").prop("checked");
	var newDuration = parseInt($("#duration").val());
	if (newDuration != 0) {
		ev.end_date.setMinutes(ev.end_date.getMinutes() + newDuration);
	}
	
	saveReception(ev, true)
	
	
}

function saveReception(ev, fromForm) {
	jsRoutes.controllers.ReceptionsController.saveReception().ajax({
		data : {
			id : ev.key,
			patient_id : ev.patient.key,
			doctor_id : ev.doctor.key,
			description: ev.text,
			start_date : ev.start_date.getTime(),
			end_date : ev.end_date.getTime(),
			first_time : ev.first_time
		}
	}).done(function(resp) {
		ev.key = resp;
		scheduler.updateEvent(ev.id);
	}).fail(function(resp) {
		alert(resp)
	}).always(function() {
		if (fromForm) {
			scheduler.endLightbox(true, document.getElementById("reception_form"));
			clearLightbox();
		}
	})
}

function close_form() {
	scheduler.endLightbox(false, document.getElementById("reception_form"));
	clearLightbox();
}

function delete_event() {
	var ev = scheduler.getEvent(scheduler.getState().lightbox_id);
	if (confirm('Вы уверены что хотите удалить эту запись?')) {
		jsRoutes.controllers.ReceptionsController.deleteReception(ev.key).ajax()
			.done(function(resp) {
				scheduler.deleteEvent(ev.id);
			}).fail(function(resp) {
				alert('error')
			}).always(function() {
				scheduler.endLightbox(false, document.getElementById("reception_form"));
			})
	} else {
		scheduler.endLightbox(false, document.getElementById("reception_form"));
	}
	clearLightbox();
}

function clearLightbox() {
	$('#reception_form input').removeData().val('');
}
		
function getDoctorById(doctorId) {
	var mode = scheduler.getState().mode;
	var doctor = {};
	if (mode == 'unit') {
		doctor = scheduler._props[mode].options[scheduler._props[mode].order[doctorId]];
	} else {
		doctor = scheduler.matrix[mode].y_unit[scheduler.matrix[mode].order[doctorId]];	
	}
	return doctor;
}

function addNewPatient() {
	$('#patient_form').dialog('open');
}