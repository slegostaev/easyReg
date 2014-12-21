/**
 * 
 */
package com.legossoft.security.core;

import play.Logger;
import play.libs.F;
import play.libs.F.Promise;
import play.mvc.Action;
import play.mvc.Http.Context;
import play.mvc.Result;
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
		
		try {
			if (CheckAccessHandler.hasAccess()) {
				return delegate.call(context);
			}
			Logger.debug(configuration.description() + " - доступ запрещен");
		} catch (CheckAccessException e) {
			Logger.error(e.getMessage(), e);
			return F.Promise.pure((Result) badRequest());
		}

		return F.Promise.pure((Result) redirect(routes.Application.login()));
	}

}
