import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import Section from "@/components/ui/Section";

const Datenschutz = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Datenschutz"
        description="Datenschutzerkl\u00E4rung f\u00FCr Pater Brown Live-H\u00F6rspiel. Informationen zur Verarbeitung personenbezogener Daten gem\u00E4\u00DF DSGVO."
        robots="index, follow"
        canonical="/datenschutz"
        ogTitle="Datenschutz | Pater Brown Live-H\u00F6rspiel"
        ogDescription="Informationen zur Datenverarbeitung und Ihren Rechten gem\u00E4\u00DF DSGVO."
      />
      <Navigation />

      <main className="flex-1 pt-32 pb-16">
        <Section container="narrow">
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-heading mb-4">
            Rechtliches
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-4">
            Datenschutz
          </h1>
          <div className="divider-gold mb-12 max-w-xs" aria-hidden="true" />

          <div className="space-y-10 font-serif text-foreground/70 leading-relaxed tracking-[0.03em]">
            {/* 1 */}
            <div className="space-y-4">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                1. Datenschutz auf einen Blick
              </h2>
              <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen \u00DCberblick dar\u00FCber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie pers\u00F6nlich identifiziert werden k\u00F6nnen. Ausf\u00FChrliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgef\u00FChrten Datenschutzerkl\u00E4rung.
              </p>
            </div>

            <div className="divider-gold max-w-[100px]" aria-hidden="true" />

            {/* 2 */}
            <div className="space-y-6">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                2. Datenerfassung auf dieser Website
              </h2>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Wer ist verantwortlich?</h3>
                <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten k\u00F6nnen Sie dem Abschnitt \u201EHinweis zur Verantwortlichen Stelle\u201C in dieser Datenschutzerkl\u00E4rung entnehmen.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Wie erfassen wir Ihre Daten?</h3>
                <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
                <p>Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Wof\u00FCr nutzen wir Ihre Daten?</h3>
                <p>Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gew\u00E4hrleisten. Andere Daten k\u00F6nnen zur Analyse Ihres Nutzerverhaltens verwendet werden. Sofern \u00FCber die Website Vertr\u00E4ge geschlossen oder angebahnt werden k\u00F6nnen, werden die \u00FCbermittelten Daten auch f\u00FCr Vertragsangebote, Bestellungen oder sonstige Auftragsanfragen verarbeitet.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Welche Rechte haben Sie?</h3>
                <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft \u00FCber Herkunft, Empf\u00E4nger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben au\u00DFerdem ein Recht, die Berichtigung oder L\u00F6schung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, k\u00F6nnen Sie diese Einwilligung jederzeit f\u00FCr die Zukunft widerrufen. Au\u00DFerdem haben Sie das Recht, unter bestimmten Umst\u00E4nden die Einschr\u00E4nkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zust\u00E4ndigen Aufsichtsbeh\u00F6rde zu.</p>
                <p>Hierzu sowie zu weiteren Fragen zum Thema Datenschutz k\u00F6nnen Sie sich jederzeit an uns wenden.</p>
              </div>
            </div>

            <div className="divider-gold max-w-[100px]" aria-hidden="true" />

            {/* 3 */}
            <div className="space-y-6">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                3. Hosting
              </h2>
              <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter:</p>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Strato</h3>
                <p>Anbieter ist die Strato AG, Otto-Ostrowski-Stra\u00DFe 7, 10249 Berlin (nachfolgend \u201EStrato\u201C). Wenn Sie unsere Website besuchen, erfasst Strato verschiedene Logfiles inklusive Ihrer IP-Adressen.</p>
                <p>
                  Weitere Informationen entnehmen Sie der Datenschutzerkl\u00E4rung von Strato:{" "}
                  <a href="https://www.strato.de/datenschutz/" target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                    strato.de/datenschutz
                  </a>
                </p>
                <p>Die Verwendung von Strato erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an einer m\u00F6glichst zuverl\u00E4ssigen Darstellung unserer Website. Sofern eine entsprechende Einwilligung abgefragt wurde, erfolgt die Verarbeitung ausschlie\u00DFlich auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO und \u00A7 25 Abs. 1 TDDDG, soweit die Einwilligung die Speicherung von Cookies oder den Zugriff auf Informationen im Endger\u00E4t des Nutzers im Sinne des TDDDG umfasst. Die Einwilligung ist jederzeit widerrufbar.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Auftragsverarbeitung</h3>
                <p>Wir haben einen Vertrag \u00FCber Auftragsverarbeitung (AVV) zur Nutzung des oben genannten Dienstes geschlossen. Hierbei handelt es sich um einen datenschutzrechtlich vorgeschriebenen Vertrag, der gew\u00E4hrleistet, dass dieser die personenbezogenen Daten unserer Websitebesucher nur nach unseren Weisungen und unter Einhaltung der DSGVO verarbeitet.</p>
              </div>
            </div>

            <div className="divider-gold max-w-[100px]" aria-hidden="true" />

            {/* 4 */}
            <div className="space-y-6">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                4. Allgemeine Hinweise und Pflichtinformationen
              </h2>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Datenschutz</h3>
                <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer pers\u00F6nlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerkl\u00E4rung.</p>
                <p>Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Die vorliegende Datenschutzerkl\u00E4rung erl\u00E4utert, welche Daten wir erheben und wof\u00FCr wir sie nutzen.</p>
                <p>Wir weisen darauf hin, dass die Daten\u00FCbertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitsl\u00FCcken aufweisen kann. Ein l\u00FCckenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht m\u00F6glich.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Verantwortliche Stelle</h3>
                <p>
                  Dream &amp; Anchor Handelsgesellschaft mbH<br />
                  N\u00F6rdliche M\u00FCnchner Stra\u00DFe 27a<br />
                  82031 Gr\u00FCnwald<br />
                  Telefon: +49 89 909015 3943<br />
                  E-Mail:{" "}
                  <a href="mailto:hello@dream-anchor.com" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                    hello@dream-anchor.com
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Speicherdauer</h3>
                <p>Soweit innerhalb dieser Datenschutzerkl\u00E4rung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck f\u00FCr die Datenverarbeitung entf\u00E4llt.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Rechtsgrundlagen</h3>
                <p>Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2 lit. a DSGVO. Sind Ihre Daten zur Vertragserf\u00FCllung oder zur Durchf\u00FChrung vorvertraglicher Ma\u00DFnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur Erf\u00FCllung einer rechtlichen Verpflichtung erforderlich sind auf Grundlage von Art. 6 Abs. 1 lit. c DSGVO.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Widerruf Ihrer Einwilligung</h3>
                <p>Viele Datenverarbeitungsvorg\u00E4nge sind nur mit Ihrer ausdr\u00FCcklichen Einwilligung m\u00F6glich. Sie k\u00F6nnen eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtm\u00E4\u00DFigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unber\u00FChrt.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Widerspruchsrecht (Art. 21 DSGVO)</h3>
                <p>Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, haben Sie jederzeit das Recht, aus Gr\u00FCnden, die sich aus Ihrer besonderen Situation ergeben, gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen. Werden Ihre personenbezogenen Daten verarbeitet, um Direktwerbung zu betreiben, so haben Sie das Recht, jederzeit Widerspruch gegen die Verarbeitung einzulegen.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Beschwerderecht</h3>
                <p>Im Falle von Verst\u00F6\u00DFen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbeh\u00F6rde, insbesondere in dem Mitgliedstaat ihres gew\u00F6hnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutma\u00DFlichen Versto\u00DFes zu.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Recht auf Daten\u00FCbertragbarkeit</h3>
                <p>Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erf\u00FCllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem g\u00E4ngigen, maschinenlesbaren Format aush\u00E4ndigen zu lassen.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Auskunft, Berichtigung und L\u00F6schung</h3>
                <p>Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft \u00FCber Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empf\u00E4nger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder L\u00F6schung dieser Daten.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Einschr\u00E4nkung der Verarbeitung</h3>
                <p>Sie haben das Recht, die Einschr\u00E4nkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Das Recht besteht insbesondere wenn Sie die Richtigkeit der Daten bestreiten, die Verarbeitung unrechtm\u00E4\u00DFig ist, wir die Daten nicht mehr ben\u00F6tigen oder Sie Widerspruch eingelegt haben.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Widerspruch gegen Werbe-E-Mails</h3>
                <p>Der Nutzung von im Rahmen der Impressumspflicht ver\u00F6ffentlichten Kontaktdaten zur \u00DCbersendung von nicht ausdr\u00FCcklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.</p>
              </div>
            </div>

            <div className="divider-gold max-w-[100px]" aria-hidden="true" />

            {/* 5 */}
            <div className="space-y-6">
              <h2 className="text-foreground font-heading text-lg uppercase tracking-[0.1em]">
                5. Datenerfassung auf dieser Website
              </h2>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Cookies</h3>
                <p>Unsere Internetseiten verwenden so genannte \u201ECookies\u201C. Cookies sind kleine Datenpakete und richten auf Ihrem Endger\u00E4t keinen Schaden an. Sie werden entweder vor\u00FCbergehend f\u00FCr die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endger\u00E4t gespeichert.</p>
                <p>Cookies, die zur Durchf\u00FChrung des elektronischen Kommunikationsvorgangs, zur Bereitstellung bestimmter, von Ihnen erw\u00FCnschter Funktionen oder zur Optimierung der Website erforderlich sind (notwendige Cookies), werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert, sofern keine andere Rechtsgrundlage angegeben wird.</p>
                <p>Sie k\u00F6nnen Ihren Browser so einstellen, dass Sie \u00FCber das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies f\u00FCr bestimmte F\u00E4lle oder generell ausschlie\u00DFen sowie das automatische L\u00F6schen der Cookies beim Schlie\u00DFen des Browsers aktivieren.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Server-Log-Dateien</h3>
                <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns \u00FCbermittelt. Dies sind:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Browsertyp und Browserversion</li>
                  <li>verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>
                <p>Eine Zusammenf\u00FChrung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-heading">Anfrage per E-Mail, Telefon oder Telefax</h3>
                <p>Wenn Sie uns per E-Mail, Telefon oder Telefax kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
                <p>Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erf\u00FCllung eines Vertrags zusammenh\u00E4ngt oder zur Durchf\u00FChrung vorvertraglicher Ma\u00DFnahmen erforderlich ist.</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/"
                className="text-primary text-xs font-heading uppercase tracking-[0.15em] hover:text-foreground transition-colors"
              >
                Zur\u00FCck zur Startseite &rarr;
              </Link>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default Datenschutz;
