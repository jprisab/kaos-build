package KALang;
use strict;
use warnings;

%KALang::map = (); # to avoid "used only once warnings"

%KALang::map = (

    "index-title" => {
        "en" => "Index",
        "fr" => "Index - en Français",
        "es" => "Índice - en Español.",
        "pt" => "Índice - em Português.",
    },

    "index-desc" => {
        "en" => "Welcome to the index page. All available subjects and topics are listed below.",
        "fr" => "Bienvenue sur la page d'index. Tous les sujets et les sujets disponibles sont listés ci-dessous.",
        "es" => "Bienvenido a la página de índice. Todas las materias y temas disponibles se enumeran a continuación.",
        "pt" => "Bem-vindo à página do índice. Todos os temas e tópicos disponíveis estão listados abaixo.",
    },

    "all-search-button" => {
        "en" => "Search",
        "fr" => "Recherche",
        "es" => "Buscar",
        "pt" => "Pesquisa",
    },

    "all-creation" => {
        "en" => "This collection was created",
        "fr" => "Cette collection a été créée",
        "es" => "Esta colección fue creada",
        "pt" => "Esta coleção foi criada",
    },

    "all-months" => {
        "en" => [ qw( January February March April May June July August September October November December ) ],
        "fr" => [ qw( Janvier Février Mars Avril Mai Juin Juillet Août Septembre Octobre Novembre Décembre ) ],
        "es" => [ qw( Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre ) ],
        "pt" => [ qw( Janeiro Fevereiro Março Abril Maio Junho Julho Agosto Setembro Outubro Novembro Dezembro ) ],
    },

    "all-free-text" => {
        "en" => "All Khan Academy content is available for free at",
        "fr" => "Tout le contenu Khan Academy est disponible gratuitement sur",
        "es" => "Todo el contenido Khan Academy está disponible de forma gratuita en",
        "pt" => "Todo o conteúdo Khan Academy está disponível gratuitamente em",
    },

    "all-free-url" => {
        en => "www.khanacademy.org",
        fr => "fr.khanacademy.org",
        es => "es.khanacademy.org",
        pt => "pt.khanacademy.org",
    },

    "videos-broken-msg" => {
        en => "If the above player doesn't work,",
        fr => "Si le player ci-dessus ne fonctionne pas,",
        es => "Si el jugador anterior no funciona,",
        pt => "Se o jogador acima não funcionar,",
    },

    "videos-try-msg" => {
        en => "try this direct link",
        fr => "essayez ce lien direct",
        es => "tratar este enlace directo",
        pt => "tente este link direto",
    },

    "search-title" => {
        en => "Search Results",
        fr => "Résultats de la recherche",
        es => "Resultados de la búsqueda",
        pt => "Resultados da pesquisa",
    },

    #-------------------------------------------
    # The "slug" is a unique, human-readable identifier provided by the
    # Khan Academy API - we map them here to translations of the
    # description - if the API doesn't already have a translated description.
    #-------------------------------------------
    "description-by-slug" => {
        "arithmetic" => {
            "fr" => "Prêt pour des jeux arithmétiques ? C'est le bon endroit ! C'est le premier sujet des mathématiques,  plein d'exercices drôles et de vidéos qui permettent de démarrer le voyage vers la maîtrise des mathématiques. On va bien sûr s'occuper des opérations fondamentales : l'addition, la soustraction, la multiplication et la division. Mais on ne va pas s'arrêter là, on va aussi voir les nombres négatifs, les valeurs absolues, les nombres décimaux et les fractions. Apprendre les maths, c'est mieux en s'amusant et c'est ce qu'on a prévu de faire ensemble. Alors, on commence ?",
        },
        "pre-algebra" => {
            "fr" => "Ici, ce n'est pas du tout de l'arithmétique ordinaire.  Il s'agit de préparation à l'algèbre pour  pouvoir jouer avec les spécialistes. Il faut voir la pré-algèbre comme une piste de décollage. On est l'avion, et l'algèbre est notre destination de vacances ensoleillée. Sans piste de décollage on ne peut pas aller bien loin. Sérieusement, beaucoup des concepts qie nous présenterons dans cette rubrique constituent les fondations des mathématiques les plus avancées : les nombres négatifs, la valeur absolue, les facteurs, les multiples, les décimales et les fractions pour en citer quelques-uns. Bon, on attache notre ceinture, on relève le dossier de notre siège et parés au décollage !",
        },
        "algebra" => {
            "fr" => "L'algèbre est le langage qui décrit des motifs. On peut voir ça comme un raccourcis si on veut. Plutôt que d'avoir à faire la même chose plusieurs fois, l'algèbre nous permet d'exprimer cette activité répétitive. L'algèbre est aussi considérée comme un passage obligé. Un fois la porte de l'algèbre franchie, on peut accéder aux mathématiques avancées, alors que sinon, impossible d'avancer. Ces connaissances sont utilisées par des gens de toutes sortes de métiers, comme des charpentiers, des ingénieurs ou des professionnels de la mode. Dans ces présentations nous verrons beaucoup de sujets. Parmi les sujets abordés il y a les équations linéaires, les inégalités linéaires, les systèmes d'équations, la factorisation des expressions, les expressions quadratiques, les exposants, les fonctions et les ratios.",
        },
        "trigonometry" => {
            "fr" => "C'est un mot bien compliqué non ? Ne nous y laissons pas prendre. Si on regarde le préfixe, tri-, on pourrait croire que la trigonométrie (on dit parfois la \"trigo\") a quelque chose à voir avec les triangles. Et on aurait raison ! La trigo c'est justement l'étude des propriétés des triangles. Est-ce important ? C'est utilisé pour mesurer précisément les distances, en particulier dans des industries comme celle des systèmes de satellites et des sciences comme l'astronomie. Mais pas seulement pour l'espace. La trigo fait aussi partie de l'architecture et de la musique. On peut se demander...comment le simple fait de savoir mesurer et connaître les propriétés des triangles pourrait bien avoir un rapport avec la musique ?? CA, c'est une bonne question. Peut-être trouverons-nous la réponse dans les explications de cette rubrique !",
        },
        "probability" => {
            "fr" => "Impossible de passer une journée entière sans jamais considérer ou utiliser les probabilités. On parie ? Un coup d'oeil à la météo ? Perdu ! On choisit de prendre la voiture plutôt que d'aller à pieds ? Encore perdu ! On évalue en permanence des hypothèses, on fait des prévisions, on teste, on analyse. Nos vies sont pleines de probabilités ! Les statistiques sont reliées aux probabilités parce qu'une grande partie des données que nous utilisons pour déterminer les futurs probables viennent de notre compréhension des statistiques. Dans ces vidéos nous aborderons divers sujets comme: les événements indépendants, les probabilités dépendantes, la combinatoire, les tests d'hypothèse, les statistiques descriptives, les variables aléatoires, les distributions de probabilités, la régression, et les statistiques inférentielles. Alors en selle et en route pour une chevauchée à bride abattue. Un sacré challenge que vous allez adorer.",
        },
        "precalculus" => {
            "fr" => "Vous pourriez pensez que l'introduction à l'analyse est le cours qu'on prend avant le cours d'analyse. Vous auriez raison, évidemment, mais cette définition ne signifie rien à moins de savoir en quoi consiste l'analyse. Disons le tout simplement. L'analyse est le cadre conceptuel qui nous donne des outils systématiques pour résoudre des problèmes. Des problèmes que l'on retrouve naturellement en géométrie analytique et en algèbre. Et donc..., l'introduction à l'analyse nous permet de comprendre les concepts mathématiques, problèmes, difficultés et techniques qui interviennent dans l'analyse, qui inclut notamment la trigonométrie, les fonctions, les nombres complexes, les vecteurs, les matrices, et bien d'autres encore. Voici pour vous, mesdames et messieurs, ... une introduction à l'analyse !",
        },
        "health-and-medicine" => {
            "fr" => "Le monde médical peut être déroutant. Les patients et leurs familles pourraient se sentir dépassés par le vocabulaire et les explications complexes utilisés par les professionnels de santé. Les étudiants qui démarrent un cursus médical ont également du mal à saisir la complexité des sciences médicales et sont obligés de mémoriser d'énormes quantités d'informations. Nous espérons rendre la compréhension du monde médical un peu plus facile. Regardez par ici les vidéos. Elles ne fournissent pas de conseils médicaux et ne sont données qu'à des fins informatives. Les vidéos n'ont pas pour but de se substituer aux conseils de professionnels de la médecine. Sollicitez toujours l'avis d'un professionnel de la santé qualifié pour toute question que vous pourriez avoir concernant un problème médical. Ne négligez jamais un avis médical professionnel et ne retardez jamais une consultation à cause de quelque chose que vous auriez lu ou vu dans une vidéo de Khan Academy.",
        },
    },

);

1;
