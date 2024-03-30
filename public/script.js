const datalist = document.createElement('datalist');
datalist.id = 'collegeSuggestions';
document.body.appendChild(datalist);

function suggestColleges(event) {
    const searchTerm = event.target.value;
    fetch(`/college-list?name=${searchTerm}`)
        .then(response => response.json())
        .then(data => displaySuggestions(data.filter(college => college.CollegeName.toLowerCase().startsWith(searchTerm.toLowerCase()))))
        .catch(error => console.error('Error fetching data:', error));
}

function displaySuggestions(suggestions) {
    datalist.innerHTML = '';

    suggestions.forEach(college => {
        const option = document.createElement('option');
        option.value = college.CollegeName;
        datalist.appendChild(option);
    });
}

function searchOnEnter(event) {
    if (event.key === 'Enter') {
        searchColleges();
    }
}

function searchColleges() {
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (searchTerm === '') {
        displaySearchMessage('Please provide a search term.');
        return;
    }

    fetch(`/college-list?name=${searchTerm}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => displaySearchResults(data))
        .catch(error => {
            console.error('Error fetching data:', error);
            displaySearchMessage('An error occurred while fetching data.');
        });
}

function displaySearchMessage(message) {
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.textContent = message;
    searchResultsDiv.style.display = 'block';
}

function displaySearchResults(results) {
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.innerHTML = '';

    if (results.length === 0) {
        searchResultsDiv.textContent = 'No results found.';
        return;
    }

    const ul = document.createElement('ul');
    results.forEach(college => {
        const li = document.createElement('li');
        li.textContent = college.CollegeName;
        ul.appendChild(li);
    });

    searchResultsDiv.style.display = 'block';
    searchResultsDiv.appendChild(ul);
}

document.getElementById('searchInput').addEventListener('input', suggestColleges);
document.getElementById('searchInput').addEventListener('keypress', searchOnEnter);
