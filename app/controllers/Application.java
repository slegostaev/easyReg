package controllers;

import play.mvc.Controller;
import play.mvc.Result;

import com.legossoft.security.core.Access;
/**
 * @author "SLegostaev"
 *
 */
public class Application extends Controller {
	
	@Access(description = "Таблица с расписанием врачей")
    public static Result index() {
//    	Cookie cookie = Http.Context.current().request().cookie("test");
//    	if (cookie != null && cookie.maxAge() != null) {
//    		Logger.debug(cookie.maxAge().toString());
//    	}
//    	Http.Context.current().response().setCookie("test", "test", 1800);
        return ok(views.html.index.render());
    }
	
    @Access(description = "Test method")
	public static Result index2() throws ClassNotFoundException {
//		Set<String> strings = Classpath.getTypesAnnotatedWith(Play.application(), "controllers", Access.class);
		
		return TODO;
	}
    
}
