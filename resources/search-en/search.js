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
            "<b>0</b> pages containing <b>\"\"</b>"
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
            "<b>1</b> page containing <b>\"" + terms + "\"</b>"
        );
    } else {
        document.getElementById('description').innerHTML = (
            "<b>" + results.length + "</b> pages containing <b>\"" + terms + "\"</b>"
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
        page += "<b>" + pages[ref].t + "</b></a><p>" + pages[ref].d + "</p>";
        page += "<div style=\"clear: left;\"></div></li>";
    }
    page += "</ul>";

    document.getElementById('searchresults').innerHTML = page;

}

//-------------------------------------------
// We have to make our own English search
// functions for lunr - we have to do this
// out here because it is used as a callback
// in lunr, both when making the index and doing the searches
//-------------------------------------------

//-------------------------------------------
// create and register a English stemmer
//-------------------------------------------
var snowball = new Snowball("English");
var enStemmer = function(token) {
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

lunr.Pipeline.registerFunction( enStemmer, "enStemmer" );

//-------------------------------------------
// create and register a English stopword filter
//-------------------------------------------
var enStopWordFilter = function (token) {
    if (enStopWords.indexOf(token) === -1) return token
}
var enStopWords = new lunr.SortedSet;
enStopWords.length = 320; 
// this list must be pre-sorted for it to work
enStopWords.elements = [
    "", "2", "I", "a", "about", "above", "academy", "advice", "after",
    "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below",
    "between", "both", "but", "by", "can", "can't", "cannot", "com",
    "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "example", "few", "find",
    "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
    "introduction", "is", "isn't", "it", "it's", "its", "itself", "khan",
    "let's", "ll", "me", "mixed", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "one",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
    "over", "own", "re", "same", "shan't", "she", "she'd", "she'll",
    "she's", "should", "shouldn't", "so", "solving", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them",
    "themselves", "then", "there", "there's", "these", "they", "they'd",
    "they'll", "they're", "they've", "this", "those", "through", "to",
    "too", "under", "until", "up", "using", "very", "video", "was",
    "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't",
    "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "will", "with",
    "won't", "word", "works", "would", "wouldn't", "www", "you", "you'd",
    "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
];

lunr.Pipeline.registerFunction( enStopWordFilter, "enStopWordFilter" );

