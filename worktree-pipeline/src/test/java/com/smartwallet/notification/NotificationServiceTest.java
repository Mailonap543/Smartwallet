package com.smartwallet.notification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void createNotification_ShouldCreateSuccessfully() {
        assertDoesNotThrow(() -> 
            notificationService.createNotification(
                1L, 
                NotificationType.MARKET_PRICE, 
                "Test Alert", 
                "Test message",
                Map.of("key", "value")
            )
        );
    }

    @Test
    void markAsRead_ShouldWork() {
        assertDoesNotThrow(() -> 
            notificationService.markAsRead(1L, 1L)
        );
    }

    @Test
    void markAllAsRead_ShouldWork() {
        assertDoesNotThrow(() -> 
            notificationService.markAllAsRead(1L)
        );
    }

    @Test
    void deleteNotification_ShouldWork() {
        assertDoesNotThrow(() -> 
            notificationService.deleteNotification(1L, 1L)
        );
    }

    @Test
    void getUnreadCount_ShouldReturnZero() {
        long count = notificationService.getUnreadCount(1L);
        assertEquals(0, count);
    }

    @Test
    void getPreferences_ShouldReturnDefaults() {
        var prefs = notificationService.getPreferences(1L);
        
        assertNotNull(prefs);
        assertTrue(prefs.containsKey("marketAlerts"));
        assertTrue(prefs.containsKey("riskAlerts"));
    }

    @Test
    void updatePreferences_ShouldWork() {
        assertDoesNotThrow(() -> 
            notificationService.updatePreferences(1L, Map.of(
                "marketAlerts", false,
                "riskAlerts", true
            ))
        );
    }
}