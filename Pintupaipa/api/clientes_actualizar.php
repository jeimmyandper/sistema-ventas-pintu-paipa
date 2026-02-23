<?php
require __DIR__ . "/config.php";
exigirLogin();

$body = leerJSON();

$id = (int)($body["id"] ?? 0);
$nombre = trim((string)($body["nombre"] ?? ""));
$cedula = trim((string)($body["cedula"] ?? ""));
$direccion = trim((string)($body["direccion"] ?? ""));
$correo = trim((string)($body["correo"] ?? ""));
$telefono = trim((string)($body["telefono"] ?? ""));

if ($id <= 0 || $nombre === "" || $cedula === "") {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"Datos inválidos"]);
  exit;
}

$stmt = $conn->prepare("UPDATE clientes SET nombre=?, cedula=?, direccion=?, correo=?, telefono=? WHERE id=?");
$stmt->bind_param("sssssi", $nombre, $cedula, $direccion, $correo, $telefono, $id);

if (!$stmt->execute()) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"No se pudo actualizar (¿cédula repetida?)"]);
  exit;
}

echo json_encode(["ok"=>true, "mensaje"=>"Cliente actualizado"]);
