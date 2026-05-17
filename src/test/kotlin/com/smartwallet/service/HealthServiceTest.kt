package com.smartwallet.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.test.util.ReflectionTestUtils
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.connection.RedisConnection
import org.springframework.data.redis.connection.RedisConnectionFactory
import jakarta.persistence.EntityManager
import jakarta.persistence.Query

class HealthServiceTest {

    private lateinit var healthService: HealthService
    private lateinit var redisTemplate: RedisTemplate<String, Any>

    @BeforeEach
    fun setup() {
        redisTemplate = mock()
        healthService = HealthService(redisTemplate)
    }

    @Test
    fun `checkDatabase returns UP status on success`() {
        val entityManager = mockEntityManager(1)
        injectEntityManager(entityManager)
        
        val result = healthService.checkDatabase()
        
        assertEquals("UP", result["status"])
        assertTrue(result.containsKey("details"))
    }

    @Test
    fun `checkDatabase returns DOWN status on failure`() {
        val entityManager = mockEntityManager(RuntimeException("Connection failed"))
        injectEntityManager(entityManager)
        
        val result = healthService.checkDatabase()
        
        assertEquals("DOWN", result["status"])
    }

    @Test
    fun `checkExternalApi makes real HTTP call to AI service`() {
        val result = healthService.checkExternalApi()
        
        assertTrue(result.containsKey("aiService"))
        assertTrue(result.containsKey("status"))
    }

    @Test
    fun `checkReadiness returns readiness status`() {
        val entityManager = mockEntityManager(1)
        
        val redisConnection = mock<RedisConnection>()
        val redisConnectionFactory = mock<RedisConnectionFactory>()
        
        whenever(redisTemplate.getConnectionFactory()).thenReturn(redisConnectionFactory)
        whenever(redisConnectionFactory.getConnection()).thenReturn(redisConnection)
        whenever(redisConnection.ping()).thenReturn("PONG")
        
        injectEntityManager(entityManager)
        
        val result = healthService.checkReadiness()
        
        assertTrue(result.containsKey("ready"))
        assertTrue(result.containsKey("database"))
        assertTrue(result.containsKey("cache"))
        assertTrue(result.containsKey("timestamp"))
    }

    private fun mockEntityManager(result: Any): EntityManager {
        val query = mock<Query>()
        val entityManager = mock<EntityManager>()
        whenever(entityManager.createNativeQuery("SELECT 1")).thenReturn(query)
        if (result is Throwable) {
            whenever(query.singleResult).thenThrow(result)
        } else {
            whenever(query.singleResult).thenReturn(result)
        }
        return entityManager
    }

    private fun injectEntityManager(entityManager: EntityManager) {
        ReflectionTestUtils.setField(healthService, "entityManager", entityManager)
    }
}
