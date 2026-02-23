<?php
require __DIR__ . "/config.php";
exigirLogin();

$res = $conn->query("SELECT id, nombre, cedula FROM clientes ORDER BY nombre ASC");
$items = [];
while ($r = $res->fetch_assoc()) {
  $items[] = [
    "id" => (int)$r["id"],
    "nombre" => $r["nombre"],
    "cedula" => $r["cedula"]
  ];
}
echo json_encode(["ok"=>true, "clientes"=>$items]);
