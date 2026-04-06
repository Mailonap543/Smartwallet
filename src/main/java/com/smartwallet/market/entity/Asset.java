package com.smartwallet.market.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets", indexes = {
    @Index(name = "idx_asset_symbol", columnList = "symbol"),
    @Index(name = "idx_asset_category", columnList = "category_id"),
    @Index(name = "idx_asset_isin", columnList = "isin")
})
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Column(name = "isin", unique = true)
    private String isin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private AssetCategory category;

    @Column(name = "segment")
    private String segment;

    @Column(name = "sub_segment")
    private String subSegment;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "website")
    private String website;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "current_price", precision = 19, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "previous_close", precision = 19, scale = 4)
    private BigDecimal previousClose;

    @Column(name = "change_percent", precision = 8, scale = 2)
    private BigDecimal changePercent;

    @Column(name = "day_high", precision = 19, scale = 4)
    private BigDecimal dayHigh;

    @Column(name = "day_low", precision = 19, scale = 4)
    private BigDecimal dayLow;

    @Column(name = "day_volume")
    private Long dayVolume;

    @Column(name = "market_cap", precision = 20, scale = 2)
    private BigDecimal marketCap;

    @Column(name = "price_to_earnings", precision = 10, scale = 2)
    private BigDecimal priceToEarnings;

    @Column(name = "price_to_book", precision = 10, scale = 2)
    private BigDecimal priceToBook;

    @Column(name = "dividend_yield", precision = 8, scale = 2)
    private BigDecimal dividendYield;

    @Column(name = "roe", precision = 8, scale = 2)
    private BigDecimal roe;

    @Column(name = "revenue", precision = 20, scale = 2)
    private BigDecimal revenue;

    @Column(name = "net_income", precision = 20, scale = 2)
    private BigDecimal netIncome;

    @Column(name = "total_debt", precision = 20, scale = 2)
    private BigDecimal totalDebt;

    @Column(name = "cash", precision = 20, scale = 2)
    private BigDecimal cash;

    @Column(name = "52w_high", precision = 19, scale = 4)
    private BigDecimal high52w;

    @Column(name = "52w_low", precision = 19, scale = 4)
    private BigDecimal low52w;

    @Column(name = "is_tracked")
    private Boolean isTracked = true;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "last_quote_at")
    private LocalDateTime lastQuoteAt;

    @Column(name = "data_source")
    private String dataSource;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIsin() { return isin; }
    public void setIsin(String isin) { this.isin = isin; }
    public AssetCategory getCategory() { return category; }
    public void setCategory(AssetCategory category) { this.category = category; }
    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }
    public String getSubSegment() { return subSegment; }
    public void setSubSegment(String subSegment) { this.subSegment = subSegment; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
    public BigDecimal getPreviousClose() { return previousClose; }
    public void setPreviousClose(BigDecimal previousClose) { this.previousClose = previousClose; }
    public BigDecimal getChangePercent() { return changePercent; }
    public void setChangePercent(BigDecimal changePercent) { this.changePercent = changePercent; }
    public BigDecimal getDayHigh() { return dayHigh; }
    public void setDayHigh(BigDecimal dayHigh) { this.dayHigh = dayHigh; }
    public BigDecimal getDayLow() { return dayLow; }
    public void setDayLow(BigDecimal dayLow) { this.dayLow = dayLow; }
    public Long getDayVolume() { return dayVolume; }
    public void setDayVolume(Long dayVolume) { this.dayVolume = dayVolume; }
    public BigDecimal getMarketCap() { return marketCap; }
    public void setMarketCap(BigDecimal marketCap) { this.marketCap = marketCap; }
    public BigDecimal getPriceToEarnings() { return priceToEarnings; }
    public void setPriceToEarnings(BigDecimal priceToEarnings) { this.priceToEarnings = priceToEarnings; }
    public BigDecimal getPriceToBook() { return priceToBook; }
    public void setPriceToBook(BigDecimal priceToBook) { this.priceToBook = priceToBook; }
    public BigDecimal getDividendYield() { return dividendYield; }
    public void setDividendYield(BigDecimal dividendYield) { this.dividendYield = dividendYield; }
    public BigDecimal getRoe() { return roe; }
    public void setRoe(BigDecimal roe) { this.roe = roe; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public BigDecimal getNetIncome() { return netIncome; }
    public void setNetIncome(BigDecimal netIncome) { this.netIncome = netIncome; }
    public BigDecimal getTotalDebt() { return totalDebt; }
    public void setTotalDebt(BigDecimal totalDebt) { this.totalDebt = totalDebt; }
    public BigDecimal getCash() { return cash; }
    public void setCash(BigDecimal cash) { this.cash = cash; }
    public BigDecimal getHigh52w() { return high52w; }
    public void setHigh52w(BigDecimal high52w) { this.high52w = high52w; }
    public BigDecimal getLow52w() { return low52w; }
    public void setLow52w(BigDecimal low52w) { this.low52w = low52w; }
    public Boolean getIsTracked() { return isTracked; }
    public void setIsTracked(Boolean isTracked) { this.isTracked = isTracked; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public LocalDateTime getLastQuoteAt() { return lastQuoteAt; }
    public void setLastQuoteAt(LocalDateTime lastQuoteAt) { this.lastQuoteAt = lastQuoteAt; }
    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}