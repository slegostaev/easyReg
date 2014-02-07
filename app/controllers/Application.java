package controllers;

import play.mvc.Controller;
import play.mvc.Result;
/**
 * @author "SLegostaev"
 *
 */
public class Application extends Controller {

    public static Result index() {
        return ok(views.html.index.render());
    }
}
