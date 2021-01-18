const baseURL = 'http://jservice.io/api'

// Von innen nach außen:
// {question, answer, showing}  (entspricht einem einzelnen Feld) = clueObject
// [clue, clue, clue, clue, clue]  (entspricht einer Spalte) = cluesArray
// {title, clueArray}  (entpricht einer Spalte mit Überschrift) = categoryobj
// [categoryobj, categoryobj, categoryobj, categoryobj, categoryobj] (gesamtes Spielfeld)


// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

function handleClick(e) {
    // console.log(e.target.id); 
    let cat = +e.target.id.slice(2);
    let clue = +e.target.id.slice(0, 1);
    console.log(cat, clue);
    if((categories[cat].clues[clue].showing === null) && (!checkOpenQuestion())){        e.target.innerHTML = categories[cat].clues[clue].question;
        e.target.classList.add('question');
        e.target.classList.remove('showing');
        categories[cat].clues[clue].showing= 'question';
    } else if (categories[cat].clues[clue].showing === 'question'){
        e.target.innerHTML = categories[cat].clues[clue].answer;
        categories[cat].clues[clue].showing= 'answer';
        e.target.classList.add('answer');
        e.target.classList.remove('question');
    }
    if(checkGameOver()){
        viewGameOver();
    }
}

function writeTableHead(){
    $('#thead').empty().append('<tr id="headline"></tr>');
    
    categories.forEach(function(category){
        console.log('hallo');
        $('#headline').append(`<th>${category.title}</th>`)
    });
}

function writeAllToHTML(){
    console.log('inside writeAllToHTML')
    $('#headline').empty();
    $('#gameboard').empty();
    console.log($('#gameboard'));
    writeTableHead();
    for (let i = 0; i < 5; i++){
        const row = document.createElement('tr');
        for (let j = 0; j < 6; j++){
            const td = document.createElement('td');
            td.innerHTML = `?`
            td.id = `${i}-${j}`
            td.classList.add('showing');
            row.append(td)
        }
        $('#gameboard').append(row)
    }
}

function shuffleClues(arr){
    const newArr = [];
    let len = arr.length
    for (let i = 0; i < len; i++){
        let rand = Math.floor(Math.random() * arr.length)
        let x = arr.splice(rand, 1);
        // console.log(i, rand, arr.length, newArr.length)
        newArr.push(x);
    }
    return newArr;
}

async function getCluesFromOneCat(val){
        // console.log('Das ist val:', val) val ist {title, id} der category
        const url = `${baseURL}/clues?category=${val.id}`;
        let response = await axios.get(url); // 
        // console.log('Das ist response:', response.data);
        // console.log('response:', response.data.length, response.data)
        let clues = response.data;
        // console.log('Das ist clues:', clues);
        let shuffledClues = await shuffleClues(clues);
        // console.log('shuffledClues: ', shuffledClues[0]);
        const newClues = [];
        let i =0;
        
        while (newClues.length < 5){
            let shuff = shuffledClues[i][0];
            if (shuff.question && shuff.answer){
                    const newObj = {};
                    newObj.question = shuff.question;
                    newObj.answer = shuff.answer;
                    newObj.showing = null;
                    newClues.push(newObj);
            }
            i++;
        }
        val.clues= newClues;
        // console.log(val)
        return val
}

async function getClues(indexArr){          // indexArr von 6 [{title, categroyId}, ...] wird übergeben
    // console.log('Das ist der indexArr:', indexArr)
    for (let i=0; i<indexArr.length;i++){
        let val = await getCluesFromOneCat(indexArr[i]);
        categories.push(val);
    }
}

function selectCategories(resultArr){ //resultArray: Array von 100 Categories von der API
    const newSet = new Set();           // daraus werden 6 per Zufall ausgewählt
    const newArr = [];
    while (newArr.length < 6){
        let rand = Math.floor(Math.random()* 99);
        let lenSet = newSet.size;
        newSet.add(rand);
        if(lenSet < newSet.size){
            if(resultArr[rand].clues_count >= 5){
            newArr.push({id: resultArr[rand].id, title: resultArr[rand].title})
            }
        } 
    }
    // console.log('new Set with objects:', newSet)
    return newArr; // wird zum indexArr von 6 [{title, categroyId}, ...]
}

async function getCategories(){
    const random = (Math.floor(Math.random() * 20) + 1) * 100;
    // console.log(random)
    let url = `${baseURL}/categories?count=100&offset=${random}`;
    const result = await axios.get(url);
    // console.log('result: (alle Daten die der Server sendet als object)', result);
    // console.log('result.data: (array mit 100 objects)', result.data);
    return result.data;  // wird zum resultArray: Array von 100 Categories von der API
}

function checkOpenQuestion(){
    return Array.from($('td')).some(function(td){
        console.log('Es ist noch eine Frage offen.')
        return td.classList.contains('question')
    })
}

function checkGameOver(){
    const allCells = $('td');
    const gameOver = Array.from(allCells).every(function(cell){
       return cell.classList.contains('answer');
    })
    // console.log({gameOver})
    return gameOver;
}

async function createBoard() {
    const resultArr = await getCategories();  //resultArray: Array von 100 Categories von der API
    const indexArr = await selectCategories(resultArr);//resultArr => indexArr von 6 [{title, categroyId}, ...]
    await getClues(indexArr);
    // console.log({categories});
    writeAllToHTML();
}

function viewSetup(){
    hideAll();
    $('#spinner').show();
}

function viewGame(){
    hideAll();
    $('#container-bottom').show();
}

function viewGameOver(){
    $('#restart').show();
}

function hideAll(){
    $('#container-bottom').hide();
    $('#button').hide();
    $('#spinner').hide();
    $('#restart').hide();
}

async function setupAndStart(){
    await createBoard();
}

$('#gameboard').on('click', function(e){
    // console.log(e.target);
    handleClick(e)
})

$('#button').on('click', async function(e){
    e.preventDefault();
    viewSetup();
    await setupAndStart();
    viewGame();
})

$('#restart-btn').on('click', async function(e){
    e.preventDefault();
    categories.splice(0, categories.length);
    viewSetup();
    await setupAndStart();
    viewGame();
})