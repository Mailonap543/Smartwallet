package com.smartwallet.subscription.dto;

public record PlanCheckoutRequest(
        String plan,
        String billingCycle,
        String institutionId
) {}
