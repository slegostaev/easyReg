package models;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * Created by km on 24.01.14.
 */
@Entity
@Table(name = "receptions")
public class Reception extends BaseEntity {
	
	//@JsonIgnore
	@Column(nullable = false)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id")
    public Patient patient;

	@Column(nullable = false)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doctor_id")
    public Doctor doctor;
	
	@JsonIgnore
    @Temporal(TemporalType.DATE)
    @Column(name = "reception_date")
    public Date receptionDate;
	
	@JsonIgnore
    @Temporal(TemporalType.TIME)
    @Column(name = "start_time", nullable = false)
    public Time startTime;

	@JsonIgnore
    @Temporal(TemporalType.TIME)
    @Column(name = "end_time", nullable = false)
    public Time endTime;
    
    @JsonProperty(value = "text")
    public String description;
    
    @Column(name = "first_time")
    @JsonProperty(value = "first_time")
    public boolean isFirstTime;
    
    public static List<Reception> findAll() {
    	return Ebean.find(Reception.class).findList();
    }
    
    @JsonProperty(value = "doctor_id")
    @Transient
    public Long getDoctorId() {
    	return doctor.id;
    }
    
    @JsonProperty(value = "start_date")
    @Transient
    public Timestamp getReceptionStartDate() {
        return new Timestamp(receptionDate.getYear(), receptionDate.getMonth(), 
        		receptionDate.getDate(), startTime.getHours(), startTime.getMinutes(), 
        		startTime.getSeconds(), 0);
    }
    
    @JsonProperty(value = "end_date")
    @Transient
    public Timestamp getReceptionEndDate() {
        return new Timestamp(receptionDate.getYear(), receptionDate.getMonth(), 
        		receptionDate.getDate(), endTime.getHours(), endTime.getMinutes(), 
        		endTime.getSeconds(), 0);
    }
    
    public static Reception addReception(Reception reception) {
    	Ebean.save(reception);
    	return reception;
    }
    
    public static Reception updateReception(Reception reception) {
    	Ebean.update(reception);
    	return reception;
    }
    
    public static int deleteReception(Long id) {
    	return Ebean.delete(Reception.class, id);
    }
}
