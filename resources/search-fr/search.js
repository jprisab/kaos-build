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
            "<b>0</b> pages contenant <b>\"\"</b>"
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
            "<b>1</b> page contenant <b>\"" + terms + "\"</b>"
        );
    } else {
        document.getElementById('description').innerHTML = (
            "<b>" + results.length + "</b> pages contenant <b>\"" + terms + "\"</b>"
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
// We have to make our own French search
// functions for lunr - we have to do this
// out here because it is used as a callback
// in lunr, both when making the index and doing the searches
//-------------------------------------------

//-------------------------------------------
// create and register a French stemmer
//-------------------------------------------
var snowball = new Snowball("French");
var frStemmer = function(token) {
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

lunr.Pipeline.registerFunction( frStemmer, "frStemmer" );

//-------------------------------------------
// create and register a French stopword filter
//-------------------------------------------
var frStopWordFilter = function (token) {
    if (frStopWords.indexOf(token) === -1) return token
}
var frStopWords = new lunr.SortedSet;
frStopWords.length = 173; 
// this list must be pre-sorted for it to work
frStopWords.elements = [
    "", "about", "academy", "alors", "an", "and", "are", "as", "at",
    "au", "aucuns", "aussi", "autre", "avant", "avec", "avoir", "be",
    "bon", "by", "can", "car", "ce", "cela", "ces", "ceux", "chaque",
    "ci", "comme", "comment", "dans", "de", "dedans", "dehors",
    "depuis", "des", "deux", "devrait", "do", "doit", "donc", "dos",
    "droite", "du", "début", "elle", "elles", "en", "encore",
    "essai", "est", "et", "eu", "example", "exemple", "fait",
    "faites", "fois", "font", "for", "force", "from", "haut", "have",
    "hors", "how", "ici", "il", "ils", "in", "is", "it", "je",
    "juste", "khan", "la", "le", "les", "leur", "là", "ma",
    "maintenant", "mais", "me", "mes", "mine", "moins", "mon", "mot",
    "même", "ni", "nommés", "non", "not", "notre", "nous",
    "nouveaux", "of", "on", "or", "ou", "out", "où", "par", "parce",
    "parole", "pas", "personnes", "peu", "peut", "pièce", "plupart",
    "pour", "pourquoi", "probl", "problem", "quand", "que", "quel",
    "quelle", "quelles", "quels", "qui", "re", "rishi", "sa", "sans",
    "ses", "seulement", "si", "sien", "son", "sont", "sous", "soyez",
    "sujet", "sur", "ta", "tandis", "tellement", "tels", "tes",
    "that", "the", "this", "to", "ton", "tous", "tout", "trop",
    "très", "tu", "un", "une", "valeur", "vid", "video", "voie",
    "voient", "vont", "votre", "vous", "vu", "we", "what", "with",
    "works", "you", "ça", "étaient", "état", "étions", "été", "être"
];

lunr.Pipeline.registerFunction( frStopWordFilter, "frStopWordFilter" );

