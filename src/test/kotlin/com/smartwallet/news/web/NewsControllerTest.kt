package com.smartwallet.news.web

import com.smartwallet.news.repository.NewsRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class NewsControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var newsRepo: NewsRepository

    @BeforeEach
    fun setup() {
        newsRepo.deleteAll()
    }

    @Test
    fun `should list news`() {
        mockMvc.get("/api/v1/news") {
            header("X-User-Id", "1")
        }.andExpect {
            status { isOk() }
            content { contentType(MediaType.APPLICATION_JSON) }
        }
    }
}
