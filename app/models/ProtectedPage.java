/**
 * 
 */
package models;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author SLegostaev
 *
 */
@Entity
@Table(name = "protected_pages", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "class_name", "method_name"}) 
	})
public class ProtectedPage extends BaseEntity {
	
	/**
	 * 
	 */
	public ProtectedPage() {
		// TODO Auto-generated constructor stub
	}
	
	public ProtectedPage(String className, String methodName, String description) {
		this.className = className;
		this.methodName = methodName;
		this.description = description;
	}
	
	
	@Column(name = "class_name", nullable = false, length = 100)
	public String className;
	
	@Column(name = "method_name", nullable = false, length = 100)
	public String methodName;
	
	@Column(length = 250)
	public String description;
	
	@JsonIgnore
	@ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
	@JoinTable(name="access_list",
  	      joinColumns={@JoinColumn(name="group_id", referencedColumnName="id")},
  	      inverseJoinColumns={@JoinColumn(name="page_id", referencedColumnName="id")})
	public List<Group> groups;
	
	public static ProtectedPage pageByClassAndMethod(String className, String methodName) {
		return Ebean.find(ProtectedPage.class).where().eq("class_name", className).eq("method_name", methodName).findUnique();
	}
	
	/* (non-Javadoc)
	 * @see play.db.ebean.Model#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object arg0) {
		ProtectedPage page = (ProtectedPage) arg0;
		return page != null && page.className.equals(this.className) && page.methodName.equals(this.methodName);
	}
	
}
