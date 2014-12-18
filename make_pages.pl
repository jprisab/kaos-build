#!/usr/bin/perl
use strict;
use warnings;
use JF::Template;
use KATools;
use KALang;
use Data::Dumper;
use Imager;

our $VIDEO_SRC_DIR = "resources/vids-small";
use constant COPY_VIDEOS => 1; # copy them from the local archive?
#use constant GET_VIDEOS => 1;  # download if not in the archive?

our $THUMB_SRC_DIR = "resources/thumbs-small";
use constant COPY_THUMBS => 1; # copy them from the local archive?
use constant GET_THUMBS => 1;  # download if not in the archive?

use constant COPY_SUBS => 1;
our $SUB_SRC_DIR = "resources/subs-combined";

our $WEB_SRC   = "./resources";
our $WEB_DEST  = "./kaos";
use constant TMPL_DIR => "templates";

our %lang_display_name = (
    en => "English",
    fr => "Français",
    es => "Español",
    pt => "Português",
    fa => "فارسی", # Persian
);

our $untranslated = 0;

#-------------------------------------------
# This is where we start the work
#-------------------------------------------
my $khandata = KATools::get_data_from_file($ARGV[0]);
our $lang = $khandata->{lang} || "en";
$SUB_SRC_DIR .= "-$lang";
$WEB_DEST .= "-$lang";
do_static();
build_index_page($khandata);

if ($lang ne "en") {
    print "untranslated: $untranslated\n";
}
exit;

#-------------------------------------------
# this builds the index page, and passes off
# work to other subs to build all the sub pages too
#-------------------------------------------
sub build_index_page {

    my $root = shift;

    my $t = new_template();

    $t->set_values({
        page_title => $KALang::map{"index-title"}{$lang},
        page_description => $KALang::map{"index-desc"}{$lang},
    });

    foreach my $subject ( @{ $root->{children} } ) {

        warn "subject: $subject->{slug}\n";

        my $subjectloop = $t->get_loop("subject");
        $subjectloop->set_values({
            subject_name   => $subject->{title},
            subject_anchor => $subject->{slug},
        });

        foreach my $topic ( @{ $subject->{children} } ) {

            warn "\ttopic: $topic->{slug}\n";

            my $topicloop = $subjectloop->get_loop("thumbs");
            $topicloop->set_values({
                thumb_name     => $topic->{title},
                thumb_img_url  => "$subject->{slug}/$topic->{slug}/thumbs/$topic->{thumb_file}",
                thumb_page_url => "$subject->{slug}/$topic->{slug}/index.html",
                thumb_anchor   => $topic->{slug},
                # use a language mapping if we have one...
                thumb_description => (
                    $KALang::map{"description-by-slug"}{$topic->{slug}}{$lang}
                    || $topic->{description}
                ),
                thumb_vidcount    => $topic->{vidcount},
                thumb_plural      => ($topic->{vidcount} != 1),
            });

            build_topic_page( $topic, $subject );

        }

    }

    #-------------------------------------------
    # now we save out the index page
    #-------------------------------------------
    my $filename = "$WEB_DEST/index.html";

    open FILE, ">$filename" or die "$!: $filename";
    print FILE stripspace( $t->parse_file( "index.tmpl" ) );
    close FILE;

    warn  "done.\n";

}

