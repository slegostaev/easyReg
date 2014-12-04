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
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.legossoft.model.jsonSerializers.DayOfWeekSerializer;

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
	
	@JsonIgnore
	@OneToMany(mappedBy = "workDay")
	public List<TimeList> timeList;
	
	@Column(name="duration_visit", nullable = false, columnDefinition = "integer default 60")
	public Integer durationVisit;
	
	@Column(name = "day_index")
	@Enumerated(EnumType.ORDINAL)
	@JsonSerialize(using = DayOfWeekSerializer.class)
	@JsonProperty(value = "index")
	public DaysOfWeek dayIndex;
	
	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "period_id")
	public WorkPeriod period;
}
