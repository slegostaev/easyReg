import java.lang.reflect.Method;
import java.util.List;
import java.util.Set;

import models.Group;
import models.ProtectedPage;
import play.Application;
import play.GlobalSettings;
import play.Logger;

import com.avaje.ebean.Ebean;
import com.legossoft.security.core.Access;
import com.legossoft.security.utils.SecurityUtil;

/**
 * 
 */

/**
 * @author SLegostaev
 *
 */
public class Global extends GlobalSettings {
	
	/* (non-Javadoc)
	 * @see play.GlobalSettings#beforeStart(play.Application)
	 */
	@Override
	public void onStart(Application arg0) {
		
		List<ProtectedPage> protectedPages = ProtectedPage.findAll(ProtectedPage.class);
		if (protectedPages.size() == 0) {
			Group adminsGroup = Group.byName("Администраторы");
			if (adminsGroup == null) {
				Logger.error("Группа администраторов не задана");
			} else {
				Set<Method> protectedMethods = SecurityUtil.getProtectedMethods();
				for (Method method : protectedMethods) {
					ProtectedPage protectedPage = new ProtectedPage(method.getDeclaringClass().getCanonicalName() + "." + method.getName(), method.getAnnotation(Access.class).description());
					protectedPage.groups.add(adminsGroup);
					protectedPages.add(protectedPage);
				}
				Ebean.save(protectedPages);
			}
		}
		super.beforeStart(arg0);
	}
}
