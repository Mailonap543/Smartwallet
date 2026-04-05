package com.smartwallet.subscription;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PlanTypeTest {

    @Test
    void freePlan_HasCorrectLimits() {
        PlanType free = PlanType.FREE;
        
        assertEquals("Free", free.getDisplayName());
        assertEquals(0.0, free.getMonthlyPrice());
        assertEquals(5, free.getMaxWallets());
        assertEquals(10, free.getMaxAssets());
        assertFalse(free.hasAiAnalysis());
        assertFalse(free.hasRealTimePrices());
        assertFalse(free.hasBankIntegration());
    }

    @Test
    void premiumPlan_HasCorrectLimits() {
        PlanType premium = PlanType.PREMIUM;
        
        assertEquals("Premium", premium.getDisplayName());
        assertEquals(29.90, premium.getMonthlyPrice());
        assertTrue(premium.isUnlimited(premium.getMaxWallets()));
        assertTrue(premium.isUnlimited(premium.getMaxAssets()));
        assertTrue(premium.hasAiAnalysis());
        assertTrue(premium.hasRealTimePrices());
        assertTrue(premium.hasBankIntegration());
    }

    @Test
    void enterprisePlan_HasCorrectLimits() {
        PlanType enterprise = PlanType.ENTERPRISE;
        
        assertEquals("Enterprise", enterprise.getDisplayName());
        assertEquals(99.90, enterprise.getMonthlyPrice());
        assertTrue(enterprise.isUnlimited(enterprise.getMaxWallets()));
        assertTrue(enterprise.hasAdvancedReports());
    }

    @Test
    void fromString_ValidInput_ReturnsCorrectPlan() {
        assertEquals(PlanType.FREE, PlanType.fromString("FREE"));
        assertEquals(PlanType.PREMIUM, PlanType.fromString("PREMIUM"));
        assertEquals(PlanType.ENTERPRISE, PlanType.fromString("ENTERPRISE"));
    }

    @Test
    void fromString_InvalidInput_ReturnsFree() {
        assertEquals(PlanType.FREE, PlanType.fromString("INVALID"));
        assertEquals(PlanType.FREE, PlanType.fromString(""));
        assertEquals(PlanType.FREE, PlanType.fromString(null));
    }

    @Test
    void isUnlimited_ReturnsCorrectValue() {
        assertTrue(PlanType.PREMIUM.isUnlimited(-1));
        assertFalse(PlanType.FREE.isUnlimited(-1));
        assertFalse(PlanType.FREE.isUnlimited(5));
    }

    @Test
    void planFeatures_FreePlan_HasBasicFeatures() {
        var features = PlanFeatures.fromPlan(PlanType.FREE);
        
        assertEquals(PlanType.FREE, features.plan());
        assertEquals(3, features.availableFeatures().size());
        assertFalse(features.aiAnalysis());
    }

    @Test
    void planFeatures_PremiumPlan_HasAllFeatures() {
        var features = PlanFeatures.fromPlan(PlanType.PREMIUM);
        
        assertEquals(PlanType.PREMIUM, features.plan());
        assertTrue(features.aiAnalysis());
        assertTrue(features.realTimePrices());
        assertTrue(features.bankIntegration());
        assertTrue(features.advancedReports());
    }
}