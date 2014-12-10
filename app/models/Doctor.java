package models;

import java.util.List;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Created by km on 24.01.14.
 */
@Entity
@DiscriminatorValue("1")
public class Doctor extends User {
	
//	@Required
//    @Enumerated(value = EnumType.ORDINAL)
//    @Column(name = "user_type")
//    private UserType userType = UserType.doctor;
	
    @JsonIgnore
    @OneToMany(mappedBy = "doctor", fetch = FetchType.EAGER)
    public List<Reception> receptions;
    
    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    public List<ScheduleTemplate> scheduleTemplates;
    
    
    public static List<Doctor> findAllDoctors() {
		return Ebean.find(Doctor.class).orderBy("fullname").findList();
	}
    
    public static Doctor findById(Long id) {
    	return findById(id, Doctor.class);
    }
}
