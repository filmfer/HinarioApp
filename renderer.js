const searchInput = document.getElementById('searchInput');
const displaySelect = document.getElementById('displaySelect');
const refreshDisplaysBtn = document.getElementById('refreshDisplays');
const resultsList = document.getElementById('resultsList');
const errorBox = document.getElementById('errorBox');
const selectDirBtn = document.getElementById('selectDirBtn');
const currentDirDisplay = document.getElementById('currentDirDisplay');

let currentResults = [];
let selectedIndex = -1;

async function checkSavedDirectory() {
  const savedDir = await window.electronAPI.getSavedDirectory();
  if (savedDir) {
    currentDirDisplay.textContent = `Pasta: ${savedDir}`;
    performSearch(''); // Load initial videos if dir is available
  } else {
    currentDirDisplay.textContent = 'Nenhuma pasta selecionada';
  }
}

selectDirBtn.addEventListener('click', async () => {
  const selectedDir = await window.electronAPI.selectDirectory();
  if (selectedDir) {
    currentDirDisplay.textContent = `Pasta: ${selectedDir}`;
    performSearch(''); // Refresh videos list
  }
});

async function loadDisplays() {
  const displays = await window.electronAPI.getDisplays();
  displaySelect.innerHTML = '';
  displays.forEach(d => {
    const option = document.createElement('option');
    option.value = d.id;
    option.textContent = d.label;
    displaySelect.appendChild(option);
  });
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
}

function hideError() {
  errorBox.classList.add('hidden');
}

async function performSearch(query) {
  const response = await window.electronAPI.searchFiles(query);
  if (response.error) {
    showError(response.error);
    resultsList.innerHTML = '';
    currentResults = [];
    return;
  }

  hideError();
  currentResults = response.results || [];
  renderResults();
}

function renderResults() {
  resultsList.innerHTML = '';
  
  if (currentResults.length === 0) {
    resultsList.innerHTML = '<li style="color: #888;">Nehnum vídeo encontrado.</li>';
    return;
  }

  currentResults.forEach((file, index) => {
    const li = document.createElement('li');
    li.textContent = file.name;
    if (index === selectedIndex) {
      li.classList.add('selected');
    }
    
    li.addEventListener('click', () => {
      playVideo(file.path);
    });
    
    resultsList.appendChild(li);
  });
}

function playVideo(videoPath) {
  const displayId = parseInt(displaySelect.value, 10);
  window.electronAPI.playVideo(videoPath, displayId);
}

// Event Listeners
refreshDisplaysBtn.addEventListener('click', loadDisplays);

searchInput.addEventListener('input', (e) => {
  selectedIndex = 0; // Reset selection to top on new search
  performSearch(e.target.value);
});

searchInput.addEventListener('keydown', (e) => {
  if (currentResults.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % currentResults.length;
    renderResults();
    // Scroll into view logic could be added here
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
    renderResults();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
      playVideo(currentResults[selectedIndex].path);
    }
  }
});

// Initialize
loadDisplays();
checkSavedDirectory();
