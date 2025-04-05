async function generatePDF(exam) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const cellHeight = 10;
  const boxPadding = 2;
  const circleRadius = 3.5;
  let y = 10;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Results for ${exam.userName} - ${exam.testName}`, 10, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Score: ${exam.score} / ${exam.maxScore}`, 10, y);
  y += 10;

  // Legend
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text("Legend:", 10, y);
  drawLegendCircle(doc, 30, y - 2, [0, 128, 0], 'Correct');
  drawLegendCircle(doc, 60, y - 2, [255, 0, 0], 'Incorrect');
  drawLegendCircle(doc, 100, y - 2, [255, 204, 0], 'Missed');
  drawLegendCircle(doc, 140, y - 2, [255, 255, 255], 'Unselected');
  y += 10;

  for (let i = 0; i < exam.results.length; i += 15) {
    const group = exam.results.slice(i, i + 15);
    const col1 = group.slice(0, 5);
    const col2 = group.slice(5, 10);
    const col3 = group.slice(10, 15);
    const startY = y;

    for (let j = 0; j < 5; j++) {
      drawQuestionBlock(doc, col1[j], i + j, 10, y);
      drawQuestionBlock(doc, col2[j], i + j + 5, 75, y);
      drawQuestionBlock(doc, col3[j], i + j + 10, 140, y);
      y += cellHeight;
    }

    // Draw boxes
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10 - boxPadding, startY - boxPadding, 60 + boxPadding * 2, 5 * cellHeight + boxPadding * 2);
    doc.rect(75 - boxPadding, startY - boxPadding, 60 + boxPadding * 2, 5 * cellHeight + boxPadding * 2);
    doc.rect(140 - boxPadding, startY - boxPadding, 60 + boxPadding * 2, 5 * cellHeight + boxPadding * 2);
  }

  doc.save(`${exam.userName}_${exam.testName}_results.pdf`);

  function drawLegendCircle(doc, x, y, color, label) {
    doc.setDrawColor(...color);
    doc.setFillColor(...color);
    doc.circle(x, y + 2, circleRadius, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text(label, x + 6, y + 4);
  }

  function drawQuestionBlock(doc, res, qIndex, x, y) {
    if (!res) return;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`Q${qIndex + 1}`, x, y + 5);

    const options = ['A', 'B', 'C', 'D'];
    const optionGap = 13;
    let cx = x + 20;

    options.forEach(opt => {
      const isSelected = res.selectedOption === opt;
      const isCorrect = res.correctOption === opt;
      const missed = res.missed;

      let fillColor = [255, 255, 255]; // white default
      if (missed) {
        if (isCorrect) fillColor = [0, 128, 0];
        else fillColor = [255, 204, 0];
      } else if (isSelected && isCorrect) {
        fillColor = [0, 128, 0];
      } else if (isSelected && !isCorrect) {
        fillColor = [255, 0, 0];
      } else if (isCorrect) {
        fillColor = [0, 128, 0];
      }

      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(...fillColor);
      doc.circle(cx, y + 5, circleRadius, 'FD');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(opt, cx - 2.5, y + 5.5);

      cx += optionGap;
    });
  }
}
