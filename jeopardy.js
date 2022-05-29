//going to be a length of 6 elements being objects
let categories = [];
let NUM_CATEGORIES = 5;

let $cluesSection =  $('#clues');
let $topicRow = $('#titles');
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() {
    let categoryIDs = [];
    //gets a randm category, and going to just use categories close to this point. start at 11491 to have enough to reach the end of 11496
    let randomCategory = Math.floor(Math.random()*11491);

    for(let i = 0; i<= NUM_CATEGORIES; i++){
        categoryIDs.push(randomCategory+i);
    }
    return categoryIDs;
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

async function getCategory(catId) {
    let categoryInfo = {};
    let clues = [];
    let result = await axios.get('https://jservice.io/api/category', {params :{id: catId}});

    categoryInfo["title"] = result.data.title;
    //making a copy of clues array
    clues = Array.from(result.data.clues);
    //each category only has 5 clues, 5 index not included 
    clues = clues.slice(0,5);
    categoryInfo["clues"] = clues;

    return categoryInfo;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

 
async function fillTable() {
   let categoriesIDs = getCategoryIds();

    //populating top row 
    for(let i = 0; i<= NUM_CATEGORIES; i++){
        let categoryInfo = await getCategory(categoriesIDs[i]);
        let $title = $(`<td class="categoryname"> ${categoryInfo.title} </td>`);
        $topicRow.append($title);
    }
    //populating body
   for(let i = 0; i<= NUM_CATEGORIES; i++){
        let categoryInfo = await getCategory(categoriesIDs[i]);
        let $cluerow = $('<tr>').addClass('cluerow');
        
        for(let j = 0; j< NUM_CATEGORIES; j++){
            let $card = $('<td class = "clue" showing=" " >').addClass(`[${i}][${j}]`);
            let $cardQ = $(`<div class="q"> ? </div>`);
            let $cardClue = $(`<div hidden class="question"> ${categoryInfo.clues[j].question} </div>`)
            let $cardAnswer = $(`<div hidden class="answer"> ${categoryInfo.clues[j].answer} </div>`)
            $card.append($cardQ);
            $card.append($cardClue);
            $card.append($cardAnswer);
            $cluerow.append($card);
        }
        $cluesSection.append($cluerow);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    //set cardClicked to the dom element that was clicked
    let cardClicked = $(evt.target);
    //check if showing attr is empty, if it's empty that means "?" is showing and need to change it to a question
    if(cardClicked.attr("showing") == " "){
        //div with .q is hidden
        cardClicked.find(".q").hide();
        //set showing to question for showing attribute in main td 
        cardClicked.attr("showing", "question");
        //reveal the question 
        cardClicked.find(".question").removeAttr("hidden");
    }
    //bug, user has to click on the blue background and not the question to reveal answer 
    else if (cardClicked.attr("showing") == "question"){
        cardClicked.find(".question").hide();
        cardClicked.attr("showing", "answer");
        cardClicked.find(".answer").removeAttr("hidden");
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#jeopardy").attr("hidden", "hidden");
    $('#titles').empty();
    $('tbody').empty();
    $(".loader").removeAttr("hidden");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $(".loader").attr("hidden", "hidden");
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    await fillTable();
}

/** On click of start / restart button, set up game. */

$('#restart').on('click', async function(event){
    //onclick will automatically reveal loading spinner
    showLoadingView();
    function setUpBoard(){
        //jeopardy game is being populated while hidden from user
        timeout = setTimeout(setupAndStart,3000);
        //after 4 seconds when the date is done populating, will hide spinner and reveal board to user
        timeout= setTimeout(function(){
            hideLoadingView();
            $('#jeopardy').removeAttr("hidden");
        }, 4000);
    }

    setUpBoard();
});

/** On page load, add event handler for clicking clues */
//event delegation for dynamically created elements
$(document).on('click', '.clue', function(event){
    event.preventDefault();
    handleClick(event);
});
