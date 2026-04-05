package com.smartwallet.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PageResponseTest {

    @Test
    void of_ShouldCreatePageResponse() {
        List<String> content = List.of("a", "b", "c");
        
        var page = PageResponse.of(content, 0, 10, 3);
        
        assertNotNull(page);
        assertEquals(3, page.totalElements());
        assertEquals(1, page.totalPages());
        assertTrue(page.first());
        assertTrue(page.last());
    }

    @Test
    void of_ShouldHandleMultiplePages() {
        List<String> content = List.of("a", "b");
        
        var page = PageResponse.of(content, 0, 10, 25);
        
        assertFalse(page.last());
        assertFalse(page.first());
        assertEquals(3, page.totalPages());
    }

    @Test
    void of_ShouldHandleEmptyContent() {
        var page = PageResponse.of(List.of(), 0, 10, 0);
        
        assertTrue(page.empty());
        assertTrue(page.first());
        assertTrue(page.last());
    }

    @Test
    void metadata_ShouldReturnCorrectData() {
        var page = PageResponse.of(List.of("a"), 0, 10, 15);
        
        var metadata = page.metadata();
        
        assertNotNull(metadata);
        assertEquals(0, metadata.page());
        assertEquals(10, metadata.size());
        assertTrue(metadata.hasNext());
    }
}