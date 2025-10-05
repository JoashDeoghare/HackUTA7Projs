package com.email.writer.app;

import lombok.Data;

// this will help setup getters and setters.
@Data
public class EmailRequest {
    private String emailContent;
    private String tone;


}
