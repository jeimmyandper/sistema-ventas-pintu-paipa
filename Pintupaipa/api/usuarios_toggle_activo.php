<?php
require __DIR__ . "/config.php";
exigirLogin();
exigirRol("ADMIN");

$body = leerJSON();
$id = (int)($body["id"] ?? 0);
$activo = (int)($body["activo"] ?? 0);

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"ID requerido"]);
  exit;
}
$activo = $activo === 1 ? 1 : 0;

// (opcional) evitar desactivar el mismo admin logueado
$yo = (int)($_SESSION["usuario"]["id"] ?? 0);
if ($id === $yo && $activo === 0) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"No puedes desactivarte a ti misma"]);
  exit;
}

$stmt = $conn->prepare("UPDATE usuarios SET activo=? WHERE id=?");
$stmt->bind_param("ii", $activo, $id);
$ok = $stmt->execute();

echo json_encode(["ok"=>$ok]);
