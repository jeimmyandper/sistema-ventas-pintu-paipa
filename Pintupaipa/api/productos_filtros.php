<?php
require __DIR__ . "/config.php";
exigirLogin();

function distinctVals($conn, $col) {
  $vals = [];
  $sql = "SELECT DISTINCT $col AS v FROM productos WHERE $col IS NOT NULL AND $col <> '' ORDER BY v ASC";
  $res = $conn->query($sql);
  while ($row = $res->fetch_assoc()) $vals[] = $row["v"];
  return $vals;
}

echo json_encode([
  "ok" => true,
  "categorias" => distinctVals($conn, "categoria"),
  "tamanos" => distinctVals($conn, "tamano"),
  "colores" => distinctVals($conn, "color"),
]);
