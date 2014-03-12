package models;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by km on 24.01.14.
 */
@Entity
@Table(name = "doctors", uniqueConstraints = {
			@UniqueConstraint(columnNames = { "firstname", "surname", "patronymic", "birthday" }) 
		})
public class Doctor extends User {
	
	@JsonIgnore
    @OneToMany(mappedBy = "doctor")
    public List<WorkPlace> workPlaces;
	
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    public Unit unit;
    
    @JsonIgnore
    @OneToMany(mappedBy = "doctor", fetch = FetchType.EAGER)
    public List<Reception> receptions;
    
    @JsonProperty(value = "label")
    @Transient
    public String getLabel() {
    	return surname + " " + firstname;
    }
    
    
    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    public List<WorkPeriod> workPeriods;
    
    
    
    public static List<Doctor> findAll() {
		return findAll(Doctor.class);
	}

    
    public static Doctor findById(Long id) {
    	return findById(id, Doctor.class);
    }
}
