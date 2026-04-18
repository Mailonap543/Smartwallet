package com.smartwallet.notification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = Notification.builder()
                .id(1L)
                .userId(1L)
                .type(NotificationType.MARKET_PRICE)
                .title("Test Alert")
                .message("Test message")
                .isRead(false)
                .build();
    }

    @Test
    void createNotification_ShouldCreateSuccessfully() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        Notification result = notificationService.createNotification(
                1L,
                NotificationType.MARKET_PRICE,
                "Test Alert",
                "Test message",
                Map.of("key", "value")
        );

        assertNotNull(result);
        assertEquals(NotificationType.MARKET_PRICE, result.getType());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getUserNotifications_ShouldReturnNotifications() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(testNotification));

        List<Notification> result = notificationService.getUserNotifications(1L);

        assertEquals(1, result.size());
        assertEquals(NotificationType.MARKET_PRICE, result.get(0).getType());
    }

    @Test
    void markAsRead_ShouldMarkNotificationAsRead() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        assertDoesNotThrow(() -> notificationService.markAsRead(1L, 1L));

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void markAsRead_WrongUser_ShouldThrowException() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        assertThrows(IllegalArgumentException.class, () -> 
                notificationService.markAsRead(999L, 1L));
    }

    @Test
    void markAllAsRead_ShouldMarkAllAsRead() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.markAllAsRead(1L);

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void deleteNotification_ShouldDeleteSuccessfully() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        assertDoesNotThrow(() -> notificationService.deleteNotification(1L, 1L));

        verify(notificationRepository).delete(testNotification);
    }

    @Test
    void deleteNotification_WrongUser_ShouldThrowException() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        assertThrows(IllegalArgumentException.class, () -> 
                notificationService.deleteNotification(999L, 1L));
    }

    @Test
    void getUnreadCount_ShouldReturnCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        long count = notificationService.getUnreadCount(1L);

        assertEquals(5, count);
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
                )));
    }
}