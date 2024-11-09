document.addEventListener("DOMContentLoaded", function() {
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const submitBtn = document.getElementById("submitBtn");
  const resultBtn = document.createElement('button');
  const slide1 = document.getElementById("slide1");
  const slide2 = document.getElementById("slide2");
  const slide3 = document.getElementById("slide3");
  const examList = document.getElementById("examList");
  const timerElement = document.getElementById("timer");
  const elapsedTimeElement = document.getElementById("elapsedTime");
  const chartCanvas = document.getElementById("resultsChart").getContext("2d");
  const comparisonResults = document.getElementById("comparisonResults");

  let timerInterval;
  let startTime;

  resultBtn.classList.add('button', 'new-exam-btn');
  resultBtn.style.display = "none";
  resultBtn.textContent = "New Exam";
  resultBtn.addEventListener('click', () => {
    document.getElementById("testName").value = '';
    document.getElementById("numQuestions").value = 15;
    startBtn.style.display = "block";
    slide1.style.display = "none";
    slide2.style.display = "none";
    slide3.style.display = "none";
    resultBtn.style.display = "none";
    nextBtn.style.display = "none";
    prevBtn.style.display = "none";
    submitBtn.style.display = "none";
    clearInterval(timerInterval);
    elapsedTimeElement.textContent = "00:00:00";
    updateChart();
    updateComparison();
  });

  startBtn.addEventListener("click", function() {
    const testName = document.getElementById("testName").value.trim();
    const numQuestions = parseInt(document.getElementById("numQuestions").value);
    if (testName === "" || numQuestions <= 0) {
      alert("Please enter a valid test name and number of questions.");
      return;
    }
    populateSlides(numQuestions);
    startBtn.style.display = "none";
    nextBtn.style.display = "block";
    slide1.style.display = "block";
    timerElement.style.display = "block";
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
  });

  nextBtn.addEventListener("click", function() {
    slide1.style.display = "none";
    slide2.style.display = "block";
    nextBtn.style.display = "none";
    prevBtn.style.display = "block";
    submitBtn.style.display = "block";
  });

  prevBtn.addEventListener("click", function() {
    slide2.style.display = "none";
    slide1.style.display = "block";
    prevBtn.style.display = "none";
    nextBtn.style.display = "block";
    submitBtn.style.display = "none";
    slide3.style.display = "none";
  });

  submitBtn.addEventListener("click", function() {
    const userConfirmed = confirm("Are you sure you want to submit your answers?");
    if (!userConfirmed) {
      return; // Exit if user cancels
    }
    const answers1 = getSelectedOptions(slide1);
    const answers2 = getSelectedOptions(slide2);
    const results = matchAnswers(answers1, answers2);
    const { score, maxScore } = calculateScore(results);
    const testName = document.getElementById("testName").value.trim();
    displayResults(results, testName, score, maxScore);
    saveResults(testName, results, score, maxScore);
    submitBtn.style.display = "none";
    prevBtn.style.display = "none";
    resultBtn.style.display = "block";
    clearInterval(timerInterval);
    timerElement.style.display = "none";

    // Show detailed results
    const correctCount = results.filter(result => result.correct).length;
    const incorrectCount = results.filter(result => !result.correct && !result.missed).length;
    const missedCount = results.filter(result => result.missed).length;

    const message = `
      <p><strong>Number of Questions:</strong> ${answers1.length}</p>
      <p><strong>Correct Answers:</strong> ${correctCount}</p>
      <p><strong>Incorrect Answers:</strong> ${incorrectCount}</p>
      <p><strong>Missed Questions:</strong> ${missedCount}</p>
      <p><strong>Score:</strong> ${score} / ${maxScore}</p>
    `;
    showModal(message);
    updateChart();
    updateComparison();
  });

  function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = new Date(currentTime - startTime);
    const hours = elapsedTime.getUTCHours().toString().padStart(2, '0');
    const minutes = elapsedTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = elapsedTime.getUTCSeconds().toString().padStart(2, '0');
    elapsedTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  function populateSlides(numQuestions) {
    const questions1 = Array.from({ length: numQuestions }, (_, i) => `Q${i + 1}`);
    const questions2 = questions1.slice(0);
    populateTable(slide1, questions1);
    populateTable(slide2, questions2);
  }

  function populateTable(slide, questions) {
    const questionContainer = slide.querySelector('.question-container');
    questionContainer.innerHTML = "";
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    for (let i = 0; i < questions.length; i += 10) {
      const row = document.createElement('tr');
      for (let j = 0; j < 2; j++) {
        const cell = document.createElement('td');
        cell.style.verticalAlign = 'top';
        const startIdx = i + j * 5;
        const endIdx = Math.min(startIdx + 5, questions.length);
        const subQuestions = questions.slice(startIdx, endIdx);
        subQuestions.forEach((question, index) => {
          const questionDiv = document.createElement("div");
          questionDiv.classList.add('question');
          const questionNumberDiv = document.createElement('div');
          questionNumberDiv.classList.add('question-number');
          questionNumberDiv.textContent = question;
          const optionsContainer = document.createElement("div");
          optionsContainer.classList.add('options-container');
          ['A', 'B', 'C', 'D'].forEach(option => {
            const optionCircle = document.createElement("div");
            optionCircle.classList.add('option-circle');
            optionCircle.textContent = option;
            optionCircle.setAttribute('data-question', startIdx + index + 1);
            optionCircle.setAttribute('data-option', option);
            optionCircle.addEventListener("click", function() {
              const selectedQuestion = parseInt(optionCircle.getAttribute('data-question'));
              const selectedOption = optionCircle.getAttribute('data-option');
              const isAlreadySelected = optionCircle.classList.contains('selected');
              const otherOptionCircles = optionsContainer.querySelectorAll('.option-circle');
              otherOptionCircles.forEach(circle => {
                if (parseInt(circle.getAttribute('data-question')) === selectedQuestion) {
                  circle.classList.remove('selected');
                }
              });
              if (!isAlreadySelected) {
                optionCircle.classList.add('selected');
              } else {
                optionCircle.classList.remove('selected');
              }
            });
            optionsContainer.appendChild(optionCircle);
          });
          questionDiv.appendChild(questionNumberDiv);
          questionDiv.appendChild(optionsContainer);
          cell.appendChild(questionDiv);
        });
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    questionContainer.appendChild(table);
  }

  function getSelectedOptions(slide) {
    const selectedOptions = [];
    const optionCircles = slide.querySelectorAll('.option-circle.selected');
    optionCircles.forEach(circle => {
      const question = parseInt(circle.getAttribute('data-question'));
      const option = circle.getAttribute('data-option');
      selectedOptions[question - 1] = option;
    });
    return selectedOptions;
  }

  function matchAnswers(answers1, answers2) {
    const results = [];
    const totalQuestions = Math.max(answers1.length, answers2.length);
    for (let i = 0; i < totalQuestions; i++) {
      const result = {
        question: `Q${i + 1}`,
        selectedOption: answers1[i] || "Not selected",
        correctOption: answers2[i] || "Not provided"
      };
      if (answers1[i] === undefined) {
        result.missed = true;
      } else if (answers1[i] === answers2[i]) {
        result.correct = true;
      } else {
        result.correct = false;
      }
      results.push(result);
    }
    return results;
  }

  function calculateScore(results) {
    let score = 0;
    const maxScore = results.length * 4;
    results.forEach(result => {
      if (result.correct) {
        score += 4;
      } else if (!result.correct && !result.missed) {
        score -= 1;
      }
    });
    return { score, maxScore };
  }

  function displayResults(results, testName, score, maxScore) {
    slide3.innerHTML = `<h3>Results for ${testName}</h3><p>Score: ${score} / ${maxScore}</p>`;
    results.forEach(result => {
      const questionDiv = document.createElement("div");
      questionDiv.classList.add('result');
      if (result.missed) {
        questionDiv.textContent = `${result.question}: This question was missed. Correct answer is ${result.correctOption}`;
        questionDiv.classList.add('missed');
      } else if (result.correct) {
        questionDiv.textContent = `${result.question}: Correct! You chose ${result.selectedOption}`;
        questionDiv.classList.add('correct');
      } else {
        questionDiv.textContent = `${result.question}: Incorrect! You chose ${result.selectedOption}, correct answer is ${result.correctOption}`;
        questionDiv.classList.add('incorrect');
      }
      slide3.appendChild(questionDiv);
    });
    slide3.style.display = "block";
    slide3.insertBefore(resultBtn, slide3.firstChild);
  }

  function saveResults(testName, results, score, maxScore) {
    const examData = {
      testName,
      results,
      score,
      maxScore,
      date: new Date().toISOString()
    };
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    exams.push(examData);
    localStorage.setItem('exams', JSON.stringify(exams));
    displayExamList();
  }

  function displayExamList() {
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    examList.innerHTML = "";
    exams.forEach(exam => {
      const examDiv = document.createElement("div");
      examDiv.textContent = `${exam.testName} (Taken on ${new Date(exam.date).toLocaleDateString()}) - Score: ${exam.score} / ${exam.maxScore}`;
      examDiv.classList.add('result');
      examDiv.style.cursor = 'pointer';
      examDiv.addEventListener('click', () => displayStoredResults(exam));
      examList.appendChild(examDiv);
    });
    updateChart();
    updateComparison();
  }

  function displayStoredResults(exam) {
    slide3.innerHTML = `<h3>Results for ${exam.testName}</h3><p>Score: ${exam.score} / ${exam.maxScore}</p>`;
    exam.results.forEach(result => {
      const questionDiv = document.createElement("div");
      questionDiv.classList.add('result');
      if (result.missed) {
        questionDiv.textContent = `${result.question}: This question was missed. Correct answer is ${result.correctOption}`;
        questionDiv.classList.add('missed');
      } else if (result.correct) {
        questionDiv.textContent = `${result.question}: Correct! You chose ${result.selectedOption}`;
        questionDiv.classList.add('correct');
      } else {
        questionDiv.textContent = `${result.question}: Incorrect! You chose ${result.selectedOption}, correct answer is ${result.correctOption}`;
        questionDiv.classList.add('incorrect');
      }
      slide3.appendChild(questionDiv);
    });
    slide3.style.display = "block";
    slide3.insertBefore(resultBtn, slide3.firstChild);
  }

  function updateChart() {
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const labels = exams.map(exam => exam.testName);
    const correctData = exams.map(exam => exam.results.filter(result => result.correct).length);
    const incorrectData = exams.map(exam => exam.results.filter(result => !result.correct && !result.missed).length);
    const missedData = exams.map(exam => exam.results.filter(result => result.missed).length);

    const ctx = document.getElementById('resultsChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Correct Answers',
            data: correctData,
            backgroundColor: '#4CAF50',
            stack: 'Stack 0'
          },
          {
            label: 'Incorrect Answers',
            data: incorrectData,
            backgroundColor: '#FF5722',
            stack: 'Stack 1'
          },
          {
            label: 'Missed Questions',
            data: missedData,
            backgroundColor: '#FFC107',
            stack: 'Stack 2'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });
  }

  function updateComparison() {
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    if (exams.length === 0) return;

    const sortedExams = [...exams].sort((a, b) => b.score - a.score);
    const highestScoreExam = sortedExams[0];
    const lowestScoreExam = sortedExams[sortedExams.length - 1];

    const latestExam = exams.reduce((latest, exam) => new Date(exam.date) > new Date(latest.date) ? exam : latest, exams[0]);

    const comparisonDiv = document.getElementById('comparisonResults');
    comparisonDiv.innerHTML = `
      <h3>Comparison of Scores</h3>
      <table>
        <thead>
          <tr>
            <th>Comparison</th>
            <th>Test Name</th>
            <th>Score</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Latest Test</td>
            <td>${latestExam.testName}</td>
            <td>${latestExam.score} / ${latestExam.maxScore}</td>
            <td>${(latestExam.score / latestExam.maxScore * 100).toFixed(2)}%</td>
          </tr>
          <tr>
            <td>Highest Score</td>
            <td>${highestScoreExam.testName}</td>
            <td>${highestScoreExam.score} / ${highestScoreExam.maxScore}</td>
            <td>${(highestScoreExam.score / highestScoreExam.maxScore * 100).toFixed(2)}%</td>
          </tr>
          <tr>
            <td>Lowest Score</td>
            <td>${lowestScoreExam.testName}</td>
            <td>${lowestScoreExam.score} / ${lowestScoreExam.maxScore}</td>
            <td>${(lowestScoreExam.score / lowestScoreExam.maxScore * 100).toFixed(2)}%</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  displayExamList();
  
  // Confirm refresh or page navigation
  window.addEventListener("beforeunload", function(event) {
    const isExamInProgress = startBtn.style.display === "none"; // Check if exam is ongoing
    if (isExamInProgress) {
      event.preventDefault();
      event.returnValue = "Are you sure you want to leave? Your progress will be lost.";
    }
  });
});
