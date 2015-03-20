<?php
/*  WritheM mySQL database library.
 *
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2014 Michael Writhe and Gary Texmo
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 */

class QueryParameters
{
    private $parms = array();
    
    public function addParameter($parameterName, $parameterValue)
    {
        $this->parms[$parameterName] = $parameterValue;
    }
    
    public function clear()
    {
        unset($this->parms);
    }
    
    public function getParameterValue($parameterName)
    {
        return $this->parms[$parameterName];
    }

    public function getParameterNames()
    {
        return array_keys($this->parms);
    }
}

class Database
{
    public $MaintenanceMode;
    protected $dbConnection = null;
    
    private function bindParameters($stmt, $parms)
    {
        if ($parms != null)
        {
            //print "doing parameter binding...\n";
            foreach($parms->getParameterNames() as $parameterName)
            {
                $stmt->bindValue($parameterName, $parms->getParameterValue($parameterName));
                
                //print "binding parameter $parameterName with " . $parms->getParameterValue($parameterName) . "\n";
            }
        }
    }
    
    public function execute($query, QueryParameters $parms = null)
    {
        if ($this->dbConnection == null)
            throw new Exception("Cannot execute a query, no open connection.");
               
        $stmt  = $this->dbConnection->prepare($query);
        $this->bindParameters($stmt, $parms);

        if ($this->MaintenanceMode == false)
            $stmt->execute();
                
        return $stmt;
    }
    
    public function select($query, $parms = array())
    {
        if ($this->dbConnection == null)
            throw new Exception("Cannot execute a query, no open connection.");

        $stmt  = $this->dbConnection->prepare($query);
        $this->bindParameters($stmt, $parms);
        
        if ($this->MaintenanceMode == false)
            $stmt->execute();

        $result = null;
        while ($row = $stmt->fetch())
        {
            if ($result == null)
                $result = array();
                
            $result[] = $row;
        }
        
         return $result;
    }
    
    public function __construct(
        $host,
        $database,
        $user,
        $pass,
        $maintMode = false
    )
    {
        $this->initialize($host, $database, $user, $pass);
        $this->maintenanceMode = $maintMode;
    }
    
    public function __destruct()
    {
        $this->dbConnection = null;
    }

    private function initialize($host, $database, $user, $pass)
    {
        if ($this->dbConnection != null)
        {
            throw new Exception("Database connection is already open.");
        }
    
        $cfg['host'] = $host; 
        $cfg['dbase'] = $database; 
        $cfg['user'] = $user; 
        $cfg['pass'] = $pass;
    
        $conn = "mysql:host={$cfg['host']};dbname={$cfg['dbase']}";
        $this->dbConnection = new PDO($conn, $cfg['user'], $cfg['pass']);
        
        /*
        catch (PDOException $e) {
            header(':', true, 503);
            printf("<div id=\"fail_connect\">\n  <error details=\"%s\" />\n</div>\n", $e->getMessage());
        }
        */
    }
}

