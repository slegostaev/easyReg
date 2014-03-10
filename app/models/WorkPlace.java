package models;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Created by km on 24.01.14.
 */
@Entity
@Table(name = "work_places")
public class WorkPlace extends BaseEntity {
	
	@JsonIgnore
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    public Doctor doctor;
	
	@JsonIgnore
    @ManyToOne
    @JoinColumn(name = "chair_id")
    public Chair chair;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "start_date")
    public Timestamp startDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "end_date")
    public Timestamp endDate;

}
