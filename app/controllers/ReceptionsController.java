package controllers;

import java.sql.Time;

import models.Doctor;
import models.Patient;
import models.Reception;
import play.Logger;
import play.Routes;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
/**
 * @author "SLegostaev"
 *
 */

public class ReceptionsController extends Controller {
	
	public static class ReceptionForm {
		public Long id;
		public Long patient_id;
		public Long doctor_id;
		public Long start_date;
		public Long end_date;
		public String description;
		public Boolean first_time;
		
		public Reception getReception() {
			Reception reception = new Reception();
			reception.id = id;
			reception.doctor = new Doctor();
			reception.doctor.id = doctor_id;
			reception.patient = new Patient();
			reception.patient.id = patient_id;
			reception.startTime = new Time(start_date);
			reception.endTime = new Time(end_date);
			reception.description = description;
			reception.receptionDate = new java.sql.Date(reception.startTime.getTime());
			reception.isFirstTime = first_time;
			return reception;
		}
	}
	
	public static Result saveReception() {
		Form<ReceptionForm> receptionForm = Form.form(ReceptionForm.class).bindFromRequest();
		if (receptionForm.hasErrors()) {
			return badRequest("error, see log");
		}
		
		Reception reception = receptionForm.get().getReception();
		if (reception.id == null) {
			Reception.addReception(reception);
		} else {
			Reception.updateReception(reception);
		}
		
		return reception.id == null ? badRequest("save error") : ok(reception.id.toString());
	}
	
	public static Result deleteReception(Long id) {
		int result = Reception.deleteReception(id);
		Logger.debug("delete result " + result);
		return ok();
	}
	
	public static Result getAllReceptions() {
        return ok(Json.toJson(Reception.findAll()));
    }
	
    public static Result javascriptRoutes() {
        response().setContentType("text/javascript");
        return ok(Routes.javascriptRouter("jsRoutes",
        		controllers.routes.javascript.ReceptionsController.getAllReceptions(),
                controllers.routes.javascript.ReceptionsController.saveReception(),
                controllers.routes.javascript.ReceptionsController.deleteReception(),
                controllers.routes.javascript.DoctorsController.getAllDoctorsJSON(),
                controllers.routes.javascript.PatientsController.findPatientByName(),
                controllers.routes.javascript.PatientsController.savePatient()));
    }
}
