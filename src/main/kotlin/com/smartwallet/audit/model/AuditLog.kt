package com.smartwallet.audit.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "audit_logs")
data class AuditLog(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(name = "user_id")
    val userId: Long? = null,
    val action: String,
    @Column(name = "entity_type")
    val entityType: String? = null,
    @Column(name = "entity_id")
    val entityId: Long? = null,
    @Column(name = "created_at")
    val createdAt: Instant = Instant.now()
)
