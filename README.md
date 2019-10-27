kaos-build
==========

Scripts for building Khan Academy On a Stick
fork of the original project https://github.com/needlestack/kaos-build
continued by Javier Prieto Sabugo

Initially was created for downloading ES/PT/FR but now has been extended to work with further languages
 
Prerequisites
==============

  JSON.pm - https://metacpan.org/pod/JSON
  Imager.pm - https://metacpan.org/pod/Imager
      need JPEG support (via libjpeg) to make thumbnails

  External non perl tools:
      ffmpeg
      youtube-dl - https://youtube-dl.org/


 How-To
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

    First you should check the top of the script for CONFIGURATION OPTIONS:

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

3. Get videos

    There's a script get_vids_new.pl
    that can retrieve the videos needed to render a particular data
    file, but the videos will not be compressed.

        perl get_vids_new.pl data/kadata.txt

    (?) The videos will be left always under 
    	
	resources/vids-temp

4. Compression

    To compress the videos, it is used ffmpeg
    We have created a script to automate calling the it for each video
	
        EXAMPLE
         compress_youtube_videos.sh  <directory>/resources/vids-temp <directory>/resources/vids-small 

   Compress the diles in the directory passed as 3rd parameter, deletes and moves them to the directory passed in the 4thp paramter
   I just created and tested it used mp4 video formats, hence the 1st and 2nd parameter values
   It ONLY compress the videos by rescaling them [to 620px heigh] you can change the compression details by editing the options in the ffmpeg command
   It process the videos sequentially, so you can interrupt it and continue where you left 
   It keeps a copy of the video stored in the directory passed as 3rd parameter, in case you need ro reprocess it

4. Subtitles (optional)

    All the subtitles download process is based on youtube-dl program
    It invokes directly the subtitles from youtube
	
        EXAMPLE
         download_youtube_subs.sh <directory>/resources/vids-small  <directory>/resources/subs-combined-pt  pt <directory>/resources/temp_list_vids_to_downlsubs
	
	$1 - Directory where the downloaded videos [video name like FNHuHMUiTjs.mp4 stored in <directory>/resources/vids-small/FNHuHMUiTjs.mp4 ] for which the subs are to be downladed are 
	$2 - Directory where the subtitles will be downloaded, they will be downloaded with vtt extention [<directory>/resources/subs-combined-pt/FNHuHMUiTjs.vtt in the example] 
	$3 - Language to be doownloaded
	$4 - Filename where the temporary list of the videos to be processed is stored (at start the script creates the list and goes deleting entries as it processes the files, so that in case it breaks, you can continue)

5. Build Search

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

6. Build the pages 

    It makes all the HTML pages, downloads and
    compresses any missing thumbnails, and copies everything into it's right
    place.  You just run it like so:

        perl make_pages.pl data/kadata.txt

    You should check the settings at the top of that script first though, to
    make sure it's set to copy the thumbnails and videos.

    The output will go into a directory called "kaos-en" where "en" is for
    "English" and will be replaced with whatever language you're working with.

        $VIDEO_SRC_DIR = "resources/vids-temp" -> put the directory where you left the compressed videos
        $SUB_SRC_DIR = "resources/subs-combined" -> if you are doing non english language it will AUTOMATICALLY add the suffix -<lang>
		si with this values, it wil go to search the subtitles in resources/subs-combined-pt if you are working with pt language

	
7. Copy the processed files and cleanup

	You will have your processed files under the kaos dir, you can copy them to the USB (or wherever you want)

	CLEAN UP:

	By default the last script () works in COPY mode, meaning that you are also storing temporary all the videos as well
	Clean all the generated files under:

		data/
		resources/vids*/
		resources/subs*/
		resources/thumbs*/


-------------

	

0. rsyncing to dev.worldpossible.org

    Manual process notes:

   

        - next rsync things

            rsync -amv --del kaos-en/ ${wp}:/home/wp/modules-finished/kaos-en

    

