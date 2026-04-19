package com.smartwallet.watchlist.web

import com.smartwallet.watchlist.repository.WatchlistRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
class WatchlistControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var watchlistRepo: WatchlistRepository

    @BeforeEach
    fun setup() {
        watchlistRepo.deleteAll()
    }

    @Test
    fun `should create watchlist and add favorite`() {
        mockMvc.post("/api/watchlist") {
            header("X-User-Id", "77")
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Tech"}"""
        }.andExpect { status { isOk() } }

        mockMvc.post("/api/watchlist/favorite/PETR4") {
            header("X-User-Id", "77")
        }.andExpect { status { isOk() } }

        mockMvc.get("/api/watchlist/favorites") {
            header("X-User-Id", "77")
        }.andExpect { status { isOk() } }
    }
}
