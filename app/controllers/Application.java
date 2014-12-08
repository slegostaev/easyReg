package controllers;

import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;

import com.legossoft.security.core.Access;
/**
 * @author "SLegostaev"
 *
 */
public class Application extends Controller {
	
	private static Form<LoginForm> loginForm = Form.form(LoginForm.class);
	
	@Access(description = "Таблица с расписанием врачей")
    public static Result index() {
        return ok(views.html.index.render());
    }

    public static Result login() {
    	return ok(views.html.login.render(loginForm));
    }
    
    public static class LoginForm {
    	public String username;
    	public String password;
    	public boolean remembeMe = true;
    }
    
    
    public static Result auth() {
    	return TODO;
    }
}
