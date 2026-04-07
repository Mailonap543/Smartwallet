package com.smartwallet.audit.repository

import com.smartwallet.audit.model.AuditLog
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AuditLogRepository : JpaRepository<AuditLog, Long>
