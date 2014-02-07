package models;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Created by km on 24.01.14.
 */
@Entity
@Table(name = "patients")
public class Patient extends User {
	
	@JsonIgnore
    @OneToMany(mappedBy = "patient")
    public List<Reception> receptions;
    
    public static List<Patient> findByName(String name) {
    	return Ebean.find(Patient.class).where().icontains("surname", name).findList();
    }
}
