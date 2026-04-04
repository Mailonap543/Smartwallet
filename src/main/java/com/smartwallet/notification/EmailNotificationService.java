package com.smartwallet.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@smartwallet.app}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Async
    public void sendNotificationEmail(String email, String title, String message) {
        if (!emailEnabled) {
            log.debug("Email disabled, skipping notification to {}", email);
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(email);
            mailMessage.setSubject(title);
            mailMessage.setText(message);
            mailMessage.setReplyTo(fromEmail);

            mailSender.send(mailMessage);
            log.info("Email sent to {}: {}", email, title);
        } catch (Exception e) {
            log.error("Failed to send email to {}", email, e);
        }
    }

    @Async
    public void sendMarketAlertEmail(String email, String symbol, 
                                     double currentPrice, double targetPrice) {
        String title = "Alerta de Preço - " + symbol;
        String message = String.format(
            "Olá,\n\n" +
            "O ativo %s atingiu o seu preço alvo!\n\n" +
            "Preço atual: R$ %.2f\n" +
            "Preço alvo: R$ %.2f\n\n" +
            "Acesse o SmartWallet para mais detalhes.\n\n" +
            "Atenciosamente,\n" +
            "Equipe SmartWallet",
            symbol, currentPrice, targetPrice
        );
        sendNotificationEmail(email, title, message);
    }

    @Async
    public void sendRiskAlertEmail(String email, String alertType, 
                                  double currentValue, double threshold) {
        String title = "Alerta de Risco - " + alertType;
        String message = String.format(
            "Olá,\n\n" +
            "Um alerta de risco foi acionado para sua carteira:\n\n" +
            "Tipo: %s\n" +
            "Valor atual: %.2f%%\n" +
            "Limite: %.2f%%\n\n" +
            "Considere revisar sua estratégia de investimentos.\n\n" +
            "Atenciosamente,\n" +
            "Equipe SmartWallet",
            alertType, currentValue, threshold
        );
        sendNotificationEmail(email, title, message);
    }

    @Async
    public void sendWeeklyReportEmail(String email, double totalValue, 
                                      double weeklyChange) {
        String title = "Seu Relatório Semanal - SmartWallet";
        String changeStr = weeklyChange >= 0 ? "+" : "";
        String message = String.format(
            "Olá,\n\n" +
            "Aqui está o resumo do seu portfólio esta semana:\n\n" +
            "Valor total: R$ %.2f\n" +
            "Variação: %s%.2f%%\n\n" +
            "Acesse o SmartWallet para ver o relatório completo.\n\n" +
            "Atenciosamente,\n" +
            "Equipe SmartWallet",
            totalValue, changeStr, weeklyChange
        );
        sendNotificationEmail(email, title, message);
    }

    @Async
    public void sendWelcomeEmail(String email, String name) {
        String title = "Bem-vindo ao SmartWallet!";
        String message = String.format(
            "Olá %s,\n\n" +
            "Bem-vindo ao SmartWallet!\n\n" +
            "Estamos felizes em tê-lo conosco. Comece a gerenciar " +
            "seu portfólio de investimentos de forma inteligente.\n\n" +
            "Comece agora mesmo em smartwallet.app\n\n" +
            "Atenciosamente,\n" +
            "Equipe SmartWallet",
            name
        );
        sendNotificationEmail(email, title, message);
    }

    @Async
    public void sendSubscriptionConfirmation(String email, String plan) {
        String title = "Plano atualizado - SmartWallet";
        String message = String.format(
            "Olá,\n\n" +
            "Sua assinatura foi atualizada com sucesso!\n\n" +
            "Plano: %s\n\n" +
            "Aproveite todas as funcionalidades premium.\n\n" +
            "Atenciosamente,\n" +
            "Equipe SmartWallet",
            plan
        );
        sendNotificationEmail(email, title, message);
    }
}