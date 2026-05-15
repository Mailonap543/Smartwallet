package com.smartwallet.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.data.redis.core.RedisTemplate

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
        val entityManager = mock(jakarta.persistence.EntityManager::class.java)
        whenever(entityManager.createNativeQuery("SELECT 1").getSingleResult()).thenReturn(1)
        
        healthService = HealthService(entityManager, redisTemplate)
        
        val result = healthService.checkDatabase()
        
        assertEquals("UP", result["status"])
        assertTrue(result.containsKey("details"))
    }

    @Test
    fun `checkDatabase returns DOWN status on failure`() {
        val entityManager = mock(jakarta.persistence.EntityManager::class.java)
        whenever(entityManager.createNativeQuery("SELECT 1").getSingleResult()).thenThrow(RuntimeException("Connection failed"))
        
        healthService = HealthService(entityManager, redisTemplate)
        
        val result = healthService.checkDatabase()
        
        assertEquals("DOWN", result["status"])
    }

    @Test
    fun `checkExternalApi makes real HTTP call to AI service`() {
        val entityManager = mock(jakarta.persistence.EntityManager::class.java)
        whenever(entityManager.createNativeQuery("SELECT 1").getSingleResult()).thenReturn(1)
        
        healthService = HealthService(entityManager, redisTemplate)
        
        val result = healthService.checkExternalApi()
        
        assertTrue(result.containsKey("aiService"))
        assertTrue(result.containsKey("status"))
    }

    @Test
    fun `checkReadiness returns readiness status`() {
        val entityManager = mock(jakarta.persistence.EntityManager::class.java)
        whenever(entityManager.createNativeQuery("SELECT 1").getSingleResult()).thenReturn(1)
        
        val redisConnection = mock(org.springframework.data.redis.connection.RedisConnection::class.java)
        val redisConnectionFactory = mock(org.springframework.data.redis.connection.RedisConnectionFactory::class.java)
        
        whenever(redisTemplate.getConnectionFactory()).thenReturn(redisConnectionFactory)
        whenever(redisConnectionFactory.getConnection()).thenReturn(redisConnection)
        whenever(redisConnection.ping()).thenReturn("PONG")
        
        healthService = HealthService(entityManager, redisTemplate)
        
        val result = healthService.checkReadiness()
        
        assertTrue(result.containsKey("ready"))
        assertTrue(result.containsKey("database"))
        assertTrue(result.containsKey("cache"))
        assertTrue(result.containsKey("timestamp"))
    }
}