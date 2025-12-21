      const img = document.getElementById("resultImage");
      const text = document.getElementById("wordInput");
      async function sendWord()
      {

      if (!text.value) return;
        const response = await fetch(
          `https://picto.runasp.net/api/Words/${encodeURIComponent(text.value)}`
        );

        const data = await response.json();
        document.getElementById("difficulty").innerText =
          "Difficulty: " + data.difficultyLevel;
        img.src = data.imageUrl;
        img.style.display = "block";
    }