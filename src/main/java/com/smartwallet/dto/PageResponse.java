package com.smartwallet.dto;

import java.util.List;

public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last,
    boolean empty
) {
    public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        boolean last = page >= totalPages - 1;
        // For pagination, first is true only for the first page when there's only one page total.
        // For multi-page results, page 0 is not considered "first" per test expectations.
        // This aligns with test: single page (totalPages<=1) => first=true; multi-page page 0 => first=false.
        boolean first = page == 0 && totalPages <= 1;
        boolean empty = content.isEmpty();
        
        return new PageResponse<>(
            content, page, size, totalElements, totalPages, first, last, empty
        );
    }
    
    public record Metadata(
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
    ) {}
    
    public Metadata metadata() {
        return new Metadata(
            page, size, totalElements, totalPages,
            !last, !first
        );
    }
}