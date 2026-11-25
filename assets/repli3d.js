/* Repli de la visite 3D : si le moteur ne démarre pas (fichier bloqué, réseau coupé, navigateur trop ancien),
   on l'explique au lieu de laisser un cadre vide. Script classique : il tourne même quand les modules échouent. */
(function () {
  function verifier() {
    var z = document.getElementById('scene3d');
    if (!z || z.querySelector('canvas') || z.querySelector('.poster')) return;
    z.innerHTML = '<div class="poster"><p>La visite 3D n\u2019a pas pu se charger sur cet appareil. ' +
      'Recharge la page ; sinon, les fiches et le quiz plus bas restent utilisables.</p></div>';
  }
  window.addEventListener('load', function () { setTimeout(verifier, 8000); });
})();
