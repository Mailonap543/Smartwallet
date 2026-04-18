package com.smartwallet.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class SecurityAuditService {

    public void logAccess(String username, String endpoint, String method, 
                        String ipAddress, int status, long duration) {
        
        log.info("ACCESS | user={} | method={} | endpoint={} | status={} | duration={}ms | ip={}",
            username, method, endpoint, status, duration, ipAddress);
    }

    public void logSecurityEvent(String event, String details, String ipAddress) {
        log.warn("SECURITY | event={} | details={} | ip={}", event, details, ipAddress);
    }

    public void logFailedLogin(String ipAddress) {
        log.warn("LOGIN_FAILED | ip={} | time={}", ipAddress, LocalDateTime.now());
    }

    public void logRateLimitExceeded(String ipAddress, String endpoint) {
        log.warn("RATE_LIMIT_EXCEEDED | ip={} | endpoint={} | time={}", ipAddress, endpoint, LocalDateTime.now());
    }

    public void logSuspiciousActivity(String activity, String ipAddress) {
        log.error("SUSPICIOUS_ACTIVITY | activity={} | ip={} | time={}", 
            activity, ipAddress, LocalDateTime.now());
    }
}