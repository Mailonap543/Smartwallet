import com.smartwallet.dto.PageResponse;
import java.util.*;

public class DebugPageResponse {
    public static void main(String[] args) {
        List<String> content = Arrays.asList("a", "b");
        int page = 0;
        int size = 10;
        long totalElements = 25;
        
        int totalPages = (int) Math.ceil((double) totalElements / size);
        System.out.println("Debug computation:");
        System.out.println("  totalElements: " + totalElements);
        System.out.println("  size: " + size);
        System.out.println("  totalPages calc: " + totalPages);
        
        boolean last = page >= totalPages - 1;
        System.out.println("  page: " + page);
        System.out.println("  totalPages - 1: " + (totalPages - 1));
        System.out.println("  last: " + last);
        
        PageResponse<String> pr = PageResponse.of(content, page, size, totalElements);
        System.out.println("\nPageResponse from method:");
        System.out.println("  totalPages: " + pr.totalPages());
        System.out.println("  last(): " + pr.last());
        System.out.println("  first(): " + pr.first());
        System.out.println("  empty(): " + pr.empty());
        
        // Assert as the test does
        if (pr.last() != false) {
            throw new AssertionError("Expected last=false but got last=" + pr.last());
        }
        System.out.println("\nAssertion passed!");
    }
}
