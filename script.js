// LocalStorage ya Default Data se setup karein
let defaultBooks = [
  { id: 1, title: "HTML & CSS", author: "John Duckett", category: "Study", available: true },
  { id: 2, title: "JavaScript Basics", author: "Eloquent", category: "Study", available: true },
  { id: 3, title: "Python for Beginners", author: "AI Sweigart", category: "Study", available: true }
];

let books = JSON.parse(localStorage.getItem("library_books")) || defaultBooks;
let borrowingHistory = JSON.parse(localStorage.getItem("library_history")) || [];
let selectedBookId = null;
let currentCategory = "all";

window.onload = function() {
  document.getElementById("addBtn").addEventListener("click", addBook);
  document.getElementById("searchinput").addEventListener("input", displayBooks);
  document.getElementById("cancelBorrow").addEventListener("click", closeBorrowModal);
  document.getElementById("confirmBorrow").addEventListener("click", handleConfirmBorrow);
  document.getElementById("clearHistory").addEventListener("click", clearAllHistory);

  document.querySelectorAll(".cat-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.getAttribute("data-cat");
      displayBooks();
    });
  });

  saveDataToStorage();
  displayBooks();
  updateHistoryUI();
};

function saveDataToStorage() {
  localStorage.setItem("library_books", JSON.stringify(books));
  localStorage.setItem("library_history", JSON.stringify(borrowingHistory));
}

function displayBooks() {
  const bookList = document.getElementById("bookList");
  const bookCountLabel = document.getElementById("bookCount");
  const searchQuery = document.getElementById("searchinput").value.toLowerCase();
  
  if (!bookList) return;
  bookList.innerHTML = "";

  const filteredBooks = books.filter(book => {
    const matchesCategory = currentCategory === "all" || book.category === currentCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery) || 
                          book.author.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (bookCountLabel) {
    bookCountLabel.innerText = `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Books (${filteredBooks.length})`;
  }

  if (filteredBooks.length === 0) {
    bookList.innerHTML = "<p style='opacity:0.5; grid-column: 1/-1; padding: 20px 0;'>No books found.</p>";
    return;
  }

  filteredBooks.forEach(book => {
    bookList.innerHTML += `
      <div class="book-card ${!book.available ? 'borrowed' : ''}">
        <div>
          <h3>${book.title}</h3>
          <p class="meta">By: ${book.author}</p>
          <span class="badge">${book.category}</span>
        </div>
        <div class="book-actions">
          <button class="btn-borrow" onclick="openBorrowModal(${book.id})" ${!book.available ? "disabled" : ""}>
            ${book.available ? "Borrow" : "Issued"}
          </button>
          <button class="btn-return" onclick="returnBook(${book.id})" ${book.available ? "disabled" : ""}>Return</button>
        </div>
      </div>
    `;
  });
}

function addBook() {
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const categoryInput = document.getElementById("category");

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const category = categoryInput.value;

  if (title === "" || author === "") {
    alert("Please enter both Title and Author!");
    return;
  }

  const nextId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;

  books.push({
    id: nextId,
    title: title,
    author: author,
    category: category,
    available: true
  });

  saveDataToStorage();
  displayBooks();
  titleInput.value = "";
  authorInput.value = "";
}

window.openBorrowModal = function(id) {
  const book = books.find(b => b.id === id);
  if (book && book.available) {
    selectedBookId = id;
    document.getElementById("modalBookName").innerText = `Book: ${book.title}`;
    document.getElementById("borrowName").value = "";
    document.getElementById("borrowModal").classList.add("active");
  }
};

function closeBorrowModal() {
  document.getElementById("borrowModal").classList.remove("active");
  selectedBookId = null;
}

function handleConfirmBorrow() {
  const borrowerName = document.getElementById("borrowName").value.trim();
  if (borrowerName === "") {
    alert("Please enter Borrower Name!");
    return;
  }

  const book = books.find(b => b.id === selectedBookId);
  if (book) {
    book.available = false;
    borrowingHistory.unshift({
      text: `${borrowerName} borrowed "${book.title}"`,
      time: new Date().toLocaleTimeString()
    });
    saveDataToStorage();
    updateHistoryUI();
    closeBorrowModal();
    displayBooks();
  }
}

window.returnBook = function(id) {
  const book = books.find(b => b.id === id);
  if (book && !book.available) {
    book.available = true;
    borrowingHistory.unshift({
      text: `Returned "${book.title}"`,
      time: new Date().toLocaleTimeString()
    });
    saveDataToStorage();
    updateHistoryUI();
    displayBooks();
  }
};

function updateHistoryUI() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;
  
  historyList.innerHTML = "";
  if (borrowingHistory.length === 0) {
    historyList.innerHTML = "<p style='opacity:0.5; font-size:0.9rem;'>No recent activities</p>";
    return;
  }
  borrowingHistory.forEach(item => {
    historyList.innerHTML += `
      <div class="history-item">
        ${item.text}
        <small>🕒 ${item.time}</small>
      </div>`;
  });
}

function clearAllHistory() {
  borrowingHistory = [];
  saveDataToStorage();
  updateHistoryUI();
}
