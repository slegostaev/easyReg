/**
 * 
 */
package com.legossoft.security.utils;

import java.lang.reflect.Method;
import java.util.Set;

import org.reflections.Reflections;
import org.reflections.scanners.MethodAnnotationsScanner;
import org.reflections.util.ClasspathHelper;
import org.reflections.util.ConfigurationBuilder;
import org.reflections.util.FilterBuilder;

import play.Logger;
import play.Play;

import com.legossoft.security.core.Access;

/**
 * @author SLegostaev
 *
 */
public class SecurityUtil {
	public static Set<Method> getProtectedMethods() {
		Reflections reflections = new Reflections(
                new ConfigurationBuilder()
                .addUrls(ClasspathHelper.forPackage("controllers", Play.application().classloader()))
                .filterInputsBy(new FilterBuilder().include(FilterBuilder.prefix("controllers" + ".")))
                .setScanners(new MethodAnnotationsScanner(), new MethodAnnotationsScanner()));
		Set<Method> methods = reflections.getMethodsAnnotatedWith(Access.class);
		for (Method method : methods) {
			Access a = method.getAnnotation(Access.class);
			Logger.debug(method.getDeclaringClass().getCanonicalName() + ":" +method.getName() + " " + a.description()); 
		}
		return methods;
	}
}
