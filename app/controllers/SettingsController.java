/**
 * 
 */
package controllers;

import play.mvc.Controller;
import play.mvc.Result;

/**
 * @author "SLegostaev"
 *
 * Creation date: 06/02/2014 г.
 */
public class SettingsController extends Controller {
	
	public static Result index() {
		return ok(views.html.pages.settings.main.index.mainSettingsContent.render());
	}
}
