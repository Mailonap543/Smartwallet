package com.smartwallet;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwallet.entity.User;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.security.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@TestExecutionListeners(
    listeners = DependencyInjectionTestExecutionListener.class,
    mergeMode = TestExecutionListeners.MergeMode.REPLACE_DEFAULTS
)
class PortfolioControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void createWallet_authenticated_ReturnsWallet() throws Exception {
        CustomUserDetails user = createAuthenticatedUser();

        mockMvc.perform(post("/api/portfolio/wallets")
                .with(request -> {
                    authenticate(user);
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Carteira Principal"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").isNumber())
            .andExpect(jsonPath("$.data.name").value("Carteira Principal"));
    }

    @Test
    void addAsset_authenticated_RecalculatesTotals() throws Exception {
        CustomUserDetails user = createAuthenticatedUser();
        long walletId = createWallet(user);

        JsonNode asset = addAsset(user, walletId, "PETR4", "Petrobras", "STOCK", "10", "30.00", "31.00");

        assertThat(asset.path("symbol").asText()).isEqualTo("PETR4");
        assertDecimal(asset.path("totalInvested"), "300.00");
        assertDecimal(asset.path("currentValue"), "310.00");
        assertDecimal(asset.path("profitLoss"), "10.00");
    }

    @Test
    void updateAsset_authenticated_UpdatesFieldsAndTotals() throws Exception {
        CustomUserDetails user = createAuthenticatedUser();
        long walletId = createWallet(user);
        long assetId = addAsset(user, walletId, "PETR4", "Petrobras", "STOCK", "10", "30.00", "31.00")
                .path("id")
                .asLong();

        String response = mockMvc.perform(put("/api/portfolio/assets/{assetId}", assetId)
                .with(request -> {
                    authenticate(user);
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "symbol": "VALE3",
                      "name": "Vale",
                      "assetType": "STOCK",
                      "quantity": 5,
                      "purchasePrice": 60.00,
                      "currentPrice": 65.00,
                      "purchaseDate": "2026-05-21"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.symbol").value("VALE3"))
            .andExpect(jsonPath("$.data.name").value("Vale"))
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode asset = objectMapper.readTree(response).path("data");
        assertDecimal(asset.path("totalInvested"), "300.00");
        assertDecimal(asset.path("currentValue"), "325.00");
        assertDecimal(asset.path("profitLoss"), "25.00");
    }

    private long createWallet(CustomUserDetails user) throws Exception {
        String response = mockMvc.perform(post("/api/portfolio/wallets")
                .with(request -> {
                    authenticate(user);
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Carteira Teste"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private JsonNode addAsset(
            CustomUserDetails user,
            long walletId,
            String symbol,
            String name,
            String assetType,
            String quantity,
            String purchasePrice,
            String currentPrice) throws Exception {
        String response = mockMvc.perform(post("/api/portfolio/wallets/{walletId}/assets", walletId)
                .with(request -> {
                    authenticate(user);
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "symbol": "%s",
                      "name": "%s",
                      "assetType": "%s",
                      "quantity": %s,
                      "purchasePrice": %s,
                      "currentPrice": %s,
                      "purchaseDate": "2026-05-21"
                    }
                    """.formatted(symbol, name, assetType, quantity, purchasePrice, currentPrice)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        return objectMapper.readTree(response).path("data");
    }

    private CustomUserDetails createAuthenticatedUser() {
        long suffix = Math.abs(System.nanoTime());
        User user = User.builder()
                .email("portfolio-%d@example.com".formatted(suffix))
                .passwordHash("not-used-in-this-test")
                .fullName("Portfolio User")
                .cpf("%011d".formatted(suffix % 100_000_000_000L))
                .phone("11999999999")
                .role("USER")
                .isActive(true)
                .emailVerified(true)
                .build();
        userRepository.saveAndFlush(user);
        return new CustomUserDetails(user);
    }

    private void authenticate(CustomUserDetails user) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        SecurityContextHolder.setContext(context);
    }

    private void assertDecimal(JsonNode value, String expected) {
        assertThat(value.decimalValue()).isEqualByComparingTo(new BigDecimal(expected));
    }
}
