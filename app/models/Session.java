/**
 * 
 */
package models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import play.data.validation.Constraints.Required;

import com.avaje.ebean.Ebean;

/**
 * @author SLegostaev
 *
 */
@Entity
@Table(name = "sessions")
public class Session {
	
	/**
	 * 
	 */
	public Session() {
		// TODO Auto-generated constructor stub
	}
	
	public Session(String sessionId, User user) {
		this.sessionId = sessionId;
		this.user = user;
	}
	
	@Id
	@Column(name = "session_id")
	public String sessionId;
	
	@Required
	@OneToOne
	@JoinColumn(name="user_id")
	public User user;

	public static Session userSessionById(String sessionId) {
		return Ebean.find(Session.class, sessionId);
	}
}
