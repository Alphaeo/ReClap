import { NavBar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Camera, Film, Lightbulb, Globe, Award, Clock, Eye } from "lucide-react";

type Locale = "fr" | "en";

const HISTORY = [
  { year: "1895", event: { fr: "Les frères Lumière inventent le cinématographe et projettent le premier film public à Paris.", en: "The Lumière brothers invent the cinematograph and project the first public film in Paris." } },
  { year: "1927", event: { fr: "Le Chanteur de Jazz — premier film sonore, révolution totale de l'industrie.", en: "The Jazz Singer — first sound film, a total revolution for the industry." } },
  { year: "1939", event: { fr: "Autant en emporte le vent et Le Magicien d'Oz : naissance du Technicolor grand public.", en: "Gone with the Wind and The Wizard of Oz: birth of mainstream Technicolor." } },
  { year: "1960s", event: { fr: "Nouvelle Vague française (Godard, Truffaut) — le cinéma d'auteur s'impose.", en: "French New Wave (Godard, Truffaut) — auteur cinema asserts itself." } },
  { year: "1975", event: { fr: "Les Dents de la mer invente le blockbuster hollywoodien.", en: "Jaws invents the Hollywood blockbuster." } },
  { year: "1993", event: { fr: "Jurassic Park révolutionne les effets visuels numériques.", en: "Jurassic Park revolutionizes digital visual effects." } },
  { year: "2000s", event: { fr: "Streaming et VOD transforment la distribution mondiale du cinéma.", en: "Streaming and VOD transform global film distribution." } },
];

const TECHNIQUES = [
  {
    icon: Camera,
    term: { fr: "Plan séquence", en: "Long take" },
    def: { fr: "Prise de vue continue sans coupure. Crée une tension et une immersion exceptionnelles (ex: Birdman).", en: "Continuous shot without cuts. Creates exceptional tension and immersion (e.g. Birdman)." },
  },
  {
    icon: Eye,
    term: { fr: "Profondeur de champ", en: "Depth of field" },
    def: { fr: "Zone de netteté de l'image. Une faible PDC isole le sujet (portrait); une grande PDC met tout en netteté (paysages).", en: "The sharp zone in a frame. Shallow DOF isolates the subject; deep DOF keeps everything sharp." },
  },
  {
    icon: Clock,
    term: { fr: "Montage parallèle", en: "Cross-cutting" },
    def: { fr: "Alternance entre deux actions simultanées pour créer suspense et tension dramatique.", en: "Alternating between two simultaneous actions to create suspense and dramatic tension." },
  },
  {
    icon: Lightbulb,
    term: { fr: "MacGuffin", en: "MacGuffin" },
    def: { fr: "Objet ou objectif qui motive les personnages mais dont le contenu n'a pas d'importance (la valise de Pulp Fiction).", en: "An object or goal that motivates characters but whose content doesn't matter (the briefcase in Pulp Fiction)." },
  },
  {
    icon: Film,
    term: { fr: "Leitmotiv musical", en: "Musical leitmotif" },
    def: { fr: "Thème musical récurrent associé à un personnage ou une idée. Hans Zimmer en est le maître moderne.", en: "Recurring musical theme associated with a character or idea. Hans Zimmer is its modern master." },
  },
  {
    icon: Globe,
    term: { fr: "Travelling compensé", en: "Dolly zoom" },
    def: { fr: "La caméra recule pendant que le zoom avant crée un effet de distorsion perturbant (Vertigo de Hitchcock).", en: "The camera pulls back while zooming in, creating a disorienting distortion effect (Hitchcock's Vertigo)." },
  },
];