sub build_topic_page {

    my ($topic, $subject) = @_;

    my $t = new_template();

    $t->set_values({
        page_title   => $topic->{title},
        # use a language mapping if we have one...
        page_description => (
            $KALang::map{"description-by-slug"}{$topic->{slug}}{$lang}
            || $topic->{description}
        ),
        subject_name => $subject->{title},
        root_dir     => "../../", # this is for locating the stylesheet
        breadcrumbs => 1,
    });

    #-------------------------------------------
    # make the directory for this topic if needed
    # - we have to do this before we call the subs
    # further down because they depend on these
    #-------------------------------------------
    my $page_dir = "$WEB_DEST/$subject->{slug}";
    unless (-d $page_dir) {
        mkdir $page_dir or die "$!: couldn't make dir $page_dir";
    }
    $page_dir .= "/$topic->{slug}";
    unless (-d $page_dir) {
        mkdir $page_dir or die "$!: couldn't make dir $page_dir";
    }

    #-------------------------------------------
    # this renders the left hand navigation, which
    # is a list of sibling topics XXX duplication
    #-------------------------------------------
    $t->set_values({
        parent_url  => "../../index.html#$subject->{slug}",
        parent_name => $subject->{title},
        bc_subject_url  => "../../index.html#$subject->{slug}",
        bc_subject_name => $subject->{title},
    });
    foreach my $sib ( @{ $subject->{children} } ) {
        my $loop = $t->get_loop("siblings");
        $loop->set_values({
            sibling_url  => "../$sib->{slug}/index.html",
            sibling_name => $sib->{title},
            active => ($sib->{id} eq $topic->{id})
        });
    }

    #-------------------------------------------
    # this renders the main content on this page: subtopics
    #-------------------------------------------
    foreach my $subtopic ( @{ $topic->{children} } ) {

        warn "\t\tsubtopic: $subtopic->{slug}\n";

        my $subtopicloop = $t->get_loop("thumbs");
        $subtopicloop->set_values({
            thumb_name     => $subtopic->{title},
            thumb_img_url  => "thumbs/$subtopic->{thumb_file}",
            thumb_anchor   => $subtopic->{slug},
            thumb_page_url => "$subtopic->{slug}/index.html",
            thumb_description => $subtopic->{description},
            thumb_vidcount    => $subtopic->{vidcount},
            thumb_plural      => ($subtopic->{vidcount} != 1),
        });

        # this is needed so the subtopic can build the full path
        # (they can only see one level up to the topic, but 
        # need more info, so here it is)
        $topic->{dir} = "$subject->{slug}/$topic->{slug}";

        # XXX maybe this is how we should pass down
        $subtopic->{topic} = $topic;
        $subtopic->{subject} = $subject;

        build_subtopic_page( $subtopic, $topic );

    }

    #-------------------------------------------
    # now we save out the topic page
    #-------------------------------------------
    my $filename = "$WEB_DEST/$subject->{slug}/$topic->{slug}/index.html";

    open FILE, ">$filename" or die "$!: $filename";
    print FILE stripspace( $t->parse_file( "topic.tmpl" ) );
    close FILE;

}

