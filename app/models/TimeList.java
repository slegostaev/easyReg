/**
 * 
 */
package models;

import java.sql.Time;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author "SLegostaev"
 *
 * Creation date: 03 марта 2014 г.
 */
@Entity
@Table(name = "time_list")
public class TimeList extends BaseEntity {
	
	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "work_day_id")
	public WorkDay workDay;
	
	@Column(name = "start_time", nullable = false)
	public Time startTime;
	
	@Column(name = "end_time", nullable = false)
	public Time endTime;
}
