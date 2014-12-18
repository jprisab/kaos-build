#!/usr/bin/perl
use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request::Common;
use JSON;
use Data::Dumper;
use KATools;

#
# get a list of caption tracks:
# http://www.youtube.com/api/timedtext?type=list&v=QRS8MkLhQmM
#
# get a specific caption track:
# http://www.youtube.com/api/timedtext?lang=en&v=QRS8MkLhQmM


our $base_subdir = "resources/subs-youtube";
our $subdir = ""; # this will get set when we know the lang

our $json = JSON->new;
our $ua = LWP::UserAgent->new;
our $baseurl = "http://www.amara.org";

#-------------------------------------------
# start working
#-------------------------------------------

our ($haveit_count, $good_count, $err_count) = (0, 0, 0);

my $khandata = KATools::get_data_from_file($ARGV[0]);
our $lang = $khandata->{lang} || "en";
$subdir = $base_subdir . "-" . $lang;
if (not -e $subdir) { mkdir($subdir) or die "$!: $subdir\n"; }

my @pids;
foreach  my $subject (@{ $khandata->{children} }) {
    foreach  my $topic (@{ $subject->{children} }) {
        my $pid = fork();
        if ($pid) {
            # parent
            push @pids, $pid;
        } else {
            # child
            print "CHILD doing $topic->{title}\n";
            go_deep($topic);
            exit;
        }
    }
}

foreach my $pid (@pids) {
    print "Waiting for $pid...\n";
    waitpid($pid, 0);
}

print "$haveit_count have it, $good_count good, $err_count errors\n";

exit;

#-------------------------------------------
# stop working
#-------------------------------------------

#-------------------------------------------
# recurse until we've got to the bottom
#-------------------------------------------
sub go_deep {

    my $data = shift;

    if ($data->{children}) {
        foreach  my $child (@{ $data->{children} }) {
            go_deep($child);
        }
    } else {
            get_subs($data);
    }

    return;

}

#-------------------------------------------
# get subtitles from amara or youtube
#-------------------------------------------
sub get_subs {

    my $data = shift; 

    my $youtube_id = $data->{youtube_id};

    #-------------------------------------------
    # check if we already have the subs
    #-------------------------------------------
    if (-e "$subdir/$youtube_id.nosubs") {
#        print "Already checked for subs for $youtube_id, skipping.\n";
        ++$haveit_count;
        return;
    }

    if (-e "$subdir/$youtube_id.ytt") {
#        print "Already have subs for $youtube_id, skipping.\n";
        ++$haveit_count;
        return;
    }

    my $suburl = "http://www.youtube.com/api/timedtext?lang=$lang&v=$youtube_id";
    print "\t$suburl\n";
    my $resp = $ua->request( GET $suburl );
    if ($resp->is_success and length($resp->content)) {
        print "\tGOT SUBS from youtube\n";
        open FILE, ">$subdir/$youtube_id.ytt"
            or die "$!: $subdir/$youtube_id.ytt\n";
        print FILE $resp->content;
        close FILE;
        ++$good_count;
        return;
    } else { 
        print "\tFAILED: " . $resp->status_line
            . " - LENGTH: " . length($resp->content) . "\n";
        open FILE, ">$subdir/$youtube_id.nosubs"
            or die "$!: $subdir/$youtube_id.nosubs";
    }

}


