#!/usr/bin/perl
use strict;
use warnings;
use Data::Dumper;
use KATools;

#-------------------------------------------
# URL of API docs:
#   http://api-explorer.khanacademy.org/group/api/v1/topic
#
# example of API call:
#   topic: http://www.khanacademy.org/api/v1/topic/arithmetic
#   video: http://www.khanacademy.org/api/v1/videos/basic-addition
#
# Note: this script would be much faster if it used fork()
# and IPC. There's some examples of how to do this at:
#   https://metacpan.org/module/Parallel::ForkManager#Data-structure-retrieval
# Probably should only fork at the second (i.e. topic) level or risk
# turning into a minor fork bomb on both the local machine and server
#-------------------------------------------

#-------------------------------------------
# configuration settings
#-------------------------------------------
use constant DEBUG => 1; # status messages to STDERR
use constant LIMIT => 0; # limit items per level, for testing a smaller set
use constant CLEAN => 1; # strip the hash to just the needed fields

$Data::Dumper::Sortkeys = 1; # slower dump, more legible output

#-------------------------------------------
# If the key isn't listed here, it will not be stored.
# This significantly reduces memory usage and execution time.
#-------------------------------------------
our %keep_keys = map({ $_ => 1 } qw(
    id slug hide deleted kind image_url
    translated_title translated_description translated_youtube_id
    readable_id children ka_url youtube_id
));

#-------------------------------------------
# there are some big branches that we don't plan on
# using, so although generally speaking this script
# is intended to get "the whole thing", and to let
# the "massage" script figure out what to use, we
# do in fact exclude some things here for speed sake
# - try to put only big, obvious stuff here
# (currently we exclude everything at the top level
# except math and science)
#-------------------------------------------
our %exclude = (
    # these are top level categories that we skip
    # as they are mainly not useful in non-US
    # academic environments
    "new-and-noteworthy" => 1,
    "economics-finance-domain" => 1,
    "humanities" => 1,
    "computing" => 1,
    "test-prep" => 1,
    "partner-content" => 1,
    "talks-and-interviews" => 1,
    "coach-res" => 1,

    # these math playlists are based on US common core
    # and cover much the same material as in the
    # general math playlists, so for now we skip them
    "cc-third-grade-math" => 1,
    "cc-fourth-grade-math" => 1,
    "cc-fifth-grade-math" => 1,
    "cc-sixth-grade-math" => 1,
    "cc-seventh-grade-math" => 1,
    "cc-eighth-grade-math" => 1,

);

#-------------------------------------------
# Here is where we fire off the whole darn thing
#-------------------------------------------
my $lang = shift @ARGV || "en";
my $data = KATools::get_data_from_ka( "topic/root", $lang );
clean_hash( $data ) if CLEAN;
$data->{lang} = $lang;
expand_children( $data );

#-------------------------------------------
# could use FreezeThaw for speed, but Dumper is
# nice because you can look at the resulting file
#-------------------------------------------
print Dumper( $data );
exit;

#-------------------------------------------
# this sub does the heavy lifting of fleshing
# out each level and recursively calling itself
#-------------------------------------------
our $depth = 0;
sub expand_children {

    my $parent = shift;
    my @expanded_children;

    $depth = 0 if not defined $depth;
    warn(( "\t" x $depth ) . "topic: $parent->{slug}\n") if DEBUG;
    ++$depth;

    my $count = 0;
    foreach my $child (@{$parent->{children}}) {

        next if $child->{hide};
        next if $child->{deleted};
        next if $exclude{ $child->{id} };

        # it's weird that before we expand the child the
        # "id" is what we use as a human readable identifier,
        # but after we expand "id" has become a hex number and
        # "slug" is what we want.

        if ($child->{kind} eq "Topic") {
            $child = KATools::get_data_from_ka("topic/$child->{id}", $lang);
            next if not $child;
            clean_hash($child) if CLEAN;
            my $childcount = expand_children($child);
            if ($childcount < 1) {
                # this usually means there were no videos (just exercises)
                next;
            }
        } elsif ($child->{kind} eq "Video") {
            warn(( "\t" x ($depth + 1) ) . "video: $child->{id}\n") if DEBUG;
            $child = KATools::get_data_from_ka("videos/$child->{id}", $lang);
            next if not $child;
            clean_hash($child) if CLEAN;
        } else {
            # probably an exercise or separator
            # -- we only concern ourselves with topics and videos
            next;
        }

        push @expanded_children, $child;

        ++$count;
        last if (LIMIT and $count >= LIMIT);

    }

    $parent->{children} = \@expanded_children;

    --$depth;

    return $count;

}

#-------------------------------------------
# This sub strips out everything we aren't looking for and
# reduces the size of the final data structure considerably.
#-------------------------------------------
sub clean_hash {
    my $obj = shift;
    foreach my $k (keys %$obj) {
        delete $obj->{$k} unless $keep_keys{$k};
    }
}
