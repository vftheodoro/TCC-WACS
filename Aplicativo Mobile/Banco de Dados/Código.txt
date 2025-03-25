-- Cria o banco de dados e seleciona-o
CREATE DATABASE cadeira_db;
USE cadeira_db;

-- Tabela de Usuários (cadeirante e cuidador)
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('cadeirante', 'cuidador') NOT NULL
);

-- Tabela para armazenar comandos enviados
CREATE TABLE Comandos (
    id_comando INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    comando VARCHAR(50) NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente','executado') DEFAULT 'pendente',
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
