package models;

import java.sql.Timestamp;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.OneToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import play.db.ebean.Model;

import com.avaje.ebean.Ebean;
import com.avaje.ebean.annotation.CreatedTimestamp;
import com.avaje.ebean.annotation.UpdatedTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by km on 24.01.14.
 */
@MappedSuperclass
public abstract class BaseEntity extends Model {

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
//    
    @JsonIgnore
    @Column(nullable = true)
    @OneToOne
    public User creator;
    
    public static <T> List<T> findAll(Class<T> classType) {
    	return Ebean.find(classType).findList();
    }
    
    public static <T> T findById(Long id, Class<T> classType) {
    	return Ebean.find(classType, id);
    }
}
