package com.smartwallet.subscription.dto;

import com.smartwallet.bank.dto.BankDtos;

import java.math.BigDecimal;

public record PlanCheckoutResponse(
        PlanCatalogResponse plan,
        BankDtos.PaymentResponse payment,
        String billingCycle,
        BigDecimal amount
) {}
