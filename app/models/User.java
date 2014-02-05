package models;

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
    @Column(name = "first_name")
    public String firstName;
    
	@JsonIgnore
    @Column(name = "last_name")
    public String lastName;
    
	@JsonIgnore
    @Column(name = "is_active", nullable = false)
    public boolean isActive;
    
    @JsonProperty(value = "label")
    @Transient
    public String getFullName() {
    	return lastName + " " + firstName;
    }
}
