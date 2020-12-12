class Book {
    constructor(title, author, pageN, read) {
        this.title = title;
        this.author = author;
        this.pageN = pageN;
        this.read = read;
        this.template;
    }
}

function execute(){

let editedBook = null;
let addButton = document.querySelector(".add-button");
let submitEditButton = document.querySelector(".edit-form button");


if (cloud){
    populateHtmlFromCloud();
} else if(window.localStorage.length > 0) {
    populateHtmlFromLocalStorage();
}


addButton.addEventListener("click", function () {
    //create book object
    let book = createBookFromHtml("add");
    //create book template from the book object
    book.template = getHtmlBookTemplate(book);

    if (cloud){
        addBookToCloud(book);
    } else{
    //add book object to local storage
    addBookToLocalStorage(book);
    }
    //add book template to document
    addBookToDocument(book);
})

submitEditButton.addEventListener("click", function () {
    //create a book object from the EditForm input values
    let newBook = createBookFromHtml("edit");
    let oldTitle = editedBook.title;

    //update the values of the current book being edited to the ones of the EditForm book
    editedBook.title = newBook.title;
    editedBook.author = newBook.author;
    editedBookpageN = newBook.pageN;
    editedBook.read = newBook.read;

    //update the template value of the current book being edited to the ones of the EditForm book
    editedBook.template.children[1].innerText = newBook.title;
    editedBook.template.children[2].innerText = newBook.author;
    editedBook.template.children[3].innerText = newBook.pageN;
    editedBook.template.children[4].innerText = "Read? " + (newBook.read ? "yes" : "no");

    //as editing is done at this point, set the add form back to visible and the edit form to hidden
    switchForms();

    if (cloud){
        //remove book from database
        removeBookFromCloud(oldTitle);
        //add new book
        addBookToCloud(editedBook);

       
    } else {
    // add edited book to local storage
    window.localStorage.removeItem(oldTitle);
    window.localStorage.setItem(editedBook.title, JSON.stringify(editedBook));
    }

})

function populateHtmlFromLocalStorage() {
    if (window.localStorage.length > 0) {
        for (var key in window.localStorage) {
            let book = JSON.parse(window.localStorage.getItem(key));
            if (book != null && book != undefined) {
                book.template = getHtmlBookTemplate(book);
                addBookToDocument(book);
            }
        }
    }
}

function populateHtmlFromCloud(){
    dbrefObject.once("value", function(snap){ 
        console.log(snap.val());
      snap.forEach(function(childNodes){
          let book = new Book();
          book.title = childNodes.key
          book.author = childNodes.val().author
          book.pageN = childNodes.val().pageN
          book.read = childNodes.val().read
          book.template = getHtmlBookTemplate(book);
          addBookToDocument(book);
      });
    });
}

function getHtmlBookTemplate(book) {
    let template = document.createElement("div")

    let bookOptions = document.createElement("div");
    bookOptions.classList.add("book-options");

    let editButton = document.createElement("button");
    editButton.innerText = "Edit"
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", function () {
        //make global editedBook variable point to the book that's being edited
        editedBook = book;
        switchForms();
        //populate edit form with book details
        populateForm(book);
    })

    let removeButton = document.createElement("button");
    removeButton.innerText = "Remove";
    removeButton.classList.add("remove-button");
    removeButton.addEventListener("click", function () {
        if(cloud){
        removeBookFromCloud(book.title);
        book.template.remove();
        } else {
        removeBookFromLocalStorage(book);
        book.template.remove();
        }
    });

    bookOptions.append(editButton);
    bookOptions.append(removeButton);



    const title = document.createElement("p");
    title.innerText = book.title;
    title.classList.add("big-text");
    const author = document.createElement("p");
    author.innerText = book.author;
    author.classList.add("small-italic-text");
    const pageN = document.createElement("p");
    pageN.innerText = book.pageN;
    pageN.classList.add("small-text");
    const read = document.createElement("p");
    read.innerText = "Read? " + (book.read ? "yes" : "no");
    read.classList.add("small-text");

    template.append(bookOptions);
    template.append(title);
    template.append(author);
    template.append(pageN);
    template.append(read);

    template.classList.add("book");

    return template;
}

function populateForm(book) {
    let editForm = document.querySelector(".edit-form");
    let elements = editForm.elements;
    elements.item(0).value = book.title;
    elements.item(1).value = book.author;
    elements.item(2).value = book.pageN;
    elements.item(3).checked = (book.read ? true : false);
}

function removeBookFromLocalStorage(book) {
    window.localStorage.removeItem(book.title);
}

function removeBookFromCloud(title){
    firebase.database().ref(userId + "/Books/" + title).remove();
}

function addBookToDocument(book) {
    let container = document.querySelector(".container-flex");
    container.append(book.template);
}

function addBookToLocalStorage(book) {
    window.localStorage.setItem(book.title, JSON.stringify(book));
}

function addBookToCloud(book){
    firebase.database().ref(userId + "/Books/" +book.title).set({
        author: book.author,
        pageN: book.pageN,
        read: book.read
    })
}

function createBookFromHtml(form) {
    let arr = [];
    let formType = "." + form + "-form"; //form value can either be "add" or "edit"

    //picks one of the two forms. either edit or add form
    let formElements = document.querySelector(formType).elements;


    for (let i = 0; i < formElements.length - 2; i++) {
        arr[i] = formElements.item(i).value;
    }
    arr[formElements.length - 2] = formElements.item(formElements.length - 2).checked;

    return new Book(arr[0], arr[1], arr[2], arr[3]);
}

function switchForms(){
    let addForm = document.querySelector(".add-form");
    addForm.classList.toggle("hidden");
    let editForm = document.querySelector(".edit-form");
    editForm.classList.toggle("hidden");
}
}