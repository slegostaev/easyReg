package models;

import java.sql.Time;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * Created by km on 27.01.14.
 */
@Entity
@Table(name = "clinics")
public class Clinic extends BaseEntity {

    @Column(unique = true, nullable = false, length = 100)
    public String name;

    @Temporal(TemporalType.TIME)
    @Column(name = "start_work")
    public Time startWork;

    @Temporal(TemporalType.TIME)
    @Column(name = "end_work")
    public Time endWork;

    @ElementCollection
    @JoinTable(name = "schedule_clinics", joinColumns = @JoinColumn(name = "id", referencedColumnName = "clinic_id"))
    @Enumerated(EnumType.ORDINAL)
    @Column(name = "work_days")
    public Set<DaysOfWeek> workDays;

}
