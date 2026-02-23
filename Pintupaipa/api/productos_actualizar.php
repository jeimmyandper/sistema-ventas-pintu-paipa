<?php
require __DIR__ . "/config.php";
exigirAdmin();

$body = leerJSON();

$id = (int)($body["id"] ?? 0);
$nombre = trim((string)($body["nombre"] ?? ""));
$categoria = trim((string)($body["categoria"] ?? ""));
$tamano = trim((string)($body["tamano"] ?? ""));
$color = trim((string)($body["color"] ?? ""));
$precio = (float)($body["precio"] ?? 0);
$stock = (int)($body["stock"] ?? 0);

if ($id <= 0 || $nombre === "") {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"Datos inválidos"]);
  exit;
}

$stmt = $conn->prepare("UPDATE productos SET nombre=?, categoria=?, tamano=?, color=?, precio=?, stock=? WHERE id=?");
$stmt->bind_param("ssssdii", $nombre, $categoria, $tamano, $color, $precio, $stock, $id);
$stmt->execute();

echo json_encode(["ok"=>true, "mensaje"=>"Producto actualizado"]);

