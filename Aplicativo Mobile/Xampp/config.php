<?php
// Configuração do banco de dados
$host = "localhost";
$db   = "cadeira_db";
$user = "root"; // Usuário padrão
$pass = "";     // Senha padrão (em XAMPP geralmente é vazia)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["error" => "Erro na conexão: " . $e->getMessage()]));
}
?>
