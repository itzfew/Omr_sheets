async function generatePDF(exam) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const cellHeight = 10;
  const boxPadding = 2;
  const circleRadius = 4;
  let y = 10;

  doc.setFontSize(14);
  doc.text(`Results for ${exam.userName} - ${exam.testName}`, 10, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Score: ${exam.score} / ${exam.maxScore}`, 10, y);
  y += 10;

  for (let i = 0; i < exam.results.length; i += 10) {
    const group = exam.results.slice(i, i + 10);
    const left5 = group.slice(0, 5);
    const right5 = group.slice(5, 10);
    const startY = y;

    for (let j = 0; j < 5; j++) {
      drawQuestionBlock(doc, left5[j], i + j, 10, y);
      drawQuestionBlock(doc, right5[j], i + j + 5, 105, y);
      y += cellHeight;
    }

    // Draw box around left and right 5 questions
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10 - boxPadding, startY - boxPadding, 90 + boxPadding * 2, 5 * cellHeight + boxPadding * 2);
    doc.rect(105 - boxPadding, startY - boxPadding, 90 + boxPadding * 2, 5 * cellHeight + boxPadding * 2);
  }

  doc.save(`${exam.userName}_${exam.testName}_results.pdf`);

  function drawQuestionBlock(doc, res, qIndex, x, y) {
    if (!res) return;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`Q${qIndex + 1}`, x, y + 5);

    const options = ['A', 'B', 'C', 'D'];
    const optionGap = 18;
    let cx = x + 20;

    options.forEach(opt => {
      const isSelected = res.selectedOption === opt;
      const isCorrect = res.correctOption === opt;
      const missed = res.missed;

      let fillColor = [255, 255, 255];
      let strokeColor = [0, 0, 0];

      if (missed) {
        if (isCorrect) fillColor = [0, 128, 0];
        else strokeColor = [255, 204, 0];
      } else if (isSelected && isCorrect) {
        fillColor = [0, 128, 0];
      } else if (isSelected && !isCorrect) {
        fillColor = [255, 0, 0];
      } else if (isCorrect) {
        fillColor = [0, 128, 0];
      }

      doc.setDrawColor(...strokeColor);
      doc.setFillColor(...fillColor);
      doc.circle(cx, y + 5, circleRadius, 'FD');

      doc.setTextColor(0, 0, 0); // Always black text
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text(opt.toLowerCase(), cx - 2.1, y + 5.2);

      cx += optionGap;
    });
  }
}
