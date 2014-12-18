#!/usr/bin/perl
use strict;
use warnings;
use Data::Dumper;
use Storable qw(dclone);
use KATools;

#-------------------------------------------
# configuration settings
#-------------------------------------------
use constant DEBUG => 1; # status messages to STDERR
use constant LIMIT => 0; # limit items per level, for testing a smaller set

use constant SKIP_UNTRANSLATED => 1; # skip English videos if we're not doing English

$Data::Dumper::Sortkeys = 1; # slower dump, more legible output

#-------------------------------------------
# This is what we call each level of the tree. We don't actually
# use all these constants, but they're all listed for completeness.
#-------------------------------------------
use constant ROOT     => 0;
use constant SUBJECT  => 1;
use constant TOPIC    => 2;
use constant SUBTOPIC => 3;
use constant PLAYLIST => 4;
use constant VIDEO    => 5;

#-------------------------------------------
# This is the list of items we want to exclude
# from KA. If you exclude a higher level node
# here, all lower levels will be excluded as well.
#-------------------------------------------
our %exclude = (

  # TOP LEVEL

    # these playlists are based on US common core
    # and cover much the same material as in the
    # older math playlists, so for now we skip them
    "early-math" => 1,
    "cc-third-grade-math" => 1,
    "cc-fourth-grade-math" => 1,
    "cc-fifth-grade-math" => 1,
    "cc-sixth-grade-math" => 1,
    "cc-seventh-grade-math" => 1,
    "cc-eighth-grade-math" => 1,

    # college admissions is not our thing for now
    "college-admissions" => 1,

    # this seems to be just a subset of geometry
    "basic-geo" => 1,

    # these are probably too advanced for high school
    "integral-calculus" => 1,
    "multivariable-calculus" => 1,
    "differential-equations" => 1,
    "linear-algebra" => 1,
    "organic-chemistry" => 1,

    # these are not, strictly speaking, instructional videos
    "recreational-math" => 1,
    "competition-math" => 1,
    "discoveries-projects" => 1,

    # biology
    "crash-course-biology-science" => 1,
    "crash-course-ecology-2" => 1,

    # health and medicine
    "MCAT-competition" => 1,
    "health-care-system" => 1,
    "healthcare-misc" => 1,

);

#-------------------------------------------
# these are videos that have been identified as walkthroughs
# of KA website exercises, thus they don't really make sense to
# include here - there are probably more, so add as needed.
# You'll want to check as new videos are added to KA.
#-------------------------------------------
our %exclude_vids;

# UPDATE: we're going to let these in for now... they're
# sometimes cool demonstrations of the concepts, and
# maybe it'll upsell people to ka-lite or ka-online
%exclude_vids = map( { $_ => 1 } qw(
    -oFlAhtear4 0UIrs9BgCS8 0eWm-LY23W0 1F7LAJEVp-U 2oHUkHYtQoM
    3ACF7L-7Vsg 3Ayt7mOd_To 3HD-Ak_a6VE 4QX-tMRR0TE 4cxjvAPs92o
    4iUdgr_ccxk 4vNloi-zNjU 5FnwYwqIh7U 8sz1IPjBRS8 9CZfG3r5JBE
    9YjXGLWMvCM C9Rzb_OFuhk CpDfay5NeCg DIKkujAIeTY E_6ysOVUI6A
    F6rtQczAYco FICRd7Lp67s Gt7adTCc8qw H1H0xmjZMPA H6ZNLD1AeM8
    HtvikVD9aa0 IEKU6tubTEw INqaHHZGt8w Ig7RSc-93Bs Jeh5vudjmLI
    KCehC_3CBBY LoKEPEPaNm4 M3PTPN7NH8M MKErxh58RME MaMk6-f3T9k
    Nhn-anmubYU NjJFJ7ge_qk OCwLwaAQlMA PC_FoyewoIs PXKHyT__B2k
    R32xBmxXj2E TEXSW-o8674 TINBeqCzLVk VDnIdNM4tWI W7BoAZt8AfA
    WU9g4CvZyR0 XWq8bplP-_E XxmS_7I6c7Y YZRzt_AsuVs YyjpeoxdUXc
    _ghnnjzwCTc aINeMQH77jg ao9cx8JlJIU b-6pqRnm2b8 b9H22F0Qbgw
    bJF9R8_-0O0 bLTfBvkrfsM cK1egPBjJXE cdY0b4ziR5U dmcVzFbXMCU
    eDv7dk9uNmM edVnqL2Z59A ez1MIB8_2O0 ftndEjAg6qs g-SfwjbpA4U
    gnyHsgTFXIY hD4ySbQYYyA hpBBuaiIkrg i9j_VUMq5yg ioieTr41L24
    jNUz0P5MG9M jyKMEANFNi0 kHQCDrWTDv8 kfySynqWWos l_Qj6aC6RV8
    m8yC7kR5Fuk o_Vt7J08PE4 ouAFk0Jy6TY pikktRQSzTc qo5jU_V6JVo
    sJmLjUj_h68 sXP7VhU1gYE svUt84Touyc u9B-dV6r6rU uQs100shv-A
    ulyyusmpc9w w23DzA68KPE wJ37GJyViU8 woUQ9LLaees xC-fQ0KEzsM
    xG_XJ2ywi6M xeLeYS7GRvY y-O_B-wWivQ ynIq9IxbVso zaGUlwslGGg
    0QS4VHPV4JA 3RYME7HTJ8c 4kA-IOFwUN4 4xfOq00BzJA AHRh3EpJQH0
    Cn0skMJ2F3c DdLDu5BCgck EeIXVN1zUeM F2mfEldxsPI GWZKz4F9hWM
    Jni7E2RH43s NDeDnfuoDQM QrHsibKBVwI SuB1gkto9LU UJ1y_jcBUMI
    UTQ6z7_dlSk VhH2nEDCd68 e4CGX2LXMX0 gHMPEkoFVko jG7vhMMXagQ
    kZoFI_fcC74 n6xCyzOP900 uzvopM4PZLw 
));

