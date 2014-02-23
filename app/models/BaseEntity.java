package models;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import play.db.ebean.Model;

import com.avaje.ebean.annotation.CreatedTimestamp;
import com.avaje.ebean.annotation.UpdatedTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by km on 24.01.14.
 */
@MappedSuperclass
public class BaseEntity extends Model {

    @Id
    @JsonProperty(value = "key")
    public Long id;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "create_date", columnDefinition="TIMESTAMP default CURRENT_TIMESTAMP")
    @JsonIgnore
    @CreatedTimestamp
    public Timestamp createDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_date", columnDefinition="TIMESTAMP default CURRENT_TIMESTAMP")
    @JsonIgnore
    @UpdatedTimestamp
    public Timestamp updatedDate;
}
