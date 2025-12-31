const img = document.getElementById("resultImage");
const text = document.getElementById("wordInput");

function showLoading() {
  document.getElementById('loading-spinner').style.display = 'block';
}

// Function to hide the loading indicator
function hideLoading() {
  document.getElementById('loading-spinner').style.display = 'none';
}

async function sendWord() {

  if (!text.value) return;

  showLoading(); // Set loading to true before the API call

  try{
    const response = await fetch(
      `https://picto.runasp.net/api/Words/${encodeURIComponent(text.value)}`
    );
  
    const data = await response.json();
    document.getElementById("difficulty").innerText =
      "Difficulty: " + data.difficultyLevel;
    img.src = data.imageUrl;
    img.style.display = "block";

  } catch (error) {
      console.error("Failed to load words", error);
      
  }finally{
    hideLoading(); // Set loading to false after the API call is complete
  }
}