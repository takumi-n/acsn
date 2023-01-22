module.exports.composeNotification = (createdBy, projectId, commentId, commentName, comment) => ({
  text: `*${createdBy}*`,
  attachments: [
    {
      color: '#81848f',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<https://app.asana.com/0/${projectId}/${commentId}/f|${commentName}>*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: comment,
          },
        },
      ],
    },
  ],
});
