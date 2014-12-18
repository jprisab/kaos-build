function getQueryVar(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        vars[i] = vars[i].replace(/\+/g," ");
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

function runSearch () {

    var terms = getQueryVar("terms");

    if (!terms) {
        document.getElementById('description').innerHTML = (
            "<b>0</b> páginas que contienen <b>\"\"</b>"
        );
        return;
    }

    // we do this before escaping, so the user's string
    // in the search box doesn't get turned into escaped text
    document.getElementById('searchbox').value = terms;

    terms = escapeHtml(terms);

    index = lunr.Index.load( raw_index );

    var results = index.search( terms );

    if (results.length == 1) {
        document.getElementById('description').innerHTML = (
            "<b>1</b> página contiene <b>\"" + terms + "\"</b>"
        );
    } else {
        document.getElementById('description').innerHTML = (
            "<b>" + results.length + "</b> páginas que contienen <b>\"" + terms + "\"</b>"
        );
    }

    var page = "<ul>";
    for (var i = 0; i < results.length; ++i) {
        var ref = results[i].ref;
        // take the first two elements of the url, add the youtube_id and ".jpg"
        var thumb = pages[ref].u.split("/").slice(0,2).join("/")
            + "/thumbs/" + pages[ref].y + ".jpg";
        page += "<li><a href=\"" + pages[ref].u + ".html\">";
        page += "<img src=\"" + thumb + "\" alt=\"\">";
        page += "<b>" + pages[ref].t + "</b></a><p></p>";
        page += "<div style=\"clear: left;\"></div></li>";
    }
    page += "</ul>";

    document.getElementById('searchresults').innerHTML = page;

}

//-------------------------------------------
// We have to make our own Spanish search
// functions for lunr - we have to do this
// out here because it is used as a callback
// in lunr, both when making the index and doing the searches
//-------------------------------------------

//-------------------------------------------
// create and register a Spanish stemmer
//-------------------------------------------
var snowball = new Snowball("Spanish");
var esStemmer = function(token) {
    if (token.length < 2) {
        // had to filter zero-length strings, they were causing
        // a crash during search in the loop at lunr.js line 1102
        // -- also we just wanted to throw out single chars
        return undefined;
    }
    snowball.setCurrent(token);
    if (snowball.stem()) {
        return snowball.getCurrent();
    } else {
        return token;
    }
}

lunr.Pipeline.registerFunction( esStemmer, "esStemmer" );

//-------------------------------------------
// create and register a Spanish stopword filter
//-------------------------------------------
var esStopWordFilter = function (token) {
    if (esStopWords.indexOf(token) === -1) return token
}
var esStopWords = new lunr.SortedSet;
esStopWords.length = 206; 
// this list must be pre-sorted for it to work
esStopWords.elements = [
    "", "a", "academy", "al", "alguna", "algunas", "alguno", "algunos",
    "algún", "ambos", "ampleamos", "and", "ante", "antes", "aquel",
    "aquellas", "aquellos", "aqui", "arriba", "atras", "bajo",
    "bastante", "bien", "cada", "cierta", "ciertas", "cierto", "ciertos",
    "como", "con", "conseguimos", "conseguir", "consigo", "consigue",
    "consiguen", "consigues", "cual", "cuando", "de", "del", "dentro",
    "desde", "donde", "dos", "ejemplo", "el", "ellas", "ellos",
    "empleais", "emplean", "emplear", "empleas", "empleo", "en",
    "encima", "entonces", "entre", "era", "eramos", "eran", "eras",
    "eres", "es", "esta", "estaba", "estado", "estais", "estamos",
    "estan", "este", "estoy", "fin", "fue", "fueron", "fui", "fuimos",
    "gr", "gueno", "ha", "hace", "haceis", "hacemos", "hacen", "hacer",
    "haces", "hago", "in", "incluso", "intenta", "intentais",
    "intentamos", "intentan", "intentar", "intentas", "intento",
    "introducci", "ir", "is", "khan", "la", "largo", "las", "lo", "los",
    "meros", "mientras", "mio", "mo", "modo", "muchos", "muy", "no",
    "nos", "nosotros", "of", "or", "otro", "para", "pero", "podeis",
    "podemos", "poder", "podria", "podriais", "podriamos", "podrian",
    "podrias", "por", "porque", "primero", "problema", "puede", "pueden",
    "puedo", "qu", "que", "quien", "qué", "rishi", "sabe", "sabeis",
    "sabemos", "saben", "saber", "sabes", "se", "ser", "si", "siendo",
    "sin", "sobre", "sois", "solamente", "solo", "somos", "soy", "su",
    "sus", "también", "te", "teneis", "tenemos", "tener", "tengo", "the",
    "tiempo", "tiene", "tienen", "to", "todo", "trabaja", "trabajais",
    "trabajamos", "trabajan", "trabajar", "trabajas", "trabajo", "tras",
    "tuyo", "ultimo", "un", "una", "unas", "uno", "unos", "usa", "usais",
    "usamos", "usan", "usar", "usas", "uso", "va", "vais", "valor",
    "vamos", "van", "vaya", "verdad", "verdadera", "verdadero", "video",
    "vosotras", "vosotros", "voy", "yo"
];

lunr.Pipeline.registerFunction( esStopWordFilter, "esStopWordFilter" );

