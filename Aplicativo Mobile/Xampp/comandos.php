<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require "config.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    // Recebe dados do comando
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->id_usuario) || !isset($data->comando)) {
        echo json_encode(["error" => "Dados insuficientes"]);
        exit;
    }
    $id_usuario = $data->id_usuario;
    $comando = $data->comando;
    
    $stmt = $pdo->prepare("INSERT INTO Comandos (id_usuario, comando) VALUES (?, ?)");
    if($stmt->execute([$id_usuario, $comando])){
        echo json_encode(["message" => "Comando inserido com sucesso"]);
    } else {
        echo json_encode(["error" => "Falha ao inserir comando"]);
    }
    
} elseif ($method == 'GET') {
    // Retorna comandos pendentes para serem executados
    $stmt = $pdo->query("SELECT * FROM Comandos WHERE status='pendente' ORDER BY data_hora ASC");
    $comandos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($comandos);
} else {
    echo json_encode(["error" => "Método não suportado"]);
}
?>
