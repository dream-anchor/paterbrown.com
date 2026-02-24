import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Datenschutz = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Datenschutz"
        description="Datenschutzerklärung für Pater Brown Live-Hörspiel. Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO."
        robots="index, follow"
        canonical="/datenschutz"
        ogTitle="Datenschutz | Pater Brown Live-Hörspiel"
        ogDescription="Informationen zur Datenverarbeitung und Ihren Rechten gemäß DSGVO."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <section className="py-28 md:py-36 px-6">
          <div className="container mx-auto max-w-3xl">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-heading mb-6">
            Rechtliches
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-[8rem] leading-[0.85] font-heading text-foreground mb-8">
            Datenschutz
          </h1>
          <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24 mb-12" aria-hidden="true" />

          <div className="space-y-10 text-foreground/70 leading-relaxed">
            {/* 1 */}
            <div className="space-y-4">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                1. Datenschutz auf einen Blick
              </h2>
              <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
              </p>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24" aria-hidden="true" />

            {/* 2 */}
            <div className="space-y-6">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                2. Datenerfassung auf dieser Website
              </h2>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Wer ist verantwortlich?</h3>
                <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle“ in dieser Datenschutzerklärung entnehmen.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Wie erfassen wir Ihre Daten?</h3>
                <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
                <p>Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Wofür nutzen wir Ihre Daten?</h3>
                <p>Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. Sofern über die Website Verträge geschlossen oder angebahnt werden können, werden die übermittelten Daten auch für Vertragsangebote, Bestellungen oder sonstige Auftragsanfragen verarbeitet.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Welche Rechte haben Sie?</h3>
                <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.</p>
                <p>Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.</p>
              </div>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24" aria-hidden="true" />

            {/* 3 */}
            <div className="space-y-6">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                3. Hosting
              </h2>
              <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter:</p>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Strato</h3>
                <p>Anbieter ist die Strato AG, Otto-Ostrowski-Straße 7, 10249 Berlin (nachfolgend „Strato“). Wenn Sie unsere Website besuchen, erfasst Strato verschiedene Logfiles inklusive Ihrer IP-Adressen.</p>
                <p>
                  Weitere Informationen entnehmen Sie der Datenschutzerklärung von Strato:{" "}
                  <a href="https://www.strato.de/datenschutz/" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                    strato.de/datenschutz
                  </a>
                </p>
                <p>Die Verwendung von Strato erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website. Sofern eine entsprechende Einwilligung abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG, soweit die Einwilligung die Speicherung von Cookies oder den Zugriff auf Informationen im Endgerät des Nutzers im Sinne des TDDDG umfasst. Die Einwilligung ist jederzeit widerrufbar.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Auftragsverarbeitung</h3>
                <p>Wir haben einen Vertrag über Auftragsverarbeitung (AVV) zur Nutzung des oben genannten Dienstes geschlossen. Hierbei handelt es sich um einen datenschutzrechtlich vorgeschriebenen Vertrag, der gewährleistet, dass dieser die personenbezogenen Daten unserer Websitebesucher nur nach unseren Weisungen und unter Einhaltung der DSGVO verarbeitet.</p>
              </div>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24" aria-hidden="true" />

            {/* 4 */}
            <div className="space-y-6">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                4. Allgemeine Hinweise und Pflichtinformationen
              </h2>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Datenschutz</h3>
                <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
                <p>Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen.</p>
                <p>Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Verantwortliche Stelle</h3>
                <p>
                  Dream &amp; Anchor Handelsgesellschaft mbH<br />
                  Nördliche Münchner Straße 27a<br />
                  82031 Grünwald<br />
                  Telefon: +49 89 909015 3943<br />
                  E-Mail:{" "}
                  <a href="mailto:hello@dream-anchor.com" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                    hello@dream-anchor.com
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Speicherdauer</h3>
                <p>Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Rechtsgrundlagen</h3>
                <p>Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2 lit. a DSGVO. Sind Ihre Daten zur Vertragserfüllung oder zur Durchführung vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur Erfüllung einer rechtlichen Verpflichtung erforderlich sind auf Grundlage von Art. 6 Abs. 1 lit. c DSGVO.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Widerruf Ihrer Einwilligung</h3>
                <p>Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Widerspruchsrecht (Art. 21 DSGVO)</h3>
                <p>Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, haben Sie jederzeit das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen. Werden Ihre personenbezogenen Daten verarbeitet, um Direktwerbung zu betreiben, so haben Sie das Recht, jederzeit Widerspruch gegen die Verarbeitung einzulegen.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Beschwerderecht</h3>
                <p>Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Recht auf Datenübertragbarkeit</h3>
                <p>Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Auskunft, Berichtigung und Löschung</h3>
                <p>Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Einschränkung der Verarbeitung</h3>
                <p>Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Das Recht besteht insbesondere wenn Sie die Richtigkeit der Daten bestreiten, die Verarbeitung unrechtmäßig ist, wir die Daten nicht mehr benötigen oder Sie Widerspruch eingelegt haben.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Widerspruch gegen Werbe-E-Mails</h3>
                <p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.</p>
              </div>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24" aria-hidden="true" />

            {/* 5 */}
            <div className="space-y-6">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                5. Datenerfassung auf dieser Website
              </h2>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Cookies</h3>
                <p>Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.</p>
                <p>Cookies, die zur Durchführung des elektronischen Kommunikationsvorgangs, zur Bereitstellung bestimmter, von Ihnen erwünschter Funktionen oder zur Optimierung der Website erforderlich sind (notwendige Cookies), werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert, sofern keine andere Rechtsgrundlage angegeben wird.</p>
                <p>Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browsers aktivieren.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Server-Log-Dateien</h3>
                <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Browsertyp und Browserversion</li>
                  <li>verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>
                <p>Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gold text-xs uppercase tracking-[0.2em] font-heading">Anfrage per E-Mail, Telefon oder Telefax</h3>
                <p>Wenn Sie uns per E-Mail, Telefon oder Telefax kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
                <p>Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/"
                className="text-gold text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors"
              >
                Zurück zur Startseite &rarr;
              </Link>
            </div>
          </div>
        </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Datenschutz;
