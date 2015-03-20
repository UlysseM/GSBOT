<?php
header('Access-Control-Allow-Origin: *');  
 
require_once('config.php');
require_once('database.php');

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

if (isset($_GET['songid'])) {
    statsGet($db);
} else {
    songSave($db);
}
 
 function statsGet($db) {
    $query = 'SELECT h.songName,h.artistName,SUM(h.upVotes) as UpVotes, SUM(h.downVotes) as DownVotes, SUM(h.upVotes)-SUM(h.downVotes) as VoteSum, COUNT(h.broadcastSongID) as PlayCount, SUM(h.listens) as TotalListens, (SUM(h.upVotes)-SUM(h.downVotes)) / COUNT(h.broadcastSongID) as VotesPerPlay
    FROM songHistory AS h
    WHERE userID = :userid
    AND songID = :songid
    AND timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) and NOW()
    GROUP BY h.SongID
    ORDER BY VotesPerPlay DESC
    LIMIT 0, 25';

    $params = new QueryParameters();
    $params->addParameter(':userid',$_GET['userid']);
    $params->addParameter(':songid',$_GET['songid']);

    $rows = $db->select($query, $params);

    $songStats = array(
        "songName" => $rows[0]['songName'],
        "artistName" => $rows[0]['artistName'],
        "totalUpVotes" => $rows[0]['UpVotes'],
        "totalDownVotes" => $rows[0]['DownVotes'],
        "totalVoteSum" => $rows[0]['VoteSum'],
        "playCount" => $rows[0]['PlayCount'],
        "totalListens" => $rows[0]['TotalListens'],
        "votesPerPlay" => $rows[0]['VotesPerPlay']
        );

    echo "Vote Stats for '{$songStats['songName']}' by '{$songStats['artistName']} for the last 30 days are: ";
    echo "Played {$songStats['playCount']} time" . ($songStats['playCount']>1?"s":"") . " | Heard {$songStats['totalListens']} time" . ($songStats['totalListens']>1?"s":"") . " | TotalVoteSum (TVS): {$songStats['totalVoteSum']} | VotesPerPlay (VpP): {$songStats['votesPerPlay']}\n";
 }

 function songSave($db) {
require_once('config.php');
require_once('database.php');

$request_body = file_get_contents('php://input');
$data = json_decode($request_body);

$parms = new QueryParameters();
$parms->addParameter(':broadcastSongID',$data->history->broadcastSongID);
$parms->addParameter(':userID',$data->userID);
$parms->addParameter(':songID',$data->songID);
$parms->addParameter(':songName',$data->songName);
$parms->addParameter(':artistID',$data->artistID);
$parms->addParameter(':artistName',$data->artistName);
$parms->addParameter(':albumID',$data->albumID);
$parms->addParameter(':albumName',$data->albumName);
$parms->addParameter(':votes',count($data->history->upVotes)-count($data->history->downVotes));
$parms->addParameter(':upVotes',count($data->history->upVotes));
$parms->addParameter(':downVotes',count($data->history->downVotes));
$parms->addParameter(':listens',$data->history->listens);
$parms->addParameter(':estimateDuration',$data->estimateDuration);

$query = "INSERT INTO  songHistory (broadcastSongID, userID, songID,
            songName, artistID, artistName, albumID, albumName, votes, upVotes, downVotes,
            listens, estimateDuration)
        VALUES (:broadcastSongID,  :userID, :songID, 
            :songName, :artistID, :artistName, :albumID, :albumName, :votes, :upVotes, :downVotes, 
            :listens, :estimateDuration)
        ON DUPLICATE KEY UPDATE votes=:votes, upVotes=:upVotes, downVotes=:downVotes;";

try
{
    //$result = $db->execute($query, $parms);
}
catch (Exception $e) 
{
    print_r($e->getMessage());
}        
        
//echo "data captured for '{$data->songName} - {$data->artistName}'";
}