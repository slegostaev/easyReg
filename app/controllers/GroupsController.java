/**
 * 
 */
package controllers;

import java.util.List;

import models.Group;
import models.User;
import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;

import com.avaje.ebean.Ebean;
import com.legossoft.security.core.Access;

/**
 * @author SLegostaev
 *
 */
public class GroupsController extends Controller {
	
	public static Form<Group> groupForm = Form.form(Group.class);
	
	@Access(description = "Доступ к списку групп пользователей")
	public static Result index() {
		return ok(views.html.group.index.render(Group.findAll(Group.class)));
	}
	
	@Access(description = "Создание групп пользователей")
	public static Result create() {
		return ok(views.html.group.create.render(groupForm));
	}
	
	public static Result save() {
		Form<Group> bindedForm = groupForm.bindFromRequest();
		if (bindedForm.hasErrors()) {
			flash("error", "Ошибка сохранения");
		} else {
			Group group = bindedForm.get();
			if (group.id == null) {
				Ebean.save(group);
			} else {
				Ebean.update(group);
			}
			
			flash("ok", "Группа сохранена успешно");
		}
		
		return ok(views.html.group.edit.render(bindedForm));
	}
	
	@Access(description = "Удаление групп пользователей")
	public static Result delete(Long id) {
		return TODO;
	}
	
	@Access(description = "Просмотр групп пользователей")
	public static Result view(Long id) {
		return ok(views.html.group.view.render(Group.findById(id, Group.class)));
	}
	
	@Access(description = "Редактирование групп пользователей")
	public static Result edit(Long id) {
		return ok(views.html.group.edit.render(groupForm.fill(Group.findById(id, Group.class))));
	}
	
	
	@Access(description = "Просмотр пользователей группы")
	public static Result usersGroup(Long id) {
		Group group = Group.findById(id, Group.class);
		List<User> users = User.findAllUsers();
		users.removeAll(group.users);
		return ok(views.html.group.usersGroup.render(group, users));
	}
	
	@Access(description = "Просмотр разрешений группы")
	public static Result permissionsGroup(Long id) {
		return TODO;
	}
	
	@Access(description = "Удаление пользователей из группы")
	public static Result deleteUserFromGroup(Long groupId, Long userId) {
//		SqlUpdate query = Ebean.createSqlUpdate("delete from group_members where group_id = :groupId and user_id = :userId")
//			.setParameter("groupId", groupId).setParameter("userId", userId);
//		query.execute();
		Group group = Group.findById(groupId, Group.class);
		User user = User.findById(userId, User.class);
		group.users.remove(user);
		Ebean.update(group);
		return redirect(routes.GroupsController.usersGroup(groupId));
	}
	
	@Access(description = "Добавление пользователей в группу")
	public static Result addUserToGroup(Long groupId, Long userId) {
		Group group = Group.findById(groupId, Group.class);
		User user = User.findById(userId, User.class);
		group.users.add(user);
		Ebean.update(group);
		return redirect(routes.GroupsController.usersGroup(groupId));
	}
	
}
