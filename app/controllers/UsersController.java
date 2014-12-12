/**
 * 
 */
package controllers;

import models.User;
import play.Routes;
import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;

/**
 * @author SLegostaev
 *
 */
public class UsersController extends Controller {
	
	private static Form<User> userForm = Form.form(User.class);
	
	public static Result listOfUsers() {
		return ok(views.html.settings.users.render(User.findAllUsers()));
	}
	
	public static Result create() {
		return TODO;
	}
	
	public static Result save() {
		return TODO;
	}
	
	public static Result delete(Long id) {
		return TODO;
	}
	
	public static Result edit(Long id) {
		return TODO;
	}
	
	public static Result javascriptRoutes() {
        response().setContentType("text/javascript");
        return ok(Routes.javascriptRouter("jsRoutes",
                controllers.routes.javascript.UsersController.save()));
    }
}
