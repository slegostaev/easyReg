/**
 * 
 */
package com.legossoft.security.utils;

import java.lang.reflect.Method;
import java.util.Set;

import models.Session;
import models.User;

import org.reflections.Reflections;
import org.reflections.scanners.MethodAnnotationsScanner;
import org.reflections.util.ClasspathHelper;
import org.reflections.util.ConfigurationBuilder;
import org.reflections.util.FilterBuilder;

import play.Logger;
import play.Play;
import play.mvc.Http;
import play.mvc.Http.Cookie;

import com.legossoft.security.core.Access;

/**
 * @author SLegostaev
 *
 */
public class SecurityUtil {
	
	public static final String SESSION_ID = "session_id";
	
	private static Set<Method> methods = null;
	
	public static Set<Method> getProtectedMethods() {
		Reflections reflections = new Reflections(
                new ConfigurationBuilder()
                .addUrls(ClasspathHelper.forPackage("controllers", Play.application().classloader()))
                .filterInputsBy(new FilterBuilder().include(FilterBuilder.prefix("controllers" + ".")))
                .setScanners(new MethodAnnotationsScanner(), new MethodAnnotationsScanner()));
		if (methods == null) {
			methods = reflections.getMethodsAnnotatedWith(Access.class);
			for (Method method : methods) {
				Access a = method.getAnnotation(Access.class);
				Logger.debug(method.getDeclaringClass().getCanonicalName() + ":" +method.getName() + " " + a.description()); 
			}
		}
		return methods;
	}
	
	public static String generateSessionId(User user) {
		return java.util.UUID.randomUUID().toString();
	}
	
	public static User currentUser() {
		Logger.debug("++++++++++++++++++currentUser");
		final Cookie sessionId = Http.Context.current().request().cookie(SESSION_ID);
		if (sessionId != null) {
			Session session = Session.userSessionById(sessionId.value());
			return session == null ? null : session.user;
		}
		return null;
	}
	
}
