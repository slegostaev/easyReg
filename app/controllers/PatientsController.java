/**
 * 
 */
package controllers;

import javax.persistence.PersistenceException;

import models.Patient;
import play.Logger;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

/**
 * @author "SLegostaev"
 *
 */
public class PatientsController extends Controller {
	
	public static Result findPatientByName(String mask) {
    	return ok(Json.toJson(Patient.findByName(mask)));
    }
	
	public static Result savePatient() {
		Form<Patient> patinetForm = Form.form(Patient.class).bindFromRequest();
		if (patinetForm.hasErrors()) {
			return badRequest("Ошибка сохранения, все поля должны быть заполнены.");
		}
		
		Patient patient = patinetForm.get();
		try {
			Patient.save(patient);
			return created(Json.toJson(patient));
		} catch (PersistenceException e) {
			Logger.error("Patient creation error", e);
		}
		
		return badRequest("Ошибка сохранения, возможно такой пациент уже существует.");
	}
	
}
