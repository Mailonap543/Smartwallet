package com.smartwallet.audit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwallet.audit.entity.AuditLog;
import com.smartwallet.audit.repository.AuditRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditRepository auditRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditRepository auditRepository, ObjectMapper objectMapper) {
        this.auditRepository = auditRepository;
        this.objectMapper = objectMapper;
    }

    public void log(Long userId, String entityType, Long entityId, String action, Object oldValue, Object newValue) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        
        try {
            if (oldValue != null) {
                log.setOldValue(objectMapper.writeValueAsString(oldValue));
            }
            if (newValue != null) {
                log.setNewValue(objectMapper.writeValueAsString(newValue));
            }
        } catch (Exception e) {
            // Ignore serialization errors
        }
        
        auditRepository.save(log);
    }

    public void log(Long userId, String entityType, Long entityId, String action) {
        log(userId, entityType, entityId, action, null, null);
    }

    public List<AuditLog> getByEntity(String entityType, Long entityId) {
        return auditRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    public List<AuditLog> getByUser(Long userId) {
        return auditRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}