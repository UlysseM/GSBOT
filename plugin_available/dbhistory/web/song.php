<?php

include_once('config.php');
include_once('database.php');

if (!isset($_GET['q']) || !isset($_GET['userid'])) {
    die('not enough vars');
}

try
{
    $db = new Database(
        $cfg['db']['host'],
        $cfg['db']['dbase'],
        $cfg['db']['user'],
        $cfg['db']['pass']
    );
}
catch (Exception $e) 
{
    print_r($e->getMessage());
    die();
}


$query = 'SELECT h.songName,h.artistName,SUM(h.upVotes) as UpVotes, SUM(h.downVotes) as DownVotes, SUM(h.upVotes)-SUM(h.downVotes) as VoteSum, COUNT(h.broadcastSongID) as PlayCount, (SUM(h.upVotes)-SUM(h.downVotes)) / COUNT(h.broadcastSongID) as VotesPerPlay
FROM songHistory AS h
WHERE userID = :userid
AND songID = :songid
AND timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) and NOW()
GROUP BY h.SongID
ORDER BY VotesPerPlay DESC
LIMIT 0, 25';

$params = new QueryParameters();
$params->addParameter(':userid',$_GET['userid']);
$params->addParameter(':songid',$_GET['q']);

$rows = $db->select($query, $params);

$songStats = array(
    "songName" => $rows[0]['songName'],
    "artistName" => $rows[0]['artistName'],
    "totalUpVotes" => $rows[0]['UpVotes'],
    "totalDownVotes" => $rows[0]['DownVotes'],
    "totalVoteSum" => $rows[0]['VoteSum'],
    "playCount" => $rows[0]['PlayCount'],
    "votesPerPlay" => $rows[0]['VotesPerPlay']
    );

echo "Vote Stats for '{$songStats['songName']}' by '{$songStats['artistName']} for the last 30 days are: ";
echo "Played {$songStats['playCount']} time" . ($songStats['playCount']>1?"s":"") . " | TotalVoteSum (TVS): {$songStats['totalVoteSum']} | VotesPerPlay (VpP): {$songStats['votesPerPlay']}\n";

