package controllers;

import models.Doctor;
import play.data.Form;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import com.avaje.ebean.Ebean;
import com.legossoft.security.core.Access;
/**
 * @author "SLegostaev"
 *
 */

public class DoctorsController extends Controller {
	
	private static Form<Doctor> doctorForm = Form.form(Doctor.class);
	
	public static Result getAllDoctorsJSON() {
    	return ok(Json.toJson(Doctor.findAllDoctors()));
    }
	

	@Access(description = "Доступ к списку докторов")
	public static Result index() {
		return ok(views.html.pages.settings.doctors.index.doctorsSettingsMain.render(Doctor.findAllDoctors()));
	}
	
	@Access(description = "Редактирование данных докторов")
	public static Result edit(Long id) {
		Object validateResult = validate(id);
		
		if (validateResult instanceof Result) {
			return (Result) validateResult;
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

    	return ok(views.html.pages.settings.doctors.edit.doctorsSettingsMain.render(doctorForm.fill((Doctor)validateResult)));
    }
	
	public static Result save() {
		Form<Doctor> bindedForm = doctorForm.bindFromRequest();
		if (bindedForm.hasErrors()) {
			return badRequest("Ошибка сохранения, все поля должны быть заполнены!");
		}
		Doctor doctor = bindedForm.get();
		
		if (doctor.id == null) {
			Doctor.save(doctor);
		} else {
			Ebean.update(doctor);
		}
		
		return redirect(routes.DoctorsController.index());
    }
	
	@Access(description = "Создание докторов")
	public static Result create() {
    	return ok(views.html.doctor.create.render(doctorForm));
    }
	
	@Access(description = "Удаление докторов")
	public static Result delete(Long id) {
		Object validateResult = validate(id);
		
		if (validateResult instanceof Result) {
			return (Result) validateResult;
		}
		Ebean.delete((Doctor) validateResult);
    	return redirect(routes.DoctorsController.index());
    }
	
	@Access(description = "Просмотр информации о докторе")
	public static Result view(Long id) {
		Object validateResult = validate(id);
		
		if (validateResult instanceof Result) {
			return (Result) validateResult;
		}
		
    	return ok(views.html.doctor.view.render((Doctor)validateResult));
    }
	
//	public static Result javascriptRoutes() {
//        response().setContentType("text/javascript");
//        return ok(Routes.javascriptRouter("jsRoutes",
//                controllers.routes.javascript.DoctorsController.save()));
//    }
	
	private static Object validate(Long doctorId) {
		if (doctorId == null) {
			return badRequest("Идентификатор доктора пустой");
		}
		
		Doctor doctor = Doctor.findById(doctorId, Doctor.class);
		if (doctor == null) {
			return notFound("Доктора с таким идентификатором не существует");
		}
		
		return doctor;
	}
}
