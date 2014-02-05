package controllers;

import models.Doctor;
import models.Patient;
import play.Routes;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

public class Application extends Controller {

    public static Result index() {
        return ok(views.html.index.render("Your new application is ready."));
    }

    public static Result javascriptRoutes() {
        response().setContentType("text/javascript");
        return ok(Routes.javascriptRouter("jsRoutes",
        		controllers.routes.javascript.ReceptionsController.getAllReceptions(),
                controllers.routes.javascript.ReceptionsController.saveReception(),
                controllers.routes.javascript.ReceptionsController.deleteReception(),
                controllers.routes.javascript.Application.getAllDoctors(),
                controllers.routes.javascript.Application.findPatientByName()));
    }
    
    public static Result getAllDoctors() {
    	return ok(Json.toJson(Doctor.findAll()));
    }
    
    public static Result findPatientByName(String mask) {
    	return ok(Json.toJson(Patient.findByName(mask)));
    }
    
    public static Result test() {
    	return ok(views.html.test.render());
    }
}
