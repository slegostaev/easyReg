/**
 * 
 */
package models;

import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.MappedSuperclass;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import play.data.format.Formats.DateTime;
import play.data.validation.Constraints.Required;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author SLegostaev
 *
 */
@MappedSuperclass
public class BaseUser extends BaseEntity {
	
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

    
    @JsonProperty(value = "label")
    @Transient
    public String getLabel() {
    	return surname + " " + firstname;
    }
    
    public static <T extends BaseUser> T save(T user) {
    	user.fullname = user.surname + " " + user.firstname + " " + user.patronymic;
    	Ebean.save(user);
    	return user;
    }
    
    protected static <T extends BaseUser> List<T> findByName(String name, Class<T> classType) {
    	return Ebean.find(classType).where().eq("fullname", name).orderBy("fullname").setMaxRows(10).findList();
    }
    
//    public static <T extends BaseUser> List<T> findAll() {
//		return (List<T>) Ebean.find(BaseUser.class).orderBy("fullname").findList();
//	}
}
