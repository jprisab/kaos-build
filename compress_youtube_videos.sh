#!/bin/bash
#   compress_youtube_videos.sh /media/javier/Trekstor/KAOS-wf/resources/vids-temp /media/javier/Trekstor/KAOS-wf/resources/vids-small  /media/javier/Trekstor/KAOS-wf/resources/vids-processed

srcExt="mp4"
destExt="mp4"

srcVidDir=$1
destDir=$2
destdirDONE=$3

#PART1: Create a List of the videos to be downloaded, they should be the videos that are in the input folder
#If the list exists, just go ahead (to go on with an interrupted download)



#For displaying status statistics
numberOfFiles=`ls -1 $srcVidDir | grep $srcExt | wc -l`
numberOfFilesProcessed=0



for filename in "$srcVidDir"/*.$srcExt; do

        basePath=${filename%.*}
        baseName=${basePath##*/}

        ffmpeg -v quiet -stats -i "$filename" -filter:v scale="620:trunc(ow/a/2)*2" -c:a copy "$destDir"/"$baseName"."$destExt"
		
		numberOfFilesProcessed=$((numberOfFilesProcessed + 1))
		echo "[ Processed: $numberOfFilesProcessed / Total: $numberOfFiles ] DONE  $srcVidDir/$filename"
		mv $filename $destdirDONE/.	
done
echo "Conversion from ${srcExt} to ${destExt} complete!"
