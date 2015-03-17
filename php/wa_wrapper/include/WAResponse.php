<?php

/** 
 *  The Wolfram Alpha Reponse Object
 *  @package WolframAlpha
 */
class WAResponse {
  // define the sections of a response
  public $attributes = array();
  public $error = array();
  public $rawXML = '';
  public $script = '';
  public $css = '';
 
  // private accessors
  private $pods = array();
  private $assumptions = array();

  // Constructor
  public function WAResponse () {
  }

  public function isError() {
    if ( $this->attributes['error'] == 'true' ) {
      return true;
    }
    return false;
  }

  /**
   *  Add a pod to this response object
   *  @param WAPod $pod	A WAPod object to be added
   */
  public function addPod( $pod ) {
    $this->pods[] = $pod;
  }

  /**
   *  Add an assumption to this response object
   *  @param WAAssumption $assumption A WAAssumption object to be added
   */
  public function addAssumption( $assumption ) {
    if ( !isset( $this->assumptions[$assumption->type] ) ) {
      $this->assumptions[$assumption->type] = array();
    }

    $this->assumptions[$assumption->type][] = $assumption;
  }

  /**
   *  Get the pods associated with this response
   *  @return array( WAPod )         An array of pods
   */
  public function getPods() {
    return $this->pods;
  }

  /**
   *  Get the assumptions associated with this response
   *  @return array( WAAssumption )         An array of assumptions
   */
  public function getAssumptions() {
    return $this->assumptions;
  }
}
?>
