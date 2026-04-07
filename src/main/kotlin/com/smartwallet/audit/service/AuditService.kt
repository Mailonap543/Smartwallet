package com.smartwallet.audit.service

import com.smartwallet.audit.model.AuditLog
import com.smartwallet.audit.repository.AuditLogRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuditService(
    private val auditRepo: AuditLogRepository
) {
    @Transactional
    fun log(userId: Long?, action: String, entity: String?, entityId: Long?) {
        auditRepo.save(
            AuditLog(
                userId = userId,
                action = action,
                entityType = entity,
                entityId = entityId
            )
        )
    }
}
