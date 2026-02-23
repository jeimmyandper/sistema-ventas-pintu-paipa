<?php
require __DIR__ . "/config.php";
exigirLogin();
exigirRol("ADMIN");

$res = $conn->query("SELECT id, nombre, cedula, rol, activo FROM usuarios ORDER BY id DESC");
$usuarios = [];
while ($row = $res->fetch_assoc()) $usuarios[] = $row;

echo json_encode(["ok"=>true, "usuarios"=>$usuarios]);
