/* MANTA – envoi réel des formulaires (contact, professionnels, prêt gratuit, grands comptes).
   Réglage : une seule ligne à modifier ci-dessous.
   - endpoint : 'envoi.php' sur l'hébergement OVH (le script PHP envoie le mail et, pour les grands comptes, les dossiers en pièces jointes).
   - access_key : clé Web3Forms (https://web3forms.com, gratuit) pour tester l'envoi AVANT l'hébergement OVH :
     les demandes arrivent sur l'adresse liée à la clé. Laisser vide quand envoi.php est en place.
   Si les deux sont vides : rien n'est envoyé, un message « formulaire pas encore branché » s'affiche. */
window.MANTA_ENVOI = { endpoint: '', access_key: '' };

(function () {
  function texte(el) { return (el.textContent || '').replace(/\s*\*\s*$/, '').replace(/\s+/g, ' ').trim(); }
  /* Lit tous les champs d'un formulaire : libellé → valeur. */
  window.mantaCollecter = function (form, extra) {
    var d = {};
    form.querySelectorAll('input,select,textarea').forEach(function (i) {
      if (i.type === 'submit' || i.type === 'button' || i.name === 'site_web') return;
      if (i.closest('[hidden]')) return;
      var lab = i.id && form.querySelector('label[for="' + i.id + '"]');
      var k = lab ? texte(lab) : (i.closest('label') ? texte(i.closest('label')) : (i.name || i.id || 'champ'));
      d[k] = i.type === 'checkbox' ? (i.checked ? 'oui' : 'non') : i.value.trim();
    });
    form.querySelectorAll('.pill.on,[aria-pressed="true"]').forEach(function (b) {
      var g = b.closest('[data-groupe]'); d[g ? g.getAttribute('data-groupe') : 'Choix'] = texte(b);
    });
    if (extra) for (var k in extra) d[k] = extra[k];
    d['Page'] = location.href.split('?')[0];
    d['Date'] = new Date().toLocaleString('fr-FR');
    return d;
  };
  /* Envoie les données. ok = élément où afficher le résultat ; texteOk = phrase affichée en cas de succès ; apres = fonction appelée en cas de succès. */
  window.mantaEnvoyer = function (type, donnees, form, ok, texteOk, apres) {
    var c = window.MANTA_ENVOI || {};
    var pot = form.querySelector('input[name="site_web"]');
    if (pot && pot.value) { ok.textContent = texteOk; if (apres) apres(); return; } /* robot : on fait semblant */
    ok.hidden = false; ok.classList.remove('bon');
    var btn = form.querySelector('button[type="submit"]'); if (btn) btn.disabled = true;
    ok.textContent = 'Envoi en cours…';
    function fini(bon, msg) { if (btn) btn.disabled = false; ok.textContent = msg; ok.classList.toggle('bon', bon); if (bon && apres) apres(); }
    var charge = { type: type, donnees: donnees };
    var p;
    if (c.access_key) {
      var fd = { access_key: c.access_key, subject: 'MANTA – ' + type, from_name: 'Site MANTA', botcheck: '' };
      for (var k in donnees) fd[k] = donnees[k];
      p = fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(fd) })
        .then(function (r) { return r.json(); }).then(function (j) { if (!j.success) throw new Error(j.message || 'refus'); });
    } else if (c.endpoint) {
      p = fetch(c.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(charge) })
        .then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error(j.erreur || 'refus'); });
    } else {
      fini(false, 'Ce formulaire n’est pas encore branché : rien n’a été envoyé. Appelez-nous au 01 45 34 14 71 ou écrivez à contact@manta-health.com.');
      return;
    }
    p.then(function () { fini(true, texteOk); })
     .catch(function () { fini(false, 'L’envoi n’a pas abouti. Réessayez dans un instant, ou appelez-nous au 01 45 34 14 71.'); });
  };
  /* Champ piège anti-robots, invisible, ajouté à chaque formulaire qui a l'attribut data-envoi. */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form').forEach(function (f) {
      if (f.querySelector('input[name="site_web"]')) return;
      var w = document.createElement('div'); w.setAttribute('aria-hidden', 'true');
      w.style.cssText = 'position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden';
      w.innerHTML = '<label>Ne pas remplir <input type="text" name="site_web" tabindex="-1" autocomplete="off"></label>';
      f.appendChild(w);
    });
  });
})();
