/**
 * 
 */
package controllers;

import models.Patient;
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
	
}
