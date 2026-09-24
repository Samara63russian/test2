import { jsPDF } from 'jspdf';
import { Language } from '../types';

export function generateSwissGuidePdf(lang: Language, recipientEmail?: string, birthYear?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const titles = {
    de: {
      docTitle: 'STAATLICHE AUSZAHLUNGEN SCHWEIZ 2026',
      subTitle: 'Der offizielle Bürger- & Familienleitfaden für alle 26 Kantone',
      edition: 'Ausgabe 2026 • Stand: Frühjahr 2026 • Bundesamt für Sozialversicherungen (BSV) konform',
      recipient: recipientEmail ? `Persönliches Exemplar für: ${recipientEmail} (Jahrgang: ${birthYear || 'Angemeldet'})` : 'Offizieller Bürger-Leitfaden 2026',
      p1Heading: '1. KRANKENKASSEN-PRÄMIENVERBILLIGUNG (IPV)',
      p1Body: 'Die Krankenkassenprämien sind in der Schweiz einer der grössten Budgetposten. Liegt das steuerbare Gesamteinkommen unter kantonalen Grenzbeträgen, erstattet der Kanton namhafte Beträge.\n\n• Kanton Basel-Landschaft: Richtprämie Erwachsene CHF 4\'596 / Jahr.\n• Kanton St. Gallen: Striktes Fristende am 31. Mai 2026!\n• Kanton Zürich: Automatische Richtprämien-Veranlagung via Steuerdaten.\n• Kanton Genf & Waadt: Grosszügige IPV-Schwellen bei mittleren Einkommen.',
      p2Heading: '2. GESETZLICHE FAMILIENZULAGEN (FamZG)',
      p2Body: 'Gemäss Bundesgesetz über die Familienzulagen hat jeder Arbeitnehmer und Selbstständige mit Einkommen über CHF 7\'350/Jahr Anspruch:\n\n• Kinderzulage (bis 16 Jahre): Mindestens CHF 215.– bis CHF 311.– pro Monat.\n• Ausbildungszulage (16–25 Jahre): Mindestens CHF 268.– bis CHF 415.– pro Monat.\n• Zürich zahlt z.B. CHF 3\'216/Jahr pro Kind (CHF 268/Mt.).\n• Genf & Wallis gehören zu den Spitzenreitern mit über CHF 300/Mt. pro Kind.',
      p3Heading: '3. ERGÄNZUNGSLEISTUNGEN (EL) & MIETZUSCHUSS',
      p3Body: 'Ergänzungsleistungen sind kein Almosen, sondern ein verfassungsmässiger Rechtsanspruch für AHV- und IV-Rentner:\n\n• Lebensbedarf Alleinstehende: CHF 20\'670 pro Jahr.\n• Lebensbedarf Ehepaare: CHF 31\'005 pro Jahr.\n• Mietzuschuss (Region 1 / Grosszentren): Bis zu CHF 18\'300 pro Jahr.\n• Vermögensfreibetrag: CHF 100\'000 (Single) / CHF 200\'000 (Ehepaar).',
      p4Heading: '4. AHV-RENTEN AUSZAHLUNGSKALENDER 2026',
      p4Body: 'Renten werden pünktlich an folgenden Werktagen überwiesen:\n• 05. Januar 2026  |  02. Februar 2026  |  02. März 2026\n• 06. April 2026    |  05. Mai 2026      |  02. Juni 2026\n• 03. Juli 2026     |  04. August 2026   |  02. September 2026\n• 02. Oktober 2026  |  03. November 2026 |  02. Dezember 2026 (+ 13. Rente!)',
      p5Heading: '5. WICHTIGE HINWEISE FÜR AUSLÄNDISCHE STAATSANGEHÖRIGE',
      p5Body: '• Bewilligung C (Niederlassung): 100% identische Leistungsansprüche wie Schweizer Bürger.\n• Bewilligung B (Aufenthalt): Voller Anspruch auf Kinderzulagen & Prämienverbilligung.\n• Achtung bei EL: Wohnsitzdauer-Voraussetzung je nach Herkunftsland beachten.',
      footerNote: 'Herausgegeben von: Schweizer Auszahlungs-Kompass 2026 • ahv-iv.ch • gdk-cds.ch • bsv.admin.ch'
    },
    fr: {
      docTitle: 'PRESTATIONS DE L\'ÉTAT EN SUISSE 2026',
      subTitle: 'Le guide officiel pour les citoyens et familles dans les 26 cantons',
      edition: 'Édition 2026 • Conforme aux directives de l\'Office fédéral des assurances sociales (OFAS)',
      recipient: recipientEmail ? `Exemplaire personnel pour : ${recipientEmail} (Année : ${birthYear || 'Inscrit'})` : 'Guide officiel du citoyen 2026',
      p1Heading: '1. RÉDUCTION INDIVIDUELLE DES PRIMES MALADIE (RIP)',
      p1Body: 'Les primes d\'assurance-maladie représentent une part majeure du budget des ménages. Lorsque le revenu déterminant se situe sous les barèmes, le canton prend en charge une part substantielle.\n\n• Canton de Bâle-Campagne : Prime de référence adulte de CHF 4\'596 / an.\n• Canton de Saint-Gall : Délai impératif fixé au 31 mai 2026 !\n• Canton de Vaud & Genève : Subventions très protectrices pour la classe moyenne.\n• Canton de Zurich : Calcul automatisé basé sur la déclaration fiscale.',
      p2Heading: '2. ALLOCATIONS FAMILIALES LÉGALES (LAFam)',
      p2Body: 'Conformément à la Loi fédérale sur les allocations familiales (LAFam), tout salarié ou indépendant dès CHF 7\'350/an de revenu est bénéficiaire :\n\n• Allocation pour enfant (jusqu\'à 16 ans) : De CHF 215.– à CHF 311.– par mois.\n• Allocation de formation (16–25 ans) : De CHF 268.– à CHF 415.– par mois.\n• À Zurich : CHF 3\'216/an par enfant (CHF 268/mois).\n• À Genève & Valais : Plus de CHF 300/mois par enfant dès le 1er enfant.',
      p3Heading: '3. PRESTATIONS COMPLÉMENTAIRES (PC/EL) & LOYER',
      p3Body: 'Les prestations complémentaires ne relèvent pas de l\'aide sociale mais constituent un droit strict pour les aînés et rentiers AI :\n\n• Besoins vitaux personne seule : CHF 20\'670 par an.\n• Besoins vitaux pour couple : CHF 31\'005 par an.\n• Supplément loyer (Grandes agglomérations) : Jusqu\'à CHF 18\'300 par an.\n• Seuil de fortune exonérée : CHF 100\'000 (Seul) / CHF 200\'000 (Couple).',
      p4Heading: '4. CALENDRIER OFFICIEL DES VERSEMENTS AVS 2026',
      p4Body: 'Les rentes sont créditées au début de chaque mois :\n• 05 janvier 2026   |  02 février 2026   |  02 mars 2026\n• 06 avril 2026     |  05 mai 2026       |  02 juin 2026\n• 03 juillet 2026   |  04 août 2026      |  02 septembre 2026\n• 02 octobre 2026   |  03 novembre 2026  |  02 décembre 2026 (+ 13e rente !)',
      p5Heading: '5. DROITS DES RÉSIDENTS ÉTRANGERS EN SUISSE',
      p5Body: '• Permis C (Établissement) : Droits strictement égaux aux ressortissants suisses.\n• Permis B (Séjour) : Plein droit aux allocations familiales et subsides maladie.\n• Prestations complémentaires : Délai de carence de 5 à 10 ans selon la nationalité.',
      footerNote: 'Édité par : Boussole des Prestations Suisses 2026 • ahv-iv.ch • gdk-cds.ch • bsv.admin.ch'
    },
    it: {
      docTitle: 'PRESTAZIONI STATALI IN SVIZZERA 2026',
      subTitle: 'La guida ufficiale per cittadini e famiglie in tutti i 26 Cantoni',
      edition: 'Edizione 2026 • Conforme all\'Ufficio federale delle assicurazioni sociali (UFAS)',
      recipient: recipientEmail ? `Copia personale per: ${recipientEmail} (Anno: ${birthYear || 'Iscritto'})` : 'Guida ufficiale per il cittadino 2026',
      p1Heading: '1. RIDUZIONE DEI PREMI CASSA MALATI (RIP)',
      p1Body: 'I premi dell\'assicurazione sanitaria incidono pesantemente sul reddito. Se il reddito computabile rientra nei limiti cantonali, il Cantone versa un consistente contributo.\n\n• Canton Basilea Campagna: Premio di riferimento adulti CHF 4\'596 / anno.\n• Canton San Gallo: Termine perentorio fissato al 31 maggio 2026!\n• Canton Ticino: Richiesta da presentare all\'Istituto delle assicurazioni sociali.\n• Canton Zurigo: Determinazione automatica tramite i dati di tassazione.',
      p2Heading: '2. ASSEGNI FAMILIARI DI LEGGE (LAFam)',
      p2Body: 'In virtù della Legge federale sugli assegni familiari, ogni lavoratore con reddito di almeno CHF 7\'350/anno ne ha diritto:\n\n• Assegno per figli (fino a 16 anni): Da CHF 215.– a CHF 311.– al mese.\n• Assegno di formazione (16–25 anni): Da CHF 268.– a CHF 415.– al mese.\n• A Zurigo: CHF 3\'216/anno per figlio (CHF 268/mese).\n• A Ginevra e Vallese: Oltre CHF 300/mese per figlio.',
      p3Heading: '3. PRESTAZIONI COMPLEMENTARI (PC/EL) & AFFITTO',
      p3Body: 'Le prestazioni complementari non sono beneficenza ma un diritto legale per i beneficiari di rendita AVS e AI:\n\n• Minimo vitale persona sola: CHF 20\'670 all\'anno.\n• Minimo vitale per coppie: CHF 31\'005 all\'anno.\n• Contributo affitto (Grandi centri urbani): Fino a CHF 18\'300 all\'anno.\n• Franchigia sulla sostanza: CHF 100\'000 (Single) / CHF 200\'000 (Coppia).',
      p4Heading: '4. CALENDARIO PAGAMENTI RENDITE AVS 2026',
      p4Body: 'Le rendite vengono accreditate all\'inizio del mese:\n• 05 gennaio 2026   |  02 febbraio 2026  |  02 marzo 2026\n• 06 aprile 2026    |  05 maggio 2026    |  02 giugno 2026\n• 03 luglio 2026    |  04 agosto 2026    |  02 settembre 2026\n• 02 ottobre 2026   |  03 novembre 2026  |  02 dicembre 2026 (+ 13esima rendita!)',
      p5Heading: '5. DIRITTI DEI CITTADINI STRANIERI IN SVIZZERA',
      p5Body: '• Permesso C (Domicilio): Diritti al 100% equiparati ai cittadini svizzeri.\n• Permesso B (Dimora): Pieno diritto ad assegni familiari e riduzione premi cassa malati.\n• Prestazioni complementari: Periodo di residenza ininterrotta richiesto in base al Paese.',
      footerNote: 'Pubblicato da: Bussola delle Prestazioni Svizzere 2026 • ahv-iv.ch • gdk-cds.ch • bsv.admin.ch'
    }
  };

  const t = titles[lang] || titles.de;

  // Header Background bar
  doc.setFillColor(213, 43, 30); // Swiss Red
  doc.rect(0, 0, 210, 28, 'F');

  // Swiss Cross in header
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 5, 18, 18, 3, 3, 'F');
  doc.setFillColor(213, 43, 30);
  doc.rect(21, 8, 4, 12, 'F');
  doc.rect(17, 12, 12, 4, 'F');

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(t.docTitle, 38, 13);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 240, 240);
  doc.text(t.subTitle, 38, 20);

  // Subheader badge
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 33, 182, 12, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(11, 25, 44);
  doc.text(t.edition, 18, 38);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(t.recipient, 18, 42.5);

  let curY = 52;

  // Helper for section rendering
  const renderSection = (heading: string, bodyText: string, color = [11, 25, 44]) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, curY, 182, 33, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, curY, 182, 33, 2, 2, 'S');

    // Red left indicator
    doc.setFillColor(213, 43, 30);
    doc.rect(14, curY, 3, 33, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(heading, 21, curY + 6);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitBody = doc.splitTextToSize(bodyText, 170);
    doc.text(splitBody, 21, curY + 11.5);

    curY += 36;
  };

  renderSection(t.p1Heading, t.p1Body);
  renderSection(t.p2Heading, t.p2Body);
  renderSection(t.p3Heading, t.p3Body);
  renderSection(t.p4Heading, t.p4Body);
  renderSection(t.p5Heading, t.p5Body);

  // Footer bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(t.footerNote, 14, 287);
  doc.text('© 2026 Swiss Benefits Guide • Nicht-kommerzieller Bürger-Wegweiser', 14, 292);

  // File name based on language
  const fileNames = {
    de: 'Schweiz_Staatliche_Auszahlungen_Leitfaden_2026.pdf',
    fr: 'Suisse_Prestations_Etat_Guide_2026.pdf',
    it: 'Svizzera_Prestazioni_Statali_Guida_2026.pdf'
  };

  doc.save(fileNames[lang] || fileNames.de);
}
