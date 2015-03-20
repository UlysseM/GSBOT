<?php

include_once('config.php');
include_once('database.php');
include('header.inc'); 
try
{
    $db = new Database(
        $cfg['db']['host'],
        $cfg['db']['dbase'],
        $cfg['db']['user'],
        $cfg['db']['pass']
    );

    $query = 'SELECT h.songName,h.artistName,SUM(h.upVotes) as UpVotes, SUM(h.downVotes) as DownVotes, SUM(h.upVotes)-SUM(h.downVotes) as VoteSum, COUNT(h.broadcastSongID) as PlayCount, (SUM(h.upVotes)-SUM(h.downVotes)) / COUNT(h.broadcastSongID) as VotesPerPlay, b.name as broadcastUser
    FROM songHistory AS h
    LEFT JOIN broadcasts AS b ON h.userID = b.userID
    WHERE b.name = \'writhem\'
    AND timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) and NOW()
    GROUP BY h.SongID
    ORDER BY VotesPerPlay DESC
    LIMIT 0, 25';

    $rows = $db->select($query);
    ?>
Below is the table of the top 25 voted songs played in the last 7 days. It is clear that voting on songs while listening to WritheM Radio actually does mean something. We look at the stats and then make decisions about the type of music we continue to play based on your votes. Click the table headers to change the sort order, knowing that it's only pulling data of the top 25 by Vote per Play (VpP).
<table class="confluenceTable tablesorter">
    <thead>
        <tr class="sortableHeader">
            <th class="confluenceTh sortableHeader" data-column="0">
                <div class="tablesorter-header-inner">Song Name</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="1">
                <div class="tablesorter-header-inner">Artist Name</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="2">
                <div class="tablesorter-header-inner">Total UpVotes</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="3">
                <div class="tablesorter-header-inner">Total DownVotes</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="4">
                <div class="tablesorter-header-inner">Total VoteSum</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="5">
                <div class="tablesorter-header-inner">PlayCount</div>
            </th>
            <th class="confluenceTh sortableHeader tablesorter-headerSortDown" data-column="6">
                <div class="tablesorter-header-inner">VoteSum Average (VpP)</div>
            </th>
        </tr>
    </thead>
    <tbody class>
    <?    foreach($rows as $song)     {
        echo "        <tr>\n";
        echo "            <td class=\"confluenceTd\">".$song['songName']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['artistName']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['UpVotes']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['DownVotes']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['VoteSum']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['PlayCount']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['VotesPerPlay']."</td>\n";
        echo "        </tr>\n";
    }
    echo "    </tbody>";
    echo "</table>";

}
catch (Exception $e) 
{
    print_r($e->getMessage());
    die();
}
echo "<br/>\n";
try
{
    $db = new Database(
        $cfg['db']['host'],
        $cfg['db']['dbase'],
        $cfg['db']['user'],
        $cfg['db']['pass']
    );

    $query = 'SELECT h.songName,h.artistName,SUM(h.upVotes) as UpVotes, SUM(h.downVotes) as DownVotes, SUM(h.upVotes)-SUM(h.downVotes) as VoteSum, COUNT(h.broadcastSongID) as PlayCount, (SUM(h.upVotes)-SUM(h.downVotes)) / COUNT(h.broadcastSongID) as VotesPerPlay, b.name as broadcastUser
    FROM songHistory AS h
    LEFT JOIN broadcasts AS b ON h.userID = b.userID
    WHERE b.name = \'writhem\'
    AND timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) and NOW()
    GROUP BY h.SongID
    ORDER BY VotesPerPlay ASC
    LIMIT 0, 10';

    $rows = $db->select($query);
    ?>
Below is the table of the bottom 10 voted songs played in the last 7 days. Click the table headers to change the sort order, knowing that it's only pulling data of the bottom 10 by Vote per Play (VpP).
<table class="confluenceTable tablesorter">
    <thead>
        <tr class="sortableHeader">
            <th class="confluenceTh sortableHeader" data-column="0">
                <div class="tablesorter-header-inner">Song Name</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="1">
                <div class="tablesorter-header-inner">Artist Name</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="2">
                <div class="tablesorter-header-inner">Total UpVotes</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="3">
                <div class="tablesorter-header-inner">Total DownVotes</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="4">
                <div class="tablesorter-header-inner">Total VoteSum</div>
            </th>
            <th class="confluenceTh sortableHeader" data-column="5">
                <div class="tablesorter-header-inner">PlayCount</div>
            </th>
            <th class="confluenceTh sortableHeader tablesorter-headerSortDown" data-column="6">
                <div class="tablesorter-header-inner">VoteSum Average (VpP)</div>
            </th>
        </tr>
    </thead>
    <tbody class>
    <?
    foreach($rows as $song) 
    {
        echo "        <tr>\n";
        echo "            <td class=\"confluenceTd\">".$song['songName']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['artistName']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['UpVotes']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['DownVotes']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['VoteSum']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['PlayCount']."</td>\n";
        echo "            <td class=\"confluenceTd\">".$song['VotesPerPlay']."</td>\n";
        echo "        </tr>\n";
    }
    echo "    </tbody>";
    echo "</table>";

}
catch (Exception $e) 
{
    print_r($e->getMessage());
    die();
}

include('footer.inc');