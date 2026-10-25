// Tagesimpulse: Verse, Hadithe, Duas und kurze Gedanken.
// Felder: id (stabil, für Favoriten), type, cat, text, source, optional ar (arabisch).
// Kategorien: 'Neuanfang' | 'Geduld' | 'Vergebung' | 'Kraft'
// Die deutschen Übertragungen sind sinngemäß.

export const CATEGORIES = ['Neuanfang', 'Geduld', 'Vergebung', 'Kraft'];

export const QUOTES = [
  // ---------- Neuanfang ----------
  {
    id: 'q-39-53', type: 'Vers', cat: 'Neuanfang',
    text: 'Sag: O meine Diener, die ihr gegen euch selbst maßlos gewesen seid, verliert nicht die Hoffnung auf Allahs Barmherzigkeit. Gewiss, Allah vergibt alle Sünden.',
    source: 'Sure az-Zumar 39:53',
  },
  {
    id: 'q-13-11', type: 'Vers', cat: 'Neuanfang',
    text: 'Gewiss, Allah verändert den Zustand eines Volkes nicht, bis sie das verändern, was in ihnen selbst ist.',
    source: 'Sure ar-Raʿd 13:11',
  },
  {
    id: 'q-2-186', type: 'Vers', cat: 'Neuanfang',
    text: 'Und wenn dich Meine Diener nach Mir fragen: Ich bin nahe. Ich erhöre den Ruf des Bittenden, wenn er Mich ruft.',
    source: 'Sure al-Baqara 2:186',
  },
  {
    id: 'q-93-3', type: 'Vers', cat: 'Neuanfang',
    text: 'Dein Herr hat dich weder verlassen noch verabscheut. Und das Spätere ist wahrlich besser für dich als das Frühere.',
    source: 'Sure ad-Duha 93:3–4',
  },
  {
    id: 'h-beständig', type: 'Hadith', cat: 'Neuanfang',
    text: 'Die Taten, die Allah am meisten liebt, sind die beständigsten, auch wenn sie gering sind.',
    source: 'Sahih al-Bukhari & Sahih Muslim',
  },
  {
    id: 'h-spanne', type: 'Hadith', cat: 'Neuanfang',
    text: 'Wer sich Mir eine Spanne nähert, dem nähere Ich Mich eine Elle. Und wer gehend zu Mir kommt, zu dem komme Ich eilend.',
    source: 'Hadith Qudsi, Sahih al-Bukhari',
  },
  {
    id: 'd-2-201', type: 'Dua', cat: 'Neuanfang',
    text: 'Unser Herr, gib uns im Diesseits Gutes und im Jenseits Gutes, und bewahre uns vor der Strafe des Feuers.',
    ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    source: 'Sure al-Baqara 2:201',
  },
  {
    id: 's-weitermachen', type: 'Gedanke', cat: 'Neuanfang',
    text: 'Du fängst nicht von vorne an. Du machst einfach weiter, mit allem, was du schon gelernt hast.',
    source: 'Gedanke für heute',
  },
  {
    id: 's-kleiner-schritt', type: 'Gedanke', cat: 'Neuanfang',
    text: 'Ein kleiner Schritt heute zählt mehr als ein perfekter Plan für morgen.',
    source: 'Gedanke für heute',
  },

  // ---------- Geduld ----------
  {
    id: 'q-2-153', type: 'Vers', cat: 'Geduld',
    text: 'O ihr, die ihr glaubt, sucht Hilfe in der Geduld und im Gebet. Gewiss, Allah ist mit den Geduldigen.',
    source: 'Sure al-Baqara 2:153',
  },
  {
    id: 'q-94-5', type: 'Vers', cat: 'Geduld',
    text: 'Denn wahrlich, mit der Schwierigkeit kommt Erleichterung. Wahrlich, mit der Schwierigkeit kommt Erleichterung.',
    source: 'Sure ash-Sharh 94:5–6',
  },
  {
    id: 'q-12-87', type: 'Vers', cat: 'Geduld',
    text: 'Und gebt die Hoffnung auf das Erbarmen Allahs nicht auf.',
    source: 'Sure Yusuf 12:87',
  },
  {
    id: 'q-16-127', type: 'Vers', cat: 'Geduld',
    text: 'Und sei geduldig. Deine Geduld kommt allein durch Allah.',
    source: 'Sure an-Nahl 16:127',
  },
  {
    id: 'h-wunderbar', type: 'Hadith', cat: 'Geduld',
    text: 'Wunderbar ist die Lage des Gläubigen: Alles ist gut für ihn. Widerfährt ihm Gutes, ist er dankbar, und das ist gut für ihn. Trifft ihn Schweres, ist er geduldig, und das ist gut für ihn.',
    source: 'Sahih Muslim',
  },
  {
    id: 'd-rahmataka', type: 'Dua', cat: 'Geduld',
    text: 'O Allah, auf Deine Barmherzigkeit hoffe ich. Überlass mich nicht einen Augenblick mir selbst, und bring all meine Angelegenheiten in Ordnung. Es gibt keinen Gott außer Dir.',
    ar: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ',
    source: 'Sunan Abi Dawud',
  },
  {
    id: 'd-muqallib', type: 'Dua', cat: 'Geduld',
    text: 'O Du, der die Herzen wendet, festige mein Herz auf Deinem Weg.',
    ar: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    source: 'Jami at-Tirmidhi',
  },
  {
    id: 's-rhythmus', type: 'Gedanke', cat: 'Geduld',
    text: 'Rhythmus entsteht durch Wiederkehr, nicht durch Perfektion.',
    source: 'Gedanke für heute',
  },

  // ---------- Vergebung ----------
  {
    id: 'q-4-110', type: 'Vers', cat: 'Vergebung',
    text: 'Und wer Böses tut oder sich selbst Unrecht zufügt und danach Allah um Vergebung bittet, wird Allah allvergebend und barmherzig finden.',
    source: 'Sure an-Nisa 4:110',
  },
  {
    id: 'q-11-114', type: 'Vers', cat: 'Vergebung',
    text: 'Gewiss, die guten Taten lassen die schlechten Taten vergehen.',
    source: 'Sure Hud 11:114',
  },
  {
    id: 'q-25-70', type: 'Vers', cat: 'Vergebung',
    text: 'Außer dem, der bereut, glaubt und rechtschaffen handelt: Ihnen wird Allah ihre schlechten Taten in gute umwandeln.',
    source: 'Sure al-Furqan 25:70',
  },
  {
    id: 'h-fehler', type: 'Hadith', cat: 'Vergebung',
    text: 'Alle Kinder Adams machen Fehler, und die Besten unter denen, die Fehler machen, sind die, die sich wieder zuwenden.',
    source: 'Jami at-Tirmidhi, Sunan Ibn Majah',
  },
  {
    id: 'h-kamel', type: 'Hadith', cat: 'Vergebung',
    text: 'Allah freut sich über die Umkehr Seines Dieners mehr als einer von euch, der sein verlorenes Kamel in der Wüste wiederfindet.',
    source: 'Sahih al-Bukhari & Sahih Muslim',
  },
  {
    id: 'h-sohn-adams', type: 'Hadith', cat: 'Vergebung',
    text: 'O Sohn Adams, solange du Mich anrufst und auf Mich hoffst, vergebe Ich dir, was auch immer von dir war, und es kümmert Mich nicht.',
    source: 'Hadith Qudsi, Jami at-Tirmidhi',
  },
  {
    id: 'h-bereuende', type: 'Hadith', cat: 'Vergebung',
    text: 'Wer von einer Sünde umkehrt, ist wie einer, der keine Sünde hat.',
    source: 'Sunan Ibn Majah',
  },
  {
    id: 'd-yunus', type: 'Dua', cat: 'Vergebung',
    text: 'Es gibt keinen Gott außer Dir. Preis sei Dir! Ich gehörte wahrlich zu denen, die sich selbst Unrecht getan haben.',
    ar: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    source: 'Dua des Propheten Yunus, Sure al-Anbiya 21:87',
  },
  {
    id: 'd-adam', type: 'Dua', cat: 'Vergebung',
    text: 'Unser Herr, wir haben uns selbst Unrecht getan. Wenn Du uns nicht vergibst und Dich unser nicht erbarmst, gehören wir zu den Verlierern.',
    ar: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    source: 'Dua von Adam und Hawwa, Sure al-Aʿraf 7:23',
  },
  {
    id: 'd-astaghfirullah', type: 'Dua', cat: 'Vergebung',
    text: 'Ich bitte Allah um Vergebung und wende mich Ihm zu.',
    ar: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    source: 'Sahih al-Bukhari',
  },

  // ---------- Kraft ----------
  {
    id: 'q-2-286', type: 'Vers', cat: 'Kraft',
    text: 'Allah erlegt keiner Seele mehr auf, als sie zu tragen vermag.',
    source: 'Sure al-Baqara 2:286',
  },
  {
    id: 'q-3-139', type: 'Vers', cat: 'Kraft',
    text: 'Werdet nicht schwach und seid nicht traurig, denn ihr werdet die Oberhand haben, wenn ihr gläubig seid.',
    source: 'Sure Al ʿImran 3:139',
  },
  {
    id: 'q-65-3', type: 'Vers', cat: 'Kraft',
    text: 'Und wer sich auf Allah verlässt, dem ist Er genug.',
    source: 'Sure at-Talaq 65:3',
  },
  {
    id: 'q-29-69', type: 'Vers', cat: 'Kraft',
    text: 'Und diejenigen, die sich um Unseretwillen bemühen, werden Wir ganz gewiss auf Unseren Wegen leiten.',
    source: 'Sure al-ʿAnkabut 29:69',
  },
  {
    id: 'h-starke', type: 'Hadith', cat: 'Kraft',
    text: 'Der Starke ist nicht der, der andere niederringt. Der Starke ist der, der sich beherrscht, wenn er zornig ist.',
    source: 'Sahih al-Bukhari & Sahih Muslim',
  },
  {
    id: 'h-nicht-aufgeben', type: 'Hadith', cat: 'Kraft',
    text: 'Strebe nach dem, was dir nützt, suche Hilfe bei Allah und gib nicht auf.',
    source: 'Sahih Muslim',
  },
  {
    id: 'd-musa', type: 'Dua', cat: 'Kraft',
    text: 'Mein Herr, weite mir meine Brust und erleichtere mir meine Aufgabe.',
    ar: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    source: 'Dua des Propheten Musa, Sure Ta-Ha 20:25–26',
  },
  {
    id: 'd-hamm', type: 'Dua', cat: 'Kraft',
    text: 'O Allah, ich suche Zuflucht bei Dir vor Sorge und Kummer, vor Schwäche und Trägheit.',
    ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ',
    source: 'Sahih al-Bukhari',
  },
  {
    id: 's-langsam', type: 'Gedanke', cat: 'Kraft',
    text: 'Auch ein langsamer Tag ist ein Tag in die richtige Richtung.',
    source: 'Gedanke für heute',
  },
];

