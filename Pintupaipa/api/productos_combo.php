<?php
require __DIR__ . "/config.php";
exigirLogin();

$sql = "SELECT id, nombre, tamano, color, precio, stock FROM productos ORDER BY nombre ASC";
$res = $conn->query($sql);

$productos = [];
while ($row = $res->fetch_assoc()) {
  $productos[] = [
    "id" => (int)$row["id"],
    "nombre" => $row["nombre"],
    "tamano" => $row["tamano"],
    "color" => $row["color"],
    "precio" => (float)$row["precio"],
    "stock" => (int)$row["stock"],
  ];
}

echo json_encode(["ok"=>true, "productos"=>$productos]);
