package models;

import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.MappedSuperclass;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import play.data.format.Formats.DateTime;
import play.data.validation.Constraints.Required;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by km on 24.01.14.
 */
@MappedSuperclass
@Entity
@Table(name = "users")
public class User extends BaseEntity {
	
	@JsonIgnore
    @Column(name = "firstname", nullable = false)
	@Required
    public String firstname;
    
	@JsonIgnore
    @Column(name = "surname", nullable = false)
	@Required
    public String surname;
	
	@JsonIgnore
	@Column(name = "patronymic", nullable = false)
	@Required
    public String patronymic;
    
    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    public boolean isActive = true;
    
    @JsonProperty(value = "fullname")
    @Column(name = "fullname")
    public String fullname;
    
    @JsonIgnore
    public String email;
    
    
    @Embedded
    @JsonIgnore
    public Phones phones;
    
    @JsonIgnore
    @Embedded
    public Address address;
    
    @Required
    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    @DateTime(pattern = "yyyy-MM-dd")
    public Date birthday;
    
    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name="group_members",
    	      joinColumns={@JoinColumn(name="group_id", referencedColumnName="id")},
    	      inverseJoinColumns={@JoinColumn(name="user_id", referencedColumnName="id")})
    public List<Group> groups;
    
    public static <T extends User> T save(T user) {
    	user.fullname = user.surname + " " + user.firstname + " " + user.patronymic;
    	Ebean.save(user);
    	return user;
    }
    
    protected static <T extends User> List<T> findByName(String name, Class<T> classType) {
    	return Ebean.find(classType).where().eq("fullname", name).orderBy("fullname").setMaxRows(10).findList();
    }
    
    public static List<? extends User> findAll() {
    	return Ebean.find(User.class).orderBy("fullname").findList();
    }

}
