package models;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import play.data.validation.Constraints.Required;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Created by km on 24.01.14.
 */
//@MappedSuperclass
@Entity
@Table(name = "users", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "firstname", "surname", "patronymic", "birthday" }) 
	})
@Inheritance(strategy=InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.INTEGER)
@DiscriminatorValue("0")
public class User extends BaseUser {
	
    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    public boolean isActive = true;
    
    @Required
    public String login;
    
    @Required
    public String password;
    
//    @Required
//    @Enumerated(value = EnumType.ORDINAL)
//    @Column(name = "user_type")
//    private UserType userType = UserType.user;
    
    @JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "clinic_id")
	public Clinic clinic;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name="group_members",
    	      joinColumns={@JoinColumn(name="group_id", referencedColumnName="id")},
    	      inverseJoinColumns={@JoinColumn(name="user_id", referencedColumnName="id")})
    public List<Group> groups;
    
    public static List<Doctor> findAll() {
		return Ebean.find(Doctor.class).orderBy("fullname").findList();
	}

}
