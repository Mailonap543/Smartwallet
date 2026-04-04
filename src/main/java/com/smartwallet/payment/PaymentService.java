package com.smartwallet.payment;

import com.smartwallet.entity.User;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.subscription.PlanType;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.net.Webhook;
import com.stripe.param.*;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final UserRepository userRepository;

    @Value("${stripe.api-key:}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.success-url:http://localhost:4200/subscription/success}")
    private String successUrl;

    @Value("${stripe.cancel-url:http://localhost:4200/subscription/cancel}")
    private String cancelUrl;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final Map<PlanType, String> PRICE_IDS = new HashMap<>();

    @PostConstruct
    public void init() {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
            initializePriceIds();
        }
    }

    private void initializePriceIds() {
        PRICE_IDS.put(PlanType.FREE, null);
    }

    public String createCheckoutSession(Long userId, PlanType plan) throws StripeException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));

        if (plan == PlanType.FREE) {
            throw new BusinessException("Plano gratuito não requer pagamento", "INVALID_PLAN");
        }

        String priceId = PRICE_IDS.get(plan);
        if (priceId == null) {
            priceId = createOrGetPriceId(plan);
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomerEmail(user.getEmail())
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .setSubscriptionData(SessionCreateParams.SubscriptionData.builder()
                        .putMetadata("userId", userId.toString())
                        .putMetadata("plan", plan.name())
                        .build())
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPrice(priceId)
                        .setQuantity(1L)
                        .build())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    public String createPortalSession(Long userId) throws StripeException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));

        if (user.getStripeCustomerId() == null) {
            throw new BusinessException("Nenhuma assinatura ativa encontrada", "NO_SUBSCRIPTION");
        }

        BillingPortal.SessionCreateParams params = BillingPortal.SessionCreateParams.builder()
                .setCustomer(user.getStripeCustomerId())
                .setReturnUrl(baseUrl + "/subscription/my-plan")
                .build();

        BillingPortal.Session session = BillingPortal.Session.create(params);
        return session.getUrl();
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed", e);
            throw new BusinessException("Assinatura do webhook inválida", "INVALID_WEBHOOK");
        }

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(event);
            case "invoice.payment_failed" -> handlePaymentFailed(event);
            default -> log.info("Unhandled event type: {}", event.getType());
        }
    }

    private void handleCheckoutCompleted(Event event) {
        Session session = (Session) event.getDataObjectParse("checkout_session");
        String userId = session.getSubscription() != null ? 
                session.getSubscription() : session.getMetadata().get("userId");
        
        String customerId = session.getCustomer();
        String subscriptionId = session.getSubscription();

        if (userId != null) {
            try {
                Long id = Long.parseLong(userId);
                User user = userRepository.findById(id).orElse(null);
                if (user != null) {
                    if (customerId != null) user.setStripeCustomerId(customerId);
                    user.setStripeSubscriptionId(subscriptionId);
                    String planName = session.getMetadata().get("plan");
                    if (planName != null) {
                        PlanType plan = PlanType.fromString(planName);
                        user.setPlan(plan);
                        user.setPlanUpgradeDate(LocalDateTime.now());
                    }
                    userRepository.save(user);
                    log.info("Subscription activated for user {}", id);
                }
            } catch (NumberFormatException e) {
                log.error("Invalid userId in webhook: {}", userId);
            }
        }
    }

    private void handleSubscriptionUpdated(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectParse("subscription");
        String customerId = subscription.getCustomer();
        String status = subscription.getStatus();

        User user = userRepository.findByStripeCustomerId(customerId);
        if (user != null) {
            user.setStripeSubscriptionId(subscription.getId());
            if ("active".equals(status)) {
                String priceId = subscription.getItems().getData().get(0).getPrice().getId();
                PlanType plan = getPlanFromPriceId(priceId);
                if (plan != null) {
                    user.setPlan(plan);
                    user.setPlanUpgradeDate(LocalDateTime.now());
                }
            }
            userRepository.save(user);
            log.info("Subscription updated for user {}: status={}", user.getId(), status);
        }
    }

    private void handleSubscriptionDeleted(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectParse("subscription");
        String customerId = subscription.getCustomer();

        User user = userRepository.findByStripeCustomerId(customerId);
        if (user != null) {
            user.setStripeSubscriptionId(null);
            user.setPlan(PlanType.FREE);
            user.setPlanUpgradeDate(null);
            userRepository.save(user);
            log.info("Subscription cancelled for user {}", user.getId());
        }
    }

    private void handlePaymentFailed(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectParse("invoice");
        String customerId = invoice.getCustomer();
        String subscriptionId = invoice.getSubscription();

        User user = userRepository.findByStripeCustomerId(customerId);
        if (user != null) {
            log.warn("Payment failed for user {}. Subscription: {}", user.getId(), subscriptionId);
        }
    }

    private String createOrGetPriceId(PlanType plan) throws StripeException {
        return switch (plan) {
            case PREMIUM -> createPrice("Premium", 2990L, "BRL", "plan premium monthly");
            case ENTERPRISE -> createPrice("Enterprise", 9990L, "BRL", "plan enterprise monthly");
            default -> null;
        };
    }

    private String createPrice(String name, long amount, String currency, String productDescription) throws StripeException {
        Product product = Product.create(ProductCreateParams.builder()
                .setName(name)
                .setDescription(productDescription)
                .build());

        Price price = Price.create(PriceCreateParams.builder()
                .setProduct(product.getId())
                .setUnitAmount(amount)
                .setCurrency(currency)
                .setRecurring(PriceCreateParams.Recurring.builder()
                        .setInterval(PriceCreateParams.Recurring.Interval.MONTH)
                        .build())
                .build());

        PRICE_IDS.put(PlanType.valueOf(name.toUpperCase()), price.getId());
        return price.getId();
    }

    private PlanType getPlanFromPriceId(String priceId) {
        for (Map.Entry<PlanType, String> entry : PRICE_IDS.entrySet()) {
            if (priceId.equals(entry.getValue())) {
                return entry.getKey();
            }
        }
        return PlanType.FREE;
    }

    public Map<String, Object> getSubscriptionStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado", "USER_NOT_FOUND"));

        Map<String, Object> status = new HashMap<>();
        status.put("plan", user.getPlan().name());
        status.put("stripeCustomerId", user.getStripeCustomerId());
        status.put("stripeSubscriptionId", user.getStripeSubscriptionId());
        status.put("planUpgradeDate", user.getPlanUpgradeDate());

        if (user.getStripeSubscriptionId() != null && !user.getStripeSubscriptionId().isBlank()) {
            try {
                Subscription sub = Subscription.retrieve(user.getStripeSubscriptionId());
                status.put("status", sub.getStatus());
                status.put("currentPeriodEnd", sub.getCurrentPeriodEnd());
                status.put("cancelAtPeriodEnd", sub.getCancelAtPeriodEnd());
            } catch (StripeException e) {
                log.error("Error retrieving subscription", e);
                status.put("status", "error");
            }
        } else {
            status.put("status", "inactive");
        }

        return status;
    }
}