sub build_subtopic_page {

    my ($subtopic, $topic) = @_;

    my $t = new_template();

    $t->set_values({
        page_title    => $subtopic->{title},
        page_description => $subtopic->{description},
        root_dir => "../../../", # this is for locating the stylesheet
        breadcrumbs => 1,
    });

    #-------------------------------------------
    # make the directory for this subtopic if needed
    # - we have to do this before we call the subs
    # further down because they depend on these
    #-------------------------------------------
    my $page_dir = "$WEB_DEST/$topic->{dir}/$subtopic->{slug}";
    unless (-d $page_dir) {
        mkdir $page_dir or die "$!: couldn't make dir $page_dir";
    }

    #-------------------------------------------
    # this renders the left hand navigation, which
    # is a list of sibling subtopics
    #-------------------------------------------
    $t->set_values({
        parent_url  => "../index.html",
        parent_name => $topic->{title},
        bc_topic_url  => "../index.html",
        bc_topic_name => $topic->{title},
        bc_subject_url => "../../../index.html#$subtopic->{subject}{slug}",
        bc_subject_name => $subtopic->{subject}{title},
    });
    foreach my $sib ( @{ $topic->{children} } ) {
        my $loop = $t->get_loop("siblings");
        $loop->set_values({
            sibling_url  => "../$sib->{slug}/index.html",
            sibling_name => $sib->{title},
            active => ($sib->{id} eq $subtopic->{id})
        });
    }

    #-------------------------------------------
    # this renders the main content on this page: playlists and videos
    #-------------------------------------------
    foreach my $playlist ( @{ $subtopic->{children} } ) {

        warn "\t\t\tplaylist: $playlist->{slug}\n";

        my $playlistloop = $t->get_loop("playlists");
        $playlistloop->set_values({
            playlist_name   => $playlist->{title},
            playlist_desc   => $playlist->{description},
            playlist_anchor => $playlist->{slug},
            first_vid_url   => "$playlist->{slug}/$playlist->{children}[0]{slug}.html",
        });

        #-------------------------------------------
        # make the directory for this playlist if needed
        # - we have to do this before we call the subs
        # further down because they depend on these
        #-------------------------------------------
        my $page_dir = "$WEB_DEST/$topic->{dir}/$subtopic->{slug}/$playlist->{slug}";
        unless (-d $page_dir) {
            mkdir $page_dir or die "$!: couldn't make dir $page_dir";
        }

        foreach my $video ( @{ $playlist->{children} } ) {

            warn "\t\t\t\tvideo: $video->{slug}\n";

            my $videoloop = $playlistloop->get_loop("thumbs");
            $videoloop->set_values({
                thumb_name     => $video->{title},
                thumb_img_url  => "../thumbs/$video->{thumb_file}",
                thumb_page_url => "$playlist->{slug}/$video->{slug}.html",
                thumb_anchor   => $video->{slug},
                thumb_description => ($lang eq "fr" ? "" : $video->{description}),
            });

            # XXX do this better?
            if (-e "$SUB_SRC_DIR/$video->{youtube_id}.vtt"
                    and $lang ne "en") { # don't show for english (maybe lose this entirely if coverage is good enough)
                $videoloop->set_value( has_subs => 1 );
            }
            if ($lang ne "en") {
                if ($video->{is_translated}) {
              # if it _is_ translated into the correct language
              # we probably shouldn't show a special flag
              #      $videoloop->set_value( show_lang => uc($lang) );
                } else {
              # only if it _isn't_ translated
                    $videoloop->set_value( show_lang => "EN" );
                }
            }

            # this is needed so the subtopic can build the full path
            # (they can only see one level up to the topic, but 
            # need more info, so here it is)
            $playlist->{dir} = "$topic->{dir}/$subtopic->{slug}/$playlist->{slug}";

            # XXX maybe this is how we should pass down
            $video->{subject}  = $subtopic->{subject};
            $video->{topic}    = $subtopic->{topic};
            $video->{subtopic} = $subtopic;
            $video->{playlist} = $playlist;

            build_video_page( $video, $playlist );

        }

    }

    #-------------------------------------------
    # now we save out the subtopic page
    #-------------------------------------------
    my $filename = "$WEB_DEST/$topic->{dir}/$subtopic->{slug}/index.html";

    open FILE, ">$filename" or die "$!: $filename";
    print FILE stripspace( $t->parse_file( "subtopic.tmpl" ) );
    close FILE;

}

