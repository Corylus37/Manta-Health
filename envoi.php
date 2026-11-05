<?php
/* MANTA – réception des formulaires du site (hébergement OVH, PHP 8).
   Reçoit un JSON {type, donnees} envoyé par envoi.js, vérifie, envoie un e-mail.
   Pour les demandes de dossiers « grands comptes », joint les PDF du dossier privé.
   RÉGLAGES : les 4 constantes ci-dessous. */

const DESTINATAIRE = 'olesur.manta@gmail.com';      // phase de test : Olivier. Mise en ligne : contact@manta-health.com
const EXPEDITEUR   = 'site@manta-health.com';        // adresse technique d'envoi (à créer chez OVH, ou utiliser contact@manta-health.com)
const DOSSIERS_DIR = __DIR__ . '/../dossiers-prives'; // dossier HORS du site web (non accessible par une adresse URL)
const DOSSIERS = [                                    // nom du fichier => intitulé (les fichiers absents sont ignorés)
  'declaration-ue-conformite-manta.pdf'        => 'Déclaration UE de conformité',
  'rapport-apave-en-60601-1.pdf'               => 'Rapport APAVE EN 60601-1',
  'enregistrement-eudamed.pdf'                 => 'Enregistrement EUDAMED',
  'dossier-conformite-performance.pdf'         => 'Dossier de conformité et de performance',
  'synthese-etude-chu-angers.pdf'              => 'Synthèse de l\'étude du CHU d\'Angers',
  'fiche-technique-manta-l.pdf'                => 'Fiche technique MANTA L',
  'prerequis-installation-garanties.pdf'       => 'Prérequis d\'installation et garanties',
];
const MAX_PAR_HEURE = 10; // demandes acceptées par adresse IP et par heure

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
function repondre(bool $ok, string $msg = ''): never { echo json_encode(['ok' => $ok, 'erreur' => $msg], JSON_UNESCAPED_UNICODE); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') repondre(false, 'méthode');
$brut = file_get_contents('php://input');
if (strlen($brut) > 20000) repondre(false, 'trop long');
$j = json_decode($brut, true);
if (!is_array($j) || empty($j['type']) || !is_array($j['donnees'] ?? null)) repondre(false, 'format');

/* Même origine seulement */
$hote = $_SERVER['HTTP_HOST'] ?? '';
$orig = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($orig && !str_contains($orig, $hote)) repondre(false, 'origine');

/* Limite par IP (fichier temporaire) */
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$verrou = sys_get_temp_dir() . '/manta-envoi-' . md5($ip);
$t = time(); $liste = file_exists($verrou) ? array_filter(array_map('intval', file($verrou, FILE_IGNORE_NEW_LINES)), fn($x) => $x > $t - 3600) : [];
if (count($liste) >= MAX_PAR_HEURE) repondre(false, 'trop de demandes');
$liste[] = $t; file_put_contents($verrou, implode("\n", $liste));

$type = preg_replace('/[^a-z0-9àâçéèêëîïôûùüÿñæœ \-]/iu', '', (string)$j['type']);
$donnees = $j['donnees'];
if (!empty($donnees['site_web'])) repondre(true); // robot : on dit oui sans rien envoyer

/* Corps du message */
$lignes = [];
$repondreA = '';
foreach ($donnees as $k => $v) {
  if (!is_string($v)) continue;
  $k = mb_substr(strip_tags($k), 0, 80); $v = mb_substr(strip_tags($v), 0, 2000);
  if (preg_match('/e-?mail/i', $k) && filter_var($v, FILTER_VALIDATE_EMAIL)) $repondreA = $v;
  $lignes[] = $k . ' : ' . $v;
}
if (!$lignes) repondre(false, 'vide');
$corps = "Nouvelle demande depuis le site MANTA\nType : $type\n\n" . implode("\n", $lignes) . "\n";

/* Pièces jointes pour les grands comptes */
$pj = [];
if (stripos($type, 'dossiers') !== false) {
  foreach (DOSSIERS as $fichier => $titre) {
    $chemin = DOSSIERS_DIR . '/' . $fichier;
    if (is_file($chemin)) $pj[$titre . ' (' . $fichier . ')'] = $chemin;
  }
}

$sujet = '=?UTF-8?B?' . base64_encode('MANTA – ' . $type) . '?=';
$frontiere = 'manta-' . bin2hex(random_bytes(8));
$entetes = "From: Site MANTA <" . EXPEDITEUR . ">\r\n" . ($repondreA ? "Reply-To: $repondreA\r\n" : '') . "MIME-Version: 1.0\r\n";

if (!$pj) {
  $entetes .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";
  $ok = mail(DESTINATAIRE, $sujet, $corps, $entetes);
} else {
  $entetes .= "Content-Type: multipart/mixed; boundary=\"$frontiere\"\r\n";
  $m = "--$frontiere\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n$corps\r\n";
  foreach ($pj as $titre => $chemin) {
    $nom = basename($chemin);
    $m .= "--$frontiere\r\nContent-Type: application/pdf; name=\"$nom\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$nom\"\r\n\r\n" . chunk_split(base64_encode(file_get_contents($chemin))) . "\r\n";
  }
  $m .= "--$frontiere--\r\n";
  $ok = mail(DESTINATAIRE, $sujet, $m, $entetes);
  /* Copie des dossiers au demandeur */
  if ($ok && $repondreA) {
    $intro = "Bonjour,\n\nVoici les dossiers MANTA que vous avez demandés sur notre site. Pierre Sanchez, président de MANTA, vous recontactera.\n\nMANTA SAS – 1 rue Alexandre Fleming, 49000 Angers – 01 45 34 14 71\n";
    $m2 = "--$frontiere\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n$intro\r\n" . substr($m, strpos($m, "--$frontiere\r\nContent-Type: application/pdf"));
    mail($repondreA, '=?UTF-8?B?' . base64_encode('Vos dossiers MANTA') . '?=', $m2, "From: MANTA <" . EXPEDITEUR . ">\r\nReply-To: contact@manta-health.com\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"$frontiere\"\r\n");
  }
}
repondre((bool)$ok, $ok ? '' : 'mail');