#-------------------------------------------
# this one is a video of Sal showing how to make a video
#-------------------------------------------
$exclude_vids{ "u2F_dTulT0w" } = 1;

#-------------------------------------------
# these vids are referenced in the api,
# but do not exist on youtube
#-------------------------------------------
foreach my $id (

    # missing spanish vids
    qw( mRZk4NCMBz0 asbYt8d557k O5-_iE8m3EQ FHTJpNaKGEc eE2HRAddKu0
        kg_xfs_JUpQ 6rScVDympy  T3zrEDE8jrc xn2Sc36nJ5g Ji3E3li_u8I
        Bpbh6a6IhYg 3YEl-KfNf84 3cOmPmWMAdc OzSZMhj8zd0 sPG-Q0QfX-g
        DcdoEvmfwns ),

    # missing french vids
    qw( N0TRlpizpvI ),

    # missing portuguese vids
    qw( QG5dy7K-fCM RFKFRdujLFM EeiklM9rdVM biL7ILa6P6A_DUP_0 )

) { $exclude_vids{ $id } = 1; } 

#-------------------------------------------
# These hashes are for testing. Sometimes you want just one branch.
# If you specify a subject here, it'll only get that one.
# If you specify a topic as well, it'll get only that one.
# In the case of specifying a topic, you must specify the subject
# that contains the topic, though. So if you want all of "science"
# just put that in the first hash, but if you want just "biology",
# you have to put that in the second hash, and put "science" in
# the first as well. Leave them blank and things will run normally.
#-------------------------------------------
our %only_subject = map( { $_ => 1 } qw( ));
our %only_topic = map( {$_ => 1 } qw( ));

#-------------------------------------------
# Here is where we fire off the whole thing
#-------------------------------------------
my $data = KATools::get_data_from_file($ARGV[0]);
massage_data( $data );
print Dumper( $data );
exit;

#-------------------------------------------
# this sub does the heavy lifting of fleshing
# out each level and recursively calling itself
#-------------------------------------------
our $depth;
sub massage_data {

    my $parent = shift;

    $depth = 0 if not defined $depth;
    warn(( "\t" x $depth ) . "topic: $parent->{slug}\n") if DEBUG;
    ++$depth;

    # we need to build a new list of the children that aren't excluded
    my @new_children;
    my $count = 0;
    my $vidcount = 0;
    my $thumb_file;
    foreach my $child (@{$parent->{children}}) {

        # videos use a different key, we clobber it (oops)
        $child->{slug} = $child->{readable_id} if $child->{kind} eq "Video";

        # process %exclude and %only_* hashes
        if (   ($depth == SUBJECT and %only_subject
                and not $only_subject{ $child->{slug} } )
            or ($depth == TOPIC   and %only_topic
                and not $only_topic{   $child->{slug} } )
            or ($exclude{ $child->{slug} } )
        ) {
            warn "Skipping $child->{slug}\n";
            next;
        }

        # tell each child its path
        if (not $parent->{path}) {
            $child->{path} = $child->{slug};
        } else {
            $child->{path} = "$parent->{path}/$child->{slug}";
        }

        if ($child->{kind} eq "Topic") {

            # detect and expand shallow branches of the tree
            if ($depth < PLAYLIST and $child->{children}[0]{kind} eq "Video") {
                $child->{children} = [ dclone $child ];
            }

            massage_data($child);

            # sometimes there are no video children left
            # after the massage
            next if @{$child->{children}} < 1;

            $thumb_file = $child->{thumb_file} if not $thumb_file;
            $vidcount += $child->{vidcount};

        } elsif ($child->{kind} eq "Video") {

            # process video exclusions
            if (       $exclude_vids{ $child->{translated_youtube_id} }
                    or $exclude_vids{ $child->{youtube_id} }) {
                warn "Skipping $child->{slug}\n";
                next;
            }

            warn(( "\t" x $depth ) . "video: $child->{slug}\n") if DEBUG;

            # move stuff around
            if ($child->{youtube_id} eq $child->{translated_youtube_id}) {
                $child->{is_translated} = 0;
                next if SKIP_UNTRANSLATED;
            } else {
                $child->{is_translated} = 1;
            }
            $child->{en_youtube_id} = $child->{youtube_id};
            $child->{youtube_id} = delete $child->{translated_youtube_id};

            $child->{thumb_file} = "$child->{youtube_id}.jpg";
            $thumb_file = $child->{thumb_file} if not $thumb_file;
            ++$vidcount;
            $child->{depth} = $depth;

            # XXX between video_file and thumb_file do we even
            # need youtube_id any more?
            $child->{video_file} = "$child->{youtube_id}.mp4";

        } else {
            die "Unexpected kind: $child->{kind} ($child->{slug})\n";
        }

        $child->{title} = delete $child->{translated_title};
        $child->{description} = delete $child->{translated_description};

        push @new_children, $child;

        ++$count;
        last if (LIMIT and $count >= LIMIT);

    }

    $parent->{thumb_file} = $thumb_file;
    $parent->{vidcount}  = $vidcount;
    $parent->{depth} = $depth - 1;

    # replace the contents without breaking references
    @{$parent->{children}} = @new_children;

    --$depth;
    return;

}
