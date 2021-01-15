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


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() {
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

function getCategory(catId) {
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

// fetches clues (q&a) from indexArr (6 columns)
// async function getCluesFromCategoryIndex(val){
//     const url = `${baseURL}/category?id=${val.id}`;
//         let res = await axios.get(url);
//         const catObj = {};
//         catObj.title = res.data.title;
//         console.log('res.data:', res.data);
//         console.log('res.data.title: ',res.data.title)
//         console.log('res.data.clues:', res.data.clues);
//         const arrClues = res.data.clues;
//         const newSet = new Set();
//         while (newSet.size < 5){
//             let rand = Math.floor(Math.random()* arrClues.length);
//             newSet.add(arrClues[rand])
//         }
//         const shuffledCluesArr = [...newSet]
//         console.log('shuffledCluesArr:', shuffledCluesArr)
//         const clues = shuffledCluesArr.map(function(val){
//         const newObj = {};
//         newObj.question = val.question;
//         newObj.answer = val.answer;
//         newObj.showing = null
//         return newObj;
//         })
// }


// async function getClues(indexArr){
//     indexArr.forEach(async function(val){
//        const categoryObject = getCluesFromCategoryIndex(val)
//     });
//     console.log('clues: ', clues)
//     catObj.clues = clues;
//     console.log('catobj:',catObj)
//     categories.push(catObj);
//     console.log('categories',categories)
        
// }


function writeTableHead(){
    for (category of categories){
        $('#gameboard').append(`<th>${category.title}</th>`)
    }
}

function writeAllToHTML(){
    console.log('inside writeAllToHTML');
    $('#gameboard').empty();
    console.log('Das ist gameboard: ', $('#gameboard'))
    writeTableHead();
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

async function getClues(indexArr){          // indexArr von 6 [{title, categroyId}, ...] wird übergeben
    console.log('Das ist der indexArr:', indexArr)
    indexArr.forEach(async function(val){       // val ist ein einzelnes Object {title, categoryId}
            console.log('Das ist val:', val)
        const url = `${baseURL}/clues?id=${val.id}`;
        let response = await axios.get(url); // 
        // console.log('Das ist response:', response.data);
        // console.log('öööööö', response.data.length, response.data)
        let clues = response.data;
        // console.log('Das ist clues:', clues);
        let shuffledClues = await shuffleClues(clues);
        const newClues = [];
        let i = 0;
        
        while(newClues.length < 5){
            let shuff = shuffledClues[i][0];
            if (shuff.question && shuff.answer){
                const newObj = {};
                newObj.answer = shuff.answer;
                newObj.question = shuff.question;
                newClues.push(newObj);
                newObj.showing = null;
            }
            i++;
        }
        val.clues = newClues;
        console.log(val)
       
        console.log('shuffled Clues: ', shuffledClues[0])
        // console.log('Das ist val:', val);
        console.log('Das ist newClues:', newClues);
        categories.push(val);
            });
        console.log('Das ist categories:', categories);
}

function selectCategories(resultArr){ //resultArray: Array von 100 Categories von der API
    const newSet = new Set();           // daraus werden 6 per Zufall ausgewählt
    while (newSet.size < 6){
        let rand = Math.floor(Math.random()* 99);
        if(resultArr[rand].clues_count >= 5){
        newSet.add({id: resultArr[rand].id, title: resultArr[rand].title})  // {title, categoriyId}
        }
    }
    console.log('new Set with objects:', newSet)
    return [...newSet];             // wird zum indexArr von 6 [{title, categroyId}, ...]
}


async function getCategories(){
    const random = (Math.floor(Math.random() * 20) + 1) * 100;
    // console.log(random)
    let url = `${baseURL}/categories?count=100&offset=${random}`;
    const result = await axios.get(url);
    console.log('result: (alle Daten die der Server sendet als object)', result);
    console.log('result.data: (array mit 100 objects)', result.data);
    return result.data;  // wird zum resultArray: Array von 100 Categories von der API
}


async function setupAndStart() {
    const resultArr = await getCategories();  //resultArray: Array von 100 Categories von der API
    const indexArr = await selectCategories(resultArr);//resultArr => indexArr von 6 [{title, categroyId}, ...]
    await getClues(indexArr);
    writeAllToHTML();
}

setupAndStart();
/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO