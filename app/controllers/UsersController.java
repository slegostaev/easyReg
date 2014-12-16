/**
 * 
 */
package controllers;

import models.User;
import play.Routes;
import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;

import com.legossoft.security.core.Access;

/**
 * @author SLegostaev
 *
 */
public class UsersController extends Controller {
	
	private static Form<User> userForm = Form.form(User.class);
	
	@Access(description = "Доступ к списку пользователей")
	public static Result index() {
		return ok(views.html.settings.users.render(User.findAllUsers()));
	}
	
	@Access(description = "Создаение пользователей")
	public static Result create() {
		return TODO;
	}
	
	public static Result save() {
		return TODO;
	}
	
	@Access(description = "Удаление пользователей")
	public static Result delete(Long id) {
		return TODO;
	}
	
	@Access(description = "Редактирование пользователей")
	public static Result edit(Long id) {
		return TODO;
	}
	
	public static Result javascriptRoutes() {
        response().setContentType("text/javascript");
        return ok(Routes.javascriptRouter("jsRoutes",
                controllers.routes.javascript.UsersController.save()));
    }
}
