package models;

import java.sql.Date;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by km on 24.01.14.
 */
@MappedSuperclass
public class User extends BaseEntity {
	
	@JsonIgnore
    @Column(name = "first_name", nullable = false)
    public String firstName;
    
	@JsonIgnore
    @Column(name = "surname", nullable = false)
    public String surname;
	
	@JsonIgnore
	@Column(name = "patronymic", nullable = false)
    public String patronymic;
    
    @Column(name = "is_active", nullable = false)
    public boolean isActive;
    
    @JsonProperty(value = "fullname")
    @Transient
    public String getFullName() {
    	return surname + " " + firstName + " " + patronymic;
    }
    
    @Column(nullable = false)
    public Date birthday;
}