const GENRES = [
  { emoji: "🎭", name: { fr: "Drame", en: "Drama" }, desc: { fr: "Explore les émotions humaines profondes, conflits personnels et sociaux.", en: "Explores deep human emotions, personal and social conflicts." } },
  { emoji: "😂", name: { fr: "Comédie", en: "Comedy" }, desc: { fr: "Vise le rire et la légèreté. Du burlesque muet à la comédie noire contemporaine.", en: "Aims for laughter and lightness. From silent slapstick to contemporary dark comedy." } },
  { emoji: "💥", name: { fr: "Action", en: "Action" }, desc: { fr: "Adrénaline, cascades, conflits physiques. L'art du spectacle pur.", en: "Adrenaline, stunts, physical conflicts. The art of pure spectacle." } },
  { emoji: "🔪", name: { fr: "Thriller", en: "Thriller" }, desc: { fr: "Suspense, tension psychologique. Le spectateur sait avant le héros.", en: "Suspense, psychological tension. The viewer knows before the hero." } },
  { emoji: "👻", name: { fr: "Horreur", en: "Horror" }, desc: { fr: "Explore la peur, le tabou, et nos angoisses les plus profondes.", en: "Explores fear, taboo, and our deepest anxieties." } },
  { emoji: "🚀", name: { fr: "Science-fiction", en: "Science fiction" }, desc: { fr: "Imagine des futurs possibles pour questionner notre présent.", en: "Imagines possible futures to question our present." } },
  { emoji: "🌹", name: { fr: "Romance", en: "Romance" }, desc: { fr: "L'amour comme moteur narratif. De la comédie romantique au mélo poignant.", en: "Love as a narrative engine. From romantic comedy to poignant melodrama." } },
  { emoji: "🔍", name: { fr: "Documentaire", en: "Documentary" }, desc: { fr: "Le réel comme matière première. Parfois plus fort que n'importe quelle fiction.", en: "Reality as raw material. Sometimes more powerful than any fiction." } },
];

const FUN_FACTS = [
  { fr: "Le mot \"cinéma\" vient du grec \"kinema\" (κίνημα) qui signifie mouvement.", en: "The word 'cinema' comes from the Greek 'kinema' (κίνημα) meaning movement." },
  { fr: "Un film standard tourne à 24 images par seconde — notre cerveau les fond en mouvement continu.", en: "A standard film runs at 24 frames per second — our brain blends them into continuous motion." },
  { fr: "Le film le plus cher jamais tourné est Pirates des Caraïbes : Jusqu'au bout du monde (300M$ en 2007).", en: "The most expensive film ever made is Pirates of the Caribbean: At World's End ($300M in 2007)." },
  { fr: "Le cinéma indien (Bollywood) produit plus de films par an que Hollywood.", en: "Indian cinema (Bollywood) produces more films per year than Hollywood." },
  { fr: "Le premier Oscar a été remis en 1929 — la cérémonie durait 5 minutes.", en: "The first Oscar was awarded in 1929 — the ceremony lasted 5 minutes." },
  { fr: "Le son représente 50% de l'expérience cinématographique selon George Lucas.", en: "Sound accounts for 50% of the cinematic experience according to George Lucas." },
];

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale as Locale) ?? "fr";

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-24 pb-16">

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{l === "fr" ? "Apprendre le cinéma" : "Learn Cinema"}</h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            {l === "fr"
              ? "Histoire, techniques, genres, anecdotes — tout ce qu'il faut savoir pour mieux apprécier le 7ème art."
              : "History, techniques, genres, trivia — everything you need to better appreciate the 7th art."}
          </p>
        </div>

        {/* Histoire */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {l === "fr" ? "Histoire du cinéma" : "History of Cinema"}
          </h2>
          <div className="relative border-l-2 border-primary/20 pl-6 space-y-6">
            {HISTORY.map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary/60 ring-2 ring-background" />
                <Badge variant="outline" className="border-primary/30 text-primary text-xs mb-1">{item.year}</Badge>
                <p className="text-sm text-muted-foreground leading-relaxed">{l === "fr" ? item.event.fr : item.event.en}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Techniques */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {l === "fr" ? "Techniques essentielles" : "Essential Techniques"}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {TECHNIQUES.map((tech, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <tech.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{l === "fr" ? tech.term.fr : tech.term.en}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{l === "fr" ? tech.def.fr : tech.def.en}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Genres */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            {l === "fr" ? "Les grands genres" : "Main Genres"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GENRES.map((genre, i) => (
              <Card key={i} className="border-border/50 bg-card/50 card-hover p-4">
                <div className="text-2xl mb-2">{genre.emoji}</div>
                <h3 className="font-semibold text-sm mb-1">{l === "fr" ? genre.name.fr : genre.name.en}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{l === "fr" ? genre.desc.fr : genre.desc.en}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Fun facts */}
        <section>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            {l === "fr" ? "Le savais-tu ?" : "Did you know?"}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {FUN_FACTS.map((fact, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-lg border border-border/50 bg-card/30">
                <span className="text-primary font-bold text-lg shrink-0">{i + 1}</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{l === "fr" ? fact.fr : fact.en}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
