 <?php
 header('Access-Control-Allow-Origin: *');  
 
  $queryIsSet = isset($_REQUEST['q']);
  if ($queryIsSet) {
    $q = $_REQUEST['q'];
    echo "Question: " . $q ." | \n";;
  } else {
    echo "invalid request, nothing passed";
    die();
  }

  include 'wa_wrapper/WolframAlphaEngine.php';
  include 'config.php';
  include 'easter.php';

  if (!$queryIsSet) die();

  foreach ($hardBoiledEggs as $egg=>$yolk) {
    if (strpos(strtolower($q),strtolower($egg)) !== false) {
      echo "Interpretted as: {$egg} | \nAnswer: {$yolk}";
      die();
    }
  }


  $qArgs = array();
  if (isset($_REQUEST['assumption']))
    $qArgs['assumption'] = $_REQUEST['assumption'];

  // instantiate an engine object with your app id
  $engine = new WolframAlphaEngine( $cfg['wolfram']['appID'] );

  // we will construct a basic query to the api with the input 'pi'
  // only the bare minimum will be used
  $response = $engine->getResults( $q, $qArgs);

  if ( $response->isError() ) {
    echo "Sorry looks like there was a problem with the query. Maybe we're out of queries this month?";
    die();
  }

$pods = $response->getPods();

if (count($pods) > 0) {
    $questionSubpods = $pods[0]->getSubpods();
    $answerSubpods = $pods[1]->getSubpods();

    echo "Interpretted as: ".$questionSubpods[0]->plaintext." | \n";
    echo "Answer: ".$answerSubpods[0]->plaintext."\n";
}
else 
{
    foreach ($softBoiledEggs as $egg=>$yolk) {
      if (strpos(strtolower($q),strtolower($egg)) !== false) {
        echo "Interpretted as: {$egg} | \nAnswer: {$yolk}";
        die();
      }
    }

    echo "No Results found, or unable to parse your question.";
}
