const list = document.querySelector('.ul');
const form = document.querySelector('.form-group');
const search = document.querySelector('.search-field input');

const editContainer = document.querySelector('.edit_container')
const editForm = document.querySelector('.editFormGroup')

// creating the note
const addNote = (note, id) => {
    let date = new Date(note.Created_at.seconds * 1000)
    // let time = note.Created_at.toDate();
    // const date = new Date(note.Created_at.toMillis());
    const time = date.toLocaleString();
    // const timestamp = snapshot.get('Created_at');
    // const time = timestamp.toDate();
    let html = `
    <li class="id" data-id="${id}">
        <div class="card-big-shadow">
            <div class="card card-just-text" data-background="color" data-color="blue" data-radius="none">
                <div class="content">
                    <h4 class="title">${note.Title}</h4>
                    <p class="description">${note.Description}</p>
                    <p class="checkbox-important"></p>
                    <div class="created-at">${time}</div>
                    <i id="btn-delete" class="fas fa-trash-alt"></i>
                    <i class="fas fa-edit"></i>
                </div>
            </div>       
        </div>
    </li>
    `;

    list.innerHTML += html;

}

// delete function
const deleteNote = (id) => {
    const Notes = document.querySelectorAll('li');
    Notes.forEach(note => {
        if (note.getAttribute('data-id') === id) {
            note.remove();
        }
    });
}

//updating note function
const updateNote = (data, id) => {

    let getNote = document.querySelector(`li[data-id="${id}"]`);
    let oldTitle = getNote.querySelector('.title');
    let oldDescription = getNote.querySelector('.description');
    let oldImportant = getNote.querySelector('.checkbox-important');

    oldTitle.innerText = data.Title;
    oldDescription.innerText = data.Description;

    if(data.Important) {
        // oldImportant.style.display = "Important";
        importantNote.style.display = 'inline-block';
    }

    else {
        // oldImportant.style.display = "";
        importantNote.style.display = 'none';
    }
    form.reset();
}

// get documents - real-time
db.collection('Notes').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        const doc = change.doc;

        if (change.type === 'added') {
            addNote(doc.data(), doc.id);
        } 
        
        else if (change.type === 'removed') {
            deleteNote(doc.id);
            return;
        }

        else if(change.type === 'modified') {
            updateNote(doc.data(), doc.id);
        }

        //Important check
        let getID = document.querySelector(`li[data-id="${doc.id}"]`);
        let importantText = getID.querySelector('.checkbox-important');

        if (doc.get('Important') === true) {
            importantText.innerText = 'Important';
        } else {
            importantText.innerText = '';
        }
    })
});

//add documents
form.addEventListener('submit', e => {
    e.preventDefault();

    const importantNote = document.querySelector('#important');
    let importantOutput = '';

    // boolean check html
    if (importantNote.checked) {
        importantOutput = true;
    } 
    
    else {
        importantOutput = false;
    }

    // outputting the data
    const now = new Date();
    const note = {
        Title: form.note1.value,
        Description: form.note2.value,
        Important: importantOutput,
        Created_at: firebase.firestore.Timestamp.fromDate(now),
    };

    db.collection('Notes').add(note).then(() => {})
        .catch(err => {});
    form.reset();
});


// displaying old data
list.addEventListener('click', e =>{
    if(e.target.className === 'fas fa-edit') { 
        const id = e.target.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');
        let newTitle = document.querySelector('#editNote1');
        let newDescription = document.querySelector('#editNote2');
        let newImportant = document.querySelector('#editImportant');

        db.collection('Notes').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {

                const doc = change.doc;

                editForm.setAttribute('data-id', id);

                newTitle.value = doc.data().Title;
                newDescription.value = doc.data().Description;
                newImportant.checked = doc.data().Important;
            })
        });
    }
});

// saving updated version
editForm.addEventListener('click', e => {

    e.preventDefault();        
    
    if(e.target.id === 'updateButton'){
        let update_date = new Date();
        let id = e.target.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');
        let importantOutput = '';
        let importantNote = document.querySelector('#editImportant');

    // boolean check html
    if (importantNote.checked) {
        importantOutput = true;
    } 
    
    else {
        importantOutput = false;
    }

    const updateNote = {
        Title: editForm.editNote1.value,
        Description: editForm.editNote2.value,
        Important: importantOutput,
        Created_at: firebase.firestore.Timestamp.fromDate(update_date),
    };
        db.collection('Notes').doc(id).set(updateNote).then(() => {
            console.log('Note updated!');
        })
        .catch(err => {
            console.log(err);
        });
    
    } 
}); 

// edit button
list.addEventListener('click', e => {
    if(e.target.className === 'fas fa-edit')
    {
        editContainer.classList.add('edit-form-show');
    }
});

// closing edit window
window.addEventListener('click', e => {
    if(e.target === editContainer)
    editContainer.classList.remove('edit-form-show');
});


// deleting data button
list.addEventListener('click', e => {

    if (e.target.className === 'fas fa-trash-alt') {
        const id = e.target.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');
        db.collection('Notes').doc(id).delete().then(() => {   
        
        });
    } 
});

// searching for data
const filterNotes = (term) => {
    Array.from(list.children)
        .filter((note) => !note.textContent.toLowerCase().includes(term))
        .forEach((note) => note.classList.add('filtered'))

    Array.from(list.children)
        .filter((note) => note.textContent.toLowerCase().includes(term))
        .forEach((note) => note.classList.remove('filtered'))
};

search.addEventListener('keyup', () => {
    const term = search.value.trim().toLowerCase();

    filterNotes(term);
});

