package com.smartwallet.bank.service;

import static com.smartwallet.bank.dto.BankDtos.*;

import com.smartwallet.bank.entity.BankPaymentOrder;
import com.smartwallet.bank.repository.BankPaymentOrderRepository;
import com.smartwallet.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BankPaymentService {

    private final BankAggregatorService bankAggregatorService;
    private final BankPaymentOrderRepository paymentOrderRepository;

    @Transactional
    public PaymentResponse createPayment(Long userId, PaymentRequest request) {
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor do pagamento deve ser maior que zero", "INVALID_PAYMENT_AMOUNT");
        }

        Institution institution = bankAggregatorService.findInstitution(request.institutionId())
                .orElseThrow(() -> new BusinessException("Banco nao encontrado para pagamento", "BANK_NOT_FOUND"));

        if (!institution.paymentEnabled()) {
            throw new BusinessException("Este banco ainda nao esta habilitado para pagamentos", "BANK_PAYMENT_DISABLED");
        }

        String externalId = "PAY-" + UUID.randomUUID();
        String currency = request.currency() != null && !request.currency().isBlank() ? request.currency() : "BRL";
        String method = request.method() != null && !request.method().isBlank() ? request.method() : "PIX";
        String status = "APPROVED";
        LocalDateTime now = LocalDateTime.now();
        String checkoutUrl = "smartwallet://payments/" + externalId;
        String pixCopyPaste = buildPixCopyPaste(externalId, request.amount(), institution.name());

        BankPaymentOrder order = BankPaymentOrder.builder()
                .userId(userId)
                .institutionId(institution.id())
                .institutionName(institution.name())
                .amount(request.amount())
                .currency(currency)
                .paymentMethod(method)
                .status(status)
                .referenceType(request.referenceType())
                .referenceId(request.referenceId())
                .pixKey(request.pixKey())
                .beneficiaryName(request.beneficiaryName())
                .description(request.description())
                .externalId(externalId)
                .checkoutUrl(checkoutUrl)
                .pixCopyPaste(pixCopyPaste)
                .paidAt(now)
                .build();

        paymentOrderRepository.save(order);

        return new PaymentResponse(
                externalId,
                status,
                institution.id(),
                institution.name(),
                request.amount(),
                currency,
                method,
                checkoutUrl,
                pixCopyPaste,
                "Pagamento aprovado no ambiente Smartwallet",
                now
        );
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getUserPayments(Long userId) {
        return paymentOrderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private PaymentResponse toResponse(BankPaymentOrder order) {
        return new PaymentResponse(
                order.getExternalId(),
                order.getStatus(),
                order.getInstitutionId(),
                order.getInstitutionName(),
                order.getAmount(),
                order.getCurrency(),
                order.getPaymentMethod(),
                order.getCheckoutUrl(),
                order.getPixCopyPaste(),
                "Pagamento registrado",
                order.getCreatedAt()
        );
    }

    private String buildPixCopyPaste(String paymentId, BigDecimal amount, String institutionName) {
        return "00020126580014BR.GOV.BCB.PIX0136smartwallet-" + paymentId
                + "520400005303986540" + amount.setScale(2, java.math.RoundingMode.HALF_UP)
                + "5802BR5911Smartwallet6009Sao Paulo62170513" + institutionName.replace(" ", "").toUpperCase()
                + "6304SWLT";
    }
}