// Duas für das Ende der „Kurzen Pause“.
export const PAUSE_DUAS = [
  {
    text: 'O Allah, ich suche Zuflucht bei Dir vor dem Übel meines Hörens, meines Sehens, meiner Zunge, meines Herzens und meiner Begierde.',
    ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ سَمْعِي وَمِنْ شَرِّ بَصَرِي وَمِنْ شَرِّ لِسَانِي وَمِنْ شَرِّ قَلْبِي وَمِنْ شَرِّ مَنِيِّي',
    source: 'Sunan Abi Dawud, Jami at-Tirmidhi',
  },
  {
    text: 'O Du, der die Herzen wendet, festige mein Herz auf Deinem Weg.',
    ar: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    source: 'Jami at-Tirmidhi',
  },
  {
    text: 'O Allah, auf Deine Barmherzigkeit hoffe ich. Überlass mich nicht einen Augenblick mir selbst, und bring all meine Angelegenheiten in Ordnung.',
    ar: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ',
    source: 'Sunan Abi Dawud',
  },
];

// Deterministische Tagesauswahl: jeden Tag ein anderer Eintrag,
// in einer festen, gemischten Reihenfolge, damit sich Kategorien abwechseln.
function dayNumber(date) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(utc / 86400000);
}

function stride(n) {
  // Schrittweite, die teilerfremd zur Länge ist → jeder Eintrag kommt dran
  let s = 7;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  while (gcd(s, n) !== 1) s++;
  return s;
}

export function quoteOfDay(date = new Date(), cats = null) {
  const list = cats ? QUOTES.filter((q) => cats.includes(q.cat)) : QUOTES;
  const n = list.length;
  return list[(dayNumber(date) * stride(n)) % n];
}

export function quoteById(id) {
  return QUOTES.find((q) => q.id === id);
}
