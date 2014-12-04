package models;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Created by km on 24.01.14.
 */
@Entity
@Table(name = "patients", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "firstname", "surname", "patronymic", "birthday" }) 
	})
public class Patient extends User {
	
	@JsonIgnore
    @OneToMany(mappedBy = "patient")
    public List<Reception> receptions;
    
	public static List<Patient> findByName(String mask) {
		return findByName(mask, Patient.class);
	}
	
	@JsonIgnore
    @JoinTable(name="group_members",
    	      joinColumns={@JoinColumn(name="group_id", referencedColumnName="id")},
    	      inverseJoinColumns={@JoinColumn(name="user_id", referencedColumnName="id")})
    public List<Group> groups;
}
