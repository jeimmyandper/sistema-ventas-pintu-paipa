<?php
require __DIR__ . "/config.php";
exigirLogin();

$venta_id = (int)($_GET["venta_id"] ?? $_GET["id"] ?? 0);

if ($venta_id <= 0) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "mensaje"=>"ID requerido"]);
  exit;
}

$sql = "
  SELECT
    vd.id,
    vd.venta_id,
    vd.producto_id,
    p.nombre,
    p.categoria,
    p.tamano,
    p.color,
    vd.cantidad,
    vd.precio_unitario,
    vd.subtotal
  FROM venta_detalle vd
  INNER JOIN productos p ON p.id = vd.producto_id
  WHERE vd.venta_id = ?
  ORDER BY vd.id ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $venta_id);
$stmt->execute();

$res = $stmt->get_result();
$items = [];

while ($row = $res->fetch_assoc()) {
  $items[] = $row;
}

echo json_encode(["ok"=>true, "items"=>$items]);
