package com.smartwallet;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class SmartwalletApplicationTests {

    @Test
    void contextLoads() {
        assertTrue(true, "Contexto Spring carregado com sucesso");
    }
}
