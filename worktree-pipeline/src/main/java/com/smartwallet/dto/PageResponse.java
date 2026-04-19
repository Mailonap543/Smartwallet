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
        boolean first = page == 0;
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