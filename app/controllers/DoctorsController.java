package controllers;

import models.Doctor;
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
    	return TODO;
    }
	
	public static Result saveDoctor() {
    	return TODO;
    }
	
	public static Result createDoctor() {
    	return TODO;
    }
	
	public static Result deleteDoctor(Long id) {
    	return TODO;
    }
}
