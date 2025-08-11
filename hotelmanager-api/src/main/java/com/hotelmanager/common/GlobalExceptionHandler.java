// src/main/java/com/hotelmanager/common/GlobalExceptionHandler.java
package com.hotelmanager.common;

import org.springframework.http.*;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, "Validation échouée");
        pd.setType(URI.create("about:blank"));
        pd.setTitle("Unprocessable Entity");
        pd.setProperty("errors", ex.getBindingResult().getFieldErrors()
                .stream().map(fe -> fe.getField()+": "+fe.getDefaultMessage()).toList());
        return pd;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(IllegalArgumentException ex) {
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        pd.setTitle("Bad Request");
        return pd;
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleConflict(IllegalStateException ex) {
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        pd.setTitle("Conflict");
        return pd;
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleResponseStatus(ResponseStatusException ex) {
        var pd = ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason());
        pd.setTitle(ex.getStatusCode().toString());
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleOther(Exception ex) {
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne");
        pd.setTitle("Internal Server Error");
        return pd;
    }
}
