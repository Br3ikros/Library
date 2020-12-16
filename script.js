class Book {
    constructor(title, author, pageN, read) {
        this.title = title;
        this.author = author;
        this.pageN = pageN;
        this.read = read;
        this.template;
    }
}

function execute() {

    let editedBook = null;
    let addButton = document.querySelector(".add-button");
    let submitEditButton = document.querySelector(".edit-form button");


    if (cloud) {
        populateHtmlFromCloud();
    } else if (window.localStorage.length > 0) {
        populateHtmlFromLocalStorage();
    }


    addButton.addEventListener("click", function () {

        if (inputsAreValid("add")) {
            //create book object
            let book = createBookFromHtml("add");
            //create book template from the book object
            book.template = getHtmlBookTemplate(book);

            if (cloud) {
                addBookToCloud(book);
                updateInfoVariables(book, true);
                updateInfoSection();


            } else {
                //add book object to local storage
                updateInfoVariables(book, true);
                updateInfoSection();
                addBookToLocalStorage(book);

            }
            //add book template to document
            addBookToDocument(book);
        }
    })


    ///////dio cane ////////
    submitEditButton.addEventListener("click", function () {

        if (inputsAreValid("edit")) {
            //create a book object from the EditForm input values
            let newBook = createBookFromHtml("edit");
            let oldBook = JSON.parse(JSON.stringify(editedBook));
            console.log(oldBook.title);

            //removes book pages and number to the add the updated one later on
            updateInfoVariables(editedBook, false);


            //update the values of the current book being edited to the ones of the EditForm book
            editedBook.title = newBook.title;
            editedBook.author = newBook.author;
            editedBook.pageN = newBook.pageN;
            editedBook.read = newBook.read;

            //update the template value of the current book being edited to the ones of the EditForm book
            editedBook.template.children[1].innerText = newBook.title;
            editedBook.template.children[2].innerText = newBook.author;
            editedBook.template.children[3].innerText = newBook.pageN;
            editedBook.template.children[4].children[0].checked = newBook.read;
            console.log(editedBook.template.children[4].children[0].checked)

            //as editing is done at this point, set the add form back to visible and the edit form to hidden
            switchForms();


            if (cloud) {
                updateInfoVariables(newBook, true);
                updateInfoSection()
                //remove book from database
                removeBookFromCloud(oldBook.title);
                //add new book
                addBookToCloud(editedBook);
            } else {
                updateInfoVariables(newBook, true);
                updateInfoSection()
                // add edited book to local storage
                removeBookFromLocalStorage(oldBook);
                addBookToLocalStorage(editedBook)
              
            }

        }
    })

    function populateHtmlFromLocalStorage() {
        let titles = JSON.parse(window.localStorage.getItem("localStorageBooks"))
        if (titles != null) {
            titles.forEach(function (book) {
                book.template = getHtmlBookTemplate(book);
                updateInfoVariables(book, true);
                updateInfoSection();
                addBookToDocument(book);
            })
        }
    }

    function populateHtmlFromCloud() {
        dbrefObject.once("value", function (snap) {
            console.log(snap.val());
            snap.forEach(function (childNodes) {
                let book = new Book();
                book.title = childNodes.key
                book.author = childNodes.val().author
                book.pageN = childNodes.val().pageN
                book.read = childNodes.val().read
                book.template = getHtmlBookTemplate(book);
                addBookToDocument(book);
                updateInfoVariables(book, true);
                updateInfoSection();


            });
        });
    }

    function getHtmlBookTemplate(book) {
        let template = document.createElement("div")

        let bookOptions = document.createElement("div");
        bookOptions.classList.add("book-options");

        let editButton = document.createElement("input");
        editButton.type = "image";
        editButton.src = "settings.png"
        editButton.innerText = "Edit"
        editButton.classList.add("edit-button");
        editButton.addEventListener("click", function () {
            //make global editedBook variable point to the book that's being edited
            editedBook = book;
            switchForms();
            //populate edit form with book details
            populateForm(book);
        })

        let removeButton = document.createElement("input");
        removeButton.type = "image";
        removeButton.src = "bin.png"
        removeButton.innerText = "Remove";
        removeButton.classList.add("remove-button");
        removeButton.addEventListener("click", function () {
            if (cloud) {

                updateInfoVariables(book, false);
                updateInfoSection();
                removeBookFromCloud(book.title);
                book.template.remove();
            } else {
                //this block and the above could go after as a single block
                updateInfoVariables(book, false);
                updateInfoSection();
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

        const read = document.createElement("label");
        read.classList.add("switch");
        const inputElement = document.createElement("input");
        inputElement.type = "checkbox";
        inputElement.classList.add("checkbox");
        inputElement.checked = (book.read ? true : false)
        read.addEventListener("click", function () {
            inputElement.checked = !inputElement.checked;
            book.read = inputElement.checked;

            if (book.read) {
                totalBooksRead += 0.5;
                updateInfoSection();
                console.log("true section");
            } else {
                totalBooksRead -= 0.5;
                updateInfoSection();
                console.log("false section")

            }
            if (cloud) {
                addBookToCloud(book);
            } else {
                removeBookFromLocalStorage(book);
                addBookToLocalStorage(book);
            }
        });


        const span = document.createElement("span");
        span.classList.add("slider");
        span.classList.add("round")
        read.append(inputElement);
        read.append(span);

        // const read = document.createElement("p");
        // read.innerText = "Read? " + (book.read ? "yes" : "no");
        // read.classList.add("small-text");

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
        let titles = JSON.parse(window.localStorage.getItem("localStorageBooks"));
        for (let i = 0; i < titles.length; i++) {
            if (titles[i].title == book.title) {
                titles.splice(i, 1);
            }
        }
        window.localStorage.setItem("localStorageBooks", JSON.stringify(titles));
    }

    function removeBookFromCloud(title) {
        firebase.database().ref(userId + "/Books/" + title).remove();
    }

    function addBookToDocument(book) {
        let container = document.querySelector(".container-flex");
        container.append(book.template);
    }

    function addBookToLocalStorage(book) {
        let titles = JSON.parse(window.localStorage.getItem("localStorageBooks"));
        if (titles != null){
        titles.push(book);
        window.localStorage.setItem("localStorageBooks", JSON.stringify(titles));
        } else {
            titles = [];
            titles.push(book);
            window.localStorage.setItem("localStorageBooks", JSON.stringify(titles));
        }
    }

    function addBookToCloud(book) {
        firebase.database().ref(userId + "/Books/" + book.title).set({
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

    function switchForms() {
        let addForm = document.querySelector(".add-form");
        addForm.classList.toggle("hidden");
        clearForm(addForm);
        let editForm = document.querySelector(".edit-form");
        editForm.classList.toggle("hidden");
    }

    function inputsAreValid(form) {
        let currentForm;



        if (form == "add") {
            currentForm = document.querySelector(".add-form");
        } else {
            currentForm = document.querySelector(".edit-form");
        }

        let elements = currentForm.elements;

        for (let i = 0; i < 3; i++) {
            if (elements.item(i).value == null || elements.item(i).value == undefined || elements.item(i).value == "") {
                return false;
            }
        }


        console.log("boia");

        //first convert the string to a Number, which can either return a nubmer or NaN, then check if it is an integer
        if (!Number.isInteger(Number(elements.item(2).value))) {
            return false;
        }

        return true;

    }

    function clearForm(form) {
        form.elements.item(0).value = "";
        form.elements.item(1).value = "";
        form.elements.item(2).value = "";
        form.elements.item(3).checked = false;
    }

}