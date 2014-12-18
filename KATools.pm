package KATools;
use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request::Common;
use JSON;

# don't bother verifying the cert (cause it won't)
$ENV{'PERL_LWP_SSL_VERIFY_HOSTNAME'} = 0;

our $ua   = LWP::UserAgent->new;
our $json = JSON->new;

our $trystrength = 3; # how many times to retry on no response

#-------------------------------------------
# read a Data::Dumper file and return the data as a perl ref
#-------------------------------------------
sub get_data_from_file {
    my $filename = shift;

    if (not defined $filename) {
        die "You must supply a data filename\n";
    }

    open FILE, "<$filename" or die "$!: $filename";
    local $/;
    my $VAR1;
    eval <FILE>;
    close FILE;

    if (not defined $VAR1) {
        die "Not a valid data file: $filename\n";
    }

    return $VAR1;

}

#-------------------------------------------
# This takes an API URL and returns a perl hashref
#-------------------------------------------
sub get_data_from_ka {

    my ($url, $lang) = @_;

    # we've occassionally had bad responses, so give it a few tries
    foreach my $try (1..$trystrength) {

        my $resp = $ua->request(
            GET "http://$lang.khanacademy.org/api/v1/$url"
        );

        if ($resp->is_success) {
            my $response = "";
            # sometimes you get a "valid" response of a bare null,
            # which causes the decode to die
            eval { $response = $json->decode( $resp->content ); };
            if ($@) {
                warn "Bad JSON from KA API for $url\n";
                return;
            } else {
                return $response;
            }
        }

        warn "Failed API call (try $try): "
            . $resp->status_line . " for $url, retrying...\n";
        sleep($trystrength);

    }

    warn "Giving up.\n";
    return;

}

#-------------------------------------------
# This takes any URL and returns raw content
#-------------------------------------------
sub get_data_from_url {

    my $url = shift;

    # we've occassionally had bad responses, so give it a few tries
    foreach my $try (1..$trystrength) {

        my $resp = $ua->request( GET $url );

        if ($resp->is_success) {
            return $resp->content;
        }

        warn "Failed HTTP req (try $try): "
            . $resp->status_line . " for $url, retrying...\n";
        sleep($trystrength);

    }

    warn "Giving up.\n";
    return;

}

1;
