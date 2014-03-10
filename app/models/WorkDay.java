/**
 * 
 */
package models;

import java.sql.Time;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.OneToMany;
import javax.persistence.Table;

/**
 * @author "SLegostaev"
 *
 * Creation date: 03 марта 2014 г.
 */
@Entity
@Table(name = "work_days")
public class WorkDay extends BaseEntity {
	
	@Column(name = "start_work", nullable = true)
	public Time startWork;
	
	@Column(name = "end_work", nullable = true)
	public Time endWork;
	
	@Column(name="is_weekend", nullable = false, columnDefinition = "boolean default false")
	public boolean isWeekend;
	
	@OneToMany(mappedBy = "workDay")
	public List<TimeList> timeList;
	
	@Column(name = "day_index")
	@Enumerated(EnumType.ORDINAL)
	public DaysOfWeek dayIndex;
}
