<?php
require __DIR__ . "/config.php";
exigirLogin();

$q = trim($_GET["q"] ?? "");

$sql = "SELECT id, nombre, cedula, direccion, correo, telefono
        FROM clientes WHERE 1=1";
$types = "";
$params = [];

if ($q !== "") {
  $sql .= " AND (nombre LIKE ? OR cedula LIKE ? OR telefono LIKE ?)";
  $types = "sss";
  $like = "%$q%";
  $params = [$like, $like, $like];
}

$sql .= " ORDER BY id DESC";

$stmt = $conn->prepare($sql);
if ($types !== "") $stmt->bind_param($types, ...$params);
$stmt->execute();
$res = $stmt->get_result();

$clientes = [];
while ($row = $res->fetch_assoc()) {
  $clientes[] = [
    "id" => (int)$row["id"],
    "nombre" => $row["nombre"],
    "cedula" => $row["cedula"],
    "direccion" => $row["direccion"],
    "correo" => $row["correo"],
    "telefono" => $row["telefono"],
  ];
}

echo json_encode(["ok"=>true, "clientes"=>$clientes]);