our %vidnamecache;
sub build_video_page {

    my ($video, $playlist) = @_;

    my $t = new_template();

    $t->set_values({
        page_title        => $video->{title},
        page_description  => ($lang eq "fr" ? "" : $video->{description}),
        root_dir          => "../../../../", # this is for locating the stylesheet
        video_id          => $video->{youtube_id},
        show_video_player => 1, # includes js and css in head

        lang_code         => $lang,
        lang_display_name => $lang_display_name{$lang},

        # if it's an English video and we're not building
        # an English site, turn the captions on by default
        captions_on => ($lang ne "en" and not $video->{is_translated}),

        breadcrumbs => 1, # XXX remove or improve?

        video_broken_msg =>  $KALang::map{"videos-broken-msg"}{$lang},
        video_try_msg    =>  $KALang::map{"videos-try-msg"}{$lang},
    });


    #-------------------------------------------
    # this renders the left hand navigation, which
    # is a list of sibling videos
    #-------------------------------------------
    $t->set_values({
        parent_url  => "../index.html#$playlist->{slug}",
        parent_name => $playlist->{title},
        bc_playlist_url  => "../index.html#$playlist->{slug}",
        bc_playlist_name => $playlist->{title},
        bc_subtopic_url  => "../index.html",
        bc_subtopic_name => $video->{subtopic}{title},
        bc_topic_url  => "../../index.html",
        bc_topic_name => $video->{topic}{title},
        bc_subject_url  => "../../../../index.html#$video->{subject}{slug}",
        bc_subject_name => $video->{subject}{title},
    });
    foreach my $sib ( @{ $playlist->{children} } ) {
        my $loop = $t->get_loop("siblings");
        $loop->set_values({
            sibling_url  => "./$sib->{slug}.html",
            sibling_name => $sib->{title},
            active => ($sib->{id} eq $video->{id})
        });
    }

    # XXX do this better?
    if (-e "$SUB_SRC_DIR/$video->{youtube_id}.vtt") {
        $t->set_value( has_subs => 1 );
    }

    # XXX very hacky, but I've yet to figure a clear way
    # to manage the paths
    my ($topic_dir) = $playlist->{dir} =~ m[^(.+?/.+?)/];

    #-------------------------------------------
    # last steps, copy the video from the master repository
    #-------------------------------------------
    if (COPY_VIDEOS) {

        # avoid creating 3000 shells
        if (not %vidnamecache) {
            foreach my $file (`ls $VIDEO_SRC_DIR`) {
                chomp($file);
                $vidnamecache{ substr($file, 0, 11) } = $file;
            }
        }

        # XXX do this once when making the playlist page?
        if (not -e "$WEB_DEST/$topic_dir/videos") {
            mkdir "$WEB_DEST/$topic_dir/videos";
        }

        if (not $vidnamecache{$video->{youtube_id}} or
                not -e "$VIDEO_SRC_DIR/$vidnamecache{$video->{youtube_id}}") {

#            if (GET_VIDEOS) {
#                print "DOWNLOADING VIDEO: $video->{youtube_id} ($video->{slug})\n";
#            } else {
                print "MISSING VIDEO: $video->{youtube_id} ($video->{slug})\n";
#            }

        } elsif (not -e "$WEB_DEST/$topic_dir/videos/$video->{youtube_id}.mp4") {
            system(
                "cp '$VIDEO_SRC_DIR/$vidnamecache{$video->{youtube_id}}' " .
                "'$WEB_DEST/$topic_dir/videos/$video->{youtube_id}.mp4'"
            ) == 0 or die $!;
        }

    }

    #-------------------------------------------
    # copy the thumbnails from the master repository
    #-------------------------------------------
    if (GET_THUMBS and not -e "$THUMB_SRC_DIR/$video->{youtube_id}.jpg") {

        # see if we have a big one to work with
        my $big_filename = $THUMB_SRC_DIR;
        $big_filename =~ s/\-small$/\-big/; # XXX - HACKY!
        $big_filename .= "/$video->{youtube_id}.jpg";

        my $img;
        if (-e $big_filename) {

            # we did have a big one, so start with that
            print "GETTING THUMB from disk: $video->{youtube_id} ($video->{slug})\n";
            open FILE, "$big_filename" or die "$!: couldn't open $big_filename";
            local $/;
            $img = <FILE>;
            close FILE;

        } else {

            # we had nothing, so we have to get it from the net
            print "GETTING THUMB from net: $video->{youtube_id} ($video->{slug})\n";

            my $image_url = $video->{image_url};
            $image_url =~ s/^https/http/;
            eval { $img = KATools::get_data_from_url( $video->{image_url} ); };
            if ($@ or not $img) {
                print "Couldn't get thumbnail: $@ - $video->{slug}\n";
                undef $img;
            } else {
                # save the full size image we just got
                open FILE, ">$big_filename" or die "$!: couldn't open $big_filename";
                print FILE $img;
                close FILE;
            }

        }

        # assuming we got a big image, we resize and save it
        if ($img) {

            print "RESIZING THUMB: $video->{youtube_id} ($video->{slug})\n";

            my $tmpimg = Imager->new;
            $tmpimg->read( data => $img ) or die $tmpimg->errstr;

            my $thumb = $tmpimg->scale(
                xpixels => 120,
                ypixels => 80,
                type => "nonprop",
            ) or die $tmpimg->errstr;

            $thumb->write(
                file => "$THUMB_SRC_DIR/$video->{youtube_id}.jpg",
                jpegquality => 80,
            );

        } else {
            print "FUCKED THUMB: $video->{youtube_id} ($video->{slug})\n";
        }

    }

    if (COPY_THUMBS) {

        # XXX do this once when making the playlist page?
        if (not -e "$WEB_DEST/$topic_dir/thumbs") {
            mkdir "$WEB_DEST/$topic_dir/thumbs";
        }

        if ( not -e "$THUMB_SRC_DIR/$video->{youtube_id}.jpg") {
            print "MISSING THUMB: $video->{youtube_id} ($video->{slug})\n";
        } elsif (not -e "$WEB_DEST/$topic_dir/thumbs/$video->{youtube_id}.jpg") {
            system(
                "cp '$THUMB_SRC_DIR/$video->{youtube_id}.jpg' " .
                "'$WEB_DEST/$topic_dir/thumbs/$video->{youtube_id}.jpg'"
            ) == 0 or die $!;
        }

    }

    #-------------------------------------------
    # copy the subtitles from the master repository
    #-------------------------------------------
    if (COPY_SUBS) {

        # XXX do this once when making the playlist page?
        if (not -e "$WEB_DEST/$topic_dir/captions") {
            mkdir "$WEB_DEST/$topic_dir/captions";
        }

        if ( not -e "$SUB_SRC_DIR/$video->{youtube_id}.vtt") {
            my $needs_subs = ($lang ne "en" and not $video->{is_translated});
            if ($needs_subs) {
                print "MISSING $lang SUBS: $video->{youtube_id} ($video->{slug})\n";
                ++$untranslated;
            }
        } elsif (not -e "$WEB_DEST/$topic_dir/captions/$video->{youtube_id}.vtt") {
            system(
                "cp '$SUB_SRC_DIR/$video->{youtube_id}.vtt' " .
                "'$WEB_DEST/$topic_dir/captions/$video->{youtube_id}.vtt'"
            ) == 0 or die $!;
        }

    }

    #-------------------------------------------
    # now we save out the video page
    #-------------------------------------------
    my $filename = "$WEB_DEST/$playlist->{dir}/$video->{slug}.html";

    open FILE, ">$filename" or die "$!: $filename";
    print FILE stripspace( $t->parse_file( "video.tmpl" ) );
    close FILE;

}

