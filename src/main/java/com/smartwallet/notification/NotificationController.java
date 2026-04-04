package com.smartwallet.notification;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<Map<String, Object>> notifications = notificationService.getNotifications(
            user.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        
        notificationService.markAsRead(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notificação marcada como lida"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Todas notificações marcadas como lidas"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        
        notificationService.deleteNotification(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notificação removida"));
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPreferences(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        Map<String, Object> prefs = notificationService.getPreferences(user.getId());
        return ResponseEntity.ok(ApiResponse.success(prefs));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<String>> updatePreferences(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody Map<String, Boolean> preferences) {
        
        notificationService.updatePreferences(user.getId(), preferences);
        return ResponseEntity.ok(ApiResponse.success("Preferências atualizadas"));
    }
}