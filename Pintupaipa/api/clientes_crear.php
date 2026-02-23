<?php
require __DIR__ . "/config.php";
exigirLogin();

$body = leerJSON();

$nombre = trim((string)($body["nombre"] ?? ""));
$cedula = trim((string)($body["cedula"] ?? ""));
$direccion = trim((string)($body["direccion"] ?? ""));
$correo = trim((string)($body["correo"] ?? ""));
$telefono = trim((string)($body["telefono"] ?? ""));

if ($nombre === "" || $cedula === "") {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"Nombre y cédula son obligatorios"]);
  exit;
}

$stmt = $conn->prepare("INSERT INTO clientes (nombre, cedula, direccion, correo, telefono) VALUES (?,?,?,?,?)");
$stmt->bind_param("sssss", $nombre, $cedula, $direccion, $correo, $telefono);

if (!$stmt->execute()) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"No se pudo guardar (¿cédula repetida?)"]);
  exit;
}

echo json_encode(["ok"=>true, "mensaje"=>"Cliente creado", "id"=>$conn->insert_id]);
