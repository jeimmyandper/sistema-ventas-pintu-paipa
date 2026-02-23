<?php
require __DIR__ . "/config.php";
exigirLogin();

$body = leerJSON();
$id = (int)($body["id"] ?? 0);

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"ID inválido"]);
  exit;
}

$stmt = $conn->prepare("DELETE FROM clientes WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

echo json_encode(["ok"=>true, "mensaje"=>"Cliente eliminado"]);
