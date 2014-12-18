This document describes the process of creating a new copy of Khan Academy
on a Stick, henceforth abbreviated as KAOS.

1. Get data from the Khan Academy API

    This is done using the script get_khan_data.pl and directing its output
    to a file, like so:

        perl get_khan_data.pl [es|pt|fr] > kadata-raw-YYYY-MM-DD.txt

        If you omit the optional two-letter language code (ISO 639-1),
        it will default to "en" for English. Currently Spanish and
        Portuguese are also supported.

    First you should check the top of the script for configuration options:

        DEBUG should be set to 1 for verbose output.

        LIMIT should be set to 0 to retrieve a full set of data. If you put
        a number here, you will only get that number of entries per level. For
        example if you enter "3", you will get only 3 topics with 3 subtopics
        in each, all the way down to 3 videos per playlist. This is useful for
        working with a small set of data for testing.

        CLEAN should be set to 1 to keep only the keys that we currently use.
        If you set it to 0, all the keys returned by the API will be
        serialized, the data set will become quite large, and the other scripts
        will run much slower.

    After this is done, you will be working with a stable set of the KA data
    and no longer hitting the live API.

2. Process the data into a more useful form

    This is done using the script massage_khan_data.pl, feeding it the file
    from the previous step, and directing its output to a file, like so:

        perl massage_khan_data.pl kadata-raw-YYYY-MM-DD.txt > kadata.txt

    There are some configuration optios at the top of this script should check
    as well.

        LIMIT works same as above.

        %exclude lists the items that should be removed from the processed.
        These are KA topics that we don't want included in KAOS for
        whatever reason. This exclusion is for topics; for excluding videos
        see %exclude_vids.

        %exclude_vids lists the youtube_id's that we don't want. Most of these
        are videos that are known to be exercise walkthroughs, as opposed to
        instructional. There are also some broken videos listed here.

    This script filters out some stuff we don't want, calculates some values
    (video_count, thumb_file), and reorganizes a couple parts of the tree so
    videos are always at the same depth. We do this in a separate pass from
    gathering the data from the API because we may want to change the settings
    here often and retrieving the data each time from the API is rather slow.

    After this, all subsequent scripts will use the data set just created.
    It is just a serialized perl data structure (similar looking to JSON),
    so you can peek in and even make changes using any text editor.

3. Get videos

    maintenance:
        clear_vids-big_dups.pl - remove any dups from the vids-big dir
        move_uncomp_to_vids-temp.pl - move any big-only vids to vids-temp
        normalize_vid_names.pl - remove JDownloader name junk

    delete zero-sized vids
    delete log files and junk
    delete .*mp4 files? (does youtube use . in filename? i don't think so.)

    find bad files:
        find . | xargs file | grep -v "MPEG v4"

    perl get_vids_new.pl data/khan-data-fr.2014-11-18.txt

    handbrake contents of vids-temp

    get_subs_youtube.pl data/khandata.txt
    get_subs_amara.pl data/khandata.txt

    combine:
        cp subs-amara-en/*.srt subs-combined-en/
        cp subs-youtube-en/*.ytt subs-combined-en/

    convert:
        perl caption-converters/srt2vtt.pl resources/subs-combined-en/*.srt
        perl caption-converters/ytt2vtt.pl resources/subs-combined-en/*.ytt

    cleanup:
        cd resources/subs-combined-en
        /bin/rm -rf ./*.srt ./*.ytt
    
---

3. Get videos, thumbnails, and subtitles

    This is the most manual part of the process. For starters, you'll want
    to create three directories. You can name them whatever you want, but
    you'll have to adjust the latter scripts to look in the right place.
    Here are the directory names I use:

        vids-small - for the fully compressed KA videos
        thumbs-small - for the resized thumbnails
        srt - for the subtitles 

    I'm going to gloss over this part for now, but suffice it to say that
    prepping these directories are where the latter scripts pull media
    from to build the final package. I separate them out like this so that
    once you have them, you can use them over and over. You only have to
    get new stuff.

    Generally after running make_pages.pl (the next step), I capture the
    error output into a file and then work with that data to figure out
    what I need to get.

    For videos, it usually means using jDownloader to get the original files
    from youtube, compressing them with HandBrakeBatch, and then plopping them
    in the vids-small directory.

    For thumbnails, you can pull them from the web using XXX

4. Build the site

make_pages.pl kadata.txt

5. Build Search

   perl build_search.pl data/khandata.txt
   open resources/search-en/build-index.html in a browser
   save output into search-index.js (using textedit, plain text, utf-8)

    stopwords: build_search outputs the most common words
        you can paste these into "quote_stopwords" along with
        other stopwords from an official list and add the output to search.js

    if you're doing a new language you have to:
        - get the right stemmer in snowball.js
        - make sure the right stemmer and stopwords are in search.js
        - edit build-index.html to use the new stemmer and stopwords

6. rsyncing

    - first clean the directories of hidden files

        find kaos* resources/* -name ".*" -delete

    - next rsync things

        rsync -amv --del kaos/ ${wp}:/home/wp/modules-finished/ka
        rsync -amv --del kaos-fr/ ${wp}:/home/wp/modules-finished/ka-fr
        rsync -amv --del kaos-es/ ${wp}:/home/wp/modules-finished/ka-es
        rsync -amv --del kaos-pt/ ${wp}:/home/wp/modules-finished/ka-pt

    and you're... done?

