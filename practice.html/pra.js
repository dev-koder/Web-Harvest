// function changeColor() {
//     document.getElementById('color').style.color = 'red';
// }


// const person = [
//     {name: 'Sachin',Rating : 9.0},
//     {name: 'Ayush',Rating : 8.0},
//     {name: 'Patel',Rating : 7.0},
//     ];

// function showMovies() {
//     let list = document.getElementById('personlist');
//     list.innerHTML = "";

//     person.forEach(p => {
//         list.innerHTML += `<p>${p.name}- Rating : ${p.Rating}</p>`;
//     });
        
// };

// showMovies();



// document.getElementById('btn').addEventListener('click', () => {
//     document.getElementById('msg').innerText = 'I am Clicked';
// })


// const person = [
//     {name: 'Sachin',Rating : 9.0},
//     {name: 'Ayush',Rating : 8.0},
//     {name: 'Patel',Rating : 7.0},
// ];
    
// function showPerson(ListToShow) {
//     let list = document.getElementById('personList');
//     list.innerHTML = "";

//     ListToShow.forEach(p => {
//         list.innerHTML += '<p>' + 'name: ' + p.name + ' Rating: ' + p.Rating + '</p>';
//     });

// };
// showPerson(person);
// document.getElementById('btn').addEventListener('click', () => {
//     let searchValue = document.getElementById('search').value.toLowerCase();
//     let filterThing = person.filter(p => p.name.toLowerCase().includes(searchValue));
//     showPerson(filterThing);
// });



// 8
// const person = [
//     {name: 'Sachin',Rating : 9.0},
//     {name: 'Ayush',Rating : 8.0},
//     {name: 'Patel',Rating : 7.0},
// ];

// function showPerson() {
//     let list = document.getElementById('personList');
//     list.innerHTML = '';

//     person.forEach(p => {
//         list.innerHTML += `<p> Name: ${p.name} - Rating: ${p.Rating} </p>`;
//     });
// };
// showPerson();

// document.getElementById('btn').addEventListener('click', () => {
//     let title = document.getElementById('newPerson').value;
//     let rating = document.getElementById('newRating').value;

//     if (title && rating) {
//         person.push({ name: title, Rating: Number(rating) });
//         showPerson();
//         document.getElementById('newPerson').value = '';
//         document.getElementById('newRating').value = '';
//     } else {
//         alert('Dono value dalna bhai');
//     }

// });