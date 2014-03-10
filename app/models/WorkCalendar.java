/**
 * 
 */
package models;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/**
 * @author "SLegostaev"
 *
 * Creation date: 03 марта 2014 г.
 */
@Entity
@Table(name = "work_calendar")
public class WorkCalendar extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "work_period_id")
	public WorkPeriod workPeriod;
	
	@ManyToOne
	@JoinColumn(name = "work_day_id")
	public WorkDay workDay;
	
	@Enumerated(EnumType.ORDINAL)
	public WorkDayType dayType;
}
