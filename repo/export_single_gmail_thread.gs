function exportLabeledThreadsToTopRanker() {
  const LABEL_NAME = 'gpo-share';
  const TARGET_EMAIL = 'topranker@gmail.com';
  const label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) {
    throw new Error('Label not found: ' + LABEL_NAME);
  }

  const threads = label.getThreads(0, 20);
  threads.forEach((thread) => {
    const msgs = thread.getMessages();
    let body = '';
    msgs.forEach((msg, idx) => {
      body += `\n\n----- MESSAGE ${idx + 1} -----\n`;
      body += `From: ${msg.getFrom()}\n`;
      body += `To: ${msg.getTo()}\n`;
      body += `Date: ${msg.getDate()}\n`;
      body += `Subject: ${msg.getSubject()}\n\n`;
      body += msg.getPlainBody();
    });

    GmailApp.sendEmail(
      TARGET_EMAIL,
      `[RPGPO THREAD EXPORT] ${thread.getFirstMessageSubject()}`,
      body
    );

    label.removeFromThread(thread);
  });
}
