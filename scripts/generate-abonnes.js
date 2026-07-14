const fs = require("fs");
const path = require("path");

const JAN_26 = new Date("2026-01-01T00:00:00Z").getTime();
const JAN_27 = new Date("2027-01-31T23:59:59Z").getTime();
const FEV_26 = new Date("2026-02-01T00:00:00Z").getTime();
const FEV_27 = new Date("2027-02-28T23:59:59Z").getTime();
const AVR_26 = new Date("2026-04-01T00:00:00Z").getTime();
const AVR_27 = new Date("2027-04-30T23:59:59Z").getTime();
const JUN_26 = new Date("2026-06-01T00:00:00Z").getTime();
const JUN_27 = new Date("2027-06-30T23:59:59Z").getTime();
const JUL_26 = new Date("2026-07-14T00:00:00Z").getTime();
const JUL_27 = new Date("2027-07-14T23:59:59Z").getTime();
const DEC_26 = new Date("2026-12-01T00:00:00Z").getTime();
const DEC_27 = new Date("2027-12-31T23:59:59Z").getTime();

const abonnes = [];

function add(email, name, start, end, commentaire, autoRenew) {
  abonnes.push({
    email,
    name,
    plan: "annuel",
    ref: "import-2026-" + String(abonnes.length + 1).padStart(3, "0"),
    expiresAt: end,
    createdAt: start,
    commentaire: commentaire || "Abonne Annuel",
    ...(autoRenew ? { autoRenew: true } : {}),
  });
}

// === PARTENAIRES (autoRenew = true) ===
add("info@elite-capitalgroup.com", "Elite Capital", JAN_26, JAN_27, "Partenaire", true);
add("p.zumbach@interprogress.org", "Pierre Zumbach (FIP)", JAN_26, JAN_27, "Partenaire", true);
add("jdmonefong@yahoo.fr", "Joel Monefong", JAN_26, JAN_27, "Ami DP Partenaire", true);
add("adamou_petouonchi@afrilandfirstbank.com", "Adamou (AFB)", JAN_26, JAN_27, "Partenaire", true);

