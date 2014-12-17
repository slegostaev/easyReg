package controllers;

import models.Session;
import models.User;
import play.data.Form;
import play.data.validation.Constraints.Required;
import play.mvc.Controller;
import play.mvc.Http.Cookie;
import play.mvc.Result;

import com.avaje.ebean.Ebean;
import com.legossoft.security.core.Access;
import com.legossoft.security.utils.SecurityUtil;
/**
 * @author "SLegostaev"
 *
 */
public class Application extends Controller {
	
	private static Form<LoginForm> loginForm = Form.form(LoginForm.class);
	
	@Access(description = "Таблица с расписанием врачей")
    public static Result index() {
        return ok(views.html.pages.index.indexMain.render());
    }

    public static Result login() {
    	return ok(views.html.pages.login.loginMain.render(loginForm));
    }
    
    public static class LoginForm {
    	@Required
    	public String login;
    	
    	@Required
    	public String password;
    	
    	public boolean remembeMe = true;
    }
    
    
    public static Result auth() {
    	Form<LoginForm> bindedForm = loginForm.bindFromRequest();
    	if (bindedForm.hasErrors()) {
    		flash("error", "Имя пользователя или пароль должны быть заполнены");
    		return unauthorized(views.html.pages.login.loginMain.render(bindedForm));
    	}
    	
    	User user = User.authenticate(bindedForm.get().login, bindedForm.get().password);
    	if (user == null) {
    		flash("error", "Имя пользователя или пароль введен не правильно.");
    		return unauthorized(views.html.pages.login.loginMain.render(bindedForm));
    	}
    	
    	final String sessionId = SecurityUtil.generateSessionId(user);
    	
    	response().setCookie(SecurityUtil.SESSION_ID, sessionId);
    	Ebean.save(new Session(sessionId, user));
    	
    	return redirect(routes.Application.index());
    }
    
    public static Result logout() {
    	final Cookie sessionId = request().cookie(SecurityUtil.SESSION_ID);
    	if (sessionId != null) {
    		Session session = Session.userSessionById(sessionId.value());
    		if (session != null) {
    			Ebean.delete(session);
    			response().discardCookie(SecurityUtil.SESSION_ID);
    		}
    	}
    	return redirect(routes.Application.login());
    }
}
