USE cadeira_rodas;

CREATE TABLE movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comando VARCHAR(50) NOT NULL,
    velocidade INT,
    direcao VARCHAR(50),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modo_operacao VARCHAR(50),
    velocidade_maxima INT,
    bateria_nivel INT
);