#-------------------------------------------
# simple reduction in whitespace... cheap minify
#-------------------------------------------
sub stripspace {
    my $string = shift;
    $string =~ s/^\s+//gm;
    $string =~ s/\s+$//gm;
    $string =~ s/^\s*$//gm;
    return $string;
}

#-------------------------------------------
# this sub deals with rendering the more static
# files and copying a few things around
# -- make sure $lang gets defined before you
# call this
#-------------------------------------------
sub do_static {

    my ($t, $filename);

    unless (-d $WEB_DEST) {
        mkdir $WEB_DEST or die "$!: couldn't make dir $WEB_DEST";
    }

    # the about page is in English, so we override the
    # otherwise translated content here
    $t = new_template("en");

    $filename = "$WEB_DEST/about.html";
    open FILE, ">$filename" or die "$!: $filename";
    print FILE stripspace( $t->parse_file( "about.tmpl" ) );
    close FILE;

    $t = new_template();
    $t->set_values({
        search_page => 1,
        page_title => $KALang::map{"search-title"}{$lang},
    });
    $filename = "$WEB_DEST/search.html";
    open FILE, ">$filename" or die "$!: $filename";
    print FILE stripspace( $t->parse_file( "search.tmpl" ) );
    close FILE;

    # copy over static content
    `cp -r $WEB_SRC/img $WEB_DEST`;
    `cp -r $WEB_SRC/videojs $WEB_DEST`;
    `cp $WEB_SRC/style.css $WEB_DEST`;

    # copy over search indexes and support code
    unless (-d "$WEB_DEST/search") {
        mkdir "$WEB_DEST/search" or die "$!: couldn't make dir $WEB_DEST/search";
    }
    `cp $WEB_SRC/search-$lang/augment.min.js $WEB_DEST/search`;
    `cp $WEB_SRC/search-$lang/lunr.min.js $WEB_DEST/search`;
    `cp $WEB_SRC/search-$lang/search-index.js $WEB_DEST/search`;
    `cp $WEB_SRC/search-$lang/search-table.js $WEB_DEST/search`;
    `cp $WEB_SRC/search-$lang/search.js $WEB_DEST/search`;
    `cp $WEB_SRC/search-$lang/snowball.js $WEB_DEST/search`;

}

sub new_template {

    my $l = shift || $lang;
    
    my $t = JF::Template->new;
    $t->set_dir(TMPL_DIR);

    my ($month, $year) = (localtime())[4,5];
    $month = $KALang::map{"all-months"}{$l}[$month];
    $year += 1900;

    $t->set_values({
        creation_text => $KALang::map{"all-creation"}{$l},
        month => $month,
        year  => $year,
        free_text     => $KALang::map{"all-free-text"}{$l},
        khan_url      => $KALang::map{"all-free-url"}{$l},
        search_button => $KALang::map{"all-search-button"}{$l},
    });

    return $t;

}
