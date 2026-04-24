package com.smartwallet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpoint_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk());
    }

    @Test
    void invalidEndpoint_Returns404() throws Exception {
        mockMvc.perform(get("/api/invalid/endpoint"))
            .andExpect(status().isNotFound());
    }

    @Test
    void authLogin_WithInvalidCredentials_Returns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"invalid@example.com\",\"password\":\"wrong\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void subscriptionPlans_WithoutAuth_Returns200() throws Exception {
        mockMvc.perform(get("/api/subscription/plans"))
            .andExpect(status().isOk());
    }

    @Test
    void marketQuote_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/market/quote/PETR4"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void notifications_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/notifications"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void paymentStatus_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/payment/status"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void rootEndpoint_Returns404() throws Exception {
        mockMvc.perform(get("/"))
            .andExpect(status().isNotFound());
    }
}
