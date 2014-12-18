kaos-build
==========

Scripts for building Khan Academy On a Stick

My apologies for the lack of documentation and disorganization.

Prerequisites
==============

  JSON.pm - https://metacpan.org/pod/JSON
  Imager.pm - https://metacpan.org/pod/Imager
      need JPEG support (via libjpeg) to make thumbnails


Incomplete How-To
=================

This document describes the process of creating a new copy of Khan Academy
on a Stick, henceforth abbreviated as KAOS.

1. Get data from the Khan Academy API

    This is done using the script get_khan_data.pl and directing its output
    to a file, like so:

        perl get_khan_data.pl [es|pt|fr] > data/kadata-raw.txt

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

#. Process the data into a more useful form

    This is done using the script massage_khan_data.pl, feeding it the file
    from the previous step, and directing its output to a file, like so:

        perl massage_khan_data.pl data/kadata-raw.txt > data/kadata.txt

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

#. Get videos

    This part is still very manual - there's a script get_vids_new.pl
    that can retrieve the videos needed to render a particular data
    file, but the videos will not be compressed (that is currently done
    manually using handbrake).

        perl get_vids_new.pl data/kadata.txt

    Below are some notes that probbably won't help anyone else...

        maintenance:
            clear_vids-big_dups.pl - remove any dups from the vids-big dir
            move_uncomp_to_vids-temp.pl - move any big-only vids to vids-temp
            normalize_vid_names.pl - remove JDownloader name junk

        delete zero-sized vids
        delete log files and junk
        delete .*mp4 files? (does youtube use . in filename? i don't think so.)

        find bad files:
            find . | xargs file | grep -v "MPEG v4"

        handbrake contents of vids-temp

#. Subtitles (optional)

    Just some notes for a manual process:

        get_subs_youtube.pl data/kadata.txt
        get_subs_amara.pl data/kadata.txt

        combine:
            cp subs-amara-en/*.srt subs-combined-en/
            cp subs-youtube-en/*.ytt subs-combined-en/

        convert:
            perl caption-converters/srt2vtt.pl resources/subs-combined-en/*.srt
            perl caption-converters/ytt2vtt.pl resources/subs-combined-en/*.ytt

        cleanup:
            cd resources/subs-combined-en
            /bin/rm -rf ./*.srt ./*.ytt

#. Build Search

    Manual process notes:

        perl build_search.pl data/khandata.txt
        open resources/search-en/build-index.html in a browser
        save output into search-index.js (using textedit, plain text, utf-8)

        stopwords: build_search outputs the most common words
            you can paste these into "quote_stopwords" along with other
            stopwords from an official list and add the output to search.js

        if you're doing a new language you have to:
            - get the right stemmer in snowball.js
            - make sure the right stemmer and stopwords are in search.js
            - edit build-index.html to use the new stemmer and stopwords

#. Build the pages 

    Ok, there was a lot of manual, glossed-over stuff there, but the last script
    takes care of a lot of stuff: it makes all the HTML pages, downloads and
    compresses any missing thumbnails, and copies everything into it's right
    place.  You just run it like so:

        perl make_pages.pl data/kadata.txt

    You should check the settings at the top of that script first though, to
    make sure it's set to copy the thumbnails and videos.

    The output will go into a directory called "kaos-en" where "en" is for
    "English" and will be replaced with whatever language you're working with.

#. rsyncing to dev.worldpossible.org

    Manual process notes:

        - clean the directories of hidden files

            find kaos* resources/* -name ".*" -delete

        - next rsync things

            rsync -amv --del kaos-en/ ${wp}:/home/wp/modules-finished/kaos-en

    and you're... done?

