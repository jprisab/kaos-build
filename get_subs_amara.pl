use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request::Common;
use JSON;
use Data::Dumper;
use KATools;

# example browser API call:
#
#  https://www.amara.org/api2/partners/videos/?video_url=http://www.youtube.com/watch?v=P_dNs8P9nSg&format=json
#
# curl -H 'X-api-username: jfield' \
#   -H 'X-apikey: 97e4306eb9593866502c39edd903a43864594e3c' \
#   -H 'Accept: application/json' \
#   "https://www.amara.org/api2/partners/videos/?video_url=https://www.youtube.com/watch?v=RNxwasijbAo"

our $subdir = "resources/subs-amara"; # this will get set further when we know the lang

$ENV{'PERL_LWP_SSL_VERIFY_HOSTNAME'} = 0; # don't bother verifying the cert (cause it won't)

our ($haveit_count, $good_count, $err_count) = (0, 0, 0);

our $json = JSON->new;
our $ua = LWP::UserAgent->new;
$ua->default_header( "X-api-username" => "jfield" );
$ua->default_header( "X-apikey" => "97e4306eb9593866502c39edd903a43864594e3c" );
$ua->default_header( "Accept" => "application/json" );
our $baseurl = "https://www.amara.org/api2/partners/videos";

my $khandata = KATools::get_data_from_file($ARGV[0]);
our $lang = $khandata->{lang} || "en";
$subdir .= "-$lang";
if (not -e $subdir) {
    mkdir($subdir) or die "Couldn't make subdir $subdir: $!";
}
get_subs($khandata);
exit;

sub get_subs {

    my $data = shift;

    #-------------------------------------------
    # recurse until we've got to the bottom
    #-------------------------------------------
    if ($data->{children}) {
        foreach  my $child (@{ $data->{children} }) {
            get_subs($child);
        }
        return;
    }

    #-------------------------------------------
    # for non-english vids, we only get the subs
    # if the video is not translated (is it too
    # confusing to have subs on already translated
    # videos _and_ english videos? not sure.) 
    #-------------------------------------------
    return if ($data->{is_translated} and $lang ne "en");

    #-------------------------------------------
    # convenience
    #-------------------------------------------
    my $youtube_id = $data->{youtube_id};

    my $yttdir = $subdir;
    $yttdir =~ s/amara/youtube/; # HACKY!
    if (-e "$subdir/$youtube_id.srt" or -e "$yttdir/$youtube_id.ytt") {
        warn "Already have subs for $youtube_id, skipping.\n";
        ++$haveit_count;
        return;
    }
    if (-e "$subdir/$youtube_id.nosubs") {
        warn "Already verified no subs for $youtube_id, skipping.\n";
        ++$err_count;
        return;
    }

    #-------------------------------------------
    # get the amara_id for this youtube_id
    #-------------------------------------------
    my $amara_id;
    warn "Getting amara_id for $youtube_id...\n";
    my $idurl = "$baseurl/?video_url=http://www.youtube.com/watch?v=$youtube_id";
    warn "\t$idurl\n";
    my $resp = $ua->request( GET $idurl );

    if ($resp->is_success) {

        my $obj = $json->decode( $resp->content );

        if ($obj->{objects}[0]{id} and
                # this makes sure there's a $lang sub
                grep { $_->{code} eq $lang } @{ $obj->{objects}[0]{languages} } ) {

            $amara_id = $obj->{objects}[0]{id};

        } else {
            warn "No subs for $youtube_id\n";
            open FILE, ">$subdir/$youtube_id.nosubs"
                or die "$!: $subdir/$youtube_id.nosubs";
            close FILE;
            ++$err_count;
            return;
        }

    } else {
        warn "Err on subs for $youtube_id: " . $resp->status_line . "\n";
        open FILE, ">$subdir/$youtube_id.nosubs"
            or die "$!: $subdir/$youtube_id.nosubs";
        close FILE;
        ++$err_count;
        return;
    }

    #-------------------------------------------
    # get the .srt for this amara_id
    #-------------------------------------------
    my $srt;
    warn "Getting srt for amara_id $amara_id (youtube_id $youtube_id)...\n";
    my $srturl = "$baseurl/$amara_id/languages/$lang/subtitles/?format=srt";
    warn "\t$srturl\n";
    $resp = $ua->request( GET $srturl );
    if ($resp->is_success) {
        $srt = $resp->content;
    } else {
        warn "\terr getting srt: " . $resp->status_line . "\n";
        open FILE, ">$subdir/$youtube_id.nosubs"
            or die "$!: $subdir/$youtube_id.nosubs";
        close FILE;
        ++$err_count;
        return;
    }

    #-------------------------------------------
    # save the .srt file
    #-------------------------------------------
    open FILE, ">$subdir/$youtube_id.srt" or die "Couldn't open $subdir/$youtube_id.srt: $!";
    print FILE $srt;
    close FILE;

    ++$good_count;

}
