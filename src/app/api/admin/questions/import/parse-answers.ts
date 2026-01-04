function parseAnswersSection(text: string): Map<string, any> {
  const answers = new Map();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentType = 'single_choice';
  let currentIndex = 1;
  let currentAnswer = '';
  let hasCurrentAnswer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('单项选择')) {
      // 先保存当前正在处理的答案
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentType = 'single_choice';
      currentIndex = 1;
      currentAnswer = '';
      hasCurrentAnswer = false;
      continue;
    }

    if (line.includes('判断题')) {
      // 先保存当前正在处理的答案
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentType = 'judge';
      currentIndex = 1;
      currentAnswer = '';
      hasCurrentAnswer = false;
      continue;
    }

    if (line.includes('综合探究')) {
      // 先保存当前正在处理的答案
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentType = 'essay';
      currentIndex = 1;
      currentAnswer = '';
      hasCurrentAnswer = false;
      continue;
    }

    const questionNumberMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionNumberMatch) {
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentIndex = parseInt(questionNumberMatch[1]);
      currentAnswer = line;
      hasCurrentAnswer = true;
      continue;
    }

    if (line && hasCurrentAnswer && !line.match(/^\d+[.、]/)) {
      currentAnswer += '\n' + line;
    }
  }

  // 保存最后一题答案
  if (hasCurrentAnswer && currentAnswer) {
    const answerData = parseAnswerLine(currentAnswer, currentType);
    answers.set(`${currentType}_${currentIndex}`, answerData);
  }

  return answers;
}
