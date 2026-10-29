(function () {
  var photo = {
    bot: ['Voulez-vous vérifier que les toilettes sont compatibles ? Envoyez-moi une photo : je vous dis tout de suite ce qu’il faut prévoir.'],
    choices: [{ label: 'Envoyer une photo', next: 'photoSent', img: true }, { label: 'Plus tard', next: 'slots' }]
  };
  var revenus = [
    { label: 'Il vit seul, revenu fiscal sous 17 400 €', next: 'tm' },
    { label: 'Il vit seul, entre 17 400 € et 22 300 €', next: 'm' },
    { label: 'Je ne sais pas', next: 'ns' }
  ];
  var revenusF = [
    { label: 'Elle vit seule, revenu fiscal sous 17 400 €', next: 'tm' },
    { label: 'Elle vit seule, entre 17 400 € et 22 300 €', next: 'm' },
    { label: 'Je ne sais pas', next: 'ns' }
  ];
  var faq = [
    { label: 'Et s’il y a une coupure de courant ?', next: 'q1' },
    { label: 'Combien de temps dure la pose ?', next: 'q2' },
    { label: 'Recommencer la démonstration', next: 'restart' }
  ];
  var N = {
    start: { bot: ['Bonjour, je suis l’assistant MANTA. Je réponds à vos questions jour et nuit, j’estime vos aides et j’organise un appel avec Pierre, le fondateur.', 'Pour qui cherchez-vous une solution ?'],
      choices: [{ label: 'Pour mon père ou ma mère', next: 'a1' }, { label: 'Pour moi-même', next: 'b1' }, { label: 'Pour un patient, je suis soignant', next: 'c1' }] },
    a1: { bot: ['Merci. Quel âge a votre parent, et qu’est-ce qui est devenu difficile ?'],
      choices: [{ label: 'Mon père a 84 ans, il a du mal à se relever', next: 'a2' }, { label: 'Ma mère a 78 ans, elle est tombée le mois dernier', next: 'a2b' }] },
    a2: { bot: ['C’est exactement pour cela que MANTA a été conçu. Il monte la cuvette pour se relever sans forcer, puis la redescend pour s’asseoir.', 'Pour estimer l’aide MaPrimeAdapt’ : vit-il seul, et quel est à peu près son revenu fiscal de référence ?'], choices: revenus },
    a2b: { bot: ['Je suis désolé pour sa chute. Beaucoup de familles nous écrivent après une chute : MANTA l’aidera à s’asseoir et à se relever sans se tenir au lavabo.', 'Pour estimer l’aide MaPrimeAdapt’ : vit-elle seule, et quel est à peu près son revenu fiscal de référence ?'], choices: revenusF },
    tm: { bot: ['Bonne nouvelle : avec ces ressources, MaPrimeAdapt’ prend en charge 70 % du prix hors taxes.'],
      card: { lines: [['MANTA + pose', '14 239 €'], ['MaPrimeAdapt’ (70 %)', '− 8 306 €'], ['Accompagnateur obligatoire', '+ 600 €']], total: '6 533 €' },
      after: photo.bot, choices: photo.choices },
    m: { bot: ['Avec ces ressources, MaPrimeAdapt’ prend en charge 50 % du prix hors taxes.'],
      card: { lines: [['MANTA + pose', '14 239 €'], ['MaPrimeAdapt’ (50 %)', '− 5 933 €'], ['Accompagnateur obligatoire', '+ 600 €']], total: '8 906 €' },
      after: ['Sa caisse de retraite ou sa mutuelle peuvent encore réduire ce montant. Je vous dirai lesquelles solliciter.'].concat(photo.bot), choices: photo.choices },
    ns: { bot: ['Pas de souci, on le vérifiera ensemble. Pour une personne seule hors Île-de-France : 70 % d’aide sous 17 363 € de revenus, 50 % sous 22 259 €.'].concat(photo.bot), choices: photo.choices },
    b1: { bot: ['Merci de votre confiance. Qu’est-ce qui rend les toilettes difficiles pour vous aujourd’hui ?'],
      choices: [{ label: 'Je me déplace en fauteuil roulant', next: 'b2' }, { label: 'J’ai une maladie chronique, avec des jours difficiles', next: 'b2m' }] },
    b2: { bot: ['Avec MANTA, vous réglez la cuvette à la hauteur exacte de votre fauteuil pour un transfert latéral, puis vous la remontez pour vous relever.', 'Avez-vous une reconnaissance de la MDPH ou la PCH ?'],
      choices: [{ label: 'Oui, j’ai la PCH', next: 'b3' }, { label: 'Pas encore', next: 'b3n' }] },
    b2m: { bot: ['Les jours de douleur ou de fatigue, vous ajustez la hauteur pour vous asseoir et vous relever sans forcer. Et vous gardez votre intimité, sans avoir à demander d’aide.', 'Avez-vous une reconnaissance de la MDPH ou la PCH ?'],
      choices: [{ label: 'Oui, j’ai la PCH', next: 'b3' }, { label: 'Pas encore', next: 'b3n' }] },
    b3: { bot: ['Très bien. Deux aides se cumulent : MaPrimeAdapt’, ouverte à tout âge avec un handicap d’au moins 50 %, et la PCH aménagement du logement, jusqu’à 10 000 €.', 'Selon vos ressources, votre reste à payer peut devenir très faible. Pierre fera le calcul exact avec vous.'].concat(photo.bot), choices: photo.choices },
    b3n: { bot: ['Je vous conseille de la demander à la MDPH : elle peut financer une grande partie de MANTA, et nous vous aidons à préparer le dossier.', 'MaPrimeAdapt’ reste possible à tout âge avec un taux d’incapacité d’au moins 50 %.'].concat(photo.bot), choices: photo.choices },
    c1: { bot: ['Merci ! Vous êtes plutôt :'],
      choices: [{ label: 'Ergothérapeute', next: 'c2' }, { label: 'Infirmier ou aide à domicile', next: 'c2' }, { label: 'Accompagnateur MaPrimeAdapt’', next: 'c2' }] },
    c2: { bot: ['Je vous envoie la fiche technique, les prérequis d’installation et la synthèse de l’étude du CHU d’Angers.', 'Pierre propose aussi une démonstration de 20 minutes, à votre cabinet ou en visio. Cela vous intéresse ?'],
      choices: [{ label: 'Oui, une visio', next: 'slots' }, { label: 'Envoyez-moi la documentation', next: 'c3' }] },
    c3: { bot: ['C’est envoyé. Vous pouvez aussi transmettre notre simulateur à vos patients : ils estiment leur reste à charge en une minute.'],
      choices: [{ label: 'Recommencer la démonstration', next: 'restart' }] },
    photoSent: { bot: ['Merci ! Je vois des toilettes suspendues, une arrivée d’eau et une prise électrique à proximité. L’installation semble compatible.', 'Pierre vérifiera avec vous la largeur disponible : 85 cm minimum.'], then: 'slots' },
    slots: { bot: ['Je vous propose un appel de 20 minutes avec Pierre, le fondateur de MANTA. Quel créneau vous arrange ?'],
      choices: [{ label: 'Jeudi 29 octobre, 10 h', next: 'phone' }, { label: 'Jeudi 29 octobre, 14 h 30', next: 'phone' }, { label: 'Vendredi 30 octobre, 9 h 30', next: 'phone' }] },
    phone: { bot: ['Parfait. À quel numéro Pierre peut-il vous joindre ?'], choices: [{ label: '06 12 34 56 78', next: 'done' }] },
    done: { bot: ['C’est noté. Pierre vous appellera au 06 12 34 56 78 au créneau choisi.', 'Je vous envoie par e-mail votre estimation, la liste des papiers pour les aides et un rappel la veille. Une autre question en attendant ?'], choices: faq },
    q1: { bot: ['Une batterie de secours prend le relais : les toilettes restent utilisables pendant la coupure.'], choices: faq },
    q2: { bot: ['Moins d’une journée. Il faut seulement que la prise électrique soit en place avant notre passage. Je vous le rappellerai par e-mail.'], choices: faq },
    free: { bot: ['Merci pour votre question. Je la note pour Pierre, qui vous répondra de vive voix. En attendant, voici les questions les plus fréquentes :'], choices: faq }
  };

  var chat = document.getElementById('chat');
  var box = document.getElementById('choices');
  var timer = null;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function scroll() { chat.scrollTop = chat.scrollHeight; }

  function msgs(id) {
    var n = N[id], out = n.bot.map(function (t) { return { bot: t }; });
    if (n.card) out.push({ card: n.card });
    if (n.after) n.after.forEach(function (t) { out.push({ bot: t }); });
    if (n.then) out = out.concat(msgs(n.then));
    return out;
  }
  function last(id) { return N[id].then ? last(N[id].then) : id; }

  function render(m) {
    if (m.bot) chat.appendChild(el('div', 'b-bot', m.bot));
    else if (m.me) chat.appendChild(el('div', 'b-me', m.me));
    else if (m.img) {
      var d = el('div', 'b-img'), i = document.createElement('img');
      i.src = 'img/photo-wc-client.jpg'; i.alt = 'Photo des toilettes envoyée par la famille';
      d.appendChild(i); chat.appendChild(d);
    } else if (m.card) {
      var c = el('div', 'b-card');
      c.appendChild(el('span', 'k', 'Votre estimation'));
      m.card.lines.forEach(function (l) { var r = el('div', 'l'); r.appendChild(el('span', '', l[0])); r.appendChild(el('b', '', l[1])); c.appendChild(r); });
      var t = el('div', 't'); t.appendChild(el('span', '', 'Reste à payer')); t.appendChild(el('b', '', m.card.total)); c.appendChild(t);
      chat.appendChild(c);
    }
  }
  function showChoices(id) {
    box.innerHTML = '';
    (N[id].choices || []).forEach(function (c) {
      var b = el('button', 'choice', c.label); b.type = 'button';
      b.addEventListener('click', function () { go(c.img ? { img: true } : { me: c.label }, c.next); });
      box.appendChild(b);
    });
  }
  function reset() {
    clearTimeout(timer);
    chat.querySelectorAll('div').forEach(function (d) { d.remove(); });
    msgs('start').forEach(render); showChoices('start'); scroll();
  }
  function go(user, next) {
    if (next === 'restart') { reset(); return; }
    render(user); box.innerHTML = '';
    var typing = el('div', 'typing'); typing.setAttribute('aria-label', 'L’assistant écrit');
    for (var i = 0; i < 3; i++) typing.appendChild(el('span', 'dot'));
    chat.appendChild(typing); scroll();
    clearTimeout(timer);
    timer = setTimeout(function () {
      typing.remove(); msgs(next).forEach(render); showChoices(last(next)); scroll();
    }, 900);
  }

  document.getElementById('restart').addEventListener('click', reset);
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = document.getElementById('msg'), v = inp.value.trim();
    if (!v) return; inp.value = ''; go({ me: v }, 'free');
  });
  reset();
})();
