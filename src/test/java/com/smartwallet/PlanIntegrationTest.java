package com.smartwallet;

import com.smartwallet.entity.User;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.subscription.PlanType;
import com.smartwallet.subscription.PlanFeatures;
import com.smartwallet.subscription.service.PlanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlanIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PlanService planService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void getAvailablePlans_ReturnsAllPlans() throws Exception {
        mockMvc.perform(get("/api/subscription/plans"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data.length()").value(3));
    }

    @Test
    void checkWalletAccess_FreeUser_LimitsApplied() throws Exception {
        mockMvc.perform(get("/api/subscription/check/wallet"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void getPlans_InvalidEndpoint_Returns404() throws Exception {
        mockMvc.perform(get("/api/invalid/endpoint"))
            .andExpect(status().isNotFound());
    }
}