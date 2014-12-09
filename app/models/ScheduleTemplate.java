/**
 * 
 */
package models;

import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author "SLegostaev"
 *
 * Creation date: 03 марта 2014 г.
 */
@Entity
@Table(name = "schedule_templates")
public class ScheduleTemplate extends BaseEntity {
	
	@ManyToOne
	@JsonIgnore
	@JoinColumn(name = "doctor_id")
	public Doctor doctor;
	
	@Column(name = "start_period", nullable = false)
	public Date startPeriod;
	
	@Column(name = "end_period", nullable = true)
	public Date endPeriod;
	
	@Enumerated(EnumType.ORDINAL)
	@Column(name = "period_type", nullable = false, columnDefinition = "integer default 0")
	public PeriodType type;
	
	@OneToMany(mappedBy  = "scheduleTemplate", fetch = FetchType.EAGER)
	public List<WorkDay> workDays;
}
