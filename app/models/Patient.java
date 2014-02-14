package models;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.avaje.ebean.Ebean;
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
    
    public static List<Patient> findByName(String name) {
    	return Ebean.find(Patient.class).where().icontains("fullname", name).findList();
    }
    
    public static Patient save(Patient patient) {
    	
    	patient.fullname = patient.surname + " " + patient.firstName + " " + patient.patronymic;
    	
    	Ebean.save(patient);
    	return patient;
    }
}
