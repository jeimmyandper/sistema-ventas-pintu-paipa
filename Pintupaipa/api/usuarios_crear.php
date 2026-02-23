<?php
require __DIR__ . "/config.php";
exigirLogin();
exigirRol("ADMIN");

$body = leerJSON();
$nombre = trim((string)($body["nombre"] ?? ""));
$cedula = trim((string)($body["cedula"] ?? ""));
$rol = strtoupper(trim((string)($body["rol"] ?? "EMPLEADO")));
$password = (string)($body["password"] ?? "");

if ($nombre === "" || $cedula === "" || $password === "") {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"Faltan datos"]);
  exit;
}
if (strlen($password) < 6) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"Contraseña muy corta"]);
  exit;
}
if (!in_array($rol, ["ADMIN","EMPLEADO"], true)) $rol = "EMPLEADO";

$stmt = $conn->prepare("SELECT id FROM usuarios WHERE cedula=? LIMIT 1");
$stmt->bind_param("s", $cedula);
$stmt->execute();
if ($stmt->get_result()->fetch_assoc()) {
  http_response_code(409);
  echo json_encode(["ok"=>false, "mensaje"=>"Esa cédula ya existe"]);
  exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$activo = 1;

$stmt = $conn->prepare("INSERT INTO usuarios (nombre, cedula, password_hash, rol, activo) VALUES (?,?,?,?,?)");
$stmt->bind_param("ssssi", $nombre, $cedula, $hash, $rol, $activo);
$ok = $stmt->execute();

echo json_encode(["ok"=>$ok, "id"=>$conn->insert_id]);
