package models;

import java.sql.Time;
import java.util.List;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Created by km on 27.01.14.
 */
@Entity
@Table(name = "units")
public class Unit extends BaseEntity {

    @Column(unique = true, nullable = false, length = 100)
    public String name;

    @Temporal(TemporalType.TIME)
    @Column(name = "start_work")
    public Time startWork;

    @Temporal(TemporalType.TIME)
    @Column(name = "end_work")
    public Time endWork;

    @ElementCollection
    @JoinTable(name = "units_schedule", joinColumns = @JoinColumn(name = "id", referencedColumnName = "unit_id"))
    @Enumerated(EnumType.ORDINAL)
    @Column(name = "work_days")
    public Set<DaysOfWeek> workDays;
    
    @JsonIgnore
    @OneToMany(mappedBy = "unit")
    public List<Doctor> doctors;
}
