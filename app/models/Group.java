/**
 * 
 */
package models;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author SLegostaev
 *
 */
@Entity
@Table(name = "groups")
public class Group extends BaseEntity {

	@Column(unique = true, nullable = false, length = 100)
	public String name;
	
	@JsonIgnore
	@ManyToMany(mappedBy = "groups", fetch = FetchType.LAZY)
	public List<User> users;
	
	@JsonIgnore
	@ManyToMany(mappedBy = "groups", fetch = FetchType.LAZY)
	public List<ProtectedPage> allowPages;
	
	public static Group byName(String groupName) {
		return Ebean.find(Group.class).where().icontains("name", groupName).findUnique();
	}
	
}
