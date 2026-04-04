package com.smartwallet.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertScheduler {

    private final NotificationService notificationService;
    private final EmailNotificationService emailService;
    private final Random random = new Random();

    @Scheduled(fixedRate = 60000)
    public void checkMarketAlerts() {
        log.debug("Checking market alerts...");
    }

    @Scheduled(cron = "0 0 9 * * MON")
    public void sendWeeklyReports() {
        log.info("Sending weekly reports...");
    }

    @Scheduled(fixedRate = 300000)
    public void checkRiskAlerts() {
        log.debug("Checking risk alerts...");
    }
}