<?php
require __DIR__ . "/config.php";
exigirAdmin();

$body = leerJSON();

$nombre = trim((string)($body["nombre"] ?? ""));
$categoria = trim((string)($body["categoria"] ?? ""));
$tamano = trim((string)($body["tamano"] ?? ""));
$color = trim((string)($body["color"] ?? ""));
$precio = (float)($body["precio"] ?? 0);
$stock = (int)($body["stock"] ?? 0);

if ($nombre === "") {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"Nombre requerido"]);
  exit;
}

$stmt = $conn->prepare("INSERT INTO productos (nombre, categoria, tamano, color, precio, stock) VALUES (?,?,?,?,?,?)");
$stmt->bind_param("ssssdi", $nombre, $categoria, $tamano, $color, $precio, $stock);
$stmt->execute();

echo json_encode(["ok"=>true, "mensaje"=>"Producto creado", "id"=>$conn->insert_id]);