// === ABONNES ANNUELS ===
// 05 - Josiane Tchoungui (27/01/26)
add("josiane.tchoungui@gmail.com", "Josiane Tchoungui", JAN_26, JAN_27);
// 06 - BEAC/Hayatou (Juin 2026)
add("communication@beac.int", "BEAC / Hayatou", JUN_26, JUN_27);
// 07-19 - Maetur (Avril 2026)
add("jamalmoustapha53@yahoo.fr", "Djamal Moustapha (Maetur PCA)", AVR_26, AVR_27);
add("manga_lr@yahoo.fr", "Manga Louis Roger (Maetur DG)", AVR_26, AVR_27);
add("akumejulius9@gmail.com", "Akume Julius (Maetur Adm.)", AVR_26, AVR_27);
add("mbine.mbong@yahoo.com", "Mbong Michael Mbine (Maetur DGA)", AVR_26, AVR_27);
add("abandajeanroger@gmail.com", "Abanda Jean Roger (Maetur DP)", AVR_26, AVR_27);
add("pondibat@yahoo.fr", "Pondi Batoum Paul (Maetur DSC)", AVR_26, AVR_27);
add("arthurovitali@yahoo.fr", "Arthur Sosso (Maetur DCT)", AVR_26, AVR_27);
add("vronsat@yahoo.fr", "Nsa Atangana Rosalie (Maetur DIDA)", AVR_26, AVR_27);
add("ndzenguefrederic@gmail.com", "Ndzengue Onana Frederic (Maetur DRH)", AVR_26, AVR_27);
add("tsimiayissij@yahoo.fr", "Tsimi Ayissi Joel Roger (Maetur DE)", AVR_26, AVR_27);
add("jacko.ekane237@gmail.com", "Ndoumbe Jacques (Maetur Controleur)", AVR_26, AVR_27);
add("marielyse26@gmail.com", "Bikoi Marlyse (Maetur Qualite)", AVR_26, AVR_27);
add("enkene@yahoo.fr", "Nkene Esther (Maetur SI)", AVR_26, AVR_27);
// 20 - Arsel (Jan 2026)
add("ayongbisong@yahoo.com", "Ayong Bisong (Arsel)", JAN_26, JAN_27);
// 21 - Claude (Dec 2026)
add("xinhouajournal@gmail.com", "Claude", DEC_26, DEC_27);
// 22 - M. Nguille
add("m.nguille@yahoo.fr", "M. Nguille", JAN_26, JAN_27);
// 23 - GIMAC (Partenaire)
add("valentin.mbozoo@gimac-afr.org", "Valentin Mbozoo (DG GIMAC)", JAN_26, JAN_27, "Partenaire", true);
// 24-33 - Prometal (Jan 2026)
add("grace.vouillon@prometal-cm.com", "Grace Vouillon", JAN_26, JAN_27);
add("eric.dako@prometal-cm.com", "Eric Dako", JAN_26, JAN_27);
add("anne.elong@prometal-cm.com", "Anne Elong", JAN_26, JAN_27);
add("marie-paulette.boum@prometal-cm.com", "M.P Boum", JAN_26, JAN_27);
add("olivin.notue@prometal-cm.com", "Olivin Notue", JAN_26, JAN_27);
add("yves.etobe@prometal-cm.com", "Yves Etobe", JAN_26, JAN_27);
add("rosemarie.bilai@prometal-cm.com", "Rose Marie Bilai", JAN_26, JAN_27);
add("fabrice.mandjeck@prometal-cm.com", "Fabrice Mandjeck", JAN_26, JAN_27);
add("cyrille.ntamack@prometal-cm.com", "Cyrille Ntamack", JAN_26, JAN_27);
add("rosine.abang@prometal-cm.com", "Rosine Abang", JAN_26, JAN_27);
// 34+ Sans date explicite (defaut Jan 2026)
add("bfondufe@stvgroup.com", "B. Fondufe", JAN_26, JAN_27);
add("mokom.ndzah@stoneshed-am.com", "Mme Mokam", JAN_26, JAN_27);
add("woo.francois@yahoo.fr", "Woo Francois", JAN_26, JAN_27);
add("secretariat@okfoods-cam.com", "OK Foods", JAN_26, JAN_27);
// Zinga (Partenaire)
add("zinga.valentin@gmail.com", "Valentin Zinga", JAN_26, JAN_27, "Partenaire", true);
add("etibert.mobambo@b2b-communication.com", "Etibert Mobambo", JAN_26, JAN_27);
// CAA (Jan 2026)
add("rachelngah2000@yahoo.fr", "Rachel Ngah (CAA)", JAN_26, JAN_27);
add("fomukongmantoh@gmail.com", "Liliane Fomukong (CAA)", JAN_26, JAN_27);
add("grace_lydie@yahoo.fr", "Mimbe Meka Grace (CAA)", JAN_26, JAN_27);
// Sans date (Jan 2026)
add("contact@newsstand-online.com", "Newsstand Online", JAN_26, JAN_27);
add("marley.mboungou@numeris.consulting", "Marley Mboungou", JAN_26, JAN_27);
add("publishers-support@cafeyn.co", "Cafeyn (Publishers)", JAN_26, JAN_27);
add("freshnel.massock@nexah.net", "Freshnel Massock", JAN_26, JAN_27);
add("m.kamgaing@hamgt.com", "M. Kamgaing", JAN_26, JAN_27);
add("j.ntoumba@hamgt.com", "J. Ntoumba", JAN_26, JAN_27);
add("support.sodipresse@sonapresse.com", "Sodipresse / Sonapresse", JAN_26, JAN_27);
add("abdoulaye_h2002@yahoo.fr", "Abdoulaye H.", JAN_26, JAN_27);
add("murieleloundou@yahoo.com", "Muriel Eloundou", JAN_26, JAN_27);
add("lumundam@yahoo.com", "Lumunda M.", JAN_26, JAN_27);
add("alico_at@yahoo.fr", "Alico A.T.", JAN_26, JAN_27);
add("tchom_j_p@yahoo.fr", "Tchom J.P.", JAN_26, JAN_27);
add("jaberta2005@yahoo.fr", "Jaberta", JAN_26, JAN_27);
add("cfe.avocats@outlook.com", "CFE Avocats", JAN_26, JAN_27);
add("francis.ebiangne@richemont-delviso.com", "Francis Ebiangne", JAN_26, JAN_27);
add("febiangne.avocat@outlook.fr", "F. Ebiangne (Avocat)", JAN_26, JAN_27);
add("employes-cec@groupe-cible.com", "Employes CEC (Groupe Cible)", JAN_26, JAN_27);
add("cible@groupe-cible.com", "Groupe Cible", JAN_26, JAN_27);
add("hketano@gmail.com", "H. Ketano", JAN_26, JAN_27);
add("doualasyndustricam@yahoo.fr", "Douala Syndustricam", JAN_26, JAN_27);
add("newsstandonline6@gmail.com", "Newsstand Online 6", JAN_26, JAN_27);
add("babette.sandjo@eneo.cm", "Babette Sandjo", JAN_26, JAN_27);
add("doly.mondomobe@contacturer.com", "Doly Mondomobe", JAN_26, JAN_27);
// 69 - Fevrier 2026
add("ngondiekwel@yahoo.com", "Ngondie Kwel", FEV_26, FEV_27);
// 72-76 - Avril 2026
add("ennoubissie@yahoo.com", "Ennoubissie", AVR_26, AVR_27);
add("hassanbelibi@gmail.com", "Hassan Belibi", AVR_26, AVR_27);
add("kamgatengho@yahoo.fr", "Kamga Tengho", AVR_26, AVR_27);
add("aurelien.bakehe@inq.inc", "Aurelien Bakehe", AVR_26, AVR_27);
add("coface.westafrica@coface.com", "Coface West Africa", AVR_26, AVR_27);
// 77 - anelflo (sans date)
add("anelflo@hotmail.fr", "Anelflo", JAN_26, JAN_27);
// 78 - Ambassade de France (Avril 2026)
add("communication.yaounde-amba@diplomatie.gouv.fr", "Ambassade de France", AVR_26, AVR_27);
// 79-80 Juin 2026
add("yvanovottou@yahoo.fr", "Yvan Ovottou", JUN_26, JUN_27);
add("ambalgcmr@gmail.com", "Ambassade (LG CMR)", JUN_26, JUN_27);

// === 3 AJOUTS MANUELS (Juillet 2026) ===
add("herve.fopa@yahoo.fr", "Herve Fopa", JUL_26, JUL_27);
add("josephelvisbengonozang@gmail.com", "Joseph Elvis Bengono Zang", JUL_26, JUL_27);
add("ekoutib@gmail.com", "Ekouti B.", JUL_26, JUL_27);

const outPath = path.join(__dirname, "..", "data", "abonnes.json");
fs.writeFileSync(outPath, JSON.stringify(abonnes, null, 2));
console.log("Total abonnes:", abonnes.length);
console.log("Written to:", outPath);
