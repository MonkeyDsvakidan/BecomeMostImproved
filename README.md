# Projektdokumentation - [Projekttitel]

## Inhaltsverzeichnis

1. [Ausgangslage](#1-ausgangslage)
2. [Lösungsidee](#2-lösungsidee)
3. [Vorgehen & Artefakte](#3-vorgehen--artefakte)
    1. [Understand & Define](#31-understand--define)
    2. [Sketch](#32-sketch)
    3. [Decide](#33-decide)
    4. [Prototype](#34-prototype)
    5. [Validate](#35-validate)
4. [Erweiterungen [Optional]](#4-erweiterungen-optional)
5. [Projektorganisation [Optional]](#5-projektorganisation-optional)
6. [KI-Deklaration](#6-ki-deklaration)
7. [Anhang [Optional]](#7-anhang-optional)

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

<!-- WICHTIG: DIE KAPITELSTRUKTUR DARF NICHT VERÄNDERT WERDEN! -->

<!-- Diese Vorlage ist für eine README.md im Repository gedacht. Abschnitte mit [Optional] können weggelassen werden, wenn in den Übungen nichts anderes verlangt wird. -->

## 1. Ausgangslage
- **Problem:** Basketballspieler, die allein trainieren, haben Schwierigkeiten, strukturierte und intensive Workouts zu planen. Ohne Coach, Team oder klare Trainingsvorlagen fühlt sich das Training unproduktiv an. Es fehlen Erfolgsmasssstäbe, Fortschrittstracking und Motivation für regelmässiges Solo-Training.

- **Ziele:** 

  - Training sinnvoller und zielgerichteter gestalten  

  - Trainingsmotivation und Regelmässigkeit steigern  

  - Fortschrittstracking ermöglichen  - 

  - Spass am Basketball fördern, auch beim Solo-Training

- **Primäre Zielgruppe:** Basketballspieler (unterschiedliche Erfahrungsstufen), die allein ohne Team oder Trainer trainieren und strukturierte, intensive Workouts mit Fortschrittsdokumentation benötigen.


## 2. Lösungsidee
- **Kernfunktionalität:**  
  - **Exercise-Bibliothek**: Nutzer können Exercises anzeigen, erstellen, bearbeiten und löschen  
  - **Workout-Planung**: Exercises zu Workouts kombinieren mit Drag-and-Drop-Funktion  
  - **Session-Durchführung**: Workouts starten, Fortschritt tracken mit To-do-Modus und Fortschrittsbalken  
  - **Filterung**: Nach Kategorie (z.B. Shooting, Dribbling), Level (Beginner bis Advanced) und Zeit filtern  
  - **Pausentimer**: Konfigurierbare Pausen zwischen Exercises  
  - **Workout-Rating & History**: Bewertung nach abgeschlossenen Workouts, Speicherung der Trainingshistorie

- **Annahmen [Optional]:** 
  - Basketballspieler suchen nach einer kostenlosen Lösung für Solo-Training -> Hypothese durch mein eigenes Interesse geprüft, ebenfalls durch Marktrecherche ein Interesse erkannt
  - Visuelle Card-Darstellung erleichtert die Übersicht und Auswahl  -> geprüft durch Skizzierungen von Übung 9
  - Verschiedene Erfahrungsstufen benötigen unterschiedliche Komplexitätsstufen (von vorgefertigten Templates bis zu individueller Workout-Erstellung) -> die Hypothese ist bei Sport anwendbar, auch durch eigene Erfahrung bestätigt

- **Abgrenzung [Optional]:** 
  -  Keine Videoanalyse oder Filmaufnahmen  
  - Keine Team-/Coach-Funktionen  
  - Keine kostenpflichtigen Features  
  - Fokus auf Solo-Basketball-Training


## 3. Vorgehen & Artefakte
### 3.1 Understand & Define
**Zielgruppenverständnis:** 
**Problemräume (aus Übung 1):** 

1. Schwierigkeit, Bildschirmzeit zu reduzieren 
2. Solo-Basketball-Training fühlt sich nicht intensiv und geplant genug an 
3. Zeit fühlt sich knapp an durch Schul-, Arbeit- und Freizeitbedürfnisse, obwohl viel Zeit mit aktivem Nichtstun verbracht wird 

**Nutzer & Bedürfnisse (aus Übung 2):** 

- **Nutzer**: Basketballspieler, die allein (ohne Team/Trainer) trainieren 
- **Bedürfnisse**: Strukturiertes, intensives Training mit klarem Plan und Fortschrittsgefühl 
- **Kontext**: Allein auf dem Platz, kein Coach, kein Gegner, begrenzte Zeit, keine Trainingsvorlagen, keine Erfolgsmasssstäbe
- **Herausforderungen**: Kein Feedback, mangelnde Motivation, kein Überblick über Schwächen, Training fühlt sich unproduktiv an, keine Daten über bisherige Trainingsverläufe und keine Vergleichsmöglichkeiten 

**How Might We (Übung 3):** 

- Wie könnten wir Einzeltrainings so gestalten, dass sie die Trainingsmotivation, Regelmässigkeit und Intensität steigern? 
- Wie könnten wir Basketballspielern helfen, gezielt an ihren Schwächen zu arbeiten? 
- Wie könnten wir das durchgeführte Training nutzen und verarbeiten, um gezielte Verbesserungsvorschläge und Vergleiche zu generieren? 

**Personas:** 

*Persona 1 - Marc (Der Erfahrene)* 

- 24 Jahre, spielt seit 8 Jahren Basketball, trainiert 4x pro Woche allein 
- Ziele: Individuelle Workouts erstellen, gezielt an Schwächen arbeiten, Fortschritt tracken 
- Frustrationen: Bestehende Apps zu simpel, will volle Kontrolle über Trainingsinhalte 
- Zitat: "Ich weiss schon, was ich will. Ich brauche Flexibilität, keine vorgefertigten Templates." 

*Persona 2 - Julia (Die Strukturierte)* 

- 20 Jahre, spielt Basketball im Verein, trainiert 2x pro Woche solo zur Ergänzung 
- Ziele: Strukturiertes Training mit Templates, schnell starten können, Abwechslung 
- Frustrationen: Alles manuell eintippen dauert zu lange, braucht gute Basis zum Anpassen 
- Zitat: "Gib mir eine gute Vorlage, dann passe ich sie an. Ich will nicht von null anfangen." 

*Persona 3 - Tim (Der Einsteiger)* 

- 17 Jahre, spielt seit 1 Jahr Basketball, unsicher bei Trainingsplanung 
- Ziele: Geführtes Training, klare Anweisungen, Motivation durch Fortschritte 
- Frustrationen: Zu viele Optionen überfordern, weiss nicht welche Übungen zusammenpassen 
- Zitat: "Ich brauche Hilfe beim Planen. Sag mir, was ich trainieren soll." 

**Wesentliche Erkenntnisse aus Recherche:** 

- **Funktionen heute:** Viele YouTube-Videos, Blogbeiträge und Reddit-Posts zu Basketball-Übungen existieren, aber nur in Textform ohne Benutzeroberfläche. Übungen fokussieren meist auf einen Bereich (Werfen, Dribbeln, Kraft), kein ganzheitliches Workout-Planning möglich ohne grossen Zeitaufwand. 
- **Existierende Lösungsansätze:** Keine kostenlosen Apps für Basketball-Solo-Workouts. Tracking-Apps wie Hudl, HomeCourt oder Dr. Dish sind teuer und auf Teams/Organisationen ausgerichtet. Grosser Markt für Solo-Fitness-Workouts existiert (Orientierung für Übungsdarstellung, Feedback, Vergleiche). 
- **Verbesserungsansatz:** Kombination aus bestehendem Wissen der Basketball-Community und bewährten Workout-Planer-Konzepten.

### 3.2 Sketch
**Variantenüberblick:** 

In Übung 9 wurden 8 verschiedene Varianten für die Workout-Erstellung skizziert und mit drei Testpersonen (P1, P2, P3) evaluiert: 

1. **Formularvariante**: Manuelles Ausfüllen aller Felder 
2. **Templatevariante**: Vorgefertigte Workout-Templates nach Kategorien 
3. **Drag & Drop**: Interaktives Zusammenstellen durch Ziehen von Übungen 
4. **Auswahlvariante**: Geführte Abfrage (Zeit, Ziel, Level) 
5. **Listenvariante**: To-do-Listen-Format 
6. **KI-Generator**: Automatische Workout-Generierung 
7. **Cardsvariante**: Visuelle Cards mit Bildern/Icons 
8. **Zeitbasiert**: Fokus auf zeitbasierte Intervalle (HIIT-Style)

**Skizzen:** 
![Skizzen von Übung 9](README-Images/Skizzen.png)
![Kommentare der User von Übung 9](README-Images/Kommentare.png)
![Workflow des Happy Path](README-Images/Workflow-HappyPath.png)


**Feedback der Testpersonen:** 

- **P1 (Erfahren)**: Bevorzugt Drag & Drop, Cards und Liste. Ablehnung von Templates und KI-Generator (zu wenig Kontrolle). -
- **P2 (Strukturiert)**: Favorisiert Templates, KI-Generator und Drag & Drop. Formular zu langsam. 
- **P3 (Einsteiger)**: Präferiert Auswahl-Variante, Cards und Templates. Drag & Drop unsicher, ob bedienbar. 

**Unterschiede:** 

- **Komplexität**: Von vollautomatisch (KI) bis vollständig manuell (Formular) 
- **Flexibilität**: Templates bieten Basis, Drag & Drop volle Freiheit 
- **Visualisierung**: Cards visuell, Formular textbasiert 
- **Zielgruppe**: Templates/Auswahl für Einsteiger, Drag & Drop/Liste für Erfahrene

### 3.3 Decide
**Gewählte Variante & Begründung:** 

Die **Cards-Variante** wurde als Basis gewählt und mit Elementen aus anderen Skizzen erweitert.

**Hauptgründe:** 

- Visuelle Klarheit: Cards zeigen Übungen/Workouts auf einen Blick ohne lange Texte 
- Skalierbarkeit: Funktioniert für Anfänger (vorgefertigte Cards) und Fortgeschrittene (eigene Erstellung) 
- Filterbarkeit: Cards lassen sich einfach nach Kategorie, Level und Zeit filtern 
- Positive Resonanz: Alle drei Personas bewerteten Cards positiv 

**Integrierte Elemente aus anderen Varianten:** 

- Drag & Drop für Workout-Erstellung (Reihenfolge der Exercises)
- To-do-Modus mit Fortschrittsbalken während der Session (aus Listenvariante)
- Pausentimer zwischen Exercises 
- Filter nach Kategorie, Level, Zeit 
- Favoriten-System 
- Workout-Rating und History nach Abschluss 

**Entscheidkriterien:** 

1. Intuitive Bedienbarkeit für alle Erfahrungsstufen 
2. Flexibilität von simpel (vorgefertigte Workouts starten) bis komplex (eigene Exercises erstellen und kombinieren) 
3. Visuelle Attraktivität 
4. Motivationsfaktoren (Fortschritt, Rating, History)

**End-to-End-Ablauf:** 

Der Haupt-Workflow beschreibt den Nutzerpfad aus Sicht von **Tim (Der Einsteiger)** vom ersten Öffnen der App bis zum Abschluss des ersten Workouts.

*User Journey Map:*

![User Journey Map](README-Images/User-Journey-Map.png)

Die Journey zeigt 8 Schritte über 4 Phasen: 

1. Vorbereitung & Auswahl (Punkte 1-3): 

- App erkunden
- Filter nutzen 

2. Workout-Start (Punkte 4-5): 

Workout auswählen und starten 

3. Durchführung (Punkt 6): 

Exercises abarbeiten mit Fortschrittsanzeige 

4. Abschluss (Punkte 7-8): 

- Workout beenden
- Rating abgeben
- Level-Up planen 

Die Emotionskurve zeigt: Anfängliche Unsicherheit wird durch hilfreiche Filter und klare Strukturierung zu Motivation. Während der Durchführung ist das Training anstrengend aber machbar. Am Ende entsteht ein Erfolgsgefühl und Motivation für das nächste Training.

*Workflow-Diagramm*:

![Workflows im Mockup](README-Images/Mockup-Workflows.png)

Das technische Workflow-Diagramm ergänzt die User Journey Map durch detaillierte Darstellung aller möglichen Navigationspfade und Interaktionen (Exercise-/Workout-Management, Filter, Modals).

**Mockup:** 

Figma-Prototyp: 

[https://www.figma.com/proto/NJ624feVSuq4Rk1C0z9H0A/BallToTheTop](https://www.figma.com/proto/NJ624feVSuq4Rk1C0z9H0A/BallToTheTop?node-id=0-1&t=V8ZxGAKPWe3lWihV-1)

**Screenshots mit Beschreibungen:** 

- Dashboard:
![Screenshot aus dem Mockup - Dashboard](README-Images/Mockup-Dashboard.png)
- Workout-Detail: 
![Screenshot aus dem Mockup - Workout Detail](README-Images/Mockup-Workout-Detail.png)
- Session-Screen:
![Screenshot aus dem Mockup - Session Screen](README-Images/Mockup-Session-Screen.png)

### 3.4 Prototype

#### 3.4.1. Entwurf (Design)
Beschreibt die Gestaltung und Interaktion.
> **Hinweis:** Hier wird der **Prototyp** beschrieben, nicht das **Mockup**.
**Informationsarchitektur:** 

Die App besteht aus drei Hauptbereichen mit Topbar-Navigation: 

1. **Dashboard**: Startseite mit direktem Zugriff auf Workouts, schneller Einstieg möglich 
2. **Workouts**: Verwaltung (Anzeigen, Erstellen, Bearbeiten, Löschen) von Workouts 
3. **Exercises**: Verwaltung der einzelnen Übungen, aus denen Workouts zusammengestellt werden

 Diese Trennung dient der Übersichtlichkeit - Workouts und Exercises auf einer Seite wären überfordernd. 

**User Interface Design:** 

- Dashboard
![Screenshot aus dem Prototyp - Dashboard](README-Images/Prototyp-Dashboard.png)
- Exercise-Formular
![Screenshot aus dem Prototyp - Create Exercise Formular](README-Images/Prototyp-Create-Exercise-Formular.png)
- Workout-Builder
![Screenshot aus dem Prototyp - Edit Workout](README-Images/Prototyp-Edit-Workout-Page.png)
- Session-Durchführung 
![Screenshot aus dem Prototyp - Session Screen](README-Images/Prototyp-Session-Screen.png)

**Designentscheidungen:** 

*Desktop vs. Mobile* 

Entscheidung für Desktop-First, da: 

- Prototyp auf Desktop erstellt und getestet 
- Mobile Layouts erfordern viele Verschachtelungen, schränken Umsetzung ein 
- Cards, Tabellen, Formulare grosszügig darstellbar 

*Navigation* 

Topbar-Navigation mit Logo links, drei Hauptbereiche (Dashboard, Workouts, Exercises) als Textlinks. Etabliertes Pattern für Desktop-Web-Apps. Aktiver Bereich durch Akzentfarbe Orange hervorgehoben. 

*Dark Mode* 

Dunkle Benutzeroberfläche wirkt bei Sport-Apps energetisch und modern. Persönliche Präferenz für dunkles Theme. 

*Farbkonzept* 

Orange als Akzentfarbe (Assoziation mit Basketball). Bewusster Verzicht auf viele Farben zur Vermeidung von Verwirrung. Alle Buttons mit gleicher Funktion sehen identisch aus (Konsistenz). 

*Start-Button auf Cards* 

Direkter Start-Button auf jeder Card reduziert Klicks - kein Umweg über Detailseite nötig. 

*Löschen-Modal* 

Bestätigungs-Modal vor dem Löschen verhindert versehentliche Datenverluste bei aufwändig erstellten Workouts. 

*Edit vs. New* 

Edit als Modal (schnelle Anpassung vorhandener Daten), New als eigene Page (strukturierte Führung durch Platzhalterfelder). 

*Sprache* 

Englisch, da Basketball-Fachbegriffe (Crossover, Fadeaway, Reps, Sets) auf Deutsch nicht gebräuchlich sind.

#### 3.4.2. Umsetzung (Technik)
**Technologie-Stack:**

- **SvelteKit**: Framework für die gesamte Webanwendung
- **Bootstrap**: UI-Framework für Layout, Cards, Buttons und Formulare (global eingebunden)
- **MongoDB**: NoSQL-Datenbank für Persistenz (über offiziellen MongoDB-Treiber)
- **Zusätzliche Dependencies**:
  - `dotenv`: Umgebungsvariablen-Management
  - `@fontsource/fira-mono`: Schriftart
  - `@neoconfetti/svelte`: Konfetti-Effekte (aktuell nicht aktiv genutzt)

**Tooling:**

- **VS Code**: Entwicklungsumgebung
- **GitHub Copilot**: KI-Unterstützung für Code-Vorschläge und Auto-Completion
- **Netlify**: Deployment-Plattform für Hosting
- **MongoDB Atlas**: Cloud-Datenbank-Hosting
- **Git/GitHub**: Versionsverwaltung und Repository-Management
- **Vite**: Build-Tool (integriert in SvelteKit)
- **ESLint**: Code-Qualitätssicherung

**Struktur & Komponenten:**

Die Projektstruktur folgt der typischen SvelteKit-Organisation.

**Wichtige Komponenten:**

- **ExerciseCard**: Visuelle Darstellung einzelner Exercises mit Actions (Start, Edit, Delete)
- **WorkoutCard**: Visuelle Darstellung von Workouts mit Actions (Start, Edit, Delete)
- Formulare und Timer sind direkt in den jeweiligen Pages implementiert (z.B. New-Seiten, Session-Seiten)

**State-Management:**

Es werden keine eigenen Svelte Stores verwendet. State-Verwaltung erfolgt:
- **Lokal**: Reactive Variables in Komponenten und Seiten
- **Serverseitig**: Daten werden über SvelteKit `load`-Funktionen geladen
- **Einziger Store**: SvelteKit-integrierter `$page`-Store für Navigation und mobiles Menü im Layout

**Daten & Schnittstellen:**

**Datenbank (MongoDB Atlas):**

Collections:
- **exercises**: Speichert alle Exercises (name, category, level, sets, reps, duration)
- **workouts**: Speichert Workouts mit Referenzen zu Exercises
- **sessions**: Speichert abgeschlossene Trainings-Sessions mit Ratings, Statistiken und dient als History

Die Historie wird über die `sessions`-Collection abgebildet, nicht über eine separate History-Collection.

**API-Kommunikation:**

- **API-Routen**: REST-API unter `/api` mit drei Hauptendpunkten:
  - `/api/exercises`: CRUD-Operationen für Exercises
  - `/api/workouts`: CRUD-Operationen für Workouts
  - `/api/sessions`: CRUD-Operationen für Sessions
- **SvelteKit Form Actions**: Für formularbasierte CRUD-Operationen
- **Serverseitige `load`-Funktionen**: Datenabruf aus MongoDB in `+page.server.js`-Dateien
- **Direkte Datenbankabfragen**: MongoDB-Treiber in Server-Routen

**Deployment:**

URL: [https://becomemostimproved.netlify.app](https://becomemostimproved.netlify.app)

**Deployment-Konfiguration:**
- **Plattform**: Netlify
- **Build-Command**: `npm run build` (erzeugt SvelteKit-Adapter-Output)
- **Publish-Directory**: `.svelte-kit/netlify` (über `@sveltejs/adapter-netlify`)
- **Umgebungsvariablen**: MongoDB-Connection-String über Netlify Environment Variables

**Besondere Entscheidungen:**

**MongoDB statt MySQL:**
- Flexibles Schema passend für iterative Entwicklung (kein fixes Schema nötig)
- Schnelle Prototyping-Phase profitiert von document-based Structure
- Einfache Integration mit SvelteKit (JSON-Datenformat)
- Cloud-Hosting mit MongoDB Atlas kostenlos verfügbar

**Bootstrap statt Tailwind CSS:**
- Schneller Einstieg durch vorgefertigte Komponenten
- Konsistentes Design ohne Custom-Styling
- Mobile-First Responsive Design out-of-the-box
- Trotz persönlicher Präferenz für Tailwind: Bootstrap beschleunigt Prototyping

**API-Routen zusätzlich zu Form Actions:**
- Ermöglicht flexible Client-/Server-Kommunikation
- Vorbereitung für mögliche externe Anbindungen oder mobile Apps
- Klare Trennung zwischen API-Logik und Page-Logik

**Keine Custom Stores:**
- Kleine App-Größe rechtfertigt keinen globalen State
- SvelteKit `load`-Funktionen handhaben Datenabruf effizient
- Lokaler State ausreichend für UI-Interaktionen
- Vereinfachte Architektur, weniger Komplexität

**History im Dashboard integriert:**
- Keine separate History-Seite, stattdessen Integration in Dashboard (`+page.svelte`)
- Sessions-Collection dient als Datenquelle für Verlaufsanzeige
- Reduziert Seitenanzahl und Navigation
- Zentraler Einstiegspunkt für alle wichtigen Informationen

**Komponenten direkt in Pages:**
- Formulare und Timer sind seitenspezifisch, keine Wiederverwendung geplant
- Reduziert Abstraktionsebenen
- Schnellere Entwicklung im Prototyping
- Bei Bedarf später extrahierbar (Refactoring)

**Trade-offs:**
- **Performance vs. Development Speed**: Bootstrap-Bundle größer als Custom CSS, aber deutlich schnellere Entwicklung
- **Flexibilität vs. Einfachheit**: Keine Stores bedeutet weniger globale State-Management-Möglichkeiten, aber einfacherer Code
- **Code-Wiederverwendung vs. Direktheit**: Formulare/Timer nicht als Komponenten ausgelagert spart initialen Abstraktionsaufwand, könnte bei Skalierung zu Redundanz führen
- **API vs. Form Actions**: Beide Ansätze parallel erhöhen Komplexität leicht, bieten aber mehr Flexibilität

### 3.5 Validate
- **URL der getesteten Version** (separat deployt)
- **Ziele der Prüfung:** _[welche Fragen sollen beantwortet werden?]_  
- **Vorgehen:** _[moderiert/unmoderiert; remote/on-site]_  
- **Stichprobe:** _[Mit wem wurde getestet? Profil; Anzahl]_  
- **Aufgaben/Szenarien:** _[Ausformulierte Testaufgaben]_  
- **Kennzahlen & Beobachtungen:** _[z. B. Erfolgsquote, Zeitbedarf, qualitative Findings]_  
- **Zusammenfassung der Resultate:** _[Wichtigste Erkenntnisse; 2-4 Sätze]_  
- **Abgeleitete Verbesserungen:** _[Anforderungen, die als nächstes umgesetzt werden sollten, priorisiert, kurz begründet; falls Verbesserungen im Prototyp konkret umgesetzt wurden: In Kap. 4 dokumentieren]_  

## 4. Erweiterungen [Optional]
Dokumentiert Erweiterungen über den Mindestumfang hinaus.
> **Hinweis:** Jede Erweiterung ist separat nach dem folgenden Schema zu beschreiben.

### _[4.x Kurzbeschreibung / Titel]_  
- **Beschreibung & Nutzen:** _[Was wurde erweitert? Warum?]_  
- **Wo umgesetzt:** _[Wie und wo wurde es gemacht? Frontend, Backend, Datenbank?]_  
- **Referenz:** _[Wo wird die Erweiterung auch noch beschrieben, z.B. Screenshot oder Beschreibung in einem anderen Kapitel]_  
- **Aus Evaluation abgeleitet?:** _[Wurde diese Erweiterung als Folge eines in der Evaluation identifizierten Issues implementiert?]_  

> Das folgende **Beispiel** wurde bewusst kurz gehalten. Erweiterungen dürfen auch ausführlicher beschrieben werden.

### 4.1 Tabelle nach Kategorien filtern
- **Beschreibung & Nutzen:** Tabelle X kann nach Kategorie gefiltert werden, weil User typischerweise nur an einer bestimmten Kategorie interessiert sind.  
- **Wo umgesetzt:** 
  - **Frontend:** Tabelle mit Dropdown in Datei ...
  - **Backend:** Form Action ... in Datei ...
  - **Datenbank:** MongoDB-Query in Datei ...
- **Referenz:** Screenshot in Kap. x.y
- **Aus Evaluation abgeleitet?:** Ja, Issue x.y

## 5. Projektorganisation [Optional]
Beispiele:
- **Repository & Struktur:** _[Link; kurze Strukturübersicht]_  
- **Issue-Management:** _[Vorgehen kurz beschreiben]_  
- **Commit-Praxis:** _[z. B. sprechende Commits]_

## 6. KI-Deklaration
Die folgende Deklaration ist verpflichtend und beschreibt den Einsatz von KI im Projekt.

### 6.1 KI-Tools
**Eingesetzte Tools**:   

- Perplexity AI (Claude-Modell)  
- GitHub Copilot (in VS Code)

**Zweck & Umfang**:   

- **Perplexity/Claude**: Ideenentwicklung, Strukturplanung, Prompt-Erstellung für Code-Generierung  
- **GitHub Copilot**: Code-Vorschläge, Auto-Completion, Refactoring, Komponentenerstellung  
- **Umfang**: Ca. 70% des Codes mit KI-Unterstützung generiert, alle Prompts und generierten Inhalte wurden manuell überprüft und angepasst 

**Eigene Leistung (Abgrenzung):**   

- Konzeption der App-Struktur, Workflows und Features  
- Erstellung aller Skizzen, Mockups und Designentscheidungen  
- Evaluation und Usability-Tests  
- Code-Review, Debugging und Anpassungen aller KI-generierten Code-Snippets  
- Integration und Deployment  
- Gesamte Projektdokumentation

### 6.2 Prompt-Vorgehen
**Grundlegende Vorgehensweise:** 

1. **Ideenentwicklung**: 

   Projektidee und Features mit Perplexity/Claude besprochen, technische Machbarkeit geprüft 

2. **Strukturaufbau**: 

   Erste Prompts fokussierten auf Grundgerüst (SvelteKit-Setup, Routing, Basisstruktur) 

3. **Inkrementelle Entwicklung**: 

   Features wurden schrittweise eingeführt   

   - Zuerst Exercise-CRUD (Create, Read, Update, Delete)   

   - Dann Workout-Erstellung mit Exercise-Auswahl   

   - Anschliessend Session-Durchführung   

   - Zuletzt Filter, Rating, History 

4. **Git-Commits parallel zu Prompts**: 

   Jeder Entwicklungsschritt wurde committed, sodass Prompts und Code-Änderungen nachvollziehbar sind 

5. **Iteratives Refinement**: 

   KI-generierter Code wurde getestet, Fehler identifiziert, durch Folgeprompts korrigiert 

**Beispiel-Prompt-Struktur:** 

"Erstelle eine SvelteKit-Komponente 'ExerciseCard', die folgende Props erhält: name, category, level, sets, reps. Die Card soll einen Start-Button und einen Edit-Button enthalten. Verwende Tailwind CSS für Styling mit Dark Mode."

### 6.3 Reflexion
**Nutzen:** 

- Deutliche Beschleunigung der Entwicklung, besonders bei repetitiven Aufgaben (CRUD-Operationen, Formular-Validierung) 
- Unterstützung bei unbekannten SvelteKit-Konzepten (z.B. Form Actions, Stores) 
- Schnelles Prototyping von UI-Komponenten 

**Grenzen:** 

- KI versteht Kontext nicht immer vollständig, generiert teilweise inkonsistenten Code 
- Komplexe Logik (z.B. Session-State-Management) erfordert manuelle Nacharbeit 
- Styling-Vorschläge entsprechen nicht immer dem gewünschten Design 

**Qualitätssicherung:** 

- Jeder generierte Code-Block wurde manuell getestet 
- Code-Review vor jedem Git-Commit 
- Funktionale Tests aller Features im Browser 
- Usability-Evaluation mit echten Nutzern 

**Urheberrecht:** 

- Alle von KI generierten Code-Snippets wurden angepasst und in eigenes Projekt integriert 
- Keine direkten Kopien von Drittanbieter-Code ohne Lizenzprüfung 
- Eigene Verantwortung für finalen Code übernommen

## 7. Anhang [Optional]
Beispiele:
- **Quellen:** _[verwendete Vorlagen/Assets/Modelle; Lizenz/Urheberrecht; ...]_
- **Testskript & Materialien:** _[Link/Datei]_  
- **Rohdaten/Auswertung:** _[Link/Datei]_  

