<?php
// Setam header-ul pentru a indica faptul ca raspunsul este JSON
header('Content-Type: application/json');

// 1. Conectarea la baza de date (inlocuieste cu datele tale)
$servername = "";
$username = "";
$password = ""; // Pune parola ta de la MySQL daca ai una
$dbname = "pwa_app";

// Cream conexiunea
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificam conexiunea
if ($conn->connect_error) {
    // Trimitem un raspuns de eroare si oprim scriptul
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Eroare la conectare: ' . $conn->connect_error]);
    exit();
}

// 2. Preluam datele JSON trimise prin metoda POST
$json_data = file_get_contents('php://input');
$data = json_decode($json_data);

// Verificam daca datele sunt valide
if (empty($data) || !isset($data->continut) || trim($data->continut) === '') {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Date invalide. Continutul nu poate fi gol.']);
    exit();
}

// 3. Pregatim si executam interogarea SQL pentru a preveni SQL Injection
$stmt = $conn->prepare("INSERT INTO notite (continut) VALUES (?)");
// "s" inseamna ca parametrul este un string
$stmt->bind_param("s", $data->continut);

if ($stmt->execute()) {
    // Daca inserarea a reusit, trimitem un raspuns de succes
    echo json_encode(['status' => 'success', 'message' => 'Notita sincronizata cu succes.']);
} else {
    // Daca a esuat, trimitem un raspuns de eroare
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Eroare la salvarea notitei in baza de date.']);
}

// Inchidem conexiunile
$stmt->close();
$conn->close();

?>