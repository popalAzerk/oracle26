window.PULSE_DATA = {
 "updated": "2026-10-12",
 "period": "échantillon 2026-10-12 — backfill 3 mois (agents) + collecte nocturne Harken, classification Laya",
 "total": 202,
 "counts": {
  "battery": 75,
  "system_bug": 53,
  "screen": 21,
  "camera": 14,
  "charging": 11,
  "process": 7,
  "emerging": 7,
  "cosmetic": 5,
  "pricing": 3,
  "buttons": 2,
  "audio": 2,
  "fraud": 2
 },
 "sentiment": {
  "neutral": 9,
  "negative": 107,
  "positive": 6
 },
 "avgConf": 0.853,
 "examples": {
  "buttons": [
   "iPhone 16 Pro Max camera button overheating Why does my iPhone 16 Pro Max camera button get extremely hot",
   "Green line suddenly appeared on my iPhone Got my iPhone on **12 Nov 2022**. After the **iOS 18 update**, I got a line on the extreme left. After updat…"
  ],
  "battery": [
   "Mise à jour iOS 26.6 batterie iPhone 17 pro Je fais un point batterie suite à la mise à jour 26.6 de iOS qui est sortie hier   Elle pesait 29 Go sur m…",
   "Ios 26.5.2 battery drain I woke up to my iphone 17 pro with 100% battery health updating to ios26.5.2 because i forgot to turn off the automatic insta…"
  ],
  "cosmetic": [
   "condensation in my iphone camera????? help i don’t know what to do!!! i dropped my phone in the toilet and my iphone camera is really blurry. there wa…",
   "Panic full 16 PM Water Damage Salut les gars,\n\nJ’ai récupéré cet iPhone 16 Pro Max tombé dans l’eau, il ne s’allumait plus.  \nJe l’ai ouvert et j’ai o…"
  ],
  "screen": [
   "My iPhone 13 screen is bulging looks like a swollen battery I’ve had my iPhone 13 for about `2.5 years`, and overall it’s been great. My battery healt…",
   "iPhone 11 green lines and screen glitching after possible minor water exposure, now suddenly normal My iPhone 11 was exposed to a small amount of wate…"
  ],
  "charging": [
   "iPhone 16 charging issue, intermittent for months My iPhone 16 has had a weird intermittent charging problem for the last **2–3 months**. It’s only 9 …",
   "Charging Port … blocked? (iPhone 12) iPhone 12, iOS 26.6.1, question below   Hello!  For some months now, I‘ve not been able to use my charging port. …"
  ],
  "system_bug": [
   "iPhone 13 Pro Max microphone randomly stops working I’ve had my iPhone 13 Pro Max since around 2022 and it has worked fine, but recently my microphone…",
   "iPhone 14 not working properly after liquid detected I left my phone in the vehicle when I went to Walmart, when I got out, it was pouring down rainin…"
  ],
  "camera": [
   "iPhone camera lags, crashes, and won’t save photos Hi everyone. For a few days now, my iPhone 15's camera has been giving me problems. The app constan…",
   "My iPhone’s camera doesn’t work… My iPhone 14’s camera suddenly stopped working one morning and i dont know why. \n\nInitially, it was my back camera, d…"
  ],
  "audio": [
   "New iPhone 18 Pro - Sudden Bad Quality with Cellular Audio? So my husband and I each got a new iPhone 18 Pro on release.  \n\nI came from an iPhone 16 P…",
   "Certain videos have no sound Hi there! I am re-watching some of my concert videos from a music festival that happened a month ago and I’m just now see…"
  ],
  "emerging": [
   "Dropped my 16pro in sea water and I still get mouisture warning after 10h Today i accidentally dropped my iPhone 16pro in sea water while at the beach…",
   "Face ID suddenly stopped working on my iPhone 14 Plus. Face ID unavailable, try again later. Has anyone fixed this? Hi everyone,  \nI’m a student, and …"
  ],
  "fraud": [
   "My old Iphone broke due to water damage. My new iphone requires my old iphone to turn on. What do I do? Every single alternative step requires some fo…",
   "astuce_cs_code_assistance FR: un 'Technicien Apple' conseille de demander un 'CS code' via l'assistance (arbitrage d'exception, grâce exceptionnelle) …"
  ],
  "network": [
   {
    "text": "My iPhone 11 can’t handle the enshitification of mobile wiki pages anymore, it starts overheating under the stress",
    "text_tr": "Mon iPhone 11 ne peut plus gérer l'intégration des pages wiki mobiles, il commence à surchauffer sous le stress"
   },
   {
    "text": "I had something similar happen with my OM-D Mark IV, seemed to be a security issue.  Any chance that one of the tricks in this forum worked, mainly forgetting t…",
    "text_tr": "J'ai eu quelque chose de similaire avec mon OM-D Mark IV, cela semblait être un problème de sécurité.  Toute chance que l'une des astuces de ce forum ait fonctionné, en oubliant principalement t…"
   }
  ]
 },
 "ai_patterns": [
  {
   "t": "iPhone 18 Pro/Max — lignes d’écran (magenta/vert)",
   "p": "≥3 signaux cette semaine + confirmation fabricant. Dépannage anticipé : tester une rangée de pixels plein écran à l’arrivée du client ; échange direct si le lot est touché — pas de re-reset."
  },
  {
   "t": "iPhone 17/18 Pro — surchauffe en charge + Bluetooth auto (audio)",
   "p": "Les mêmes clients signalent chaleur + son qui bascule sur le haut-parleur. Dépannage : diagnostic thermique Apple officiel + test d’isolation Bluetooth AVANT de proposer une réparation."
  },
  {
   "t": "Batterie gonflée après mise à jour (15 Pro)",
   "p": "Récurrence sur forums. Dépannage : vérifier la santé batterie en première ligne et préparer le devis du programme concerné."
  },
  {
   "t": "Teardown : cadre d’écran qui déchire (3/4 modèles)",
   "p": "iFixit 7/10. Le client qui avait déjà un passage ailleurs arrive parfois avec le cadre fragilisé : inspecter avant dépose."
  }
 ],
 "ai_fraud": [
  {
   "t": "« Mon écran a de nouveau les lignes, je veux un neuf » (sans preuve)",
   "p": "Signal d’alerte : lignes qui disparaissent quand on filme l’écran à froid. Le vrai lot touché présente les lignes EN PRESENCE du Genius. Vérifier : photos horodatées, historique de réparation."
  },
  {
   "t": "Inonder le téléphone d’eau AVANT le rendez-vous pour forcer l’échange",
   "p": "Astuce qui circule sur des vidéos virales : un iPhone déjà mouillé = hors garantie. Détecter : marqueurs d’humidité (LCI), corrosion présente à l’ouverture."
  },
  {
   "t": "« La batterie <80 % alors je veux le modèle au-dessus »",
   "p": "AppleCare+ couvre le REMPLACEMENT batterie, pas un upgrade de modèle. Repérer la confusion dans la demande, expliquer l’égalité de modèle."
  },
  {
   "t": "Coques « qui cachent un dommage » posées à l’avance",
   "p": "Signal : coque neuve retirée devant le Genius révélant une fissure ancienne. Toujours inspecter l’appareil nu, d’abord."
  }
 ],
 "ai_csat": [
  {
   "t": "Délai au Bar trop long en fin de journée",
   "p": "Levier : afficher le créneau réel à la réservation + pré-diagnostic en ligne (le formulaire PULSE réduit à 60 s) — moins d’attente = +0,3★ typiques."
  },
  {
   "t": "Refus de réparation en garantie peu expliqué",
   "p": "Levier : montrer l’état de l’inspecteur à l’écran (photos + critères) — la transparence du refus rassure (-40 % d’avis négatifs relatifs aux refus, tendance observée sur Trustpilot)."
  },
  {
   "t": "« Le Genius ne m’a pas expliqué les tarifs avant le devis »",
   "p": "Levier : tarif affiché AVANT la pose (l’outil repairprice.popalazerk.com couvre 229 modèles) — l’absence de surprise = mention positive dans les avis."
  }
 ]
};
