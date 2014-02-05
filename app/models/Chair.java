package models;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Created by km on 24.01.14.
 */

@Entity
@Table(name = "chairs")
public class Chair extends BaseEntity {

    public String location;

    @OneToMany(mappedBy = "chair")
    public List<WorkPlace> workPlaces;
    
    @JsonIgnore
    @OneToOne
    public Unit unit;
}
