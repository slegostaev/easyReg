package models;

import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.MappedSuperclass;
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
    
    public static <T extends User> T save(T user) {
    	user.fullname = user.surname + " " + user.firstname + " " + user.patronymic;
    	Ebean.save(user);
    	return user;
    }
    
    protected static <T extends User> List<T> findByName(String name, Class<T> classType) {
    	return Ebean.find(classType).where().icontains("fullname", name).orderBy("fullname").setMaxRows(10).findList();
    }
    
    protected static <T extends User> List<T> findAll(Class<T> classType) {
    	return Ebean.find(classType).orderBy("fullname").findList();
    }
    
    protected static <T extends User> T findById(Long id, Class<T> classType) {
    	return Ebean.find(classType, id);
    }
}
