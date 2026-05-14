<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre   = filter_input(INPUT_POST, 'nombre', FILTER_SANITIZE_STRING);
    $email    = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $telefono = filter_input(INPUT_POST, 'telefono', FILTER_SANITIZE_STRING);
    $mensaje  = filter_input(INPUT_POST, 'mensaje', FILTER_SANITIZE_STRING);

    $errors = [];

    if (empty($nombre))  $errors[] = 'El nombre es obligatorio.';
    if (empty($email))   $errors[] = 'El email es obligatorio.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email inválido.';
    if (empty($mensaje)) $errors[] = 'El mensaje es obligatorio.';

    if (empty($errors)) {
        http_response_code(200);
        echo json_encode(['status' => 'ok', 'message' => 'Mensaje recibido correctamente.']);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    }
    exit;
}
?>