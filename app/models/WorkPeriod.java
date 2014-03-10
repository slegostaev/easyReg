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
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

/**
 * @author "SLegostaev"
 *
 * Creation date: 03 марта 2014 г.
 */
@Entity
@Table(name = "work_periods")
public class WorkPeriod extends BaseEntity {
	
	@ManyToOne
	@JoinColumn(name = "doctor_id")
	public Doctor doctor;
	
	@Column(name = "start_period", nullable = false)
	public Date startPeriod;
	
	@Column(name = "end_period", nullable = true)
	public Date endPeriod;
	
	@Enumerated(EnumType.ORDINAL)
	@Column(name = "period_type", nullable = false, columnDefinition = "integer default 0")
	public PeriodType type;
	
	@OneToMany(mappedBy = "workPeriod")
	public List<WorkCalendar> workDays;
}
