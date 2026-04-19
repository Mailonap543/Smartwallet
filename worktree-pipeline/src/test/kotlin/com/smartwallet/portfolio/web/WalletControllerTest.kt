package com.smartwallet.portfolio.web

import com.smartwallet.portfolio.model.Wallet
import com.smartwallet.portfolio.repository.WalletRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.nio.charset.StandardCharsets

@SpringBootTest
@AutoConfigureMockMvc
class WalletControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var walletRepo: WalletRepository

    @BeforeEach
    fun setup() {
        walletRepo.deleteAll()
    }

    @Test
    fun `should create and list wallets`() {
        mockMvc.post("/api/wallets") {
            header("X-User-Id", "99")
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Minha Carteira","description":"teste"}""".toByteArray(StandardCharsets.UTF_8)
        }.andExpect {
            status { isOk() }
        }

        mockMvc.get("/api/wallets") {
            header("X-User-Id", "99")
        }.andExpect {
            status { isOk() }
            content { contentType(MediaType.APPLICATION_JSON) }
        }
    }
}
