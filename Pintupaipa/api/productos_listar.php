<?php
require __DIR__ . "/config.php";
exigirLogin();

$nombre   = trim($_GET["nombre"] ?? "");
$categoria= trim($_GET["categoria"] ?? "");
$tamano   = trim($_GET["tamano"] ?? "");
$color    = trim($_GET["color"] ?? "");

$sql = "SELECT id, nombre, categoria, tamano, color, precio, stock
        FROM productos WHERE 1=1";
$types = "";
$params = [];

if ($nombre !== "")    { $sql .= " AND nombre LIKE ?"; $types.="s"; $params[]="%$nombre%"; }
if ($categoria !== "") { $sql .= " AND categoria = ?";  $types.="s"; $params[]=$categoria; }
if ($tamano !== "")    { $sql .= " AND tamano = ?";     $types.="s"; $params[]=$tamano; }
if ($color !== "")     { $sql .= " AND color = ?";      $types.="s"; $params[]=$color; }

$sql .= " ORDER BY id DESC";

$stmt = $conn->prepare($sql);
if ($types !== "") $stmt->bind_param($types, ...$params);
$stmt->execute();
$res = $stmt->get_result();

$productos = [];
while ($row = $res->fetch_assoc()) {
  $productos[] = [
    "id" => (int)$row["id"],
    "nombre" => $row["nombre"],
    "categoria" => $row["categoria"],
    "tamano" => $row["tamano"],
    "color" => $row["color"],
    "precio" => (float)$row["precio"],
    "stock" => (int)$row["stock"],
  ];
}

echo json_encode(["ok"=>true, "productos"=>$productos]);
