/**
 * 
 */
package com.legossoft.model.jsonSerializers;

import java.io.IOException;

import models.DaysOfWeek;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

/**
 * @author "SLegostaev"
 *
 * Creation date: 12 марта 2014 г.
 */
public class DayOfWeekSerializer extends JsonSerializer<DaysOfWeek> {

	/* (non-Javadoc)
	 * @see com.fasterxml.jackson.databind.JsonSerializer#serialize(java.lang.Object, com.fasterxml.jackson.core.JsonGenerator, com.fasterxml.jackson.databind.SerializerProvider)
	 */
	@Override
	public void serialize(DaysOfWeek daysOfWeek, JsonGenerator jsonGenerator,
			SerializerProvider serializerProvider) throws IOException,
			JsonProcessingException {
		jsonGenerator.writeNumber(daysOfWeek.ordinal());
	}

}
