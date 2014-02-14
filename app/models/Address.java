/**
 * 
 */
package models;

import javax.persistence.Embeddable;

/**
 * @author "SLegostaev"
 *
 * Creation date: 14 февр. 2014 г.
 */

@Embeddable
public class Address {
	
	public String address;
	public String city;
	public String zip;
	public String country;
	
}
