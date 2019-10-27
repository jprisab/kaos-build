#! /bin/bash
#
#  1 /home/javier/Projects/kaos-build/resources/vids-small
#  2 /home/javier/Projects/kaos-build/resources/subs-youtube-pt 
#  3 pt
#  4 /home/javier/Projects/kaos-build/resources/temp_list_vids_to_downlsubs
#  :/media/javier/Trekstor/KAOS-wf$ ./download_youtube_subs.sh  /media/javier/Trekstor/KAOS-wf/resources/vids-temp /media/javier/Trekstor/KAOS-wf/resources/subs-youtube-es es /media/javier/Trekstor/KAOS-wf/resources/temp_list_subtitl

srcVidDir=$1
destDir=$2
LANGUAGE=$3
srcList=$4


#PART1: Create a List of the videos to be downloaded, they should be the videos that are in the input folder
#If the list exists, just go ahead (to go on with an interrupted download)

if [ -f $srcList ]
 then
  echo "$srcList exists"
 else   
  echo "$srcList not exists, creating list of videos to download"
  ls -1 $srcVidDir | grep mp4 |awk -F"." '{print $1}' > $srcList
fi

#PART2: Download
#Work in a Temporary file
temp_dir=$(mktemp -d)
cd $temp_dir

#For displaying status statistics
numberOfFiles=`cat -n $srcList | wc -l`
numberOfFilesProcessed=0

while read videoName; do
  #For statistics
  numberOfFilesRemaining=`cat -n $srcList | wc -l`
  numberOfFilesFailed=`cat -n ${srcList}_failed | wc -l`

  echo "[Remaining:$numberOfFilesRemaining / Processed: $numberOfFilesProcessed/ Total: $numberOfFiles / Failed: $numberOfFilesFailed ] Downloading subitles for $videoName in language $LANGUAGE"

	
  youtube-dl --skip-download --sub-lang $LANGUAGE --write-auto-sub https://www.youtube.com/watch?v=$videoName --id -q
   mv $videoName.$LANGUAGE.vtt $destDir/.
  if [ $? == 0 ]; then
    echo "Download successfull"
   
  else
    echo "Download failed"
    echo "$videoName" > ${srcList}_failed
  fi
  sed -i "/$videoName/d" $srcList 
  numberOfFilesProcessed=$((numberOfFilesProcessed + 1))

done < $srcList

echo "Download Finished!"
echo "Deleting $temp_dir"
rm -rf $temp_dir
