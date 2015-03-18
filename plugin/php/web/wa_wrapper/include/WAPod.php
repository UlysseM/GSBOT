<?php

/** 
 *  The Wolfram Alpha Pod Object
 *  @package WolframAlpha
 */
class WAPod {
  // define the sections of a response
  public $attributes = array();
  public $markup = '';
  
  // private accessors
  private $subpods = array();
  private $substitutions = array();
  private $infos = array();
 
  // Constructor
  public function WAPod () {
  }

  /**
   *  Add a subpod to this pod
   *  @param WASubpod $subpod	the subpod to be added
   */
  public function addSubpod( $subpod ) {
    $this->subpods[] = $subpod;
  }

  /**
   *  Add a substitution to this pod
   *  @param WASubstitution $sub   the substitution to be added
   */
  public function addSubstitution( $sub ) {
    $this->substitutions[] = $sub;
  }

  /**
   *  Add an info to this pod
   *  @param WAInfo $info   the info to be added
   */
  public function addInfo( $info ) {
    $this->infos[] = $info;
  }

  /**
   *  Get the subpods associated with this pod
   *  @return array( WASubpod ) 	An array of subpods
   */
  public function getSubpods() {
    return $this->subpods;
  }

  /**
   *  Get the substitutions associated with this pod
   *  @return array( WASubstitution )         An array of substitutions
   */
  public function getSubstitutions() {
    return $this->substitutions;
  }

  /**
   *  Get the infos associated with this pod
   *  @return array( WAInfo )         An array of infos
   */
  public function getInfos() {
    return $this->infos;
  }
}
?>

