import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import paterbrown from "@/assets/pater-brown-logo.png";
import heroBackground from "@/assets/hero-background.jpg";

const Datenschutz = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Datenschutz"
        description="Datenschutzerklärung für Pater Brown Live-Hörspiel. Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO."
        robots="index, follow"
        canonical="/datenschutz"
        ogTitle="Datenschutz | Pater Brown Live-Hörspiel"
        ogDescription="Informationen zur Datenverarbeitung und Ihren Rechten gemäß DSGVO."
      />
      <div 
        className="relative bg-cover bg-top bg-no-repeat min-h-[300px]"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
          backgroundPositionY: '-200px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        
        <div className="relative container mx-auto px-6 py-4">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <img 
              src={paterbrown} 
              alt="Pater Brown Logo" 
              className="h-[84px] w-auto"
            />
          </Link>
        </div>
      </div>

      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="premium-card p-8 md:p-12 space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <p className="text-gold uppercase tracking-[0.3em] text-sm font-light">
                Rechtliches
              </p>
              <h1 className="text-6xl md:text-8xl font-heading tracking-wider text-gold mb-12 uppercase">
                Datenschutz
              </h1>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gold to-transparent h-[1px]" />

            {/* 1. Datenschutz auf einen Blick */}
            <div className="space-y-6">
              <h2 className="text-gold uppercase tracking-[0.2em] text-2xl font-semibold">
                1. Datenschutz auf einen Blick
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Allgemeine Hinweise
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
                </p>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />

            {/* 2. Datenerfassung auf dieser Website */}
            <div className="space-y-6">
              <h2 className="text-gold uppercase tracking-[0.2em] text-2xl font-semibold">
                2. Datenerfassung auf dieser Website
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Wer ist verantwortlich für die Datenerfassung auf dieser Website?
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Wie erfassen wir Ihre Daten?
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Wofür nutzen wir Ihre Daten?
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. Sofern über die Website Verträge geschlossen oder angebahnt werden können, werden die übermittelten Daten auch für Vertragsangebote, Bestellungen oder sonstige Auftragsanfragen verarbeitet.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Welche Rechte haben Sie bezüglich Ihrer Daten?
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
                </p>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />

            {/* 3. Hosting */}
            <div className="space-y-6">
              <h2 className="text-gold uppercase tracking-[0.2em] text-2xl font-semibold">
                3. Hosting
              </h2>
              
              <p className="text-foreground/80 leading-relaxed">
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
              </p>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Strato
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Anbieter ist die Strato AG, Otto-Ostrowski-Straße 7, 10249 Berlin (nachfolgend „Strato"). Wenn Sie unsere Website besuchen, erfasst Strato verschiedene Logfiles inklusive Ihrer IP-Adressen.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Weitere Informationen entnehmen Sie der Datenschutzerklärung von Strato:{' '}
                  <a href="https://www.strato.de/datenschutz/" target="_blank" rel="noreferrer" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">
                    https://www.strato.de/datenschutz/
                  </a>
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Die Verwendung von Strato erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website. Sofern eine entsprechende Einwilligung abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG, soweit die Einwilligung die Speicherung von Cookies oder den Zugriff auf Informationen im Endgerät des Nutzers (z. B. Device-Fingerprinting) im Sinne des TDDDG umfasst. Die Einwilligung ist jederzeit widerrufbar.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Auftragsverarbeitung
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Wir haben einen Vertrag über Auftragsverarbeitung (AVV) zur Nutzung des oben genannten Dienstes geschlossen. Hierbei handelt es sich um einen datenschutzrechtlich vorgeschriebenen Vertrag, der gewährleistet, dass dieser die personenbezogenen Daten unserer Websitebesucher nur nach unseren Weisungen und unter Einhaltung der DSGVO verarbeitet.
                </p>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />

            {/* 4. Allgemeine Hinweise und Pflichtinformationen */}
            <div className="space-y-6">
              <h2 className="text-gold uppercase tracking-[0.2em] text-2xl font-semibold">
                4. Allgemeine Hinweise und Pflichtinformationen
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Datenschutz
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Hinweis zur verantwortlichen Stelle
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Dream & Anchor Handelsgesellschaft mbH<br/>
                  Nördliche Münchner Straße 27a<br/>
                  82031 Grünwald<br/>
                  Telefon: +49 89 909015 3943<br/>
                  E-Mail: <a href="mailto:hello@dream-anchor.com" className="text-gold hover:text-gold/80 transition-colors underline-offset-4 hover:underline">hello@dream-anchor.com</a>
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Speicherdauer
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung auf dieser Website
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2 lit. a DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO verarbeitet werden. Im Falle einer ausdrücklichen Einwilligung in die Übertragung personenbezogener Daten in Drittstaaten erfolgt die Datenverarbeitung außerdem auf Grundlage von Art. 49 Abs. 1 lit. a DSGVO. Sofern Sie in die Speicherung von Cookies oder in den Zugriff auf Informationen in Ihr Endgerät (z. B. via Device-Fingerprinting) eingewilligt haben, erfolgt die Datenverarbeitung zusätzlich auf Grundlage von § 25 Abs. 1 TDDDG. Die Einwilligung ist jederzeit widerrufbar. Sind Ihre Daten zur Vertragserfüllung oder zur Durchführung vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur Erfüllung einer rechtlichen Verpflichtung erforderlich sind auf Grundlage von Art. 6 Abs. 1 lit. c DSGVO. Die Datenverarbeitung kann ferner auf Grundlage unseres berechtigten Interesses nach Art. 6 Abs. 1 lit. f DSGVO erfolgen. Über die jeweils im Einzelfall einschlägigen Rechtsgrundlagen wird in den folgenden Absätzen dieser Datenschutzerklärung informiert.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Empfänger von personenbezogenen Daten
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Im Rahmen unserer Geschäftstätigkeit arbeiten wir mit verschiedenen externen Stellen zusammen. Dabei ist teilweise auch eine Übermittlung von personenbezogenen Daten an diese externen Stellen erforderlich. Wir geben personenbezogene Daten nur dann an externe Stellen weiter, wenn dies im Rahmen einer Vertragserfüllung erforderlich ist, wenn wir gesetzlich hierzu verpflichtet sind (z. B. Weitergabe von Daten an Steuerbehörden), wenn wir ein berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO an der Weitergabe haben oder wenn eine sonstige Rechtsgrundlage die Datenweitergabe erlaubt. Beim Einsatz von Auftragsverarbeitern geben wir personenbezogene Daten unserer Kunden nur auf Grundlage eines gültigen Vertrags über Auftragsverarbeitung weiter. Im Falle einer gemeinsamen Verarbeitung wird ein Vertrag über gemeinsame Verarbeitung geschlossen.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Widerruf Ihrer Einwilligung zur Datenverarbeitung
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen Direktwerbung (Art. 21 DSGVO)
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, haben Sie jederzeit das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen; dies gilt auch für ein auf diese Bestimmungen gestütztes Profiling. Die jeweilige Rechtsgrundlage, auf denen eine Verarbeitung beruht, entnehmen Sie dieser Datenschutzerklärung. Wenn Sie Widerspruch einlegen, werden wir Ihre betroffenen personenbezogenen Daten nicht mehr verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen (Widerspruch nach Art. 21 Abs. 1 DSGVO).
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Werden Ihre personenbezogenen Daten verarbeitet, um Direktwerbung zu betreiben, so haben Sie das Recht, jederzeit Widerspruch gegen die Verarbeitung Sie betreffender personenbezogener Daten zum Zwecke derartiger Werbung einzulegen; dies gilt auch für das Profiling, soweit es mit solcher Direktwerbung in Verbindung steht. Wenn Sie widersprechen, werden Ihre personenbezogenen Daten anschließend nicht mehr zum Zwecke der Direktwerbung verwendet (Widerspruch nach Art. 21 Abs. 2 DSGVO).
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Beschwerderecht bei der zuständigen Aufsichtsbehörde
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. Das Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Recht auf Datenübertragbarkeit
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar ist.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Auskunft, Berichtigung und Löschung
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Recht auf Einschränkung der Verarbeitung
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Hierzu können Sie sich jederzeit an uns wenden. Das Recht auf Einschränkung der Verarbeitung besteht in folgenden Fällen:
                </p>
                <ul className="list-disc list-inside text-foreground/80 leading-relaxed space-y-2 ml-4">
                  <li>Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten personenbezogenen Daten bestreiten, benötigen wir in der Regel Zeit, um dies zu überprüfen. Für die Dauer der Prüfung haben Sie das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.</li>
                  <li>Wenn die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig geschah/geschieht, können Sie statt der Löschung die Einschränkung der Datenverarbeitung verlangen.</li>
                  <li>Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen, Sie sie jedoch zur Ausübung, Verteidigung oder Geltendmachung von Rechtsansprüchen benötigen, haben Sie das Recht, statt der Löschung die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.</li>
                  <li>Wenn Sie einen Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt haben, muss eine Abwägung zwischen Ihren und unseren Interessen vorgenommen werden. Solange noch nicht feststeht, wessen Interessen überwiegen, haben Sie das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed">
                  Wenn Sie die Verarbeitung Ihrer personenbezogenen Daten eingeschränkt haben, dürfen diese Daten – von ihrer Speicherung abgesehen – nur mit Ihrer Einwilligung oder zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen oder zum Schutz der Rechte einer anderen natürlichen oder juristischen Person oder aus Gründen eines wichtigen öffentlichen Interesses der Europäischen Union oder eines Mitgliedstaats verarbeitet werden.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Widerspruch gegen Werbe-E-Mails
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-E-Mails, vor.
                </p>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent h-[1px]" />

            {/* 5. Datenerfassung auf dieser Website */}
            <div className="space-y-6">
              <h2 className="text-gold uppercase tracking-[0.2em] text-2xl font-semibold">
                5. Datenerfassung auf dieser Website
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Cookies
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese selbst löschen oder eine automatische Löschung durch Ihren Webbrowser erfolgt.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Cookies können von uns (First-Party-Cookies) oder von Drittunternehmen stammen (sog. Third-Party-Cookies). Third-Party-Cookies ermöglichen die Einbindung bestimmter Dienstleistungen von Drittunternehmen innerhalb von Webseiten (z. B. Cookies zur Abwicklung von Zahlungsdienstleistungen).
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Cookies haben verschiedene Funktionen. Zahlreiche Cookies sind technisch notwendig, da bestimmte Webseitenfunktionen ohne diese nicht funktionieren würden (z. B. die Warenkorbfunktion oder die Anzeige von Videos). Andere Cookies können zur Auswertung des Nutzerverhaltens oder zu Werbezwecken verwendet werden.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Cookies, die zur Durchführung des elektronischen Kommunikationsvorgangs, zur Bereitstellung bestimmter, von Ihnen erwünschter Funktionen (z. B. für die Warenkorbfunktion) oder zur Optimierung der Website (z. B. Cookies zur Messung des Webpublikums) erforderlich sind (notwendige Cookies), werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert, sofern keine andere Rechtsgrundlage angegeben wird. Der Websitebetreiber hat ein berechtigtes Interesse an der Speicherung von notwendigen Cookies zur technisch fehlerfreien und optimierten Bereitstellung seiner Dienste. Sofern eine Einwilligung zur Speicherung von Cookies und vergleichbaren Wiedererkennungstechnologien abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage dieser Einwilligung (Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG); die Einwilligung ist jederzeit widerrufbar.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browsers aktivieren. Bei der Deaktivierung von Cookies kann die Funktionalität dieser Website eingeschränkt sein.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Welche Cookies und Dienste auf dieser Website eingesetzt werden, können Sie dieser Datenschutzerklärung entnehmen.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Server-Log-Dateien
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
                </p>
                <ul className="list-disc list-inside text-foreground/80 leading-relaxed space-y-2 ml-4">
                  <li>Browsertyp und Browserversion</li>
                  <li>verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed">
                  Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Log-Files erfasst werden.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-gold uppercase tracking-[0.2em] text-lg font-semibold">
                  Anfrage per E-Mail, Telefon oder Telefax
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Wenn Sie uns per E-Mail, Telefon oder Telefax kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde; die Einwilligung ist jederzeit widerrufbar.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Die von Ihnen an uns per Kontaktanfragen übersandten Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach abgeschlossener Bearbeitung Ihres Anliegens). Zwingende gesetzliche Bestimmungen – insbesondere gesetzliche Aufbewahrungsfristen – bleiben unberührt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Datenschutz;
