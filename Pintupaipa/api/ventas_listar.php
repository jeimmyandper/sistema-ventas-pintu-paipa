<?php
require __DIR__ . "/config.php";
exigirLogin();

$desde = $_GET["desde"] ?? "";
$hasta = $_GET["hasta"] ?? "";

/*
  Si desde/hasta vienen vacíos, listamos las últimas 50.
  Si vienen, filtramos por rango de fechas (created_at).
*/

$where = [];
$params = [];
$types = "";

if ($desde !== "") {
  $where[] = "v.created_at >= ?";
  $params[] = $desde . " 00:00:00";
  $types .= "s";
}
if ($hasta !== "") {
  $where[] = "v.created_at <= ?";
  $params[] = $hasta . " 23:59:59";
  $types .= "s";
}

$sql = "
SELECT 
  v.id,
  DATE_FORMAT(v.created_at, '%Y-%m-%d %H:%i') AS fecha,
  CONCAT(c.nombre, ' (', c.cedula, ')') AS cliente,
  v.total,
  v.estado
FROM ventas v
JOIN clientes c ON c.id = v.cliente_id
" . (count($where) ? ("WHERE " . implode(" AND ", $where)) : "") . "
ORDER BY v.id DESC
LIMIT 200
";

$stmt = $conn->prepare($sql);
if ($types !== "") $stmt->bind_param($types, ...$params);
$stmt->execute();
$res = $stmt->get_result();

$ventas = [];
while ($row = $res->fetch_assoc()) {
  $ventas[] = [
    "id" => (int)$row["id"],
    "fecha" => $row["fecha"],
    "cliente" => $row["cliente"],
    "total" => (float)$row["total"],
    "estado" => $row["estado"],
  ];
}

/* ✅ totalGeneral SOLO ACTIVA */
$sqlTotal = "
SELECT COALESCE(SUM(total),0) AS totalGeneral
FROM ventas v
" . (count($where) ? ("WHERE " . implode(" AND ", $where) . " AND v.estado='ACTIVA'") : "WHERE v.estado='ACTIVA'")
;

$stmt2 = $conn->prepare($sqlTotal);
if ($types !== "") $stmt2->bind_param($types, ...$params);
$stmt2->execute();
$row2 = $stmt2->get_result()->fetch_assoc();

echo json_encode([
  "ok" => true,
  "ventas" => $ventas,
  "totalGeneral" => (float)$row2["totalGeneral"]
]);
