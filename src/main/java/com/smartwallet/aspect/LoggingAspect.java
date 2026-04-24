package com.smartwallet.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @Pointcut("within(com.smartwallet.controller..*)")
    public void controllerPointcut() {}

    @Pointcut("within(com.smartwallet.service..*)")
    public void servicePointcut() {}

    @Around("controllerPointcut()")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        
        logger.debug("REQUEST: {}", method);
        
        long startTime = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long duration = System.currentTimeMillis() - startTime;
        
        logger.debug("RESPONSE: {} - Duration: {}ms", method, duration);
        return result;
    }

    @Around("servicePointcut()")
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        long startTime = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            logger.debug("SERVICE: {} - Duration: {}ms", method, duration);
            return result;
        } catch (Throwable e) {
            logger.error("SERVICE ERROR: {} - Error: {} - Cause: {}", method, e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "null", e);
            throw new RuntimeException("Error executing " + method, e);
        }
    }
}
