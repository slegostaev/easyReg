/**
 * 
 */
package com.legossoft.security.core;

import java.util.List;

import models.Group;
import models.ProtectedPage;
import models.Session;
import models.User;
import play.Logger;
import play.libs.F;
import play.libs.F.Promise;
import play.mvc.Action;
import play.mvc.Http;
import play.mvc.Http.Context;
import play.mvc.Result;

import com.legossoft.security.utils.SecurityUtil;

import controllers.routes;

/**
 * @author SLegostaev
 *
 */
public class AccessAction extends Action<Access> {

	/* (non-Javadoc)
	 * @see play.mvc.Action#call(play.mvc.Http.Context)
	 */
	@Override
	public Promise<Result> call(Context context) throws Throwable {
		final Http.Cookie sessionId = context.request().cookie(SecurityUtil.SESSION_ID);
		
		if (sessionId != null) {
			Session userSession = Session.userSessionById(sessionId.value());
			if (userSession != null) {
				User user = userSession.user;
				final String actionMethod = (String) context.args.get("ROUTE_ACTION_METHOD");
				final String routeController = (String) context.args.get("ROUTE_CONTROLLER");
				if (user.groups == null || user.groups.isEmpty()) {
					Logger.error(String.format("Пользователь %s не принадлежит ни одной группе", user.fullname));
					return F.Promise.pure((Result) unauthorized());
				} 
				
		
				ProtectedPage protectedPage = ProtectedPage.pageByClassAndMethod(routeController, actionMethod);
				if (protectedPage == null) {
					Logger.error(String.format("Страница иммет атрибут защиты, но по какой то причине недоступна", user.fullname));
					return F.Promise.pure((Result) notFound());
				}
				
				for (Group group : user.groups) {
					List<ProtectedPage> allowPages = group.allowPages;
					if (allowPages == null || allowPages.size() == 0) {
						Logger.error(String.format("Гуппа %s не содержит разрешенных страниц", group.name));
					} else {
						Logger.debug(configuration.description() + " - доступ разрешен для " + user.fullname);
						return delegate.call(context);
					}
				}
				
				Logger.debug(configuration.description() + " - доступ запрещен для " + user.fullname);
			}
		}
		return F.Promise.pure((Result) redirect(routes.Application.login()));
	}

}
