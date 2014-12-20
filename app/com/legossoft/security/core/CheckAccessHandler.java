/**
 * 
 */
package com.legossoft.security.core;

import java.util.List;

import models.Group;
import models.ProtectedPage;
import models.User;
import play.Logger;
import play.mvc.Http;

import com.legossoft.security.utils.SecurityUtil;

/**
 * @author SLegostaev
 *
 */
public class CheckAccessHandler {
	
	public static boolean hasAccess() throws CheckAccessException {
		return hasAccess(null, null);
	}
	
	public static boolean hasAccess(String routeController, String actionMethod) throws CheckAccessException {
		Http.Context context = Http.Context.current();
		if (routeController == null || routeController.trim().isEmpty()) {
			routeController = (String) context.args.get("ROUTE_CONTROLLER");
		}
		
		if (actionMethod == null || actionMethod.trim().isEmpty()) {
			actionMethod = (String) context.args.get("ROUTE_ACTION_METHOD");
		}
		Logger.debug(routeController + "." + actionMethod);
		
		return hasAccess(routeController+ "." + actionMethod);
	}
	
	public static boolean hasAccess(String actionMethod) throws CheckAccessException {
		User user = SecurityUtil.currentUser();
		if (user != null) {

			if (user.groups == null || user.groups.isEmpty()) {
				throw new CheckAccessException(String.format("Пользователь %s не принадлежит ни одной группе", user.fullname));
			} 
			
			ProtectedPage protectedPage = ProtectedPage.pageByMethod(actionMethod);
			if (protectedPage == null) {
				throw new CheckAccessException(String.format("Страница иммет атрибут защиты, но по какой то причине недоступна", user.fullname));
			}
			
			if (user.groups != null && user.groups.isEmpty() == false) {
				for (Group group : user.groups) {
					List<ProtectedPage> allowPages = group.allowPages;
					if (allowPages == null || allowPages.size() == 0) {
						throw new CheckAccessException(String.format("Гуппа %s не содержит разрешенных страниц", group.name));
					} else {
						return allowPages.contains(protectedPage);
					}
				}
			}
		}
		return false;
	}
	
}
