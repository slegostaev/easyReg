package controllers;

import javax.persistence.PersistenceException;

import models.Doctor;
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

public class DoctorsController extends Controller {
	
	public static Result getAllDoctorsJSON() {
    	return ok(Json.toJson(Doctor.findAll()));
    }
	
	public static Result listOfDoctors() {
		return ok(views.html.settings.doctors.render(Doctor.findAll()));
	}
	
	public static Result showDoctor(Long id) {
		if (id == null) {
			return badRequest("Id is incorrect!");
		}
		
		Doctor doctor = Doctor.findById(id, Doctor.class);
		if (doctor == null) {
			return notFound("Doctor with same id has been not found.");
		}
		
//		if (doctor.workPeriods != null) {
//			for (WorkPeriod period : doctor.workPeriods) {
//				Logger.debug(period.type.name());
//				if (period.workDays != null) {
//					for (WorkDay workDay : period.workDays) {
//						Logger.debug(workDay.dayIndex.name());
//					}
//				}
// 				
//			}
//		}
		
    	return ok(views.html.doctor.show.render(doctor));
    }
	
	public static Result saveDoctor() {
		Form<Doctor> doctorForm = Form.form(Doctor.class).bindFromRequest();
		if (doctorForm.hasErrors()) {
			return badRequest("Ошибка сохранения, все поля должны быть заполнены!");
		}
		Doctor doctor = doctorForm.get();
		try {
			Doctor.save(doctor);
			return created(Json.toJson(doctor));
		} catch (PersistenceException e) {
			Logger.error(e.getMessage(), e);
		}
		
		return badRequest("Ошибка сохранения, возможно такой доктор уже существует!");
    }
	
	public static Result createDoctor() {
    	return TODO;
    }
	
	public static Result deleteDoctor(Long id) {
    	return TODO;
    }
	
	public static Result javascriptRoutes() {
        response().setContentType("text/javascript");
        return ok(Routes.javascriptRouter("jsRoutes",
                controllers.routes.javascript.DoctorsController.saveDoctor()));
    }
}
