package com.smartwallet.b3.service;

import com.smartwallet.b3.dto.B3Dtos.B3ApiDefinition;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class B3ApiCatalog {

    private static final String STANDBY = "STANDBY";
    private static final String BALCOES_E_FUNDOS = "Balcoes e fundos";
    private static final String RENDA_FIXA = "Renda fixa";
    private static final String CREDITO_PRIVADO = "Credito privado";
    private static final String BANCO_B3 = "Banco B3";
    private static final String B3_INVESTIDOR = "B3 Investidor";
    private static final String IMERCADO = "iMercado";

    private final List<B3ApiDefinition> apis = List.of(
        api("di", "DI", "DI.json", "Derivativos e juros"),
        api("cfa-deposito-retirada", "CFA - Operacoes de Deposito e Retirada", "CFA - Operações de Depósito e Retirada.json", BALCOES_E_FUNDOS),
        api("cdb-v2", "CDB", "CDB (1).json", RENDA_FIXA),
        api("ccb-plataforma-balcao", "CCB - Plataforma Balcao", "CCB - Plataforma Balcão.json", CREDITO_PRIVADO),
        api("ccb-nome-v2", "CCB - NoMe", "CCB - NoMe (1).json", CREDITO_PRIVADO),
        api("transfer", "Transfer", "Transfer.json", "Movimentacao"),
        api("rde-agenda", "RDE - Agenda", "RDE - Agenda.json", "Agenda e eventos"),
        api("plataforma-distribuicao-acompanhar-oferta", "Plataforma de Distribuicao - Acompanhar Oferta", "Plataforma de Distribuição - Acompanhar Oferta.json", "Ofertas"),
        api("lci", "LCI", "LCI.json", RENDA_FIXA),
        api("lca", "LCA", "LCA.json", RENDA_FIXA),
        api("custom-data", "Custom Data", "Custom Data.json", "Dados customizados"),
        api("positions", "Positions", "Positions.json", "Posicoes e custodia"),
        api("orders", "Orders", "Orders.json", "Ordens"),
        api("bonds", "Bonds", "Bonds.json", RENDA_FIXA),
        api("collateral-v2", "Collateral", "Collateral (1).json", "Garantias"),
        api("collateral", "Collateral", "Collateral.json", "Garantias"),
        api("conciliacao-ccb", "Conciliacao de CCB", "Conciliação de CCB.json", "Conciliacao"),
        api("cff-deposito-retirada", "CFF - Operacoes de Deposito e Retirada", "CFF - Operações de Depósito e Retirada.json", BALCOES_E_FUNDOS),
        api("cdb", "CDB", "CDB.json", RENDA_FIXA),
        api("cfa-operacoes", "CFA - Operacoes", "CFA - Operações.json", BALCOES_E_FUNDOS),
        api("ccb-nome", "CCB - NoMe", "CCB - NoMe.json", CREDITO_PRIVADO),
        api("block-incorporadora-mapa-vendas", "Block - Incorporadora Mapa de Vendas", "Block - Incorporadora Mapa de Vendas.json", "Imobiliario"),
        api("banco-b3-custodia-v2", "Banco B3 - API de Custodia", "Banco B3 - API de Custódia (1).json", BANCO_B3),
        api("b3-investidor-oferta-publica", "B3 Investidor - Oferta Publica", "B3 Investidor - Oferta Publica.json", B3_INVESTIDOR),
        api("b3-investidor-negociacao-ativos", "B3 Investidor - Negociacao de Ativos", "B3 Investidor - Negociação de Ativos.json", B3_INVESTIDOR),
        api("b3-investidor-pacote-acesso", "B3 Investidor - Pacote de Acesso", "B3 Investidor - Pacote de Acesso..json", B3_INVESTIDOR),
        api("b3-investidor-movimentacao", "B3 Investidor - Movimentacao", "B3 Investidor - Movimentação.json", B3_INVESTIDOR),
        api("imercado-tarifacao", "B3 iMercado Tarifacao API", "B3 iMercado Tarifação - API - Desenvolvido em .NET 6.json", IMERCADO),
        api("arquivos-conciliacao", "Arquivos de Conciliacao", "Arquivos de Conciliação.json", "Conciliacao"),
        api("simulacao-calculo-risco", "APIs Simulacao Calculo de Risco", "APIs Simulação Cálculo de Risco.json", "Risco"),
        api("conciliacao-contas-vinculos", "API para conciliacao de dados de contas e vinculos de contas", "API para conciliação de dados de contas e vínculos de contas..json", "Contas"),
        api("cadastro-unificado-comitentes", "API para Cadastro Unificado de Comitentes", "API para Cadastro Unificado de Comitentes - Cadastro de Acesso e Derivativos com CCP..json", "Cadastro"),
        api("imercado-line-trading-clearing-rejeicoes", "API iMercado Line - Trading, Clearing e Rejeicoes", "API iMercado Line - Trading, Clearing e Rejeições .json", IMERCADO),
        api("imercado-hft-market-maker", "API iMercado - HFT and Market Maker Incentive Details", "API iMercado - HFT and Market Maker Incentive Details .json", IMERCADO),
        api("imercado-equities-fee-details", "API iMercado - Equities Fee Details", "API iMercado - Equities Fee Details.json", IMERCADO),
        api("imbarq-sastoken", "API do IMBARQ - Gerador SasToken", "API do IMBARQ - Gerador SasToken.json", "IMBARQ"),
        api("core-calculation", "API for CORE calculation", "API for CORE calculation.json", "Risco"),
        api("b3-investidor-cadastro-fintechs", "B3 Investidor - Cadastro Investidor Fintechs", "B3 Investidor - Cadastro Investidor Fintechs.json", B3_INVESTIDOR),
        api("b3-investidor-autorizacao-fintech", "B3 Investidor - Autorizacao Fintech", "B3 Investidor - Autorização Fintech.json", B3_INVESTIDOR),
        api("b3-investidor-api-guia", "B3 Investidor - API Guia", "B3 Investidor - API Guia.json", B3_INVESTIDOR),
        api("banco-b3-liquidacao", "Banco B3 - API de Liquidacao", "Banco B3 - API de Liquidação.json", BANCO_B3),
        api("banco-b3-custodia", "Banco B3 - API de Custodia", "Banco B3 - API de Custódia.json", BANCO_B3)
    );

    public List<B3ApiDefinition> list() {
        return apis;
    }

    public Optional<B3ApiDefinition> find(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return apis.stream()
            .filter(api -> api.id().equalsIgnoreCase(id.trim()))
            .findFirst();
    }

    public boolean exists(String id) {
        return find(id).isPresent();
    }

    private static B3ApiDefinition api(String id, String name, String fileName, String category) {
        return new B3ApiDefinition(id, name, fileName, category, STANDBY);
    }
}
