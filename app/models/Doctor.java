package models;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Created by km on 24.01.14.
 */
@Entity
@Table(name = "doctors")
public class Doctor extends User {
	
	@JsonIgnore
    @OneToMany(mappedBy = "doctor")
    public List<WorkPlace> workPlaces;
	
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    public Unit unit;
    
    @JsonIgnore
    @OneToMany(mappedBy = "doctor")
    public List<Reception> receptions;
    
    public static List<Doctor> findAll() {
    	return Ebean.find(Doctor.class).findList();
    }
    
//    @Transient
//    public Long getKey() {
//    	return id;
//    }
    
//    @Transient
//    public String getLabel() {
//    	return getFullName();
//    }
    
//    @JsonProperty(value = "doctor_id")
//    @Transient
//    public Long getDoctorId() {
//    	return id;
//    }
}
