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
            "<b>0</b> páginas que contêm <b>\"\"</b>"
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
            "<b>1</b> página que contêm <b>\"" + terms + "\"</b>"
        );
    } else {
        document.getElementById('description').innerHTML = (
            "<b>" + results.length + "</b> páginas que contêm <b>\"" + terms + "\"</b>"
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
// We have to make our own Portuguese search
// functions for lunr - we have to do this
// out here because it is used as a callback
// in lunr, both when making the index and doing the searches
//-------------------------------------------

//-------------------------------------------
// create and register a Portuguese stemmer
//-------------------------------------------
var snowball = new Snowball("Portuguese");
var ptStemmer = function(token) {
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

lunr.Pipeline.registerFunction( ptStemmer, "ptStemmer" );

//-------------------------------------------
// create and register a Portuguese stopword filter
//-------------------------------------------
var ptStopWordFilter = function (token) {
    if (ptStopWords.indexOf(token) === -1) return token
}
var ptStopWords = new lunr.SortedSet;
ptStopWords.length = 165; 
// this list must be pre-sorted for it to work
ptStopWords.elements = [
    "", "2", "3", "a", "academy", "acerca", "agora", "algmas", "alguns",
    "ali", "ambos", "and", "antes", "apontar", "aquela", "aquelas",
    "aquele", "aqueles", "aqui", "atrás", "bem", "bom", "cada",
    "caminho", "cima", "com", "como", "comprido", "conhecido",
    "corrente", "da", "das", "de", "debaixo", "dentro", "desde",
    "desligado", "deve", "devem", "deverá", "direita", "diz", "dizer",
    "do", "dois", "dos", "e", "ela", "ele", "eles", "em", "enquanto",
    "então", "estado", "estar", "estará", "este", "estes", "esteve",
    "estive", "estivemos", "estiveram", "está", "estão", "eu", "fará",
    "faz", "fazer", "fazia", "fez", "fim", "foi", "fora", "horas", "in",
    "iniciar", "inicio", "ir", "irá", "is", "ista", "iste", "isto",
    "khan", "ligado", "maioria", "maiorias", "mais", "mas", "mesmo",
    "meu", "muito", "muitos", "nome", "nos", "nosso", "novo", "não",
    "nós", "o", "onde", "os", "ou", "outro", "para", "parte", "pegar",
    "pelo", "pessoas", "pode", "poderá", "podia", "por", "porque",
    "povo", "promeiro", "qual", "qualquer", "quando", "que", "quem",
    "quieto", "quê", "saber", "sem", "ser", "seu", "somente", "são",
    "tal", "também", "tem", "tempo", "tenho", "tentar", "tentaram",
    "tente", "tentei", "teu", "teve", "the", "tipo", "tive", "to",
    "todos", "trabalhar", "trabalho", "tu", "têm", "um", "uma", "umas",
    "uns", "usa", "usar", "valor", "veja", "ver", "verdade",
    "verdadeiro", "você", "vídeo", "à", "é", "último"
];

lunr.Pipeline.registerFunction( ptStopWordFilter, "ptStopWordFilter" );

