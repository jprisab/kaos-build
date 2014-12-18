#!/usr/bin/perl
use strict;
use warnings;
use Data::Dumper;
use KATools;

# this script loads a KA data file and then checks for
# all the required videos. It downloads full-size copies
# of anything it can't find, and places all the videos
# that need to be compressed into "vids-temp". Those videos
# can be compressed using Handbrake into the "vids-small"
# directory before being ready for use in KAOS. The videos
# in "vids-temp" should then be moved to "vids-big".

my $basedir = "resources";

# first we cache a result of everything we have on disk
our %vidsbig;
foreach my $file (`ls $basedir/vids-big`) {
    ++$vidsbig{ substr($file, 0, 11) };
}
our %vidssmall;
foreach my $file (`ls $basedir/vids-small`) {
    ++$vidssmall{ substr($file, 0, 11) };
}
our %vidstemp;
foreach my $file (`ls $basedir/vids-temp`) {
    ++$vidstemp{ substr($file, 0, 11) };
}

# next we dig into the data file that was passed to
# us and we download anything we don't have on disk
our ($vidssmall, $vidstemp, $vidsbig, $downloaded, $nodownload)
    = (0, 0, 0, 0, 0);
my $khandata = KATools::get_data_from_file($ARGV[0]);
go_deep($khandata);

print "$vidssmall videos ready to go\n";
print "$vidstemp videos already awaiting compression in vids-temp\n";
print "$vidsbig videos moved to vids-temp queue\n";
print "$downloaded videos downloaded vids-temp queue\n";
print "$nodownload videos failed to download\n";

exit;

sub go_deep {

    my $data = shift;

    # recurse until we've got to the bottom
    if ($data->{children}) {
        foreach  my $child (@{ $data->{children} }) {
            go_deep($child);
        }
        return;
    }

    my $id = $data->{youtube_id};

    if ($vidssmall{$id}) {
        # ready to use - no action needed
        ++$vidssmall;
    } elsif ($vidstemp{$id}) {
        # needs compression, in right place - no action needed by script
        ++$vidstemp;
    } elsif ($vidsbig{$id}) {
        # needs compression, needs moving
        rename(
            "$basedir/vids-big/$id.mp4",
            "$basedir/vids-temp/$id.mp4"
        ) or die "Couldn't move $id: $!";
        ++$vidsbig;
        # since we moved it, we need to update the filename cache
        ++$vidstemp{$id};
    } else {
        print "downloading $data->{youtube_id}\n";
        my $url = "http://s3.amazonaws.com/KA-youtube-converted/"
            . "$data->{youtube_id}.mp4/$data->{youtube_id}.mp4";
        my $vid = KATools::get_data_from_url($url);
        my $filename = "$basedir/vids-temp/$data->{youtube_id}.mp4";
        if ($vid) {
            open FILE, ">$filename" or die "$!: $filename";
            print FILE $vid;
            close FILE;
            ++$downloaded;
        } else {
            ++$nodownload;
        }
        # since we downloaded it, we need to update the filename cache
        ++$vidstemp{$id};
    }

}
