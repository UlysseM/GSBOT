var roll = {
    author: 'pironic',
    name: 'roll',
    description: '- Roll a dice. default is 1d100 aka 1 , 100 sided dice. results will be between 1 and 100.',
    config: {
        permission: ['isListener']
    },
    onCall: function(request) {
        var numDice = 1;
        var typeDie = 100;
        var diceArray = [1,100];
        if (request.params !== undefined)
            diceArray = request.params.split('d');
        var capped = false;
        //console.log(diceArray);
        if(diceArray && diceArray.length > 1){
            if(!isNaN(diceArray[0])) numDice = diceArray[0];
            if(!isNaN(diceArray[1])) typeDie = diceArray[1];
            if(typeDie > 1000) {
                typeDie = 1000; capped = true;
            }
            else if (typeDie < 1) {
                typeDie = 1; capped = true;
            }
            if(numDice > 1000) {
                numDice = 1000; capped = true;
            }
            else if (numDice < 1) {
                numDice = 1; capped = true;
            }

        }

        if(capped)
        {
            request.sendChat("Dice Rolls capped to < 1000d1000 & > 1d1");
        }

        var diceRoll = 0;
        for(var i = 0; i < numDice; i++)
        {
            diceRoll += Math.floor((Math.random()*typeDie)+1);
        }

        request.sendChat(request.getListenerNameFromId(request.userID)+" rolled a "+diceRoll);


    }
};

module.exports = {mod: roll};
