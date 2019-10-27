use strict;
use warnings;
use Data::Dumper;
use KATools;
use Imager;

die "I need a KA data file.\n" if not $ARGV[0];

my $khandata = KATools::get_data_from_file($ARGV[0]);
our $lang = "en";
if ($lang) { $lang = "-$lang"; }

our $idx_file = "resources/search$lang/search-pre-index.js";
our $tab_file = "resources/search$lang/search-table.js";

open IDX_FILE, ">$idx_file" or die "$!: $idx_file";
open TAB_FILE, ">$tab_file" or die "$!: $tab_file";

our $count = 1;
our %stopwords;

#-------------------------------------------
# the first entry is a dummy, so that the ID's
# line up with the array index (this effects both
# indexing in build-index.html and retreival in search.js)
#-------------------------------------------
print IDX_FILE "var pages = [{}\n";
print TAB_FILE "var pages = [{}\n";

go_deep($khandata);

print IDX_FILE "\n];\n";
print TAB_FILE "\n];\n";

#-------------------------------------------
# this prints out the 100 most common words,
# after building the index, which may be useful as
# stopwords (you'd have to paste them into
# the appropraite search.js file)
#-------------------------------------------
$count = 0;
foreach my $word (sort { $stopwords{$a} <=> $stopwords{$b} } keys %stopwords) {
    print "$stopwords{$word}\t$word\n";
    last if $count >= 100;
    ++$count;
}

exit;

sub go_deep {

    my $data = shift;

    #-------------------------------------------
    # recurse until we've got to the bottom
    #-------------------------------------------
    if ($data->{children}) {
        foreach  my $child (@{ $data->{children} }) {
            if (not $data->{dir}) {
                $child->{dir} = $child->{slug};
            } else {
                $child->{dir} = "$data->{dir}/$child->{slug}";
            }
            go_deep($child);
        }
        return;
    }

    print IDX_FILE ",";
    print TAB_FILE ",";

    #-------------------------------------------
    # we use "i", "t", and "d" instead of "id", "title", "description"
    # to minimize the resulting javascript and indexes
    #-------------------------------------------
    my $idx_title = index_clean( $data->{title} );

# we try skipping the description
# smaller index, faster search, decent results?
#    my $idx_desc  = index_clean( $data->{description} );
#    print IDX_FILE qq({i:$count,t:"$idx_title",d:"$idx_desc"});

    print IDX_FILE qq({i:$count,t:"$idx_title"});

    #-------------------------------------------
    # we use the above plus "u" and "y" for "url" and "youtube_id"
    # - also, we put together the thumb url from the youtube_id in javascript
    # again, all to minimize javascript file size
    #-------------------------------------------
    my $tab_title = html_clean( $data->{title} );

# skipping the description
#    my $tab_desc  = html_clean( $data->{description} );
#    print TAB_FILE qq({i:$count,t:"$tab_title",d:"$tab_desc",u:"$data->{dir}",y:"$data->{youtube_id}"});

    print TAB_FILE qq({i:$count,t:"$tab_title",u:"$data->{dir}",y:"$data->{youtube_id}"});

# skipping the description
#    foreach my $word (split /\s+/, "$idx_title $idx_desc") {

    foreach my $word (split /\s+/, $idx_title) {
        ++$stopwords{$word};
    }

    ++$count;

}

sub html_clean {
    my $text = shift // "";
    $text =~ s/&/&amp;/g;   # html escapes
    $text =~ s/"/&quot;/g;  # "
    $text =~ s/</&lt;/g;    # "
    $text =~ s/>/&gt;/g;    # "
    $text =~ s/\s+/ /g;     # collapse extra space
    $text =~ s/^ +//;       # remove leading space
    $text =~ s/ +$//;       # remove trailing space
    return $text;
}

sub index_clean {
    my $text = lc( shift // "" );

    # these are separate for legibility
    $text =~ s/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/]/ /g;
    $text =~ s/[\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]/ /g;

    # these seem to need to be separate
    # or they corrupt the encoding
    $text =~ s/¡/ /g;
    $text =~ s/¿/ /g;

    $text =~ s/\s+/ /g;    # collapse extra space
    $text =~ s/^ +//;      # remove leading space
    $text =~ s/ +$//;      # remove trailing space
    return $text;
}
